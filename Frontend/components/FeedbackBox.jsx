import React, { useEffect, useState } from 'react';

export default function FeedbackBox({ quizTitle }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchFeedbacks = async () => {
    try {
      if (!quizTitle) return;
      const encodedTitle = encodeURIComponent(quizTitle);
      const res = await fetch(`http://localhost:5000/api/feedback/quiz/${encodedTitle}`);
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    const interval = setInterval(() => {
      fetchFeedbacks();
    }, 2000); // Poll every 5 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [quizTitle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (!newFeedback.trim()) {
        setError("Feedback cannot be empty.");
        setSubmitting(false);
        return;
      }
      const encodedTitle = encodeURIComponent(quizTitle);
      const res = await fetch(`http://localhost:5000/api/feedback/quiz/${encodedTitle}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: newFeedback }),
      });
      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      setNewFeedback("");
      fetchFeedbacks();
    } catch (erpr) {
      setError("Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow text-left text-black">
      <h3 className="text-xl font-semibold mb-2">💬 Feedback from other users</h3>
      {/* Feedback submission form removed as requested */}
      {feedbacks.length === 0 ? (
        <p className="text-gray-500 italic">No feedback yet.</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb._id} className="mb-2">
            <p>🗣️ {fb.message}</p>
            <p className="text-sm text-gray-500">— {fb.username}</p>
          </div>
        ))
      )}
    </div>
  );
}
