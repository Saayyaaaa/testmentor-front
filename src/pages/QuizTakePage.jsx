import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/http";
import { useToast } from "../components/Toast";
import "./QuizTakePage.css";

export default function QuizTakePage() {
  const { id } = useParams();
  const quizId = id;
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> optionId
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!quizId) return;

    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/quizzes/${quizId}`, { token });
        if (!ignore) setQuiz(data);
      } catch (e) {
        showToast(e.message || "Failed to load quiz");
        navigate("/learning");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [quizId]);

  const questions = useMemo(() => quiz?.questions || [], [quiz]);

  function selectOption(questionId, optionId) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  async function submit() {
    try {
      setSubmitting(true);
      const res = await apiFetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        token,
        body: { answers },
      });

      showToast("Saved!", "success");
      navigate(`/statistics/${quizId}`, { state: { submitResult: res } });
    } catch (e) {
      showToast(e.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="quiztake-page">
        <div className="quiztake-card">Loading...</div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="quiztake-page">
        <div className="quiztake-card">Quiz not found</div>
      </div>
    );
  }

  return (
    <div className="quiztake-page">
      <div className="quiztake-card">
        <div className="quiztake-title">{quiz.title || "Untitled"}</div>

        {questions.map((q, idx) => (
          <div className="quiztake-q" key={q.questionID || idx}>
            <div className="quiztake-q__text">
              {idx + 1}. {q.questionText}
            </div>

            <div className="quiztake-options">
              {(q.options || []).map((op) => (
                <label className="quiztake-opt" key={op.optionID}>
                  <input
                    type="radio"
                    name={`q-${q.questionID}`}
                    checked={String(answers[q.questionID]) === String(op.optionID)}
                    onChange={() => selectOption(q.questionID, op.optionID)}
                  />
                  <span>{op.optionText}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="quiztake-actions">
          <button className="quiztake-btn" onClick={() => navigate(-1)} disabled={submitting}>
            Back
          </button>
          <button className="quiztake-btn quiztake-btn--primary" onClick={submit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
