// import { NextRequest } from "next/server";
// import { adminDb } from "@/lib/firebase-admin";
// import { successResponse, errorResponse } from "@/lib/api-response";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const code = String(searchParams.get("code") || "")
//       .trim()
//       .toUpperCase();
//     const subtotal = Number(searchParams.get("subtotal") || 0);

//     if (!code) {
//       return errorResponse("VALIDATION_ERROR", "Coupon code is required.", 400);
//     }

//     const snap = await adminDb
//       .collection(FIRESTORE_COLLECTIONS.COUPONS)
//       .where("code", "==", code)
//       .limit(1)
//       .get();

//     if (snap.empty) {
//       return errorResponse("INVALID_COUPON", "Coupon not found.", 404);
//     }

//     const doc = snap.docs[0];
//     const data = doc.data() || {};
//     const enabled = data.enabled !== false;
//     const now = Date.now();

//     if (!enabled) {
//       return errorResponse("INVALID_COUPON", "This coupon is inactive.", 400);
//     }

//     if (data.startsAt && Date.parse(String(data.startsAt)) > now) {
//       return errorResponse("INVALID_COUPON", "This coupon is not active yet.", 400);
//     }

//     if (data.expiresAt && Date.parse(String(data.expiresAt)) < now) {
//       return errorResponse("INVALID_COUPON", "This coupon has expired.", 400);
//     }

//     const minOrder = Number(data.minimumOrderAmount || 0);
//     if (minOrder > 0 && subtotal < minOrder) {
//       return errorResponse(
//         "INVALID_COUPON",
//         `Minimum order amount is ₹${minOrder}.`,
//         400,
//       );
//     }

//     const usageLimit =
//       data.usageLimit === undefined || data.usageLimit === null
//         ? null
//         : Number(data.usageLimit);
//     const usedCount = Number(data.usedCount || 0);
//     if (usageLimit != null && usedCount >= usageLimit) {
//       return errorResponse("INVALID_COUPON", "This coupon is fully used.", 400);
//     }

//     const type =
//       String(data.type || "PERCENTAGE").toUpperCase() === "FIXED"
//         ? "FIXED"
//         : "PERCENTAGE";

//     return successResponse({
//       coupon: {
//         couponId: String(data.couponId || doc.id),
//         code: String(data.code || code).toUpperCase(),
//         type,
//         value: Number(data.value || 0),
//         maximumDiscount:
//           data.maximumDiscount === undefined || data.maximumDiscount === null
//             ? null
//             : Number(data.maximumDiscount),
//         minimumOrderAmount: minOrder || null,
//       },
//     });
//   } catch (error) {
//     console.error("GET /api/food/coupons/validate", error);
//     return errorResponse(
//       "COUPON_VALIDATE_FAILED",
//       error instanceof Error ? error.message : "Unable to validate coupon.",
//       500,
//     );
//   }
// }

import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { successResponse, errorResponse } from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = String(searchParams.get("code") || "")
      .trim()
      .toUpperCase();
    const subtotal = Number(searchParams.get("subtotal") || 0);

    if (!code) {
      return errorResponse("VALIDATION_ERROR", "Coupon code is required.", 400);
    }

    const snap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.COUPONS)
      .where("code", "==", code)
      .limit(1)
      .get();

    if (snap.empty) {
      return errorResponse("INVALID_COUPON", "Coupon not found.", 404);
    }

    const doc = snap.docs[0];
    const data = doc.data() || {};
    const now = Date.now();

    if (data.enabled === false) {
      return errorResponse("INVALID_COUPON", "This coupon is inactive.", 400);
    }
    if (data.startsAt && Date.parse(String(data.startsAt)) > now) {
      return errorResponse(
        "INVALID_COUPON",
        "This coupon is not active yet.",
        400,
      );
    }
    if (data.expiresAt && Date.parse(String(data.expiresAt)) < now) {
      return errorResponse("INVALID_COUPON", "This coupon has expired.", 400);
    }

    const minOrder = Number(data.minimumOrderAmount || 0);
    if (minOrder > 0 && subtotal < minOrder) {
      return errorResponse(
        "INVALID_COUPON",
        `Minimum order amount is ₹${minOrder}.`,
        400,
      );
    }

    const usageLimit =
      data.usageLimit === undefined || data.usageLimit === null
        ? null
        : Number(data.usageLimit);
    const usedCount = Number(data.usedCount || 0);
    if (usageLimit != null && usedCount >= usageLimit) {
      return errorResponse("INVALID_COUPON", "This coupon is fully used.", 400);
    }

    const type =
      String(data.type || "PERCENTAGE").toUpperCase() === "FIXED"
        ? "FIXED"
        : "PERCENTAGE";

    return successResponse({
      coupon: {
        couponId: String(data.couponId || doc.id),
        code: String(data.code || code).toUpperCase(),
        type,
        value: Number(data.value || 0),
        maximumDiscount:
          data.maximumDiscount === undefined || data.maximumDiscount === null
            ? null
            : Number(data.maximumDiscount),
        minimumOrderAmount: minOrder || null,
      },
    });
  } catch (error) {
    console.error("GET /api/food/coupons/validate", error);
    return errorResponse(
      "COUPON_VALIDATE_FAILED",
      error instanceof Error ? error.message : "Unable to validate coupon.",
      500,
    );
  }
}