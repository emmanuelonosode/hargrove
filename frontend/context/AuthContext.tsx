"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  AuthUser,
  AuthTokens,
  saveTokens,
  clearTokens,
  getStoredUser,
  login as authLogin,
  register as authRegister,
} from "@/lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authLogin(email, password);
    saveTokens(tokens);
    setUser(tokens.user);
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => {
      const tokens: AuthTokens = await authRegister(data);
      saveTokens(tokens);
      setUser(tokens.user);
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
