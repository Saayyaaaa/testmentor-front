import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useToast } from "../components/Toast";
import "./ProfilePage.css";

function prettyRole(roles) {
  if (!roles) return "Unknown";
  if (roles.includes("ROLE_ADMIN")) return "Admin";
  if (roles.includes("ROLE_MENTOR")) return "Mentor";
  if (roles.includes("ROLE_STUDENT")) return "Student";
  return roles;
}

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  const [form, setForm] = useState({
    email: "",
    contact: "",
    password: "",
  });

  useEffect(() => {
    if (!user || !token) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const [profileData, statsData] = await Promise.all([
          apiFetch("/api/users/me", { token }),
          apiFetch("/api/attempts/overall", { token }),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setStats(statsData);
        setForm({
          email: profileData.email || "",
          contact: profileData.contact || "",
          password: "",
        });
      } catch (e) {
        showToast(e.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [user, token, showToast]);

  async function saveProfile() {
    try {
      setSaving(true);

      const body = {
        email: form.email,
        contact: form.contact,
        ...(form.password ? { password: form.password } : {}),
      };

      const updated = await apiFetch("/api/users/me", {
        method: "PATCH",
        token,
        body,
      });

      setProfile(updated);
      setForm((prev) => ({ ...prev, password: "" }));
      showToast("Profile updated");
    } catch (e) {
      showToast(e.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <div className="prof-page">
        <div className="prof-card">
          <div className="prof-title">You are not logged in</div>
          <div className="prof-sub">Please log in to view your profile.</div>
          <button className="prof-btn" onClick={() => navigate("/login")}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="prof-page">
        <div className="prof-card">
          <div className="prof-title">Loading profile...</div>
        </div>
      </div>
    );
  }

  const totalQuestions = Number(stats?.totalQuestions || 0);
  const totalCorrect = Number(stats?.totalCorrectAnswers || 0);
  const successPct = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="prof-page">
      <div className="prof-grid">
        <div className="prof-card">
          <div className="prof-head">
            <div className="prof-avatar">{profile?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className="prof-name">{profile?.name}</div>
              <div className="prof-mini">{prettyRole(profile?.roles)}</div>
            </div>
          </div>

          <div className="prof-section">
            <div className="prof-section__title">Quick actions</div>
            <div className="prof-actions">
              <button className="prof-chip" onClick={() => navigate("/generator")}>
                Create quiz
              </button>
              <button className="prof-chip" onClick={() => navigate("/learning")}>
                Browse quizzes
              </button>
              <button className="prof-chip" onClick={() => navigate("/review")}>
                Review panel
              </button>
            </div>
          </div>

          <div className="prof-section">
            <div className="prof-section__title">Account</div>

            <div className="prof-row">
              <span>Username</span>
              <b>{profile?.name}</b>
            </div>

            <div className="prof-row">
              <span>Role</span>
              <b>{prettyRole(profile?.roles)}</b>
            </div>

            <div className="prof-row">
              <span>Status</span>
              <b>Active</b>
            </div>
          </div>

          <div className="prof-section">
            <div className="prof-section__title">Edit profile</div>

            <div className="prof-form">
              <input
                className="prof-input"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              />

              <input
                className="prof-input"
                type="text"
                placeholder="Contact"
                value={form.contact}
                onChange={(e) => setForm((s) => ({ ...s, contact: e.target.value }))}
              />

              <input
                className="prof-input"
                type="password"
                placeholder="New password"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />

              <button
                className="prof-btn"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>

          <div className="prof-footer">
            <button className="prof-btn prof-btn--ghost" onClick={() => navigate("/")}>
              Back to Home
            </button>
            <button
              className="prof-btn prof-btn--danger"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="prof-card prof-card--accent">
          <div className="prof-title">Your overall progress</div>
          <div className="prof-sub">Real statistics from all quiz attempts</div>

          <div className="prof-kpi">
            <div className="kpi">
              <div className="kpi-num">{stats?.availableQuizzes ?? 0}</div>
              <div className="kpi-label">Quizzes available</div>
            </div>
            <div className="kpi">
              <div className="kpi-num">{stats?.attempts ?? 0}</div>
              <div className="kpi-label">Attempts</div>
            </div>
            <div className="kpi">
              <div className="kpi-num">{Number(stats?.averageScore || 0).toFixed(1)}</div>
              <div className="kpi-label">Avg score</div>
            </div>
          </div>

          <div className="prof-section">
            <div className="prof-row">
              <span>Best score</span>
              <b>{stats?.bestScore ?? 0}</b>
            </div>
            <div className="prof-row">
              <span>Last score</span>
              <b>{stats?.lastScore ?? 0}</b>
            </div>
            <div className="prof-row">
              <span>Correct answers</span>
              <b>{stats?.totalCorrectAnswers ?? 0}</b>
            </div>
            <div className="prof-row">
              <span>Total answered</span>
              <b>{stats?.totalQuestions ?? 0}</b>
            </div>
            <div className="prof-row">
              <span>Success rate</span>
              <b>{successPct}%</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}