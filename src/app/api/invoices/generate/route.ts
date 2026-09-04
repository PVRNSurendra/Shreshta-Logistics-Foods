// import { NextRequest } from "next/server";

// import {
//   adminDb,
//   adminStorage,
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
//   generateInvoicePdf,
// } from "@/lib/invoice-pdf";

// import {
//   generateInvoiceNumber,
// } from "@/lib/invoice-number";

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
//         "LOGISTICS_INVOICE_CREATE",
//       ) &&
//       !can(
//         user,
//         "FOOD_INVOICE_CREATE",
//       )
//     ) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to generate invoices.",
//         403,
//       );
//     }

//     const body =
//       await request.json();

//     const orderId =
//       body.orderId?.trim();

//     const awb =
//       body.awb?.trim();

//     if (
//       !orderId &&
//       !awb
//     ) {
//       return errorResponse(
//         "SOURCE_REQUIRED",
//         "orderId or awb is required.",
//         400,
//       );
//     }

//     let sourceData: any;
//     let sourceType:
//       | "FOOD_ORDER"
//       | "AWB";

//     if (orderId) {
//       const ref =
//         adminDb
//           .collection(
//             "foodOrders",
//           )
//           .doc(orderId);

//       const snapshot =
//         await ref.get();

//       if (!snapshot.exists) {
//         return errorResponse(
//           "ORDER_NOT_FOUND",
//           "Food order was not found.",
//           404,
//         );
//       }

//       sourceData =
//         snapshot.data();

//       sourceType =
//         "FOOD_ORDER";
//     } else {
//       const query =
//         await adminDb
//           .collection("awbs")
//           .where(
//             "awb",
//             "==",
//             awb,
//           )
//           .limit(1)
//           .get();

//       if (query.empty) {
//         return errorResponse(
//           "AWB_NOT_FOUND",
//           "AWB was not found.",
//           404,
//         );
//       }

//       sourceData =
//         query.docs[0].data();

//       sourceType =
//         "AWB";
//     }

//     const invoiceNumber =
//       await generateInvoiceNumber();

//     const items =
//       sourceType ===
//       "FOOD_ORDER"
//         ? (
//             sourceData.items ??
//             []
//           ).map(
//             (item: any) => ({
//               name:
//                 item.productName,

//               variant:
//                 item.variantLabel,

//               quantity:
//                 Number(
//                   item.quantity,
//                 ),

//               unitPrice:
//                 Number(
//                   item.unitPrice,
//                 ),

//               total:
//                 Number(
//                   item.lineTotal,
//                 ),
//             }),
//           )
//         : [
//             {
//               name:
//                 `Logistics shipment ${sourceData.awb}`,

//               variant:
//                 sourceData.serviceType,

//               quantity: 1,

//               unitPrice:
//                 Number(
//                   sourceData.charges
//                     ?.freight ??
//                     0,
//                 ),

//               total:
//                 Number(
//                   sourceData.charges
//                     ?.total ??
//                     0,
//                 ),
//             },
//           ];

//     const pdfBytes =
//       await generateInvoicePdf(
//         {
//           invoiceNumber,

//           orderId:
//             sourceType ===
//             "FOOD_ORDER"
//               ? sourceData.orderId
//               : undefined,

//           awb:
//             sourceType ===
//             "AWB"
//               ? sourceData.awb
//               : undefined,

//           customerName:
//             sourceType ===
//             "FOOD_ORDER"
//               ? sourceData
//                   .customer
//                   ?.name ??
//                 "Customer"
//               : sourceData
//                   .customerName ??
//                 "Customer",

//           customerPhone:
//             sourceType ===
//             "FOOD_ORDER"
//               ? sourceData
//                   .customer
//                   ?.phone
//               : undefined,

//           customerEmail:
//             sourceType ===
//             "FOOD_ORDER"
//               ? sourceData
//                   .customer
//                   ?.email
//               : undefined,

//           address:
//             sourceData
//               .shippingAddress
//               ? JSON.stringify(
//                   sourceData
//                     .shippingAddress,
//                 )
//               : undefined,

//           items,

//           subtotal:
//             Number(
//               sourceData.subtotal ??
//                 sourceData.charges
//                   ?.taxableAmount ??
//                 0,
//             ),

//           discount:
//             Number(
//               sourceData.discount ??
//                 sourceData.charges
//                   ?.discount ??
//                 0,
//             ),

//           tax:
//             Number(
//               sourceData.tax ??
//                 sourceData.charges
//                   ?.gst ??
//                 0,
//             ),

//           deliveryFee:
//             Number(
//               sourceData.deliveryFee ??
//                 sourceData.charges
//                   ?.deliveryCharges ??
//                 0,
//             ),

//           total:
//             Number(
//               sourceData.total ??
//                 sourceData.charges
//                   ?.total ??
//                 0,
//             ),

//           createdAt:
//             new Date().toISOString(),
//         },
//       );

//     const bucket =
//       adminStorage.bucket();

//     const filePath =
//       `invoices/${invoiceNumber}.pdf`;

//     const file =
//       bucket.file(
//         filePath,
//       );

//     await file.save(
//       Buffer.from(
//         pdfBytes,
//       ),
//       {
//         metadata: {
//           contentType:
//             "application/pdf",

//           metadata: {
//             invoiceNumber,
//           },
//         },
//       },
//     );

//     const [signedUrl] =
//       await file.getSignedUrl({
//         action: "read",
//         expires:
//           Date.now() +
//           1000 *
//             60 *
//             60 *
//             24 *
//             7,
//       });

//     const invoiceRef =
//       adminDb
//         .collection(
//           "invoices",
//         )
//         .doc();

//     const invoice = {
//       invoiceId:
//         invoiceRef.id,

//       invoiceNumber,

//       sourceType,

//       orderId:
//         sourceType ===
//         "FOOD_ORDER"
//           ? sourceData.orderId
//           : null,

//       awb:
//         sourceType ===
//         "AWB"
//           ? sourceData.awb
//           : null,

//       filePath,

//       downloadUrl:
//         signedUrl,

//       total:
//         Number(
//           sourceData.total ??
//             sourceData.charges
//               ?.total ??
//             0,
//         ),

//       createdBy:
//         user.userId,

//       createdAt:
//         new Date().toISOString(),
//     };

//     await invoiceRef.set(
//       invoice,
//     );

//     await writeAuditLog({
//       userId:
//         user.userId,

//       action:
//         "INVOICE_GENERATED",

//       resourceType:
//         "INVOICE",

//       resourceId:
//         invoiceRef.id,

//       metadata: {
//         invoiceNumber,
//         sourceType,
//         orderId:
//           invoice.orderId,
//         awb:
//           invoice.awb,
//       },
//     });

//     return successResponse(
//       {
//         invoice,
//       },
//       201,
//       "Invoice generated successfully.",
//     );
//   } catch (error) {
//     console.error(
//       "POST /api/invoices/generate",
//       error,
//     );

//     return errorResponse(
//       "INVOICE_GENERATION_FAILED",
//       error instanceof Error
//         ? error.message
//         : "Unable to generate invoice.",
//       500,
//     );
//   }
// }

import { NextRequest } from "next/server";

import { adminDb, adminStorage } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { successResponse, errorResponse } from "@/lib/api-response";
import {
  generateProformaInvoicePdf,
  type ProformaInvoiceData,
} from "@/lib/pdf/proformaInvoiceGenerator";

async function generateInvoiceNumber(): Promise<string> {
  const day = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ref = adminDb.collection("settings").doc(`invoiceCounter-${day}`);
  const next = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const value = (snap.exists ? Number(snap.data()?.value || 0) : 0) + 1;
    tx.set(
      ref,
      { value, updatedAt: new Date().toISOString() },
      { merge: true },
    );
    return value;
  });
  return `INV-${day}-${String(next).padStart(4, "0")}`;
}

function str(v: unknown, fallback = ""): string {
  if (v == null) return fallback;
  return String(v).trim() || fallback;
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

    if (
      !can(user, "LOGISTICS_INVOICE_CREATE") &&
      !can(user, "LOGISTICS_AWB_CREATE")
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to generate invoices.",
        403,
      );
    }

    let body: { orderId?: string; awb?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON body.", 400);
    }

    const orderId = body.orderId?.trim();
    const awb = body.awb?.trim();

    if (!orderId && !awb) {
      return errorResponse(
        "SOURCE_REQUIRED",
        "orderId or awb is required.",
        400,
      );
    }

    let sourceData: any;
    let sourceType: "FOOD_ORDER" | "AWB";

    if (orderId) {
      const snapshot = await adminDb
        .collection("foodOrders")
        .doc(orderId)
        .get();
      if (!snapshot.exists) {
        return errorResponse("ORDER_NOT_FOUND", "Food order was not found.", 404);
      }
      sourceData = snapshot.data();
      sourceType = "FOOD_ORDER";
    } else {
      const query = await adminDb
        .collection("awbs")
        .where("awb", "==", awb)
        .limit(1)
        .get();
      if (query.empty) {
        return errorResponse("AWB_NOT_FOUND", "AWB was not found.", 404);
      }
      sourceData = query.docs[0]!.data();
      sourceType = "AWB";
    }

    const invoiceNumber = await generateInvoiceNumber();
    const invoiceDate = new Date().toLocaleDateString("en-GB");

    let pdfData: ProformaInvoiceData;
    let total = 0;
    let customerName = "Customer";
    let customerPhone: string | undefined;
    let accountCode: string | undefined;

    if (sourceType === "AWB") {
      total = Number(
        sourceData.total ??
          sourceData.charges?.total ??
          sourceData.declaredValue ??
          0,
      );
      customerName = str(
        sourceData.consignee?.name ||
          sourceData.receiverName ||
          sourceData.customerName,
        "Customer",
      );
      customerPhone =
        sourceData.consignee?.phone ||
        sourceData.receiverPhone ||
        undefined;
      accountCode =
        sourceData.accountCode ||
        sourceData.coLoaderCode ||
        undefined;

      const itemsFromAwb = Array.isArray(sourceData.items)
        ? sourceData.items
        : null;

      pdfData = {
        awb: str(sourceData.awb),
        invoiceNo: invoiceNumber,
        invoiceDate,
        accountCode,
        exporterRef: sourceData.preCarriageBy || "FDX",
        shipperName: str(
          sourceData.shipper?.name || sourceData.senderName,
          "Shipper",
        ),
        shipperAddress: str(
          sourceData.shipper?.addressLine1 || sourceData.senderAddress,
        ),
        shipperPhone: sourceData.shipper?.phone || sourceData.senderPhone,
        shipperTaxId: sourceData.shipper?.taxId || sourceData.senderTaxId,
        shipperCity: sourceData.shipper?.city || sourceData.senderCity,
        shipperState: sourceData.shipper?.state || sourceData.senderState,
        shipperPincode:
          sourceData.shipper?.pincode || sourceData.senderPincode,
        shipperCountry:
          sourceData.shipper?.country || sourceData.senderCountry || "INDIA",
        consigneeName: customerName,
        consigneeAddress: str(
          sourceData.consignee?.addressLine1 || sourceData.receiverAddress,
        ),
        consigneeCity:
          sourceData.consignee?.city || sourceData.receiverCity,
        consigneeState:
          sourceData.consignee?.state || sourceData.receiverState,
        consigneePincode:
          sourceData.consignee?.pincode || sourceData.receiverPincode,
        consigneeCountry:
          sourceData.consignee?.country ||
          sourceData.receiverCountry ||
          "U.S.A.",
        consigneePhone: customerPhone,
        preCarriageBy: sourceData.preCarriageBy || "FDX",
        placeOfLoading: sourceData.origin || sourceData.placeOfLoading || "GUNTUR",
        portOfDischarge: sourceData.portOfDischarge,
        finalDestination:
          sourceData.destination ||
          sourceData.consignee?.country ||
          "U.S.A.",
        countryOfOrigin: "INDIA",
        countryOfDestination:
          sourceData.consignee?.country ||
          sourceData.receiverCountry ||
          "U.S.A.",
        termOfDelivery: sourceData.termOfDelivery || "CIF",
        otherReference:
          sourceData.otherReference || "UNSOLICITED GIFT - NOT FOR SALE",
        totalPieces: Number(sourceData.pieces || 1),
        packageType: sourceData.packageType || "PKT",
        actualWeight: Number(sourceData.actualWeight || 0),
        chargeableWeight: Number(sourceData.chargeableWeight || 0),
        declaredValue: Number(sourceData.declaredValue || total),
        items: itemsFromAwb
          ? itemsFromAwb.map((it: any, idx: number) => ({
              description: str(it.description || it.name, `Item ${idx + 1}`),
              shopName: it.shopName,
              shopAddress: it.shopAddress,
              hsCode: str(it.hsCode, "0000"),
              quantity: Number(it.quantity || 1),
              weight: it.weight != null ? Number(it.weight) : undefined,
              unitRate: Number(it.unitRate || it.rate || 0),
              amount: Number(it.amount || it.total || 0),
              boxNo: it.boxNo != null ? Number(it.boxNo) : 1,
            }))
          : [
              {
                description: `Freight – ${str(sourceData.serviceType || sourceData.service, "Service")}`,
                hsCode: "0000",
                quantity: 1,
                unitRate: total,
                amount: total,
                boxNo: 1,
              },
            ],
        totalAmount: total,
      };
    } else {
      // FOOD_ORDER
      total = Number(sourceData.total || 0);
      customerName = str(sourceData.customer?.name, "Customer");
      customerPhone = sourceData.customer?.phone;

      pdfData = {
        awb: str(sourceData.orderId || orderId),
        invoiceNo: invoiceNumber,
        invoiceDate,
        shipperName: "Sreshta Foods",
        shipperAddress: "",
        shipperCountry: "INDIA",
        consigneeName: customerName,
        consigneeAddress: str(
          sourceData.shippingAddress
            ? JSON.stringify(sourceData.shippingAddress)
            : "",
        ),
        consigneePhone: customerPhone,
        countryOfOrigin: "INDIA",
        items: (sourceData.items ?? []).map((item: any, idx: number) => ({
          description: str(item.productName || item.name, `Item ${idx + 1}`),
          hsCode: "0000",
          quantity: Number(item.quantity || 1),
          unitRate: Number(item.unitPrice || 0),
          amount: Number(item.lineTotal || item.total || 0),
          boxNo: 1,
        })),
        totalAmount: total,
        totalPieces: 1,
      };
    }

    const pdfBytes = await generateProformaInvoicePdf(pdfData);

    let downloadUrl: string | undefined;
    let filePath: string | undefined;

    try {
      const bucket = adminStorage.bucket();
      filePath = `invoices/${invoiceNumber}.pdf`;
      const file = bucket.file(filePath);
      await file.save(Buffer.from(pdfBytes), {
        metadata: {
          contentType: "application/pdf",
          metadata: { invoiceNumber },
        },
      });
      const [signedUrl] = await file.getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      });
      downloadUrl = signedUrl;
    } catch (storageError) {
      console.warn(
        "Invoice PDF storage skipped:",
        storageError instanceof Error ? storageError.message : storageError,
      );
    }

    const invoiceRef = adminDb.collection("invoices").doc();
    const now = new Date().toISOString();

    const invoice = {
      invoiceId: invoiceRef.id,
      invoiceNumber,
      type: sourceType === "FOOD_ORDER" ? "FOOD" : "LOGISTICS",
      sourceType,
      orderId: sourceType === "FOOD_ORDER" ? sourceData.orderId || orderId : null,
      awb: sourceType === "AWB" ? sourceData.awb : null,
      accountCode: accountCode || null,
      customerName,
      customerPhone: customerPhone || null,
      total,
      status: "ISSUED",
      issueDate: now,
      filePath: filePath || null,
      downloadUrl: downloadUrl || null,
      createdBy: user.userId,
      createdAt: now,
      updatedAt: now,
    };

    await invoiceRef.set(invoice);

    await writeAuditLog({
      userId: user.userId,
      action: "INVOICE_GENERATED",
      module: "LOGISTICS",
      resourceType: "INVOICE",
      resourceId: invoiceRef.id,
      metadata: {
        invoiceNumber,
        sourceType,
        orderId: invoice.orderId,
        awb: invoice.awb,
      },
    });

    return successResponse(
      { invoice },
      201,
      "Invoice generated successfully.",
    );
  } catch (error) {
    console.error("POST /api/invoices/generate:", error);
    return errorResponse(
      "INVOICE_GENERATION_FAILED",
      error instanceof Error
        ? error.message
        : "Unable to generate invoice.",
      500,
    );
  }
}