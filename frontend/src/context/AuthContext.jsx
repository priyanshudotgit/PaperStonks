import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as api from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const refreshed = await api.refreshAccessToken();
        if (!refreshed) {
          setIsLoading(false);
          return;
        }

        const data = await api.getMe();
        if (!cancelled) {
          setUser(data.user);
        }
      } catch {
        console.log("Not Authenticated");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api.login(email, password);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api.register(name, email, password);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  const updateBalance = useCallback((newBalance) => {
    setUser((prev) => prev ? { ...prev, cashBalance: newBalance } : prev);
  }, []);

  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [marketStatusLoaded, setMarketStatusLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchMarketStatus() {
      try {
        const data = await api.getMarketStatus();
        if (!cancelled) {
          setIsMarketOpen(data.isOpen);
        }
      } catch (err) {
        console.log(err);
      } finally {
        if (!cancelled) setMarketStatusLoaded(true);
      }
    }
    fetchMarketStatus();
    return () => { cancelled = true; };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateBalance,
    isMarketOpen,
    marketStatusLoaded,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
