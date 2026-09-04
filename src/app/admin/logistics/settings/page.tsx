// "use client";

// import { FormEvent, useEffect, useState } from "react";
// import { useAuth } from "@/context/AuthContext";

// type LogisticsSettings = {
//   companyDisplayName: string;
//   defaultServiceCenter: string;
//   defaultCurrency: string;
//   requireCustomerSelection: boolean;
//   requireReceiverPhone: boolean;
//   requireShipmentDescription: boolean;
//   enablePublicTracking: boolean;
//   showLatestLocationPublicly: boolean;
//   showInternalNotesPublicly: boolean;
//   enableTransactionalNotifications: boolean;
//   enableWhatsAppIntegration: boolean;
// };

// type ApiResponse =
//   | {
//       success: true;
//       data: LogisticsSettings;
//       message?: string;
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// const DEFAULT_SETTINGS: LogisticsSettings = {
//   companyDisplayName: "Sreshta Logistics",
//   defaultServiceCenter: "",
//   defaultCurrency: "INR",
//   requireCustomerSelection: true,
//   requireReceiverPhone: true,
//   requireShipmentDescription: true,
//   enablePublicTracking: true,
//   showLatestLocationPublicly: true,
//   showInternalNotesPublicly: false,
//   enableTransactionalNotifications: true,
//   enableWhatsAppIntegration: false,
// };

// export default function LogisticsSettingsPage() {
//   const { user, loading: authLoading } = useAuth();

//   const [settings, setSettings] =
//     useState<LogisticsSettings>(DEFAULT_SETTINGS);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [dirty, setDirty] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (authLoading) return;

//     let cancelled = false;

//     async function loadSettings() {
//       try {
//         setLoading(true);
//         setError(null);

//         if (!user) {
//           throw new Error("Authentication is required to manage settings.");
//         }

//         const token = await user.getIdToken();

//         const res = await fetch("/api/logistics/settings", {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           cache: "no-store",
//         });

//         const json = (await res.json()) as ApiResponse;

//         if (!json.success) {
//           throw new Error(
//             json.error?.message || "Failed to load logistics settings.",
//           );
//         }

//         if (!cancelled) {
//           setSettings({
//             ...DEFAULT_SETTINGS,
//             ...json.data,
//           });
//           setDirty(false);
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(
//             e instanceof Error
//               ? e.message
//               : "Failed to load logistics settings.",
//           );
//           setSettings(DEFAULT_SETTINGS);
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     loadSettings();

//     return () => {
//       cancelled = true;
//     };
//   }, [authLoading, user]);

//   function updateField<K extends keyof LogisticsSettings>(
//     key: K,
//     value: LogisticsSettings[K],
//   ) {
//     setSettings((current) => ({
//       ...current,
//       [key]: value,
//     }));
//     setDirty(true);
//     setMessage(null);
//   }

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     try {
//       setSaving(true);
//       setError(null);
//       setMessage(null);

//       if (!user) {
//         throw new Error("Authentication is required.");
//       }

//       const companyDisplayName = settings.companyDisplayName.trim();

//       if (!companyDisplayName) {
//         throw new Error("Company display name is required.");
//       }

//       if (!settings.defaultCurrency.trim()) {
//         throw new Error("Default currency is required.");
//       }

//       const token = await user.getIdToken();

//       const payload: LogisticsSettings = {
//         ...settings,
//         companyDisplayName,
//         defaultServiceCenter: settings.defaultServiceCenter.trim(),
//         defaultCurrency: settings.defaultCurrency.trim().toUpperCase(),
//       };

//       const res = await fetch("/api/logistics/settings", {
//         method: "PUT",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const json = (await res.json()) as ApiResponse;

//       if (!json.success) {
//         throw new Error(
//           json.error?.message || "Failed to save logistics settings.",
//         );
//       }

//       setSettings({
//         ...DEFAULT_SETTINGS,
//         ...json.data,
//       });
//       setDirty(false);
//       setMessage(json.message || "Settings saved successfully.");
//     } catch (e) {
//       setError(
//         e instanceof Error
//           ? e.message
//           : "Failed to save logistics settings.",
//       );
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[1100px]">
//       <div className="mb-6">
//         <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//           Logistics
//         </p>
//         <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
//           Logistics Settings
//         </h2>
//         <p className="mt-1 text-sm text-slate-500">
//           Configure operational preferences. Changes are stored server-side.
//         </p>
//       </div>

//       {message && (
//         <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
//           {message}
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {loading || authLoading ? (
//         <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//           <h3 className="text-lg font-bold text-[#06284c]">
//             Loading settings…
//           </h3>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <Section title="General">
//             <Field
//               label="Company Display Name"
//               value={settings.companyDisplayName}
//               onChange={(value) => updateField("companyDisplayName", value)}
//               required
//             />
//             <Field
//               label="Default Service Center"
//               value={settings.defaultServiceCenter}
//               onChange={(value) => updateField("defaultServiceCenter", value)}
//               placeholder="serviceCenterId (optional)"
//             />
//             <Field
//               label="Default Currency"
//               value={settings.defaultCurrency}
//               onChange={(value) => updateField("defaultCurrency", value)}
//               required
//             />
//           </Section>

//           <Section title="Booking">
//             <Toggle
//               label="Require customer selection"
//               checked={settings.requireCustomerSelection}
//               onChange={(value) =>
//                 updateField("requireCustomerSelection", value)
//               }
//             />
//             <Toggle
//               label="Require receiver phone"
//               checked={settings.requireReceiverPhone}
//               onChange={(value) => updateField("requireReceiverPhone", value)}
//             />
//             <Toggle
//               label="Require shipment description"
//               checked={settings.requireShipmentDescription}
//               onChange={(value) =>
//                 updateField("requireShipmentDescription", value)
//               }
//             />
//           </Section>

//           <Section title="Tracking">
//             <Toggle
//               label="Enable public tracking"
//               checked={settings.enablePublicTracking}
//               onChange={(value) => updateField("enablePublicTracking", value)}
//             />
//             <Toggle
//               label="Show latest location publicly"
//               checked={settings.showLatestLocationPublicly}
//               onChange={(value) =>
//                 updateField("showLatestLocationPublicly", value)
//               }
//             />
//             <Toggle
//               label="Show internal operational notes publicly"
//               checked={settings.showInternalNotesPublicly}
//               onChange={(value) =>
//                 updateField("showInternalNotesPublicly", value)
//               }
//             />
//           </Section>

//           <Section title="Notifications">
//             <Toggle
//               label="Enable transactional notifications"
//               checked={settings.enableTransactionalNotifications}
//               onChange={(value) =>
//                 updateField("enableTransactionalNotifications", value)
//               }
//             />
//             <Toggle
//               label="Enable WhatsApp integration"
//               checked={settings.enableWhatsAppIntegration}
//               onChange={(value) =>
//                 updateField("enableWhatsAppIntegration", value)
//               }
//             />
//           </Section>

//           <div className="flex justify-end gap-2">
//             <button
//               type="submit"
//               disabled={saving || !dirty}
//               className="rounded-lg bg-[#087f87] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
//             >
//               {saving ? "Saving…" : "Save Settings"}
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
//         Settings are stored in Firestore and protected by auth + permission
//         checks. Client UI never bypasses server authorization.
//       </div>
//     </div>
//   );
// }

// function Section({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
//       <div className="border-b border-slate-200 px-5 py-4">
//         <h3 className="font-bold text-[#06284c]">{title}</h3>
//       </div>
//       <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
//     </section>
//   );
// }

// function Field({
//   label,
//   value,
//   onChange,
//   required,
//   placeholder,
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   required?: boolean;
//   placeholder?: string;
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-xs font-bold text-slate-600">
//         {label}
//         {required ? " *" : ""}
//       </label>
//       <input
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         required={required}
//         placeholder={placeholder}
//         className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#087f87] focus:ring-2 focus:ring-cyan-100"
//       />
//     </div>
//   );
// }

// function Toggle({
//   label,
//   checked,
//   onChange,
// }: {
//   label: string;
//   checked: boolean;
//   onChange: (value: boolean) => void;
// }) {
//   return (
//     <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
//       <span className="text-sm font-semibold">{label}</span>
//       <input
//         type="checkbox"
//         checked={checked}
//         onChange={(e) => onChange(e.target.checked)}
//         className="h-4 w-4 accent-[#087f87]"
//       />
//     </label>
//   );
// }

// "use client";

// import { FormEvent, useEffect, useState } from "react";
// import { useAuth } from "@/context/AuthContext";

// type LogisticsSettings = {
//   companyDisplayName: string;
//   defaultServiceCenter: string;
//   defaultCurrency: string;
//   requireCustomerSelection: boolean;
//   requireReceiverPhone: boolean;
//   requireShipmentDescription: boolean;
//   enablePublicTracking: boolean;
//   showLatestLocationPublicly: boolean;
//   showInternalNotesPublicly: boolean;
//   enableTransactionalNotifications: boolean;
//   enableWhatsAppIntegration: boolean;
// };

// type ApiResponse =
//   | {
//       success: true;
//       data: LogisticsSettings | { settings?: LogisticsSettings };
//       message?: string;
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// const DEFAULT_SETTINGS: LogisticsSettings = {
//   companyDisplayName: "Sreshta Logistics",
//   defaultServiceCenter: "",
//   defaultCurrency: "INR",
//   requireCustomerSelection: true,
//   requireReceiverPhone: true,
//   requireShipmentDescription: true,
//   enablePublicTracking: true,
//   showLatestLocationPublicly: true,
//   showInternalNotesPublicly: false,
//   enableTransactionalNotifications: true,
//   enableWhatsAppIntegration: false,
// };

// function normalizeLoadedSettings(data: unknown): LogisticsSettings {
//   if (!data || typeof data !== "object") {
//     return { ...DEFAULT_SETTINGS };
//   }

//   const raw = data as Record<string, unknown>;
//   const nested =
//     raw.settings && typeof raw.settings === "object"
//       ? (raw.settings as Record<string, unknown>)
//       : raw;

//   return {
//     ...DEFAULT_SETTINGS,
//     companyDisplayName: String(
//       nested.companyDisplayName ?? DEFAULT_SETTINGS.companyDisplayName,
//     ),
//     defaultServiceCenter: String(nested.defaultServiceCenter ?? ""),
//     defaultCurrency: String(
//       nested.defaultCurrency ?? DEFAULT_SETTINGS.defaultCurrency,
//     ).toUpperCase(),
//     requireCustomerSelection:
//       nested.requireCustomerSelection === undefined
//         ? DEFAULT_SETTINGS.requireCustomerSelection
//         : Boolean(nested.requireCustomerSelection),
//     requireReceiverPhone:
//       nested.requireReceiverPhone === undefined
//         ? DEFAULT_SETTINGS.requireReceiverPhone
//         : Boolean(nested.requireReceiverPhone),
//     requireShipmentDescription:
//       nested.requireShipmentDescription === undefined
//         ? DEFAULT_SETTINGS.requireShipmentDescription
//         : Boolean(nested.requireShipmentDescription),
//     enablePublicTracking:
//       nested.enablePublicTracking === undefined
//         ? DEFAULT_SETTINGS.enablePublicTracking
//         : Boolean(nested.enablePublicTracking),
//     showLatestLocationPublicly:
//       nested.showLatestLocationPublicly === undefined
//         ? DEFAULT_SETTINGS.showLatestLocationPublicly
//         : Boolean(nested.showLatestLocationPublicly),
//     showInternalNotesPublicly:
//       nested.showInternalNotesPublicly === undefined
//         ? DEFAULT_SETTINGS.showInternalNotesPublicly
//         : Boolean(nested.showInternalNotesPublicly),
//     enableTransactionalNotifications:
//       nested.enableTransactionalNotifications === undefined
//         ? DEFAULT_SETTINGS.enableTransactionalNotifications
//         : Boolean(nested.enableTransactionalNotifications),
//     enableWhatsAppIntegration:
//       nested.enableWhatsAppIntegration === undefined
//         ? DEFAULT_SETTINGS.enableWhatsAppIntegration
//         : Boolean(nested.enableWhatsAppIntegration),
//   };
// }

// export default function LogisticsSettingsPage() {
//   const {
//     firebaseUser,
//     user,
//     loading: authLoading,
//   } = useAuth();

//   const [settings, setSettings] =
//     useState<LogisticsSettings>(DEFAULT_SETTINGS);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [dirty, setDirty] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (authLoading) return;

//     let cancelled = false;

//     async function loadSettings() {
//       try {
//         setLoading(true);
//         setError(null);

//         if (!firebaseUser) {
//           throw new Error("Authentication is required to manage settings.");
//         }

//         const token = await firebaseUser.getIdToken(true);

//         const res = await fetch("/api/logistics/settings", {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           cache: "no-store",
//         });

//         const json = (await res.json()) as ApiResponse;

//         if (!res.ok || !json.success) {
//           throw new Error(
//             !json.success
//               ? json.error?.message || "Failed to load logistics settings."
//               : "Failed to load logistics settings.",
//           );
//         }

//         if (!cancelled) {
//           setSettings(normalizeLoadedSettings(json.data));
//           setDirty(false);
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(
//             e instanceof Error
//               ? e.message
//               : "Failed to load logistics settings.",
//           );
//           setSettings(DEFAULT_SETTINGS);
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     loadSettings();

//     return () => {
//       cancelled = true;
//     };
//   }, [authLoading, firebaseUser]);

//   function updateField<K extends keyof LogisticsSettings>(
//     key: K,
//     value: LogisticsSettings[K],
//   ) {
//     setSettings((current) => ({
//       ...current,
//       [key]: value,
//     }));
//     setDirty(true);
//     setMessage(null);
//   }

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     try {
//       setSaving(true);
//       setError(null);
//       setMessage(null);

//       if (!firebaseUser) {
//         throw new Error("Authentication is required.");
//       }

//       const companyDisplayName = settings.companyDisplayName.trim();
//       if (!companyDisplayName) {
//         throw new Error("Company display name is required.");
//       }

//       if (!settings.defaultCurrency.trim()) {
//         throw new Error("Default currency is required.");
//       }

//       const token = await firebaseUser.getIdToken(true);

//       const payload: LogisticsSettings = {
//         ...settings,
//         companyDisplayName,
//         defaultServiceCenter: settings.defaultServiceCenter.trim(),
//         defaultCurrency: settings.defaultCurrency.trim().toUpperCase(),
//       };

//       const res = await fetch("/api/logistics/settings", {
//         method: "PUT",
//         headers: {
//           Accept: "application/json",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const json = (await res.json()) as ApiResponse;

//       if (!res.ok || !json.success) {
//         throw new Error(
//           !json.success
//             ? json.error?.message || "Failed to save logistics settings."
//             : "Failed to save logistics settings.",
//         );
//       }

//       setSettings(normalizeLoadedSettings(json.data));
//       setDirty(false);
//       setMessage(json.message || "Settings saved successfully.");
//     } catch (e) {
//       setError(
//         e instanceof Error
//           ? e.message
//           : "Failed to save logistics settings.",
//       );
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <div className="mx-auto max-w-[1100px]">
//       <div className="mb-6">
//         <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
//           Logistics
//         </p>
//         <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
//           Logistics Settings
//         </h2>
//         <p className="mt-1 text-sm text-slate-500">
//           Configure operational preferences. Changes are stored server-side.
//         </p>
//         {user?.role ? (
//           <p className="mt-1 text-xs text-slate-400">
//             Signed in as role: <strong>{user.role}</strong>
//           </p>
//         ) : null}
//       </div>

//       {message && (
//         <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
//           {message}
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {loading || authLoading ? (
//         <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//           <h3 className="text-lg font-bold text-[#06284c]">
//             Loading settings…
//           </h3>
//         </div>
//       ) : !firebaseUser ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
//           Authentication is required to manage logistics settings.
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <Section title="General">
//             <Field
//               label="Company Display Name"
//               value={settings.companyDisplayName}
//               onChange={(value) => updateField("companyDisplayName", value)}
//               required
//             />
//             <Field
//               label="Default Service Center"
//               value={settings.defaultServiceCenter}
//               onChange={(value) => updateField("defaultServiceCenter", value)}
//               placeholder="serviceCenterId (optional)"
//             />
//             <Field
//               label="Default Currency"
//               value={settings.defaultCurrency}
//               onChange={(value) => updateField("defaultCurrency", value)}
//               required
//             />
//           </Section>

//           <Section title="Booking">
//             <Toggle
//               label="Require customer selection"
//               checked={settings.requireCustomerSelection}
//               onChange={(value) =>
//                 updateField("requireCustomerSelection", value)
//               }
//             />
//             <Toggle
//               label="Require receiver phone"
//               checked={settings.requireReceiverPhone}
//               onChange={(value) => updateField("requireReceiverPhone", value)}
//             />
//             <Toggle
//               label="Require shipment description"
//               checked={settings.requireShipmentDescription}
//               onChange={(value) =>
//                 updateField("requireShipmentDescription", value)
//               }
//             />
//           </Section>

//           <Section title="Tracking">
//             <Toggle
//               label="Enable public tracking"
//               checked={settings.enablePublicTracking}
//               onChange={(value) => updateField("enablePublicTracking", value)}
//             />
//             <Toggle
//               label="Show latest location publicly"
//               checked={settings.showLatestLocationPublicly}
//               onChange={(value) =>
//                 updateField("showLatestLocationPublicly", value)
//               }
//             />
//             <Toggle
//               label="Show internal operational notes publicly"
//               checked={settings.showInternalNotesPublicly}
//               onChange={(value) =>
//                 updateField("showInternalNotesPublicly", value)
//               }
//             />
//           </Section>

//           <Section title="Notifications">
//             <Toggle
//               label="Enable transactional notifications"
//               checked={settings.enableTransactionalNotifications}
//               onChange={(value) =>
//                 updateField("enableTransactionalNotifications", value)
//               }
//             />
//             <Toggle
//               label="Enable WhatsApp integration"
//               checked={settings.enableWhatsAppIntegration}
//               onChange={(value) =>
//                 updateField("enableWhatsAppIntegration", value)
//               }
//             />
//           </Section>

//           <div className="flex justify-end gap-2">
//             <button
//               type="submit"
//               disabled={saving || !dirty || !firebaseUser}
//               className="rounded-lg bg-[#087f87] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
//             >
//               {saving ? "Saving…" : "Save Settings"}
//             </button>
//           </div>
//         </form>
//       )}

//       <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
//         Settings are stored in Firestore and protected by auth + permission
//         checks. Client UI never bypasses server authorization.
//       </div>
//     </div>
//   );
// }

// function Section({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   return (
//     <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
//       <div className="border-b border-slate-200 px-5 py-4">
//         <h3 className="font-bold text-[#06284c]">{title}</h3>
//       </div>
//       <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
//     </section>
//   );
// }

// function Field({
//   label,
//   value,
//   onChange,
//   required,
//   placeholder,
// }: {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
//   required?: boolean;
//   placeholder?: string;
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-xs font-bold text-slate-600">
//         {label}
//         {required ? " *" : ""}
//       </label>
//       <input
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         required={required}
//         placeholder={placeholder}
//         className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#087f87] focus:ring-2 focus:ring-cyan-100"
//       />
//     </div>
//   );
// }

// function Toggle({
//   label,
//   checked,
//   onChange,
// }: {
//   label: string;
//   checked: boolean;
//   onChange: (value: boolean) => void;
// }) {
//   return (
//     <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
//       <span className="text-sm font-semibold">{label}</span>
//       <input
//         type="checkbox"
//         checked={checked}
//         onChange={(e) => onChange(e.target.checked)}
//         className="h-4 w-4 accent-[#087f87]"
//       />
//     </label>
//   );
// }

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { can } from "@/lib/permissions";
import type { UserRole } from "@/types/user";

type LogisticsSettings = {
  companyDisplayName: string;
  defaultServiceCenter: string;
  defaultCurrency: string;
  requireCustomerSelection: boolean;
  requireReceiverPhone: boolean;
  requireShipmentDescription: boolean;
  enablePublicTracking: boolean;
  showLatestLocationPublicly: boolean;
  showInternalNotesPublicly: boolean;
  enableTransactionalNotifications: boolean;
  enableWhatsAppIntegration: boolean;
};

type ApiResponse =
  | {
      success: true;
      data: LogisticsSettings | { settings?: LogisticsSettings };
      message?: string;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

const DEFAULT_SETTINGS: LogisticsSettings = {
  companyDisplayName: "Sreshta Logistics",
  defaultServiceCenter: "",
  defaultCurrency: "INR",
  requireCustomerSelection: true,
  requireReceiverPhone: true,
  requireShipmentDescription: true,
  enablePublicTracking: true,
  showLatestLocationPublicly: true,
  showInternalNotesPublicly: false,
  enableTransactionalNotifications: true,
  enableWhatsAppIntegration: false,
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

function normalizeLoadedSettings(data: unknown): LogisticsSettings {
  if (!data || typeof data !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const raw = data as Record<string, unknown>;
  const nested =
    raw.settings && typeof raw.settings === "object"
      ? (raw.settings as Record<string, unknown>)
      : raw;

  return {
    ...DEFAULT_SETTINGS,
    companyDisplayName: String(
      nested.companyDisplayName ?? DEFAULT_SETTINGS.companyDisplayName,
    ),
    defaultServiceCenter: String(nested.defaultServiceCenter ?? ""),
    defaultCurrency: String(
      nested.defaultCurrency ?? DEFAULT_SETTINGS.defaultCurrency,
    ).toUpperCase(),
    requireCustomerSelection:
      nested.requireCustomerSelection === undefined
        ? DEFAULT_SETTINGS.requireCustomerSelection
        : Boolean(nested.requireCustomerSelection),
    requireReceiverPhone:
      nested.requireReceiverPhone === undefined
        ? DEFAULT_SETTINGS.requireReceiverPhone
        : Boolean(nested.requireReceiverPhone),
    requireShipmentDescription:
      nested.requireShipmentDescription === undefined
        ? DEFAULT_SETTINGS.requireShipmentDescription
        : Boolean(nested.requireShipmentDescription),
    enablePublicTracking:
      nested.enablePublicTracking === undefined
        ? DEFAULT_SETTINGS.enablePublicTracking
        : Boolean(nested.enablePublicTracking),
    showLatestLocationPublicly:
      nested.showLatestLocationPublicly === undefined
        ? DEFAULT_SETTINGS.showLatestLocationPublicly
        : Boolean(nested.showLatestLocationPublicly),
    showInternalNotesPublicly:
      nested.showInternalNotesPublicly === undefined
        ? DEFAULT_SETTINGS.showInternalNotesPublicly
        : Boolean(nested.showInternalNotesPublicly),
    enableTransactionalNotifications:
      nested.enableTransactionalNotifications === undefined
        ? DEFAULT_SETTINGS.enableTransactionalNotifications
        : Boolean(nested.enableTransactionalNotifications),
    enableWhatsAppIntegration:
      nested.enableWhatsAppIntegration === undefined
        ? DEFAULT_SETTINGS.enableWhatsAppIntegration
        : Boolean(nested.enableWhatsAppIntegration),
  };
}

export default function LogisticsSettingsPage() {
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

  /** View + save logistics settings */
  const canManageSettings = can(
    permissionUser,
    "LOGISTICS_SETTINGS",
  );

  const [settings, setSettings] =
    useState<LogisticsSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadSettings() {
      try {
        setLoading(true);
        setError(null);

        if (!firebaseUser) {
          throw new Error(
            "Authentication is required to manage settings.",
          );
        }

        if (!can(permissionUser, "LOGISTICS_SETTINGS")) {
          throw new Error(
            "You do not have permission to manage settings (LOGISTICS_SETTINGS_MANAGE).",
          );
        }

        const token = await firebaseUser.getIdToken(true);

        const res = await fetch("/api/logistics/settings", {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const json = (await res.json()) as ApiResponse;

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success
              ? json.error?.message ||
                  "Failed to load logistics settings."
              : "Failed to load logistics settings.",
          );
        }

        if (!cancelled) {
          setSettings(normalizeLoadedSettings(json.data));
          setDirty(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Failed to load logistics settings.",
          );
          setSettings(DEFAULT_SETTINGS);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [authLoading, firebaseUser, user, role]);

  function updateField<K extends keyof LogisticsSettings>(
    key: K,
    value: LogisticsSettings[K],
  ) {
    if (!canManageSettings) return;
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setDirty(true);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      if (!canManageSettings) {
        throw new Error(
          "You do not have permission to save settings (LOGISTICS_SETTINGS_MANAGE).",
        );
      }

      if (!firebaseUser) {
        throw new Error("Authentication is required.");
      }

      const companyDisplayName = settings.companyDisplayName.trim();
      if (!companyDisplayName) {
        throw new Error("Company display name is required.");
      }

      if (!settings.defaultCurrency.trim()) {
        throw new Error("Default currency is required.");
      }

      const token = await firebaseUser.getIdToken(true);

      const payload: LogisticsSettings = {
        ...settings,
        companyDisplayName,
        defaultServiceCenter: settings.defaultServiceCenter.trim(),
        defaultCurrency: settings.defaultCurrency.trim().toUpperCase(),
      };

      const res = await fetch("/api/logistics/settings", {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as ApiResponse;

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error?.message ||
                "Failed to save logistics settings."
            : "Failed to save logistics settings.",
        );
      }

      setSettings(normalizeLoadedSettings(json.data));
      setDirty(false);
      setMessage(json.message || "Settings saved successfully.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to save logistics settings.",
      );
    } finally {
      setSaving(false);
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

  if (user && !canManageSettings) {
    return (
      <div className="mx-auto max-w-[1100px]">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <h3 className="font-bold text-red-900">Access denied</h3>
          <p className="mt-1 text-sm text-red-800">
            Your role is <strong>{roleLabel}</strong>. Logistics settings
            require{" "}
            <code className="font-mono">LOGISTICS_SETTINGS_MANAGE</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-[#087f87]">
          Logistics
        </p>
        <h2 className="mt-1 text-2xl font-bold text-[#06284c]">
          Logistics Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure operational preferences. Changes are stored server-side.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Signed in as role: <strong>{roleLabel}</strong>
        </p>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#06284c]">
            Loading settings…
          </h3>
        </div>
      ) : !firebaseUser ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
          Authentication is required to manage logistics settings.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Section title="General">
            <Field
              label="Company Display Name"
              value={settings.companyDisplayName}
              onChange={(value) =>
                updateField("companyDisplayName", value)
              }
              required
            />
            <Field
              label="Default Service Center"
              value={settings.defaultServiceCenter}
              onChange={(value) =>
                updateField("defaultServiceCenter", value)
              }
              placeholder="serviceCenterId (optional)"
            />
            <Field
              label="Default Currency"
              value={settings.defaultCurrency}
              onChange={(value) => updateField("defaultCurrency", value)}
              required
            />
          </Section>

          <Section title="Booking">
            <Toggle
              label="Require customer selection"
              checked={settings.requireCustomerSelection}
              onChange={(value) =>
                updateField("requireCustomerSelection", value)
              }
            />
            <Toggle
              label="Require receiver phone"
              checked={settings.requireReceiverPhone}
              onChange={(value) =>
                updateField("requireReceiverPhone", value)
              }
            />
            <Toggle
              label="Require shipment description"
              checked={settings.requireShipmentDescription}
              onChange={(value) =>
                updateField("requireShipmentDescription", value)
              }
            />
          </Section>

          <Section title="Tracking">
            <Toggle
              label="Enable public tracking"
              checked={settings.enablePublicTracking}
              onChange={(value) =>
                updateField("enablePublicTracking", value)
              }
            />
            <Toggle
              label="Show latest location publicly"
              checked={settings.showLatestLocationPublicly}
              onChange={(value) =>
                updateField("showLatestLocationPublicly", value)
              }
            />
            <Toggle
              label="Show internal operational notes publicly"
              checked={settings.showInternalNotesPublicly}
              onChange={(value) =>
                updateField("showInternalNotesPublicly", value)
              }
            />
          </Section>

          <Section title="Notifications">
            <Toggle
              label="Enable transactional notifications"
              checked={settings.enableTransactionalNotifications}
              onChange={(value) =>
                updateField("enableTransactionalNotifications", value)
              }
            />
            <Toggle
              label="Enable WhatsApp integration"
              checked={settings.enableWhatsAppIntegration}
              onChange={(value) =>
                updateField("enableWhatsAppIntegration", value)
              }
            />
          </Section>

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              disabled={
                saving || !dirty || !firebaseUser || !canManageSettings
              }
              className="rounded-lg bg-[#087f87] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        Requires{" "}
        <code className="font-mono">LOGISTICS_SETTINGS_MANAGE</code>.
        Settings are stored in Firestore; client UI never bypasses server
        authorization.
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h3 className="font-bold text-[#06284c]">{title}</h3>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-slate-600">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-[#087f87] focus:ring-2 focus:ring-cyan-100"
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 p-4">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#087f87]"
      />
    </label>
  );
}