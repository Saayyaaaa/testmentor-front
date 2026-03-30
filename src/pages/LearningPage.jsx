import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/http";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../components/Toast";
import "./LearningPage.css";

export default function LearningPage() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim().toLowerCase();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!user || !token) {
        showToast("Please log in or register");
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const data = await apiFetch("/api/quizzes", { token });
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        showToast(e.message || "Failed to load quizzes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [user, token, navigate, showToast]);

  const filtered = useMemo(() => {
    if (!q) return items;
    return items.filter((x) => (x.title || x.Title || "").toLowerCase().includes(q));
  }, [items, q]);

  return (
    <div className="learn-page">
      <div className="learn-top">
        <div className="learn-title">Available tests</div>
        {q && <div className="learn-sub">Search: “{q}”</div>}
      </div>

      <div className="learn-wrap">
        {loading ? (
          <div className="learn-empty">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="learn-empty">No tests found.</div>
        ) : (
          filtered.map((quiz) => {
            const title = quiz.title || quiz.Title || "Untitled";
            const count = quiz.questions?.length ?? quiz.questionCount ?? "—";
            const id = quiz.quizID || quiz.QuizID || quiz.id;
            return (
              <div className="learn-card" key={id || title}>
                <div>
                  <div className="learn-card__title">{title}</div>
                  <div className="learn-card__meta">{count} questions</div>
                </div>

                <div className="learn-actions">
                  <button
                    className="learn-btn learn-btn--ghost"
                    onClick={() => navigate(`/quiz/${id}`)}
                  >
                    Start
                  </button>

                  <button
                    className="learn-btn learn-btn--danger"
                    onClick={() => navigate(`/statistics/${id}?mode=personal`)}
                  >
                    statistics
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
