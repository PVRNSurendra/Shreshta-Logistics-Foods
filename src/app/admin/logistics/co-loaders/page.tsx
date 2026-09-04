// "use client";

// import { useEffect, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { Plus, Trash2, Save, RefreshCw, Pencil, Key } from "lucide-react";

// type CoLoader = {
//   id: string;
//   coLoaderId: string;
//   name: string;
//   code: string;              // e.g. WF439 / WH439
//   contactPerson?: string;
//   phone?: string;
//   email?: string;
//   loginUserId?: string;
//   enabled: boolean;
//   createdAt?: string;
// };

// type ApiResponse<T> =
//   | { success: true; data: T; message?: string }
//   | { success: false; error: { code: string; message: string } };

// export default function CoLoadersPage() {
//   const { user, loading: authLoading } = useAuth();

//   const [rows, setRows] = useState<CoLoader[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);

//   const [form, setForm] = useState({
//     name: "",
//     code: "",
//     contactPerson: "",
//     phone: "",
//     email: "",
//     enabled: true,
//     createLogin: false,
//     password: "",
//   });

//   const loadData = async () => {
//     if (!user) return;
//     try {
//       setLoading(true);
//       setError(null);

//       const token = await user.getIdToken();
//       const res = await fetch("/api/logistics/coloaders", {
//         headers: { Authorization: `Bearer ${token}` },
//         cache: "no-store",
//       });

//       const json = (await res.json()) as ApiResponse<CoLoader[] | { items: CoLoader[] }>;

//       if (!json.success) {
//         throw new Error(json.error?.message || "Failed to load co-loaders");
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
//     setForm({
//       name: "",
//       code: "",
//       contactPerson: "",
//       phone: "",
//       email: "",
//       enabled: true,
//       createLogin: false,
//       password: "",
//     });
//     setEditingId(null);
//   };

//   const startEdit = (row: CoLoader) => {
//     setEditingId(row.id);
//     setForm({
//       name: row.name,
//       code: row.code,
//       contactPerson: row.contactPerson || "",
//       phone: row.phone || "",
//       email: row.email || "",
//       enabled: row.enabled,
//       createLogin: false,
//       password: "",
//     });
//   };

//   const handleSave = async () => {
//     if (!user) return;
//     if (!form.name.trim() || !form.code.trim()) {
//       setError("Name and Account Code are required");
//       return;
//     }

//     try {
//       setSaving(true);
//       setError(null);

//       const token = await user.getIdToken();
//       const payload = {
//         id: editingId || undefined,
//         name: form.name.trim(),
//         code: form.code.trim().toUpperCase(),
//         contactPerson: form.contactPerson.trim() || undefined,
//         phone: form.phone.trim() || undefined,
//         email: form.email.trim() || undefined,
//         enabled: form.enabled,
//         createLogin: form.createLogin,
//         password: form.createLogin ? form.password : undefined,
//       };

//       const res = await fetch("/api/logistics/coloaders", {
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

//       setMessage(editingId ? "Co-loader updated" : "Co-loader created successfully");
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
//     if (!user || !confirm("Delete this co-loader?")) return;

//     try {
//       const token = await user.getIdToken();
//       const res = await fetch(`/api/logistics/coloaders?id=${id}`, {
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
//     <div className="mx-auto max-w-[1200px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>
//           <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Co-Loaders
//           </h2>
//           <p className="mt-1 text-sm text-slate-500">
//             Super Admin only — Create co-loader accounts and assign codes (e.g. WF439 / WH439).
//             Account code appears on AWB Labels and Proforma Invoices.
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

//       {/* Form */}
//       <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//         <h3 className="mb-4 text-sm font-semibold text-slate-800">
//           {editingId ? "Edit Co-Loader" : "Add New Co-Loader"}
//         </h3>

//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Company / Name *
//             </label>
//             <input
//               value={form.name}
//               onChange={(e) => setForm({ ...form, name: e.target.value })}
//               className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Account Code * (e.g. WF439)
//             </label>
//             <input
//               value={form.code}
//               onChange={(e) =>
//                 setForm({ ...form, code: e.target.value.toUpperCase() })
//               }
//               placeholder="WF439"
//               className="h-10 w-full rounded border border-gray-300 px-3 text-sm font-mono outline-none focus:border-slate-600"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Contact Person
//             </label>
//             <input
//               value={form.contactPerson}
//               onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
//               className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Phone
//             </label>
//             <input
//               value={form.phone}
//               onChange={(e) => setForm({ ...form, phone: e.target.value })}
//               className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
//             />
//           </div>

//           <div>
//             <label className="mb-1 block text-xs font-medium text-gray-600">
//               Email
//             </label>
//             <input
//               type="email"
//               value={form.email}
//               onChange={(e) => setForm({ ...form, email: e.target.value })}
//               className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
//             />
//           </div>

//           <div className="flex items-end gap-4">
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
//         </div>

//         {/* Create Login option */}
//         {!editingId && (
//           <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
//             <label className="flex items-center gap-2 text-sm font-medium">
//               <input
//                 type="checkbox"
//                 checked={form.createLogin}
//                 onChange={(e) =>
//                   setForm({ ...form, createLogin: e.target.checked })
//                 }
//                 className="h-4 w-4"
//               />
//               <Key className="h-4 w-4" />
//               Create login for this co-loader
//             </label>

//             {form.createLogin && (
//               <div className="mt-3 max-w-xs">
//                 <label className="mb-1 block text-xs font-medium text-gray-600">
//                   Temporary Password
//                 </label>
//                 <input
//                   type="text"
//                   value={form.password}
//                   onChange={(e) => setForm({ ...form, password: e.target.value })}
//                   placeholder="Min 6 characters"
//                   className="h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-slate-600"
//                 />
//               </div>
//             )}
//           </div>
//         )}

//         <div className="mt-5 flex gap-3">
//           <button
//             type="button"
//             onClick={handleSave}
//             disabled={saving}
//             className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#087f87] px-6 text-sm font-bold text-white disabled:opacity-60"
//           >
//             <Save className="h-4 w-4" />
//             {saving ? "Saving…" : editingId ? "Update Co-Loader" : "Create Co-Loader"}
//           </button>

//           {editingId && (
//             <button
//               type="button"
//               onClick={resetForm}
//               className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-medium"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         {loading || authLoading ? (
//           <div className="py-16 text-center text-sm text-gray-500">Loading…</div>
//         ) : rows.length === 0 ? (
//           <div className="py-16 text-center text-sm text-gray-500">
//             No co-loaders created yet.
//           </div>
//         ) : (
//           <table className="w-full text-left text-sm">
//             <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//               <tr>
//                 <th className="px-5 py-3">Account Code</th>
//                 <th className="px-5 py-3">Name</th>
//                 <th className="px-5 py-3">Contact</th>
//                 <th className="px-5 py-3">Phone / Email</th>
//                 <th className="px-5 py-3">Status</th>
//                 <th className="px-5 py-3">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {rows.map((row) => (
//                 <tr key={row.id} className="hover:bg-slate-50/50">
//                   <td className="px-5 py-4">
//                     <span className="rounded bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white">
//                       {row.code}
//                     </span>
//                   </td>
//                   <td className="px-5 py-4 font-semibold">{row.name}</td>
//                   <td className="px-5 py-4 text-slate-600">
//                     {row.contactPerson || "—"}
//                   </td>
//                   <td className="px-5 py-4 text-xs text-slate-500">
//                     <div>{row.phone || "—"}</div>
//                     <div>{row.email || ""}</div>
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
//                         className="rounded p-1.5 text-gray-500 hover:bg-slate-100"
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

// type CoLoader = {
//   id: string;
//   coLoaderId?: string;
//   name: string;
//   code: string;
//   contactPerson?: string;
//   phone?: string;
//   email?: string;
//   location?: string;
//   enabled: boolean;
// };

// type FormState = {
//   name: string;
//   code: string;
//   contactPerson: string;
//   phone: string;
//   email: string;
//   location: string;
//   enabled: boolean;
// };

// const emptyForm: FormState = {
//   name: "",
//   code: "",
//   contactPerson: "",
//   phone: "",
//   email: "",
//   location: "",
//   enabled: true,
// };

// export default function CoLoadersPage() {
//   const { firebaseUser, user, loading: authLoading } = useAuth();

//   const canManage =
//     user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

//   const [rows, setRows] = useState<CoLoader[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [form, setForm] = useState<FormState>(emptyForm);

//   const authHeaders = useCallback(async (): Promise<HeadersInit> => {
//     if (!firebaseUser) throw new Error("Authentication is required.");
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
//       const res = await fetch("/api/logistics/coloaders", {
//         headers,
//         credentials: "include",
//         cache: "no-store",
//       });
//       const json = await res.json();
//       if (!res.ok || !json.success) {
//         const msg =
//           typeof json?.error === "string"
//             ? json.error
//             : json?.error?.message || "Failed to load co-loaders";
//         throw new Error(msg);
//       }
//       const list = Array.isArray(json.data)
//         ? json.data
//         : json.data?.items || [];
//       setRows(list as CoLoader[]);
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

//   function startEdit(row: CoLoader) {
//     if (!canManage) return;
//     setEditingId(row.id);
//     setForm({
//       name: row.name || "",
//       code: row.code || "",
//       contactPerson: row.contactPerson || "",
//       phone: row.phone || "",
//       email: row.email || "",
//       location: row.location || "",
//       enabled: row.enabled !== false,
//     });
//     setError(null);
//     setMessage(null);
//   }

//   function cancelEdit() {
//     setEditingId(null);
//     setForm(emptyForm);
//   }

//   async function handleSave(e?: React.FormEvent) {
//     e?.preventDefault();
//     if (!canManage) {
//       setError("You do not have permission to manage co-loaders.");
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

//       if (!form.name.trim() || !form.code.trim()) {
//         throw new Error("Name and Account Code are required.");
//       }

//       const headers = await authHeaders();
//       const payload = {
//         id: editingId || undefined,
//         name: form.name.trim(),
//         code: form.code.trim().toUpperCase(),
//         contactPerson: form.contactPerson.trim(),
//         phone: form.phone.trim(),
//         email: form.email.trim(),
//         location: form.location.trim(),
//         enabled: form.enabled,
//       };

//       const res = await fetch("/api/logistics/coloaders", {
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
//             : json?.error?.message || "Failed to save";
//         throw new Error(msg);
//       }

//       setMessage(
//         json.message ||
//           (editingId ? "Co-loader updated." : "Co-loader created."),
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
//       setError("You do not have permission to manage co-loaders.");
//       return;
//     }
//     if (!firebaseUser) return;
//     if (!window.confirm("Delete this co-loader?")) return;

//     try {
//       setError(null);
//       setMessage(null);
//       const headers = await authHeaders();
//       const res = await fetch(
//         `/api/logistics/coloaders?id=${encodeURIComponent(id)}`,
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
//       setMessage("Deleted successfully.");
//       if (editingId === id) cancelEdit();
//       await loadData();
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Delete failed");
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[1200px] space-y-6">
//       <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//             Logistics
//           </p>
//           <h1 className="mt-1 text-2xl font-bold text-[#06284c]">
//             Co-Loaders
//           </h1>
//           <p className="mt-1 text-sm text-slate-500">
//             Account codes (e.g. WF439) appear on AWB labels and bookings.
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
//               {editingId ? "Edit co-loader" : "Add co-loader"}
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
//                 Company / Name *
//               </label>
//               <input
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, name: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//                 required
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Account code * (e.g. WF439)
//               </label>
//               <input
//                 value={form.code}
//                 onChange={(e) =>
//                   setForm((f) => ({
//                     ...f,
//                     code: e.target.value.toUpperCase(),
//                   }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm"
//                 required
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Contact person
//               </label>
//               <input
//                 value={form.contactPerson}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, contactPerson: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Phone
//               </label>
//               <input
//                 value={form.phone}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, phone: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 value={form.email}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, email: e.target.value }))
//                 }
//                 className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
//               />
//             </div>
//             <div>
//               <label className="mb-1.5 block text-xs font-bold text-slate-600">
//                 Location
//               </label>
//               <input
//                 value={form.location}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, location: e.target.value }))
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
//                     ? "Update co-loader"
//                     : "Create co-loader"}
//               </button>
//             </div>
//           </form>
//         </section>
//       ) : (
//         <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
//           View only. Super Admin / Admin can manage co-loaders.
//         </div>
//       )}

//       <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//         <div className="border-b border-slate-100 px-5 py-4">
//           <h2 className="font-bold text-[#06284c]">
//             Co-loaders
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
//           <div className="py-16 text-center text-sm text-slate-500">
//             No co-loaders created yet.
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[800px] text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">Account code</th>
//                   <th className="px-5 py-3">Name</th>
//                   <th className="px-5 py-3">Contact</th>
//                   <th className="px-5 py-3">Phone / Email</th>
//                   <th className="px-5 py-3">Status</th>
//                   {canManage ? <th className="px-5 py-3">Actions</th> : null}
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {rows.map((row) => (
//                   <tr key={row.id} className="hover:bg-slate-50/50">
//                     <td className="px-5 py-4">
//                       <span className="rounded bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white">
//                         {row.code || "—"}
//                       </span>
//                     </td>
//                     <td className="px-5 py-4 font-semibold">{row.name}</td>
//                     <td className="px-5 py-4 text-slate-600">
//                       {row.contactPerson || "—"}
//                     </td>
//                     <td className="px-5 py-4 text-xs text-slate-500">
//                       <div>{row.phone || "—"}</div>
//                       <div>{row.email || ""}</div>
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

type CoLoader = {
  id: string;
  coLoaderId?: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  location?: string;
  enabled: boolean;
  hasLogin?: boolean;
};

type FormState = {
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  password: string;
  confirmPassword: string;
  enabled: boolean;
};

const emptyForm: FormState = {
  name: "",
  code: "",
  contactPerson: "",
  phone: "",
  email: "",
  location: "",
  password: "",
  confirmPassword: "",
  enabled: true,
};

export default function CoLoadersPage() {
  const { firebaseUser, user, loading: authLoading } = useAuth();
  const canManage =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const [rows, setRows] = useState<CoLoader[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    if (!firebaseUser) throw new Error("Authentication is required.");
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

    try {
      setLoading(true);
      setError(null);
      const headers = await authHeaders();
      const res = await fetch("/api/logistics/coloaders", {
        headers,
        credentials: "include",
        cache: "no-store",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg =
          typeof json?.error === "string"
            ? json.error
            : json?.error?.message || "Failed to load co-loaders";
        throw new Error(msg);
      }

      const list = Array.isArray(json.data)
        ? json.data
        : json.data?.items || [];
      setRows(list as CoLoader[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser, authHeaders]);

  useEffect(() => {
    if (authLoading) return;
    loadData();
  }, [authLoading, loadData]);

  function startEdit(row: CoLoader) {
    if (!canManage) return;
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      code: row.code || "",
      contactPerson: row.contactPerson || "",
      phone: row.phone || "",
      email: row.email || "",
      location: row.location || "",
      password: "",
      confirmPassword: "",
      enabled: row.enabled !== false,
    });
    setError(null);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();

    if (!canManage) {
      setError("You do not have permission to manage co-loaders.");
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

      if (!form.name.trim() || !form.code.trim()) {
        throw new Error("Name and Account Code are required.");
      }

      const password = form.password.trim();
      const confirmPassword = form.confirmPassword.trim();

      // Create: password required
      if (!editingId) {
        if (!password) {
          throw new Error("Password is required when creating a co-loader.");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Password and confirm password do not match.");
        }
        if (!form.email.trim()) {
          throw new Error(
            "Email is required when setting a password (used for login).",
          );
        }
      }

      // Edit: password optional; if filled, validate
      if (editingId && password) {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Password and confirm password do not match.");
        }
        if (!form.email.trim()) {
          throw new Error("Email is required to set or change a password.");
        }
      }

      const headers = await authHeaders();
      const payload: Record<string, unknown> = {
        id: editingId || undefined,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase(),
        location: form.location.trim(),
        enabled: form.enabled,
      };

      if (password) {
        payload.password = password;
      }

      const res = await fetch("/api/logistics/coloaders", {
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
            : json?.error?.message || "Failed to save";
        throw new Error(msg);
      }

      setMessage(
        json.message ||
          (editingId ? "Co-loader updated." : "Co-loader created."),
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
      setError("You do not have permission to manage co-loaders.");
      return;
    }
    if (!firebaseUser) return;
    if (!window.confirm("Delete this co-loader?")) return;

    try {
      setError(null);
      setMessage(null);
      const headers = await authHeaders();
      const res = await fetch(
        `/api/logistics/coloaders?id=${encodeURIComponent(id)}`,
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

      setMessage("Deleted successfully.");
      if (editingId === id) cancelEdit();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
            Logistics
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#06284c]">
            Co-Loaders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Account codes (e.g. WF439) appear on AWB labels and bookings.
            Password is used for co-loader login (email + password).
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
              {editingId ? "Edit co-loader" : "Add co-loader"}
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
                Company / Name *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Account code * (e.g. WF439)
              </label>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Contact person
              </label>
              <input
                value={form.contactPerson}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPerson: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Email {editingId ? "" : "*"}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                required={!editingId}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Location
              </label>
              <input
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Password {editingId ? "(leave blank to keep)" : "*"}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                required={!editingId}
                minLength={editingId ? undefined : 6}
                autoComplete="new-password"
                placeholder={
                  editingId ? "Leave blank to keep current password" : ""
                }
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Confirm password {editingId ? "" : "*"}
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                required={!editingId}
                minLength={editingId ? undefined : 6}
                autoComplete="new-password"
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
                    ? "Update co-loader"
                    : "Create co-loader"}
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          View only. Super Admin / Admin can manage co-loaders.
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-[#06284c]">
            Co-loaders
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
          <div className="py-16 text-center text-sm text-slate-500">
            No co-loaders created yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Account code</th>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Contact</th>
                  <th className="px-5 py-3">Phone / Email</th>
                  <th className="px-5 py-3">Login</th>
                  <th className="px-5 py-3">Status</th>
                  {canManage ? <th className="px-5 py-3">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <span className="rounded bg-slate-900 px-2.5 py-1 font-mono text-xs font-bold text-white">
                        {row.code || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{row.name}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {row.contactPerson || "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">
                      <div>{row.phone || "—"}</div>
                      <div>{row.email || ""}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          row.hasLogin
                            ? "bg-sky-100 text-sky-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {row.hasLogin ? "Enabled" : "No login"}
                      </span>
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