import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import "./ReviewDetailsPage.css";

export default function ReviewDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [generatingMore, setGeneratingMore] = useState(false);

  async function loadDetails() {
    if (!token || !user) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch(`/api/mentor/review/${id}`, { token });
      setDetails(data);
      setComment(data?.myComment || "");
      setEditForm({
        title: data?.title || "",
        description: data?.description || "",
      });
    } catch (e) {
      showToast(e.message || "Failed to load quiz details");
      navigate("/review");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [id]);

  const questions = useMemo(() => details?.questions || [], [details]);
  const comments = useMemo(() => details?.comments || [], [details]);
  const myVote = details?.myVote || null;

  function getStatusClass(status) {
    const s = String(status || "").toUpperCase();
    if (s === "APPROVED") return "approved";
    if (s === "REJECTED") return "rejected";
    return "pending";
  }

  async function vote(voteType) {
    try {
      await apiFetch(`/api/mentor/review/${id}/vote`, {
        method: "POST",
        token,
        body: {
          voteType,
          comment,
        },
      });

      showToast(voteType === "APPROVE" ? "Vote saved: approve" : "Vote saved: reject");
      await loadDetails();
    } catch (e) {
      showToast(e.message || "Vote failed");
    }
  }

  async function saveEdit() {
    try {
      await apiFetch(`/api/mentor/review/${id}`, {
        method: "PATCH",
        token,
        body: editForm,
      });

      showToast("Quiz updated");
      setEditing(false);
      await loadDetails();
    } catch (e) {
      showToast(e.message || "Update failed");
    }
  }

  async function deleteQuiz() {
    if (!window.confirm("Delete this quiz?")) return;

    try {
      await apiFetch(`/api/mentor/review/${id}`, {
        method: "DELETE",
        token,
      });

      showToast("Quiz deleted");
      navigate("/review");
    } catch (e) {
      showToast(e.message || "Delete failed");
    }
  }

  async function handleGenerateMoreQuestions() {
    try {
      setGeneratingMore(true);

      await apiFetch(`/api/quizzes/${id}/ai-append`, {
        method: "POST",
        token,
        body: {
          topic: details?.title || "",
          sourceText: details?.description || "",
          questionCount: 3,
          difficulty: "Medium",
          language: "English",
        },
      });

      showToast("New AI questions were added successfully");
      await loadDetails();
    } catch (e) {
      showToast(e.message || "Failed to generate additional questions");
    } finally {
      setGeneratingMore(false);
    }
  }

  if (loading) {
    return (
      <div className="review-details-page">
        <div className="review-details-empty">Loading...</div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="review-details-page">
        <div className="review-details-empty">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="review-details-page">
      <div className="review-details-wrap">
        <div className="review-details-main">
          <div className="review-details-hero">
            <div>
              {editing ? (
                <>
                  <input
                    className="review-details-input"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Quiz title"
                  />
                  <textarea
                    className="review-details-textarea"
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
                  <h1 className="review-details-title">{details.title || "Untitled"}</h1>
                  {details.description && (
                    <p className="review-details-desc">{details.description}</p>
                  )}
                </>
              )}

              <div className="review-details-meta">
                <span>Author: {details.authorName || "Unknown"}</span>
                <span>Approvals: {details.approvalsCount ?? 0}</span>
                <span>Rejects: {details.rejectsCount ?? 0}</span>
                <span>
                  Your vote: {myVote ? (myVote === "APPROVE" ? "Approve" : "Reject") : "Not voted"}
                </span>
              </div>
            </div>

            <div className={`review-details-badge ${getStatusClass(details.status)}`}>
              {details.status}
            </div>
          </div>

          <div className="review-details-questions">
            {questions.length === 0 ? (
              <div className="review-question-empty">No questions yet.</div>
            ) : (
              questions.map((q, idx) => (
                <div className="review-question-card" key={q.questionID || idx}>
                  <div className="review-question-title">
                    {idx + 1}. {q.questionText}
                  </div>

                  {q.aiAnswer && (
                    <div className="review-question-ai">
                      <strong>AI answer:</strong> {q.aiAnswer}
                    </div>
                  )}

                  <ul className="review-question-options">
                    {(q.options || []).map((op, optionIdx) => (
                      <li key={op.optionID || optionIdx}>
                        {op.optionText}
                        {op.correct ? <b> (correct)</b> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          <div className="review-comments-block">
            <div className="review-comments-title">Mentor comments</div>

            {comments.length === 0 ? (
              <div className="review-comments-empty">No comments yet.</div>
            ) : (
              <div className="review-comments-list">
                {comments.map((item) => (
                  <div className="review-comment-card" key={item.voteId}>
                    <div className="review-comment-top">
                      <span className="review-comment-author">
                        {item.mentorName || "Unknown"}
                      </span>
                      <span
                        className={`review-comment-vote ${String(item.voteType || "").toLowerCase()}`}
                      >
                        {item.voteType}
                      </span>
                    </div>
                    <div className="review-comment-text">
                      {item.comment?.trim() ? item.comment : "No comment"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="review-details-sidebar">
          <div className="review-details-sidecard">
            <div className="review-details-sidecard-title">Actions</div>

            <textarea
              className="review-details-comment-box"
              placeholder="Add or update your comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />

            <button
              type="button"
              className={`review-details-btn approve ${myVote === "APPROVE" ? "active" : ""}`}
              onClick={() => vote("APPROVE")}
            >
              Approve
            </button>

            <button
              type="button"
              className={`review-details-btn reject ${myVote === "REJECT" ? "active" : ""}`}
              onClick={() => vote("REJECT")}
            >
              Reject
            </button>

            <button
              type="button"
              className="review-details-btn neutral"
              onClick={() => navigate(`/quiz/${id}`)}
            >
              Start quiz
            </button>

            {((user?.roles || []).includes("ROLE_ADMIN") || details.canEdit) && (
              <button
                type="button"
                className="review-details-btn neutral"
                onClick={() => navigate(`/statistics/${id}?mode=overview`)}
              >
                Statistics
              </button>
            )}

            {details.canEdit && !editing && (
              <button
                type="button"
                className="review-details-btn neutral"
                onClick={() => setEditing(true)}
              >
                Edit quiz
              </button>
            )}

            {details.canEdit && !editing && (
              <button
                type="button"
                className="review-details-btn neutral"
                onClick={handleGenerateMoreQuestions}
                disabled={generatingMore}
              >
                {generatingMore ? "Generating..." : "Generate more with AI"}
              </button>
            )}

            {details.canEdit && editing && (
              <>
                <button
                  type="button"
                  className="review-details-btn approve"
                  onClick={saveEdit}
                >
                  Save changes
                </button>

                <button
                  type="button"
                  className="review-details-btn neutral"
                  onClick={() => setEditing(false)}
                >
                  Cancel edit
                </button>
              </>
            )}

            {details.canDelete && (
              <button
                type="button"
                className="review-details-btn reject"
                onClick={deleteQuiz}
              >
                Delete quiz
              </button>
            )}

            <button
              type="button"
              className="review-details-btn ghost"
              onClick={() => navigate("/review")}
            >
              Back to review
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}