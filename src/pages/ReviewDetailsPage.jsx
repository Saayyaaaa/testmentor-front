import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/http";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../components/Toast";
import "./ReviewDetailsPage.css";

function mapQuizToEditForm(data) {
  return {
    title: data?.title || "",
    description: data?.description || "",
    questions: (data?.questions || []).map((q) => ({
      questionID: q.questionID,
      questionText: q.questionText || "",
      questionType: q.questionType || "",
      aiAnswer: q.aiAnswer || "",
      options: (q.options || []).map((op) => ({
        optionID: op.optionID,
        optionText: op.optionText || "",
        correct: !!(op.correct ?? op.isCorrect),
      })),
    })),
  };
}

export default function ReviewDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    questions: [],
  });
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
      setEditForm(mapQuizToEditForm(data));
    } catch (e) {
      showToast(e.message || "Failed to load quiz details");
      navigate("/review");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const questions = useMemo(() => {
    return editing ? editForm.questions || [] : details?.questions || [];
  }, [details, editing, editForm.questions]);

  const comments = useMemo(() => details?.comments || [], [details]);
  const myVote = details?.myVote || null;

  function getStatusClass(status) {
    const s = String(status || "").toUpperCase();
    if (s === "APPROVED") return "approved";
    if (s === "REJECTED") return "rejected";
    return "pending";
  }

  function startEditing() {
    setEditForm(mapQuizToEditForm(details));
    setEditing(true);
  }

  function cancelEditing() {
    setEditForm(mapQuizToEditForm(details));
    setEditing(false);
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

      showToast(
        voteType === "APPROVE" ? "Vote saved: approve" : "Vote saved: reject"
      );
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
        body: {
          title: editForm.title,
          description: editForm.description,
          questions: (editForm.questions || []).map((q) => ({
            questionID: q.questionID,
            questionText: q.questionText,
            questionType: q.questionType,
            aiAnswer: q.aiAnswer,
            options: (q.options || []).map((op) => ({
              optionID: op.optionID,
              optionText: op.optionText,
              isCorrect: !!op.correct,
            })),
          })),
        },
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

  function handleDeleteQuestion(questionIndex) {
    setEditForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, idx) => idx !== questionIndex),
    }));
  }

  function handleDeleteOption(questionIndex, optionIndex) {
    setEditForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === questionIndex
          ? {
              ...q,
              options: q.options.filter((_, opIdx) => opIdx !== optionIndex),
            }
          : q
      ),
    }));
  }

  function handleQuestionTextChange(questionIndex, value) {
    setEditForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === questionIndex ? { ...q, questionText: value } : q
      ),
    }));
  }

  function handleOptionTextChange(questionIndex, optionIndex, value) {
    setEditForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === questionIndex
          ? {
              ...q,
              options: q.options.map((op, opIdx) =>
                opIdx === optionIndex ? { ...op, optionText: value } : op
              ),
            }
          : q
      ),
    }));
  }

  function handleOptionCorrectChange(questionIndex, optionIndex, checked) {
    setEditForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) =>
        idx === questionIndex
          ? {
              ...q,
              options: q.options.map((op, opIdx) =>
                opIdx === optionIndex ? { ...op, correct: checked } : op
              ),
            }
          : q
      ),
    }));
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
                      setEditForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Quiz title"
                  />
                  <textarea
                    className="review-details-textarea"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Quiz description"
                    rows={3}
                  />
                </>
              ) : (
                <>
                  <h1 className="review-details-title">
                    {details.title || "Untitled"}
                  </h1>
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
                  Your vote:{" "}
                  {myVote
                    ? myVote === "APPROVE"
                      ? "Approve"
                      : "Reject"
                    : "Not voted"}
                </span>
              </div>
            </div>

            <div
              className={`review-details-badge ${getStatusClass(
                details.status
              )}`}
            >
              {details.status}
            </div>
          </div>

          <div className="review-details-questions">
            {questions.length === 0 ? (
              <div className="review-question-empty">No questions yet.</div>
            ) : (
              questions.map((q, idx) => (
                <div className="review-question-card" key={q.questionID || idx}>
                  {editing ? (
                    <>
                      <div className="review-question-edit-top">
                        <input
                          className="review-details-input"
                          value={q.questionText}
                          onChange={(e) =>
                            handleQuestionTextChange(idx, e.target.value)
                          }
                          placeholder={`Question ${idx + 1}`}
                        />

                        <button
                          type="button"
                          className="review-details-btn reject"
                          onClick={() => handleDeleteQuestion(idx)}
                        >
                          Delete question
                        </button>
                      </div>

                      {q.aiAnswer && (
                        <div className="review-question-ai">
                          <strong>AI answer:</strong> {q.aiAnswer}
                        </div>
                      )}

                      <div className="review-question-options-edit">
                        {(q.options || []).map((op, optionIdx) => (
                          <div
                            className="review-option-edit-row"
                            key={op.optionID || optionIdx}
                          >
                            <input
                              className="review-details-input"
                              value={op.optionText}
                              onChange={(e) =>
                                handleOptionTextChange(
                                  idx,
                                  optionIdx,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${optionIdx + 1}`}
                            />

                            <label className="review-option-correct">
                              <input
                                type="checkbox"
                                checked={!!op.correct}
                                onChange={(e) =>
                                  handleOptionCorrectChange(
                                    idx,
                                    optionIdx,
                                    e.target.checked
                                  )
                                }
                              />
                              Correct
                            </label>

                            <button
                              type="button"
                              className="review-details-btn reject"
                              onClick={() =>
                                handleDeleteOption(idx, optionIdx)
                              }
                            >
                              Delete answer
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
                        className={`review-comment-vote ${String(
                          item.voteType || ""
                        ).toLowerCase()}`}
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
              className={`review-details-btn approve ${
                myVote === "APPROVE" ? "active" : ""
              }`}
              onClick={() => vote("APPROVE")}
            >
              Approve
            </button>

            <button
              type="button"
              className={`review-details-btn reject ${
                myVote === "REJECT" ? "active" : ""
              }`}
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
                onClick={startEditing}
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
                  onClick={cancelEditing}
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