import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/http";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";
import "./ReviewPage.css";

export default function ReviewPage() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [detailsById, setDetailsById] = useState({});
  const [commentById, setCommentById] = useState({});

  async function load() {
    if (!user || !token) {
      showToast("Please log in or register");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch("/api/mentor/review", { token });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e.message || "Failed to load review list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function vote(id, voteType) {
    try {
      await apiFetch(`/api/mentor/review/${id}/vote`, {
        method: "POST",
        token,
        body: { voteType, comment: commentById[id] || "" },
      });

      showToast(voteType === "APPROVE" ? "Approved" : "Rejected");
      await load();
    } catch (e) {
      showToast(e.message || "Vote failed");
    }
  }

  async function toggleDetails(id) {
    setExpandedId((prev) => (String(prev) === String(id) ? null : id));

    if (!detailsById[id]) {
      try {
        const data = await apiFetch(`/api/quizzes/${id}`, { token });
        setDetailsById((prev) => ({ ...prev, [id]: data }));
      } catch (e) {
        showToast(e.message || "Failed to load quiz details");
      }
    }
  }

  function getStatusClass(status) {
    const s = String(status || "").toUpperCase();
    if (s === "APPROVED") return "approved";
    if (s === "REJECTED") return "rejected";
    return "pending";
  }

  return (
    <div className="review-page">
      <div className="review-wrap">
        <div className="review-head">
          <div className="review-title">Review Panel</div>
          <div className="review-subtitle">
            All tests are shown here. Voting is available only for pending tests.
          </div>
        </div>

        {loading ? (
          <div className="review-empty">Loading...</div>
        ) : items.length === 0 ? (
          <div className="review-empty">No quizzes to review right now.</div>
        ) : (
          <div className="review-list">
            {items.map((quiz) => {
              const title = quiz.title || quiz.Title || "Untitled";
              const id = quiz.quizId || quiz.quizID || quiz.QuizID || quiz.id;
              const desc = quiz.description || quiz.Description || "";
              const myVote = quiz.myVote || quiz.MyVote || null;
              const voted = !!myVote;
              const status = quiz.status || quiz.Status || "PENDING";
              const approvals = quiz.approvalsCount ?? quiz.ApprovalsCount ?? 0;
              const rejects = quiz.rejectsCount ?? quiz.RejectsCount ?? 0;
              const canVote = String(status) === "PENDING" && !voted;
              const isExpanded = String(expandedId) === String(id);
              const details = detailsById[id];
              const statusClass = getStatusClass(status);

              return (
                <div
                  className="review-card review-card--clickable"
                  key={id || title}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleDetails(id)}
                  onKeyDown={(e) => e.key === "Enter" && toggleDetails(id)}
                >
                  <div className="review-card__top">
                    <div className="review-card__main">
                      <div className="review-card__title">{title}</div>
                      {desc && <div className="review-card__desc">{desc}</div>}

                      <div className="review-meta">
                        <span>Approvals: {approvals}</span>
                        <span>Rejects: {rejects}</span>
                      </div>
                    </div>

                    <div className={`review-badge ${statusClass}`}>
                      {status}
                    </div>
                  </div>

                  <div className="review-myvote" onClick={(e) => e.stopPropagation()}>
                    Your vote: {myVote ? (myVote === "APPROVE" ? "Approve" : "Reject") : "Not voted"}
                  </div>

                  <div className="review-actions" onClick={(e) => e.stopPropagation()}>
                    {String(status) === "PENDING" && (
                      <textarea
                        className="review-comment"
                        placeholder="Comment (optional)"
                        value={commentById[id] || ""}
                        onChange={(e) =>
                          setCommentById((prev) => ({ ...prev, [id]: e.target.value }))
                        }
                        disabled={voted}
                        rows={2}
                      />
                    )}

                    <button
                      className="review-btn approve"
                      onClick={() => vote(id, "APPROVE")}
                      disabled={!canVote}
                      title={!canVote ? "Vote is not available" : "Approve"}
                    >
                      Approve
                    </button>

                    <button
                      className="review-btn reject"
                      onClick={() => vote(id, "REJECT")}
                      disabled={!canVote}
                      title={!canVote ? "Vote is not available" : "Reject"}
                    >
                      Reject
                    </button>

                    <button
                      className="review-btn open"
                      onClick={() => navigate(`/quiz/${id}`)}
                      title="Open quiz"
                    >
                      Open
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="review-details" onClick={(e) => e.stopPropagation()}>
                      {!details ? (
                        <div className="review-details__loading">Loading details...</div>
                      ) : (details.questions || []).length === 0 ? (
                        <div className="review-details__loading">No questions.</div>
                      ) : (
                        <div className="review-details__list">
                          {(details.questions || []).map((q, idx) => (
                            <div className="review-q" key={q.questionId || q.questionID || idx}>
                              <div className="review-q__title">
                                {idx + 1}. {q.questionText}
                              </div>

                              {q.aiAnswer && (
                                <div className="review-q__ai">
                                  <strong>AI answer:</strong> {q.aiAnswer}
                                </div>
                              )}

                              <ul className="review-q__opts">
                                {(q.options || []).map((op, i) => (
                                  <li key={op.optionId || op.optionID || i}>
                                    {op.optionText}
                                    {op.correct ? <b> (correct)</b> : null}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}