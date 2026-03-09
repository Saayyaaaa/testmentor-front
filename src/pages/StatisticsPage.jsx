import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import "./StatisticsPage.css";

export default function StatisticsPage() {
  const { id } = useParams();
  const quizId = id;
  const { token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  async function load() {
    try {
      setLoading(true);
      const data = await apiFetch(`/api/attempts/stats?quizId=${quizId}`, { token });
      setStats(data);
    } catch (e) {
      showToast(e.message || "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [quizId]);

  const total = stats?.totalQuestions || 0;
  const correct = stats?.correctAnswers || 0;
  const wrong = total - correct;

  const correctPct = total ? Math.round((correct / total) * 100) : 0;
  const wrongPct = total ? Math.round((wrong / total) * 100) : 0;

  return (
    <div className="stats-page">
      <div className="stats-wrap">
        <div className="stats-title">Statistics</div>
        <div className="stats-sub">Quiz ID: {quizId}</div>

        {loading ? (
          <div className="stats-card">Loading...</div>
        ) : !stats ? (
          <div className="stats-card">No data</div>
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
                  <b>{correctPct}%</b>
                </div>
                <div className="stats-bar">
                  <div className="stats-bar__fill" style={{ width: `${correctPct}%` }} />
                </div>

                <div className="stats-progress__label" style={{ marginTop: 16 }}>
                  <span>Wrong</span>
                  <b>{wrongPct}%</b>
                </div>
                <div className="stats-bar">
                  <div className="stats-bar__fill" style={{ width: `${wrongPct}%` }} />
                </div>
              </div>

              <div className="stats-actions">
                <button className="stats-btn" onClick={() => navigate(-1)}>
                  Back
                </button>
                <button className="stats-btn stats-btn--primary" onClick={() => navigate(`/quiz/${quizId}`)}>
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
