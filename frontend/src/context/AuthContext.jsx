import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axiosClient.js";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function refreshCurrentUser() {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem("smartseason_token");
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("smartseason_token");

    if (!token) {
      setAuthLoading(false);
      return;
    }

    refreshCurrentUser();
  }, []);

  async function login(credentials) {
    const response = await api.post("/auth/login", credentials);
    localStorage.setItem("smartseason_token", response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  function logout() {
    localStorage.removeItem("smartseason_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      authLoading,
      login,
      logout,
      refreshCurrentUser
    }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
