// import { NextRequest } from "next/server";
// import type { DocumentData } from "firebase-admin/firestore";

// import { adminDb } from "@/lib/firebase-admin";
// import { getCurrentUser } from "@/lib/auth";
// import { can } from "@/lib/permissions";
// import { writeAuditLog } from "@/lib/audit";
// import {
//   successResponse,
//   errorResponse,
// } from "@/lib/api-response";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// type CategoryStatus = "ACTIVE" | "INACTIVE";

// type CategoryRecord = {
//   id: string;
//   categoryId: string;
//   name: string;
//   slug: string;
//   description?: string;
//   enabled: boolean;
//   status: CategoryStatus;
//   products: number;
//   createdAt: string;
//   updatedAt: string;
// };

// type CreateBody = {
//   name?: string;
//   slug?: string;
//   description?: string;
//   enabled?: boolean;
// };

// type UpdateBody = CreateBody & {
//   categoryId?: string;
// };

// function slugify(value: string): string {
//   return value
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/(^-|-$)/g, "");
// }

// function normalizeCategory(
//   id: string,
//   data: DocumentData,
//   productCount = 0,
// ): CategoryRecord {
//   const name = String(data.name || "").trim();
//   const slug = String(data.slug || slugify(name) || id).trim();
//   const enabled =
//     data.enabled === undefined
//       ? String(data.status || "ACTIVE").toUpperCase() !== "INACTIVE"
//       : Boolean(data.enabled);

//   return {
//     id,
//     categoryId: String(data.categoryId || id),
//     name,
//     slug,
//     description: data.description
//       ? String(data.description).trim()
//       : undefined,
//     enabled,
//     status: enabled ? "ACTIVE" : "INACTIVE",
//     products:
//       typeof data.products === "number" ? data.products : productCount,
//     createdAt: String(data.createdAt || new Date().toISOString()),
//     updatedAt: String(
//       data.updatedAt || data.createdAt || new Date().toISOString(),
//     ),
//   };
// }

// async function countProductsByCategory(): Promise<Map<string, number>> {
//   const counts = new Map<string, number>();

//   try {
//     const snap = await adminDb
//       .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
//       .get();

//     snap.docs.forEach((doc) => {
//       const data = doc.data();
//       const categoryId = String(data.categoryId || "").trim();
//       const categoryName = String(
//         data.categoryName || data.category || "",
//       ).trim();
//       const key = categoryId || slugify(categoryName);

//       if (!key) return;

//       counts.set(key, (counts.get(key) || 0) + 1);
//     });
//   } catch (error) {
//     console.error("countProductsByCategory failed", error);
//   }

//   return counts;
// }

// export async function GET(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);

//     // Allow read for food product view or category manage
//     if (
//       user &&
//       !can(user, "FOOD_PRODUCT_VIEW") &&
//       !can(user, "FOOD_CATEGORY_MANAGE")
//     ) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to view categories.",
//         403,
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status");
//     const q = searchParams.get("q")?.trim().toLowerCase();

//     const [snapshot, productCounts] = await Promise.all([
//       adminDb.collection(FIRESTORE_COLLECTIONS.CATEGORIES).get(),
//       countProductsByCategory(),
//     ]);

//     let categories = snapshot.docs.map((doc) => {
//       const data = doc.data();
//       const base = normalizeCategory(doc.id, data);
//       const byId = productCounts.get(base.categoryId) || 0;
//       const bySlug = productCounts.get(base.slug) || 0;
//       return {
//         ...base,
//         products: Math.max(byId, bySlug, base.products),
//       };
//     });

//     if (status === "ACTIVE" || status === "INACTIVE") {
//       categories = categories.filter((item) => item.status === status);
//     }

//     if (q) {
//       categories = categories.filter((item) =>
//         [item.categoryId, item.name, item.slug, item.description]
//           .filter(Boolean)
//           .join(" ")
//           .toLowerCase()
//           .includes(q),
//       );
//     }

//     categories.sort((a, b) => a.name.localeCompare(b.name));

//     return successResponse(categories);
//   } catch (error) {
//     console.error("GET /api/food/categories failed", error);

//     return errorResponse(
//       "CATEGORIES_LIST_FAILED",
//       error instanceof Error
//         ? error.message
//         : "Failed to load categories.",
//       500,
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);

//     if (!user) {
//       return errorResponse(
//         "UNAUTHORIZED",
//         "Authentication is required.",
//         401,
//       );
//     }

//     if (!can(user, "FOOD_CATEGORY_MANAGE")) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to create categories.",
//         403,
//       );
//     }

//     let body: CreateBody;

//     try {
//       body = (await request.json()) as CreateBody;
//     } catch {
//       return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
//     }

//     const name = body.name?.trim() || "";
//     const slug = (body.slug?.trim() || slugify(name)).toLowerCase();

//     if (!name) {
//       return errorResponse(
//         "VALIDATION_ERROR",
//         "Category name is required.",
//         400,
//       );
//     }

//     if (!slug) {
//       return errorResponse(
//         "VALIDATION_ERROR",
//         "Category slug is required.",
//         400,
//       );
//     }

//     // Unique slug check
//     const existing = await adminDb
//       .collection(FIRESTORE_COLLECTIONS.CATEGORIES)
//       .where("slug", "==", slug)
//       .limit(1)
//       .get();

//     if (!existing.empty) {
//       return errorResponse(
//         "SLUG_EXISTS",
//         "A category with this slug already exists.",
//         409,
//       );
//     }

//     const now = new Date().toISOString();
//     const ref = adminDb.collection(FIRESTORE_COLLECTIONS.CATEGORIES).doc();
//     const enabled = body.enabled === false ? false : true;

//     const record: CategoryRecord = {
//       id: ref.id,
//       categoryId: ref.id,
//       name,
//       slug,
//       description: body.description?.trim() || undefined,
//       enabled,
//       status: enabled ? "ACTIVE" : "INACTIVE",
//       products: 0,
//       createdAt: now,
//       updatedAt: now,
//     };

//     await ref.set(record);

//     await writeAuditLog({
//       userId: user.userId,
//       action: "CATEGORY_CREATE",
//       module: "FOOD",
//       resourceType: "category",
//       resourceId: record.categoryId,
//       metadata: { name: record.name, slug: record.slug },
//     });

//     return successResponse(record, 201, "Category created.");
//   } catch (error) {
//     console.error("POST /api/food/categories failed", error);

//     return errorResponse(
//       "CATEGORY_CREATE_FAILED",
//       error instanceof Error
//         ? error.message
//         : "Failed to create category.",
//       500,
//     );
//   }
// }

// export async function PATCH(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);

//     if (!user) {
//       return errorResponse(
//         "UNAUTHORIZED",
//         "Authentication is required.",
//         401,
//       );
//     }

//     if (!can(user, "FOOD_CATEGORY_MANAGE")) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to update categories.",
//         403,
//       );
//     }

//     let body: UpdateBody;

//     try {
//       body = (await request.json()) as UpdateBody;
//     } catch {
//       return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
//     }

//     const categoryId = body.categoryId?.trim();

//     if (!categoryId) {
//       return errorResponse(
//         "CATEGORY_ID_REQUIRED",
//         "categoryId is required.",
//         400,
//       );
//     }

//     const ref = adminDb
//       .collection(FIRESTORE_COLLECTIONS.CATEGORIES)
//       .doc(categoryId);

//     const existing = await ref.get();

//     if (!existing.exists) {
//       return errorResponse(
//         "CATEGORY_NOT_FOUND",
//         "Category was not found.",
//         404,
//       );
//     }

//     const patch: Record<string, unknown> = {
//       updatedAt: new Date().toISOString(),
//     };

//     if (body.name !== undefined) {
//       const name = body.name.trim();
//       if (!name) {
//         return errorResponse(
//           "VALIDATION_ERROR",
//           "Category name cannot be empty.",
//           400,
//         );
//       }
//       patch.name = name;
//     }

//     if (body.slug !== undefined) {
//       const slug = body.slug.trim().toLowerCase() || slugify(String(body.name || ""));
//       if (!slug) {
//         return errorResponse(
//           "VALIDATION_ERROR",
//           "Category slug cannot be empty.",
//           400,
//         );
//       }

//       const slugClash = await adminDb
//         .collection(FIRESTORE_COLLECTIONS.CATEGORIES)
//         .where("slug", "==", slug)
//         .limit(2)
//         .get();

//       const conflict = slugClash.docs.some((doc) => doc.id !== categoryId);
//       if (conflict) {
//         return errorResponse(
//           "SLUG_EXISTS",
//           "A category with this slug already exists.",
//           409,
//         );
//       }

//       patch.slug = slug;
//     }

//     if (body.description !== undefined) {
//       patch.description = body.description.trim() || null;
//     }

//     if (body.enabled !== undefined) {
//       patch.enabled = Boolean(body.enabled);
//       patch.status = body.enabled ? "ACTIVE" : "INACTIVE";
//     }

//     await ref.set(patch, { merge: true });

//     const updated = await ref.get();
//     const record = normalizeCategory(updated.id, updated.data() || {});

//     await writeAuditLog({
//       userId: user.userId,
//       action: "CATEGORY_UPDATE",
//       module: "FOOD",
//       resourceType: "category",
//       resourceId: record.categoryId,
//       metadata: patch,
//     });

//     return successResponse(record, 200, "Category updated.");
//   } catch (error) {
//     console.error("PATCH /api/food/categories failed", error);

//     return errorResponse(
//       "CATEGORY_UPDATE_FAILED",
//       error instanceof Error
//         ? error.message
//         : "Failed to update category.",
//       500,
//     );
//   }
// }

import { NextRequest } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

export const runtime = "nodejs";

type CategoryStatus = "ACTIVE" | "INACTIVE";

type CategoryRecord = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  enabled: boolean;
  status: CategoryStatus;
  products: number;
  createdAt: string;
  updatedAt: string;
};

type CreateBody = {
  name?: string;
  slug?: string;
  description?: string;
  enabled?: boolean;
};

type UpdateBody = CreateBody & {
  categoryId?: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeCategory(
  id: string,
  data: DocumentData,
  productCount = 0,
): CategoryRecord {
  const name = String(data.name || "").trim();
  const slug = String(data.slug || slugify(name) || id).trim();
  const enabled =
    data.enabled === undefined
      ? String(data.status || "ACTIVE").toUpperCase() !== "INACTIVE"
      : Boolean(data.enabled);

  return {
    id,
    categoryId: String(data.categoryId || id),
    name,
    slug,
    description: data.description
      ? String(data.description).trim()
      : undefined,
    enabled,
    status: enabled ? "ACTIVE" : "INACTIVE",
    products:
      typeof data.products === "number" ? data.products : productCount,
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(
      data.updatedAt || data.createdAt || new Date().toISOString(),
    ),
  };
}

async function countProductsByCategory(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();

  try {
    const snap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.PRODUCTS)
      .get();

    snap.docs.forEach((doc) => {
      const data = doc.data();
      const categoryId = String(data.categoryId || "").trim();
      const categoryName = String(
        data.categoryName || data.category || "",
      ).trim();
      const key = categoryId || slugify(categoryName);
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  } catch (error) {
    console.error("countProductsByCategory failed", error);
  }

  return counts;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (
      user &&
      !can(user, "FOOD_PRODUCT_VIEW") &&
      !can(user, "FOOD_CATEGORY_MANAGE")
    ) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view categories.",
        403,
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q")?.trim().toLowerCase();

    const [snapshot, productCounts] = await Promise.all([
      adminDb.collection(FIRESTORE_COLLECTIONS.CATEGORIES).get(),
      countProductsByCategory(),
    ]);

    let categories = snapshot.docs.map((doc) => {
      const base = normalizeCategory(doc.id, doc.data());
      const byId = productCounts.get(base.categoryId) || 0;
      const bySlug = productCounts.get(base.slug) || 0;
      return {
        ...base,
        products: Math.max(byId, bySlug, base.products),
      };
    });

    if (status === "ACTIVE" || status === "INACTIVE") {
      categories = categories.filter((item) => item.status === status);
    }

    if (q) {
      categories = categories.filter((item) =>
        [item.categoryId, item.name, item.slug, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    categories.sort((a, b) => a.name.localeCompare(b.name));

    return successResponse(categories);
  } catch (error) {
    console.error("GET /api/food/categories failed", error);
    return errorResponse(
      "CATEGORIES_LIST_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to load categories.",
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "FOOD_CATEGORY_MANAGE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to create categories.",
        403,
      );
    }

    let body: CreateBody;
    try {
      body = (await request.json()) as CreateBody;
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
    }

    const name = body.name?.trim() || "";
    const slug = (body.slug?.trim() || slugify(name)).toLowerCase();

    if (!name) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Category name is required.",
        400,
      );
    }
    if (!slug) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Category slug is required.",
        400,
      );
    }

    // Unique slug (scan is safer than composite-index issues)
    const allSnap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.CATEGORIES)
      .get();

    const slugTaken = allSnap.docs.some(
      (doc) => String(doc.data().slug || "").toLowerCase() === slug,
    );

    if (slugTaken) {
      return errorResponse(
        "SLUG_EXISTS",
        "A category with this slug already exists.",
        409,
      );
    }

    const now = new Date().toISOString();
    const ref = adminDb.collection(FIRESTORE_COLLECTIONS.CATEGORIES).doc();
    const enabled = body.enabled === false ? false : true;

    const record: CategoryRecord = {
      id: ref.id,
      categoryId: ref.id,
      name,
      slug,
      description: body.description?.trim() || undefined,
      enabled,
      status: enabled ? "ACTIVE" : "INACTIVE",
      products: 0,
      createdAt: now,
      updatedAt: now,
    };

    await ref.set({
      ...record,
      description: record.description || null,
    });

    try {
      await writeAuditLog({
        userId: user.userId,
        action: "CATEGORY_CREATE",
        module: "FOOD",
        resourceType: "category",
        resourceId: record.categoryId,
        metadata: { name: record.name, slug: record.slug },
      });
    } catch (auditError) {
      console.error("CATEGORY_CREATE audit failed", auditError);
    }

    return successResponse(record, 201, "Category created.");
  } catch (error) {
    console.error("POST /api/food/categories failed", error);
    return errorResponse(
      "CATEGORY_CREATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to create category.",
      500,
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return errorResponse(
        "UNAUTHORIZED",
        "Authentication is required.",
        401,
      );
    }

    if (!can(user, "FOOD_CATEGORY_MANAGE")) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update categories.",
        403,
      );
    }

    let body: UpdateBody;
    try {
      body = (await request.json()) as UpdateBody;
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
    }

    const categoryId = body.categoryId?.trim();
    if (!categoryId) {
      return errorResponse(
        "CATEGORY_ID_REQUIRED",
        "categoryId is required.",
        400,
      );
    }

    const ref = adminDb
      .collection(FIRESTORE_COLLECTIONS.CATEGORIES)
      .doc(categoryId);

    const existing = await ref.get();
    if (!existing.exists) {
      return errorResponse(
        "CATEGORY_NOT_FOUND",
        "Category was not found.",
        404,
      );
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (body.name !== undefined) {
      const name = body.name.trim();
      if (!name) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Category name cannot be empty.",
          400,
        );
      }
      patch.name = name;
    }

    if (body.slug !== undefined) {
      const slug =
        body.slug.trim().toLowerCase() ||
        slugify(String(body.name || ""));
      if (!slug) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Category slug cannot be empty.",
          400,
        );
      }

      const allSnap = await adminDb
        .collection(FIRESTORE_COLLECTIONS.CATEGORIES)
        .get();
      const conflict = allSnap.docs.some(
        (doc) =>
          doc.id !== categoryId &&
          String(doc.data().slug || "").toLowerCase() === slug,
      );
      if (conflict) {
        return errorResponse(
          "SLUG_EXISTS",
          "A category with this slug already exists.",
          409,
        );
      }
      patch.slug = slug;
    }

    if (body.description !== undefined) {
      patch.description = body.description.trim() || null;
    }

    if (body.enabled !== undefined) {
      patch.enabled = Boolean(body.enabled);
      patch.status = body.enabled ? "ACTIVE" : "INACTIVE";
    }

    await ref.set(patch, { merge: true });

    const updated = await ref.get();
    const record = normalizeCategory(updated.id, updated.data() || {});

    try {
      await writeAuditLog({
        userId: user.userId,
        action: "CATEGORY_UPDATE",
        module: "FOOD",
        resourceType: "category",
        resourceId: record.categoryId,
        metadata: patch,
      });
    } catch (auditError) {
      console.error("CATEGORY_UPDATE audit failed", auditError);
    }

    return successResponse(record, 200, "Category updated.");
  } catch (error) {
    console.error("PATCH /api/food/categories failed", error);
    return errorResponse(
      "CATEGORY_UPDATE_FAILED",
      error instanceof Error
        ? error.message
        : "Failed to update category.",
      500,
    );
  }
}