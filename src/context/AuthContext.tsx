// "use client";

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode,
// } from "react";

// import {
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   signOut,
//   createUserWithEmailAndPassword,
//   updateProfile,
//   type User,
// } from "firebase/auth";

// import { firebaseAuth } from "@/lib/firebase";

// export type AuthContextValue = {
//   user: User | null;
//   loading: boolean;
//   error: string | null;

//   signIn: (
//     email: string,
//     password: string,
//   ) => Promise<User>;

//   signUp: (
//     email: string,
//     password: string,
//     displayName?: string,
//   ) => Promise<User>;

//   logout: () => Promise<void>;

//   clearError: () => void;
// };

// const AuthContext =
//   createContext<AuthContextValue | undefined>(
//     undefined,
//   );

// function getAuthError(
//   error: unknown,
// ): string {
//   if (
//     error &&
//     typeof error === "object" &&
//     "code" in error
//   ) {
//     const code = String(
//       (error as { code: unknown }).code,
//     );

//     const messages: Record<
//       string,
//       string
//     > = {
//       "auth/invalid-credential":
//         "Invalid email or password.",
//       "auth/invalid-email":
//         "Please enter a valid email address.",
//       "auth/user-disabled":
//         "This account has been disabled.",
//       "auth/user-not-found":
//         "No account was found with this email.",
//       "auth/wrong-password":
//         "Invalid email or password.",
//       "auth/email-already-in-use":
//         "An account already exists with this email.",
//       "auth/weak-password":
//         "Password is too weak.",
//       "auth/too-many-requests":
//         "Too many attempts. Please try again later.",
//     };

//     return (
//       messages[code] ??
//       "Authentication failed. Please try again."
//     );
//   }

//   return error instanceof Error
//     ? error.message
//     : "Authentication failed.";
// }

// export function AuthProvider({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   const [user, setUser] =
//     useState<User | null>(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState<string | null>(null);

//   useEffect(() => {
//     const unsubscribe =
//       onAuthStateChanged(
//         firebaseAuth,
//         (nextUser) => {
//           setUser(nextUser);
//           setLoading(false);
//         },
//       );

//     return unsubscribe;
//   }, []);

//   const value = useMemo<AuthContextValue>(
//     () => ({
//       user,
//       loading,
//       error,

//       async signIn(
//         email,
//         password,
//       ) {
//         try {
//           setError(null);

//           const credential =
//             await signInWithEmailAndPassword(
//               firebaseAuth,
//               email.trim(),
//               password,
//             );

//           return credential.user;
//         } catch (error) {
//           const message =
//             getAuthError(error);

//           setError(message);
//           throw new Error(message);
//         }
//       },

//       async signUp(
//         email,
//         password,
//         displayName,
//       ) {
//         try {
//           setError(null);

//           const credential =
//             await createUserWithEmailAndPassword(
//               firebaseAuth,
//               email.trim(),
//               password,
//             );

//           if (displayName?.trim()) {
//             await updateProfile(
//               credential.user,
//               {
//                 displayName:
//                   displayName.trim(),
//               },
//             );
//           }

//           return credential.user;
//         } catch (error) {
//           const message =
//             getAuthError(error);

//           setError(message);
//           throw new Error(message);
//         }
//       },

//       async logout() {
//         try {
//           setError(null);
//           await signOut(
//             firebaseAuth,
//           );
//         } catch (error) {
//           const message =
//             getAuthError(error);

//           setError(message);
//           throw new Error(message);
//         }
//       },

//       clearError() {
//         setError(null);
//       },
//     }),
//     [
//       user,
//       loading,
//       error,
//     ],
//   );

//   return (
//     <AuthContext.Provider
//       value={value}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context =
//     useContext(AuthContext);

//   if (!context) {
//     throw new Error(
//       "useAuth must be used inside AuthProvider.",
//     );
//   }

//   return context;
// }

// "use client";

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode,
// } from "react";

// import {
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   signOut,
//   createUserWithEmailAndPassword,
//   updateProfile,
//   type User as FirebaseUser,
// } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

// import { firebaseAuth, firestore } from "@/lib/firebase";
// import type {
//   User,
//   UserModule,
//   UserRole,
//   UserSession,
// } from "@/types/user";

// export type AuthContextValue = UserSession & {
//   firebaseUser: FirebaseUser | null;
//   error: string | null;
//   signIn: (email: string, password: string) => Promise<void>;
//   signUp: (
//     email: string,
//     password: string,
//     displayName?: string,
//   ) => Promise<void>;
//   logout: () => Promise<void>;
//   clearError: () => void;
//   refreshProfile: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextValue | undefined>(
//   undefined,
// );

// function getAuthError(error: unknown): string {
//   if (error && typeof error === "object" && "code" in error) {
//     const code = String((error as { code: unknown }).code);
//     const messages: Record<string, string> = {
//       "auth/invalid-credential": "Invalid email or password.",
//       "auth/invalid-email": "Please enter a valid email address.",
//       "auth/user-disabled": "This account has been disabled.",
//       "auth/user-not-found": "No account was found with this email.",
//       "auth/wrong-password": "Invalid email or password.",
//       "auth/email-already-in-use":
//         "An account already exists with this email.",
//       "auth/weak-password": "Password is too weak.",
//       "auth/too-many-requests":
//         "Too many attempts. Please try again later.",
//       "auth/network-request-failed":
//         "Network error. Please check your connection.",
//     };
//     return messages[code] ?? "Authentication failed. Please try again.";
//   }
//   return error instanceof Error
//     ? error.message
//     : "Authentication failed.";
// }

// function mapProfile(
//   firebaseUser: FirebaseUser,
//   data: Record<string, unknown> | undefined,
// ): User {
//   const role = (
//     typeof data?.role === "string" ? data.role : "VIEWER"
//   ) as UserRole;

//   const module = (
//     typeof data?.module === "string" ? data.module : "LOGISTICS"
//   ) as UserModule;

//   const status =
//     data?.status === "INACTIVE" ||
//     data?.status === "SUSPENDED" ||
//     data?.isActive === false
//       ? ((data?.status as User["status"]) || "INACTIVE")
//       : "ACTIVE";

//   return {
//     id: firebaseUser.uid,
//     userId: firebaseUser.uid,
//     email:
//       (typeof data?.email === "string"
//         ? data.email
//         : firebaseUser.email) || "",
//     displayName:
//       (typeof data?.displayName === "string"
//         ? data.displayName
//         : firebaseUser.displayName) || undefined,
//     phone: typeof data?.phone === "string" ? data.phone : undefined,
//     role,
//     module,
//     status,
//     photoURL:
//       (typeof data?.photoURL === "string"
//         ? data.photoURL
//         : firebaseUser.photoURL) || undefined,
//     createdAt:
//       typeof data?.createdAt === "string"
//         ? data.createdAt
//         : new Date().toISOString(),
//     updatedAt:
//       typeof data?.updatedAt === "string"
//         ? data.updatedAt
//         : new Date().toISOString(),
//     lastLoginAt:
//       typeof data?.lastLoginAt === "string"
//         ? data.lastLoginAt
//         : undefined,
//   };
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [firebaseUser, setFirebaseUser] =
//     useState<FirebaseUser | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadProfile = useCallback(
//     async (fbUser: FirebaseUser | null) => {
//       if (!fbUser) {
//         setUser(null);
//         return;
//       }
//       try {
//         const snap = await getDoc(doc(firestore, "users", fbUser.uid));
//         setUser(
//           mapProfile(
//             fbUser,
//             snap.exists()
//               ? (snap.data() as Record<string, unknown>)
//               : undefined,
//           ),
//         );
//       } catch (err) {
//         console.error("Failed to load user profile:", err);
//         setUser(mapProfile(fbUser, undefined));
//       }
//     },
//     [],
//   );

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(
//       firebaseAuth,
//       async (nextUser) => {
//         setFirebaseUser(nextUser);
//         await loadProfile(nextUser);
//         setLoading(false);
//       },
//     );
//     return unsubscribe;
//   }, [loadProfile]);

//   const value = useMemo<AuthContextValue>(
//     () => ({
//       user,
//       userId: user?.userId ?? null,
//       role: user?.role ?? null,
//       module: user?.module ?? null,
//       isAuthenticated: Boolean(firebaseUser),
//       loading,
//       firebaseUser,
//       error,

//       async signIn(email, password) {
//         try {
//           setError(null);
//           setLoading(true);

//           const credential = await signInWithEmailAndPassword(
//             firebaseAuth,
//             email.trim(),
//             password,
//           );

//           // Best-effort server session cookie
//           try {
//             const response = await fetch("/api/auth/login", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 email: email.trim(),
//                 password,
//               }),
//               credentials: "include",
//             });
//             if (!response.ok) {
//               const payload = await response.json().catch(() => null);
//               console.warn(
//                 "Server session not established:",
//                 payload?.error?.message || response.status,
//               );
//             }
//           } catch (apiError) {
//             console.warn("Session cookie creation skipped:", apiError);
//           }

//           await loadProfile(credential.user);
//         } catch (err) {
//           const message = getAuthError(err);
//           setError(message);
//           throw new Error(message);
//         } finally {
//           setLoading(false);
//         }
//       },

//       async signUp(email, password, displayName) {
//         try {
//           setError(null);
//           setLoading(true);
//           const credential = await createUserWithEmailAndPassword(
//             firebaseAuth,
//             email.trim(),
//             password,
//           );
//           if (displayName?.trim()) {
//             await updateProfile(credential.user, {
//               displayName: displayName.trim(),
//             });
//           }
//           await loadProfile(credential.user);
//         } catch (err) {
//           const message = getAuthError(err);
//           setError(message);
//           throw new Error(message);
//         } finally {
//           setLoading(false);
//         }
//       },

//       // async logout() {
//       //   try {
//       //     setError(null);
//       //     try {
//       //       await fetch("/api/auth/logout", {
//       //         method: "POST",
//       //         credentials: "include",
//       //       });
//       //     } catch {
//       //       // ignore
//       //     }
//       //     await signOut(firebaseAuth);
//       //     setUser(null);
//       //   } catch (err) {
//       //     const message = getAuthError(err);
//       //     setError(message);
//       //     throw new Error(message);
//       //   }
//       // },

//       async logout() {
//         setError(null);

//         // 1) Clear server session (ignore failures)
//         try {
//           await fetch("/api/auth/logout", {
//             method: "POST",
//             credentials: "include",
//           });
//         } catch {
//           // ignore network / admin errors
//         }

//         // 2) Clear client Firebase session (ignore IndexedDB close errors)
//         try {
//           await signOut(firebaseAuth);
//         } catch (err) {
//           const message =
//             err instanceof Error ? err.message : String(err);

//           // Common on Next.js when navigating away during logout
//           const ignorable =
//             message.includes("Database is closing") ||
//             message.includes("closing") ||
//             message.includes("indexedDB") ||
//             message.includes("IDBDatabase");

//           if (!ignorable) {
//             setError(getAuthError(err));
//             // still clear local state below
//           }
//         }

//   // 3) Always clear app state
//   setUser(null);
//   setFirebaseUser(null);
// },

//       clearError() {
//         setError(null);
//       },

//       async refreshProfile() {
//         await loadProfile(firebaseUser);
//       },
//     }),
//     [user, firebaseUser, loading, error, loadProfile],
//   );

//   return (
//     <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider.");
//   }
//   return context;
// }

// "use client";

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode,
// } from "react";
// import {
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   signOut,
//   createUserWithEmailAndPassword,
//   updateProfile,
//   type User as FirebaseUser,
// } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

// import { firebaseAuth, firestore } from "@/lib/firebase";
// import type { User, UserModule, UserRole, UserSession } from "@/types/user";

// export type AuthContextValue = UserSession & {
//   firebaseUser: FirebaseUser | null;
//   error: string | null;
//   signIn: (email: string, password: string) => Promise<void>;
//   signUp: (email: string, password: string, displayName?: string) => Promise<void>;
//   logout: () => Promise<void>;
//   clearError: () => void;
//   refreshProfile: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// function getAuthError(error: unknown): string {
//   if (error && typeof error === "object" && "code" in error) {
//     const code = String((error as { code: unknown }).code);
//     const messages: Record<string, string> = {
//       "auth/invalid-credential": "Invalid email or password.",
//       "auth/invalid-email": "Please enter a valid email address.",
//       "auth/user-disabled": "This account has been disabled.",
//       "auth/user-not-found": "No account was found with this email.",
//       "auth/wrong-password": "Invalid email or password.",
//       "auth/too-many-requests": "Too many attempts. Please try again later.",
//       "auth/network-request-failed": "Network error. Please check your connection.",
//     };
//     return messages[code] ?? "Authentication failed. Please try again.";
//   }
//   return error instanceof Error ? error.message : "Authentication failed.";
// }

// function mapProfile(
//   firebaseUser: FirebaseUser,
//   data: Record<string, unknown> | undefined,
// ): User {
//   return {
//     id: firebaseUser.uid,
//     userId: firebaseUser.uid,
//     email:
//       (typeof data?.email === "string" ? data.email : firebaseUser.email) || "",
//     displayName:
//       (typeof data?.displayName === "string"
//         ? data.displayName
//         : firebaseUser.displayName) || undefined,
//     phone: typeof data?.phone === "string" ? data.phone : undefined,
//     role: (typeof data?.role === "string" ? data.role : "VIEWER") as UserRole,
//     module: (typeof data?.module === "string"
//       ? data.module
//       : "LOGISTICS") as UserModule,
//     status:
//       data?.status === "INACTIVE" ||
//       data?.status === "SUSPENDED" ||
//       data?.isActive === false
//         ? ((data?.status as User["status"]) || "INACTIVE")
//         : "ACTIVE",
//     photoURL:
//       (typeof data?.photoURL === "string"
//         ? data.photoURL
//         : firebaseUser.photoURL) || undefined,
//     createdAt:
//       typeof data?.createdAt === "string"
//         ? data.createdAt
//         : new Date().toISOString(),
//     updatedAt:
//       typeof data?.updatedAt === "string"
//         ? data.updatedAt
//         : new Date().toISOString(),
//   };
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadProfile = useCallback(async (fbUser: FirebaseUser | null) => {
//     if (!fbUser) {
//       setUser(null);
//       return;
//     }
//     try {
//       const snap = await getDoc(doc(firestore, "users", fbUser.uid));
//       setUser(
//         mapProfile(
//           fbUser,
//           snap.exists() ? (snap.data() as Record<string, unknown>) : undefined,
//         ),
//       );
//     } catch {
//       setUser(mapProfile(fbUser, undefined));
//     }
//   }, []);

//   useEffect(() => {
//     const unsub = onAuthStateChanged(firebaseAuth, async (next) => {
//       setFirebaseUser(next);
//       await loadProfile(next);
//       setLoading(false);
//     });
//     return unsub;
//   }, [loadProfile]);

//   const value = useMemo<AuthContextValue>(
//     () => ({
//       user,
//       userId: user?.userId ?? null,
//       role: user?.role ?? null,
//       module: user?.module ?? null,
//       isAuthenticated: Boolean(firebaseUser),
//       loading,
//       firebaseUser,
//       error,

//       async signIn(email, password) {
//         try {
//           setError(null);
//           setLoading(true);
//           const credential = await signInWithEmailAndPassword(
//             firebaseAuth,
//             email.trim(),
//             password,
//           );

//           try {
//             await fetch("/api/auth/login", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ email: email.trim(), password }),
//               credentials: "include",
//             });
//           } catch {
//             // session cookie is optional if Bearer works
//           }

//           await loadProfile(credential.user);
//         } catch (err) {
//           const message = getAuthError(err);
//           setError(message);
//           throw new Error(message);
//         } finally {
//           setLoading(false);
//         }
//       },

//       async signUp(email, password, displayName) {
//         try {
//           setError(null);
//           setLoading(true);
//           const credential = await createUserWithEmailAndPassword(
//             firebaseAuth,
//             email.trim(),
//             password,
//           );
//           if (displayName?.trim()) {
//             await updateProfile(credential.user, {
//               displayName: displayName.trim(),
//             });
//           }
//           await loadProfile(credential.user);
//         } catch (err) {
//           const message = getAuthError(err);
//           setError(message);
//           throw new Error(message);
//         } finally {
//           setLoading(false);
//         }
//       },

//       async logout() {
//         setError(null);
//         try {
//           await fetch("/api/auth/logout", {
//             method: "POST",
//             credentials: "include",
//           });
//         } catch {
//           // ignore
//         }
//         try {
//           await signOut(firebaseAuth);
//         } catch (err) {
//           const message = err instanceof Error ? err.message : String(err);
//           const ignorable =
//             message.includes("Database is closing") ||
//             message.includes("indexedDB") ||
//             message.includes("IDBDatabase");
//           if (!ignorable) setError(getAuthError(err));
//         }
//         setUser(null);
//         setFirebaseUser(null);
//       },

//       clearError() {
//         setError(null);
//       },

//       async refreshProfile() {
//         await loadProfile(firebaseUser);
//       },
//     }),
//     [user, firebaseUser, loading, error, loadProfile],
//   );

//   return (
//     <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider.");
//   return ctx;
// }

// "use client";

// import {
//   createContext,
//   useCallback,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode,
// } from "react";
// import {
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   signOut,
//   createUserWithEmailAndPassword,
//   updateProfile,
//   type User as FirebaseUser,
// } from "firebase/auth";
// import { doc, getDoc } from "firebase/firestore";

// import { firebaseAuth, firestore } from "@/lib/firebase";
// import type { User, UserModule, UserRole, UserSession } from "@/types/user";

// export type AuthContextValue = UserSession & {
//   firebaseUser: FirebaseUser | null;
//   error: string | null;
//   signIn: (email: string, password: string) => Promise<void>;
//   signUp: (
//     email: string,
//     password: string,
//     displayName?: string,
//   ) => Promise<void>;
//   logout: () => Promise<void>;
//   clearError: () => void;
//   refreshProfile: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// const VALID_ROLES: readonly UserRole[] = [
//   "SUPER_ADMIN",
//   "ADMIN",
//   "LOGISTICS_MANAGER",
//   "LOGISTICS_OPERATOR",
//   "FOOD_MANAGER",
//   "FOOD_OPERATOR",
//   "ACCOUNTANT",
//   "VIEWER",
// ] as const;

// const VALID_MODULES: readonly UserModule[] = [
//   "LOGISTICS",
//   "FOOD",
//   "BOTH",
// ] as const;

// function getAuthError(error: unknown): string {
//   if (error && typeof error === "object" && "code" in error) {
//     const code = String((error as { code: unknown }).code);
//     const messages: Record<string, string> = {
//       "auth/invalid-credential": "Invalid email or password.",
//       "auth/invalid-email": "Please enter a valid email address.",
//       "auth/user-disabled": "This account has been disabled.",
//       "auth/user-not-found": "No account was found with this email.",
//       "auth/wrong-password": "Invalid email or password.",
//       "auth/too-many-requests": "Too many attempts. Please try again later.",
//       "auth/network-request-failed":
//         "Network error. Please check your connection.",
//     };
//     return messages[code] ?? "Authentication failed. Please try again.";
//   }
//   return error instanceof Error ? error.message : "Authentication failed.";
// }

// function normalizeRole(value: unknown): UserRole {
//   const raw = String(value ?? "VIEWER")
//     .trim()
//     .toUpperCase()
//     .replace(/\s+/g, "_");

//   return (VALID_ROLES as readonly string[]).includes(raw)
//     ? (raw as UserRole)
//     : "VIEWER";
// }

// function normalizeModule(value: unknown): UserModule {
//   const raw = String(value ?? "BOTH")
//     .trim()
//     .toUpperCase();

//   return (VALID_MODULES as readonly string[]).includes(raw)
//     ? (raw as UserModule)
//     : "BOTH";
// }

// function mapProfile(
//   firebaseUser: FirebaseUser,
//   data: Record<string, unknown> | undefined,
// ): User {
//   const role = normalizeRole(data?.role);
//   const module = normalizeModule(data?.module);

//   const status: User["status"] =
//     data?.status === "INACTIVE" ||
//     data?.status === "SUSPENDED" ||
//     data?.isActive === false
//       ? ((data?.status as User["status"]) || "INACTIVE")
//       : "ACTIVE";

//   return {
//     id: firebaseUser.uid,
//     userId: firebaseUser.uid,
//     email:
//       (typeof data?.email === "string" ? data.email : firebaseUser.email) ||
//       "",
//     displayName:
//       (typeof data?.displayName === "string"
//         ? data.displayName
//         : firebaseUser.displayName) || undefined,
//     phone: typeof data?.phone === "string" ? data.phone : undefined,
//     role,
//     module,
//     status,
//     photoURL:
//       (typeof data?.photoURL === "string"
//         ? data.photoURL
//         : firebaseUser.photoURL) || undefined,
//     createdAt:
//       typeof data?.createdAt === "string"
//         ? data.createdAt
//         : new Date().toISOString(),
//     updatedAt:
//       typeof data?.updatedAt === "string"
//         ? data.updatedAt
//         : new Date().toISOString(),
//   };
// }

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const loadProfile = useCallback(async (fbUser: FirebaseUser | null) => {
//     if (!fbUser) {
//       setUser(null);
//       return;
//     }

//     try {
//       const ref = doc(firestore, "users", fbUser.uid);
//       const snap = await getDoc(ref);

//       if (!snap.exists()) {
//         console.warn(
//           "[Auth] No Firestore profile at users/" +
//             fbUser.uid +
//             " — defaulting role to VIEWER. Create this document with role SUPER_ADMIN.",
//         );
//         setUser(mapProfile(fbUser, undefined));
//         return;
//       }

//       const data = snap.data() as Record<string, unknown>;
//       const profile = mapProfile(fbUser, data);

//       if (process.env.NODE_ENV === "development") {
//         console.log("[Auth] Profile loaded:", {
//           uid: fbUser.uid,
//           role: profile.role,
//           module: profile.module,
//           rawRole: data.role,
//         });
//       }

//       setUser(profile);
//     } catch (err) {
//       console.error(
//         "[Auth] Failed to read users/" +
//           fbUser.uid +
//           ". Check Firestore rules allow read for authenticated users. Defaulting to VIEWER.",
//         err,
//       );
//       setUser(mapProfile(fbUser, undefined));
//     }
//   }, []);

//   useEffect(() => {
//     const unsub = onAuthStateChanged(firebaseAuth, async (next) => {
//       setFirebaseUser(next);
//       await loadProfile(next);
//       setLoading(false);
//     });
//     return unsub;
//   }, [loadProfile]);

//   const value = useMemo<AuthContextValue>(
//     () => ({
//       user,
//       userId: user?.userId ?? null,
//       role: user?.role ?? null,
//       module: user?.module ?? null,
//       isAuthenticated: Boolean(firebaseUser),
//       loading,
//       firebaseUser,
//       error,

//       async signIn(email, password) {
//         try {
//           setError(null);
//           setLoading(true);
//           const credential = await signInWithEmailAndPassword(
//             firebaseAuth,
//             email.trim(),
//             password,
//           );

//           try {
//             await fetch("/api/auth/login", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({ email: email.trim(), password }),
//               credentials: "include",
//             });
//           } catch {
//             // optional session cookie
//           }

//           await loadProfile(credential.user);
//         } catch (err) {
//           const message = getAuthError(err);
//           setError(message);
//           throw new Error(message);
//         } finally {
//           setLoading(false);
//         }
//       },

//       async signUp(email, password, displayName) {
//         try {
//           setError(null);
//           setLoading(true);
//           const credential = await createUserWithEmailAndPassword(
//             firebaseAuth,
//             email.trim(),
//             password,
//           );
//           if (displayName?.trim()) {
//             await updateProfile(credential.user, {
//               displayName: displayName.trim(),
//             });
//           }
//           await loadProfile(credential.user);
//         } catch (err) {
//           const message = getAuthError(err);
//           setError(message);
//           throw new Error(message);
//         } finally {
//           setLoading(false);
//         }
//       },

//       async logout() {
//         setError(null);
//         try {
//           await fetch("/api/auth/logout", {
//             method: "POST",
//             credentials: "include",
//           });
//         } catch {
//           // ignore
//         }
//         try {
//           await signOut(firebaseAuth);
//         } catch (err) {
//           const message = err instanceof Error ? err.message : String(err);
//           const ignorable =
//             message.includes("Database is closing") ||
//             message.includes("indexedDB") ||
//             message.includes("IDBDatabase");
//           if (!ignorable) setError(getAuthError(err));
//         }
//         setUser(null);
//         setFirebaseUser(null);
//       },

//       clearError() {
//         setError(null);
//       },

//       async refreshProfile() {
//         await loadProfile(firebaseUser);
//       },
//     }),
//     [user, firebaseUser, loading, error, loadProfile],
//   );

//   return (
//     <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider.");
//   return ctx;
// }

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserSessionPersistence,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { firebaseAuth, firestore } from "@/lib/firebase";
import type { User, UserModule, UserRole, UserSession } from "@/types/user";

export type AuthContextValue = UserSession & {
  firebaseUser: FirebaseUser | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const VALID_ROLES: readonly UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "LOGISTICS_MANAGER",
  "LOGISTICS_OPERATOR",
  "FOOD_MANAGER",
  "FOOD_OPERATOR",
  "ACCOUNTANT",
  "VIEWER",
] as const;

const VALID_MODULES: readonly UserModule[] = [
  "LOGISTICS",
  "FOOD",
  "BOTH",
] as const;

function getAuthError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);
    const messages: Record<string, string> = {
      "auth/invalid-credential": "Invalid email or password.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account was found with this email.",
      "auth/wrong-password": "Invalid email or password.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/network-request-failed":
        "Network error. Please check your connection.",
    };
    return messages[code] ?? "Authentication failed. Please try again.";
  }
  return error instanceof Error ? error.message : "Authentication failed.";
}

function normalizeRole(value: unknown): UserRole {
  const raw = String(value ?? "VIEWER")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  return (VALID_ROLES as readonly string[]).includes(raw)
    ? (raw as UserRole)
    : "VIEWER";
}

function normalizeModule(value: unknown): UserModule {
  const raw = String(value ?? "BOTH")
    .trim()
    .toUpperCase();

  return (VALID_MODULES as readonly string[]).includes(raw)
    ? (raw as UserModule)
    : "BOTH";
}

function mapProfile(
  firebaseUser: FirebaseUser,
  data: Record<string, unknown> | undefined,
): User {
  const role = normalizeRole(data?.role);
  const module = normalizeModule(data?.module);

  const status: User["status"] =
    data?.status === "INACTIVE" ||
    data?.status === "SUSPENDED" ||
    data?.isActive === false
      ? ((data?.status as User["status"]) || "INACTIVE")
      : "ACTIVE";

  return {
    id: firebaseUser.uid,
    userId: firebaseUser.uid,
    email:
      (typeof data?.email === "string" ? data.email : firebaseUser.email) ||
      "",
    displayName:
      (typeof data?.displayName === "string"
        ? data.displayName
        : firebaseUser.displayName) || undefined,
    phone: typeof data?.phone === "string" ? data.phone : undefined,
    role,
    module,
    status,
    photoURL:
      (typeof data?.photoURL === "string"
        ? data.photoURL
        : firebaseUser.photoURL) || undefined,
    createdAt:
      typeof data?.createdAt === "string"
        ? data.createdAt
        : new Date().toISOString(),
    updatedAt:
      typeof data?.updatedAt === "string"
        ? data.updatedAt
        : new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setUser(null);
      return;
    }

    try {
      const ref = doc(firestore, "users", fbUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.warn(
          "[Auth] No Firestore profile at users/" +
            fbUser.uid +
            " — defaulting role to VIEWER. Create this document with role SUPER_ADMIN.",
        );
        setUser(mapProfile(fbUser, undefined));
        return;
      }

      const data = snap.data() as Record<string, unknown>;
      const profile = mapProfile(fbUser, data);

      if (process.env.NODE_ENV === "development") {
        console.log("[Auth] Profile loaded:", {
          uid: fbUser.uid,
          role: profile.role,
          module: profile.module,
          rawRole: data.role,
        });
      }

      setUser(profile);
    } catch (err) {
      console.error(
        "[Auth] Failed to read users/" +
          fbUser.uid +
          ". Check Firestore rules allow read for authenticated users. Defaulting to VIEWER.",
        err,
      );
      setUser(mapProfile(fbUser, undefined));
    }
  }, []);

  useEffect(() => {
    // Prefer session-only persistence for the whole app
    void setPersistence(firebaseAuth, browserSessionPersistence).catch(
      () => {
        // ignore if already set / unavailable
      },
    );

    const unsub = onAuthStateChanged(firebaseAuth, async (next) => {
      setFirebaseUser(next);
      await loadProfile(next);
      setLoading(false);
    });
    return unsub;
  }, [loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userId: user?.userId ?? null,
      role: user?.role ?? null,
      module: user?.module ?? null,
      isAuthenticated: Boolean(firebaseUser),
      loading,
      firebaseUser,
      error,

      async signIn(email, password) {
        try {
          setError(null);
          setLoading(true);

          // Session only — cleared when the browser is closed
          await setPersistence(firebaseAuth, browserSessionPersistence);

          const credential = await signInWithEmailAndPassword(
            firebaseAuth,
            email.trim(),
            password,
          );

          try {
            await fetch("/api/auth/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email.trim(), password }),
              credentials: "include",
            });
          } catch {
            // optional session cookie
          }

          await loadProfile(credential.user);
        } catch (err) {
          const message = getAuthError(err);
          setError(message);
          throw new Error(message);
        } finally {
          setLoading(false);
        }
      },

      async signUp(email, password, displayName) {
        try {
          setError(null);
          setLoading(true);

          await setPersistence(firebaseAuth, browserSessionPersistence);

          const credential = await createUserWithEmailAndPassword(
            firebaseAuth,
            email.trim(),
            password,
          );
          if (displayName?.trim()) {
            await updateProfile(credential.user, {
              displayName: displayName.trim(),
            });
          }
          await loadProfile(credential.user);
        } catch (err) {
          const message = getAuthError(err);
          setError(message);
          throw new Error(message);
        } finally {
          setLoading(false);
        }
      },

      async logout() {
        setError(null);
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // ignore
        }
        try {
          await signOut(firebaseAuth);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const ignorable =
            message.includes("Database is closing") ||
            message.includes("indexedDB") ||
            message.includes("IDBDatabase");
          if (!ignorable) setError(getAuthError(err));
        }
        setUser(null);
        setFirebaseUser(null);
      },

      clearError() {
        setError(null);
      },

      async refreshProfile() {
        await loadProfile(firebaseUser);
      },
    }),
    [user, firebaseUser, loading, error, loadProfile],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider.");
  return ctx;
}