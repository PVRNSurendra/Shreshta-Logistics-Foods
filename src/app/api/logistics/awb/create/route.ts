// import { NextRequest } from "next/server";
// import {
//   FieldValue,
// } from "firebase-admin/firestore";

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

// import {
//   calculateChargeableWeight,
//   calculateVolumetricWeight,
// } from "@/utils/calculations";

// import {
//   isValidGSTIN,
//   positiveNumber,
//   positiveInteger,
//   requiredString,
// } from "@/utils/validators";

// import type {
//   TrackingStatus,
//   ShipmentPiece,
// } from "@/types/logistics";

// type CreateAWBBody = {
//   customerId?: string;

//   senderId?: string;
//   receiverId?: string;

//   origin?: string;
//   destination?: string;

//   serviceId?: string;
//   serviceType?: string;

//   shipmentDate?: string;
//   description?: string;

//   pieces?: Array<{
//     quantity?: number;
//     actualWeightKg?: number;
//     lengthCm?: number;
//     widthCm?: number;
//     heightCm?: number;
//     description?: string;
//   }>;

//   gstin?: string;

//   freight?: number;
//   fuelSurcharge?: number;
//   handlingCharges?: number;
//   pickupCharges?: number;
//   deliveryCharges?: number;
//   otherCharges?: number;
//   discount?: number;
//   gstRate?: number;
// };

// function generateAWB() {
//   const timestamp =
//     Date.now()
//       .toString()
//       .slice(-8);

//   const random =
//     Math.floor(
//       1000 +
//         Math.random() * 9000,
//     );

//   return `SR${timestamp}${random}`;
// }

// export async function POST(
//   request: NextRequest,
// ) {
//   try {
//     const user = await getCurrentUser(request);

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
//         "LOGISTICS_AWB_CREATE",
//       )
//     ) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to create an AWB.",
//         403,
//       );
//     }

//     let body: CreateAWBBody;

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

//     const customerId =
//   typeof body.customerId === "string" && body.customerId.trim()
//     ? body.customerId.trim()
//     : "WALKIN";

// const senderId =
//   typeof body.senderId === "string" && body.senderId.trim()
//     ? body.senderId.trim()
//     : "WALKIN_SENDER";

// const receiverId =
//   typeof body.receiverId === "string" && body.receiverId.trim()
//     ? body.receiverId.trim()
//     : "WALKIN_RECEIVER";

// const origin =
//   typeof body.origin === "string" && body.origin.trim()
//     ? body.origin.trim()
//     : typeof (body as { shipper?: { city?: string } }).shipper?.city === "string"
//       ? String((body as { shipper?: { city?: string } }).shipper?.city).trim() || "ORIGIN"
//       : "ORIGIN";

// const destination =
//   typeof body.destination === "string" && body.destination.trim()
//     ? body.destination.trim()
//     : typeof (body as { consignee?: { country?: string } }).consignee?.country === "string"
//       ? String((body as { consignee?: { country?: string } }).consignee?.country).trim() || "DEST"
//       : "DEST";

//     // const serviceId =
//     //   requiredString(
//     //     body.serviceId,
//     //     "serviceId",
//     //   );

//       const serviceId =
//   typeof body.serviceId === "string" && body.serviceId.trim()
//     ? body.serviceId.trim()
//     : typeof body.service === "string" && body.service.trim()
//       ? body.service.trim()
//       : typeof body.product === "string" && body.product.trim()
//         ? body.product.trim()
//         : "SELF";

//     const shipmentDate =
//   typeof body.shipmentDate === "string" && body.shipmentDate.trim()
//     ? body.shipmentDate.trim()
//     : new Date().toISOString().slice(0, 10);

//     const piecesInput =
//       body.pieces ?? [];

//     if (
//       piecesInput.length === 0
//     ) {
//       return errorResponse(
//         "PIECES_REQUIRED",
//         "At least one shipment piece is required.",
//         400,
//       );
//     }

//     const pieces: ShipmentPiece[] =
//       piecesInput.map(
//         (piece, index) => {
//           const quantity =
//             positiveInteger(
//               piece.quantity ?? 1,
//               `pieces[${index}].quantity`,
//             );

//           const actualWeightKg =
//             positiveNumber(
//               piece.actualWeightKg ?? 0,
//               `pieces[${index}].actualWeightKg`,
//             );

//           const lengthCm =
//             positiveNumber(
//               piece.lengthCm ?? 0,
//               `pieces[${index}].lengthCm`,
//             );

//           const widthCm =
//             positiveNumber(
//               piece.widthCm ?? 0,
//               `pieces[${index}].widthCm`,
//             );

//           const heightCm =
//             positiveNumber(
//               piece.heightCm ?? 0,
//               `pieces[${index}].heightCm`,
//             );

//           const volumetricWeightKg =
//             calculateVolumetricWeight(
//               lengthCm,
//               widthCm,
//               heightCm,
//               quantity,
//             );

//           return {
//             pieceId:
//               `piece_${index + 1}`,
//             quantity,
//             actualWeightKg,
//             lengthCm,
//             widthCm,
//             heightCm,
//             volumetricWeightKg,
//             description:
//               piece.description?.trim(),
//           };
//         },
//       );

//     const actualWeightKg =
//       pieces.reduce(
//         (
//           total,
//           piece,
//         ) =>
//           total +
//           (piece.actualWeightKg ?? 0) *
//             piece.quantity,
//         0,
//       );

//     const volumetricWeightKg =
//       pieces.reduce(
//         (
//           total,
//           piece,
//         ) =>
//           total +
//           (piece.volumetricWeightKg ??
//             0),
//         0,
//       );

//     const chargeableWeightKg =
//       calculateChargeableWeight(
//         actualWeightKg,
//         volumetricWeightKg,
//       );

//     const gstin =
//       body.gstin?.trim();

//     if (
//       gstin &&
//       !isValidGSTIN(gstin)
//     ) {
//       return errorResponse(
//         "INVALID_GSTIN",
//         "GSTIN is invalid.",
//         400,
//       );
//     }

//     const freight =
//       positiveNumber(
//         body.freight ?? 0,
//         "freight",
//       );

//     const fuelSurcharge =
//       positiveNumber(
//         body.fuelSurcharge ?? 0,
//         "fuelSurcharge",
//       );

//     const handlingCharges =
//       positiveNumber(
//         body.handlingCharges ?? 0,
//         "handlingCharges",
//       );

//     const pickupCharges =
//       positiveNumber(
//         body.pickupCharges ?? 0,
//         "pickupCharges",
//       );

//     const deliveryCharges =
//       positiveNumber(
//         body.deliveryCharges ?? 0,
//         "deliveryCharges",
//       );

//     const otherCharges =
//       positiveNumber(
//         body.otherCharges ?? 0,
//         "otherCharges",
//       );

//     const discount =
//       positiveNumber(
//         body.discount ?? 0,
//         "discount",
//       );

//     const taxableAmount =
//       Math.max(
//         0,
//         freight +
//           fuelSurcharge +
//           handlingCharges +
//           pickupCharges +
//           deliveryCharges +
//           otherCharges -
//           discount,
//       );

//     const gstRate =
//       body.gstRate ?? 18;

//     const totalTax =
//       taxableAmount *
//       (gstRate / 100);

//     const total =
//       taxableAmount +
//       totalTax;

//     const awb =
//       generateAWB();

//     const now =
//       new Date().toISOString();

//     const trackingStageId =
//       "BOOKED";

//     const awbRef =
//       adminDb
//         .collection("awbs")
//         .doc();

//     const trackingEventRef =
//       adminDb
//         .collection("trackingEvents")
//         .doc();

//     const awbData = {
//       awb,

//       customerId,
//       senderId,
//       receiverId,

//       origin,
//       destination,

//       serviceId,
//       serviceType:
//         body.serviceType ??
//         null,

//       shipmentDate,

//       description:
//         body.description?.trim() ??
//         null,

//       pieces,

//       actualWeightKg,
//       volumetricWeightKg,
//       chargeableWeightKg,

//       gstDetails: {
//         gstin: gstin ?? null,
//         taxableAmount,
//         cgst:
//           totalTax / 2,
//         sgst:
//           totalTax / 2,
//         igst: 0,
//         totalTax,
//       },

//       charges: {
//         freight,
//         fuelSurcharge,
//         handlingCharges,
//         pickupCharges,
//         deliveryCharges,
//         otherCharges,
//         discount,
//         taxableAmount,
//         gst: totalTax,
//         total,
//       },

//       currentStatus:
//         "BOOKED" as TrackingStatus,

//       latestLocation:
//         origin,

//       createdBy:
//         user.userId,

//       updatedBy:
//         user.userId,

//       createdAt: now,
//       updatedAt: now,
//     };

//     const trackingEvent = {
//       trackingEventId:
//         trackingEventRef.id,

//       awb,

//       trackingStageId,

//       status:
//         "BOOKED" as TrackingStatus,

//       location: origin,

//       remarks:
//         "Shipment booked.",

//       eventTime: now,

//       createdBy:
//         user.userId,

//       createdAt:
//         FieldValue.serverTimestamp(),
//     };

//     const batch =
//       adminDb.batch();

//     batch.set(
//       awbRef,
//       {
//         ...awbData,
//         awbDocumentId:
//           awbRef.id,
//       },
//     );

//     batch.set(
//       trackingEventRef,
//       trackingEvent,
//     );

//     await batch.commit();

//     await writeAuditLog({
//       userId:
//         user.userId,
//       action:
//         "AWB_CREATED",
//       resourceType:
//         "AWB",
//       resourceId:
//         awb,
//       metadata: {
//         customerId,
//         senderId,
//         receiverId,
//         origin,
//         destination,
//         serviceId,
//         chargeableWeightKg,
//       },
//     });

//     return successResponse(
//       {
//         awb,
//         status:
//           "BOOKED",
//         trackingEventId:
//           trackingEventRef.id,
//         shipment: awbData,
//       },
//       201,
//       "AWB created successfully.",
//     );
//   } catch (error) {
//     console.error(
//       "POST /api/logistics/awb/create:",
//       error,
//     );

//     if (error instanceof Error && /is required|must be a valid|cannot be negative/i.test(error.message)) {
//       return errorResponse("VALIDATION_ERROR", error.message, 400);
//     }

//     return errorResponse(
//       "AWB_CREATE_FAILED",
//       error instanceof Error
//         ? error.message
//         : "Unable to create AWB.",
//       500,
//     );
//   }
// }

// import { NextRequest } from "next/server";
// import { FieldValue } from "firebase-admin/firestore";

// import { adminDb } from "@/lib/firebase-admin";
// import { getCurrentUser } from "@/lib/auth";
// import { can } from "@/lib/permissions";
// import { writeAuditLog } from "@/lib/audit";
// import { successResponse, errorResponse } from "@/lib/api-response";
// import { generateBusinessId } from "@/lib/business-id";
// import {
//   calculateChargeableWeight,
//   calculateVolumetricWeight,
// } from "@/utils/calculations";
// import {
//   isValidGSTIN,
//   positiveNumber,
//   positiveInteger,
// } from "@/utils/validators";

// import type { TrackingStatus, ShipmentPiece } from "@/types/logistics";

// type CreateAWBBody = {
//   customerId?: string;
//   senderId?: string;
//   receiverId?: string;

//   origin?: string;
//   destination?: string;

//   serviceId?: string;
//   serviceType?: string;
//   service?: string;
//   product?: string;

//   shipmentDate?: string;
//   description?: string;

//   shipper?: {
//     city?: string;
//     gstin?: string;
//   };
//   consignee?: {
//     city?: string;
//     country?: string;
//   };

//   pieces?: Array<{
//     quantity?: number;
//     actualWeightKg?: number;
//     lengthCm?: number;
//     widthCm?: number;
//     heightCm?: number;
//     description?: string;
//   }>;

//   gstin?: string;

//   freight?: number;
//   fuelSurcharge?: number;
//   handlingCharges?: number;
//   pickupCharges?: number;
//   deliveryCharges?: number;
//   otherCharges?: number;
//   discount?: number;
//   gstRate?: number;
// };

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);

//     if (!user) {
//       return errorResponse(
//         "UNAUTHENTICATED",
//         "Authentication is required.",
//         401,
//       );
//     }

//     if (!can(user, "LOGISTICS_AWB_CREATE")) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to create an AWB.",
//         403,
//       );
//     }

//     let body: CreateAWBBody;

//     try {
//       body = await request.json();
//     } catch {
//       return errorResponse(
//         "INVALID_JSON",
//         "Invalid JSON request body.",
//         400,
//       );
//     }

//     const customerId =
//       typeof body.customerId === "string" && body.customerId.trim()
//         ? body.customerId.trim()
//         : "WALKIN";

//     const senderId =
//       typeof body.senderId === "string" && body.senderId.trim()
//         ? body.senderId.trim()
//         : "WALKIN_SENDER";

//     const receiverId =
//       typeof body.receiverId === "string" && body.receiverId.trim()
//         ? body.receiverId.trim()
//         : "WALKIN_RECEIVER";

//     const origin =
//       typeof body.origin === "string" && body.origin.trim()
//         ? body.origin.trim()
//         : typeof body.shipper?.city === "string" && body.shipper.city.trim()
//           ? body.shipper.city.trim()
//           : "ORIGIN";

//     const destination =
//       typeof body.destination === "string" && body.destination.trim()
//         ? body.destination.trim()
//         : typeof body.consignee?.country === "string" &&
//             body.consignee.country.trim()
//           ? body.consignee.country.trim()
//           : typeof body.consignee?.city === "string" &&
//               body.consignee.city.trim()
//             ? body.consignee.city.trim()
//             : "DEST";

//     const serviceId =
//       typeof body.serviceId === "string" && body.serviceId.trim()
//         ? body.serviceId.trim()
//         : typeof body.service === "string" && body.service.trim()
//           ? body.service.trim()
//           : typeof body.product === "string" && body.product.trim()
//             ? body.product.trim()
//             : "SELF";

//     const shipmentDate =
//       typeof body.shipmentDate === "string" && body.shipmentDate.trim()
//         ? body.shipmentDate.trim()
//         : new Date().toISOString().slice(0, 10);

//     const piecesInput = body.pieces ?? [];

//     if (piecesInput.length === 0) {
//       return errorResponse(
//         "PIECES_REQUIRED",
//         "At least one shipment piece is required.",
//         400,
//       );
//     }

//     const pieces: ShipmentPiece[] = piecesInput.map((piece, index) => {
//       const quantity = positiveInteger(
//         piece.quantity ?? 1,
//         `pieces[${index}].quantity`,
//       );

//       const actualWeightKg = positiveNumber(
//         piece.actualWeightKg ?? 0,
//         `pieces[${index}].actualWeightKg`,
//       );

//       const lengthCm = positiveNumber(
//         piece.lengthCm ?? 0,
//         `pieces[${index}].lengthCm`,
//       );

//       const widthCm = positiveNumber(
//         piece.widthCm ?? 0,
//         `pieces[${index}].widthCm`,
//       );

//       const heightCm = positiveNumber(
//         piece.heightCm ?? 0,
//         `pieces[${index}].heightCm`,
//       );

//       const volumetricWeightKg = calculateVolumetricWeight(
//         lengthCm,
//         widthCm,
//         heightCm,
//         quantity,
//       );

//       return {
//         pieceId: `piece_${index + 1}`,
//         quantity,
//         actualWeightKg,
//         lengthCm,
//         widthCm,
//         heightCm,
//         volumetricWeightKg,
//         description: piece.description?.trim(),
//       };
//     });

//     const actualWeightKg = pieces.reduce(
//       (total, piece) =>
//         total + (piece.actualWeightKg ?? 0) * piece.quantity,
//       0,
//     );

//     const volumetricWeightKg = pieces.reduce(
//       (total, piece) => total + (piece.volumetricWeightKg ?? 0),
//       0,
//     );

//     const chargeableWeightKg = calculateChargeableWeight(
//       actualWeightKg,
//       volumetricWeightKg,
//     );

//     const gstin =
//       body.gstin?.trim() || body.shipper?.gstin?.trim() || undefined;

//     if (gstin && !isValidGSTIN(gstin)) {
//       return errorResponse("INVALID_GSTIN", "GSTIN is invalid.", 400);
//     }

//     const freight = positiveNumber(body.freight ?? 0, "freight");
//     const fuelSurcharge = positiveNumber(
//       body.fuelSurcharge ?? 0,
//       "fuelSurcharge",
//     );
//     const handlingCharges = positiveNumber(
//       body.handlingCharges ?? 0,
//       "handlingCharges",
//     );
//     const pickupCharges = positiveNumber(
//       body.pickupCharges ?? 0,
//       "pickupCharges",
//     );
//     const deliveryCharges = positiveNumber(
//       body.deliveryCharges ?? 0,
//       "deliveryCharges",
//     );
//     const otherCharges = positiveNumber(
//       body.otherCharges ?? 0,
//       "otherCharges",
//     );
//     const discount = positiveNumber(body.discount ?? 0, "discount");

//     const taxableAmount = Math.max(
//       0,
//       freight +
//         fuelSurcharge +
//         handlingCharges +
//         pickupCharges +
//         deliveryCharges +
//         otherCharges -
//         discount,
//     );

//     const gstRate = body.gstRate ?? 18;
//     const totalTax = taxableAmount * (gstRate / 100);
//     const total = taxableAmount + totalTax;

//     // 10-digit digits-only AWB (logistics range — never collides with food)
//     const awb = await generateBusinessId("LOGISTICS");

//     const now = new Date().toISOString();
//     const trackingStageId = "BOOKED";

//     // Use AWB as document id for stable lookups
//     const awbRef = adminDb.collection("awbs").doc(awb);
//     const trackingEventRef = adminDb.collection("trackingEvents").doc();

//     const awbData = {
//       awb,
//       customerId,
//       senderId,
//       receiverId,
//       origin,
//       destination,
//       serviceId,
//       serviceType: body.serviceType ?? null,
//       shipmentDate,
//       description: body.description?.trim() ?? null,
//       pieces,
//       actualWeightKg,
//       volumetricWeightKg,
//       chargeableWeightKg,
//       gstDetails: {
//         gstin: gstin ?? null,
//         taxableAmount,
//         cgst: totalTax / 2,
//         sgst: totalTax / 2,
//         igst: 0,
//         totalTax,
//       },
//       charges: {
//         freight,
//         fuelSurcharge,
//         handlingCharges,
//         pickupCharges,
//         deliveryCharges,
//         otherCharges,
//         discount,
//         taxableAmount,
//         gst: totalTax,
//         total,
//       },
//       currentStatus: "BOOKED" as TrackingStatus,
//       latestLocation: origin,
//       createdBy: user.userId,
//       updatedBy: user.userId,
//       createdAt: now,
//       updatedAt: now,
//     };

//     const trackingEvent = {
//       trackingEventId: trackingEventRef.id,
//       awb,
//       trackingStageId,
//       status: "BOOKED" as TrackingStatus,
//       location: origin,
//       remarks: "Shipment booked.",
//       eventTime: now,
//       createdBy: user.userId,
//       createdAt: FieldValue.serverTimestamp(),
//     };

//     const batch = adminDb.batch();

//     batch.set(awbRef, {
//       ...awbData,
//       awbDocumentId: awbRef.id,
//     });

//     batch.set(trackingEventRef, trackingEvent);

//     await batch.commit();

//     await writeAuditLog({
//       userId: user.userId,
//       action: "AWB_CREATED",
//       resourceType: "AWB",
//       resourceId: awb,
//       metadata: {
//         customerId,
//         senderId,
//         receiverId,
//         origin,
//         destination,
//         serviceId,
//         chargeableWeightKg,
//       },
//     });

//     return successResponse(
//       {
//         awb,
//         status: "BOOKED",
//         trackingEventId: trackingEventRef.id,
//         shipment: awbData,
//       },
//       201,
//       "AWB created successfully.",
//     );
//   } catch (error) {
//     console.error("POST /api/logistics/awb/create:", error);

//     if (
//       error instanceof Error &&
//       /is required|must be a valid|cannot be negative/i.test(error.message)
//     ) {
//       return errorResponse("VALIDATION_ERROR", error.message, 400);
//     }

//     return errorResponse(
//       "AWB_CREATE_FAILED",
//       error instanceof Error ? error.message : "Unable to create AWB.",
//       500,
//     );
//   }
// }

// import { NextRequest } from "next/server";
// import { FieldValue } from "firebase-admin/firestore";

// import { adminDb } from "@/lib/firebase-admin";
// import { getCurrentUser } from "@/lib/auth";
// import { can } from "@/lib/permissions";
// import { writeAuditLog } from "@/lib/audit";
// import { successResponse, errorResponse } from "@/lib/api-response";
// import { generateBusinessId } from "@/lib/business-id";
// import {
//   calculateChargeableWeight,
//   calculateVolumetricWeight,
// } from "@/utils/calculations";
// import {
//   isValidGSTIN,
//   positiveNumber,
//   positiveInteger,
// } from "@/utils/validators";

// import type { ShipmentPiece } from "@/types/logistics";
// import type { TrackingStatus } from "@/types/tracking";

// type CreateAWBBody = {
//   customerId?: string;
//   senderId?: string;
//   receiverId?: string;

//   origin?: string;
//   destination?: string;

//   serviceId?: string;
//   serviceType?: string;
//   service?: string;
//   product?: string;

//   shipmentDate?: string;
//   description?: string;

//   shipper?: {
//     city?: string;
//     gstin?: string;
//   };
//   consignee?: {
//     city?: string;
//     country?: string;
//   };

//   pieces?: Array<{
//     quantity?: number;
//     actualWeightKg?: number;
//     lengthCm?: number;
//     widthCm?: number;
//     heightCm?: number;
//     description?: string;
//   }>;

//   gstin?: string;

//   freight?: number;
//   fuelSurcharge?: number;
//   handlingCharges?: number;
//   pickupCharges?: number;
//   deliveryCharges?: number;
//   otherCharges?: number;
//   discount?: number;
//   gstRate?: number;
// };

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);

//     if (!user) {
//       return errorResponse(
//         "UNAUTHENTICATED",
//         "Authentication is required.",
//         401,
//       );
//     }

//     if (!can(user, "LOGISTICS_AWB_CREATE")) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to create an AWB.",
//         403,
//       );
//     }

//     let body: CreateAWBBody;

//     try {
//       body = await request.json();
//     } catch {
//       return errorResponse(
//         "INVALID_JSON",
//         "Invalid JSON request body.",
//         400,
//       );
//     }

//     const customerId =
//       typeof body.customerId === "string" && body.customerId.trim()
//         ? body.customerId.trim()
//         : "WALKIN";

//     const senderId =
//       typeof body.senderId === "string" && body.senderId.trim()
//         ? body.senderId.trim()
//         : "WALKIN_SENDER";

//     const receiverId =
//       typeof body.receiverId === "string" && body.receiverId.trim()
//         ? body.receiverId.trim()
//         : "WALKIN_RECEIVER";

//     const origin =
//       typeof body.origin === "string" && body.origin.trim()
//         ? body.origin.trim()
//         : typeof body.shipper?.city === "string" && body.shipper.city.trim()
//           ? body.shipper.city.trim()
//           : "ORIGIN";

//     const destination =
//       typeof body.destination === "string" && body.destination.trim()
//         ? body.destination.trim()
//         : typeof body.consignee?.country === "string" &&
//             body.consignee.country.trim()
//           ? body.consignee.country.trim()
//           : typeof body.consignee?.city === "string" &&
//               body.consignee.city.trim()
//             ? body.consignee.city.trim()
//             : "DEST";

//     const serviceId =
//       typeof body.serviceId === "string" && body.serviceId.trim()
//         ? body.serviceId.trim()
//         : typeof body.service === "string" && body.service.trim()
//           ? body.service.trim()
//           : typeof body.product === "string" && body.product.trim()
//             ? body.product.trim()
//             : "SELF";

//     const shipmentDate =
//       typeof body.shipmentDate === "string" && body.shipmentDate.trim()
//         ? body.shipmentDate.trim()
//         : new Date().toISOString().slice(0, 10);

//     const piecesInput = body.pieces ?? [];

//     if (piecesInput.length === 0) {
//       return errorResponse(
//         "PIECES_REQUIRED",
//         "At least one shipment piece is required.",
//         400,
//       );
//     }

//     const pieces: ShipmentPiece[] = piecesInput.map((piece, index) => {
//       const quantity = positiveInteger(
//         piece.quantity ?? 1,
//         `pieces[${index}].quantity`,
//       );

//       const actualWeight = positiveNumber(
//         piece.actualWeightKg ?? 0,
//         `pieces[${index}].actualWeightKg`,
//       );

//       const lengthCm = positiveNumber(
//         piece.lengthCm ?? 0,
//         `pieces[${index}].lengthCm`,
//       );

//       const widthCm = positiveNumber(
//         piece.widthCm ?? 0,
//         `pieces[${index}].widthCm`,
//       );

//       const heightCm = positiveNumber(
//         piece.heightCm ?? 0,
//         `pieces[${index}].heightCm`,
//       );

//       const volumetricWeight = calculateVolumetricWeight(
//         lengthCm,
//         widthCm,
//         heightCm,
//         quantity,
//       );

//       const chargeableWeight = calculateChargeableWeight(
//         actualWeight * quantity,
//         volumetricWeight,
//       );

//       return {
//         pieceId: `piece_${index + 1}`,
//         quantity,
//         actualWeight,
//         volumetricWeight,
//         chargeableWeight,
//         weightUnit: "KG" as const,
//         dimensions: {
//           length: lengthCm,
//           width: widthCm,
//           height: heightCm,
//           unit: "CM" as const,
//           boxCount: quantity,
//         },
//         description: piece.description?.trim(),
//         division: 5000,
//       };
//     });

//     const actualWeightKg = pieces.reduce(
//       (total, piece) => total + piece.actualWeight * piece.quantity,
//       0,
//     );

//     const volumetricWeightKg = pieces.reduce(
//       (total, piece) => total + (piece.volumetricWeight ?? 0),
//       0,
//     );

//     const chargeableWeightKg = calculateChargeableWeight(
//       actualWeightKg,
//       volumetricWeightKg,
//     );

//     const gstin =
//       body.gstin?.trim() || body.shipper?.gstin?.trim() || undefined;

//     if (gstin && !isValidGSTIN(gstin)) {
//       return errorResponse("INVALID_GSTIN", "GSTIN is invalid.", 400);
//     }

//     const freight = positiveNumber(body.freight ?? 0, "freight");
//     const fuelSurcharge = positiveNumber(
//       body.fuelSurcharge ?? 0,
//       "fuelSurcharge",
//     );
//     const handlingCharges = positiveNumber(
//       body.handlingCharges ?? 0,
//       "handlingCharges",
//     );
//     const pickupCharges = positiveNumber(
//       body.pickupCharges ?? 0,
//       "pickupCharges",
//     );
//     const deliveryCharges = positiveNumber(
//       body.deliveryCharges ?? 0,
//       "deliveryCharges",
//     );
//     const otherCharges = positiveNumber(
//       body.otherCharges ?? 0,
//       "otherCharges",
//     );
//     const discount = positiveNumber(body.discount ?? 0, "discount");

//     const taxableAmount = Math.max(
//       0,
//       freight +
//         fuelSurcharge +
//         handlingCharges +
//         pickupCharges +
//         deliveryCharges +
//         otherCharges -
//         discount,
//     );

//     const gstRate = body.gstRate ?? 18;
//     const totalTax = taxableAmount * (gstRate / 100);
//     const total = taxableAmount + totalTax;

//     const awb = await generateBusinessId("LOGISTICS");

//     const now = new Date().toISOString();
//     const trackingStageId = "BOOKED";

//     const awbRef = adminDb.collection("awbs").doc(awb);
//     const trackingEventRef = adminDb.collection("trackingEvents").doc();

//     const awbData = {
//       awb,
//       customerId,
//       senderId,
//       receiverId,
//       origin,
//       destination,
//       serviceId,
//       serviceType: body.serviceType ?? null,
//       shipmentDate,
//       description: body.description?.trim() ?? null,
//       pieces,
//       actualWeightKg,
//       volumetricWeightKg,
//       chargeableWeightKg,
//       // aliases matching richer AWB type field names
//       actualWeight: actualWeightKg,
//       volumetricWeight: volumetricWeightKg,
//       chargeableWeight: chargeableWeightKg,
//       totalPieces: pieces.reduce((n, p) => n + p.quantity, 0),
//       weightUnit: "KG" as const,
//       gstDetails: {
//         gstin: gstin ?? null,
//         taxableAmount,
//         cgst: totalTax / 2,
//         sgst: totalTax / 2,
//         igst: 0,
//         totalTax,
//       },
//       charges: {
//         freight,
//         fuelSurcharge,
//         handlingCharges,
//         pickupCharges,
//         deliveryCharges,
//         otherCharges,
//         discount,
//         taxableAmount,
//         gst: totalTax,
//         total,
//         currency: "INR" as const,
//       },
//       currentStatus: "BOOKED" as TrackingStatus,
//       latestLocation: origin,
//       createdBy: user.userId,
//       updatedBy: user.userId,
//       createdAt: now,
//       updatedAt: now,
//     };

//     const trackingEvent = {
//       trackingEventId: trackingEventRef.id,
//       awb,
//       trackingStageId,
//       status: "BOOKED" as TrackingStatus,
//       location: origin,
//       remarks: "Shipment booked.",
//       eventTime: now,
//       createdBy: user.userId,
//       createdAt: FieldValue.serverTimestamp(),
//     };

//     const batch = adminDb.batch();

//     batch.set(awbRef, {
//       ...awbData,
//       awbDocumentId: awbRef.id,
//     });

//     batch.set(trackingEventRef, trackingEvent);

//     await batch.commit();

//     await writeAuditLog({
//       userId: user.userId,
//       action: "AWB_CREATED",
//       resourceType: "AWB",
//       resourceId: awb,
//       metadata: {
//         customerId,
//         senderId,
//         receiverId,
//         origin,
//         destination,
//         serviceId,
//         chargeableWeightKg,
//       },
//     });

//     return successResponse(
//       {
//         awb,
//         status: "BOOKED",
//         trackingEventId: trackingEventRef.id,
//         shipment: awbData,
//       },
//       201,
//       "AWB created successfully.",
//     );
//   } catch (error) {
//     console.error("POST /api/logistics/awb/create:", error);

//     if (
//       error instanceof Error &&
//       /is required|must be a valid|cannot be negative/i.test(error.message)
//     ) {
//       return errorResponse("VALIDATION_ERROR", error.message, 400);
//     }

//     return errorResponse(
//       "AWB_CREATE_FAILED",
//       error instanceof Error ? error.message : "Unable to create AWB.",
//       500,
//     );
//   }
// }

import { NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { successResponse, errorResponse } from "@/lib/api-response";
import { generateBusinessId } from "@/lib/business-id";
import {
  calculateChargeableWeight,
  calculateVolumetricWeight,
} from "@/utils/calculations";
import {
  isValidGSTIN,
  positiveNumber,
  positiveInteger,
} from "@/utils/validators";

import type { ShipmentPiece } from "@/types/logistics";
import type { TrackingStatus } from "@/types/tracking";

/** USA → 5000, Australia → 4000, else 5000 */
function getVolumetricDivisor(
  destination?: string,
  country?: string,
): number {
  const text = `${destination || ""} ${country || ""}`.toUpperCase();

  if (
    text.includes("AUSTRALIA") ||
    text.includes("AUSTRALIAN") ||
    /\bAUS\b/.test(text) ||
    /\bAU\b/.test(text) ||
    text.includes("SYDNEY") ||
    text.includes("MELBOURNE") ||
    text.includes("BRISBANE") ||
    text.includes("PERTH") ||
    text.includes("ADELAIDE")
  ) {
    return 4000;
  }

  if (
    text.includes("USA") ||
    text.includes("U.S.A") ||
    text.includes("U.S.") ||
    text.includes("UNITED STATES") ||
    text.includes("AMERICA") ||
    /\bUS\b/.test(text)
  ) {
    return 5000;
  }

  return 5000;
}

type CreateAWBBody = {
  customerId?: string;
  senderId?: string;
  receiverId?: string;

  origin?: string;
  destination?: string;

  serviceId?: string;
  serviceType?: string;
  service?: string;
  product?: string;

  shipmentDate?: string;
  description?: string;

  shipper?: {
    city?: string;
    gstin?: string;
  };
  consignee?: {
    city?: string;
    country?: string;
  };

  pieces?: Array<{
    quantity?: number;
    actualWeightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    description?: string;
    division?: number;
  }>;

  gstin?: string;

  freight?: number;
  fuelSurcharge?: number;
  handlingCharges?: number;
  pickupCharges?: number;
  deliveryCharges?: number;
  otherCharges?: number;
  discount?: number;
  gstRate?: number;
};

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

    if (!can(user, "LOGISTICS_AWB_CREATE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to create an AWB.",
        403,
      );
    }

    let body: CreateAWBBody;

    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
    }

    const customerId =
      typeof body.customerId === "string" && body.customerId.trim()
        ? body.customerId.trim()
        : "WALKIN";

    const senderId =
      typeof body.senderId === "string" && body.senderId.trim()
        ? body.senderId.trim()
        : "WALKIN_SENDER";

    const receiverId =
      typeof body.receiverId === "string" && body.receiverId.trim()
        ? body.receiverId.trim()
        : "WALKIN_RECEIVER";

    const origin =
      typeof body.origin === "string" && body.origin.trim()
        ? body.origin.trim()
        : typeof body.shipper?.city === "string" && body.shipper.city.trim()
          ? body.shipper.city.trim()
          : "ORIGIN";

    const destination =
      typeof body.destination === "string" && body.destination.trim()
        ? body.destination.trim()
        : typeof body.consignee?.country === "string" &&
            body.consignee.country.trim()
          ? body.consignee.country.trim()
          : typeof body.consignee?.city === "string" &&
              body.consignee.city.trim()
            ? body.consignee.city.trim()
            : "DEST";

    const consigneeCountry =
      typeof body.consignee?.country === "string"
        ? body.consignee.country.trim()
        : "";

    const regionDivisor = getVolumetricDivisor(destination, consigneeCountry);

    const serviceId =
      typeof body.serviceId === "string" && body.serviceId.trim()
        ? body.serviceId.trim()
        : typeof body.service === "string" && body.service.trim()
          ? body.service.trim()
          : typeof body.product === "string" && body.product.trim()
            ? body.product.trim()
            : "SELF";

    const shipmentDate =
      typeof body.shipmentDate === "string" && body.shipmentDate.trim()
        ? body.shipmentDate.trim()
        : new Date().toISOString().slice(0, 10);

    const piecesInput = body.pieces ?? [];

    if (piecesInput.length === 0) {
      return errorResponse(
        "PIECES_REQUIRED",
        "At least one shipment piece is required.",
        400,
      );
    }

    const pieces: ShipmentPiece[] = piecesInput.map((piece, index) => {
      const quantity = positiveInteger(
        piece.quantity ?? 1,
        `pieces[${index}].quantity`,
      );

      const actualWeight = positiveNumber(
        piece.actualWeightKg ?? 0,
        `pieces[${index}].actualWeightKg`,
      );

      const lengthCm = positiveNumber(
        piece.lengthCm ?? 0,
        `pieces[${index}].lengthCm`,
      );

      const widthCm = positiveNumber(
        piece.widthCm ?? 0,
        `pieces[${index}].widthCm`,
      );

      const heightCm = positiveNumber(
        piece.heightCm ?? 0,
        `pieces[${index}].heightCm`,
      );

      const division =
        Number(piece.division) > 0 ? Number(piece.division) : regionDivisor;

      // (L × B × H / divisor) × quantity  — NOT quantity as divisor
      const volumetricWeight =
        calculateVolumetricWeight(lengthCm, widthCm, heightCm, division) *
        quantity;

      const chargeableWeight = calculateChargeableWeight(
        actualWeight * quantity,
        volumetricWeight,
      );

      return {
        pieceId: `piece_${index + 1}`,
        quantity,
        actualWeight,
        volumetricWeight,
        chargeableWeight,
        weightUnit: "KG" as const,
        dimensions: {
          length: lengthCm,
          width: widthCm,
          height: heightCm,
          unit: "CM" as const,
          boxCount: quantity,
        },
        description: piece.description?.trim(),
        division,
      };
    });

    const actualWeightKg = pieces.reduce(
      (total, piece) => total + piece.actualWeight * piece.quantity,
      0,
    );

    const volumetricWeightKg = pieces.reduce(
      (total, piece) => total + (piece.volumetricWeight ?? 0),
      0,
    );

    const chargeableWeightKg = calculateChargeableWeight(
      actualWeightKg,
      volumetricWeightKg,
    );

    const gstin =
      body.gstin?.trim() || body.shipper?.gstin?.trim() || undefined;

    if (gstin && !isValidGSTIN(gstin)) {
      return errorResponse("INVALID_GSTIN", "GSTIN is invalid.", 400);
    }

    const freight = positiveNumber(body.freight ?? 0, "freight");
    const fuelSurcharge = positiveNumber(
      body.fuelSurcharge ?? 0,
      "fuelSurcharge",
    );
    const handlingCharges = positiveNumber(
      body.handlingCharges ?? 0,
      "handlingCharges",
    );
    const pickupCharges = positiveNumber(
      body.pickupCharges ?? 0,
      "pickupCharges",
    );
    const deliveryCharges = positiveNumber(
      body.deliveryCharges ?? 0,
      "deliveryCharges",
    );
    const otherCharges = positiveNumber(
      body.otherCharges ?? 0,
      "otherCharges",
    );
    const discount = positiveNumber(body.discount ?? 0, "discount");

    const taxableAmount = Math.max(
      0,
      freight +
        fuelSurcharge +
        handlingCharges +
        pickupCharges +
        deliveryCharges +
        otherCharges -
        discount,
    );

    const gstRate = body.gstRate ?? 18;
    const totalTax = taxableAmount * (gstRate / 100);
    const total = taxableAmount + totalTax;

    const awb = await generateBusinessId("LOGISTICS");

    const now = new Date().toISOString();
    const trackingStageId = "BOOKED";

    const awbRef = adminDb.collection("awbs").doc(awb);
    const trackingEventRef = adminDb.collection("trackingEvents").doc();

    const awbData = {
      awb,
      customerId,
      senderId,
      receiverId,
      origin,
      destination,
      serviceId,
      serviceType: body.serviceType ?? null,
      shipmentDate,
      description: body.description?.trim() ?? null,
      pieces,
      volumetricDivisor: regionDivisor,
      actualWeightKg,
      volumetricWeightKg,
      chargeableWeightKg,
      actualWeight: actualWeightKg,
      volumetricWeight: volumetricWeightKg,
      chargeableWeight: chargeableWeightKg,
      totalPieces: pieces.reduce((n, p) => n + p.quantity, 0),
      weightUnit: "KG" as const,
      gstDetails: {
        gstin: gstin ?? null,
        taxableAmount,
        cgst: totalTax / 2,
        sgst: totalTax / 2,
        igst: 0,
        totalTax,
      },
      charges: {
        freight,
        fuelSurcharge,
        handlingCharges,
        pickupCharges,
        deliveryCharges,
        otherCharges,
        discount,
        taxableAmount,
        gst: totalTax,
        total,
        currency: "INR" as const,
      },
      currentStatus: "BOOKED" as TrackingStatus,
      latestLocation: origin,
      createdBy: user.userId,
      updatedBy: user.userId,
      createdAt: now,
      updatedAt: now,
    };

    const trackingEvent = {
      trackingEventId: trackingEventRef.id,
      awb,
      trackingStageId,
      status: "BOOKED" as TrackingStatus,
      location: origin,
      remarks: "Shipment booked.",
      eventTime: now,
      createdBy: user.userId,
      createdAt: FieldValue.serverTimestamp(),
    };

    const batch = adminDb.batch();

    batch.set(awbRef, {
      ...awbData,
      awbDocumentId: awbRef.id,
    });

    batch.set(trackingEventRef, trackingEvent);

    await batch.commit();

    await writeAuditLog({
      userId: user.userId,
      action: "AWB_CREATED",
      resourceType: "AWB",
      resourceId: awb,
      metadata: {
        customerId,
        senderId,
        receiverId,
        origin,
        destination,
        serviceId,
        chargeableWeightKg,
        volumetricDivisor: regionDivisor,
      },
    });

    return successResponse(
      {
        awb,
        status: "BOOKED",
        trackingEventId: trackingEventRef.id,
        shipment: awbData,
      },
      201,
      "AWB created successfully.",
    );
  } catch (error) {
    console.error("POST /api/logistics/awb/create:", error);

    if (
      error instanceof Error &&
      /is required|must be a valid|cannot be negative/i.test(error.message)
    ) {
      return errorResponse("VALIDATION_ERROR", error.message, 400);
    }

    return errorResponse(
      "AWB_CREATE_FAILED",
      error instanceof Error ? error.message : "Unable to create AWB.",
      500,
    );
  }
}