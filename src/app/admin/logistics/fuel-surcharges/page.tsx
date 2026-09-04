// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { Plus, Trash2, Save, RefreshCw, Pencil } from "lucide-react";

// type FuelSurcharge = {
//   id: string;
//   name: string;          // e.g. DHL, FedEx, Aramex
//   percentage?: number;
//   amount?: number;       // fixed amount option
//   enabled: boolean;
//   effectiveFrom?: string;
//   effectiveTo?: string;
// };

// type ApiResponse<T> =
//   | { success: true; data: T; message?: string }
//   | { success: false; error: { code: string; message: string } };

// export default function FuelSurchargesPage() {
//   const { user, loading: authLoading } = useAuth();

//   const [rows, setRows] = useState<FuelSurcharge[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   // New / edit form
//   const [form, setForm] = useState({
//     name: "",
//     percentage: "",
//     amount: "",
//     enabled: true,
//   });

//   const loadData = async () => {
//     if (!user) return;
//     try {
//       setLoading(true);
//       setError(null);

//       const token = await user.getIdToken();
//       const res = await fetch("/api/logistics/settings/fuel-surcharge", {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//       });

//       const json = (await res.json()) as ApiResponse<FuelSurcharge[] | { items: FuelSurcharge[] }>;

//       if (!json.success) {
//         throw new Error(json.error?.message || "Failed to load fuel surcharges");
//       }

//       const list = Array.isArray(json.data)
//         ? json.data
//         : (json.data as any).items || [];

//       setRows(list);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Failed to load data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (authLoading || !user) return;
//     loadData();
//   }, [authLoading, user]);

//   const resetForm = () => {
//     setForm({ name: "", percentage: "", amount: "", enabled: true });
//     setEditingId(null);
//   };

//   const startEdit = (row: FuelSurcharge) => {
//     setEditingId(row.id);
//     setForm({
//       name: row.name,
//       percentage: row.percentage != null ? String(row.percentage) : "",
//       amount: row.amount != null ? String(row.amount) : "",
//       enabled: row.enabled,
//     });
//   };

//   const handleSave = async () => {
//     if (!user) return;
//     if (!form.name.trim()) {
//       setError("Carrier / Vendor name is required");
//       return;
//     }

//     try {
//       setSaving(true);
//       setError(null);

//       const token = await user.getIdToken();
//       const payload = {
//         id: editingId || undefined,
//         name: form.name.trim(),
//         percentage: form.percentage ? Number(form.percentage) : undefined,
//         amount: form.amount ? Number(form.amount) : undefined,
//         enabled: form.enabled,
//       };

//       const res = await fetch("/api/logistics/settings/fuel-surcharge", {
//         method: editingId ? "PUT" : "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const json = await res.json();

//       if (!res.ok || !json.success) {
//         throw new Error(json.error?.message || "Failed to save");
//       }

//       setMessage(editingId ? "Fuel surcharge updated" : "Fuel surcharge added");
//       resetForm();
//       await loadData();
//       setTimeout(() => setMessage(null), 2500);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!user || !confirm("Delete this fuel surcharge?")) return;

//     try {
//       const token = await user.getIdToken();
//       const res = await fetch(`/api/logistics/settings/fuel-surcharge?id=${id}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         throw new Error(json.error?.message || "Delete failed");
//       }

//       setMessage("Deleted successfully");
//       await loadData();
//       setTimeout(() => setMessage(null), 2000);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Delete failed");
//     }
//   };

//   return (
//     <div className="mx-auto max-w-[1100px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>
//           <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Fuel Surcharges
//           </h2>
//           <p className="mt-1 text-sm text-slate-500">
//             Super Admin only — Manage carrier fuel surcharges (DHL, FedEx, etc.).
//             Co-loaders can only view/apply them.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={loadData}
//           className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Refresh
//         </button>
//       </div>

//       {message && (
//         <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
//           {message}
//         </div>
//       )}
//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* Add / Edit Form */}
//       <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//         <h3 className="mb-4 text-sm font-semibold text-slate-800">
//           {editingId ? "Edit Fuel Surcharge" : "Add Fuel Surcharge"}
//         </h3>

//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Carrier / Vendor Name *
//             </label>
//             <input
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               placeholder="e.g. DHL, FedEx, Aramex"
//               className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Percentage (%)
//             </label>
//             <input
//               type="number"
//               min={0}
//               step="0.01"
//               value={form.percentage}
//               onChange={(e) => setForm({ ...form, percentage: e.target.value })}
//               placeholder="e.g. 14.5"
//               className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Fixed Amount (₹)
//             </label>
//             <input
//               type="number"
//               min={0}
//               step="0.01"
//               value={form.amount}
//               onChange={(e) => setForm({ ...form, amount: e.target.value })}
//               placeholder="Optional"
//               className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
//             />
//           </div>

//           <div className="flex items-end gap-3">
//             <label className="flex items-center gap-2 text-sm">
//               <input
//                 type="checkbox"
//                 checked={form.enabled}
//                 onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
//                 className="h-4 w-4"
//               />
//               Enabled
//             </label>
//           </div>

//           <div className="flex items-end gap-2">
//             <button
//               type="button"
//               onClick={handleSave}
//               disabled={saving}
//               className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#087f87] px-5 text-sm font-bold text-white disabled:opacity-60"
//             >
//               <Save className="h-4 w-4" />
//               {saving ? "Saving…" : editingId ? "Update" : "Add"}
//             </button>

//             {editingId && (
//               <button
//                 type="button"
//                 onClick={resetForm}
//                 className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         {loading || authLoading ? (
//           <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
//         ) : rows.length === 0 ? (
//           <div className="py-16 text-center text-sm text-gray-500">
//             No fuel surcharges configured yet.
//           </div>
//         ) : (
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//               <tr>
//                 <th className="px-5 py-3">Carrier / Vendor</th>
//                 <th className="px-5 py-3">Percentage</th>
//                 <th className="px-5 py-3">Fixed Amount</th>
//                 <th className="px-5 py-3">Status</th>
//                 <th className="px-5 py-3">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {rows.map((row) => (
//                 <tr key={row.id} className="hover:bg-slate-50/50">
//                   <td className="px-5 py-4 font-semibold">{row.name}</td>
//                   <td className="px-5 py-4">
//                     {row.percentage != null ? `${row.percentage}%` : "—"}
//                   </td>
//                   <td className="px-5 py-4">
//                     {row.amount != null ? `₹${row.amount.toFixed(2)}` : "—"}
//                   </td>
//                   <td className="px-5 py-4">
//                     <span
//                       className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
//                         row.enabled
//                           ? "bg-emerald-100 text-emerald-700"
//                           : "bg-slate-100 text-slate-500"
//                       }`}
//                     >
//                       {row.enabled ? "Active" : "Disabled"}
//                     </span>
//                   </td>
//                   <td className="px-5 py-4">
//                     <div className="flex items-center gap-2">
//                       <button
//                         type="button"
//                         onClick={() => startEdit(row)}
//                         className="rounded p-1.5 text-gray-500 hover:bg-slate-100 hover:text-slate-800"
//                       >
//                         <Pencil className="h-4 w-4" />
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => handleDelete(row.id)}
//                         className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { Plus, Trash2, Save, RefreshCw, Pencil, X } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";

// type FuelSurcharge = {
//   id: string;
//   name: string;
//   percentage?: number | null;
//   amount?: number | null;
//   enabled: boolean;
//   effectiveFrom?: string | null;
//   effectiveTo?: string | null;
// };

// type FormState = {
//   name: string;
//   percentage: string;
//   amount: string;
//   enabled: boolean;
//   effectiveFrom: string;
//   effectiveTo: string;
// };

// const emptyForm: FormState = {
//   name: "",
//   percentage: "",
//   amount: "",
//   enabled: true,
//   effectiveFrom: "",
//   effectiveTo: "",
// };

// export default function FuelSurchargesPage() {
//   const { firebaseUser, loading: authLoading } = useAuth();

//   const [rows, setRows] = useState<FuelSurcharge[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState<FormState>(emptyForm);

//   const authHeaders = useCallback(async (): Promise<HeadersInit> => {
//     if (!firebaseUser) {
//       throw new Error("Authentication is required.");
//     }
//     const token = await firebaseUser.getIdToken(true);
//     return {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     };
//   }, [firebaseUser]);

//   const loadData = useCallback(async () => {
//     if (!firebaseUser) {
//       setError("Authentication is required.");
//       setRows([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);

//       const headers = await authHeaders();
//       const res = await fetch("/api/logistics/settings/fuel-surcharge", {
//         headers,
//         credentials: "include",
//         cache: "no-store",
//       });

//       const json = await res.json();

//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Failed to load fuel surcharges";
//         throw new Error(msg);
//       }

//       const list = Array.isArray(json.data)
//         ? json.data
//         : json.data?.items || [];

//       setRows(list as FuelSurcharge[]);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Failed to load data");
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [firebaseUser, authHeaders]);

//   useEffect(() => {
//     if (authLoading) return;
//     loadData();
//   }, [authLoading, loadData]);

//   function startEdit(row: FuelSurcharge) {
//     setEditingId(row.id);
//     setForm({
//       name: row.name || "",
//       percentage:
//         row.percentage != null && Number.isFinite(row.percentage)
//           ? String(row.percentage)
//           : "",
//       amount:
//         row.amount != null && Number.isFinite(row.amount)
//           ? String(row.amount)
//           : "",
//       enabled: row.enabled !== false,
//       effectiveFrom: row.effectiveFrom || "",
//       effectiveTo: row.effectiveTo || "",
//     });
//     setMessage(null);
//     setError(null);
//   }

//   function cancelEdit() {
//     setEditingId(null);
//     setForm(emptyForm);
//   }

//   async function handleSave(e?: React.FormEvent) {
//     e?.preventDefault();
//     if (!firebaseUser) {
//       setError("Authentication is required.");
//       return;
//     }

//     try {
//       setSaving(true);
//       setError(null);
//       setMessage(null);

//       if (!form.name.trim()) {
//         throw new Error("Name is required.");
//       }
//       if (!form.percentage.trim() && !form.amount.trim()) {
//         throw new Error("Enter a percentage and/or fixed amount.");
//       }

//       const headers = await authHeaders();
//       const payload = {
//         id: editingId || undefined,
//         name: form.name.trim(),
//         percentage: form.percentage.trim()
//           ? Number(form.percentage)
//           : null,
//         amount: form.amount.trim() ? Number(form.amount) : null,
//         enabled: form.enabled,
//         effectiveFrom: form.effectiveFrom || null,
//         effectiveTo: form.effectiveTo || null,
//       };

//       const res = await fetch("/api/logistics/settings/fuel-surcharge", {
//         method: editingId ? "PUT" : "POST",
//         headers,
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });

//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Save failed";
//         throw new Error(msg);
//       }

//       setMessage(
//         json.message ||
//           (editingId ? "Fuel surcharge updated." : "Fuel surcharge created."),
//       );
//       cancelEdit();
//       await loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleDelete(id: string) {
//     if (!firebaseUser) {
//       setError("Authentication is required.");
//       return;
//     }
//     if (!window.confirm("Delete this fuel surcharge?")) return;

//     try {
//       setError(null);
//       setMessage(null);
//       const headers = await authHeaders();
//       const res = await fetch(
//         `/api/logistics/settings/fuel-surcharge?id=${encodeURIComponent(id)}`,
//         {
//           method: "DELETE",
//           headers,
//           credentials: "include",
//         },
//       );
//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Delete failed";
//         throw new Error(msg);
//       }
//       setMessage("Fuel surcharge deleted.");
//       if (editingId === id) cancelEdit();
//       await loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Delete failed");
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[1100px] space-y-6">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>
//           <h1 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Fuel Surcharges
//           </h1>
//           <p className="mt-1 text-sm text-slate-500">
//             Manage carrier / vendor fuel surcharge percentages and fixed amounts.
//           </p>
//         </div>
//         <button
//           type="button"
//           onClick={() => loadData()}
//           disabled={loading || authLoading}
//           className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Refresh
//         </button>
//       </div>

//       {error ? (
//         <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {error}
//         </div>
//       ) : null}
//       {message ? (
//         <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
//           {message}
//         </div>
//       ) : null}

//       <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="font-bold text-[#06284c]">
//             {editingId ? "Edit surcharge" : "Add surcharge"}
//           </h2>
//           {editingId ? (
//             <button
//               type="button"
//               onClick={cancelEdit}
//               className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"
//             >
//               <X className="h-3.5 w-3.5" />
//               Cancel
//             </button>
//           ) : null}
//         </div>

//         <form
//           onSubmit={handleSave}
//           className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
//         >
//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               Name / Carrier *
//             </label>
//             <input
//               value={form.name}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, name: e.target.value }))
//               }
//               placeholder="e.g. FedEx International"
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               required
//             />
//           </div>

//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               Percentage (%)
//             </label>
//             <input
//               type="number"
//               min={0}
//               max={100}
//               step="0.01"
//               value={form.percentage}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, percentage: e.target.value }))
//               }
//               placeholder="12"
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//             />
//           </div>

//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               Fixed amount (₹)
//             </label>
//             <input
//               type="number"
//               min={0}
//               step="0.01"
//               value={form.amount}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, amount: e.target.value }))
//               }
//               placeholder="0"
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//             />
//           </div>

//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               Effective from
//             </label>
//             <input
//               type="date"
//               value={form.effectiveFrom}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, effectiveFrom: e.target.value }))
//               }
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//             />
//           </div>

//           <div>
//             <label className="mb-1.5 block text-xs font-bold text-slate-600">
//               Effective to
//             </label>
//             <input
//               type="date"
//               value={form.effectiveTo}
//               onChange={(e) =>
//                 setForm((f) => ({ ...f, effectiveTo: e.target.value }))
//               }
//               className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//             />
//           </div>

//           <div className="flex items-end">
//             <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
//               <input
//                 type="checkbox"
//                 checked={form.enabled}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, enabled: e.target.checked }))
//                 }
//                 className="h-4 w-4 rounded border-slate-300"
//               />
//               Active
//             </label>
//           </div>

//           <div className="sm:col-span-2 lg:col-span-3">
//             <button
//               type="submit"
//               disabled={saving || !firebaseUser}
//               className="inline-flex items-center gap-2 rounded-lg bg-[#087f87] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
//             >
//               {editingId ? (
//                 <Save className="h-4 w-4" />
//               ) : (
//                 <Plus className="h-4 w-4" />
//               )}
//               {saving
//                 ? "Saving…"
//                 : editingId
//                   ? "Update surcharge"
//                   : "Add surcharge"}
//             </button>
//           </div>
//         </form>
//       </section>

//       <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         <div className="border-b border-slate-100 px-5 py-4">
//           <h2 className="font-bold text-[#06284c]">
//             Configured surcharges
//             <span className="ml-2 text-xs font-normal text-slate-400">
//               {rows.length} item(s)
//             </span>
//           </h2>
//         </div>

//         {loading || authLoading ? (
//           <div className="py-16 text-center text-sm text-slate-500">
//             Loading…
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="px-5 py-16 text-center text-sm text-slate-500">
//             No fuel surcharges yet. Add one above.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[720px] text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">Name / Carrier</th>
//                   <th className="px-5 py-3">Percentage</th>
//                   <th className="px-5 py-3">Fixed amount</th>
//                   <th className="px-5 py-3">Effective</th>
//                   <th className="px-5 py-3">Status</th>
//                   <th className="px-5 py-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {rows.map((row) => (
//                   <tr key={row.id} className="hover:bg-slate-50/50">
//                     <td className="px-5 py-4 font-semibold">{row.name}</td>
//                     <td className="px-5 py-4">
//                       {row.percentage != null ? `${row.percentage}%` : "—"}
//                     </td>
//                     <td className="px-5 py-4">
//                       {row.amount != null
//                         ? `₹${Number(row.amount).toFixed(2)}`
//                         : "—"}
//                     </td>
//                     <td className="px-5 py-4 text-xs text-slate-500">
//                       {[row.effectiveFrom, row.effectiveTo]
//                         .filter(Boolean)
//                         .join(" → ") || "—"}
//                     </td>
//                     <td className="px-5 py-4">
//                       <span
//                         className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
//                           row.enabled
//                             ? "bg-emerald-100 text-emerald-700"
//                             : "bg-slate-100 text-slate-500"
//                         }`}
//                       >
//                         {row.enabled ? "Active" : "Disabled"}
//                       </span>
//                     </td>
//                     <td className="px-5 py-4">
//                       <div className="flex gap-1">
//                         <button
//                           type="button"
//                           onClick={() => startEdit(row)}
//                           className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
//                         >
//                           <Pencil className="h-4 w-4" />
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => handleDelete(row.id)}
//                           className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { Plus, Trash2, Save, RefreshCw, Pencil, X } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";

// type FuelSurcharge = {
//   id: string;
//   name: string;
//   percentage?: number | null;
//   amount?: number | null;
//   enabled: boolean;
//   effectiveFrom?: string | null;
//   effectiveTo?: string | null;
// };

// type FormState = {
//   name: string;
//   percentage: string;
//   amount: string;
//   enabled: boolean;
//   effectiveFrom: string;
//   effectiveTo: string;
// };

// const emptyForm: FormState = {
//   name: "",
//   percentage: "",
//   amount: "",
//   enabled: true,
//   effectiveFrom: "",
//   effectiveTo: "",
// };

// export default function FuelSurchargesPage() {
//   const { firebaseUser, user, loading: authLoading } = useAuth();

//   /** Only Super Admin can add / edit / delete */
//   const canManage = user?.role === "SUPER_ADMIN";

//   const [rows, setRows] = useState<FuelSurcharge[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState<FormState>(emptyForm);

//   const authHeaders = useCallback(async (): Promise<HeadersInit> => {
//     if (!firebaseUser) {
//       throw new Error("Authentication is required.");
//     }
//     const token = await firebaseUser.getIdToken(true);
//     return {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     };
//   }, [firebaseUser]);

//   const loadData = useCallback(async () => {
//     if (!firebaseUser) {
//       setError("Authentication is required.");
//       setRows([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       const headers = await authHeaders();
//       const res = await fetch("/api/logistics/settings/fuel-surcharge", {
//         headers,
//         credentials: "include",
//         cache: "no-store",
//       });
//       const json = await res.json();

//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Failed to load fuel surcharges";
//         throw new Error(msg);
//       }

//       const list = Array.isArray(json.data)
//         ? json.data
//         : json.data?.items || [];
//       setRows(list as FuelSurcharge[]);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Failed to load data");
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [firebaseUser, authHeaders]);

//   useEffect(() => {
//     if (authLoading) return;
//     loadData();
//   }, [authLoading, loadData]);

//   function startEdit(row: FuelSurcharge) {
//     if (!canManage) return;
//     setEditingId(row.id);
//     setForm({
//       name: row.name || "",
//       percentage:
//         row.percentage != null && Number.isFinite(row.percentage)
//           ? String(row.percentage)
//           : "",
//       amount:
//         row.amount != null && Number.isFinite(row.amount)
//           ? String(row.amount)
//           : "",
//       enabled: row.enabled !== false,
//       effectiveFrom: row.effectiveFrom || "",
//       effectiveTo: row.effectiveTo || "",
//     });
//     setMessage(null);
//     setError(null);
//   }

//   function cancelEdit() {
//     setEditingId(null);
//     setForm(emptyForm);
//   }

//   async function handleSave(e?: React.FormEvent) {
//     e?.preventDefault();
//     if (!canManage) {
//       setError("Only Super Admin can manage fuel surcharges.");
//       return;
//     }
//     if (!firebaseUser) {
//       setError("Authentication is required.");
//       return;
//     }

//     try {
//       setSaving(true);
//       setError(null);
//       setMessage(null);

//       if (!form.name.trim()) throw new Error("Name is required.");
//       if (!form.percentage.trim() && !form.amount.trim()) {
//         throw new Error("Enter a percentage and/or fixed amount.");
//       }

//       const headers = await authHeaders();
//       const payload = {
//         id: editingId || undefined,
//         name: form.name.trim(),
//         percentage: form.percentage.trim()
//           ? Number(form.percentage)
//           : null,
//         amount: form.amount.trim() ? Number(form.amount) : null,
//         enabled: form.enabled,
//         effectiveFrom: form.effectiveFrom || null,
//         effectiveTo: form.effectiveTo || null,
//       };

//       const res = await fetch("/api/logistics/settings/fuel-surcharge", {
//         method: editingId ? "PUT" : "POST",
//         headers,
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       const json = await res.json();

//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Save failed";
//         throw new Error(msg);
//       }

//       setMessage(
//         json.message ||
//           (editingId ? "Fuel surcharge updated." : "Fuel surcharge created."),
//       );
//       cancelEdit();
//       await loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleDelete(id: string) {
//     if (!canManage) {
//       setError("Only Super Admin can manage fuel surcharges.");
//       return;
//     }
//     if (!firebaseUser) return;
//     if (!window.confirm("Delete this fuel surcharge?")) return;

//     try {
//       setError(null);
//       setMessage(null);
//       const headers = await authHeaders();
//       const res = await fetch(
//         `/api/logistics/settings/fuel-surcharge?id=${encodeURIComponent(id)}`,
//         { method: "DELETE", headers, credentials: "include" },
//       );
//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Delete failed";
//         throw new Error(msg);
//       }
//       setMessage("Fuel surcharge deleted.");
//       if (editingId === id) cancelEdit();
//       await loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Delete failed");
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[1100px] space-y-6">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>
//           <h1 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Fuel Surcharges
//           </h1>
//           <p className="mt-1 text-sm text-slate-500">
//             {canManage
//               ? "Super Admin: add, edit, or delete carrier fuel surcharges."
//               : "View only — only Super Admin can modify fuel surcharges."}
//           </p>
//         </div>
//         <button
//           type="button"
//           onClick={() => loadData()}
//           disabled={loading || authLoading}
//           className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Refresh
//         </button>
//       </div>

//       {error ? (
//         <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {error}
//         </div>
//       ) : null}
//       {message ? (
//         <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
//           {message}
//         </div>
//       ) : null}

//       {canManage ? (
//         <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="font-bold text-[#06284c]">
//               {editingId ? "Edit surcharge" : "Add surcharge"}
//             </h2>
//             {editingId ? (
//               <button
//                 type="button"
//                 onClick={cancelEdit}
//                 className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"
//               >
//                 <X className="h-3.5 w-3.5" />
//                 Cancel
//               </button>
//             ) : null}
//           </div>

//           <form
//             onSubmit={handleSave}
//             className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
//           >
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Name / Carrier *
//               </label>
//               <input
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, name: e.target.value }))
//                 }
//                 placeholder="e.g. FedEx International"
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//                 required
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Percentage (%)
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 step="0.01"
//                 value={form.percentage}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, percentage: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Fixed amount (₹)
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 step="0.01"
//                 value={form.amount}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, amount: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Effective from
//               </label>
//               <input
//                 type="date"
//                 value={form.effectiveFrom}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, effectiveFrom: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Effective to
//               </label>
//               <input
//                 type="date"
//                 value={form.effectiveTo}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, effectiveTo: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div className="flex items-end">
//               <label className="flex items-center gap-2 text-sm font-medium">
//                 <input
//                   type="checkbox"
//                   checked={form.enabled}
//                   onChange={(e) =>
//                     setForm((f) => ({ ...f, enabled: e.target.checked }))
//                   }
//                   className="h-4 w-4 rounded border-slate-300"
//                 />
//                 Active
//               </label>
//             </div>
//             <div className="sm:col-span-2 lg:col-span-3">
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="inline-flex items-center gap-2 rounded-lg bg-[#087f87] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
//               >
//                 {editingId ? (
//                   <Save className="h-4 w-4" />
//                 ) : (
//                   <Plus className="h-4 w-4" />
//                 )}
//                 {saving
//                   ? "Saving…"
//                   : editingId
//                     ? "Update surcharge"
//                     : "Add surcharge"}
//               </button>
//             </div>
//           </form>
//         </section>
//       ) : (
//         <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
//           You can view fuel surcharges. Only a Super Admin can add, edit, or
//           delete them.
//         </div>
//       )}

//       <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         <div className="border-b border-slate-100 px-5 py-4">
//           <h2 className="font-bold text-[#06284c]">
//             Configured surcharges
//             <span className="ml-2 text-xs font-normal text-slate-400">
//               {rows.length} item(s)
//             </span>
//           </h2>
//         </div>

//         {loading || authLoading ? (
//           <div className="py-16 text-center text-sm text-slate-500">
//             Loading…
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="px-5 py-16 text-center text-sm text-slate-500">
//             No fuel surcharges configured yet.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[720px] text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">Name / Carrier</th>
//                   <th className="px-5 py-3">Percentage</th>
//                   <th className="px-5 py-3">Fixed amount</th>
//                   <th className="px-5 py-3">Effective</th>
//                   <th className="px-5 py-3">Status</th>
//                   {canManage ? (
//                     <th className="px-5 py-3">Actions</th>
//                   ) : null}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {rows.map((row) => (
//                   <tr key={row.id} className="hover:bg-slate-50/50">
//                     <td className="px-5 py-4 font-semibold">{row.name}</td>
//                     <td className="px-5 py-4">
//                       {row.percentage != null ? `${row.percentage}%` : "—"}
//                     </td>
//                     <td className="px-5 py-4">
//                       {row.amount != null
//                         ? `₹${Number(row.amount).toFixed(2)}`
//                         : "—"}
//                     </td>
//                     <td className="px-5 py-4 text-xs text-slate-500">
//                       {[row.effectiveFrom, row.effectiveTo]
//                         .filter(Boolean)
//                         .join(" → ") || "—"}
//                     </td>
//                     <td className="px-5 py-4">
//                       <span
//                         className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
//                           row.enabled
//                             ? "bg-emerald-100 text-emerald-700"
//                             : "bg-slate-100 text-slate-500"
//                         }`}
//                       >
//                         {row.enabled ? "Active" : "Disabled"}
//                       </span>
//                     </td>
//                     {canManage ? (
//                       <td className="px-5 py-4">
//                         <div className="flex gap-1">
//                           <button
//                             type="button"
//                             onClick={() => startEdit(row)}
//                             className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => handleDelete(row.id)}
//                             className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </td>
//                     ) : null}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { Plus, Trash2, Save, RefreshCw, Pencil, X } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { can } from "@/lib/permissions";
// import type { UserRole } from "@/types/user";

// type FuelSurcharge = {
//   id: string;
//   name: string;
//   percentage?: number | null;
//   amount?: number | null;
//   enabled: boolean;
//   effectiveFrom?: string | null;
//   effectiveTo?: string | null;
// };

// type FormState = {
//   name: string;
//   percentage: string;
//   amount: string;
//   enabled: boolean;
//   effectiveFrom: string;
//   effectiveTo: string;
// };

// const emptyForm: FormState = {
//   name: "",
//   percentage: "",
//   amount: "",
//   enabled: true,
//   effectiveFrom: "",
//   effectiveTo: "",
// };

// function toPermissionUser(
//   user: { userId?: string; id?: string; role?: string } | null,
//   roleFromAuth?: string | null,
// ) {
//   if (!user && !roleFromAuth) return null;

//   const roleRaw = String(roleFromAuth || user?.role || "")
//     .trim()
//     .toUpperCase();

//   return {
//     userId: String(user?.userId || user?.id || ""),
//     role: (roleRaw || null) as UserRole | null,
//   };
// }

// export default function FuelSurchargesPage() {
//   const {
//     firebaseUser,
//     user,
//     role,
//     loading: authLoading,
//   } = useAuth();

//   const permissionUser = toPermissionUser(
//     user as { userId?: string; id?: string; role?: string } | null,
//     role,
//   );

//   const roleLabel =
//     String(permissionUser?.role || "").toUpperCase() || "UNKNOWN";

//   /** View list (rate view or settings manage) */
//   const canView =
//     can(permissionUser, "LOGISTICS_RATE_VIEW") ||
//     can(permissionUser, "LOGISTICS_SETTINGS");

//   /** Add / edit / delete */
//   const canManage = can(permissionUser, "LOGISTICS_SETTINGS");

//   const [rows, setRows] = useState<FuelSurcharge[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState<FormState>(emptyForm);

//   const authHeaders = useCallback(async (): Promise<HeadersInit> => {
//     if (!firebaseUser) {
//       throw new Error("Authentication is required.");
//     }
//     const token = await firebaseUser.getIdToken(true);
//     return {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     };
//   }, [firebaseUser]);

//   const loadData = useCallback(async () => {
//     if (!firebaseUser) {
//       setError("Authentication is required.");
//       setRows([]);
//       setLoading(false);
//       return;
//     }

//     if (
//       !can(permissionUser, "LOGISTICS_RATE_VIEW") &&
//       !can(permissionUser, "LOGISTICS_SETTINGS")
//     ) {
//       setError(
//         "You do not have permission to view fuel surcharges.",
//       );
//       setRows([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       const headers = await authHeaders();
//       const res = await fetch("/api/logistics/settings/fuel-surcharge", {
//         headers,
//         credentials: "include",
//         cache: "no-store",
//       });
//       const json = await res.json();

//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Failed to load fuel surcharges";
//         throw new Error(msg);
//       }

//       const list = Array.isArray(json.data)
//         ? json.data
//         : json.data?.items || [];
//       setRows(list as FuelSurcharge[]);
//     } catch (e) {
//       setError(e instanceof Error ? e.message : "Failed to load data");
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [firebaseUser, authHeaders, user, role]);

//   useEffect(() => {
//     if (authLoading) return;
//     loadData();
//   }, [authLoading, loadData]);

//   function startEdit(row: FuelSurcharge) {
//     if (!canManage) return;
//     setEditingId(row.id);
//     setForm({
//       name: row.name || "",
//       percentage:
//         row.percentage != null && Number.isFinite(row.percentage)
//           ? String(row.percentage)
//           : "",
//       amount:
//         row.amount != null && Number.isFinite(row.amount)
//           ? String(row.amount)
//           : "",
//       enabled: row.enabled !== false,
//       effectiveFrom: row.effectiveFrom || "",
//       effectiveTo: row.effectiveTo || "",
//     });
//     setMessage(null);
//     setError(null);
//   }

//   function cancelEdit() {
//     setEditingId(null);
//     setForm(emptyForm);
//   }

//   async function handleSave(e?: React.FormEvent) {
//     e?.preventDefault();
//     if (!canManage) {
//       setError(
//         "You do not have permission to manage fuel surcharges (LOGISTICS_SETTINGS_MANAGE).",
//       );
//       return;
//     }
//     if (!firebaseUser) {
//       setError("Authentication is required.");
//       return;
//     }

//     try {
//       setSaving(true);
//       setError(null);
//       setMessage(null);

//       if (!form.name.trim()) throw new Error("Name is required.");
//       if (!form.percentage.trim() && !form.amount.trim()) {
//         throw new Error("Enter a percentage and/or fixed amount.");
//       }

//       const headers = await authHeaders();
//       const payload = {
//         id: editingId || undefined,
//         name: form.name.trim(),
//         percentage: form.percentage.trim()
//           ? Number(form.percentage)
//           : null,
//         amount: form.amount.trim() ? Number(form.amount) : null,
//         enabled: form.enabled,
//         effectiveFrom: form.effectiveFrom || null,
//         effectiveTo: form.effectiveTo || null,
//       };

//       const res = await fetch("/api/logistics/settings/fuel-surcharge", {
//         method: editingId ? "PUT" : "POST",
//         headers,
//         credentials: "include",
//         body: JSON.stringify(payload),
//       });
//       const json = await res.json();

//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Save failed";
//         throw new Error(msg);
//       }

//       setMessage(
//         json.message ||
//           (editingId
//             ? "Fuel surcharge updated."
//             : "Fuel surcharge created."),
//       );
//       cancelEdit();
//       await loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Save failed");
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function handleDelete(id: string) {
//     if (!canManage) {
//       setError(
//         "You do not have permission to manage fuel surcharges (LOGISTICS_SETTINGS_MANAGE).",
//       );
//       return;
//     }
//     if (!firebaseUser) return;
//     if (!window.confirm("Delete this fuel surcharge?")) return;

//     try {
//       setError(null);
//       setMessage(null);
//       const headers = await authHeaders();
//       const res = await fetch(
//         `/api/logistics/settings/fuel-surcharge?id=${encodeURIComponent(id)}`,
//         { method: "DELETE", headers, credentials: "include" },
//       );
//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Delete failed";
//         throw new Error(msg);
//       }
//       setMessage("Fuel surcharge deleted.");
//       if (editingId === id) cancelEdit();
//       await loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Delete failed");
//     }
//   }

//   if (authLoading) {
//     return (
//       <div className="mx-auto max-w-[1100px]">
//         <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
//           <p className="text-sm text-slate-500">
//             Loading user permissions...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (user && !canView) {
//     return (
//       <div className="mx-auto max-w-[1100px]">
//         <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
//           <h3 className="font-bold text-red-900">Access denied</h3>
//           <p className="mt-1 text-sm text-red-800">
//             Your role is <strong>{roleLabel}</strong>. Viewing fuel
//             surcharges requires{" "}
//             <code className="font-mono">LOGISTICS_RATE_VIEW</code> or{" "}
//             <code className="font-mono">LOGISTICS_SETTINGS_MANAGE</code>.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mx-auto max-w-[1100px] space-y-6">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>
//           <h1 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Fuel Surcharges
//           </h1>
//           <p className="mt-1 text-sm text-slate-500">
//             {canManage
//               ? "Add, edit, or delete carrier fuel surcharges (LOGISTICS_SETTINGS_MANAGE)."
//               : "View only — management requires LOGISTICS_SETTINGS_MANAGE."}
//           </p>
//           <p className="mt-1 text-xs text-slate-400">
//             Signed in as role: <strong>{roleLabel}</strong>
//           </p>
//         </div>
//         <button
//           type="button"
//           onClick={() => loadData()}
//           disabled={loading || authLoading}
//           className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
//         >
//           <RefreshCw className="h-4 w-4" />
//           Refresh
//         </button>
//       </div>

//       {error ? (
//         <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//           {error}
//         </div>
//       ) : null}
//       {message ? (
//         <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
//           {message}
//         </div>
//       ) : null}

//       {canManage ? (
//         <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//           <div className="mb-4 flex items-center justify-between">
//             <h2 className="font-bold text-[#06284c]">
//               {editingId ? "Edit surcharge" : "Add surcharge"}
//             </h2>
//             {editingId ? (
//               <button
//                 type="button"
//                 onClick={cancelEdit}
//                 className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"
//               >
//                 <X className="h-3.5 w-3.5" />
//                 Cancel
//               </button>
//             ) : null}
//           </div>

//           <form
//             onSubmit={handleSave}
//             className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
//           >
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Name / Carrier *
//               </label>
//               <input
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, name: e.target.value }))
//                 }
//                 placeholder="e.g. FedEx International"
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//                 required
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Percentage (%)
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 max={100}
//                 step="0.01"
//                 value={form.percentage}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, percentage: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Fixed amount (₹)
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 step="0.01"
//                 value={form.amount}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, amount: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Effective from
//               </label>
//               <input
//                 type="date"
//                 value={form.effectiveFrom}
//                 onChange={(e) =>
//                   setForm((f) => ({
//                     ...f,
//                     effectiveFrom: e.target.value,
//                   }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Effective to
//               </label>
//               <input
//                 type="date"
//                 value={form.effectiveTo}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, effectiveTo: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div className="flex items-end">
//               <label className="flex items-center gap-2 text-sm font-medium">
//                 <input
//                   type="checkbox"
//                   checked={form.enabled}
//                   onChange={(e) =>
//                     setForm((f) => ({ ...f, enabled: e.target.checked }))
//                   }
//                   className="h-4 w-4 rounded border-slate-300"
//                 />
//                 Active
//               </label>
//             </div>
//             <div className="sm:col-span-2 lg:col-span-3">
//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="inline-flex items-center gap-2 rounded-lg bg-[#087f87] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
//               >
//                 {editingId ? (
//                   <Save className="h-4 w-4" />
//                 ) : (
//                   <Plus className="h-4 w-4" />
//                 )}
//                 {saving
//                   ? "Saving…"
//                   : editingId
//                     ? "Update surcharge"
//                     : "Add surcharge"}
//               </button>
//             </div>
//           </form>
//         </section>
//       ) : (
//         <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
//           You can view fuel surcharges. Management requires{" "}
//           <code className="font-mono">LOGISTICS_SETTINGS_MANAGE</code>.
//         </div>
//       )}

//       <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         <div className="border-b border-slate-100 px-5 py-4">
//           <h2 className="font-bold text-[#06284c]">
//             Configured surcharges
//             <span className="ml-2 text-xs font-normal text-slate-400">
//               {rows.length} item(s)
//             </span>
//           </h2>
//         </div>

//         {loading || authLoading ? (
//           <div className="py-16 text-center text-sm text-slate-500">
//             Loading…
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="px-5 py-16 text-center text-sm text-slate-500">
//             No fuel surcharges configured yet.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[720px] text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">Name / Carrier</th>
//                   <th className="px-5 py-3">Percentage</th>
//                   <th className="px-5 py-3">Fixed amount</th>
//                   <th className="px-5 py-3">Effective</th>
//                   <th className="px-5 py-3">Status</th>
//                   {canManage ? (
//                     <th className="px-5 py-3">Actions</th>
//                   ) : null}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {rows.map((row) => (
//                   <tr key={row.id} className="hover:bg-slate-50/50">
//                     <td className="px-5 py-4 font-semibold">{row.name}</td>
//                     <td className="px-5 py-4">
//                       {row.percentage != null
//                         ? `${row.percentage}%`
//                         : "—"}
//                     </td>
//                     <td className="px-5 py-4">
//                       {row.amount != null
//                         ? `₹${Number(row.amount).toFixed(2)}`
//                         : "—"}
//                     </td>
//                     <td className="px-5 py-4 text-xs text-slate-500">
//                       {[row.effectiveFrom, row.effectiveTo]
//                         .filter(Boolean)
//                         .join(" → ") || "—"}
//                     </td>
//                     <td className="px-5 py-4">
//                       <span
//                         className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
//                           row.enabled
//                             ? "bg-emerald-100 text-emerald-700"
//                             : "bg-slate-100 text-slate-500"
//                         }`}
//                       >
//                         {row.enabled ? "Active" : "Disabled"}
//                       </span>
//                     </td>
//                     {canManage ? (
//                       <td className="px-5 py-4">
//                         <div className="flex gap-1">
//                           <button
//                             type="button"
//                             onClick={() => startEdit(row)}
//                             className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
//                           >
//                             <Pencil className="h-4 w-4" />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => handleDelete(row.id)}
//                             className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </td>
//                     ) : null}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Save, RefreshCw, Pencil, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { can } from "@/lib/permissions";
import type { UserRole } from "@/types/user";

type FuelSurcharge = {
  id: string;
  name: string;
  percentage?: number | null;
  amount?: number | null;
  enabled: boolean;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
};

type FormState = {
  name: string;
  percentage: string;
  amount: string;
  enabled: boolean;
  effectiveFrom: string;
  effectiveTo: string;
};

const emptyForm: FormState = {
  name: "",
  percentage: "",
  amount: "",
  enabled: true,
  effectiveFrom: "",
  effectiveTo: "",
};

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

export default function FuelSurchargesPage() {
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
    String(permissionUser?.role || "").toUpperCase() || "UNKNOWN";

  /** View list */
  const canView = can(permissionUser, "LOGISTICS_FUEL_SURCHARGE_VIEW");

  /** Add / edit / delete — Super Admin only per ROLE_PERMISSIONS */
  const canManage = can(
    permissionUser,
    "LOGISTICS_FUEL_SURCHARGE_MANAGE",
  );

  const [rows, setRows] = useState<FuelSurcharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    if (!firebaseUser) {
      throw new Error("Authentication is required.");
    }
    const token = await firebaseUser.getIdToken(true);
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, [firebaseUser]);

  const loadData = useCallback(async () => {
    if (!firebaseUser) {
      setError("Authentication is required.");
      setRows([]);
      setLoading(false);
      return;
    }

    if (!can(permissionUser, "LOGISTICS_FUEL_SURCHARGE_VIEW")) {
      setError(
        "You do not have permission to view fuel surcharges (LOGISTICS_FUEL_SURCHARGE_VIEW).",
      );
      setRows([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const headers = await authHeaders();
      const res = await fetch("/api/logistics/settings/fuel-surcharge", {
        headers,
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg =
          typeof json?.error === "string"
            ? json.error
            : json?.error?.message || "Failed to load fuel surcharges";
        throw new Error(msg);
      }

      const list = Array.isArray(json.data)
        ? json.data
        : json.data?.items || [];
      setRows(list as FuelSurcharge[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, authHeaders, user, role]);

  useEffect(() => {
    if (authLoading) return;
    loadData();
  }, [authLoading, loadData]);

  function startEdit(row: FuelSurcharge) {
    if (!canManage) return;
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      percentage:
        row.percentage != null && Number.isFinite(row.percentage)
          ? String(row.percentage)
          : "",
      amount:
        row.amount != null && Number.isFinite(row.amount)
          ? String(row.amount)
          : "",
      enabled: row.enabled !== false,
      effectiveFrom: row.effectiveFrom || "",
      effectiveTo: row.effectiveTo || "",
    });
    setMessage(null);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canManage) {
      setError(
        "You do not have permission to manage fuel surcharges (LOGISTICS_FUEL_SURCHARGE_MANAGE).",
      );
      return;
    }
    if (!firebaseUser) {
      setError("Authentication is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      if (!form.name.trim()) throw new Error("Name is required.");
      if (!form.percentage.trim() && !form.amount.trim()) {
        throw new Error("Enter a percentage and/or fixed amount.");
      }

      const headers = await authHeaders();
      const payload = {
        id: editingId || undefined,
        name: form.name.trim(),
        percentage: form.percentage.trim()
          ? Number(form.percentage)
          : null,
        amount: form.amount.trim() ? Number(form.amount) : null,
        enabled: form.enabled,
        effectiveFrom: form.effectiveFrom || null,
        effectiveTo: form.effectiveTo || null,
      };

      const res = await fetch("/api/logistics/settings/fuel-surcharge", {
        method: editingId ? "PUT" : "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg =
          typeof json?.error === "string"
            ? json.error
            : json?.error?.message || "Save failed";
        throw new Error(msg);
      }

      setMessage(
        json.message ||
          (editingId
            ? "Fuel surcharge updated."
            : "Fuel surcharge created."),
      );
      cancelEdit();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!canManage) {
      setError(
        "You do not have permission to manage fuel surcharges (LOGISTICS_FUEL_SURCHARGE_MANAGE).",
      );
      return;
    }
    if (!firebaseUser) return;
    if (!window.confirm("Delete this fuel surcharge?")) return;

    try {
      setError(null);
      setMessage(null);
      const headers = await authHeaders();
      const res = await fetch(
        `/api/logistics/settings/fuel-surcharge?id=${encodeURIComponent(id)}`,
        { method: "DELETE", headers, credentials: "include" },
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg =
          typeof json?.error === "string"
            ? json.error
            : json?.error?.message || "Delete failed";
        throw new Error(msg);
      }
      setMessage("Fuel surcharge deleted.");
      if (editingId === id) cancelEdit();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading user permissions...
          </p>
        </div>
      </div>
    );
  }

  if (user && !canView) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="font-bold text-red-900">Access denied</h3>
          <p className="mt-1 text-sm text-red-800">
            Your role is <strong>{roleLabel}</strong>. Viewing fuel
            surcharges requires{" "}
            <code className="font-mono">LOGISTICS_FUEL_SURCHARGE_VIEW</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Logistics
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#06284c]">
            Fuel Surcharges
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {canManage
              ? "Add, edit, or delete carrier fuel surcharges (LOGISTICS_FUEL_SURCHARGE_MANAGE)."
              : "View only — management requires LOGISTICS_FUEL_SURCHARGE_MANAGE (Super Admin)."}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Signed in as role: <strong>{roleLabel}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData()}
          disabled={loading || authLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {canManage ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-[#06284c]">
              {editingId ? "Edit surcharge" : "Add surcharge"}
            </h2>
            {editingId ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            ) : null}
          </div>

          <form
            onSubmit={handleSave}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Name / Carrier *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. FedEx International"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Percentage (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.percentage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, percentage: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Fixed amount (₹)
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Effective from
              </label>
              <input
                type="date"
                value={form.effectiveFrom}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    effectiveFrom: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Effective to
              </label>
              <input
                type="date"
                value={form.effectiveTo}
                onChange={(e) =>
                  setForm((f) => ({ ...f, effectiveTo: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.enabled}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, enabled: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                Active
              </label>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#087f87] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {editingId ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Update surcharge"
                    : "Add surcharge"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You can view fuel surcharges. Management requires{" "}
          <code className="font-mono">LOGISTICS_FUEL_SURCHARGE_MANAGE</code>{" "}
          (Super Admin only).
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-[#06284c]">
            Configured surcharges
            <span className="ml-2 text-xs font-normal text-slate-400">
              {rows.length} item(s)
            </span>
          </h2>
        </div>

        {loading || authLoading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm text-slate-500">
            No fuel surcharges configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Name / Carrier</th>
                  <th className="px-5 py-3">Percentage</th>
                  <th className="px-5 py-3">Fixed amount</th>
                  <th className="px-5 py-3">Effective</th>
                  <th className="px-5 py-3">Status</th>
                  {canManage ? (
                    <th className="px-5 py-3">Actions</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4 font-semibold">{row.name}</td>
                    <td className="px-5 py-4">
                      {row.percentage != null
                        ? `${row.percentage}%`
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      {row.amount != null
                        ? `₹${Number(row.amount).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      {[row.effectiveFrom, row.effectiveTo]
                        .filter(Boolean)
                        .join(" → ") || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          row.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {row.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    {canManage ? (
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(row)}
                            className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}