import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/quizzes");
        const data = await res.json();
        const filtered = data.filter((q) => q.title && q.title.trim());
        setQuizzes(filtered);
      } catch (err) {
        console.error("❌ Failed to load quizzes:", err);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-16 mb-10 p-8 rounded-2xl bg-gradient-to-r from-[#f9fafe] to-[#e8f0ff] shadow-xl text-center text-gray-800 font-sans">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-gray-800">
        Select a Quiz to Play
      </h2>

      {quizzes.length === 0 ? (
        <p className="text-gray-600">No quizzes available.</p>
      ) : (
        <ul className="flex flex-col items-center gap-4">
          {quizzes.map((q) => (
            <li key={q._id} className="w-full max-w-sm">
              <button
                onClick={() => navigate(`/play-quiz/${q._id}`)}
                className="w-full py-3 px-6 text-lg font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-800 hover:-translate-y-0.5 transition-all duration-200"
              >
                {q.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
