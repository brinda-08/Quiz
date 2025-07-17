/*  src/pages/customquiz.jsx  */
import React, { useState } from "react";
import "./customquiz.css";

/** ------------------------------------------------------------------
 *  Custom-quiz builder ─ super-light, no form libs, pure React state
 * ------------------------------------------------------------------ */
export default function CustomQuiz() {
  /* ───────── state ───────── */
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], correct: null }
  ]);
  const [saving, setSaving] = useState(false);

  /* ───────── helpers ───────── */
  const updateQuestion = (qIdx, updater) =>
    setQuestions(prev =>
      prev.map((q, i) => (i === qIdx ? updater(q) : q))
    );

  /* text of question */
  const handleQuestionText = (qIdx, value) =>
    updateQuestion(qIdx, q => ({ ...q, text: value }));

  /* option text */
  const handleOptionText = (qIdx, oIdx, value) =>
    updateQuestion(qIdx, q => {
      const opts = [...q.options];
      opts[oIdx] = value;
      return { ...q, options: opts };
    });

  /* correct radio */
  const handleCorrect = (qIdx, oIdx) =>
    updateQuestion(qIdx, q => ({ ...q, correct: oIdx }));

  /* CRUD */
  const addQuestion = () =>
    setQuestions(prev => [
      ...prev,
      { text: "", options: ["", "", "", ""], correct: null }
    ]);

  const deleteQuestion = qIdx =>
    setQuestions(prev => prev.filter((_, i) => i !== qIdx));

  /* validation */
  const isValid = () =>
    title.trim() &&
    questions.length &&
    questions.every(
      q =>
        q.text.trim() &&
        q.options.every(o => o.trim()) &&
        q.correct !== null
    );

  /* submit */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!isValid()) {
      return alert("⚠️ Fill everything and pick correct answers first!");
    }
    try {
      setSaving(true);
      const res = await fetch("http://localhost:5000/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, questions })
      });
      if (!res.ok) throw new Error("Server error");
      alert("✅ Quiz saved");
      setTitle("");
      setQuestions([{ text: "", options: ["", "", "", ""], correct: null }]);
    } catch (err) {
      console.error(err);
      alert("❌ Could not save quiz");
    } finally {
      setSaving(false);
    }
  };

  /* ───────── render ───────── */
  return (
    <div className="main-content">
      <div className="custom-container">
        <h1>Create a Custom Quiz</h1>

        <input
          className="title-input"
          type="text"
          placeholder="Quiz title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {questions.map((q, qIdx) => (
          <fieldset className="question-card" key={qIdx}>
            <legend>Question {qIdx + 1}</legend>

            <button
              type="button"
              className="delete-btn"
              onClick={() => deleteQuestion(qIdx)}
              title="Delete this question"
            >
              ✕
            </button>

            <input
              type="text"
              placeholder="Enter the question"
              value={q.text}
              onChange={e => handleQuestionText(qIdx, e.target.value)}
            />

            {q.options.map((opt, oIdx) => (
              <label className="option-row" key={oIdx}>
                <input
                  type="radio"
                  name={`correct-${qIdx}`}
                  checked={q.correct === oIdx}
                  onChange={() => handleCorrect(qIdx, oIdx)}
                />
                <input
                  type="text"
                  placeholder={`Option ${oIdx + 1}`}
                  value={opt}
                  onChange={e => handleOptionText(qIdx, oIdx, e.target.value)}
                />
              </label>
            ))}
          </fieldset>
        ))}

        <button type="button" className="add-btn" onClick={addQuestion}>
          ➕ Add question
        </button>

        <button
          type="button"
          className="submit-btn"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? "Saving…" : "💾 Save quiz"}
        </button>
      </div>
    </div>
  );
}
