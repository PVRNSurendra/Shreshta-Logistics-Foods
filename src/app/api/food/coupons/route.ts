import { NextRequest } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { successResponse, errorResponse } from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

type CouponType = "PERCENTAGE" | "FIXED";

type CouponRecord = {
  id: string;
  couponId: string;
  code: string;
  type: CouponType;
  value: number;
  minimumOrderAmount: number | null;
  maximumDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

function normalizeCoupon(id: string, data: DocumentData): CouponRecord {
  const typeRaw = String(data.type || "PERCENTAGE").toUpperCase();
  const type: CouponType = typeRaw === "FIXED" ? "FIXED" : "PERCENTAGE";

  return {
    id,
    couponId: String(data.couponId || id),
    code: String(data.code || "").toUpperCase(),
    type,
    value: Number(data.value || 0),
    minimumOrderAmount:
      data.minimumOrderAmount === undefined || data.minimumOrderAmount === null
        ? null
        : Number(data.minimumOrderAmount),
    maximumDiscount:
      data.maximumDiscount === undefined || data.maximumDiscount === null
        ? null
        : Number(data.maximumDiscount),
    usageLimit:
      data.usageLimit === undefined || data.usageLimit === null
        ? null
        : Number(data.usageLimit),
    usedCount: Number(data.usedCount || 0),
    startsAt: data.startsAt ? String(data.startsAt) : null,
    expiresAt: data.expiresAt ? String(data.expiresAt) : null,
    enabled:
      data.enabled === undefined
        ? String(data.status || "ACTIVE").toUpperCase() !== "INACTIVE"
        : Boolean(data.enabled),
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
  };
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    if (out[key] === undefined) {
      delete out[key];
    }
  }
  return out;
}

/** GET — list coupons (admin) */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
    }

    if (
        user.role !== "SUPER_ADMIN" &&
        user.role !== "ADMIN" &&
        user.role !== "FOOD_MANAGER" &&
        user.role !== "FOOD_OPERATOR" &&
        user.role !== "ACCOUNTANT" &&
        !can(user, "FOOD_PRODUCT_VIEW")
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view coupons.",
        403,
      );
    }

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.COUPONS)
      .limit(200)
      .get();

    const coupons = snapshot.docs.map((doc) =>
      normalizeCoupon(doc.id, doc.data() || {}),
    );

    coupons.sort((a, b) =>
      String(b.createdAt || "").localeCompare(String(a.createdAt || "")),
    );

    return successResponse({
      coupons,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    console.error("GET /api/food/coupons", error);
    return errorResponse(
      "COUPONS_LOAD_FAILED",
      error instanceof Error ? error.message : "Unable to load coupons.",
      500,
    );
  }
}

/** POST — create coupon */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
    }

    if (
        user.role !== "SUPER_ADMIN" &&
        user.role !== "ADMIN" &&
        user.role !== "FOOD_MANAGER"
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to create coupons.",
        403,
      );
    }

    const body = await request.json();
    const code = String(body.code || "")
      .trim()
      .toUpperCase();
    const typeRaw = String(body.type || "PERCENTAGE").toUpperCase();
    const type: CouponType = typeRaw === "FIXED" ? "FIXED" : "PERCENTAGE";
    const value = Number(body.value);

    if (!code) {
      return errorResponse("VALIDATION_ERROR", "Coupon code is required.", 400);
    }

    if (!Number.isFinite(value) || value <= 0) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Discount value must be greater than zero.",
        400,
      );
    }

    if (type === "PERCENTAGE" && value > 100) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Percentage discount cannot exceed 100.",
        400,
      );
    }

    // Unique code check
    const existing = await adminDb
      .collection(FIRESTORE_COLLECTIONS.COUPONS)
      .where("code", "==", code)
      .limit(1)
      .get();

    if (!existing.empty) {
      return errorResponse(
        "COUPON_EXISTS",
        `Coupon code ${code} already exists.`,
        409,
      );
    }

    const ref = adminDb.collection(FIRESTORE_COLLECTIONS.COUPONS).doc();
    const now = new Date().toISOString();

    const record = stripUndefined({
      id: ref.id,
      couponId: ref.id,
      code,
      type,
      value,
      minimumOrderAmount:
        body.minimumOrderAmount !== undefined &&
        body.minimumOrderAmount !== null &&
        body.minimumOrderAmount !== ""
          ? Number(body.minimumOrderAmount)
          : null,
      maximumDiscount:
        body.maximumDiscount !== undefined &&
        body.maximumDiscount !== null &&
        body.maximumDiscount !== ""
          ? Number(body.maximumDiscount)
          : null,
      usageLimit:
        body.usageLimit !== undefined &&
        body.usageLimit !== null &&
        body.usageLimit !== ""
          ? Number(body.usageLimit)
          : null,
      usedCount: 0,
      startsAt: body.startsAt ? String(body.startsAt) : null,
      expiresAt: body.expiresAt ? String(body.expiresAt) : null,
      enabled: body.enabled !== false,
      createdAt: now,
      updatedAt: now,
    });

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "FOOD_COUPON_CREATED",
      module: "FOOD",
      resourceType: "COUPON",
      resourceId: ref.id,
      metadata: { code, type, value },
    });

    return successResponse(
      { coupon: normalizeCoupon(ref.id, record) },
      201,
      "Coupon created successfully.",
    );
  } catch (error) {
    console.error("POST /api/food/coupons", error);
    return errorResponse(
      "COUPON_CREATE_FAILED",
      error instanceof Error ? error.message : "Unable to create coupon.",
      500,
    );
  }
}

/** PATCH — enable/disable or update fields */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
    }

    if (
      !can(user, "FOOD_COUPON_MANAGE") &&
      user.role !== "SUPER_ADMIN" &&
      user.role !== "ADMIN" &&
      user.role !== "FOOD_MANAGER"
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update coupons.",
        403,
      );
    }

    const body = await request.json();
    const couponId = String(body.couponId || body.id || "").trim();

    if (!couponId) {
      return errorResponse("VALIDATION_ERROR", "couponId is required.", 400);
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.COUPONS)
      .doc(couponId);
    const snap = await ref.get();

    if (!snap.exists) {
      return errorResponse("NOT_FOUND", "Coupon was not found.", 404);
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (typeof body.enabled === "boolean") {
      updates.enabled = body.enabled;
    }
    if (body.value !== undefined) {
      updates.value = Number(body.value);
    }
    if (body.type !== undefined) {
      updates.type =
        String(body.type).toUpperCase() === "FIXED" ? "FIXED" : "PERCENTAGE";
    }
    if (body.minimumOrderAmount !== undefined) {
      updates.minimumOrderAmount =
        body.minimumOrderAmount === null || body.minimumOrderAmount === ""
          ? null
          : Number(body.minimumOrderAmount);
    }
    if (body.usageLimit !== undefined) {
      updates.usageLimit =
        body.usageLimit === null || body.usageLimit === ""
          ? null
          : Number(body.usageLimit);
    }
    if (body.startsAt !== undefined) {
      updates.startsAt = body.startsAt ? String(body.startsAt) : null;
    }
    if (body.expiresAt !== undefined) {
      updates.expiresAt = body.expiresAt ? String(body.expiresAt) : null;
    }

    await ref.update(updates);

    const next = await ref.get();
    const coupon = normalizeCoupon(next.id, next.data() || {});

    await writeAuditLog({
      userId: user.userId,
      action: "FOOD_COUPON_UPDATED",
      module: "FOOD",
      resourceType: "COUPON",
      resourceId: couponId,
      metadata: updates,
    });

    return successResponse({ coupon }, 200, "Coupon updated.");
  } catch (error) {
    console.error("PATCH /api/food/coupons", error);
    return errorResponse(
      "COUPON_UPDATE_FAILED",
      error instanceof Error ? error.message : "Unable to update coupon.",
      500,
    );
  }
}