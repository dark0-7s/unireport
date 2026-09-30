import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { Report, User } from "../types";

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with database ID from config (CRITICAL: Required by skill instructions)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

/**
 * Sign in using Google OAuth popup
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
}

/**
 * Sign in using Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    return result.user;
  } catch (error: any) {
    console.error("Email Sign-In Error:", error);
    throw error;
  }
}

/**
 * Sign up using Email, Password and Display Name
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName.trim()) {
      await updateProfile(result.user, {
        displayName: displayName.trim(),
      });
    }
    return result.user;
  } catch (error: any) {
    console.error("Email Sign-Up Error:", error);
    throw error;
  }
}

/**
 * Sign out of current session
 */
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
}

/**
 * Save user profile to Firestore
 */
export async function saveUserProfile(user: User): Promise<void> {
  try {
    const userRef = doc(db, "users", user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        organization: user.organization || "",
        avatar: user.avatar || "",
        photoURL: user.photoURL || "",
        provider: user.provider || "email",
        reportOrder: user.reportOrder || [],
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Could not save user profile to Firestore:", error);
  }
}

/**
 * Persist user custom report order in Firestore profile
 */
export async function saveUserReportOrder(userId: string, reportOrder: string[]): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        id: userId,
        reportOrder,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Could not save user report order to Firestore:", error);
  }
}

/**
 * Retrieve user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
  } catch (error) {
    console.warn("Could not fetch user profile:", error);
  }
  return null;
}

/**
 * Fetch reports for an authenticated user from Firestore
 */
export async function fetchUserReportsFromFirestore(uid: string, reportOrder?: string[]): Promise<Report[]> {
  try {
    const q = query(collection(db, "reports"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const list: Report[] = [];
    querySnapshot.forEach((d) => {
      list.push(d.data() as Report);
    });

    if (reportOrder && reportOrder.length > 0) {
      const orderMap = new Map(reportOrder.map((id, index) => [id, index]));
      list.sort((a, b) => {
        const orderA = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
        const orderB = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    }

    return list;
  } catch (error) {
    console.warn("Could not fetch user reports from Firestore:", error);
    return [];
  }
}

/**
 * Save or update a single report in Firestore
 */
export async function saveReportToFirestore(report: Report): Promise<void> {
  try {
    const reportRef = doc(db, "reports", report.id);
    await setDoc(reportRef, report, { merge: true });
  } catch (error) {
    console.warn("Could not save report to Firestore:", error);
    throw error;
  }
}

/**
 * Delete a report from Firestore
 */
export async function deleteReportFromFirestore(reportId: string): Promise<void> {
  try {
    const reportRef = doc(db, "reports", reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.warn("Could not delete report from Firestore:", error);
    throw error;
  }
}

/**
 * Subscribe to authentication state changes
 */
export function subscribeToAuth(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Validate connection to Firestore on boot
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration or connectivity.");
    }
    return false;
  }
}

// Structured error handling as required by Firebase skill
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
