"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  name: string;
  email: string;
  sessionToken?: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isInitialized: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check localStorage on load
    const storedAuth = localStorage.getItem("undanganBali_auth");
    if (storedAuth) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedAuth));
    }
    setIsInitialized(true);
  }, []);

  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("undanganBali_auth", JSON.stringify(userData));
  };

  const logout = async () => {
    if (user?.sessionToken) {
      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken: user.sessionToken }),
        });
      } catch (err) {
        console.error("Failed to delete session", err);
      }
    }
    
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("undanganBali_auth");
  };

  // Removed if (!isInitialized) return null; to fix hydration mismatch

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
