import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

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

    if (!can(user, "LOGISTICS_AWB_VIEW") && !can(user, "FOOD_ORDER_VIEW")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view the dashboard.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const moduleParam = (searchParams.get("module") || "LOGISTICS").toUpperCase();

    let logistics = null;
    let food = null;

    if (can(user, "LOGISTICS_AWB_VIEW") && moduleParam !== "FOOD") {
      const snap = await adminDb
        .collection(FIRESTORE_COLLECTIONS.AWBS)
        .limit(500)
        .get();

      const byStatus: Record<string, number> = {};
      let revenue = 0;
      const recent: Array<Record<string, unknown>> = [];
      const monthMap = new Map<string, { shipments: number; revenue: number }>();

      snap.docs.forEach((doc) => {
        const data = doc.data();
        const status = String(data.currentStatus || "BOOKED").toUpperCase();
        byStatus[status] = (byStatus[status] || 0) + 1;

        const amount = Number(data.charges?.total ?? data.total ?? 0);
        revenue += Number.isFinite(amount) ? amount : 0;

        const createdAt = String(data.createdAt || data.shipmentDate || "");
        const ms = createdAt ? new Date(createdAt).getTime() : NaN;
        if (Number.isFinite(ms)) {
          const d = new Date(ms);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const prev = monthMap.get(key) || { shipments: 0, revenue: 0 };
          prev.shipments += 1;
          prev.revenue += Number.isFinite(amount) ? amount : 0;
          monthMap.set(key, prev);
        }

        recent.push({
          id: doc.id,
          awb: data.awb || doc.id,
          currentStatus: status,
          origin: data.origin || "",
          destination: data.destination || "",
          shipmentDate: data.shipmentDate || "",
          createdAt,
          total: amount,
        });
      });

      recent.sort((a, b) =>
        String(b.createdAt).localeCompare(String(a.createdAt)),
      );

      const now = new Date();
      const monthly = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const entry = monthMap.get(key) || { shipments: 0, revenue: 0 };
        monthly.push({
          key,
          label: d.toLocaleString("en-IN", { month: "short" }),
          shipments: entry.shipments,
          revenue: Math.round(entry.revenue),
        });
      }

      logistics = {
        totalAwbs: recent.length,
        booked: (byStatus.BOOKED || 0) + (byStatus.PICKUP_REQUESTED || 0),
        inTransit:
          (byStatus.PICKED_UP || 0) +
          (byStatus.AT_ORIGIN || 0) +
          (byStatus.IN_TRANSIT || 0) +
          (byStatus.ARRIVED_DESTINATION || 0) +
          (byStatus.OUT_FOR_DELIVERY || 0),
        delivered: byStatus.DELIVERED || 0,
        exceptions:
          (byStatus.ON_HOLD || 0) +
          (byStatus.EXCEPTION || 0) +
          (byStatus.CANCELLED || 0),
        revenue: Math.round(revenue),
        byStatus,
        recent: recent.slice(0, 20),
        monthly,
      };
    }

    if (can(user, "FOOD_ORDER_VIEW") && moduleParam !== "LOGISTICS") {
      const snap = await adminDb
        .collection(FIRESTORE_COLLECTIONS.FOOD_ORDERS)
        .limit(300)
        .get();

      let paid = 0;
      let processing = 0;
      let delivered = 0;
      let sales = 0;
      const recent: Array<Record<string, unknown>> = [];

      snap.docs.forEach((doc) => {
        const data = doc.data();
        const status = String(data.status || "PENDING_PAYMENT").toUpperCase();
        const total = Number(data.total || 0);
        if (
          ["PAID", "CONFIRMED", "PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
            status,
          )
        )
          paid += 1;
        if (["PROCESSING", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(status))
          processing += 1;
        if (status === "DELIVERED") delivered += 1;
        if (status !== "CANCELLED" && status !== "REFUNDED") sales += total;

        recent.push({
          id: doc.id,
          orderId: data.orderId || doc.id,
          customerName: data.customer?.name || data.customerName || "Customer",
          total,
          status,
          createdAt: data.createdAt || "",
        });
      });

      food = {
        totalOrders: recent.length,
        paid,
        processing,
        delivered,
        sales: Math.round(sales),
        recent: recent.slice(0, 20),
      };
    }

    return successResponse({ logistics, food, generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("GET /api/admin/dashboard", error);
    return errorResponse("DASHBOARD_FAILED", "Unable to load dashboard data.", 500);
  }
}