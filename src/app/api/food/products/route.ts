// import { NextResponse } from "next/server";
// import { collection, getDocs } from "firebase/firestore";
// import { firestore } from "@/lib/firebase";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// export async function GET() {
//   try {
//     const ref = collection(
//       firestore,
//       FIRESTORE_COLLECTIONS.PRODUCTS,
//     );

//     const snap = await getDocs(ref);

//     const products = snap.docs.map((doc) => {
//       const data = doc.data() as Record<string, unknown>;
//       const variants = Array.isArray(data.variants)
//         ? data.variants
//         : [];

//       return {
//         id: doc.id,
//         productId: String(data.productId || doc.id),
//         slug: String(data.slug || ""),
//         name: String(data.name || ""),
//         categoryId: String(data.categoryId || ""),
//         category: String(
//           data.categoryName || data.category || "General",
//         ),
//         description: String(data.description || ""),
//         imageUrl: String(
//           data.imageUrl ||
//             data.image ||
//             "/images/default-product-placeholder.png",
//         ),
//         status:
//           data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
//         featured: Boolean(data.featured),
//         variantsCount: variants.length,
//         variants,
//         createdAt: data.createdAt || null,
//         updatedAt: data.updatedAt || null,
//       };
//     });

//     // Newest first when timestamps exist
//     products.sort((a, b) => {
//       const aTime = String(a.updatedAt || a.createdAt || "");
//       const bTime = String(b.updatedAt || b.createdAt || "");
//       return bTime.localeCompare(aTime);
//     });

//     return NextResponse.json({
//       success: true,
//       data: products,
//     });
//   } catch (error) {
//     console.error("GET /api/food/products", error);

//     return NextResponse.json(
//       {
//         success: false,
//         error: {
//           code: "PRODUCTS_FETCH_FAILED",
//           message: "Failed to load products from Firestore.",
//         },
//       },
//       { status: 500 },
//     );
//   }
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
//     const slug = String(body.slug || "").trim() || slugify(name);
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
//     const categoryName =
//       String(body.categoryName || body.category || "General").trim() ||
//       "General";

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
//     const slug = String(body.slug || "").trim() || slugify(name);
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
//     const categoryName =
//       String(body.categoryName || body.category || "General").trim() ||
//       "General";

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

import { NextRequest, NextResponse } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

export const runtime = "nodejs";

type ProductStatus = "ACTIVE" | "INACTIVE" | "DRAFT";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeProduct(id: string, data: DocumentData) {
  const variants = Array.isArray(data.variants) ? data.variants : [];

  return {
    id,
    productId: String(data.productId || id),
    slug: String(data.slug || ""),
    name: String(data.name || ""),
    categoryId: String(data.categoryId || ""),
    category: String(data.categoryName || data.category || "General"),
    categoryName: String(data.categoryName || data.category || "General"),
    description: String(data.description || ""),
    imageUrl: String(
      data.imageUrl ||
        data.image ||
        "/images/default-product-placeholder.png",
    ),
    status:
      data.status === "INACTIVE"
        ? "INACTIVE"
        : data.status === "DRAFT"
          ? "DRAFT"
          : "ACTIVE",
    featured: Boolean(data.featured),
    variantsCount: variants.length,
    variants,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

function normalizeVariants(input: unknown) {
  if (!Array.isArray(input)) return [];

  return input
    .map((raw, index) => {
      const item = (raw || {}) as Record<string, unknown>;
      const price = Number(item.price);
      const stock = Number(item.stock ?? 0);

      if (!Number.isFinite(price) || price < 0) return null;

      return {
        variantId: String(
          item.variantId ||
            item.id ||
            `VAR-${String(index + 1).padStart(3, "0")}`,
        ),
        name: String(item.name || item.label || `Option ${index + 1}`),
        label: String(item.label || item.name || `Option ${index + 1}`),
        weight: Number(item.weight) || 0,
        weightUnit:
          String(item.weightUnit || "GRAM").toUpperCase() === "KG"
            ? "KG"
            : "GRAM",
        price,
        stock: Number.isFinite(stock) ? Math.max(0, stock) : 0,
        enabled: item.enabled === undefined ? true : Boolean(item.enabled),
      };
    })
    .filter(Boolean);
}

export async function GET() {
  try {
    const snap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
      .get();

    const products = snap.docs.map((doc) =>
      normalizeProduct(doc.id, doc.data()),
    );

    products.sort((a, b) => {
      const aTime = String(a.updatedAt || a.createdAt || "");
      const bTime = String(b.updatedAt || b.createdAt || "");
      return bTime.localeCompare(aTime);
    });

    return json({ success: true, data: products });
  } catch (error) {
    console.error("GET /api/food/products", error);
    return json(
      {
        success: false,
        error: {
          code: "PRODUCTS_FETCH_FAILED",
          message: "Failed to load products from Firestore.",
        },
      },
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required.",
          },
        },
        401,
      );
    }

    if (!can(user, "FOOD_PRODUCT_CREATE")) {
      return json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to create products.",
          },
        },
        403,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim() || slugify(name);
    const variants = normalizeVariants(body.variants);

    if (!name) {
      return json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Product name is required.",
          },
        },
        400,
      );
    }

    if (!slug) {
      return json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Product slug is required.",
          },
        },
        400,
      );
    }

    if (variants.length === 0) {
      return json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one valid variant with price is required.",
          },
        },
        400,
      );
    }

    const now = new Date().toISOString();
    const ref = adminDb.collection(FIRESTORE_COLLECTIONS.PRODUCTS).doc();

    const statusRaw = String(body.status || "ACTIVE").toUpperCase();
    const status: ProductStatus =
      statusRaw === "INACTIVE"
        ? "INACTIVE"
        : statusRaw === "DRAFT"
          ? "DRAFT"
          : "ACTIVE";

    const categoryId = String(body.categoryId || "").trim();
    const categoryName =
      String(body.categoryName || body.category || "General").trim() ||
      "General";

    const record = {
      id: ref.id,
      productId: ref.id,
      name,
      slug,
      categoryId: categoryId || null,
      category: categoryName,
      categoryName,
      description: String(body.description || "").trim(),
      imageUrl:
        String(body.imageUrl || "").trim() ||
        "/images/default-product-placeholder.png",
      status,
      featured: Boolean(body.featured),
      variants,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set(record);

    try {
      await writeAuditLog({
        userId: user.userId,
        action: "PRODUCT_CREATE",
        module: "FOOD",
        resourceType: "product",
        resourceId: record.productId,
        metadata: { name: record.name, slug: record.slug },
      });
    } catch (e) {
      console.error("PRODUCT_CREATE audit failed", e);
    }

    return json(
      {
        success: true,
        data: normalizeProduct(ref.id, record),
        message: "Product created.",
      },
      201,
    );
  } catch (error) {
    console.error("POST /api/food/products", error);
    return json(
      {
        success: false,
        error: {
          code: "PRODUCT_CREATE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to create product.",
        },
      },
      500,
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required.",
          },
        },
        401,
      );
    }

    if (!can(user, "FOOD_PRODUCT_UPDATE")) {
      return json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to update products.",
          },
        },
        403,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const productId = String(body.productId || body.id || "").trim();

    if (!productId) {
      return json(
        {
          success: false,
          error: {
            code: "PRODUCT_ID_REQUIRED",
            message: "productId is required.",
          },
        },
        400,
      );
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
      .doc(productId);

    const existing = await ref.get();
    if (!existing.exists) {
      return json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product was not found.",
          },
        },
        404,
      );
    }

    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim() || slugify(name);
    const variants = normalizeVariants(body.variants);

    if (!name) {
      return json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Product name is required.",
          },
        },
        400,
      );
    }

    if (variants.length === 0) {
      return json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "At least one valid variant with price is required.",
          },
        },
        400,
      );
    }

    const statusRaw = String(body.status || "ACTIVE").toUpperCase();
    const status: ProductStatus =
      statusRaw === "INACTIVE"
        ? "INACTIVE"
        : statusRaw === "DRAFT"
          ? "DRAFT"
          : "ACTIVE";

    const categoryId = String(body.categoryId || "").trim();
    const categoryName =
      String(body.categoryName || body.category || "General").trim() ||
      "General";

    const patch = {
      productId,
      name,
      slug,
      categoryId: categoryId || null,
      category: categoryName,
      categoryName,
      description: String(body.description || "").trim(),
      imageUrl:
        String(body.imageUrl || "").trim() ||
        "/images/default-product-placeholder.png",
      status,
      featured: Boolean(body.featured),
      variants,
      updatedAt: new Date().toISOString(),
    };

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeProduct(updated.id, updated.data() || {});

    try {
      await writeAuditLog({
        userId: user.userId,
        action: "PRODUCT_UPDATE",
        module: "FOOD",
        resourceType: "product",
        resourceId: productId,
        metadata: { name, slug },
      });
    } catch (e) {
      console.error("PRODUCT_UPDATE audit failed", e);
    }

    return json({
      success: true,
      data: record,
      message: "Product updated.",
    });
  } catch (error) {
    console.error("PUT /api/food/products", error);
    return json(
      {
        success: false,
        error: {
          code: "PRODUCT_UPDATE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to update product.",
        },
      },
      500,
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication is required.",
          },
        },
        401,
      );
    }

    if (!can(user, "FOOD_PRODUCT_UPDATE")) {
      return json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "You do not have permission to delete products.",
          },
        },
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    let productId =
      searchParams.get("productId") || searchParams.get("id") || "";

    if (!productId) {
      try {
        const body = (await request.json()) as Record<string, unknown>;
        productId = String(body.productId || body.id || "").trim();
      } catch {
        // no body
      }
    }

    productId = String(productId || "").trim();

    if (!productId) {
      return json(
        {
          success: false,
          error: {
            code: "PRODUCT_ID_REQUIRED",
            message: "productId is required.",
          },
        },
        400,
      );
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
      .doc(productId);

    const existing = await ref.get();
    if (!existing.exists) {
      return json(
        {
          success: false,
          error: {
            code: "PRODUCT_NOT_FOUND",
            message: "Product was not found.",
          },
        },
        404,
      );
    }

    const data = existing.data() || {};
    await ref.delete();

    try {
      await writeAuditLog({
        userId: user.userId,
        action: "PRODUCT_DELETE",
        module: "FOOD",
        resourceType: "product",
        resourceId: productId,
        metadata: {
          name: data.name || null,
          slug: data.slug || null,
        },
      });
    } catch (e) {
      console.error("PRODUCT_DELETE audit failed", e);
    }

    return json({
      success: true,
      data: { productId, deleted: true },
      message: "Product deleted.",
    });
  } catch (error) {
    console.error("DELETE /api/food/products", error);
    return json(
      {
        success: false,
        error: {
          code: "PRODUCT_DELETE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to delete product.",
        },
      },
      500,
    );
  }
}