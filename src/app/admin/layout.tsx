// import Link from "next/link";
// import { ReactNode } from "react";

// const logisticsLinks = [
//   { label: "Booking", href: "/admin/logistics/booking" },
//   { label: "AWBs", href: "/admin/logistics/awb" },
//   { label: "Excel Import", href: "/admin/logistics/excel-import" },
//   { label: "Tracking", href: "/admin/logistics/tracking" },
//   { label: "Tracking Matrix", href: "/admin/logistics/tracking/matrix" },
//   { label: "Day End", href: "/admin/logistics/day-end" },
//   { label: "Rate Compare", href: "/admin/logistics/rate-compare" },
//   { label: "Fuel Surcharges", href: "/admin/logistics/fuel-surcharges" },
//   { label: "Co-loaders", href: "/admin/logistics/co-loaders" },
//   { label: "Invoices", href: "/admin/logistics/invoices" },
//   { label: "Reports", href: "/admin/logistics/reports" },
//   { label: "Settings", href: "/admin/logistics/settings" },
// ];

// const masterLinks = [
//   { label: "Senders", href: "/admin/masters/senders" },
//   { label: "Receivers", href: "/admin/masters/receivers" },
//   { label: "Customers", href: "/admin/masters/customers" },
//   { label: "Service Centers", href: "/admin/masters/service-centers" },
//   { label: "Destinations", href: "/admin/masters/destinations" },
//   { label: "Vendors", href: "/admin/masters/vendors" },
//   { label: "Services", href: "/admin/masters/services" },
// ];

// export default function AdminLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-slate-100 text-slate-800">
//       <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 overflow-y-auto bg-[#06284c] text-white lg:block">
//         <div className="border-b border-white/10 px-5 py-5">
//           <Link href="/admin" className="flex items-center gap-3">
//             <img
//               src="/images/sreshta-logistics-logo.png"
//               alt="Sreshta Logistics"
//               className="h-10 w-auto brightness-0 invert"
//             />

//             <div>
//               <div className="text-sm font-bold">SRESHTA</div>
//               <div className="text-[10px] uppercase tracking-widest text-white/50">
//                 Operations
//               </div>
//             </div>
//           </Link>
//         </div>

//         <nav className="px-3 py-5">
//           <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
//             Overview
//           </p>

//           <Link
//             href="/admin/dashboard"
//             className="mt-2 flex rounded-lg px-3 py-2.5 text-sm hover:bg-white/10"
//           >
//             Dashboard
//           </Link>

//           <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
//             Logistics
//           </p>

//           <div className="mt-2 space-y-1">
//             {logisticsLinks.map((item) => (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className="flex rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
//             Masters
//           </p>

//           <div className="mt-2 space-y-1">
//             {masterLinks.map((item) => (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 className="flex rounded-lg px-3 py-2.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </div>

//           <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
//             Food
//           </p>

//           <div className="mt-2 space-y-1">
//             <Link href="/admin/food/dashboard" className="admin-nav">
//               Dashboard
//             </Link>
//             <Link href="/admin/food/products" className="admin-nav">
//               Products
//             </Link>
//             <Link href="/admin/food/categories" className="admin-nav">
//               Categories
//             </Link>
//             <Link href="/admin/food/orders" className="admin-nav">
//               Orders
//             </Link>
//             <Link href="/admin/food/inventory" className="admin-nav">
//               Inventory
//             </Link>
//           </div>

//           <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
//             Administration
//           </p>

//           <div className="mt-2 space-y-1">
//             <Link href="/admin/users" className="admin-nav">
//               Users
//             </Link>
//             <Link href="/admin/roles" className="admin-nav">
//               Roles
//             </Link>
//             <Link href="/admin/audit-logs" className="admin-nav">
//               Audit Logs
//             </Link>
//           </div>
//         </nav>
//       </aside>

//       <div className="lg:pl-64">
//         <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
//               Sreshta Operations
//             </p>
//             <h1 className="text-lg font-bold text-[#06284c]">
//               Logistics Administration
//             </h1>
//           </div>

//           <div className="flex items-center gap-3">
//             <Link
//               href="/logistics"
//               className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:block"
//             >
//               View Website
//             </Link>

//             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087f87] text-sm font-bold text-white">
//               A
//             </div>
//           </div>
//         </header>

//         <main className="min-h-[calc(100vh-64px)] p-4 md:p-6">
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

const logisticsLinks = [
  { label: "Booking", href: "/admin/logistics/booking" },
  { label: "AWBs", href: "/admin/logistics/awb" },
  { label: "Excel Import", href: "/admin/logistics/excel-import" },
  { label: "Tracking", href: "/admin/logistics/tracking" },
  { label: "Tracking Matrix", href: "/admin/logistics/tracking/matrix" },
  { label: "Day End", href: "/admin/logistics/day-end" },
  { label: "Rate Compare", href: "/admin/logistics/rate-compare" },
  { label: "Fuel Surcharges", href: "/admin/logistics/fuel-surcharges" },
  { label: "Co-loaders", href: "/admin/logistics/co-loaders" },
  { label: "Invoices", href: "/admin/logistics/invoices" },
  { label: "Reports", href: "/admin/logistics/reports" },
  { label: "Settings", href: "/admin/logistics/settings" },
];

const masterLinks = [
  { label: "Senders", href: "/admin/masters/senders" },
  { label: "Receivers", href: "/admin/masters/receivers" },
  { label: "Customers", href: "/admin/masters/customers" },
  { label: "Service Centers", href: "/admin/masters/service-centers" },
  { label: "Destinations", href: "/admin/masters/destinations" },
  { label: "Vendors", href: "/admin/masters/vendors" },
  { label: "Services", href: "/admin/masters/services" },
];

const foodLinks = [
  { label: "Dashboard", href: "/admin/food/dashboard" },
  { label: "Products", href: "/admin/food/products" },
  { label: "Categories", href: "/admin/food/categories" },
  { label: "Orders", href: "/admin/food/orders" },
  { label: "Inventory", href: "/admin/food/inventory" },
  { label: "Coupons", href: "/admin/food/coupons" },
  { label: "Settings", href: "/admin/food/settings" },
];

const adminLinks = [
  { label: "Users", href: "/admin/users" },
  { label: "Roles", href: "/admin/roles" },
  { label: "Audit Logs", href: "/admin/audit-logs" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`flex rounded-lg px-3 py-2.5 text-sm transition ${
        active
          ? "bg-white/15 font-semibold text-white"
          : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading, user, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // async function handleLogout() {
  //   try {
  //     await logout();
  //   } finally {
  //     router.replace("/login");
  //   }
  // }

  async function handleLogout() {
  try {
    await logout();
  } catch {
    // ignore — still leave admin
  } finally {
    router.replace("/login");
  }
}

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        <div className="text-sm font-semibold">
          Checking authentication…
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        <div className="text-sm font-semibold">Redirecting to login…</div>
      </div>
    );
  }

  const initial = (
    user?.displayName ||
    user?.email ||
    "A"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 overflow-y-auto bg-[#06284c] text-white lg:block">
        <div className="border-b border-white/10 px-5 py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <img
              src="/images/sreshta-logistics-logo.png"
              alt="Sreshta Logistics"
              className="h-10 w-auto brightness-0 invert"
            />
            <div>
              <div className="text-sm font-bold">SRESHTA</div>
              <div className="text-[10px] uppercase tracking-widest text-white/50">
                Operations
              </div>
            </div>
          </Link>
        </div>

        <nav className="px-3 py-5">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Overview
          </p>
          <div className="mt-2">
            <NavLink href="/admin/dashboard" label="Dashboard" />
          </div>

          <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Logistics
          </p>
          <div className="mt-2 space-y-1">
            {logisticsLinks.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>

          <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Masters
          </p>
          <div className="mt-2 space-y-1">
            {masterLinks.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>

          <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Food
          </p>
          <div className="mt-2 space-y-1">
            {foodLinks.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>

          <p className="mt-7 px-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
            Administration
          </p>
          <div className="mt-2 space-y-1">
            {adminLinks.map((item) => (
              <NavLink key={item.href} href={item.href} label={item.label} />
            ))}
          </div>
        </nav>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Sreshta Operations
            </p>
            <h1 className="text-lg font-bold text-[#06284c]">
              Administration
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/logistics"
              className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:block"
            >
              View Website
            </Link>

            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-slate-800">
                {user?.displayName || user?.email || "User"}
              </div>
              <div className="text-[11px] uppercase tracking-wide text-slate-400">
                {user?.role?.replace(/_/g, " ") || "—"}
              </div>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#087f87] text-sm font-bold text-white">
              {initial}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}