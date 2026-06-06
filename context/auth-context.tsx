"use client";

import { createContext, useContext } from "react";

type User = {
  name: string;
  email?: string;
  role?: string;
};

type AuthContextType = {
  user: User | null;
  logout: () => void;
  loginWithGoogle: (credential: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => {},
  loginWithGoogle: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: null,
        logout: () => {},
        loginWithGoogle: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}