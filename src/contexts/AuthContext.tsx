import React, { createContext, useContext, useEffect, useState } from 'react';

let authService: any = null;
try {
  authService = await import('../services/authService');
} catch (e) {
  console.warn('AuthService failed to load:', e);
  // authService will be null, fallback will activate
}

export interface AuthUser {
  uid: string;
  email?: string | null;
  role?: 'merchant' | 'customer' | 'ADMIN' | null;
  displayName?: string;
  token?: string | null;
}

interface AuthContextShape {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: 'merchant' | 'customer') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('fk_user');
      return raw ? JSON.parse(raw) as AuthUser : null;
    } catch (e) { return null; }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // keep localStorage in sync
    try {
      if (user) localStorage.setItem('fk_user', JSON.stringify(user));
      else localStorage.removeItem('fk_user');
    } catch (e) {}
  }, [user]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!authService) throw new Error('Auth service unavailable');
      const res = await authService.signIn(email, password);
      const uid = res.uid;
      const profile = await authService.fetchUserProfile(uid);
      const role = profile?.role || (res.email === process.env.ADMIN_EMAIL ? 'ADMIN' : 'customer');
      const userObj: AuthUser = { uid, email: res.email || email, role, displayName: profile?.displayName || email.split('@')[0], token: (res as any).token || null };
      setUser(userObj);
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: 'merchant' | 'customer') => {
    setIsLoading(true);
    try {
      if (!authService) throw new Error('Auth service unavailable');
      const res = await authService.signUp(email, password, role);
      const uid = res.uid;
      const userObj: AuthUser = { uid, email, role, displayName: email.split('@')[0], token: (res as any).token || null };
      setUser(userObj);
    } catch (err) {
      console.error('Signup failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (authService) await authService.signOut();
      // Clear only auth state, not app data
      setUser(null);
      try { localStorage.removeItem('fk_user'); } catch (e) {}
    } catch (err) {
      console.error('Logout failed:', err);
      // still clear user even if logout fails
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user || !authService) return;
    setIsLoading(true);
    try {
      const profile = await authService.fetchUserProfile(user.uid);
      setUser(prev => ({ ...(prev as any), role: profile?.role || prev?.role, displayName: profile?.displayName || prev?.displayName }));
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally { setIsLoading(false); }
  };

  const value: AuthContextShape = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
