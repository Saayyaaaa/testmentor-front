import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/http";

const AuthContext = createContext(null);

function decodeJwtUsername(token) {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return json.sub || null; // backend кладёт username в subject
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tm_token") || "");
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("tm_token");
    if (!t) return null;
    const name = decodeJwtUsername(t);
    return name ? { name } : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      const name = decodeJwtUsername(token);
      setUser(name ? { name } : null);
    } else {
      localStorage.removeItem("tm_token");
      setUser(null);
    }
  }, [token]);

  async function login({ name, password }) {
    const data = await apiFetch("/api/auth/signing", {
      method: "POST",
      // apiFetch will JSON.stringify objects and set Content-Type
      body: { name, password },
    });
    setToken(data.token);
  }

  async function register({ name, email, password, accountType = "student" }) {
    const roles = accountType === "mentor" ? "ROLE_MENTOR" : "ROLE_STUDENT";

    await apiFetch("/api/auth/addNewUser", {
      method: "POST",
      body: { name, email, password, roles },
    });
  }

  function logout() {
    setToken("");
  }

  const value = useMemo(() => ({ token, user, login, register, logout }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}