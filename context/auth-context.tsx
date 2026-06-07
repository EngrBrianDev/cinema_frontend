"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  loading: boolean;
  loginWithGoogle: (googleToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (storedToken && storedUser) {
        try {
          // FE-MED-03 FIX: Check JWT expiry before restoring session
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            // Token expired — clear and force re-login
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            setLoading(false);
            return;
          }
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse stored user session:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
      }
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async (googleToken: string) => {
    try {
      // Send Google token to our NestJS auth callback
      const data = await apiFetch("/auth/google", {
        method: "POST",
        body: { token: googleToken },
      });

      const { accessToken, user: userProfile } = data;

      if (accessToken && userProfile) {
        localStorage.setItem("auth_token", accessToken);
        localStorage.setItem("auth_user", JSON.stringify(userProfile));
        setToken(accessToken);
        setUser(userProfile);
      } else {
        throw new Error("Authentication response did not contain token or profile.");
      }
    } catch (error) {
      console.error("Login with Google failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
