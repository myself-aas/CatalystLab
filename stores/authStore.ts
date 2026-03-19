import { create } from 'zustand';
import { auth, db } from '@/lib/firebase';
import { User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthState {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  fetchProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setProfile: (profile) => set({ profile }),
  fetchProfile: async (userId) => {
    if (!userId) {
      console.warn('fetchProfile called with undefined userId');
      return;
    }
    console.log('Fetching profile for userId:', userId);
    // Add a small delay to ensure auth state is propagated
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('Profile found:', docSnap.data());
        set({ profile: docSnap.data() });
      } else {
        console.warn('Profile not found for user:', userId);
        set({ profile: null });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // @ts-ignore
      console.error('Error code:', error.code);
      // @ts-ignore
      console.error('Error message:', error.message);
    }
  },
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, profile: null });
  },
}));
