// import { NextRequest } from "next/server";

// import {
//   adminDb,
// } from "@/lib/firebase-admin";

// import {
//   successResponse,
//   errorResponse,
// } from "@/lib/api-response";

// const PUBLIC_STATUSES = [
//   "PENDING_PAYMENT",
//   "PAID",
//   "CONFIRMED",
//   "PROCESSING",
//   "PACKED",
//   "SHIPPED",
//   "OUT_FOR_DELIVERY",
//   "DELIVERED",
//   "CANCELLED",
//   "REFUNDED",
// ];

// export async function GET(
//   request: NextRequest,
// ) {
//   try {
//     const {
//       searchParams,
//     } = new URL(
//       request.url,
//     );

//     const orderId =
//       searchParams.get(
//         "orderId",
//       )?.trim();

//     if (!orderId) {
//       return errorResponse(
//         "ORDER_ID_REQUIRED",
//         "orderId is required.",
//         400,
//       );
//     }

//     const ref =
//       adminDb
//         .collection(
//           "foodOrders",
//         )
//         .doc(orderId);

//     const snapshot =
//       await ref.get();

//     if (!snapshot.exists) {
//       return errorResponse(
//         "ORDER_NOT_FOUND",
//         "Order was not found.",
//         404,
//       );
//     }

//     // const order =
//     //   snapshot.data() || {};

//     // const currentStatus = String(
//     //   order.status || order.currentStatus || "",
//     // );

//     // if (!currentStatus || !PUBLIC_STATUSES.includes(currentStatus)) {
//     //   return errorResponse(
//     //     "INVALID_ORDER_STATUS",
//     //     "Order has an invalid status.",
//     //     500,
//     //   );
//     // }

//     const order = snapshot.data() || {};
//     const currentStatus = String(
//       order.status || order.currentStatus || "",
//     );

//     if (!currentStatus || !PUBLIC_STATUSES.includes(currentStatus)) {
//       return errorResponse(
//         "INVALID_ORDER_STATUS",
//         "Order has an invalid status.",
//         500,
//       );
//     }

//     return successResponse({
//       tracking: {
//         orderId,
//         status: currentStatus,
//         createdAt: order.createdAt ?? null,
//         updatedAt: order.updatedAt ?? null,
//         shippingAddress: {
//           city: order.customer?.city || order.shippingAddress?.city,
//           state: order.customer?.state || order.shippingAddress?.state,
//         },
//       },
//     });
//   } catch (error) {
//     console.error(
//       "GET /api/food/tracking",
//       error,
//     );

//     return errorResponse(
//       "TRACKING_FAILED",
//       "Unable to retrieve order tracking.",
//       500,
//     );
//   }
// }

import { NextRequest } from "next/server";

import { adminDb } from "@/lib/firebase-admin";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

const PUBLIC_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId")?.trim();

    if (!orderId) {
      return errorResponse(
        "ORDER_ID_REQUIRED",
        "orderId is required.",
        400,
      );
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.FOOD_ORDERS)
      .doc(orderId);

    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return errorResponse(
        "ORDER_NOT_FOUND",
        "Order was not found.",
        404,
      );
    }

    const order = snapshot.data() || {};
    const status = String(
      order.status || order.currentStatus || "PENDING_PAYMENT",
    ).toUpperCase();

    if (!PUBLIC_STATUSES.includes(status as (typeof PUBLIC_STATUSES)[number])) {
      return errorResponse(
        "INVALID_ORDER_STATUS",
        "Order has an invalid status.",
        500,
      );
    }

    const customer =
      (order.customer as Record<string, unknown> | undefined) || {};
    const shipping =
      (order.shippingAddress as Record<string, unknown> | undefined) ||
      {};

    const city = String(
      shipping.city || customer.city || "",
    ).trim();
    const state = String(
      shipping.state || customer.state || "",
    ).trim();

    return successResponse({
      tracking: {
        orderId,
        status,
        paymentStatus: String(order.paymentStatus || "PENDING"),
        createdAt: order.createdAt || null,
        updatedAt: order.updatedAt || null,
        shippingAddress: {
          city: city || undefined,
          state: state || undefined,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/food/tracking", error);
    return errorResponse(
      "TRACKING_FAILED",
      "Unable to retrieve order tracking.",
      500,
    );
  }
}