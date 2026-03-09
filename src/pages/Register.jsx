import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./LoginRegister.css";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [accountType, setAccountType] = useState("student");

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await register({ name, email, password, accountType });
      nav("/");
    } catch (e) {
      setErr(e?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1 className="auth-title">Register</h1>

        {/* Username */}
        <div className="auth-field">
          <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2-8 4.5V21h16v-2.5C20 16 16.42 14 12 14Z"
              fill="currentColor"
            />
          </svg>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Username"
            autoComplete="username"
            required
          />
        </div>

        {/* Email */}
        <div className="auth-field">
          <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5Z"
              fill="currentColor"
            />
          </svg>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            required
          />
        </div>

        {/* Password */}
        <div className="auth-field">
          <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Zm-7-2a2 2 0 0 1 4 0v2h-4Zm7 13H7v-9h10Z"
              fill="currentColor"
            />
          </svg>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            required
            minLength={4}
          />
        </div>

        {/* Student/Mentor */}
        <div className="auth-field">
          <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm0 14L3.74 12.5 12 8l8.26 4.5L12 17Zm-6 2v-5.05L12 17l6-3.05V19H6Z"
              fill="currentColor"
            />
          </svg>

          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            aria-label="Account type"
          >
            <option value="student">Student</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>

        <button className="auth-btn" disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </button>

        {err ? <div className="auth-error">{err}</div> : null}

        <div className="auth-links" style={{ justifyContent: "center" }}>
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </form>
    </div>
  );
}