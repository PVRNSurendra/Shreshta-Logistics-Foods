// import { NextRequest } from "next/server";

// import {
//   adminDb,
// } from "@/lib/firebase-admin";

// import {
//   getCurrentUser,
// } from "@/lib/auth";

// import {
//   can,
// } from "@/lib/permissions";

// import {
//   writeAuditLog,
// } from "@/lib/audit";

// import {
//   successResponse,
//   errorResponse,
// } from "@/lib/api-response";

// type DayEndBody = {
//   date?: string;
//   remarks?: string;
// };

// export async function POST(
//   request: NextRequest,
// ) {
//   try {
//     const user =
//       await getCurrentUser();

//     if (!user) {
//       return errorResponse(
//         "UNAUTHENTICATED",
//         "Authentication is required.",
//         401,
//       );
//     }

//     if (
//       !can(
//         user,
//         "LOGISTICS_DAY_END",
//       )
//     ) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to perform day-end operations.",
//         403,
//       );
//     }

//     let body: DayEndBody;

//     try {
//       body =
//         await request.json();
//     } catch {
//       return errorResponse(
//         "INVALID_JSON",
//         "Invalid JSON request body.",
//         400,
//       );
//     }

//     const date =
//       body.date ??
//       new Date()
//         .toISOString()
//         .slice(0, 10);

//     const existing =
//       await adminDb
//         .collection(
//           "dayEndRecords",
//         )
//         .where(
//           "date",
//           "==",
//           date,
//         )
//         .limit(1)
//         .get();

//     if (
//       !existing.empty
//     ) {
//       return errorResponse(
//         "DAY_END_ALREADY_COMPLETED",
//         `Day-end has already been completed for ${date}.`,
//         409,
//       );
//     }

//     const awbsSnapshot =
//       await adminDb
//         .collection("awbs")
//         .get();

//     const awbs =
//       awbsSnapshot.docs.map(
//         (doc) => doc.data(),
//       );

//     const dateAWBs =
//       awbs.filter(
//         (awb) => {
//           const shipmentDate =
//             String(
//               awb.shipmentDate ??
//                 "",
//             );

//           return shipmentDate.startsWith(
//             date,
//           );
//         },
//       );

//     const totalAWBs =
//       dateAWBs.length;

//     const delivered =
//       dateAWBs.filter(
//         (awb) =>
//           awb.currentStatus ===
//           "DELIVERED",
//       ).length;

//     const inTransit =
//       dateAWBs.filter(
//         (awb) =>
//           awb.currentStatus ===
//           "IN_TRANSIT",
//       ).length;

//     const exceptions =
//       dateAWBs.filter(
//         (awb) =>
//           awb.currentStatus ===
//             "EXCEPTION" ||
//           awb.currentStatus ===
//             "ON_HOLD",
//       ).length;

//     const cancelled =
//       dateAWBs.filter(
//         (awb) =>
//           awb.currentStatus ===
//           "CANCELLED",
//       ).length;

//     const revenue =
//       dateAWBs.reduce(
//         (
//           total,
//           awb,
//         ) =>
//           total +
//           Number(
//             awb.charges?.total ??
//               0,
//           ),
//         0,
//       );

//     const dayEndRef =
//       adminDb
//         .collection(
//           "dayEndRecords",
//         )
//         .doc();

//     const record = {
//       dayEndRecordId:
//         dayEndRef.id,

//       date,

//       status:
//         "COMPLETED",

//       completedBy:
//         user.userId,

//       completedAt:
//         new Date().toISOString(),

//       remarks:
//         body.remarks?.trim() ??
//         null,

//       summary: {
//         totalAWBs,
//         delivered,
//         inTransit,
//         exceptions,
//         cancelled,
//         revenue,
//       },
//     };

//     await dayEndRef.set(
//       record,
//     );

//     await writeAuditLog({
//       userId:
//         user.userId,
//       action:
//         "DAY_END_COMPLETED",
//       resourceType:
//         "DAY_END",
//       resourceId:
//         dayEndRef.id,
//       metadata: {
//         date,
//         summary:
//           record.summary,
//       },
//     });

//     return successResponse(
//       {
//         dayEnd:
//           record,
//       },
//       201,
//       "Day-end completed successfully.",
//     );
//   } catch (error) {
//     console.error(
//       "POST /api/logistics/day-end:",
//       error,
//     );

//     return errorResponse(
//       "DAY_END_FAILED",
//       "Unable to complete day-end operation.",
//       500,
//     );
//   }
// }

import { NextRequest } from "next/server";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { successResponse, errorResponse } from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

type DayEndBody = {
  date?: string;
  remarks?: string;
};

type AwbDoc = {
  awb?: string;
  accountCode?: string;
  customerName?: string;
  consigneeName?: string;
  origin?: string;
  destination?: string;
  currentStatus?: string;
  status?: string;
  shipmentDate?: string;
  bookDate?: string;
  createdAt?: string;
  chargeableWeight?: number;
  charges?: { total?: number };
  total?: number;
};

function dateOfAwb(awb: AwbDoc): string {
  const raw = String(
    awb.shipmentDate || awb.bookDate || awb.createdAt || "",
  );
  return raw ? raw.slice(0, 10) : "";
}

function statusOf(awb: AwbDoc): string {
  return String(awb.currentStatus || awb.status || "BOOKED").toUpperCase();
}

function isWarehousePending(status: string) {
  return [
    "BOOKED",
    "PICKUP_REQUESTED",
    "PICKED_UP",
    "AT_ORIGIN",
    "HANDLING_IN_PROGRESS",
    "SHIPMENT_RECEIVED",
    "PROCESSED_AND_PACKED",
  ].includes(status);
}

function isDeliveryPending(status: string) {
  return [
    "IN_TRANSIT",
    "ARRIVED_DESTINATION",
    "OUT_FOR_DELIVERY",
    "FORWARDED_TO_AIRPORT",
  ].includes(status);
}

function isBookingPending(status: string) {
  return ["BOOKED", "PICKUP_REQUESTED", "BOOKING_CONFIRMED"].includes(status);
}

function buildSummary(awbs: AwbDoc[]) {
  let warehousePending = 0;
  let deliveryPending = 0;
  let bookingPending = 0;
  let delivered = 0;
  let inTransit = 0;
  let exceptions = 0;
  let cancelled = 0;
  let revenue = 0;

  for (const awb of awbs) {
    const status = statusOf(awb);
    if (isWarehousePending(status)) warehousePending += 1;
    if (isDeliveryPending(status)) deliveryPending += 1;
    if (isBookingPending(status)) bookingPending += 1;
    if (status === "DELIVERED") delivered += 1;
    if (status === "IN_TRANSIT") inTransit += 1;
    if (status === "EXCEPTION" || status === "ON_HOLD") exceptions += 1;
    if (status === "CANCELLED") cancelled += 1;
    revenue += Number(awb.charges?.total ?? awb.total ?? 0) || 0;
  }

  return {
    totalAWBs: awbs.length,
    warehousePending,
    deliveryPending,
    bookingPending,
    delivered,
    inTransit,
    exceptions,
    cancelled,
    revenue: Math.round(revenue),
  };
}

function mapRow(docId: string, awb: AwbDoc) {
  return {
    id: docId,
    awb: String(awb.awb || docId),
    accountCode: awb.accountCode ? String(awb.accountCode) : "",
    customerName: String(awb.customerName || awb.consigneeName || ""),
    origin: awb.origin ? String(awb.origin) : "",
    destination: awb.destination ? String(awb.destination) : "",
    currentStatus: statusOf(awb),
    bookDate: dateOfAwb(awb) || undefined,
    chargeableWeight: Number(awb.chargeableWeight || 0),
    total: Number(awb.charges?.total ?? awb.total ?? 0) || 0,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (
      !can(user, "LOGISTICS_DAY_END") &&
      !can(user, "LOGISTICS_AWB_VIEW")
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view day-end data.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get("date")?.trim() ||
      new Date().toISOString().slice(0, 10);

    const snap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.AWBS)
      .limit(1000)
      .get();

    const forDate: Array<{ id: string; data: AwbDoc }> = [];
    snap.docs.forEach((doc) => {
      const data = doc.data() as AwbDoc;
      if (dateOfAwb(data) === date) {
        forDate.push({ id: doc.id, data });
      }
    });

    let rowsSource = forDate;
    let scope: "date" | "all" = "date";

    if (forDate.length === 0) {
      rowsSource = snap.docs.map((doc) => ({
        id: doc.id,
        data: doc.data() as AwbDoc,
      }));
      scope = "all";
    }

    const rows = rowsSource.map(({ id, data }) => mapRow(id, data));
    const summary = buildSummary(rowsSource.map((r) => r.data));

    const existing = await adminDb
      .collection(FIRESTORE_COLLECTIONS.DAY_END_RECORDS)
      .where("date", "==", date)
      .limit(1)
      .get();

    const existingRecord = existing.empty
      ? null
      : existing.docs[0]!.data();

    return successResponse({
      date,
      scope,
      summary,
      rows,
      existingRecord,
    });
  } catch (error) {
    console.error("GET /api/logistics/day-end:", error);
    return errorResponse(
      "DAY_END_LOAD_FAILED",
      "Unable to load day-end data.",
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "LOGISTICS_DAY_END")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to perform day-end operations.",
        403,
      );
    }

    let body: DayEndBody;
    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
    }

    const date =
      body.date?.trim() || new Date().toISOString().slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return errorResponse("INVALID_DATE", "date must be YYYY-MM-DD.", 400);
    }

    const existing = await adminDb
      .collection(FIRESTORE_COLLECTIONS.DAY_END_RECORDS)
      .where("date", "==", date)
      .limit(1)
      .get();

    if (!existing.empty) {
      return errorResponse(
        "DAY_END_ALREADY_COMPLETED",
        `Day-end has already been completed for ${date}.`,
        409,
      );
    }

    const awbsSnapshot = await adminDb
      .collection(FIRESTORE_COLLECTIONS.AWBS)
      .limit(1000)
      .get();

    const dateAWBs = awbsSnapshot.docs
      .map((doc) => doc.data() as AwbDoc)
      .filter((awb) => dateOfAwb(awb) === date);

    const summary = buildSummary(dateAWBs);

    const dayEndRef = adminDb
      .collection(FIRESTORE_COLLECTIONS.DAY_END_RECORDS)
      .doc();

    const record = {
      dayEndRecordId: dayEndRef.id,
      id: dayEndRef.id,
      date,
      status: "COMPLETED" as const,
      completedBy: user.userId,
      completedAt: new Date().toISOString(),
      remarks: body.remarks?.trim() || null,
      summary,
    };

    await dayEndRef.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "DAY_END_COMPLETED",
      resourceType: "DAY_END",
      resourceId: dayEndRef.id,
      module: "LOGISTICS",
      metadata: { date, summary: record.summary },
    });

    return successResponse(
      { dayEnd: record },
      201,
      "Day-end completed successfully.",
    );
  } catch (error) {
    console.error("POST /api/logistics/day-end:", error);
    return errorResponse(
      "DAY_END_FAILED",
      "Unable to complete day-end operation.",
      500,
    );
  }
}