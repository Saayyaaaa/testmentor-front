import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import "./StatisticsPage.css";

function hasAnyRole(user, roles) {
  const userRoles = Array.isArray(user?.roles) ? user.roles : [];
  return roles.some((role) => userRoles.includes(role));
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function StatisticsPage() {
  const { id } = useParams();
  const quizId = id;
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState("personal"); // personal | overview

  const isMentor = hasAnyRole(user, ["ROLE_MENTOR"]);
  const isAdmin = hasAnyRole(user, ["ROLE_ADMIN"]);
  const isStudent = !isMentor && !isAdmin;

  async function load() {
    try {
      setLoading(true);
      setStats(null);

      // STUDENT -> всегда только personal
      if (isStudent) {
        const data = await apiFetch(`/api/attempts/stats?quizId=${quizId}`, { token });
        setStats(data);
        setViewMode("personal");
        return;
      }

      // ADMIN -> всегда только overview
      if (isAdmin) {
        const data = await apiFetch(`/api/attempts/quiz/${quizId}/overview`, { token });
        setStats(data);
        setViewMode("overview");
        return;
      }

      // MENTOR:
      // сначала пробуем overview
      // если 403 -> это чужой тест, показываем personal
      if (isMentor) {
        try {
          const overview = await apiFetch(`/api/attempts/quiz/${quizId}/overview`, { token });
          setStats(overview);
          setViewMode("overview");
          return;
        } catch (e) {
          if (e?.status === 403) {
            const personal = await apiFetch(`/api/attempts/stats?quizId=${quizId}`, { token });
            setStats(personal);
            setViewMode("personal");
            return;
          }
          throw e;
        }
      }
    } catch (e) {
      setStats(null);
      showToast(e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [quizId, token, isMentor, isAdmin]);

  const studentTotals = useMemo(() => {
    const total = stats?.totalQuestions || 0;
    const correct = stats?.correctAnswers || 0;
    const wrong = Math.max(0, total - correct);
    const correctPct = total ? Math.round((correct / total) * 100) : 0;
    const wrongPct = total ? Math.round((wrong / total) * 100) : 0;
    return { total, correct, wrong, correctPct, wrongPct };
  }, [stats]);

  const overviewAttempts = Array.isArray(stats?.attempts) ? stats.attempts : [];

  return (
    <div className="stats-page">
      <div className="stats-wrap">
        <div className="stats-title">
          {viewMode === "overview" ? "Quiz Statistics" : "My Statistics"}
        </div>

        <div className="stats-sub">
          {viewMode === "overview"
            ? (stats?.quizTitle ? `${stats.quizTitle} · Quiz ID: ${quizId}` : `Quiz ID: ${quizId}`)
            : `Quiz ID: ${quizId}`}
        </div>

        {loading ? (
          <div className="stats-card">Loading...</div>
        ) : !stats ? (
          <div className="stats-card">No data</div>
        ) : viewMode === "overview" ? (
          <>
            <div className="stats-grid stats-grid--overview">
              <div className="stats-card">
                <div className="stats-row">
                  <span>Users passed the quiz</span>
                  <b>{stats.uniqueUsersCount ?? 0}</b>
                </div>
                <div className="stats-row">
                  <span>Total attempts</span>
                  <b>{stats.attemptsCount ?? 0}</b>
                </div>
                <div className="stats-row">
                  <span>Average percent</span>
                  <b>{formatPercent(stats.averagePercent)}</b>
                </div>
                <div className="stats-row">
                  <span>Best percent</span>
                  <b>{formatPercent(stats.bestPercent)}</b>
                </div>
              </div>

              <div className="stats-card">
                <div className="stats-progress">
                  <div className="stats-progress__label">
                    <span>Average result</span>
                    <b>{formatPercent(stats.averagePercent)}</b>
                  </div>
                  <div className="stats-bar">
                    <div
                      className="stats-bar__fill"
                      style={{ width: `${Math.min(Number(stats.averagePercent || 0), 100)}%` }}
                    />
                  </div>

                  <div className="stats-progress__label" style={{ marginTop: 16 }}>
                    <span>Best result</span>
                    <b>{formatPercent(stats.bestPercent)}</b>
                  </div>
                  <div className="stats-bar">
                    <div
                      className="stats-bar__fill"
                      style={{ width: `${Math.min(Number(stats.bestPercent || 0), 100)}%` }}
                    />
                  </div>
                </div>

                <div className="stats-actions">
                  <button className="stats-btn" onClick={() => navigate(-1)}>
                    Back
                  </button>
                  <button
                    className="stats-btn stats-btn--primary"
                    onClick={() => navigate(`/review/${quizId}`)}
                  >
                    Open quiz
                  </button>
                </div>
              </div>
            </div>

            <div className="stats-card stats-table-card">
              <div className="stats-table-title">Attempts details</div>

              {overviewAttempts.length === 0 ? (
                <div className="stats-empty-inline">No one has completed this quiz yet.</div>
              ) : (
                <div className="stats-table-wrap">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Score</th>
                        <th>Correct</th>
                        <th>Total</th>
                        <th>Percent</th>
                        <th>Completed at</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewAttempts.map((attempt) => (
                        <tr key={attempt.attemptId}>
                          <td>{attempt.username || "Unknown"}</td>
                          <td>{attempt.score ?? 0}</td>
                          <td>{attempt.correctAnswers ?? 0}</td>
                          <td>{attempt.totalQuestions ?? 0}</td>
                          <td>{formatPercent(attempt.percent)}</td>
                          <td>{formatDateTime(attempt.endTime)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="stats-grid">
            <div className="stats-card">
              <div className="stats-row">
                <span>Attempts</span>
                <b>{stats.attempts}</b>
              </div>
              <div className="stats-row">
                <span>Best score</span>
                <b>{stats.bestScore}</b>
              </div>
              <div className="stats-row">
                <span>Last score</span>
                <b>{stats.lastScore}</b>
              </div>
              <div className="stats-row">
                <span>Average score</span>
                <b>{Number(stats.averageScore || 0).toFixed(1)}</b>
              </div>
            </div>

            <div className="stats-card">
              <div className="stats-progress">
                <div className="stats-progress__label">
                  <span>Correct</span>
                  <b>{studentTotals.correctPct}%</b>
                </div>
                <div className="stats-bar">
                  <div className="stats-bar__fill" style={{ width: `${studentTotals.correctPct}%` }} />
                </div>

                <div className="stats-progress__label" style={{ marginTop: 16 }}>
                  <span>Wrong</span>
                  <b>{studentTotals.wrongPct}%</b>
                </div>
                <div className="stats-bar">
                  <div className="stats-bar__fill" style={{ width: `${studentTotals.wrongPct}%` }} />
                </div>
              </div>

              <div className="stats-actions">
                <button className="stats-btn" onClick={() => navigate(-1)}>
                  Back
                </button>
                <button
                  className="stats-btn stats-btn--primary"
                  onClick={() => navigate(`/quiz/${quizId}`)}
                >
                  Start again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}