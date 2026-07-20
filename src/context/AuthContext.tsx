"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
  name: string;
  email: string;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
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

  const login = (email: string) => {
    const newUser = { name: email.split("@")[0], email };
    setIsLoggedIn(true);
    setUser(newUser);
    localStorage.setItem("undanganBali_auth", JSON.stringify(newUser));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("undanganBali_auth");
  };

  if (!isInitialized) return null; // Wait for localStorage check

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
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
