import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/http";

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("tm_token") || "");
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("tm_token");
    if (!t) return null;
    const payload = parseJwt(t);
    if (!payload?.sub) return null;

    const roles =
      payload.roles ||
      payload.authorities ||
      payload.auth ||
      [];

    return {
      name: payload.sub,
      roles: Array.isArray(roles) ? roles : String(roles).split(","),
    };
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("tm_token", token);
      localStorage.setItem("token", token);

      const payload = parseJwt(token);
      const roles =
        payload?.roles ||
        payload?.authorities ||
        payload?.auth ||
        [];

      setUser(
        payload?.sub
          ? {
              name: payload.sub,
              roles: Array.isArray(roles) ? roles : String(roles).split(","),
            }
          : null
      );
    } else {
      localStorage.removeItem("tm_token");
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  async function login({ name, password }) {
    const data = await apiFetch("/api/auth/signing", {
      method: "POST",
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