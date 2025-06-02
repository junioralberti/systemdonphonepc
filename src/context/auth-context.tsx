
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (role: 'admin' | 'user') => void; // Role is now mandatory and typed
  logout: () => void;
  userRole: string | null; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const mockToken = localStorage.getItem('donphone_token');
    const mockRole = localStorage.getItem('donphone_role');
    if (mockToken && mockRole) { // Ensure role also exists
      setIsAuthenticated(true);
      setUserRole(mockRole);
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


  const login = (role: 'admin' | 'user') => { // Role parameter is now used
    localStorage.setItem('donphone_token', 'mock_token_value'); 
    localStorage.setItem('donphone_role', role);
    setIsAuthenticated(true);
    setUserRole(role);
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
    return <div className="flex h-screen items-center justify-center"><p>Carregando...</p></div>;
  }
  
  if (!isAuthenticated && pathname !== '/') {
    return null; 
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
