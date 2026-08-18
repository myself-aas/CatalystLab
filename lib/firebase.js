import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDoc, 
  doc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});

export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: offline or awaiting connection.");
    }
  }
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const saveReport = async (url, engine, output, extraData = {}) => {
  if (!auth.currentUser) throw new Error("Must be logged in to save reports");
  try {
    const reportData = {
      url: String(url || '').substring(0, 500),
      engine: String(engine || 'master-audit').substring(0, 100),
      output: String(output || '').substring(0, 500000),
      ownerId: auth.currentUser.uid,
      ownerEmail: auth.currentUser.email || '',
      createdAt: Date.now(),
      ...(extraData.title ? { title: String(extraData.title).substring(0, 200) } : {}),
      ...(typeof extraData.score === 'number' ? { score: extraData.score } : {})
    };

    const docRef = await addDoc(collection(db, "reports"), reportData);
    return docRef.id;
  } catch (error) {
    console.error("Failed to save report to Firestore:", error);
    throw error;
  }
};

export const getReport = async (reportId) => {
  if (!reportId) throw new Error("Report ID is required");
  try {
    const docRef = doc(db, "reports", reportId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error("Report not found or has been deleted");
    }
  } catch (error) {
    console.error("Failed to fetch report:", error);
    throw error;
  }
};

export const deleteReport = async (reportId) => {
  if (!auth.currentUser) throw new Error("Authentication required");
  if (!reportId) throw new Error("Report ID required");
  try {
    const docRef = doc(db, "reports", reportId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Failed to delete report:", error);
    throw error;
  }
};

export const getUserReports = async () => {
  if (!auth.currentUser) return [];
  try {
    const q = query(
      collection(db, "reports"), 
      where("ownerId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    // Sort descending by createdAt (newest first)
    reports.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return reports;
  } catch (error) {
    console.error("Failed to fetch user reports:", error);
    throw error;
  }
};

export { onAuthStateChanged };
