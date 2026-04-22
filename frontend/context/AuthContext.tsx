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
  verifyEmail as authVerifyEmail,
  resendOTP as authResendOTP,
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
  }) => Promise<{ message: string; email: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendOTP: (email: string) => Promise<{ message: string; email: string }>;
  logout: () => void;
  updateUser: (partial: Partial<AuthUser>) => void;
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
      return await authRegister(data);
    },
    []
  );

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const tokens = await authVerifyEmail(email, code);
    saveTokens(tokens);
    setUser(tokens.user);
  }, []);

  const resendOTP = useCallback(async (email: string) => {
    return await authResendOTP(email);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("auth_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, verifyEmail, resendOTP, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
