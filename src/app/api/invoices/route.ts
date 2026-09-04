import { NextRequest } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can, type PermissionUser } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { successResponse, errorResponse } from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

function invoicesCol() {
  return adminDb.collection(FIRESTORE_COLLECTIONS.INVOICES || "invoices");
}

function canView(user: PermissionUser) {
  return (
    can(user, "LOGISTICS_INVOICE_VIEW") ||
    can(user, "LOGISTICS_INVOICE_CREATE") ||
    can(user, "LOGISTICS_AWB_VIEW")
  );
}

function canManage(user: PermissionUser) {
  return (
    can(user, "LOGISTICS_INVOICE_CREATE") ||
    user.role === "SUPER_ADMIN" ||
    user.role === "ADMIN" ||
    user.role === "ACCOUNTANT"
  );
}

function mapInvoice(id: string, data: DocumentData) {
  return {
    id,
    invoiceId: String(data.invoiceId || id),
    invoiceNumber: String(data.invoiceNumber || data.invoiceId || id),
    type: data.type || data.sourceType || "LOGISTICS",
    sourceType: data.sourceType || null,
    customerName: String(
      data.customerName || data.consigneeName || data.customer?.name || "Customer",
    ),
    customerPhone: data.customerPhone
      ? String(data.customerPhone)
      : data.consigneePhone
        ? String(data.consigneePhone)
        : undefined,
    awb: data.awb ? String(data.awb) : "",
    accountCode: data.accountCode ? String(data.accountCode) : "",
    orderId: data.orderId ? String(data.orderId) : null,
    total: Number(data.total ?? data.totalAmount ?? data.charges?.total ?? 0),
    status: String(data.status || "ISSUED").toUpperCase(),
    issueDate: String(data.issueDate || data.createdAt || ""),
    dueDate: data.dueDate ? String(data.dueDate) : undefined,
    downloadUrl: data.downloadUrl ? String(data.downloadUrl) : undefined,
    pdfUrl: data.pdfUrl || data.downloadUrl || undefined,
    filePath: data.filePath ? String(data.filePath) : undefined,
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || data.createdAt || ""),
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
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
    if (!canView(user)) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view invoices.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get("invoiceId")?.trim();
    const awb = searchParams.get("awb")?.trim();
    const status = searchParams.get("status")?.trim();
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") || 100), 1),
      300,
    );

    if (invoiceId) {
      let snap = await invoicesCol().doc(invoiceId).get();
      if (!snap.exists) {
        const q = await invoicesCol()
          .where("invoiceId", "==", invoiceId)
          .limit(1)
          .get();
        if (q.empty) {
          const q2 = await invoicesCol()
            .where("invoiceNumber", "==", invoiceId)
            .limit(1)
            .get();
          if (q2.empty) {
            return errorResponse("NOT_FOUND", "Invoice not found.", 404);
          }
          snap = q2.docs[0]!;
        } else {
          snap = q.docs[0]!;
        }
      }
      return successResponse({
        invoice: mapInvoice(snap.id, snap.data() || {}),
      });
    }

    const snap = await invoicesCol().limit(limit).get();
    let items = snap.docs.map((doc) => mapInvoice(doc.id, doc.data()));

    if (awb) {
      items = items.filter(
        (i) => i.awb.toLowerCase() === awb.toLowerCase(),
      );
    }
    if (status && status !== "ALL") {
      items = items.filter(
        (i) => i.status.toUpperCase() === status.toUpperCase(),
      );
    }

    items.sort((a, b) => {
      const ta = new Date(a.issueDate || a.createdAt).getTime();
      const tb = new Date(b.issueDate || b.createdAt).getTime();
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    });

    return successResponse({ invoices: items, items });
  } catch (error) {
    console.error("GET /api/invoices:", error);
    return errorResponse(
      "INVOICES_LIST_FAILED",
      "Failed to load invoices.",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }
    if (!canManage(user)) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update invoices.",
        403,
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON body.", 400);
    }

    const id = String(body.invoiceId || body.id || "").trim();
    const status = String(body.status || "")
      .trim()
      .toUpperCase();

    if (!id) {
      return errorResponse("ID_REQUIRED", "invoiceId is required.", 400);
    }
    if (
      !["DRAFT", "ISSUED", "PAID", "CANCELLED", "REFUNDED", "OVERDUE"].includes(
        status,
      )
    ) {
      return errorResponse("INVALID_STATUS", "Invalid invoice status.", 400);
    }

    let ref = invoicesCol().doc(id);
    let existing = await ref.get();

    if (!existing.exists) {
      const q = await invoicesCol().where("invoiceId", "==", id).limit(1).get();
      if (q.empty) {
        return errorResponse("NOT_FOUND", "Invoice not found.", 404);
      }
      ref = q.docs[0]!.ref;
    }

    await ref.set(
      {
        status,
        updatedAt: new Date().toISOString(),
        ...(status === "PAID" ? { paidAt: new Date().toISOString() } : {}),
      },
      { merge: true },
    );

    await writeAuditLog({
      userId: user.userId,
      action: "INVOICE_STATUS_UPDATE",
      module: "LOGISTICS",
      resourceType: "INVOICE",
      resourceId: ref.id,
      metadata: { status },
    });

    const updated = await ref.get();
    return successResponse({
      invoice: mapInvoice(updated.id, updated.data() || {}),
    });
  } catch (error) {
    console.error("PATCH /api/invoices:", error);
    return errorResponse(
      "INVOICE_UPDATE_FAILED",
      "Failed to update invoice.",
      500,
    );
  }
}