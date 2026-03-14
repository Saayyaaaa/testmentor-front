import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "./Toast";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  function onSearchSubmit(e) {
    e.preventDefault();
    const q = search.trim();
    if (!q) return navigate("/learning");
    navigate(`/learning?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="tm-nav">
      <div className="tm-nav__inner">
        {/* Left */}
        <Link to="/" className="tm-brand">
          <span className="tm-brand__dot" />
          <span className="tm-brand__text">TestMentor</span>
        </Link>

        {/* Middle */}
        {!isAuthPage ? (
        <form className="tm-search" onSubmit={onSearchSubmit}>
            <svg className="tm-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Zm0-2a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm8.78 4.19-4.2-4.2 1.41-1.41 4.2 4.2-1.41 1.41Z"
                fill="currentColor"
            />
            </svg>
            <input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
        </form>
        ) : (
        <div className="tm-search tm-search--placeholder" />
        )}

        {/* Right */}
        <div className="tm-right">
          <nav className="tm-links">
            <Link to="/generator">Test Generator</Link>
            <Link to="/review">Review Panel</Link>
            <Link to="/learning">My Learning</Link>
            {isAdmin && <Link to="/admin/users">Users</Link>}
          </nav>

          {!user ? (
            <>
              <Link className="tm-btn tm-btn--ghost" to="/login">
                Log in
              </Link>
              <Link className="tm-btn tm-btn--primary" to="/register">
                Register
              </Link>
            </>
          ) : (
            <div className="tm-user">
              <button
                type="button"
                className="tm-user__btn"
                onClick={() => navigate("/profile")}
                title="Open profile"
              >
                <div className="tm-avatar" title={user.name}>
                {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="tm-user__name">{user.name}</span>
              </button>
              <button
                className="tm-btn tm-btn--ghost"
                onClick={() => {
                  logout();
                  showToast("Logged out");
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}