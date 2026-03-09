import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./LoginRegister.css";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login({ name, password });
      nav("/");
    } catch (e) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1 className="auth-title">Login</h1>

        <div className="auth-field">
          <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2-8 4.5V21h16v-2.5C20 16 16.42 14 12 14Z" fill="currentColor"/>
          </svg>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Username" />
        </div>

        <div className="auth-field">
          <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4Zm7 13H7v-9h10Z" fill="currentColor"/>
          </svg>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        </div>

        <button className="auth-btn" disabled={loading}>
          {loading ? "Loading..." : "Get started"}
        </button>

        {err ? <div className="auth-error">{err}</div> : null}

        <div className="auth-links">
          <Link to="/register">Create account</Link>
          <span>Forgot password?</span>
        </div>
      </form>
    </div>
  );
}