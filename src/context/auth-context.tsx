
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut, type User as FirebaseUserType } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserById } from '@/services/userService';

interface AuthContextType {
  isAuthenticated: boolean;
  firebaseUser: FirebaseUserType | null; // Store the firebase user object
  login: (role: 'admin' | 'user') => void; 
  logout: () => void;
  userRole: string | null; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUserType | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        // Fetch role from Firestore
        const userDataFromFirestore = await getUserById(user.uid);
        if (userDataFromFirestore && userDataFromFirestore.role) {
          setUserRole(userDataFromFirestore.role);
          // Set localStorage for persistence across hard reloads/tab close if desired,
          // though onAuthStateChanged handles session persistence for Firebase itself.
          localStorage.setItem('donphone_role', userDataFromFirestore.role);
          localStorage.setItem('donphone_token', 'firebase_authenticated'); // Indicate Firebase auth
        } else {
          // User exists in Auth but not in Firestore or no role - critical issue
          console.error("User in Auth but no role in Firestore. Logging out.");
          await signOut(auth); // This will trigger onAuthStateChanged again with user = null
          // No need to set role to null here, onAuthStateChanged will handle it
        }
      } else {
        setFirebaseUser(null);
        setUserRole(null);
        localStorage.removeItem('donphone_token');
        localStorage.removeItem('donphone_role');
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const isAuthenticated = !!firebaseUser;

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && pathname !== '/') {
        router.push('/');
      } else if (isAuthenticated && pathname === '/') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname, router]);


  // This login function is now primarily for setting local state AFTER Firebase auth is successful
  const login = (role: 'admin' | 'user') => {
    // Firebase's onAuthStateChanged should have already set firebaseUser
    // This function will be called from page.tsx AFTER successful Firebase signIn
    setUserRole(role);
    localStorage.setItem('donphone_role', role);
    localStorage.setItem('donphone_token', 'firebase_authenticated');
    // Navigation to dashboard will happen from page.tsx or the effect above
  };

  const logout = async () => {
    await signOut(auth); // This will trigger onAuthStateChanged
    // State (firebaseUser, userRole) and localStorage will be cleared by onAuthStateChanged
    router.push('/'); // Navigate to login after Firebase sign out completes
  };
  
  // Render children only after initial auth check is complete and redirects are handled
  // Or if on login page itself (pathname === '/')
  if (loading && pathname !== '/') {
     return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /> <p className="ml-2">Carregando autenticação...</p></div>;
  }
  
  // If not authenticated and not on login page, don't render children yet (redirect should occur)
  // This prevents a flash of app content before redirect if user directly navigates to a protected route
  if (!isAuthenticated && pathname !== '/') {
    return null; 
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, firebaseUser, login, logout, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
