// import "server-only";

// import {
//   cert,
//   getApps,
//   initializeApp,
//   type App,
// } from "firebase-admin/app";

// import {
//   getAuth,
//   type Auth,
// } from "firebase-admin/auth";

// import {
//   getFirestore,
//   type Firestore,
// } from "firebase-admin/firestore";

// function requiredEnv(
//   name: string,
// ): string {
//   const value =
//     process.env[name];

//   if (!value) {
//     throw new Error(
//       `Missing server environment variable: ${name}`,
//     );
//   }

//   return value;
// }

// function getAdminApp(): App {
//   const existing =
//     getApps();

//   if (existing.length > 0) {
//     return existing[0]!;
//   }

//   const projectId =
//     requiredEnv(
//       "FIREBASE_PROJECT_ID",
//     );

//   const clientEmail =
//     requiredEnv(
//       "FIREBASE_CLIENT_EMAIL",
//     );

//   const privateKey =
//     requiredEnv(
//       "FIREBASE_PRIVATE_KEY",
//     ).replace(
//       /\\n/g,
//       "\n",
//     );

//   return initializeApp({
//     credential: cert({
//       projectId,
//       clientEmail,
//       privateKey,
//     }),
//   });
// }

// export const firebaseAdminApp =
//   getAdminApp();

// export const adminAuth: Auth =
//   getAuth(
//     firebaseAdminApp,
//   );

// export const adminDb: Firestore =
//   getFirestore(
//     firebaseAdminApp,
//   );

// import "server-only";

// import {
//   cert,
//   getApps,
//   initializeApp,
//   type App,
// } from "firebase-admin/app";

// import { getAuth, type Auth } from "firebase-admin/auth";
// import { getFirestore, type Firestore } from "firebase-admin/firestore";

// function requiredEnv(name: string): string {
//   const value = process.env[name];
//   if (!value) {
//     throw new Error(`Missing server environment variable: ${name}`);
//   }
//   return value;
// }

// function normalizePrivateKey(raw: string): string {
//   let key = raw.trim();

//   // Remove wrapping quotes if present
//   if (
//     (key.startsWith('"') && key.endsWith('"')) ||
//     (key.startsWith("'") && key.endsWith("'"))
//   ) {
//     key = key.slice(1, -1);
//   }

//   // Turn escaped newlines into real newlines
//   key = key.replace(/\\n/g, "\n");

//   return key.trim();
// }

// function getAdminApp(): App {
//   const existing = getApps();
//   if (existing.length > 0) {
//     return existing[0]!;
//   }

//   const projectId = requiredEnv("FIREBASE_PROJECT_ID").trim();
//   const clientEmail = requiredEnv("FIREBASE_CLIENT_EMAIL").trim();
//   const privateKey = normalizePrivateKey(
//     requiredEnv("FIREBASE_PRIVATE_KEY"),
//   );

//   return initializeApp({
//     credential: cert({
//       projectId,
//       clientEmail,
//       privateKey,
//     }),
//   });
// }

// export const firebaseAdminApp = getAdminApp();
// export const adminAuth: Auth = getAuth(firebaseAdminApp);
// export const adminDb: Firestore = getFirestore(firebaseAdminApp);

// import "server-only";

// import { readFileSync } from "fs";
// import { resolve } from "path";

// import {
//   cert,
//   getApps,
//   initializeApp,
//   type App,
//   type ServiceAccount,
// } from "firebase-admin/app";

// import { getAuth, type Auth } from "firebase-admin/auth";
// import { getFirestore, type Firestore } from "firebase-admin/firestore";

// function loadServiceAccount(): ServiceAccount {
//   // Option A: path to JSON file (recommended on Windows)
//   const filePath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH;

//   if (filePath) {
//     const absolute = resolve(process.cwd(), filePath);
//     const raw = readFileSync(absolute, "utf8");
//     const json = JSON.parse(raw) as {
//       project_id: string;
//       client_email: string;
//       private_key: string;
//     };

//     return {
//       projectId: json.project_id,
//       clientEmail: json.client_email,
//       privateKey: json.private_key,
//     };
//   }

//   // Option B: env vars (fallback)
//   const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
//   const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
//   let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

//   if (!projectId || !clientEmail || !privateKey) {
//     throw new Error(
//       "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_CREDENTIALS_PATH or FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.",
//     );
//   }

//   if (
//     (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
//     (privateKey.startsWith("'") && privateKey.endsWith("'"))
//   ) {
//     privateKey = privateKey.slice(1, -1);
//   }
//   privateKey = privateKey.replace(/\\n/g, "\n");

//   return {
//     projectId,
//     clientEmail,
//     privateKey,
//   };
// }

// function getAdminApp(): App {
//   const existing = getApps();
//   if (existing.length > 0) {
//     return existing[0]!;
//   }

//   return initializeApp({
//     credential: cert(loadServiceAccount()),
//   });
// }

// export const firebaseAdminApp = getAdminApp();
// export const adminAuth: Auth = getAuth(firebaseAdminApp);
// export const adminDb: Firestore = getFirestore(firebaseAdminApp);

// import "server-only";

// import { readFileSync } from "fs";
// import { resolve } from "path";

// import {
//   cert,
//   getApps,
//   initializeApp,
//   type App,
//   type ServiceAccount,
// } from "firebase-admin/app";
// import { getAuth, type Auth } from "firebase-admin/auth";
// import { getFirestore, type Firestore } from "firebase-admin/firestore";

// function loadServiceAccount(): ServiceAccount {
//   const filePath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH;

//   if (filePath) {
//     const absolute = resolve(process.cwd(), filePath);
//     const raw = readFileSync(absolute, "utf8");
//     const json = JSON.parse(raw) as {
//       project_id: string;
//       client_email: string;
//       private_key: string;
//     };

//     return {
//       projectId: json.project_id,
//       clientEmail: json.client_email,
//       privateKey: json.private_key,
//     };
//   }

//   const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
//   const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
//   let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

//   if (!projectId || !clientEmail || !privateKey) {
//     throw new Error(
//       "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_CREDENTIALS_PATH or FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.",
//     );
//   }

//   if (
//     (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
//     (privateKey.startsWith("'") && privateKey.endsWith("'"))
//   ) {
//     privateKey = privateKey.slice(1, -1);
//   }

//   privateKey = privateKey.replace(/\\n/g, "\n");

//   return {
//     projectId,
//     clientEmail,
//     privateKey,
//   };
// }

// function getAdminApp(): App {
//   const existing = getApps();
//   if (existing.length > 0) return existing[0]!;

//   return initializeApp({
//     credential: cert(loadServiceAccount()),
//   });
// }



// export const firebaseAdminApp = getAdminApp();
// export const adminAuth: Auth = getAuth(firebaseAdminApp);
// export const adminDb: Firestore = getFirestore(firebaseAdminApp);






import "server-only";

import { readFileSync } from "fs";
import { resolve } from "path";

import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";

import { getAuth, type Auth } from "firebase-admin/auth";

import {
  getFirestore,
  type Firestore,
} from "firebase-admin/firestore";

import {
  getStorage,
  type Storage,
} from "firebase-admin/storage";

function loadServiceAccount(): ServiceAccount {
  const filePath = process.env.FIREBASE_ADMIN_CREDENTIALS_PATH;

  if (filePath) {
    const absolute = resolve(process.cwd(), filePath);
    const raw = readFileSync(absolute, "utf8");

    const json = JSON.parse(raw) as {
      project_id: string;
      client_email: string;
      private_key: string;
    };

    return {
      projectId: json.project_id,
      clientEmail: json.client_email,
      privateKey: json.private_key,
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();

  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_CREDENTIALS_PATH or FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.",
    );
  }

  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }

  privateKey = privateKey.replace(/\\n/g, "\n");

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function getAdminApp(): App {
  const existing = getApps();

  if (existing.length > 0) {
    return existing[0]!;
  }

  return initializeApp({
    credential: cert(loadServiceAccount()),
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export const firebaseAdminApp = getAdminApp();

export const adminAuth: Auth = getAuth(firebaseAdminApp);

export const adminDb: Firestore = getFirestore(firebaseAdminApp);

export const adminStorage: Storage = getStorage(firebaseAdminApp);