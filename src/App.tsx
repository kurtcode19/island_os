import { BrowserRouter as Router } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, signInWithRedirect, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Toaster, toast } from 'sonner';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { UserRole, UserProfile } from './types';
import { AuthContext } from './context/AuthContext';
import { AppRoutes } from './AppRoutes';
import { createPass } from './lib/passService';
import { logEvent } from './lib/auditService';
import { isNativePlatform } from './lib/capacitorAuth';

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
              // Auto-create tourist pass for new users
              await createPass(
                firebaseUser.uid,
                firebaseUser.displayName || 'Anonymous',
                firebaseUser.email || ''
              );
              logEvent('registered', 'users', firebaseUser.uid, 'New user registered via Google Sign-In');
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
    console.log('Current Origin:', window.location.origin);
    
    const native = await isNativePlatform();
    if (native) {
      try {
        await signInAnonymously(auth);
        toast.success('Signed in as guest');
        return;
      } catch (anonError: any) {
        console.warn('Anonymous auth not available, trying Google redirect:', anonError.message);
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError: any) {
          toast.error(`Sign-in failed: ${redirectError.message}`);
        }
        return;
      }
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login failed:', error);
      
      if (error.code === 'auth/unauthorized-domain') {
        const confirmRedirect = window.confirm(
          `Domain "${window.location.hostname}" is not authorized in Firebase Console.\n\n` +
          `Would you like to try Sign-In via Redirect instead? (This sometimes works better for local IPs)`
        );
        if (confirmRedirect) {
          try {
            await signInWithRedirect(auth, googleProvider);
          } catch (redirectError: any) {
            toast.error(`Redirect login failed: ${redirectError.message}`);
          }
        }
      } else if (error.code === 'auth/popup-blocked') {
        toast.error('Please allow popups for this website to sign in.');
      } else {
        toast.error(`Login failed: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-island-emerald border-t-transparent rounded-full animate-spin"></div>
          <p className="text-island-green font-bold uppercase tracking-widest text-xs">Loading Catarman eSuroy...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      <Router>
        <div className="min-h-screen bg-white font-sans text-island-volcanic selection:bg-island-emerald/20">
          <AppRoutes role={role} setRole={setRole} isMobile={isMobile} />
        </div>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#0a2a1a',
              color: '#fff',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '1.5rem',
              padding: '16px 24px',
              fontSize: '14px',
              fontWeight: 600,
            },
          }}
        />
      </Router>
    </AuthContext.Provider>
  );
}
