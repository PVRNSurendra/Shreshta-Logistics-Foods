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

// type CoLoaderStatus = "ACTIVE" | "INACTIVE";

// type CoLoaderRecord = {
//   id: string;
//   coloaderId: string;
//   name: string;
//   location: string;
//   contact: string;
//   status: CoLoaderStatus;
//   enabled: boolean;
//   createdAt: string;
//   updatedAt: string;
// };

// type CreateBody = {
//   name?: string;
//   location?: string;
//   contact?: string;
//   status?: CoLoaderStatus;
// };

// type UpdateBody = CreateBody & {
//   id?: string;
//   coloaderId?: string;
// };

// function collectionRef() {
//   return adminDb.collection(
//     FIRESTORE_COLLECTIONS.CO_LOADERS || "coloaders",
//   );
// }

// function normalizeCoLoader(id: string, data: DocumentData): CoLoaderRecord {
//   const statusRaw = String(data.status || "ACTIVE").toUpperCase();
//   const enabled =
//     data.enabled === undefined
//       ? statusRaw !== "INACTIVE"
//       : Boolean(data.enabled);

//   return {
//     id,
//     coloaderId: String(data.coloaderId || id),
//     name: String(data.name || "").trim(),
//     location: String(data.location || data.serviceCenter || data.city || "")
//       .trim(),
//     contact: String(data.contact || data.phone || "").trim(),
//     status: enabled ? "ACTIVE" : "INACTIVE",
//     enabled,
//     createdAt: String(data.createdAt || new Date().toISOString()),
//     updatedAt: String(
//       data.updatedAt || data.createdAt || new Date().toISOString(),
//     ),
//   };
// }

// function validateCreate(body: CreateBody): string[] {
//   const errors: string[] = [];

//   if (!body.name?.trim()) {
//     errors.push("Company name is required.");
//   }

//   if (!body.location?.trim()) {
//     errors.push("Service center / location is required.");
//   }

//   if (
//     body.status !== undefined &&
//     body.status !== "ACTIVE" &&
//     body.status !== "INACTIVE"
//   ) {
//     errors.push("Status must be ACTIVE or INACTIVE.");
//   }

//   return errors;
// }

// export async function GET(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);

//     if (!user) {
//       return errorResponse(
//         "UNAUTHORIZED",
//         "Authentication is required.",
//         401,
//       );
//     }

//     if (!can(user, "LOGISTICS_AWB_VIEW")) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to view co-loaders.",
//         403,
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get("status");
//     const q = searchParams.get("q")?.trim().toLowerCase();

//     const snapshot = await collectionRef().get();

//     let items = snapshot.docs.map((doc) =>
//       normalizeCoLoader(doc.id, doc.data()),
//     );

//     if (status === "ACTIVE" || status === "INACTIVE") {
//       items = items.filter((item) => item.status === status);
//     }

//     if (q) {
//       items = items.filter((item) =>
//         [
//           item.coloaderId,
//           item.name,
//           item.location,
//           item.contact,
//           item.status,
//         ]
//           .join(" ")
//           .toLowerCase()
//           .includes(q),
//       );
//     }

//     items.sort((a, b) => a.name.localeCompare(b.name));

//     return successResponse(items);
//   } catch (error) {
//     console.error("GET /api/logistics/coloaders failed", error);

//     return errorResponse(
//       "COLOADERS_LIST_FAILED",
//       error instanceof Error
//         ? error.message
//         : "Failed to load co-loaders.",
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

//     if (!can(user, "LOGISTICS_AWB_CREATE")) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to create co-loaders.",
//         403,
//       );
//     }

//     let body: CreateBody;

//     try {
//       body = (await request.json()) as CreateBody;
//     } catch {
//       return errorResponse(
//         "INVALID_JSON",
//         "Invalid JSON request body.",
//         400,
//       );
//     }

//     const errors = validateCreate(body);

//     if (errors.length > 0) {
//       return errorResponse("VALIDATION_ERROR", errors[0]!, 400);
//     }

//     const now = new Date().toISOString();
//     const ref = collectionRef().doc();
//     const enabled = body.status !== "INACTIVE";

//     const record: CoLoaderRecord = {
//       id: ref.id,
//       coloaderId: ref.id,
//       name: body.name!.trim(),
//       location: body.location!.trim(),
//       contact: body.contact?.trim() || "",
//       status: enabled ? "ACTIVE" : "INACTIVE",
//       enabled,
//       createdAt: now,
//       updatedAt: now,
//     };

//     await ref.set(record);

//     await writeAuditLog({
//       userId: user.userId,
//       action: "COLOADER_CREATE",
//       module: "LOGISTICS",
//       resourceType: "coloader",
//       resourceId: record.coloaderId,
//       metadata: {
//         name: record.name,
//         location: record.location,
//       },
//     });

//     return successResponse(record, 201, "Co-loader created.");
//   } catch (error) {
//     console.error("POST /api/logistics/coloaders failed", error);

//     return errorResponse(
//       "COLOADER_CREATE_FAILED",
//       error instanceof Error
//         ? error.message
//         : "Failed to create co-loader.",
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

//     if (!can(user, "LOGISTICS_AWB_UPDATE")) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to update co-loaders.",
//         403,
//       );
//     }

//     let body: UpdateBody;

//     try {
//       body = (await request.json()) as UpdateBody;
//     } catch {
//       return errorResponse(
//         "INVALID_JSON",
//         "Invalid JSON request body.",
//         400,
//       );
//     }

//     const coloaderId = (body.coloaderId || body.id || "").trim();

//     if (!coloaderId) {
//       return errorResponse(
//         "COLOADER_ID_REQUIRED",
//         "id / coloaderId is required.",
//         400,
//       );
//     }

//     const ref = collectionRef().doc(coloaderId);
//     const existing = await ref.get();

//     if (!existing.exists) {
//       return errorResponse(
//         "COLOADER_NOT_FOUND",
//         "Co-loader was not found.",
//         404,
//       );
//     }

//     const patch: Record<string, unknown> = {
//       updatedAt: new Date().toISOString(),
//     };

//     if (body.name !== undefined) {
//       if (!body.name.trim()) {
//         return errorResponse(
//           "VALIDATION_ERROR",
//           "Company name cannot be empty.",
//           400,
//         );
//       }
//       patch.name = body.name.trim();
//     }

//     if (body.location !== undefined) {
//       if (!body.location.trim()) {
//         return errorResponse(
//           "VALIDATION_ERROR",
//           "Location cannot be empty.",
//           400,
//         );
//       }
//       patch.location = body.location.trim();
//     }

//     if (body.contact !== undefined) {
//       patch.contact = body.contact.trim();
//     }

//     if (body.status !== undefined) {
//       if (body.status !== "ACTIVE" && body.status !== "INACTIVE") {
//         return errorResponse(
//           "VALIDATION_ERROR",
//           "Status must be ACTIVE or INACTIVE.",
//           400,
//         );
//       }
//       patch.status = body.status;
//       patch.enabled = body.status === "ACTIVE";
//     }

//     await ref.set(patch, { merge: true });

//     const updated = await ref.get();
//     const record = normalizeCoLoader(updated.id, updated.data() || {});

//     await writeAuditLog({
//       userId: user.userId,
//       action: "COLOADER_UPDATE",
//       module: "LOGISTICS",
//       resourceType: "coloader",
//       resourceId: record.coloaderId,
//       metadata: patch,
//     });

//     return successResponse(record, 200, "Co-loader updated.");
//   } catch (error) {
//     console.error("PATCH /api/logistics/coloaders failed", error);

//     return errorResponse(
//       "COLOADER_UPDATE_FAILED",
//       error instanceof Error
//         ? error.message
//         : "Failed to update co-loader.",
//       500,
//     );
//   }
// }

// import { NextRequest } from "next/server";
// import type { DocumentData } from "firebase-admin/firestore";

// import { adminDb } from "@/lib/firebase-admin";
// import { getCurrentUser } from "@/lib/auth";
// import { can, type PermissionUser } from "@/lib/permissions";
// import { writeAuditLog } from "@/lib/audit";
// import { successResponse, errorResponse } from "@/lib/api-response";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// type CoLoaderRecord = {
//   id: string;
//   coLoaderId: string;
//   name: string;
//   code: string;
//   contactPerson: string;
//   phone: string;
//   email: string;
//   location: string;
//   enabled: boolean;
//   status: "ACTIVE" | "INACTIVE";
//   createdAt: string;
//   updatedAt: string;
//   createdBy?: string;
//   updatedBy?: string;
// };

// function collectionRef() {
//   return adminDb.collection(
//     FIRESTORE_COLLECTIONS.CO_LOADERS || "coLoaders",
//   );
// }

// function requireView(user: PermissionUser) {
//   return (
//     can(user, "LOGISTICS_COLOADER_VIEW") ||
//     can(user, "LOGISTICS_COLOADER_MANAGE") ||
//     can(user, "LOGISTICS_AWB_VIEW")
//   );
// }

// function requireManage(user: PermissionUser) {
//   return can(user, "LOGISTICS_COLOADER_MANAGE");
// }

// function normalize(id: string, data: DocumentData): CoLoaderRecord {
//   const enabled =
//     data.enabled === undefined
//       ? String(data.status || "ACTIVE").toUpperCase() !== "INACTIVE"
//       : Boolean(data.enabled);

//   return {
//     id,
//     coLoaderId: String(data.coLoaderId || data.coloaderId || id),
//     name: String(data.name || "").trim(),
//     code: String(data.code || data.accountCode || "")
//       .trim()
//       .toUpperCase(),
//     contactPerson: String(data.contactPerson || data.contact || "").trim(),
//     phone: String(data.phone || "").trim(),
//     email: String(data.email || "").trim(),
//     location: String(data.location || data.city || "").trim(),
//     enabled,
//     status: enabled ? "ACTIVE" : "INACTIVE",
//     createdAt: String(data.createdAt || new Date().toISOString()),
//     updatedAt: String(
//       data.updatedAt || data.createdAt || new Date().toISOString(),
//     ),
//     createdBy: data.createdBy ? String(data.createdBy) : undefined,
//     updatedBy: data.updatedBy ? String(data.updatedBy) : undefined,
//   };
// }

// export async function GET(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);
//     if (!user) {
//       return errorResponse(
//         "UNAUTHENTICATED",
//         "Authentication is required.",
//         401,
//       );
//     }
//     if (!requireView(user)) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to view co-loaders.",
//         403,
//       );
//     }

//     const snap = await collectionRef().limit(300).get();
//     const items = snap.docs
//       .map((doc) => normalize(doc.id, doc.data()))
//       .sort((a, b) => a.name.localeCompare(b.name));

//     return successResponse({ items });
//   } catch (error) {
//     console.error("GET /api/logistics/coloaders:", error);
//     return errorResponse(
//       "COLOADER_LOAD_FAILED",
//       "Failed to load co-loaders.",
//       500,
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);
//     if (!user) {
//       return errorResponse(
//         "UNAUTHENTICATED",
//         "Authentication is required.",
//         401,
//       );
//     }
//     if (!requireManage(user)) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to create co-loaders.",
//         403,
//       );
//     }

//     let body: Record<string, unknown>;
//     try {
//       body = await request.json();
//     } catch {
//       return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
//     }

//     const name = String(body.name || "").trim();
//     const code = String(body.code || "")
//       .trim()
//       .toUpperCase();

//     if (!name) {
//       return errorResponse("VALIDATION_ERROR", "Company name is required.", 400);
//     }
//     if (!code) {
//       return errorResponse(
//         "VALIDATION_ERROR",
//         "Account code is required (e.g. WF439).",
//         400,
//       );
//     }

//     const existingCode = await collectionRef()
//       .where("code", "==", code)
//       .limit(1)
//       .get();
//     if (!existingCode.empty) {
//       return errorResponse(
//         "CODE_EXISTS",
//         `Account code ${code} is already in use.`,
//         409,
//       );
//     }

//     const now = new Date().toISOString();
//     const ref = collectionRef().doc();
//     const enabled = body.enabled === false ? false : true;

//     const record: CoLoaderRecord = {
//       id: ref.id,
//       coLoaderId: ref.id,
//       name,
//       code,
//       contactPerson: String(body.contactPerson || "").trim(),
//       phone: String(body.phone || "").trim(),
//       email: String(body.email || "").trim(),
//       location: String(body.location || "").trim(),
//       enabled,
//       status: enabled ? "ACTIVE" : "INACTIVE",
//       createdAt: now,
//       updatedAt: now,
//       createdBy: user.userId,
//       updatedBy: user.userId,
//     };

//     await ref.set(record);

//     await writeAuditLog({
//       userId: user.userId,
//       action: "COLOADER_CREATE",
//       module: "LOGISTICS",
//       resourceType: "coloader",
//       resourceId: ref.id,
//       metadata: { name, code },
//     });

//     return successResponse({ item: record }, 201, "Co-loader created.");
//   } catch (error) {
//     console.error("POST /api/logistics/coloaders:", error);
//     return errorResponse(
//       "COLOADER_CREATE_FAILED",
//       "Failed to create co-loader.",
//       500,
//     );
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);
//     if (!user) {
//       return errorResponse(
//         "UNAUTHENTICATED",
//         "Authentication is required.",
//         401,
//       );
//     }
//     if (!requireManage(user)) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to update co-loaders.",
//         403,
//       );
//     }

//     let body: Record<string, unknown>;
//     try {
//       body = await request.json();
//     } catch {
//       return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
//     }

//     const id = String(body.id || body.coLoaderId || "").trim();
//     if (!id) {
//       return errorResponse("ID_REQUIRED", "id is required for update.", 400);
//     }

//     const ref = collectionRef().doc(id);
//     const existing = await ref.get();
//     if (!existing.exists) {
//       return errorResponse("NOT_FOUND", "Co-loader not found.", 404);
//     }

//     const prev = existing.data() || {};
//     const now = new Date().toISOString();

//     const code =
//       body.code !== undefined
//         ? String(body.code).trim().toUpperCase()
//         : String(prev.code || "").toUpperCase();

//     if (body.code !== undefined && code) {
//       const clash = await collectionRef().where("code", "==", code).limit(5).get();
//       if (clash.docs.some((d) => d.id !== id)) {
//         return errorResponse(
//           "CODE_EXISTS",
//           `Account code ${code} is already in use.`,
//           409,
//         );
//       }
//     }

//     const enabled =
//       body.enabled !== undefined
//         ? body.enabled !== false
//         : prev.enabled !== false;

//     const record: CoLoaderRecord = {
//       id,
//       coLoaderId: String(prev.coLoaderId || id),
//       name:
//         body.name !== undefined
//           ? String(body.name).trim()
//           : String(prev.name || ""),
//       code,
//       contactPerson:
//         body.contactPerson !== undefined
//           ? String(body.contactPerson).trim()
//           : String(prev.contactPerson || ""),
//       phone:
//         body.phone !== undefined
//           ? String(body.phone).trim()
//           : String(prev.phone || ""),
//       email:
//         body.email !== undefined
//           ? String(body.email).trim()
//           : String(prev.email || ""),
//       location:
//         body.location !== undefined
//           ? String(body.location).trim()
//           : String(prev.location || ""),
//       enabled,
//       status: enabled ? "ACTIVE" : "INACTIVE",
//       createdAt: String(prev.createdAt || now),
//       updatedAt: now,
//       createdBy: prev.createdBy ? String(prev.createdBy) : undefined,
//       updatedBy: user.userId,
//     };

//     if (!record.name) {
//       return errorResponse("VALIDATION_ERROR", "Company name is required.", 400);
//     }
//     if (!record.code) {
//       return errorResponse("VALIDATION_ERROR", "Account code is required.", 400);
//     }

//     await ref.set(record, { merge: true });

//     await writeAuditLog({
//       userId: user.userId,
//       action: "COLOADER_UPDATE",
//       module: "LOGISTICS",
//       resourceType: "coloader",
//       resourceId: id,
//       metadata: { name: record.name, code: record.code },
//     });

//     return successResponse({ item: record }, 200, "Co-loader updated.");
//   } catch (error) {
//     console.error("PUT /api/logistics/coloaders:", error);
//     return errorResponse(
//       "COLOADER_UPDATE_FAILED",
//       "Failed to update co-loader.",
//       500,
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const user = await getCurrentUser(request);
//     if (!user) {
//       return errorResponse(
//         "UNAUTHENTICATED",
//         "Authentication is required.",
//         401,
//       );
//     }
//     if (!requireManage(user)) {
//       return errorResponse(
//         "FORBIDDEN",
//         "You do not have permission to delete co-loaders.",
//         403,
//       );
//     }

//     const id = new URL(request.url).searchParams.get("id")?.trim();
//     if (!id) {
//       return errorResponse("ID_REQUIRED", "id query param is required.", 400);
//     }

//     const ref = collectionRef().doc(id);
//     const existing = await ref.get();
//     if (!existing.exists) {
//       return errorResponse("NOT_FOUND", "Co-loader not found.", 404);
//     }

//     await ref.delete();

//     await writeAuditLog({
//       userId: user.userId,
//       action: "COLOADER_DELETE",
//       module: "LOGISTICS",
//       resourceType: "coloader",
//       resourceId: id,
//       metadata: { name: existing.data()?.name, code: existing.data()?.code },
//     });

//     return successResponse({ id }, 200, "Co-loader deleted.");
//   } catch (error) {
//     console.error("DELETE /api/logistics/coloaders:", error);
//     return errorResponse(
//       "COLOADER_DELETE_FAILED",
//       "Failed to delete co-loader.",
//       500,
//     );
//   }
// }

import { NextRequest } from "next/server";
import type { DocumentData } from "firebase-admin/firestore";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { getCurrentUser } from "@/lib/auth";
import { can, type PermissionUser } from "@/lib/permissions";
import { writeAuditLog } from "@/lib/audit";
import { successResponse, errorResponse } from "@/lib/api-response";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

type CoLoaderRecord = {
  id: string;
  coLoaderId: string;
  name: string;
  code: string;
  contactPerson: string;
  phone: string;
  email: string;
  location: string;
  enabled: boolean;
  status: "ACTIVE" | "INACTIVE";
  authUid?: string;
  hasLogin: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
};

function collectionRef() {
  return adminDb.collection(
    FIRESTORE_COLLECTIONS.CO_LOADERS || "coLoaders",
  );
}

function usersRef() {
  return adminDb.collection(FIRESTORE_COLLECTIONS.USERS || "users");
}

function requireView(user: PermissionUser) {
  return (
    can(user, "LOGISTICS_COLOADER_VIEW") ||
    can(user, "LOGISTICS_COLOADER_MANAGE") ||
    can(user, "LOGISTICS_AWB_VIEW")
  );
}

function requireManage(user: PermissionUser) {
  return can(user, "LOGISTICS_COLOADER_MANAGE");
}

function normalize(id: string, data: DocumentData): CoLoaderRecord {
  const enabled =
    data.enabled === undefined
      ? String(data.status || "ACTIVE").toUpperCase() !== "INACTIVE"
      : Boolean(data.enabled);

  const authUid = data.authUid ? String(data.authUid) : undefined;

  return {
    id,
    coLoaderId: String(data.coLoaderId || data.coloaderId || id),
    name: String(data.name || "").trim(),
    code: String(data.code || data.accountCode || "")
      .trim()
      .toUpperCase(),
    contactPerson: String(data.contactPerson || data.contact || "").trim(),
    phone: String(data.phone || "").trim(),
    email: String(data.email || "").trim(),
    location: String(data.location || data.city || "").trim(),
    enabled,
    status: enabled ? "ACTIVE" : "INACTIVE",
    authUid,
    hasLogin: Boolean(authUid),
    createdAt: String(data.createdAt || new Date().toISOString()),
    updatedAt: String(
      data.updatedAt || data.createdAt || new Date().toISOString(),
    ),
    createdBy: data.createdBy ? String(data.createdBy) : undefined,
    updatedBy: data.updatedBy ? String(data.updatedBy) : undefined,
  };
}

/** Never return password fields to clients */
function toPublic(record: CoLoaderRecord) {
  const { authUid, ...rest } = record;
  return {
    ...rest,
    hasLogin: Boolean(authUid),
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
    if (!requireView(user)) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to view co-loaders.",
        403,
      );
    }

    const snap = await collectionRef().limit(300).get();
    const items = snap.docs
      .map((doc) => toPublic(normalize(doc.id, doc.data())))
      .sort((a, b) => a.name.localeCompare(b.name));

    return successResponse({ items });
  } catch (error) {
    console.error("GET /api/logistics/coloaders:", error);
    return errorResponse(
      "COLOADER_LOAD_FAILED",
      "Failed to load co-loaders.",
      500,
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }
    if (!requireManage(user)) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to create co-loaders.",
        403,
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
    }

    const name = String(body.name || "").trim();
    const code = String(body.code || "")
      .trim()
      .toUpperCase();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");

    if (!name) {
      return errorResponse("VALIDATION_ERROR", "Company name is required.", 400);
    }
    if (!code) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Account code is required (e.g. WF439).",
        400,
      );
    }
    if (!email) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Email is required for co-loader login.",
        400,
      );
    }
    if (!password || password.length < 6) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Password is required and must be at least 6 characters.",
        400,
      );
    }

    const existingCode = await collectionRef()
      .where("code", "==", code)
      .limit(1)
      .get();
    if (!existingCode.empty) {
      return errorResponse(
        "CODE_EXISTS",
        `Account code ${code} is already in use.`,
        409,
      );
    }

    const now = new Date().toISOString();
    const ref = collectionRef().doc();
    const enabled = body.enabled === false ? false : true;

    // Create Firebase Auth user for login
    let authUid: string;
    try {
      const authUser = await adminAuth.createUser({
        email,
        password,
        displayName: name,
        disabled: !enabled,
      });
      authUid = authUser.uid;
    } catch (err: unknown) {
      const codeErr =
        err && typeof err === "object" && "code" in err
          ? String((err as { code: string }).code)
          : "";
      if (codeErr === "auth/email-already-exists") {
        return errorResponse(
          "EMAIL_EXISTS",
          "This email is already registered. Use a different email or update the existing co-loader.",
          409,
        );
      }
      console.error("Firebase createUser failed", err);
      return errorResponse(
        "AUTH_CREATE_FAILED",
        "Failed to create login account for co-loader.",
        500,
      );
    }

    // Users collection so getCurrentUser can resolve role
    await usersRef()
      .doc(authUid)
      .set(
        {
          userId: authUid,
          email,
          name,
          role: "CO_LOADER",
          coLoaderId: ref.id,
          status: enabled ? "ACTIVE" : "INACTIVE",
          createdAt: now,
          updatedAt: now,
        },
        { merge: true },
      );

    const record: CoLoaderRecord = {
      id: ref.id,
      coLoaderId: ref.id,
      name,
      code,
      contactPerson: String(body.contactPerson || "").trim(),
      phone: String(body.phone || "").trim(),
      email,
      location: String(body.location || "").trim(),
      enabled,
      status: enabled ? "ACTIVE" : "INACTIVE",
      authUid,
      hasLogin: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user.userId,
      updatedBy: user.userId,
    };

    await ref.set(record);

    await writeAuditLog({
      userId: user.userId,
      action: "COLOADER_CREATE",
      module: "LOGISTICS",
      resourceType: "coloader",
      resourceId: ref.id,
      metadata: { name, code, email, hasLogin: true },
    });

    return successResponse(
      { item: toPublic(record) },
      201,
      "Co-loader created with login.",
    );
  } catch (error) {
    console.error("POST /api/logistics/coloaders:", error);
    return errorResponse(
      "COLOADER_CREATE_FAILED",
      "Failed to create co-loader.",
      500,
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }
    if (!requireManage(user)) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to update co-loaders.",
        403,
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return errorResponse("INVALID_JSON", "Invalid JSON request body.", 400);
    }

    const id = String(body.id || body.coLoaderId || "").trim();
    if (!id) {
      return errorResponse("ID_REQUIRED", "id is required for update.", 400);
    }

    const ref = collectionRef().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return errorResponse("NOT_FOUND", "Co-loader not found.", 404);
    }

    const prev = existing.data() || {};
    const now = new Date().toISOString();

    const code =
      body.code !== undefined
        ? String(body.code).trim().toUpperCase()
        : String(prev.code || "").toUpperCase();

    if (body.code !== undefined && code) {
      const clash = await collectionRef()
        .where("code", "==", code)
        .limit(5)
        .get();
      if (clash.docs.some((d) => d.id !== id)) {
        return errorResponse(
          "CODE_EXISTS",
          `Account code ${code} is already in use.`,
          409,
        );
      }
    }

    const enabled =
      body.enabled !== undefined
        ? body.enabled !== false
        : prev.enabled !== false;

    const email =
      body.email !== undefined
        ? String(body.email).trim().toLowerCase()
        : String(prev.email || "").toLowerCase();

    const password =
      body.password !== undefined ? String(body.password) : "";

    let authUid = prev.authUid ? String(prev.authUid) : undefined;

    // Optional password / login setup on update
    if (password) {
      if (password.length < 6) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Password must be at least 6 characters.",
          400,
        );
      }
      if (!email) {
        return errorResponse(
          "VALIDATION_ERROR",
          "Email is required to set or change password.",
          400,
        );
      }

      try {
        if (authUid) {
          await adminAuth.updateUser(authUid, {
            email,
            password,
            displayName:
              body.name !== undefined
                ? String(body.name).trim()
                : String(prev.name || ""),
            disabled: !enabled,
          });
        } else {
          const authUser = await adminAuth.createUser({
            email,
            password,
            displayName:
              body.name !== undefined
                ? String(body.name).trim()
                : String(prev.name || ""),
            disabled: !enabled,
          });
          authUid = authUser.uid;
        }

        await usersRef()
          .doc(authUid)
          .set(
            {
              userId: authUid,
              email,
              name:
                body.name !== undefined
                  ? String(body.name).trim()
                  : String(prev.name || ""),
              role: "CO_LOADER",
              coLoaderId: id,
              status: enabled ? "ACTIVE" : "INACTIVE",
              updatedAt: now,
              createdAt: prev.createdAt || now,
            },
            { merge: true },
          );
      } catch (err: unknown) {
        const codeErr =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "";
        if (codeErr === "auth/email-already-exists") {
          return errorResponse(
            "EMAIL_EXISTS",
            "This email is already registered to another account.",
            409,
          );
        }
        console.error("Firebase updateUser/createUser failed", err);
        return errorResponse(
          "AUTH_UPDATE_FAILED",
          "Failed to update co-loader login.",
          500,
        );
      }
    } else if (authUid) {
      // Sync email / disabled without password change
      try {
        await adminAuth.updateUser(authUid, {
          email: email || undefined,
          displayName:
            body.name !== undefined
              ? String(body.name).trim()
              : String(prev.name || ""),
          disabled: !enabled,
        });
        await usersRef()
          .doc(authUid)
          .set(
            {
              email,
              name:
                body.name !== undefined
                  ? String(body.name).trim()
                  : String(prev.name || ""),
              status: enabled ? "ACTIVE" : "INACTIVE",
              updatedAt: now,
            },
            { merge: true },
          );
      } catch (err) {
        console.error("Firebase sync update failed", err);
      }
    }

    const record: CoLoaderRecord = {
      id,
      coLoaderId: String(prev.coLoaderId || id),
      name:
        body.name !== undefined
          ? String(body.name).trim()
          : String(prev.name || ""),
      code,
      contactPerson:
        body.contactPerson !== undefined
          ? String(body.contactPerson).trim()
          : String(prev.contactPerson || ""),
      phone:
        body.phone !== undefined
          ? String(body.phone).trim()
          : String(prev.phone || ""),
      email,
      location:
        body.location !== undefined
          ? String(body.location).trim()
          : String(prev.location || ""),
      enabled,
      status: enabled ? "ACTIVE" : "INACTIVE",
      authUid,
      hasLogin: Boolean(authUid),
      createdAt: String(prev.createdAt || now),
      updatedAt: now,
      createdBy: prev.createdBy ? String(prev.createdBy) : undefined,
      updatedBy: user.userId,
    };

    if (!record.name) {
      return errorResponse("VALIDATION_ERROR", "Company name is required.", 400);
    }
    if (!record.code) {
      return errorResponse("VALIDATION_ERROR", "Account code is required.", 400);
    }

    await ref.set(record, { merge: true });

    await writeAuditLog({
      userId: user.userId,
      action: "COLOADER_UPDATE",
      module: "LOGISTICS",
      resourceType: "coloader",
      resourceId: id,
      metadata: {
        name: record.name,
        code: record.code,
        passwordChanged: Boolean(password),
      },
    });

    return successResponse(
      { item: toPublic(record) },
      200,
      "Co-loader updated.",
    );
  } catch (error) {
    console.error("PUT /api/logistics/coloaders:", error);
    return errorResponse(
      "COLOADER_UPDATE_FAILED",
      "Failed to update co-loader.",
      500,
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return errorResponse(
        "UNAUTHENTICATED",
        "Authentication is required.",
        401,
      );
    }
    if (!requireManage(user)) {
      return errorResponse(
        "FORBIDDEN",
        "You do not have permission to delete co-loaders.",
        403,
      );
    }

    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) {
      return errorResponse("ID_REQUIRED", "id query param is required.", 400);
    }

    const ref = collectionRef().doc(id);
    const existing = await ref.get();
    if (!existing.exists) {
      return errorResponse("NOT_FOUND", "Co-loader not found.", 404);
    }

    const data = existing.data() || {};
    const authUid = data.authUid ? String(data.authUid) : null;

    await ref.delete();

    if (authUid) {
      try {
        await adminAuth.deleteUser(authUid);
      } catch (err) {
        console.error("Failed to delete auth user for co-loader", authUid, err);
      }
      try {
        await usersRef().doc(authUid).delete();
      } catch {
        // ignore
      }
    }

    await writeAuditLog({
      userId: user.userId,
      action: "COLOADER_DELETE",
      module: "LOGISTICS",
      resourceType: "coloader",
      resourceId: id,
      metadata: { name: data.name, code: data.code },
    });

    return successResponse({ id }, 200, "Co-loader deleted.");
  } catch (error) {
    console.error("DELETE /api/logistics/coloaders:", error);
    return errorResponse(
      "COLOADER_DELETE_FAILED",
      "Failed to delete co-loader.",
      500,
    );
  }
}