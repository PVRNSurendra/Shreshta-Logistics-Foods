// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";

// type ProductStatus = "ACTIVE" | "INACTIVE";

// type Product = {
//   productId: string;
//   slug: string;
//   name: string;
//   categoryId: string;
//   category: string;
//   variants: number;
//   status: ProductStatus;
// };

// type ApiResponse =
//   | {
//       success: true;
//       data: Record<string, unknown>[];
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// function normalizeStatus(value: unknown): ProductStatus {
//   return String(value || "ACTIVE").toUpperCase() === "INACTIVE"
//     ? "INACTIVE"
//     : "ACTIVE";
// }

// function normalizeProduct(
//   raw: Record<string, unknown>,
// ): Product | null {
//   const productId = String(raw.productId || raw.id || "").trim();
//   const name = String(raw.name || "").trim();

//   if (!productId || !name) {
//     return null;
//   }

//   const slug = String(raw.slug || productId).trim();
//   const categoryId = String(raw.categoryId || "").trim();
//   const category =
//     String(raw.categoryName || raw.category || "General").trim() ||
//     "General";

//   const variantsRaw = Array.isArray(raw.variants)
//     ? raw.variants
//     : [];

//   const variantsCount =
//     typeof raw.variantsCount === "number"
//       ? raw.variantsCount
//       : variantsRaw.length;

//   return {
//     productId,
//     slug,
//     name,
//     categoryId,
//     category,
//     variants: variantsCount,
//     status: normalizeStatus(raw.status),
//   };
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All Categories");
//   const [status, setStatus] = useState("All Statuses");
//   const [reloadKey, setReloadKey] = useState(0);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadProducts() {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch("/api/food/products", {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         });

//         const json = (await res.json()) as ApiResponse;

//         if (!res.ok || !json.success) {
//           throw new Error(
//             !json.success
//               ? json.error.message
//               : "Failed to load products.",
//           );
//         }

//         const list = Array.isArray(json.data) ? json.data : [];
//         const normalized = list
//           .map((item) => normalizeProduct(item))
//           .filter(Boolean) as Product[];

//         if (!cancelled) {
//           setProducts(normalized);
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(
//             e instanceof Error
//               ? e.message
//               : "Failed to load products.",
//           );
//           setProducts([]);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadProducts();

//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const categories = useMemo(() => {
//     const unique = Array.from(
//       new Set(products.map((product) => product.category)),
//     ).sort((a, b) => a.localeCompare(b));

//     return ["All Categories", ...unique];
//   }, [products]);

//   useEffect(() => {
//     if (
//       category !== "All Categories" &&
//       !categories.includes(category)
//     ) {
//       setCategory("All Categories");
//     }
//   }, [categories, category]);

//   const filtered = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return products.filter((product) => {
//       const matchesSearch =
//         !query ||
//         [
//           product.productId,
//           product.name,
//           product.slug,
//           product.category,
//           product.categoryId,
//           product.status,
//         ]
//           .join(" ")
//           .toLowerCase()
//           .includes(query);

//       const matchesCategory =
//         category === "All Categories" ||
//         product.category === category;

//       const matchesStatus =
//         status === "All Statuses" || product.status === status;

//       return matchesSearch && matchesCategory && matchesStatus;
//     });
//   }, [products, search, category, status]);

//   return (
//     <div className="mx-auto max-w-[1400px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
//             Food
//           </p>

//           <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
//             Products
//           </h2>

//           <p className="mt-1 text-sm text-slate-500">
//             Manage food products, variants and availability.
//           </p>
//         </div>

//         <Link
//           href="/admin/food/products/new"
//           className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
//         >
//           + Add Product
//         </Link>
//       </div>

//       <div className="mb-4 flex flex-col gap-3 sm:flex-row">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search products..."
//           disabled={loading}
//           className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
//         />

//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           disabled={loading}
//           className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//         >
//           {categories.map((item) => (
//             <option key={item} value={item}>
//               {item}
//             </option>
//           ))}
//         </select>

//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           disabled={loading}
//           className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm sm:block"
//         >
//           <option value="All Statuses">All Statuses</option>
//           <option value="ACTIVE">ACTIVE</option>
//           <option value="INACTIVE">INACTIVE</option>
//         </select>
//       </div>

//       {loading ? (
//         <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//           <h3 className="text-lg font-bold text-[#3b2516]">
//             Loading products...
//           </h3>
//           <p className="mt-2 text-sm text-slate-500">
//             Fetching the latest catalog from Firestore.
//           </p>
//         </div>
//       ) : error ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
//           <h3 className="text-lg font-bold text-red-800">
//             Could not load products
//           </h3>
//           <p className="mt-2 text-sm text-red-700">{error}</p>
//           <button
//             type="button"
//             onClick={() => setReloadKey((value) => value + 1)}
//             className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
//           >
//             Try again
//           </button>
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[850px] text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">productId</th>
//                   <th className="px-5 py-3">Product</th>
//                   <th className="px-5 py-3">Category</th>
//                   <th className="px-5 py-3">Variants</th>
//                   <th className="px-5 py-3">Status</th>
//                   <th className="px-5 py-3">Action</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="px-5 py-16 text-center text-slate-500"
//                     >
//                       {products.length === 0
//                         ? "No products found. Add your first product."
//                         : "No products match your filters."}
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((product) => (
//                     <tr key={product.productId}>
//                       <td className="px-5 py-4 font-mono text-xs font-bold text-orange-600">
//                         {product.productId}
//                       </td>

//                       <td className="px-5 py-4">
//                         <div className="font-bold">
//                           {product.name}
//                         </div>
//                         <div className="text-xs text-slate-400">
//                           /{product.slug}
//                         </div>
//                       </td>

//                       <td className="px-5 py-4">
//                         {product.category}
//                       </td>

//                       <td className="px-5 py-4">
//                         {product.variants}
//                       </td>

//                       <td className="px-5 py-4">
//                         <Status value={product.status} />
//                       </td>

//                       <td className="px-5 py-4">
//                         <Link
//                           href={`/admin/food/products/${product.productId}`}
//                           className="text-xs font-bold text-orange-600"
//                         >
//                           Edit →
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function Status({ value }: { value: string }) {
//   return (
//     <span
//       className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
//         value === "ACTIVE"
//           ? "bg-emerald-100 text-emerald-700"
//           : "bg-slate-100 text-slate-500"
//       }`}
//     >
//       {value}
//     </span>
//   );
// }

// import { NextRequest, NextResponse } from "next/server";
// import type { DocumentData } from "firebase-admin/firestore";

// import { adminDb } from "@/lib/firebase-admin";
// import { getCurrentUser } from "@/lib/auth";
// import { can } from "@/lib/permissions";
// import { writeAuditLog } from "@/lib/audit";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// export const runtime = "nodejs";

// type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

// function json(data: unknown, status = 200) {
//   return NextResponse.json(data, { status });
// }

// function slugify(value: string): string {
//   return value
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)/g, "");
// }

// function normalizeProduct(id: string, data: DocumentData) {
//   const variants = Array.isArray(data.variants) ? data.variants : [];

//   return {
//     id,
//     productId: String(data.productId || id),
//     slug: String(data.slug || ""),
//     name: String(data.name || ""),
//     categoryId: String(data.categoryId || ""),
//     category: String(data.categoryName || data.category || "General"),
//     categoryName: String(data.categoryName || data.category || "General"),
//     description: String(data.description || ""),
//     imageUrl: String(
//       data.imageUrl ||
//         data.image ||
//         "/images/default-product-placeholder.png",
//     ),
//     status:
//       data.status === "INACTIVE"
//         ? "INACTIVE"
//         : data.status === "DRAFT"
//           ? "DRAFT"
//           : "ACTIVE",
//     featured: Boolean(data.featured),
//     variantsCount: variants.length,
//     variants,
//     createdAt: data.createdAt || null,
//     updatedAt: data.updatedAt || null,
//   };
// }

// function normalizeVariants(input: unknown) {
//   if (!Array.isArray(input)) return [];

//   return input
//     .map((raw, index) => {
//       const item = (raw || {}) as Record<string, unknown>;
//       const price = Number(item.price);
//       const stock = Number(item.stock ?? 0);

//       if (!Number.isFinite(price) || price < 0) return null;

//       return {
//         variantId: String(
//           item.variantId ||
//             item.id ||
//             `VAR-${String(index + 1).padStart(3, "0")}`,
//         ),
//         name: String(item.name || item.label || `Option ${index + 1}`),
//         label: String(item.label || item.name || `Option ${index + 1}`),
//         weight: Number(item.weight) || 0,
//         weightUnit:
//           String(item.weightUnit || "GRAM").toUpperCase() === "KG"
//             ? "KG"
//             : "GRAM",
//         price,
//         stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
//         enabled: item.enabled === undefined ? true : Boolean(item.enabled),
//       };
//     })
//     .filter(Boolean);
// }

// export async function GET() {
//   try {
//     const snap = await adminDb
//       .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
//       .get();

//     const products = snap.docs.map((doc) =>
//       normalizeProduct(doc.id, doc.data()),
//     );

//     products.sort((a, b) => {
//       const aTime = String(a.updatedAt || a.createdAt || "");
//       const bTime = String(b.updatedAt || b.createdAt || "");
//       return bTime.localeCompare(aTime);
//     });

//     return json({ success: true, data: products });
//   } catch (error) {
//     console.error("GET /api/food/products", error);
//     return json(
//       {
//         success: false,
//         error: {
//           code: "PRODUCTS_FETCH_FAILED",
//           message: "Failed to load products from Firestore.",
//         },
//       },
//       500,
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);

//     if (!user) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "UNAUTHORIZED",
//             message: "Authentication is required.",
//           },
//         },
//         401,
//       );
//     }

//     if (!can(user, "FOOD_PRODUCT_CREATE")) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "FORBIDDEN",
//             message: "You do not have permission to create products.",
//           },
//         },
//         403,
//       );
//     }

//     const body = (await request.json()) as Record<string, unknown>;

//     const name = String(body.name || "").trim();
//     const slug =
//       String(body.slug || "").trim() || slugify(name);
//     const variants = normalizeVariants(body.variants);

//     if (!name) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "VALIDATION_ERROR",
//             message: "Product name is required.",
//           },
//         },
//         400,
//       );
//     }

//     if (!slug) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "VALIDATION_ERROR",
//             message: "Product slug is required.",
//           },
//         },
//         400,
//       );
//     }

//     if (variants.length === 0) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "VALIDATION_ERROR",
//             message: "At least one valid variant with price is required.",
//           },
//         },
//         400,
//       );
//     }

//     const now = new Date().toISOString();
//     const ref = adminDb.collection(FIRESTORE_COLLECTIONS.PRODUCTS).doc();

//     const statusRaw = String(body.status || "ACTIVE").toUpperCase();
//     const status: ProductStatus =
//       statusRaw === "INACTIVE"
//         ? "INACTIVE"
//         : statusRaw === "DRAFT"
//           ? "DRAFT"
//           : "ACTIVE";

//     const categoryId = String(body.categoryId || "").trim();
//     const categoryName = String(
//       body.categoryName || body.category || "General",
//     ).trim() || "General";

//     const record = {
//       id: ref.id,
//       productId: ref.id,
//       name,
//       slug,
//       categoryId: categoryId || null,
//       category: categoryName,
//       categoryName,
//       description: String(body.description || "").trim(),
//       imageUrl:
//         String(body.imageUrl || "").trim() ||
//         "/images/default-product-placeholder.png",
//       status,
//       featured: Boolean(body.featured),
//       variants,
//       createdAt: now,
//       updatedAt: now,
//     };

//     await ref.set(record);

//     try {
//       await writeAuditLog({
//         userId: user.userId,
//         action: "PRODUCT_CREATE",
//         module: "FOOD",
//         resourceType: "product",
//         resourceId: record.productId,
//         metadata: { name: record.name, slug: record.slug },
//       });
//     } catch (e) {
//       console.error("PRODUCT_CREATE audit failed", e);
//     }

//     return json(
//       {
//         success: true,
//         data: normalizeProduct(ref.id, record),
//         message: "Product created.",
//       },
//       201,
//     );
//   } catch (error) {
//     console.error("POST /api/food/products", error);
//     return json(
//       {
//         success: false,
//         error: {
//           code: "PRODUCT_CREATE_FAILED",
//           message:
//             error instanceof Error
//               ? error.message
//               : "Failed to create product.",
//         },
//       },
//       500,
//     );
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);

//     if (!user) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "UNAUTHORIZED",
//             message: "Authentication is required.",
//           },
//         },
//         401,
//       );
//     }

//     if (!can(user, "FOOD_PRODUCT_UPDATE")) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "FORBIDDEN",
//             message: "You do not have permission to update products.",
//           },
//         },
//         403,
//       );
//     }

//     const body = (await request.json()) as Record<string, unknown>;
//     const productId = String(body.productId || body.id || "").trim();

//     if (!productId) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "PRODUCT_ID_REQUIRED",
//             message: "productId is required.",
//           },
//         },
//         400,
//       );
//     }

//     const ref = adminDb
//       .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
//       .doc(productId);

//     const existing = await ref.get();
//     if (!existing.exists) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "PRODUCT_NOT_FOUND",
//             message: "Product was not found.",
//           },
//         },
//         404,
//       );
//     }

//     const name = String(body.name || "").trim();
//     const slug =
//       String(body.slug || "").trim() || slugify(name);
//     const variants = normalizeVariants(body.variants);

//     if (!name) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "VALIDATION_ERROR",
//             message: "Product name is required.",
//           },
//         },
//         400,
//       );
//     }

//     if (variants.length === 0) {
//       return json(
//         {
//           success: false,
//           error: {
//             code: "VALIDATION_ERROR",
//             message: "At least one valid variant with price is required.",
//           },
//         },
//         400,
//       );
//     }

//     const statusRaw = String(body.status || "ACTIVE").toUpperCase();
//     const status: ProductStatus =
//       statusRaw === "INACTIVE"
//         ? "INACTIVE"
//         : statusRaw === "DRAFT"
//           ? "DRAFT"
//           : "ACTIVE";

//     const categoryId = String(body.categoryId || "").trim();
//     const categoryName = String(
//       body.categoryName || body.category || "General",
//     ).trim() || "General";

//     const patch = {
//       productId,
//       name,
//       slug,
//       categoryId: categoryId || null,
//       category: categoryName,
//       categoryName,
//       description: String(body.description || "").trim(),
//       imageUrl:
//         String(body.imageUrl || "").trim() ||
//         "/images/default-product-placeholder.png",
//       status,
//       featured: Boolean(body.featured),
//       variants,
//       updatedAt: new Date().toISOString(),
//     };

//     await ref.set(patch, { merge: true });

//     const updated = await ref.get();
//     const record = normalizeProduct(updated.id, updated.data() || {});

//     try {
//       await writeAuditLog({
//         userId: user.userId,
//         action: "PRODUCT_UPDATE",
//         module: "FOOD",
//         resourceType: "product",
//         resourceId: productId,
//         metadata: { name, slug },
//       });
//     } catch (e) {
//       console.error("PRODUCT_UPDATE audit failed", e);
//     }

//     return json({
//       success: true,
//       data: record,
//       message: "Product updated.",
//     });
//   } catch (error) {
//     console.error("PUT /api/food/products", error);
//     return json(
//       {
//         success: false,
//         error: {
//           code: "PRODUCT_UPDATE_FAILED",
//           message:
//             error instanceof Error
//               ? error.message
//               : "Failed to update product.",
//         },
//       },
//       500,
//     );
//   }
// }

// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";

// type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

// type Product = {
//   productId: string;
//   slug: string;
//   name: string;
//   categoryId: string;
//   category: string;
//   variants: number;
//   status: ProductStatus;
// };

// type ApiResponse =
//   | {
//       success: true;
//       data: unknown;
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// function extractList(data: unknown): Record<string, unknown>[] {
//   if (Array.isArray(data)) {
//     return data as Record<string, unknown>[];
//   }

//   if (!data || typeof data !== "object") {
//     return [];
//   }

//   const obj = data as Record<string, unknown>;

//   for (const key of ["products", "items", "results", "data"]) {
//     if (Array.isArray(obj[key])) {
//       return obj[key] as Record<string, unknown>[];
//     }
//   }

//   return [];
// }

// function normalizeStatus(value: unknown): ProductStatus {
//   const raw = String(value || "ACTIVE").toUpperCase();
//   if (raw === "INACTIVE") return "INACTIVE";
//   if (raw === "DRAFT") return "DRAFT";
//   return "ACTIVE";
// }

// function normalizeProduct(raw: Record<string, unknown>): Product | null {
//   const productId = String(raw.productId || raw.id || "").trim();
//   const name = String(raw.name || "").trim();

//   if (!productId || !name) {
//     return null;
//   }

//   const variantsRaw = Array.isArray(raw.variants) ? raw.variants : [];
//   const variantsCount =
//     typeof raw.variantsCount === "number"
//       ? raw.variantsCount
//       : variantsRaw.length;

//   return {
//     productId,
//     slug: String(raw.slug || productId).trim(),
//     name,
//     categoryId: String(raw.categoryId || "").trim(),
//     category:
//       String(raw.categoryName || raw.category || "General").trim() ||
//       "General",
//     variants: variantsCount,
//     status: normalizeStatus(raw.status),
//   };
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All Categories");
//   const [status, setStatus] = useState("All Statuses");
//   const [reloadKey, setReloadKey] = useState(0);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadProducts() {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch("/api/food/products", {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         });

//         const text = await res.text();
//         let json: ApiResponse;

//         try {
//           json = JSON.parse(text) as ApiResponse;
//         } catch {
//           throw new Error(
//             res.status === 404
//               ? "Products API not found (/api/food/products)."
//               : `Products API returned non-JSON (HTTP ${res.status}).`,
//           );
//         }

//         if (!res.ok || !json.success) {
//           throw new Error(
//             !json.success
//               ? json.error.message
//               : "Failed to load products.",
//           );
//         }

//         const normalized = extractList(json.data)
//           .map((item) => normalizeProduct(item))
//           .filter(Boolean) as Product[];

//         if (!cancelled) {
//           setProducts(normalized);
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(
//             e instanceof Error ? e.message : "Failed to load products.",
//           );
//           setProducts([]);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadProducts();

//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const categories = useMemo(() => {
//     const unique = Array.from(
//       new Set(products.map((product) => product.category)),
//     ).sort((a, b) => a.localeCompare(b));

//     return ["All Categories", ...unique];
//   }, [products]);

//   useEffect(() => {
//     if (
//       category !== "All Categories" &&
//       !categories.includes(category)
//     ) {
//       setCategory("All Categories");
//     }
//   }, [categories, category]);

//   const filtered = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return products.filter((product) => {
//       const matchesSearch =
//         !query ||
//         [
//           product.productId,
//           product.name,
//           product.slug,
//           product.category,
//           product.categoryId,
//           product.status,
//         ]
//           .join(" ")
//           .toLowerCase()
//           .includes(query);

//       const matchesCategory =
//         category === "All Categories" || product.category === category;

//       const matchesStatus =
//         status === "All Statuses" || product.status === status;

//       return matchesSearch && matchesCategory && matchesStatus;
//     });
//   }, [products, search, category, status]);

//   return (
//     <div className="mx-auto max-w-[1400px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
//             Food
//           </p>
//           <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
//             Products
//           </h2>
//           <p className="mt-1 text-sm text-slate-500">
//             Manage food products, variants and availability.
//           </p>
//         </div>

//         <div className="flex gap-2">
//           <button
//             type="button"
//             onClick={() => setReloadKey((value) => value + 1)}
//             className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
//           >
//             Refresh
//           </button>
//           <Link
//             href="/admin/food/products/new"
//             className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
//           >
//             + Add Product
//           </Link>
//         </div>
//       </div>

//       <div className="mb-4 flex flex-col gap-3 sm:flex-row">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search products..."
//           disabled={loading}
//           className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
//         />
//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           disabled={loading}
//           className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//         >
//           {categories.map((item) => (
//             <option key={item} value={item}>
//               {item}
//             </option>
//           ))}
//         </select>
//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           disabled={loading}
//           className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//         >
//           <option value="All Statuses">All Statuses</option>
//           <option value="ACTIVE">ACTIVE</option>
//           <option value="INACTIVE">INACTIVE</option>
//           <option value="DRAFT">DRAFT</option>
//         </select>
//       </div>

//       {loading ? (
//         <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//           <h3 className="text-lg font-bold text-[#3b2516]">
//             Loading products...
//           </h3>
//         </div>
//       ) : error ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
//           <h3 className="text-lg font-bold text-red-800">
//             Could not load products
//           </h3>
//           <p className="mt-2 text-sm text-red-700">{error}</p>
//           <button
//             type="button"
//             onClick={() => setReloadKey((value) => value + 1)}
//             className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
//           >
//             Try again
//           </button>
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[850px] text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">productId</th>
//                   <th className="px-5 py-3">Product</th>
//                   <th className="px-5 py-3">Category</th>
//                   <th className="px-5 py-3">Variants</th>
//                   <th className="px-5 py-3">Status</th>
//                   <th className="px-5 py-3">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="px-5 py-16 text-center text-slate-500"
//                     >
//                       {products.length === 0
//                         ? "No products found. Add your first product."
//                         : "No products match your filters."}
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((product) => (
//                     <tr key={product.productId}>
//                       <td className="px-5 py-4 font-mono text-xs font-bold text-orange-600">
//                         {product.productId}
//                       </td>
//                       <td className="px-5 py-4">
//                         <div className="font-bold">{product.name}</div>
//                         <div className="text-xs text-slate-400">
//                           /{product.slug}
//                         </div>
//                       </td>
//                       <td className="px-5 py-4">{product.category}</td>
//                       <td className="px-5 py-4">{product.variants}</td>
//                       <td className="px-5 py-4">
//                         <span
//                           className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
//                             product.status === "ACTIVE"
//                               ? "bg-emerald-100 text-emerald-700"
//                               : "bg-slate-100 text-slate-500"
//                           }`}
//                         >
//                           {product.status}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4">
//                         <Link
//                           href={`/admin/food/products/${product.productId}`}
//                           className="text-xs font-bold text-orange-600"
//                         >
//                           Edit →
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import { useAuth } from "@/context/AuthContext";

// type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

// type Product = {
//   productId: string;
//   slug: string;
//   name: string;
//   categoryId: string;
//   category: string;
//   variants: number;
//   status: ProductStatus;
// };

// type ApiResponse =
//   | {
//       success: true;
//       data: unknown;
//     }
//   | {
//       success: false;
//       error: {
//         code: string;
//         message: string;
//       };
//     };

// function extractList(data: unknown): Record<string, unknown>[] {
//   if (Array.isArray(data)) {
//     return data as Record<string, unknown>[];
//   }

//   if (!data || typeof data !== "object") {
//     return [];
//   }

//   const obj = data as Record<string, unknown>;

//   for (const key of ["products", "items", "results", "data"]) {
//     if (Array.isArray(obj[key])) {
//       return obj[key] as Record<string, unknown>[];
//     }
//   }

//   return [];
// }

// function normalizeStatus(value: unknown): ProductStatus {
//   const raw = String(value || "ACTIVE").toUpperCase();
//   if (raw === "INACTIVE") return "INACTIVE";
//   if (raw === "DRAFT") return "DRAFT";
//   return "ACTIVE";
// }

// function normalizeProduct(raw: Record<string, unknown>): Product | null {
//   const productId = String(raw.productId || raw.id || "").trim();
//   const name = String(raw.name || "").trim();

//   if (!productId || !name) {
//     return null;
//   }

//   const variantsRaw = Array.isArray(raw.variants) ? raw.variants : [];
//   const variantsCount =
//     typeof raw.variantsCount === "number"
//       ? raw.variantsCount
//       : variantsRaw.length;

//   return {
//     productId,
//     slug: String(raw.slug || productId).trim(),
//     name,
//     categoryId: String(raw.categoryId || "").trim(),
//     category:
//       String(raw.categoryName || raw.category || "General").trim() ||
//       "General",
//     variants: variantsCount,
//     status: normalizeStatus(raw.status),
//   };
// }

// export default function ProductsPage() {
//   const { user, loading: authLoading } = useAuth();

//   /** Only Super Admin can add / edit products */
//   const canManage = user?.role === "SUPER_ADMIN";

//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All Categories");
//   const [status, setStatus] = useState("All Statuses");
//   const [reloadKey, setReloadKey] = useState(0);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadProducts() {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch("/api/food/products", {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//           },
//           cache: "no-store",
//         });

//         const text = await res.text();
//         let json: ApiResponse;

//         try {
//           json = JSON.parse(text) as ApiResponse;
//         } catch {
//           throw new Error(
//             res.status === 404
//               ? "Products API not found (/api/food/products)."
//               : `Products API returned non-JSON (HTTP ${res.status}).`,
//           );
//         }

//         if (!res.ok || !json.success) {
//           throw new Error(
//             !json.success
//               ? json.error.message
//               : "Failed to load products.",
//           );
//         }

//         const normalized = extractList(json.data)
//           .map((item) => normalizeProduct(item))
//           .filter(Boolean) as Product[];

//         if (!cancelled) {
//           setProducts(normalized);
//         }
//       } catch (e) {
//         if (!cancelled) {
//           setError(
//             e instanceof Error ? e.message : "Failed to load products.",
//           );
//           setProducts([]);
//         }
//       } finally {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       }
//     }

//     loadProducts();

//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const categories = useMemo(() => {
//     const unique = Array.from(
//       new Set(products.map((product) => product.category)),
//     ).sort((a, b) => a.localeCompare(b));

//     return ["All Categories", ...unique];
//   }, [products]);

//   useEffect(() => {
//     if (
//       category !== "All Categories" &&
//       !categories.includes(category)
//     ) {
//       setCategory("All Categories");
//     }
//   }, [categories, category]);

//   const filtered = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return products.filter((product) => {
//       const matchesSearch =
//         !query ||
//         [
//           product.productId,
//           product.name,
//           product.slug,
//           product.category,
//           product.categoryId,
//           product.status,
//         ]
//           .join(" ")
//           .toLowerCase()
//           .includes(query);

//       const matchesCategory =
//         category === "All Categories" || product.category === category;

//       const matchesStatus =
//         status === "All Statuses" || product.status === status;

//       return matchesSearch && matchesCategory && matchesStatus;
//     });
//   }, [products, search, category, status]);

//   return (
//     <div className="mx-auto max-w-[1400px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
//             Food
//           </p>
//           <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">
//             Products
//           </h2>
//           <p className="mt-1 text-sm text-slate-500">
//             Manage food products, variants and availability.
//           </p>
//           {!authLoading && !canManage && (
//             <p className="mt-2 text-xs text-slate-500">
//               View only — only Super Admin can add or edit products.
//             </p>
//           )}
//         </div>

//         <div className="flex gap-2">
//           <button
//             type="button"
//             onClick={() => setReloadKey((value) => value + 1)}
//             className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
//           >
//             Refresh
//           </button>

//           {canManage && (
//             <Link
//               href="/admin/food/products/new"
//               className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
//             >
//               + Add Product
//             </Link>
//           )}
//         </div>
//       </div>

//       <div className="mb-4 flex flex-col gap-3 sm:flex-row">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search products..."
//           disabled={loading}
//           className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
//         />
//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           disabled={loading}
//           className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//         >
//           {categories.map((item) => (
//             <option key={item} value={item}>
//               {item}
//             </option>
//           ))}
//         </select>
//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           disabled={loading}
//           className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//         >
//           <option value="All Statuses">All Statuses</option>
//           <option value="ACTIVE">ACTIVE</option>
//           <option value="INACTIVE">INACTIVE</option>
//           <option value="DRAFT">DRAFT</option>
//         </select>
//       </div>

//       {loading || authLoading ? (
//         <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//           <h3 className="text-lg font-bold text-[#3b2516]">
//             Loading products...
//           </h3>
//         </div>
//       ) : error ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
//           <h3 className="text-lg font-bold text-red-800">
//             Could not load products
//           </h3>
//           <p className="mt-2 text-sm text-red-700">{error}</p>
//           <button
//             type="button"
//             onClick={() => setReloadKey((value) => value + 1)}
//             className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
//           >
//             Try again
//           </button>
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[850px] text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">productId</th>
//                   <th className="px-5 py-3">Product</th>
//                   <th className="px-5 py-3">Category</th>
//                   <th className="px-5 py-3">Variants</th>
//                   <th className="px-5 py-3">Status</th>
//                   <th className="px-5 py-3">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={6}
//                       className="px-5 py-16 text-center text-slate-500"
//                     >
//                       {products.length === 0
//                         ? canManage
//                           ? "No products found. Add your first product."
//                           : "No products found."
//                         : "No products match your filters."}
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((product) => (
//                     <tr key={product.productId}>
//                       <td className="px-5 py-4 font-mono text-xs font-bold text-orange-600">
//                         {product.productId}
//                       </td>
//                       <td className="px-5 py-4">
//                         <div className="font-bold">{product.name}</div>
//                         <div className="text-xs text-slate-400">
//                           /{product.slug}
//                         </div>
//                       </td>
//                       <td className="px-5 py-4">{product.category}</td>
//                       <td className="px-5 py-4">{product.variants}</td>
//                       <td className="px-5 py-4">
//                         <span
//                           className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
//                             product.status === "ACTIVE"
//                               ? "bg-emerald-100 text-emerald-700"
//                               : "bg-slate-100 text-slate-500"
//                           }`}
//                         >
//                           {product.status}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4">
//                         {canManage ? (
//                           <Link
//                             href={`/admin/food/products/${product.productId}`}
//                             className="text-xs font-bold text-orange-600"
//                           >
//                             Edit →
//                           </Link>
//                         ) : (
//                           <Link
//                             href={`/admin/food/products/${product.productId}`}
//                             className="text-xs font-bold text-slate-500"
//                           >
//                             View →
//                           </Link>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import Link from "next/link";
// import { useEffect, useMemo, useState } from "react";
// import { useAuth } from "@/context/AuthContext";
// import { can } from "@/lib/permissions";

// type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

// type Product = {
//   productId: string;
//   slug: string;
//   name: string;
//   categoryId: string;
//   category: string;
//   variants: number;
//   status: ProductStatus;
// };

// type ApiResponse =
//   | { success: true; data: unknown }
//   | { success: false; error: { code: string; message: string } };

// function extractList(data: unknown): Record<string, unknown>[] {
//   if (Array.isArray(data)) return data as Record<string, unknown>[];
//   if (!data || typeof data !== "object") return [];
//   const obj = data as Record<string, unknown>;
//   for (const key of ["products", "items", "results", "data"]) {
//     if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
//   }
//   return [];
// }

// function normalizeStatus(value: unknown): ProductStatus {
//   const raw = String(value || "ACTIVE").toUpperCase();
//   if (raw === "INACTIVE") return "INACTIVE";
//   if (raw === "DRAFT") return "DRAFT";
//   return "ACTIVE";
// }

// function normalizeProduct(raw: Record<string, unknown>): Product | null {
//   const productId = String(raw.productId || raw.id || "").trim();
//   const name = String(raw.name || "").trim();
//   if (!productId || !name) return null;

//   const variantsRaw = Array.isArray(raw.variants) ? raw.variants : [];
//   const variantsCount =
//     typeof raw.variantsCount === "number"
//       ? raw.variantsCount
//       : variantsRaw.length;

//   return {
//     productId,
//     slug: String(raw.slug || productId).trim(),
//     name,
//     categoryId: String(raw.categoryId || "").trim(),
//     category:
//       String(raw.categoryName || raw.category || "General").trim() ||
//       "General",
//     variants: variantsCount,
//     status: normalizeStatus(raw.status),
//   };
// }

// export default function ProductsPage() {
//   const { user, loading: authLoading } = useAuth();

//   const permUser = {
//     userId: user?.userId ?? "",
//     role: user?.role ?? null,
//   };

//   const canManage =
//     can(permUser, "FOOD_PRODUCT_CREATE") ||
//     can(permUser, "FOOD_PRODUCT_UPDATE");

//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("All Categories");
//   const [status, setStatus] = useState("All Statuses");
//   const [reloadKey, setReloadKey] = useState(0);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadProducts() {
//       try {
//         setLoading(true);
//         setError(null);

//         const res = await fetch("/api/food/products", {
//           method: "GET",
//           headers: { Accept: "application/json" },
//           cache: "no-store",
//         });

//         const text = await res.text();
//         let json: ApiResponse;
//         try {
//           json = JSON.parse(text) as ApiResponse;
//         } catch {
//           throw new Error(
//             res.status === 404
//               ? "Products API not found (/api/food/products)."
//               : `Products API returned non-JSON (HTTP ${res.status}).`,
//           );
//         }

//         if (!res.ok || !json.success) {
//           throw new Error(
//             !json.success ? json.error.message : "Failed to load products.",
//           );
//         }

//         const normalized = extractList(json.data)
//           .map((item) => normalizeProduct(item))
//           .filter(Boolean) as Product[];

//         if (!cancelled) setProducts(normalized);
//       } catch (e) {
//         if (!cancelled) {
//           setError(e instanceof Error ? e.message : "Failed to load products.");
//           setProducts([]);
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     loadProducts();
//     return () => {
//       cancelled = true;
//     };
//   }, [reloadKey]);

//   const categories = useMemo(() => {
//     const unique = Array.from(
//       new Set(products.map((product) => product.category)),
//     ).sort((a, b) => a.localeCompare(b));
//     return ["All Categories", ...unique];
//   }, [products]);

//   useEffect(() => {
//     if (category !== "All Categories" && !categories.includes(category)) {
//       setCategory("All Categories");
//     }
//   }, [categories, category]);

//   const filtered = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     return products.filter((product) => {
//       const matchesSearch =
//         !query ||
//         [
//           product.productId,
//           product.name,
//           product.slug,
//           product.category,
//           product.categoryId,
//           product.status,
//         ]
//           .join(" ")
//           .toLowerCase()
//           .includes(query);
//       const matchesCategory =
//         category === "All Categories" || product.category === category;
//       const matchesStatus =
//         status === "All Statuses" || product.status === status;
//       return matchesSearch && matchesCategory && matchesStatus;
//     });
//   }, [products, search, category, status]);

//   return (
//     <div className="mx-auto max-w-[1400px]">
//       <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
//         <div>
//           <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
//             Food
//           </p>
//           <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">Products</h2>
//           <p className="mt-1 text-sm text-slate-500">
//             Manage food products, variants and availability.
//           </p>
//           {!authLoading && !canManage && (
//             <p className="mt-2 text-xs text-slate-500">
//               View only — you need product create/update permission to edit.
//             </p>
//           )}
//         </div>

//         <div className="flex gap-2">
//           <button
//             type="button"
//             onClick={() => setReloadKey((v) => v + 1)}
//             className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
//           >
//             Refresh
//           </button>

//           {canManage && (
//             <Link
//               href="/admin/food/products/new"
//               className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
//             >
//               + Add Product
//             </Link>
//           )}
//         </div>
//       </div>

//       <div className="mb-4 flex flex-col gap-3 sm:flex-row">
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder="Search products..."
//           disabled={loading}
//           className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
//         />
//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           disabled={loading}
//           className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//         >
//           {categories.map((item) => (
//             <option key={item} value={item}>
//               {item}
//             </option>
//           ))}
//         </select>
//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           disabled={loading}
//           className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
//         >
//           <option value="All Statuses">All Statuses</option>
//           <option value="ACTIVE">ACTIVE</option>
//           <option value="INACTIVE">INACTIVE</option>
//           <option value="DRAFT">DRAFT</option>
//         </select>
//       </div>

//       {loading || authLoading ? (
//         <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
//           <h3 className="text-lg font-bold text-[#3b2516]">Loading products...</h3>
//         </div>
//       ) : error ? (
//         <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
//           <h3 className="text-lg font-bold text-red-800">Could not load products</h3>
//           <p className="mt-2 text-sm text-red-700">{error}</p>
//           <button
//             type="button"
//             onClick={() => setReloadKey((v) => v + 1)}
//             className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
//           >
//             Try again
//           </button>
//         </div>
//       ) : (
//         <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[850px] text-left text-sm">
//               <thead className="bg-slate-50 text-xs uppercase text-slate-500">
//                 <tr>
//                   <th className="px-5 py-3">productId</th>
//                   <th className="px-5 py-3">Product</th>
//                   <th className="px-5 py-3">Category</th>
//                   <th className="px-5 py-3">Variants</th>
//                   <th className="px-5 py-3">Status</th>
//                   <th className="px-5 py-3">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filtered.length === 0 ? (
//                   <tr>
//                     <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
//                       {products.length === 0
//                         ? canManage
//                           ? "No products found. Add your first product."
//                           : "No products found."
//                         : "No products match your filters."}
//                     </td>
//                   </tr>
//                 ) : (
//                   filtered.map((product) => (
//                     <tr key={product.productId}>
//                       <td className="px-5 py-4 font-mono text-xs font-bold text-orange-600">
//                         {product.productId}
//                       </td>
//                       <td className="px-5 py-4">
//                         <div className="font-bold">{product.name}</div>
//                         <div className="text-xs text-slate-400">/{product.slug}</div>
//                       </td>
//                       <td className="px-5 py-4">{product.category}</td>
//                       <td className="px-5 py-4">{product.variants}</td>
//                       <td className="px-5 py-4">
//                         <span
//                           className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
//                             product.status === "ACTIVE"
//                               ? "bg-emerald-100 text-emerald-700"
//                               : "bg-slate-100 text-slate-500"
//                           }`}
//                         >
//                           {product.status}
//                         </span>
//                       </td>
//                       <td className="px-5 py-4">
//                         <Link
//                           href={`/admin/food/products/${product.productId}`}
//                           className={`text-xs font-bold ${
//                             canManage ? "text-orange-600" : "text-slate-500"
//                           }`}
//                         >
//                           {canManage ? "Edit →" : "View →"}
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { can } from "@/lib/permissions";

type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

type Product = {
  productId: string;
  slug: string;
  name: string;
  categoryId: string;
  category: string;
  variants: number;
  status: ProductStatus;
};

type ApiResponse =
  | { success: true; data: unknown; message?: string }
  | { success: false; error: { code: string; message: string } };

function extractList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (!data || typeof data !== "object") return [];
  const obj = data as Record<string, unknown>;
  for (const key of ["products", "items", "results", "data"]) {
    if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
  }
  return [];
}

function normalizeStatus(value: unknown): ProductStatus {
  const raw = String(value || "ACTIVE").toUpperCase();
  if (raw === "INACTIVE") return "INACTIVE";
  if (raw === "DRAFT") return "DRAFT";
  return "ACTIVE";
}

function normalizeProduct(raw: Record<string, unknown>): Product | null {
  const productId = String(raw.productId || raw.id || "").trim();
  const name = String(raw.name || "").trim();
  if (!productId || !name) return null;

  const variantsRaw = Array.isArray(raw.variants) ? raw.variants : [];
  const variantsCount =
    typeof raw.variantsCount === "number"
      ? raw.variantsCount
      : variantsRaw.length;

  return {
    productId,
    slug: String(raw.slug || productId).trim(),
    name,
    categoryId: String(raw.categoryId || "").trim(),
    category:
      String(raw.categoryName || raw.category || "General").trim() ||
      "General",
    variants: variantsCount,
    status: normalizeStatus(raw.status),
  };
}

export default function ProductsPage() {
  const { user, firebaseUser, loading: authLoading } = useAuth();

  const permUser = {
    userId: user?.userId ?? "",
    role: user?.role ?? null,
  };

  const canManage =
    can(permUser, "FOOD_PRODUCT_CREATE") ||
    can(permUser, "FOOD_PRODUCT_UPDATE");

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [reloadKey, setReloadKey] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/food/products", {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const text = await res.text();
        let json: ApiResponse;
        try {
          json = JSON.parse(text) as ApiResponse;
        } catch {
          throw new Error(
            res.status === 404
              ? "Products API not found (/api/food/products)."
              : `Products API returned non-JSON (HTTP ${res.status}).`,
          );
        }

        if (!res.ok || !json.success) {
          throw new Error(
            !json.success ? json.error.message : "Failed to load products.",
          );
        }

        const normalized = extractList(json.data)
          .map((item) => normalizeProduct(item))
          .filter(Boolean) as Product[];

        if (!cancelled) setProducts(normalized);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Failed to load products.",
          );
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.category)),
    ).sort((a, b) => a.localeCompare(b));
    return ["All Categories", ...unique];
  }, [products]);

  useEffect(() => {
    if (category !== "All Categories" && !categories.includes(category)) {
      setCategory("All Categories");
    }
  }, [categories, category]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        [
          product.productId,
          product.name,
          product.slug,
          product.category,
          product.categoryId,
          product.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All Categories" || product.category === category;

      const matchesStatus =
        status === "All Statuses" || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  async function deleteProduct(product: Product) {
    if (!canManage) {
      setError("You do not have permission to delete products.");
      return;
    }
    if (!firebaseUser) {
      setError("Authentication is required.");
      return;
    }

    const ok = window.confirm(
      `Delete product "${product.name}" (${product.productId})?\nThis cannot be undone.`,
    );
    if (!ok) return;

    try {
      setDeletingId(product.productId);
      setError(null);
      setMessage(null);

      const token = await firebaseUser.getIdToken(true);

      const res = await fetch(
        `/api/food/products?productId=${encodeURIComponent(product.productId)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const text = await res.text();
      let json: ApiResponse;
      try {
        json = JSON.parse(text) as ApiResponse;
      } catch {
        throw new Error(
          `Delete API returned non-JSON (HTTP ${res.status}).`,
        );
      }

      if (!res.ok || !json.success) {
        throw new Error(
          !json.success
            ? json.error.message
            : "Failed to delete product.",
        );
      }

      setProducts((current) =>
        current.filter((p) => p.productId !== product.productId),
      );
      setMessage(`Deleted "${product.name}".`);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Failed to delete product.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
            Food
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#3b2516]">Products</h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage food products, variants and availability.
          </p>
          {!authLoading && !canManage && (
            <p className="mt-2 text-xs text-slate-500">
              View only — you need product create/update permission to edit or
              delete.
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setReloadKey((v) => v + 1)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            Refresh 
          </button>

          {canManage && (
            <Link
              href="/admin/food/products/new"
              className="rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
            >
              + Add Product
            </Link>
          )}
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          disabled={loading}
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          <option value="All Statuses">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="DRAFT">DRAFT</option>
        </select>
      </div>

      {loading || authLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <h3 className="text-lg font-bold text-[#3b2516]">
            Loading products...
          </h3>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-16 text-center">
          <h3 className="text-lg font-bold text-red-800">
            Could not load products
          </h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((v) => v + 1)}
            className="mt-4 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-bold text-white"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">productId</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Variants</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-slate-500"
                    >
                      {products.length === 0
                        ? canManage
                          ? "No products found. Add your first product."
                          : "No products found."
                        : "No products match your filters."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.productId}>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-orange-600">
                        {product.productId}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold">{product.name}</div>
                        <div className="text-xs text-slate-400">
                          /{product.slug}
                        </div>
                      </td>
                      <td className="px-5 py-4">{product.category}</td>
                      <td className="px-5 py-4">{product.variants}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            product.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/food/products/${product.productId}`}
                            className={`text-xs font-bold ${
                              canManage
                                ? "text-orange-600"
                                : "text-slate-500"
                            }`}
                          >
                            {canManage ? "Edit →" : "View →"}
                          </Link>

                          {canManage && (
                            <button
                              type="button"
                              onClick={() => deleteProduct(product)}
                              disabled={deletingId === product.productId}
                              className="text-xs font-bold text-red-600 disabled:opacity-50"
                            >
                              {deletingId === product.productId
                                ? "Deleting…"
                                : "Delete"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}