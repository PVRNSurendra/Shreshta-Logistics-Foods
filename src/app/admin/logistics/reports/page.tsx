// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useAuth } from "@/context/AuthContext";

// type ReportKey =
//   | "AWB Summary"
//   | "Delivery Performance"
//   | "Revenue Report"
//   | "Exception Report"
//   | "Day End Report";

// type ReportDef = {
//   name: ReportKey;
//   description: string;
// };

// type MetricRow = {
//   label: string;
//   value: string;
// };

// type ApiAwbsResponse =
//   | {
//       success: true;
//       data:
//         | Record<string, unknown>[]
//         | {
//             results?: Record<string, unknown>[];
//             data?: Record<string, unknown>[];
//           };
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// const REPORTS: ReportDef[] = [
//   {
//     name: "AWB Summary",
//     description: "Shipment volume and status summary",
//   },
//   {
//     name: "Delivery Performance",
//     description: "Delivered versus pending shipments",
//   },
//   {
//     name: "Revenue Report",
//     description: "Revenue and billing summary",
//   },
//   {
//     name: "Exception Report",
//     description: "Shipments requiring attention",
//   },
//   {
//     name: "Day End Report",
//     description: "Center operational completion",
//   },
// ];

// function formatCurrency(amount: number): string {
//   if (!Number.isFinite(amount)) {
//     return "₹0";
//   }

//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

// function getStatus(awb: Record<string, unknown>): string {
//   return String(awb.currentStatus || awb.status || "UNKNOWN");
// }

// function getCenter(awb: Record<string, unknown>): string {
//   return String(
//     awb.origin || awb.originName || awb.serviceCenter || "Unknown",
//   );
// }

// function getRevenue(awb: Record<string, unknown>): number {
//   const charges =
//     (awb.charges as Record<string, unknown> | undefined) || undefined;
//   return Number(charges?.total || awb.total || 0);
// }

// function getShipmentDate(awb: Record<string, unknown>): string {
//   return String(awb.shipmentDate || awb.createdAt || "");
// }

// function inDateRange(
//   value: string,
//   fromDate: string,
//   toDate: string,
// ): boolean {
//   if (!value) {
//     return true;
//   }

//   const day = value.slice(0, 10);

//   if (fromDate && day < fromDate) {
//     return false;
//   }

//   if (toDate && day > toDate) {
//     return false;
//   }

//   return true;
// }

// function buildReport(
//   report: ReportKey,
//   awbs: Record<string, unknown>[],
// ): MetricRow[] {
//   const total = awbs.length;

//   const byStatus = awbs.reduce<Record<string, number>>((acc, awb) => {
//     const status = getStatus(awb);
//     acc[status] = (acc[status] || 0) + 1;
//     return acc;
//   }, {});

//   const delivered = byStatus.DELIVERED || 0;
//   const exceptions =
//     (byStatus.EXCEPTION || 0) + (byStatus.ON_HOLD || 0);
//   const cancelled = byStatus.CANCELLED || 0;
//   const inTransit = byStatus.IN_TRANSIT || 0;
//   const pending = total - delivered - cancelled;

//   const revenue = awbs.reduce(
//     (sum, awb) => sum + getRevenue(awb),
//     0,
//   );

//   const centers = Array.from(
//     new Set(awbs.map((awb) => getCenter(awb))),
//   ).sort();

//   if (report === "AWB Summary") {
//     return [
//       { label: "Total AWBs", value: String(total) },
//       { label: "Delivered", value: String(delivered) },
//       { label: "In Transit", value: String(inTransit) },
//       { label: "Exceptions / On Hold", value: String(exceptions) },
//       { label: "Cancelled", value: String(cancelled) },
//       {
//         label: "Centers Covered",
//         value: String(centers.length),
//       },
//     ];
//   }

//   if (report === "Delivery Performance") {
//     const rate =
//       total > 0 ? ((delivered / total) * 100).toFixed(1) : "0.0";

//     return [
//       { label: "Total Shipments", value: String(total) },
//       { label: "Delivered", value: String(delivered) },
//       { label: "Pending", value: String(Math.max(0, pending)) },
//       { label: "Delivery Rate", value: `${rate}%` },
//       { label: "In Transit", value: String(inTransit) },
//     ];
//   }

//   if (report === "Revenue Report") {
//     const avg = total > 0 ? revenue / total : 0;

//     return [
//       { label: "Total Revenue", value: formatCurrency(revenue) },
//       { label: "Shipments Billed", value: String(total) },
//       {
//         label: "Average Revenue / AWB",
//         value: formatCurrency(avg),
//       },
//       {
//         label: "Delivered Revenue Share",
//         value: formatCurrency(
//           awbs
//             .filter((awb) => getStatus(awb) === "DELIVERED")
//             .reduce((sum, awb) => sum + getRevenue(awb), 0),
//         ),
//       },
//     ];
//   }

//   if (report === "Exception Report") {
//     const exceptionAwbs = awbs.filter((awb) => {
//       const status = getStatus(awb);
//       return status === "EXCEPTION" || status === "ON_HOLD";
//     });

//     return [
//       {
//         label: "Exception / On Hold Count",
//         value: String(exceptionAwbs.length),
//       },
//       {
//         label: "EXCEPTION",
//         value: String(byStatus.EXCEPTION || 0),
//       },
//       {
//         label: "ON_HOLD",
//         value: String(byStatus.ON_HOLD || 0),
//       },
//       {
//         label: "Sample AWB",
//         value:
//           exceptionAwbs[0]
//             ? String(exceptionAwbs[0].awb || "—")
//             : "None",
//       },
//     ];
//   }

//   // Day End Report
//   const readyCenters = centers.filter((center) => {
//     const centerAwbs = awbs.filter(
//       (awb) => getCenter(awb) === center,
//     );
//     return centerAwbs.every((awb) => {
//       const status = getStatus(awb);
//       return status === "DELIVERED" || status === "CANCELLED";
//     });
//   });

//   return [
//     { label: "Centers", value: String(centers.length) },
//     {
//       label: "Centers Ready",
//       value: String(readyCenters.length),
//     },
//     {
//       label: "Centers Pending",
//       value: String(centers.length - readyCenters.length),
//     },
//     { label: "Total AWBs", value: String(total) },
//     { label: "Delivered", value: String(delivered) },
//     { label: "Revenue", value: formatCurrency(revenue) },
//   ];
// }

// export default function ReportsPage() {
//   const { user, loading: authLoading } = useAuth();

//   const [report, setReport] = useState<ReportKey>("AWB Summary");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [center, setCenter] = useState("All Centers");
//   const [awbs, setAwbs] = useState<Record<string, unknown>[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [generated, setGenerated] = useState(false);
//   const [metrics, setMetrics] = useState<MetricRow[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [reloadKey, setReloadKey] = useState(0);

//   useEffect(() => {
//     if (authLoading) {
//       return;
//     }

//     let cancelled = false;

//     async function loadAwbs() {
//       try {
//         setLoading(true);
//         setError(null);

//         if (!user) {
//           throw new Error(
//             "Authentication is required to generate reports.",
//           );
//         }

//         const token = await user.getIdToken();

//         const res = await fetch(
//           "/api/logistics/awb/search?limit=100",
//           {
//             method: "GET",
//             headers: {
//               Accept: "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             cache: "no-store",
//           },
//         );

//         const json = (await res.json()) as ApiAwbsResponse;

//         if (!res.ok || !json.success) {
//           throw new Error(
//             !json.success
//               ? json.error.message
//               : "Failed to load report source data.",
//           );
//         }

//         const payload = json.data;
//         const list = Array.isArray(payload)
//           ? payload
//           : Array.isArray(payload.results)
//             ? payload.results
//             : Array.isArray(payload.data)
//               ? payload.data
//               : [];

//         if (!cancelled) {
//           setAwbs(list);
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(
//             e instanceof Error
//               ? e.message
//               : "Failed to load reports data.",
//           );
//           setAwbs([]);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadAwbs();

//     return () => {
//       cancelled = true;
//     };
//   }, [authLoading, user, reloadKey]);

//   const centers = useMemo(() => {
//     const unique = Array.from(
//       new Set(awbs.map((awb) => getCenter(awb))),
//     ).sort();

//     return ["All Centers", ...unique];
//   }, [awbs]);

//   const filteredAwbs = useMemo(() => {
//     return awbs.filter((awb) => {
//       const matchesCenter =
//         center === "All Centers" || getCenter(awb) === center;

//       const matchesDate = inDateRange(
//         getShipmentDate(awb),
//         fromDate,
//         toDate,
//       );

//       return matchesCenter && matchesDate;
//     });
//   }, [awbs, center, fromDate, toDate]);

//   function generateReport() {
//     setGenerated(true);
//     setMetrics(buildReport(report, filteredAwbs));
//   }

//   function exportCsv() {
//     if (metrics.length === 0) {
//       return;
//     }

//     const lines = [
//       "Metric,Value",
//       ...metrics.map(
//         (row) =>
//           `"${row.label.replace(/"/g, '""')}","${row.value.replace(/"/g, '""')}"`,
//       ),
//     ];

//     const blob = new Blob([lines.join("\n")], {
//       type: "text/csv;charset=utf-8;",
//     });

//     const url = URL.createObjectURL(blob);
//     const anchor = document.createElement("a");
//     anchor.href = url;
//     anchor.download = `${report
//       .toLowerCase()
//       .replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
//     anchor.click();
//     URL.revokeObjectURL(url);
//   }

//   return (
//     <div className="mx-auto max-w-[1200px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>

//           <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Reports
//           </h2>

//           <p className="mt-1 text-sm text-slate-500">
//             Generate operational reports.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => setReloadKey((value) => value + 1)}
//           className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
//         >
//           Refresh Data
//         </button>
//       </div>

//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       <div className="grid gap-4 md:grid-cols-2">
//         {REPORTS.map((item) => (
//           <button
//             key={item.name}
//             type="button"
//             onClick={() => {
//               setReport(item.name);
//               setGenerated(false);
//             }}
//             className={`rounded-xl border bg-white p-5 text-left shadow-sm transition ${
//               report === item.name
//                 ? "border-[#087f87] ring-2 ring-cyan-100"
//                 : "border-slate-200"
//             }`}
//           >
//             <h3 className="font-bold text-[#06284c]">
//               {item.name}
//             </h3>

//             <p className="mt-1 text-sm text-slate-500">
//               {item.description}
//             </p>
//           </button>
//         ))}
//       </div>

//       <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//         <h3 className="font-bold text-[#06284c]">
//           Report Parameters
//         </h3>

//         <div className="mt-5 grid gap-4 md:grid-cols-3">
//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               From Date
//             </label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//             />
//           </div>

//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               To Date
//             </label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//             />
//           </div>

//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               Service Center
//             </label>

//             <select
//               value={center}
//               onChange={(e) => setCenter(e.target.value)}
//               className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//             >
//               {centers.map((item) => (
//                 <option key={item} value={item}>
//                   {item}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="mt-5 flex justify-end gap-3">
//           <button
//             type="button"
//             onClick={exportCsv}
//             disabled={!generated || metrics.length === 0}
//             className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
//           >
//             Export CSV
//           </button>

//           <button
//             type="button"
//             onClick={generateReport}
//             disabled={loading || authLoading}
//             className="rounded-lg bg-[#087f87] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
//           >
//             {loading ? "Loading..." : "Generate Report"}
//           </button>
//         </div>
//       </section>

//       {generated && (
//         <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 px-5 py-4">
//             <h3 className="font-bold text-[#06284c]">
//               {report}
//             </h3>
//             <p className="mt-1 text-xs text-slate-500">
//               Based on {filteredAwbs.length} shipment
//               {filteredAwbs.length === 1 ? "" : "s"}
//               {center !== "All Centers" ? ` · ${center}` : ""}
//               {fromDate || toDate
//                 ? ` · ${fromDate || "…"} to ${toDate || "…"}`
//                 : ""}
//             </p>
//           </div>

//           <div className="divide-y divide-slate-100">
//             {metrics.map((row) => (
//               <div
//                 key={row.label}
//                 className="flex items-center justify-between px-5 py-4 text-sm"
//               >
//                 <span className="text-slate-600">{row.label}</span>
//                 <span className="font-bold text-[#06284c]">
//                   {row.value}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </section>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useCallback, useEffect, useMemo, useState } from "react";
// import { useAuth } from "@/context/AuthContext";

// type ReportKey =
//   | "AWB Summary"
//   | "Delivery Performance"
//   | "Revenue Report"
//   | "Exception Report"
//   | "Day End Report";

// type ReportDef = {
//   name: ReportKey;
//   description: string;
// };

// type MetricRow = {
//   label: string;
//   value: string;
// };

// type ApiAwbsResponse =
//   | {
//       success: true;
//       data:
//         | Record<string, unknown>[]
//         | {
//             results?: Record<string, unknown>[];
//             items?: Record<string, unknown>[];
//             awbs?: Record<string, unknown>[];
//             data?: Record<string, unknown>[];
//             count?: number;
//           };
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// const REPORTS: ReportDef[] = [
//   {
//     name: "AWB Summary",
//     description: "Shipment volume and status summary",
//   },
//   {
//     name: "Delivery Performance",
//     description: "Delivered versus pending shipments",
//   },
//   {
//     name: "Revenue Report",
//     description: "Revenue and billing summary",
//   },
//   {
//     name: "Exception Report",
//     description: "Shipments requiring attention",
//   },
//   {
//     name: "Day End Report",
//     description: "Center operational completion",
//   },
// ];

// function formatCurrency(amount: number): string {
//   if (!Number.isFinite(amount)) {
//     return "₹0";
//   }

//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

// function getStatus(awb: Record<string, unknown>): string {
//   return String(awb.currentStatus || awb.status || "UNKNOWN").toUpperCase();
// }

// function getCenter(awb: Record<string, unknown>): string {
//   return String(
//     awb.origin ||
//       awb.originName ||
//       awb.serviceCenter ||
//       awb.serviceCenterName ||
//       "Unknown",
//   );
// }

// function getRevenue(awb: Record<string, unknown>): number {
//   const charges =
//     (awb.charges as Record<string, unknown> | undefined) || undefined;
//   const total = Number(
//     charges?.total ?? awb.total ?? awb.totalAmount ?? 0,
//   );
//   return Number.isFinite(total) ? total : 0;
// }

// function getShipmentDate(awb: Record<string, unknown>): string {
//   return String(
//     awb.shipmentDate || awb.bookDate || awb.createdAt || "",
//   );
// }

// function inDateRange(
//   value: string,
//   fromDate: string,
//   toDate: string,
// ): boolean {
//   if (!value) {
//     // Keep undated rows when no range is set; exclude when filtering by date
//     return !fromDate && !toDate;
//   }

//   const day = value.slice(0, 10);

//   if (fromDate && day < fromDate) {
//     return false;
//   }

//   if (toDate && day > toDate) {
//     return false;
//   }

//   return true;
// }

// // function extractAwbs(payload: ApiAwbsResponse extends { success: true } ? ApiAwbsResponse["data"] : never): Record<string, unknown>[] {
// //   if (Array.isArray(payload)) {
// //     return payload;
// //   }

// //   if (!payload || typeof payload !== "object") {
// //     return [];
// //   }

// //   if (Array.isArray(payload.results)) return payload.results;
// //   if (Array.isArray(payload.items)) return payload.items;
// //   if (Array.isArray(payload.awbs)) return payload.awbs;
// //   if (Array.isArray(payload.data)) return payload.data;

// //   return [];
// // }

// function extractAwbs(payload: unknown): Record<string, unknown>[] {
//   if (Array.isArray(payload)) {
//     return payload as Record<string, unknown>[];
//   }

//   if (!payload || typeof payload !== "object") {
//     return [];
//   }

//   const obj = payload as {
//     results?: unknown;
//     items?: unknown;
//     awbs?: unknown;
//     data?: unknown;
//   };

//   if (Array.isArray(obj.results)) {
//     return obj.results as Record<string, unknown>[];
//   }
//   if (Array.isArray(obj.items)) {
//     return obj.items as Record<string, unknown>[];
//   }
//   if (Array.isArray(obj.awbs)) {
//     return obj.awbs as Record<string, unknown>[];
//   }
//   if (Array.isArray(obj.data)) {
//     return obj.data as Record<string, unknown>[];
//   }

//   return [];
// }

// function buildReport(
//   report: ReportKey,
//   awbs: Record<string, unknown>[],
// ): MetricRow[] {
//   const total = awbs.length;

//   const byStatus = awbs.reduce<Record<string, number>>((acc, awb) => {
//     const status = getStatus(awb);
//     acc[status] = (acc[status] || 0) + 1;
//     return acc;
//   }, {});

//   const delivered = byStatus.DELIVERED || 0;
//   const exceptions =
//     (byStatus.EXCEPTION || 0) + (byStatus.ON_HOLD || 0);
//   const cancelled = byStatus.CANCELLED || 0;
//   const inTransit = byStatus.IN_TRANSIT || 0;
//   const booked = byStatus.BOOKED || 0;
//   const pending = Math.max(0, total - delivered - cancelled);

//   const revenue = awbs.reduce(
//     (sum, awb) => sum + getRevenue(awb),
//     0,
//   );

//   const centers = Array.from(
//     new Set(awbs.map((awb) => getCenter(awb))),
//   ).sort();

//   if (report === "AWB Summary") {
//     return [
//       { label: "Total AWBs", value: String(total) },
//       { label: "Booked", value: String(booked) },
//       { label: "In Transit", value: String(inTransit) },
//       { label: "Delivered", value: String(delivered) },
//       { label: "Exceptions / On Hold", value: String(exceptions) },
//       { label: "Cancelled", value: String(cancelled) },
//       {
//         label: "Centers Covered",
//         value: String(centers.length),
//       },
//     ];
//   }

//   if (report === "Delivery Performance") {
//     const rate =
//       total > 0 ? ((delivered / total) * 100).toFixed(1) : "0.0";

//     return [
//       { label: "Total Shipments", value: String(total) },
//       { label: "Delivered", value: String(delivered) },
//       { label: "Pending", value: String(pending) },
//       { label: "Delivery Rate", value: `${rate}%` },
//       { label: "In Transit", value: String(inTransit) },
//       { label: "Exceptions / On Hold", value: String(exceptions) },
//     ];
//   }

//   if (report === "Revenue Report") {
//     const avg = total > 0 ? revenue / total : 0;
//     const deliveredRevenue = awbs
//       .filter((awb) => getStatus(awb) === "DELIVERED")
//       .reduce((sum, awb) => sum + getRevenue(awb), 0);

//     return [
//       { label: "Total Revenue", value: formatCurrency(revenue) },
//       { label: "Shipments Billed", value: String(total) },
//       {
//         label: "Average Revenue / AWB",
//         value: formatCurrency(avg),
//       },
//       {
//         label: "Delivered Revenue Share",
//         value: formatCurrency(deliveredRevenue),
//       },
//     ];
//   }

//   if (report === "Exception Report") {
//     const exceptionAwbs = awbs.filter((awb) => {
//       const status = getStatus(awb);
//       return status === "EXCEPTION" || status === "ON_HOLD";
//     });

//     const samples = exceptionAwbs
//       .slice(0, 5)
//       .map((awb) => String(awb.awb || "—"))
//       .join(", ");

//     return [
//       {
//         label: "Exception / On Hold Count",
//         value: String(exceptionAwbs.length),
//       },
//       {
//         label: "EXCEPTION",
//         value: String(byStatus.EXCEPTION || 0),
//       },
//       {
//         label: "ON_HOLD",
//         value: String(byStatus.ON_HOLD || 0),
//       },
//       {
//         label: "Sample AWB(s)",
//         value: samples || "None",
//       },
//     ];
//   }

//   // Day End Report
//   const readyCenters = centers.filter((centerName) => {
//     const centerAwbs = awbs.filter(
//       (awb) => getCenter(awb) === centerName,
//     );
//     if (centerAwbs.length === 0) return false;
//     return centerAwbs.every((awb) => {
//       const status = getStatus(awb);
//       return status === "DELIVERED" || status === "CANCELLED";
//     });
//   });

//   return [
//     { label: "Centers", value: String(centers.length) },
//     {
//       label: "Centers Ready",
//       value: String(readyCenters.length),
//     },
//     {
//       label: "Centers Pending",
//       value: String(Math.max(0, centers.length - readyCenters.length)),
//     },
//     { label: "Total AWBs", value: String(total) },
//     { label: "Delivered", value: String(delivered) },
//     { label: "Revenue", value: formatCurrency(revenue) },
//   ];
// }

// export default function ReportsPage() {
//   const {
//     firebaseUser,
//     user,
//     loading: authLoading,
//   } = useAuth();

//   const [report, setReport] = useState<ReportKey>("AWB Summary");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [center, setCenter] = useState("All Centers");
//   const [awbs, setAwbs] = useState<Record<string, unknown>[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [generated, setGenerated] = useState(false);
//   const [metrics, setMetrics] = useState<MetricRow[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [reloadKey, setReloadKey] = useState(0);

//   const loadAwbs = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // AuthContext: profile is `user`; Firebase Auth user is `firebaseUser`
//       if (!firebaseUser) {
//         throw new Error(
//           "Authentication is required to generate reports.",
//         );
//       }

//       const token = await firebaseUser.getIdToken(true);

//       // API max limit is 100 (see /api/logistics/awb/search)
//       const res = await fetch(
//         "/api/logistics/awb/search?limit=100",
//         {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           cache: "no-store",
//         },
//       );

//       const json = (await res.json()) as ApiAwbsResponse;

//       if (!res.ok || !json.success) {
//         throw new Error(
//           !json.success
//             ? json.error.message
//             : "Failed to load report source data.",
//         );
//       }

//       const list = extractAwbs(json.data);
//       setAwbs(list);
//     } catch (e) {
//       setError(
//         e instanceof Error
//           ? e.message
//           : "Failed to load reports data.",
//       );
//       setAwbs([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [firebaseUser]);

//   useEffect(() => {
//     if (authLoading) return;
//     loadAwbs();
//   }, [authLoading, reloadKey, loadAwbs]);

//   const centers = useMemo(() => {
//     const unique = Array.from(
//       new Set(awbs.map((awb) => getCenter(awb))),
//     ).sort();
//     return ["All Centers", ...unique];
//   }, [awbs]);

//   const filteredAwbs = useMemo(() => {
//     return awbs.filter((awb) => {
//       const matchesCenter =
//         center === "All Centers" || getCenter(awb) === center;
//       const matchesDate = inDateRange(
//         getShipmentDate(awb),
//         fromDate,
//         toDate,
//       );
//       return matchesCenter && matchesDate;
//     });
//   }, [awbs, center, fromDate, toDate]);

//   // Keep metrics in sync when filters / report type change after generate
//   useEffect(() => {
//     if (!generated) return;
//     setMetrics(buildReport(report, filteredAwbs));
//   }, [generated, report, filteredAwbs]);

//   function generateReport() {
//     setGenerated(true);
//     setMetrics(buildReport(report, filteredAwbs));
//   }

//   function exportCsv() {
//     if (metrics.length === 0) {
//       return;
//     }

//     const lines = [
//       "Metric,Value",
//       ...metrics.map(
//         (row) =>
//           `"${row.label.replace(/"/g, '""')}","${String(row.value).replace(/"/g, '""')}"`,
//       ),
//     ];

//     const blob = new Blob([lines.join("\n")], {
//       type: "text/csv;charset=utf-8;",
//     });
//     const url = URL.createObjectURL(blob);
//     const anchor = document.createElement("a");
//     anchor.href = url;
//     anchor.download = `${report
//       .toLowerCase()
//       .replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
//     anchor.click();
//     URL.revokeObjectURL(url);
//   }

//   return (
//     <div className="mx-auto max-w-[1200px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>
//           <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Reports
//           </h2>
//           <p className="mt-1 text-sm text-slate-500">
//             Generate operational reports from recent AWB data.
//           </p>
//           {user?.role ? (
//             <p className="mt-1 text-xs text-slate-400">
//               Signed in as role: <strong>{user.role}</strong>
//             </p>
//           ) : null}
//         </div>

//         <button
//           type="button"
//           onClick={() => setReloadKey((value) => value + 1)}
//           className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
//         >
//           Refresh Data
//         </button>
//       </div>

//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {!loading && !error && awbs.length > 0 && (
//         <p className="mb-4 text-xs text-slate-500">
//           Source: last {awbs.length} AWB
//           {awbs.length === 1 ? "" : "s"} from search API (max 100).
//           Date/center filters apply on this set.
//         </p>
//       )}

//       <div className="grid gap-4 md:grid-cols-2">
//         {REPORTS.map((item) => (
//           <button
//             key={item.name}
//             type="button"
//             onClick={() => {
//               setReport(item.name);
//               // keep generated=true so metrics refresh via effect
//             }}
//             className={`rounded-xl border bg-white p-5 text-left shadow-sm transition ${
//               report === item.name
//                 ? "border-[#087f87] ring-2 ring-cyan-100"
//                 : "border-slate-200"
//             }`}
//           >
//             <h3 className="font-bold text-[#06284c]">
//               {item.name}
//             </h3>
//             <p className="mt-1 text-sm text-slate-500">
//               {item.description}
//             </p>
//           </button>
//         ))}
//       </div>

//       <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//         <h3 className="font-bold text-[#06284c]">
//           Report Parameters
//         </h3>

//         <div className="mt-5 grid gap-4 md:grid-cols-3">
//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               From Date
//             </label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//             />
//           </div>

//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               To Date
//             </label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//             />
//           </div>

//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               Service Center
//             </label>
//             <select
//               value={center}
//               onChange={(e) => setCenter(e.target.value)}
//               className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//             >
//               {centers.map((item) => (
//                 <option key={item} value={item}>
//                   {item}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div className="mt-5 flex justify-end gap-3">
//           <button
//             type="button"
//             onClick={exportCsv}
//             disabled={!generated || metrics.length === 0}
//             className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
//           >
//             Export CSV
//           </button>

//           <button
//             type="button"
//             onClick={generateReport}
//             disabled={loading || authLoading || !firebaseUser}
//             className="rounded-lg bg-[#087f87] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
//           >
//             {loading || authLoading ? "Loading..." : "Generate Report"}
//           </button>
//         </div>
//       </section>

//       {generated && (
//         <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="border-b border-slate-200 px-5 py-4">
//             <h3 className="font-bold text-[#06284c]">
//               {report}
//             </h3>
//             <p className="mt-1 text-xs text-slate-500">
//               Based on {filteredAwbs.length} shipment
//               {filteredAwbs.length === 1 ? "" : "s"}
//               {center !== "All Centers" ? ` · ${center}` : ""}
//               {fromDate || toDate
//                 ? ` · ${fromDate || "…"} to ${toDate || "…"}`
//                 : ""}
//             </p>
//           </div>

//           {filteredAwbs.length === 0 ? (
//             <div className="px-5 py-8 text-center text-sm text-slate-500">
//               No shipments match the selected filters.
//             </div>
//           ) : (
//             <div className="divide-y divide-slate-100">
//               {metrics.map((row) => (
//                 <div
//                   key={row.label}
//                   className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
//                 >
//                   <span className="text-slate-600">{row.label}</span>
//                   <span className="font-bold text-[#06284c]">
//                     {row.value}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       )}
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { can } from "@/lib/permissions";
import type { UserRole } from "@/types/user";

type ReportKey =
  | "AWB Summary"
  | "Delivery Performance"
  | "Revenue Report"
  | "Exception Report"
  | "Day End Report";

type ReportDef = {
  name: ReportKey;
  description: string;
};

type MetricRow = {
  label: string;
  value: string;
};

type ApiAwbsResponse =
  | {
      success: true;
      data:
        | Record<string, unknown>[]
        | {
            results?: Record<string, unknown>[];
            items?: Record<string, unknown>[];
            awbs?: Record<string, unknown>[];
            data?: Record<string, unknown>[];
            count?: number;
          };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const REPORTS: ReportDef[] = [
  {
    name: "AWB Summary",
    description: "Shipment volume and status summary",
  },
  {
    name: "Delivery Performance",
    description: "Delivered versus pending shipments",
  },
  {
    name: "Revenue Report",
    description: "Revenue and billing summary",
  },
  {
    name: "Exception Report",
    description: "Shipments requiring attention",
  },
  {
    name: "Day End Report",
    description: "Center operational completion",
  },
];

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function toPermissionUser(
  user: { userId?: string; id?: string; role?: string } | null,
  roleFromAuth?: string | null,
) {
  if (!user && !roleFromAuth) return null;

  const roleRaw = String(roleFromAuth || user?.role || "")
    .trim()
    .toUpperCase();

  return {
    userId: String(user?.userId || user?.id || ""),
    role: (roleRaw || null) as UserRole | null,
  };
}

function getStatus(awb: Record<string, unknown>): string {
  return String(awb.currentStatus || awb.status || "UNKNOWN").toUpperCase();
}

function getCenter(awb: Record<string, unknown>): string {
  return String(
    awb.origin ||
      awb.originName ||
      awb.serviceCenter ||
      awb.serviceCenterName ||
      "Unknown",
  );
}

function getRevenue(awb: Record<string, unknown>): number {
  const charges =
    (awb.charges as Record<string, unknown> | undefined) || undefined;
  const total = Number(charges?.total ?? awb.total ?? awb.totalAmount ?? 0);
  return Number.isFinite(total) ? total : 0;
}

function getShipmentDate(awb: Record<string, unknown>): string {
  return String(awb.shipmentDate || awb.bookDate || awb.createdAt || "");
}

function inDateRange(
  value: string,
  fromDate: string,
  toDate: string,
): boolean {
  if (!value) {
    return !fromDate && !toDate;
  }

  const day = value.slice(0, 10);

  if (fromDate && day < fromDate) {
    return false;
  }

  if (toDate && day > toDate) {
    return false;
  }

  return true;
}

function extractAwbs(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload as Record<string, unknown>[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const obj = payload as {
    results?: unknown;
    items?: unknown;
    awbs?: unknown;
    data?: unknown;
  };

  if (Array.isArray(obj.results)) {
    return obj.results as Record<string, unknown>[];
  }
  if (Array.isArray(obj.items)) {
    return obj.items as Record<string, unknown>[];
  }
  if (Array.isArray(obj.awbs)) {
    return obj.awbs as Record<string, unknown>[];
  }
  if (Array.isArray(obj.data)) {
    return obj.data as Record<string, unknown>[];
  }

  return [];
}

function buildReport(
  report: ReportKey,
  awbs: Record<string, unknown>[],
): MetricRow[] {
  const total = awbs.length;

  const byStatus = awbs.reduce<Record<string, number>>((acc, awb) => {
    const status = getStatus(awb);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const delivered = byStatus.DELIVERED || 0;
  const exceptions = (byStatus.EXCEPTION || 0) + (byStatus.ON_HOLD || 0);
  const cancelled = byStatus.CANCELLED || 0;
  const inTransit = byStatus.IN_TRANSIT || 0;
  const booked = byStatus.BOOKED || 0;
  const pending = Math.max(0, total - delivered - cancelled);

  const revenue = awbs.reduce((sum, awb) => sum + getRevenue(awb), 0);

  const centers = Array.from(
    new Set(awbs.map((awb) => getCenter(awb))),
  ).sort();

  if (report === "AWB Summary") {
    return [
      { label: "Total AWBs", value: String(total) },
      { label: "Booked", value: String(booked) },
      { label: "In Transit", value: String(inTransit) },
      { label: "Delivered", value: String(delivered) },
      { label: "Exceptions / On Hold", value: String(exceptions) },
      { label: "Cancelled", value: String(cancelled) },
      {
        label: "Centers Covered",
        value: String(centers.length),
      },
    ];
  }

  if (report === "Delivery Performance") {
    const rate =
      total > 0 ? ((delivered / total) * 100).toFixed(1) : "0.0";

    return [
      { label: "Total Shipments", value: String(total) },
      { label: "Delivered", value: String(delivered) },
      { label: "Pending", value: String(pending) },
      { label: "Delivery Rate", value: `${rate}%` },
      { label: "In Transit", value: String(inTransit) },
      { label: "Exceptions / On Hold", value: String(exceptions) },
    ];
  }

  if (report === "Revenue Report") {
    const avg = total > 0 ? revenue / total : 0;
    const deliveredRevenue = awbs
      .filter((awb) => getStatus(awb) === "DELIVERED")
      .reduce((sum, awb) => sum + getRevenue(awb), 0);

    return [
      { label: "Total Revenue", value: formatCurrency(revenue) },
      { label: "Shipments Billed", value: String(total) },
      {
        label: "Average Revenue / AWB",
        value: formatCurrency(avg),
      },
      {
        label: "Delivered Revenue Share",
        value: formatCurrency(deliveredRevenue),
      },
    ];
  }

  if (report === "Exception Report") {
    const exceptionAwbs = awbs.filter((awb) => {
      const status = getStatus(awb);
      return status === "EXCEPTION" || status === "ON_HOLD";
    });

    const samples = exceptionAwbs
      .slice(0, 5)
      .map((awb) => String(awb.awb || "—"))
      .join(", ");

    return [
      {
        label: "Exception / On Hold Count",
        value: String(exceptionAwbs.length),
      },
      {
        label: "EXCEPTION",
        value: String(byStatus.EXCEPTION || 0),
      },
      {
        label: "ON_HOLD",
        value: String(byStatus.ON_HOLD || 0),
      },
      {
        label: "Sample AWB(s)",
        value: samples || "None",
      },
    ];
  }

  const readyCenters = centers.filter((centerName) => {
    const centerAwbs = awbs.filter(
      (awb) => getCenter(awb) === centerName,
    );
    if (centerAwbs.length === 0) return false;
    return centerAwbs.every((awb) => {
      const status = getStatus(awb);
      return status === "DELIVERED" || status === "CANCELLED";
    });
  });

  return [
    { label: "Centers", value: String(centers.length) },
    {
      label: "Centers Ready",
      value: String(readyCenters.length),
    },
    {
      label: "Centers Pending",
      value: String(Math.max(0, centers.length - readyCenters.length)),
    },
    { label: "Total AWBs", value: String(total) },
    { label: "Delivered", value: String(delivered) },
    { label: "Revenue", value: formatCurrency(revenue) },
  ];
}

export default function ReportsPage() {
  const {
    firebaseUser,
    user,
    role,
    loading: authLoading,
  } = useAuth();

  const permissionUser = toPermissionUser(
    user as { userId?: string; id?: string; role?: string } | null,
    role,
  );

  const roleLabel =
    String(permissionUser?.role || user?.role || "").toUpperCase() ||
    "UNKNOWN";

  /** View / generate reports */
  const canViewReports = can(permissionUser, "LOGISTICS_REPORTS_VIEW");

  const [report, setReport] = useState<ReportKey>("AWB Summary");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [center, setCenter] = useState("All Centers");
  const [awbs, setAwbs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [generated, setGenerated] = useState(false);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const loadAwbs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!firebaseUser) {
        throw new Error(
          "Authentication is required to generate reports.",
        );
      }

      if (!can(permissionUser, "LOGISTICS_REPORTS_VIEW")) {
        throw new Error(
          "You do not have permission to view reports (LOGISTICS_REPORTS_VIEW).",
        );
      }

      const token = await firebaseUser.getIdToken(true);

      const res = await fetch("/api/logistics/awb/search?limit=100", {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const json = (await res.json()) as ApiAwbsResponse;

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error.message
            : "Failed to load report source data.",
        );
      }

      const list = extractAwbs(json.data);
      setAwbs(list);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to load reports data.",
      );
      setAwbs([]);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, user, role]);

  useEffect(() => {
    if (authLoading) return;
    loadAwbs();
  }, [authLoading, reloadKey, loadAwbs]);

  const centers = useMemo(() => {
    const unique = Array.from(
      new Set(awbs.map((awb) => getCenter(awb))),
    ).sort();
    return ["All Centers", ...unique];
  }, [awbs]);

  const filteredAwbs = useMemo(() => {
    return awbs.filter((awb) => {
      const matchesCenter =
        center === "All Centers" || getCenter(awb) === center;
      const matchesDate = inDateRange(
        getShipmentDate(awb),
        fromDate,
        toDate,
      );
      return matchesCenter && matchesDate;
    });
  }, [awbs, center, fromDate, toDate]);

  useEffect(() => {
    if (!generated) return;
    setMetrics(buildReport(report, filteredAwbs));
  }, [generated, report, filteredAwbs]);

  function generateReport() {
    if (!canViewReports) {
      setError(
        "You do not have permission to generate reports (LOGISTICS_REPORTS_VIEW).",
      );
      return;
    }
    setGenerated(true);
    setMetrics(buildReport(report, filteredAwbs));
  }

  function exportCsv() {
    if (!canViewReports || metrics.length === 0) {
      return;
    }

    const lines = [
      "Metric,Value",
      ...metrics.map(
        (row) =>
          `"${row.label.replace(/"/g, '""')}","${String(row.value).replace(/"/g, '""')}"`,
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report
      .toLowerCase()
      .replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading user permissions...
          </p>
        </div>
      </div>
    );
  }

  if (user && !canViewReports) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="font-bold text-red-900">Access denied</h3>
          <p className="mt-1 text-sm text-red-800">
            Your role is <strong>{roleLabel}</strong>. Reports require{" "}
            <code className="font-mono">LOGISTICS_REPORTS_VIEW</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Logistics
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
            Reports
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Generate operational reports from recent AWB data.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Signed in as role: <strong>{roleLabel}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && awbs.length > 0 && (
        <p className="mb-4 text-xs text-slate-500">
          Source: last {awbs.length} AWB
          {awbs.length === 1 ? "" : "s"} from search API (max 100).
          Date/center filters apply on this set.
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {REPORTS.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => {
              setReport(item.name);
            }}
            className={`rounded-xl border bg-white p-5 text-left shadow-sm transition ${
              report === item.name
                ? "border-[#087f87] ring-2 ring-cyan-100"
                : "border-slate-200"
            }`}
          >
            <h3 className="font-bold text-[#06284c]">{item.name}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {item.description}
            </p>
          </button>
        ))}
      </div>

      <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-bold text-[#06284c]">Report Parameters</h3>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Service Center
            </label>
            <select
              value={center}
              onChange={(e) => setCenter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
            >
              {centers.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={exportCsv}
            disabled={
              !generated || metrics.length === 0 || !canViewReports
            }
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
          >
            Export CSV
          </button>

          <button
            type="button"
            onClick={generateReport}
            disabled={
              loading ||
              authLoading ||
              !firebaseUser ||
              !canViewReports
            }
            className="rounded-lg bg-[#087f87] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {loading || authLoading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      </section>

      {generated && (
        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-bold text-[#06284c]">{report}</h3>
            <p className="mt-1 text-xs text-slate-500">
              Based on {filteredAwbs.length} shipment
              {filteredAwbs.length === 1 ? "" : "s"}
              {center !== "All Centers" ? ` · ${center}` : ""}
              {fromDate || toDate
                ? ` · ${fromDate || "…"} to ${toDate || "…"}`
                : ""}
            </p>
          </div>

          {filteredAwbs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              No shipments match the selected filters.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {metrics.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
                >
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-bold text-[#06284c]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}