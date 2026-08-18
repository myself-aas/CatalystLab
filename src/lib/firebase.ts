import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import type { AuditReport } from '../types';

const firebaseConfig = {
  projectId: "catalystlabhub",
  appId: "1:538496738631:web:750ab5420844d31a749862",
  apiKey: "AIzaSyCEKst9X69ewBp3pLzL-ILHRo1kezYZkIU",
  authDomain: "catalystlabhub.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-catalystlab-6318f0cc-9ec3-41ff-a38f-2d22b7086f08",
  storageBucket: "catalystlabhub.firebasestorage.app",
  messagingSenderId: "538496738631",
  measurementId: "G-SBWC2NFQ0X"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

export const loginWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const saveReport = async (
  url: string, 
  engine: string, 
  output: string, 
  extra: { title?: string; score?: number } = {}
): Promise<string> => {
  if (!auth.currentUser) throw new Error("Must be logged in to save reports");
  
  try {
    const reportData: Omit<AuditReport, 'id'> = {
      url: String(url || '').substring(0, 500),
      engine: String(engine || 'master-audit').substring(0, 100),
      output: String(output || '').substring(0, 500000),
      ownerId: auth.currentUser.uid,
      ownerEmail: auth.currentUser.email || '',
      createdAt: Date.now(),
      ...(extra.title ? { title: String(extra.title).substring(0, 200) } : {}),
      ...(typeof extra.score === 'number' ? { score: extra.score } : {})
    };

    const docRef = await addDoc(collection(db, "reports"), reportData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving report to Firestore:", error);
    throw error;
  }
};

export const getReport = async (reportId: string): Promise<AuditReport> => {
  if (!reportId) throw new Error("Report ID is required");
  try {
    const docRef = doc(db, "reports", reportId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...(docSnap.data() as Omit<AuditReport, 'id'>) };
    } else {
      throw new Error("Audit report not found or was deleted");
    }
  } catch (error) {
    console.error("Error fetching report:", error);
    throw error;
  }
};

export const deleteReport = async (reportId: string): Promise<boolean> => {
  if (!auth.currentUser) throw new Error("Authentication required");
  if (!reportId) throw new Error("Report ID is required");
  try {
    const docRef = doc(db, "reports", reportId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};

export const getUserReports = async (): Promise<AuditReport[]> => {
  if (!auth.currentUser) return [];
  try {
    const q = query(
      collection(db, "reports"), 
      where("ownerId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const reports: AuditReport[] = [];
    querySnapshot.forEach((docSnap) => {
      reports.push({ id: docSnap.id, ...(docSnap.data() as Omit<AuditReport, 'id'>) });
    });
    // Sort descending by createdAt
    reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return reports;
  } catch (error) {
    console.error("Error fetching user reports:", error);
    throw error;
  }
};

export { onAuthStateChanged };
export type { User };
