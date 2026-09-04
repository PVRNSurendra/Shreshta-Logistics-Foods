import { NextRequest } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";
import {
  isValidEmail,
  isValidPhone,
  isValidIndianPinCode,
  isValidGSTIN,
} from "@/utils/validators";

type ReceiverStatus = "ACTIVE" | "INACTIVE";

type ReceiverRecord = {
  id: string;
  receiverId: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstin?: string;
  status: ReceiverStatus;
  createdAt: string;
  updatedAt: string;
};

type CreateReceiverBody = {
  name?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  gstin?: string;
  status?: ReceiverStatus;
};

type UpdateReceiverBody = CreateReceiverBody & {
  receiverId?: string;
};

function normalizeReceiver(id: string, data: DocumentData): ReceiverRecord {
  const statusRaw = String(data.status || "ACTIVE").toUpperCase();

  const addressObj =
    data.address && typeof data.address === "object"
      ? (data.address as Record<string, unknown>)
      : null;

  return {
    id,
    receiverId: String(data.receiverId || id),
    name: String(data.name || "").trim(),
    companyName: data.companyName
      ? String(data.companyName).trim()
      : undefined,
    phone: String(data.phone || "").trim(),
    email: data.email ? String(data.email).trim() : undefined,
    address: data.addressLine1
      ? String(data.addressLine1).trim()
      : addressObj?.addressLine1
        ? String(addressObj.addressLine1).trim()
        : data.address && typeof data.address === "string"
          ? String(data.address).trim()
          : undefined,
    city: data.city
      ? String(data.city).trim()
      : addressObj?.city
        ? String(addressObj.city).trim()
        : undefined,
    state: data.state
      ? String(data.state).trim()
      : addressObj?.state
        ? String(addressObj.state).trim()
        : undefined,
    postalCode: data.postalCode
      ? String(data.postalCode).trim()
      : addressObj?.postalCode
        ? String(addressObj.postalCode).trim()
        : undefined,
    gstin: data.gstin ? String(data.gstin).trim().toUpperCase() : undefined,
    status: statusRaw === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(
      data.updatedAt || data.createdAt || new Date().toISOString(),
    ),
  };
}

function validatePayload(body: CreateReceiverBody, partial = false) {
  const errors: string[] = [];

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) {
      errors.push("Receiver name is required.");
    }
  }

  if (!partial || body.phone !== undefined) {
    if (!body.phone?.trim()) {
      errors.push("Phone is required.");
    } else if (!isValidPhone(body.phone)) {
      errors.push("Please enter a valid Indian phone number.");
    }
  }

  if (body.email?.trim() && !isValidEmail(body.email)) {
    errors.push("Please enter a valid email address.");
  }

  if (body.postalCode?.trim() && !isValidIndianPinCode(body.postalCode)) {
    errors.push("Please enter a valid 6-digit PIN code.");
  }

  if (body.gstin?.trim() && !isValidGSTIN(body.gstin)) {
    errors.push("Please enter a valid GSTIN.");
  }

  if (
    body.status !== undefined &&
    body.status !== "ACTIVE" &&
    body.status !== "INACTIVE"
  ) {
    errors.push("Status must be ACTIVE or INACTIVE.");
  }

  return errors;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "LOGISTICS_AWB_VIEW")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view receivers.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const snapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.RECEIVERS)
      .get();

    let receivers = snapshot.docs.map((doc) =>
      normalizeReceiver(doc.id, doc.data()),
    );

    if (status === "ACTIVE" || status === "INACTIVE") {
      receivers = receivers.filter((item) => item.status === status);
    }

    if (q) {
      receivers = receivers.filter((item) =>
        [
          item.receiverId,
          item.name,
          item.companyName,
          item.phone,
          item.email,
          item.city,
          item.state,
          item.gstin,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    receivers.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(receivers);
  } catch (error) {
    console.error("GET /api/logistics/receivers failed", error);

    return errorResponse(
      "RECEIVERS_LIST_FAILED",
      error instanceof Error ? error.message : "Failed to load receivers.",
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "LOGISTICS_AWB_CREATE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to create receivers.",
        403,
      );
    }

    let body: CreateReceiverBody;

    try {
      body = (await request.json()) as CreateReceiverBody;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const errors = validatePayload(body, false);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const now = new Date().toISOString();
    const ref = adminDb.collection(FIRESTORE_COLLECTIONS.RECEIVERS).doc();

    const record: ReceiverRecord = {
      id: ref.id,
      receiverId: ref.id,
      name: body.name!.trim(),
      companyName: body.companyName?.trim() || undefined,
      phone: body.phone!.trim(),
      email: body.email?.trim() || undefined,
      address: body.address?.trim() || undefined,
      city: body.city?.trim() || undefined,
      state: body.state?.trim() || undefined,
      postalCode: body.postalCode?.trim() || undefined,
      gstin: body.gstin?.trim().toUpperCase() || undefined,
      status: body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      createdAt: now,
      updatedAt: now,
    };

    await ref.set({
      ...record,
      addressLine1: record.address || null,
    });

    await writeAuditLog({
      userId: user.userId,
      action: "RECEIVER_CREATE",
      module: "LOGISTICS",
      resourceType: "receiver",
      resourceId: record.receiverId,
      metadata: {
        name: record.name,
        phone: record.phone,
      },
    });

    return successResponse(record, 201, "Receiver created.");
  } catch (error) {
    console.error("POST /api/logistics/receivers failed", error);

    return errorResponse(
      "RECEIVER_CREATE_FAILED",
      error instanceof Error ? error.message : "Failed to create receiver.",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "LOGISTICS_AWB_UPDATE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update receivers.",
        403,
      );
    }

    let body: UpdateReceiverBody;

    try {
      body = (await request.json()) as UpdateReceiverBody;
    } catch {
      return errorResponse(
        "INVALID_JSON",
        "Invalid JSON request body.",
        400,
      );
    }

    const receiverId = body.receiverId?.trim();

    if (!receiverId) {
      return errorResponse(
        "RECEIVER_ID_REQUIRED",
        "receiverId is required.",
        400,
      );
    }

    const errors = validatePayload(body, true);

    if (errors.length > 0) {
      return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.RECEIVERS)
      .doc(receiverId);

    const existing = await ref.get();

    if (!existing.exists) {
      return errorResponse(
        "RECEIVER_NOT_FOUND",
        "Receiver was not found.",
        404,
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) patch.name = body.name.trim();
    if (body.companyName !== undefined) {
      patch.companyName = body.companyName.trim() || null;
    }
    if (body.phone !== undefined) patch.phone = body.phone.trim();
    if (body.email !== undefined) {
      patch.email = body.email.trim() || null;
    }
    if (body.address !== undefined) {
      patch.address = body.address.trim() || null;
      patch.addressLine1 = body.address.trim() || null;
    }
    if (body.city !== undefined) patch.city = body.city.trim() || null;
    if (body.state !== undefined) patch.state = body.state.trim() || null;
    if (body.postalCode !== undefined) {
      patch.postalCode = body.postalCode.trim() || null;
    }
    if (body.gstin !== undefined) {
      patch.gstin = body.gstin.trim().toUpperCase() || null;
    }
    if (body.status !== undefined) patch.status = body.status;

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeReceiver(updated.id, updated.data() || {});

    await writeAuditLog({
      userId: user.userId,
      action: "RECEIVER_UPDATE",
      module: "LOGISTICS",
      resourceType: "receiver",
      resourceId: record.receiverId,
      metadata: patch,
    });

    return successResponse(record, 200, "Receiver updated.");
  } catch (error) {
    console.error("PATCH /api/logistics/receivers failed", error);

    return errorResponse(
      "RECEIVER_UPDATE_FAILED",
      error instanceof Error ? error.message : "Failed to update receiver.",
      500,
    );
  }
}