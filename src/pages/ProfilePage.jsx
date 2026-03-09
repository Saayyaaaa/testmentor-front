import React from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="prof-page">
        <div className="prof-card">
          <div className="prof-title">You are not logged in</div>
          <div className="prof-sub">Please log in to view your profile.</div>
          <button className="prof-btn" onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="prof-page">
      <div className="prof-grid">
        <div className="prof-card">
          <div className="prof-head">
            <div className="prof-avatar">{user.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="prof-name">{user.name}</div>
              <div className="prof-mini">Student / Mentor (role depends on backend)</div>
            </div>
          </div>

          <div className="prof-section">
            <div className="prof-section__title">Quick actions</div>
            <div className="prof-actions">
              <button className="prof-chip" onClick={() => navigate("/generator")}>Create quiz</button>
              <button className="prof-chip" onClick={() => navigate("/learning")}>Browse quizzes</button>
              <button className="prof-chip" onClick={() => navigate("/review")}>Review panel</button>
            </div>
          </div>

          <div className="prof-section">
            <div className="prof-section__title">Account</div>
            <div className="prof-row">
              <span>Username</span>
              <b>{user.name}</b>
            </div>
            <div className="prof-row">
              <span>Status</span>
              <b>Active</b>
            </div>
          </div>

          <div className="prof-footer">
            <button className="prof-btn prof-btn--ghost" onClick={() => navigate("/")}>Back to Home</button>
            <button className="prof-btn prof-btn--danger" onClick={() => { logout(); navigate("/"); }}>Logout</button>
          </div>
        </div>

        <div className="prof-card prof-card--accent">
          <div className="prof-title">Your progress</div>
          <div className="prof-sub">Placeholder widgets (we will connect real statistics later)</div>

          <div className="prof-kpi">
            <div className="kpi">
              <div className="kpi-num">12</div>
              <div className="kpi-label">Quizzes available</div>
            </div>
            <div className="kpi">
              <div className="kpi-num">3</div>
              <div className="kpi-label">Attempts</div>
            </div>
            <div className="kpi">
              <div className="kpi-num">64%</div>
              <div className="kpi-label">Avg score</div>
            </div>
          </div>

          <div className="prof-note">
            Next step: we can load your real attempts from backend (/api/attempts) and compute scores.
          </div>
        </div>
      </div>
    </div>
  );
}
