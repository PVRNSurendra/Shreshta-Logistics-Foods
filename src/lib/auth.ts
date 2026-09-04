// import "server-only";

// import type { DecodedIdToken } from "firebase-admin/auth";

// import { adminAuth, adminDb } from "@/lib/firebase-admin";
// import type { PermissionUser } from "@/lib/permissions";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// export type AuthenticatedUser = {
//   userId: string;
//   email: string | null;
//   name: string | null;
//   token: DecodedIdToken;
// };

// export class AuthenticationError extends Error {
//   status = 401;

//   constructor(message = "Authentication required.") {
//     super(message);
//     this.name = "AuthenticationError";
//   }
// }

// function extractBearerToken(
//   authorization: string | null,
// ): string | null {
//   if (!authorization) {
//     return null;
//   }

//   const match = authorization.match(/^Bearer\s+(.+)$/i);
//   return match?.[1] ?? null;
// }

// export async function verifyIdToken(
//   idToken: string,
// ): Promise<AuthenticatedUser> {
//   try {
//     const token = await adminAuth.verifyIdToken(idToken);

//     return {
//       userId: token.uid,
//       email: typeof token.email === "string" ? token.email : null,
//       name: typeof token.name === "string" ? token.name : null,
//       token,
//     };
//   } catch {
//     throw new AuthenticationError(
//       "Invalid or expired authentication token.",
//     );
//   }
// }

// export async function requireAuth(
//   request: Request,
// ): Promise<AuthenticatedUser> {
//   const authorization = request.headers.get("authorization");
//   const token = extractBearerToken(authorization);

//   if (!token) {
//     throw new AuthenticationError();
//   }

//   return verifyIdToken(token);
// }

// export async function getOptionalAuth(
//   request: Request,
// ): Promise<AuthenticatedUser | null> {
//   const authorization = request.headers.get("authorization");
//   const token = extractBearerToken(authorization);

//   if (!token) {
//     return null;
//   }

//   try {
//     return await verifyIdToken(token);
//   } catch {
//     return null;
//   }
// }

// export async function createCustomToken(
//   userId: string,
// ): Promise<string> {
//   return adminAuth.createCustomToken(userId);
// }

// /** Used by API routes for role checks */
// export async function getCurrentUser(
//   request: Request,
// ): Promise<PermissionUser | null> {
//   try {
//     const authUser = await getOptionalAuth(request);

//     if (!authUser) {
//       return null;
//     }

//     const userSnap = await adminDb
//       .collection(FIRESTORE_COLLECTIONS.USERS)
//       .doc(authUser.userId)
//       .get();

//     const role =
//       (userSnap.exists &&
//         (userSnap.data()?.role as PermissionUser["role"])) ||
//       null;

//     return {
//       userId: authUser.userId,
//       role,
//     };
//   } catch {
//     return null;
//   }
// }


// import "server-only";

// import { cookies } from "next/headers";
// import type { DecodedIdToken } from "firebase-admin/auth";

// import { adminAuth, adminDb } from "@/lib/firebase-admin";
// import type { PermissionUser } from "@/lib/permissions";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// const SESSION_COOKIE_NAME = "__session";
// const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

// export type AuthenticatedUser = {
//   userId: string;
//   email: string | null;
//   name: string | null;
//   token: DecodedIdToken;
// };

// export class AuthenticationError extends Error {
//   status = 401;

//   constructor(message = "Authentication required.") {
//     super(message);
//     this.name = "AuthenticationError";
//   }
// }

// function extractBearerToken(
//   authorization: string | null,
// ): string | null {
//   if (!authorization) return null;
//   const match = authorization.match(/^Bearer\s+(.+)$/i);
//   return match?.[1] ?? null;
// }

// export async function verifyIdToken(
//   idToken: string,
// ): Promise<AuthenticatedUser> {
//   try {
//     const token = await adminAuth.verifyIdToken(idToken);
//     return {
//       userId: token.uid,
//       email: typeof token.email === "string" ? token.email : null,
//       name: typeof token.name === "string" ? token.name : null,
//       token,
//     };
//   } catch {
//     throw new AuthenticationError(
//       "Invalid or expired authentication token.",
//     );
//   }
// }

// export async function requireAuth(
//   request: Request,
// ): Promise<AuthenticatedUser> {
//   const token = extractBearerToken(
//     request.headers.get("authorization"),
//   );
//   if (!token) throw new AuthenticationError();
//   return verifyIdToken(token);
// }

// export async function getOptionalAuth(
//   request: Request,
// ): Promise<AuthenticatedUser | null> {
//   const token = extractBearerToken(
//     request.headers.get("authorization"),
//   );
//   if (!token) return null;
//   try {
//     return await verifyIdToken(token);
//   } catch {
//     return null;
//   }
// }

// export async function createCustomToken(
//   userId: string,
// ): Promise<string> {
//   return adminAuth.createCustomToken(userId);
// }

// /** Create Firebase session cookie (used by /api/auth/login) */
// export async function createSession(idToken: string): Promise<void> {
//   const sessionCookie = await adminAuth.createSessionCookie(idToken, {
//     expiresIn: SESSION_MAX_AGE_MS,
//   });

//   const cookieStore = await cookies();
//   cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: SESSION_MAX_AGE_MS / 1000,
//   });
// }

// export async function getSessionCookie(): Promise<string | undefined> {
//   const cookieStore = await cookies();
//   return cookieStore.get(SESSION_COOKIE_NAME)?.value;
// }

// export async function clearSession(): Promise<void> {
//   const cookieStore = await cookies();
//   cookieStore.set(SESSION_COOKIE_NAME, "", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: 0,
//   });
// }

// export async function verifySessionCookie(): Promise<AuthenticatedUser | null> {
//   const sessionCookie = await getSessionCookie();
//   if (!sessionCookie) return null;

//   try {
//     const token = await adminAuth.verifySessionCookie(
//       sessionCookie,
//       true,
//     );
//     return {
//       userId: token.uid,
//       email: typeof token.email === "string" ? token.email : null,
//       name: typeof token.name === "string" ? token.name : null,
//       token,
//     };
//   } catch {
//     return null;
//   }
// }

// export async function getCurrentUser(
//   request: Request,
// ): Promise<PermissionUser | null> {
//   try {
//     let authUser = await getOptionalAuth(request);
//     if (!authUser) {
//       authUser = await verifySessionCookie();
//     }
//     if (!authUser) return null;

//     const userSnap = await adminDb
//       .collection(FIRESTORE_COLLECTIONS.USERS)
//       .doc(authUser.userId)
//       .get();

//     const role =
//       (userSnap.exists &&
//         (userSnap.data()?.role as PermissionUser["role"])) ||
//       null;

//     return {
//       userId: authUser.userId,
//       role,
//     };
//   } catch {
//     return null;
//   }
// }

// import "server-only";

// import { cookies } from "next/headers";
// import type { DecodedIdToken } from "firebase-admin/auth";

// import { adminAuth, adminDb } from "@/lib/firebase-admin";
// import type { PermissionUser } from "@/lib/permissions";
// import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

// const SESSION_COOKIE_NAME = "__session";
// const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000;

// export type AuthenticatedUser = {
//   userId: string;
//   email: string | null;
//   name: string | null;
//   token: DecodedIdToken;
// };

// export class AuthenticationError extends Error {
//   status = 401;
//   constructor(message = "Authentication required.") {
//     super(message);
//     this.name = "AuthenticationError";
//   }
// }

// function extractBearerToken(authorization: string | null): string | null {
//   if (!authorization) return null;
//   const match = authorization.match(/^Bearer\s+(.+)$/i);
//   return match?.[1] ?? null;
// }

// export async function verifyIdToken(idToken: string): Promise<AuthenticatedUser> {
//   try {
//     const token = await adminAuth.verifyIdToken(idToken);
//     return {
//       userId: token.uid,
//       email: typeof token.email === "string" ? token.email : null,
//       name: typeof token.name === "string" ? token.name : null,
//       token,
//     };
//   } catch {
//     throw new AuthenticationError("Invalid or expired authentication token.");
//   }
// }

// export async function requireAuth(request: Request): Promise<AuthenticatedUser> {
//   const token = extractBearerToken(request.headers.get("authorization"));
//   if (!token) throw new AuthenticationError();
//   return verifyIdToken(token);
// }

// export async function getOptionalAuth(
//   request: Request,
// ): Promise<AuthenticatedUser | null> {
//   const token = extractBearerToken(request.headers.get("authorization"));
//   if (!token) return null;
//   try {
//     return await verifyIdToken(token);
//   } catch {
//     return null;
//   }
// }

// export async function createSession(idToken: string): Promise<void> {
//   const sessionCookie = await adminAuth.createSessionCookie(idToken, {
//     expiresIn: SESSION_MAX_AGE_MS,
//   });
//   const cookieStore = await cookies();
//   cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: SESSION_MAX_AGE_MS / 1000,
//   });
// }

// export async function getSessionCookie(): Promise<string | undefined> {
//   const cookieStore = await cookies();
//   return cookieStore.get(SESSION_COOKIE_NAME)?.value;
// }

// export async function clearSession(): Promise<void> {
//   const cookieStore = await cookies();
//   cookieStore.set(SESSION_COOKIE_NAME, "", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//     path: "/",
//     maxAge: 0,
//   });
// }

// export async function verifySessionCookie(): Promise<AuthenticatedUser | null> {
//   const sessionCookie = await getSessionCookie();
//   if (!sessionCookie) return null;
//   try {
//     const token = await adminAuth.verifySessionCookie(sessionCookie, true);
//     return {
//       userId: token.uid,
//       email: typeof token.email === "string" ? token.email : null,
//       name: typeof token.name === "string" ? token.name : null,
//       token,
//     };
//   } catch {
//     return null;
//   }
// }

// export async function getCurrentUser(
//   request: Request,
// ): Promise<PermissionUser | null> {
//   try {
//     let authUser = await getOptionalAuth(request);
//     if (!authUser) {
//       authUser = await verifySessionCookie();
//     }
//     if (!authUser) return null;

//     const userSnap = await adminDb
//       .collection(FIRESTORE_COLLECTIONS.USERS)
//       .doc(authUser.userId)
//       .get();

//     const data = userSnap.exists ? userSnap.data() : undefined;
//     const role =
//       (data?.role as PermissionUser["role"] | undefined) || null;

//     return {
//       userId: authUser.userId,
//       role,
//     };
//   } catch {
//     return null;
//   }
// }

// export async function createCustomToken(userId: string): Promise<string> {
//   return adminAuth.createCustomToken(userId);
// }

import "server-only";

import { cookies } from "next/headers";
import type { DecodedIdToken } from "firebase-admin/auth";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { PermissionUser } from "@/lib/permissions";
import { FIRESTORE_COLLECTIONS } from "@/utils/constants";

const SESSION_COOKIE_NAME = "__session";

/** Max lifetime Firebase allows for the session token itself (server-side). */
const SESSION_TOKEN_EXPIRES_MS = 60 * 60 * 12 * 1000; // 12 hours

export type AuthenticatedUser = {
  userId: string;
  email: string | null;
  name: string | null;
  token: DecodedIdToken;
};

export class AuthenticationError extends Error {
  status = 401;
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

function extractBearerToken(authorization: string | null): string | null {
  if (!authorization) return null;
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export async function verifyIdToken(
  idToken: string,
): Promise<AuthenticatedUser> {
  try {
    const token = await adminAuth.verifyIdToken(idToken);
    return {
      userId: token.uid,
      email: typeof token.email === "string" ? token.email : null,
      name: typeof token.name === "string" ? token.name : null,
      token,
    };
  } catch {
    throw new AuthenticationError("Invalid or expired authentication token.");
  }
}

export async function requireAuth(
  request: Request,
): Promise<AuthenticatedUser> {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) throw new AuthenticationError();
  return verifyIdToken(token);
}

export async function getOptionalAuth(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const token = extractBearerToken(request.headers.get("authorization"));
  if (!token) return null;
  try {
    return await verifyIdToken(token);
  } catch {
    return null;
  }
}

export async function createSession(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_TOKEN_EXPIRES_MS,
  });

  const cookieStore = await cookies();

  // No maxAge / expires → browser session cookie (dropped when browser closes)
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function verifySessionCookie(): Promise<AuthenticatedUser | null> {
  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) return null;
  try {
    const token = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      userId: token.uid,
      email: typeof token.email === "string" ? token.email : null,
      name: typeof token.name === "string" ? token.name : null,
      token,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(
  request: Request,
): Promise<PermissionUser | null> {
  try {
    let authUser = await getOptionalAuth(request);
    if (!authUser) {
      authUser = await verifySessionCookie();
    }
    if (!authUser) return null;

    const userSnap = await adminDb
      .collection(FIRESTORE_COLLECTIONS.USERS)
      .doc(authUser.userId)
      .get();

    const data = userSnap.exists ? userSnap.data() : undefined;
    const role =
      (data?.role as PermissionUser["role"] | undefined) || null;

    return {
      userId: authUser.userId,
      role,
    };
  } catch {
    return null;
  }
}

export async function createCustomToken(userId: string): Promise<string> {
  return adminAuth.createCustomToken(userId);
}