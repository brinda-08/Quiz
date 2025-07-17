import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import FeedbackBox from "../components/FeedbackBox";

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const friend = location.state?.friend || null;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/quizzes/${id}`);
        if (!res.ok) throw new Error("Quiz not found");
        const data = await res.json();
        if (isMounted) {
          setQuiz(data);
          setAnswers(Array(data.questions.length).fill(null));
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Unable to load quiz. Please try again later.");
          setLoading(false);
        }
      }
    };
    fetchQuiz();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSelect = (qIdx, optIdx) => {
    setAnswers((prev) =>
      prev.map((val, idx) => (idx === qIdx ? optIdx : val))
    );
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) return;

    const points = answers.reduce(
      (acc, answer, idx) =>
        answer === quiz.questions[idx].correct ? acc + 1 : acc,
      0
    );
    setScore(points);
    setSubmitted(true);

    const username = sessionStorage.getItem("username") || "anon";

    try {
      await fetch("http://localhost:5000/api/leaderboard/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          quizId: id,
          title: quiz.title,
          score: points,
        }),
      });

      await fetch("http://localhost:5000/api/competition/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: id, username, score: points }),
      });

      window.dispatchEvent(new Event("quizScoreUpdated"));

      if (friend) {
        navigate(`/competition/${id}/result`, {
          state: { friend, score: points },
        });
        return;
      }
    } catch (err) {
      console.error("❌ Could not save score:", err);
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) {
      alert("Please enter feedback.");
      return;
    }

    try {
      await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: sessionStorage.getItem("username") || "anon",
          message: feedback,
          quizTitle: quiz.title,
        }),
      });

      setFeedbackSubmitted(true);
      setFeedback("");
    } catch (err) {
      console.error("❌ Could not submit feedback:", err);
    }
  };

  if (loading)
    return (
      <div className="text-center text-xl py-24 text-gray-700">Loading…</div>
    );
  if (error)
    return <p className="text-center text-red-600 text-lg mt-12">{error}</p>;
  if (!quiz) return null;

  if (submitted && !friend) {
    return (
      <div className="max-w-xl mx-auto mt-32 p-10 bg-lime-100 rounded-xl text-center shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-green-900">
          ✅ Your Score: {score} / {quiz.questions.length}
        </h2>

        {!feedbackSubmitted ? (
          <div className="space-y-4 mt-6">
            <textarea
              placeholder="Leave your feedback here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-3 rounded-md text-black resize-none"
              rows={4}
            />
            <button
              onClick={submitFeedback}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Submit Feedback
            </button>
          </div>
        ) : (
          <p className="text-green-700 font-medium mt-4">
            ✅ Thank you for your feedback!
          </p>
        )}

        {quiz && quiz.title && (
          <FeedbackBox quizTitle={quiz.title} refreshTrigger={feedbackSubmitted} />
        )}

        <button
          onClick={() => navigate("/home")}
          className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-10 p-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl shadow-xl">
      <h2 className="text-3xl text-center font-semibold mb-10 text-gray-800">
        {quiz.title}
      </h2>

      {quiz.questions.map((q, qIdx) => (
        <div key={qIdx} className="mb-8 bg-white p-6 rounded-xl shadow-md">
          <p className="text-xl font-semibold mb-4">
            <strong>Q{qIdx + 1}.</strong> {q.text}
          </p>

          {q.options.map((opt, optIdx) => (
            <label
              key={optIdx}
              className="flex items-center gap-3 bg-indigo-50 hover:bg-indigo-100 border-2 border-transparent px-4 py-2 mb-3 rounded-md cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name={`q-${qIdx}`}
                checked={answers[qIdx] === optIdx}
                onChange={() => handleSelect(qIdx, optIdx)}
                className="accent-blue-600 scale-125"
              />
              <span className="text-base">{opt}</span>
            </label>
          ))}
        </div>
      ))}

      <button
        className="block mx-auto mt-6 px-8 py-3 bg-blue-600 text-white text-lg rounded-xl font-bold disabled:bg-blue-300 hover:bg-blue-700"
        disabled={answers.includes(null)}
        onClick={handleSubmit}
      >
        Submit Quiz
      </button>
    </div>
  );
}
