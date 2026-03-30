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
  const [commentById, setCommentById] = useState({});
  const [scope, setScope] = useState("all");

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });

  async function load(activeScope = scope) {
    if (!user || !token) {
      showToast("Please log in or register");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch(`/api/mentor/review?scope=${activeScope}`, { token });
      const normalized = Array.isArray(data) ? data : [];
      setItems(normalized);
      setCommentById((prev) => {
        const next = { ...prev };
        normalized.forEach((item) => {
          const id = item.quizId || item.quizID || item.id;
          next[id] = prev[id] ?? item.myComment ?? "";
        });
        return next;
      });
    } catch (e) {
      showToast(e.message || "Failed to load review list");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(scope);
  }, [scope]);

  async function vote(id, voteType) {
    try {
      await apiFetch(`/api/mentor/review/${id}/vote`, {
        method: "POST",
        token,
        body: { voteType, comment: commentById[id] || "" },
      });

      showToast(voteType === "APPROVE" ? "Vote saved: approve" : "Vote saved: reject");
      await load(scope);
    } catch (e) {
      showToast(e.message || "Vote failed");
    }
  }

  async function deleteQuiz(id) {
    if (!window.confirm("Delete this quiz?")) return;

    try {
      await apiFetch(`/api/mentor/review/${id}`, {
        method: "DELETE",
        token,
      });
      showToast("Quiz deleted");
      await load(scope);
    } catch (e) {
      showToast(e.message || "Delete failed");
    }
  }

  function startEdit(quiz) {
    const id = quiz.quizId || quiz.quizID || quiz.id;
    const title = quiz.title || "";
    const description = quiz.description || "";

    setEditingId(id);
    setEditForm({ title, description });
  }

  async function saveEdit(id) {
    try {
      await apiFetch(`/api/mentor/review/${id}`, {
        method: "PATCH",
        token,
        body: {
          title: editForm.title,
          description: editForm.description,
        },
      });

      showToast("Quiz updated");
      setEditingId(null);
      await load(scope);
    } catch (e) {
      showToast(e.message || "Update failed");
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
            Mentors can vote anytime. Open a quiz on a separate page to review questions and comments.
          </div>

          <div className="review-switch">
            <button
              className={`review-switch__btn ${scope === "all" ? "active" : ""}`}
              onClick={() => setScope("all")}
            >
              All quizzes
            </button>
            <button
              className={`review-switch__btn ${scope === "mine" ? "active" : ""}`}
              onClick={() => setScope("mine")}
            >
              My quizzes
            </button>
          </div>
        </div>

        {loading ? (
          <div className="review-empty">Loading...</div>
        ) : items.length === 0 ? (
          <div className="review-empty">
            {scope === "mine" ? "You have no quizzes yet." : "No quizzes to review right now."}
          </div>
        ) : (
          <div className="review-list">
            {items.map((quiz) => {
              const title = quiz.title || "Untitled";
              const id = quiz.quizId || quiz.quizID || quiz.id;
              const desc = quiz.description || "";
              const myVote = quiz.myVote || null;
              const status = quiz.status || "PENDING";
              const approvals = quiz.approvalsCount ?? 0;
              const rejects = quiz.rejectsCount ?? 0;
              const statusClass = getStatusClass(status);
              const canEdit = !!quiz.canEdit;
              const canDelete = !!quiz.canDelete;
              const authorName = quiz.authorName || "Unknown";
              const isEditing = String(editingId) === String(id);
              const commentValue = commentById[id] ?? quiz.myComment ?? "";

              return (
                <div className="review-card" key={id || title}>
                  <div className="review-card__top">
                    <div className="review-card__main">
                      {isEditing ? (
                        <>
                          <input
                            className="review-edit-input"
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="Quiz title"
                          />
                          <textarea
                            className="review-edit-textarea"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, description: e.target.value }))
                            }
                            placeholder="Quiz description"
                            rows={3}
                          />
                        </>
                      ) : (
                        <>
                          <div className="review-card__title">{title}</div>
                          {desc && <div className="review-card__desc">{desc}</div>}
                        </>
                      )}

                      <div className="review-meta">
                        <span>Author: {authorName}</span>
                        <span>Approvals: {approvals}</span>
                        <span>Rejects: {rejects}</span>
                      </div>
                    </div>

                    <div className={`review-badge ${statusClass}`}>{status}</div>
                  </div>

                  <div className="review-myvote">
                    Your vote: {myVote ? (myVote === "APPROVE" ? "Approve" : "Reject") : "Not voted"}
                  </div>

                  {scope === "all" && (
                    <textarea
                      className="review-comment"
                      placeholder="Add or update your comment"
                      value={commentValue}
                      onChange={(e) =>
                        setCommentById((prev) => ({ ...prev, [id]: e.target.value }))
                      }
                      rows={2}
                    />
                  )}

                  <div className="review-actions">
                    {scope === "all" && (
                      <>
                        <button
                          type="button"
                          className={`review-btn approve ${myVote === "APPROVE" ? "active" : ""}`}
                          onClick={() => vote(id, "APPROVE")}
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          className={`review-btn reject ${myVote === "REJECT" ? "active" : ""}`}
                          onClick={() => vote(id, "REJECT")}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      className="review-btn open"
                      onClick={() => navigate(`/review/${id}`)}
                    >
                      Open
                    </button>

                    {(user?.roles || []).includes("ROLE_ADMIN") || canEdit ? (
                      <button
                        type="button"
                        className="review-btn open"
                        onClick={() => navigate(`/statistics/${id}?mode=overview`)}
                      >
                        Statistics
                      </button>
                    ) : null}

                    {canEdit && !isEditing && (
                      <button type="button" className="review-btn open" onClick={() => startEdit(quiz)}>
                        Edit
                      </button>
                    )}

                    {canEdit && isEditing && (
                      <>
                        <button type="button" className="review-btn approve" onClick={() => saveEdit(id)}>
                          Save
                        </button>
                        <button type="button" className="review-btn reject" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </>
                    )}

                    {canDelete && (
                      <button type="button" className="review-btn reject" onClick={() => deleteQuiz(id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}