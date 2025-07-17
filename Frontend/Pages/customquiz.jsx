import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const emptyQuestion = () => ({
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

export default function CustomQuiz() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("Failed to fetch quiz");
        const quiz = await res.json();
        setTitle(quiz.title);
        setQuestions(quiz.questions.length ? quiz.questions : [emptyQuestion()]);
      } catch (err) {
        alert(err.message);
        navigate("/superadmin-dashboard/custom-quiz-list");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  const handleQuestionText = (qIdx, value) =>
    setQuestions(prev =>
      prev.map((q, i) => (i === qIdx ? { ...q, text: value } : q))
    );

  const handleOptionText = (qIdx, optIdx, value) =>
    setQuestions(prev =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((o, j) => (j === optIdx ? value : o)),
            }
          : q
      )
    );

  const handleCorrectIndex = (qIdx, optIdx) =>
    setQuestions(prev =>
      prev.map((q, i) => (i === qIdx ? { ...q, correctIndex: optIdx } : q))
    );

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()]);

  const deleteQuestion = qIdx =>
    setQuestions(prev => prev.filter((_, i) => i !== qIdx));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim()) return alert("Please give the quiz a title.");
    if (!questions.length) return alert("Add at least one question.");

    const payload = {
      title: title.trim(),
      questions: questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(o => o.trim()),
        correct: q.correctIndex  // ✅ Convert to backend expected format
      }))
,
    };

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit
      ? `http://localhost:5000/api/quizzes/${id}`
      : "http://localhost:5000/api/quizzes";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");
      alert(isEdit ? "Quiz updated!" : "Quiz created!");
      navigate("/superadmin-dashboard/custom-quiz-list");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-12 text-center text-white">Loading quiz…</p>;

 return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 py-10 px-4">
    <div className="w-full bg-slate-800 rounded-2xl p-4 md:p-10 shadow-xl text-white">

      <h1 className="text-center text-2xl font-bold mb-8">Create a Custom Quiz</h1>

      <form onSubmit={handleSubmit}>
        <input
          className="w-full p-3 mb-6 rounded-lg border border-gray-600 bg-slate-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Quiz title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-slate-700 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Question {qIdx + 1}</h4>
              <button
                type="button"
                className="text-red-400 text-xl hover:scale-110"
                onClick={() => deleteQuestion(qIdx)}
              >
                ✕
              </button>
            </div>
            <input
              className="w-full p-3 mb-4 rounded-lg border border-gray-600 bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the question"
              value={q.text}
              onChange={(e) => handleQuestionText(qIdx, e.target.value)}
            />
            {q.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-3 mb-3">
                <input
                  type="radio"
                  name={`correct-${qIdx}`}
                  checked={q.correctIndex === optIdx}
                  onChange={() => handleCorrectIndex(qIdx, optIdx)}
                />
                <input
                  className="flex-1 p-3 rounded-lg border border-gray-600 bg-slate-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Option ${optIdx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionText(qIdx, optIdx, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            onClick={addQuestion}
          >
            + Add question
          </button>

          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg"
          >
            Save quiz
          </button>
        </div>
      </form>
    </div>
  </div>
);
}
