import React, { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/http";
import { useToast } from "../components/Toast";
import { useNavigate } from "react-router-dom";
import "./GeneratorPage.css";

export default function GeneratorPage() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [text, setText] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Easy");
  const [lang, setLang] = useState("Eng");
  const [quiz, setQuiz] = useState(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const canSave = Boolean(quiz && quiz.questions?.length);

  const subtitle = useMemo(() => {
    return `Questions: ${count} • Difficulty: ${difficulty} • Language: ${lang}`;
  }, [count, difficulty, lang]);

  async function onGenerate() {
    if (!user || !token) {
      showToast("Please log in");
      navigate("/login");
      return;
    }

    if (!text.trim()) {
      showToast("Please enter a topic or text");
      return;
    }

    try {
      setGenerating(true);

      const generated = await apiFetch("/api/ai/quizzes/generate", {
        method: "POST",
        token,
        body: {
          topic: text,
          sourceText: text,
          questionCount: Number(count) || 5,
          difficulty,
          language: lang === "Rus" ? "Russian" : "English",
        },
      });

      console.log("Generated quiz:", generated);
      setQuiz(generated);
      showToast("Quiz generated with AI");
    } catch (e) {
      console.error("Generate error:", e);
      showToast(e.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function onSave() {
    if (!user || !token) {
      showToast("Please log in or register");
      navigate("/login");
      return;
    }

    if (!canSave) return;

    try {
      setSaving(true);

      await apiFetch("/api/quizzes", {
        method: "POST",
        token,
        body: quiz,
      });

      showToast("Saved! Sent for mentor review.");
      navigate("/learning");
    } catch (e) {
      console.error("Save error:", e);
      showToast(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="gen-page">
      <div className="gen-card">
        <div className="gen-title">Create a quiz draft from your text</div>
        <div className="gen-sub">
          Generate quiz questions with AI from a topic or source text, then save the draft for review.
        </div>

        <textarea
          className="gen-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste topic or text here..."
        />

        <div className="gen-controls">
          <div className="gen-left">
            <div className="gen-row">
              <span>Select number of questions:</span>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="gen-row">
              <span>Choose difficulty level:</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {["Easy", "Medium", "Hard"].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="gen-row">
              <span>Question language:</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)}>
                {["Eng", "Rus"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="gen-right">
            <button className="gen-btn" onClick={onGenerate} disabled={generating}>
              {generating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {quiz && (
          <div className="gen-preview">
            <div className="gen-preview__head">
              <div>
                <div className="gen-preview__title">
                  {quiz.title || "Preview"}
                </div>
                <div className="gen-preview__sub">{subtitle}</div>
                {quiz.description && (
                  <div className="gen-preview__desc">{quiz.description}</div>
                )}
              </div>

              <button
                className="gen-save"
                disabled={!canSave || saving}
                onClick={onSave}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>

            <div className="gen-questions">
              {quiz.questions.map((q, idx) => (
                <div key={idx} className="q-card">
                  <div className="q-text">
                    {idx + 1}. {q.questionText}
                  </div>

                  <div className="q-options">
                    {q.options?.map((o, i) => (
                      <label key={i} className="q-opt">
                        <input type="radio" name={`q${idx}`} disabled />
                        <span>{o.optionText}</span>
                      </label>
                    ))}
                  </div>

                  {q.aiAnswer && (
                    <div className="q-expl">
                      <strong>Explanation:</strong> {q.aiAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}