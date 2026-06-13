import { BrowserRouter as Router } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserRole, UserProfile } from './types';
import { AuthContext } from './context/AuthContext';
import { AppRoutes } from './AppRoutes';

export default function App() {
  const [role, setRole] = useState<UserRole>('TOURIST');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time profile updates
        unsubscribeProfile = onSnapshot(userRef, async (userSnap) => {
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            setProfile(data);
            setRole(data.role);
            setLoading(false);
          } else {
            // Create profile if it doesn't exist
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Anonymous',
              email: firebaseUser.email || '',
              role: 'TOURIST',
            };
            try {
              await setDoc(userRef, newProfile);
              // onSnapshot will trigger again with the new data
            } catch (error) {
              setLoading(false);
              handleFirestoreError(error, OperationType.CREATE, `users/${firebaseUser.uid}`);
            }
          }
        }, (error) => {
          setLoading(false);
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        });
      } else {
        setProfile(null);
        setRole('TOURIST');
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = async () => {
    try {
      await import('firebase/auth').then(async ({ signInWithPopup }) => {
        await signInWithPopup(auth, googleProvider);
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await import('firebase/auth').then(async ({ signOut }) => {
        await signOut(auth);
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-island-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-island-emerald border-t-transparent rounded-full animate-spin"></div>
          <p className="text-island-green font-bold uppercase tracking-widest text-xs">Loading Catarman eLaag...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      <Router>
        <div className="min-h-screen bg-island-cream font-sans text-island-volcanic selection:bg-island-emerald/20">
          <AppRoutes role={role} setRole={setRole} isMobile={isMobile} />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
