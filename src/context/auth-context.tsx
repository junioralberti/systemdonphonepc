"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: ( MOCK_USER_ROLE?: string) => void;
  logout: () => void;
  userRole: string | null; // Add userRole to context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null); // Mock role
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Mock checking for a token or session
    const mockToken = localStorage.getItem('donphone_token');
    const mockRole = localStorage.getItem('donphone_role');
    if (mockToken) {
      setIsAuthenticated(true);
      setUserRole(mockRole || 'user'); // Default to 'user' if no role
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && pathname !== '/') {
        router.push('/');
      } else if (isAuthenticated && pathname === '/') {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname, router]);


  const login = ( MOCK_USER_ROLE = 'admin') => {
    localStorage.setItem('donphone_token', 'mock_token_value'); // Mock token
    localStorage.setItem('donphone_role', MOCK_USER_ROLE);
    setIsAuthenticated(true);
    setUserRole(MOCK_USER_ROLE);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('donphone_token');
    localStorage.removeItem('donphone_role');
    setIsAuthenticated(false);
    setUserRole(null);
    router.push('/');
  };

  if (loading && pathname !== '/') {
     // Basic loading state to prevent flicker or premature redirect
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }
  
  if (!isAuthenticated && pathname !== '/') {
    // This check might be redundant if the useEffect handles it,
    // but can be a fallback or for initial render before effect runs
    return null; // Or a loading spinner, effectively blocking content
  }


  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userRole }}>
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
