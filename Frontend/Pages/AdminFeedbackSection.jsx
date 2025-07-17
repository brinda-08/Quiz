import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminFeedbackSection() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedMessage, setEditedMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/feedback');
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/feedback/${id}`);
      fetchFeedback();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const startEditing = (id, message) => {
    setEditingId(id);
    setEditedMessage(message);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditedMessage('');
  };

  const saveEdit = async (id) => {
    if (!editedMessage.trim()) {
      alert('Feedback message cannot be empty.');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/feedback/${id}`, {
        message: editedMessage
      });
      setEditingId(null);
      setEditedMessage('');
      fetchFeedback();
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  // Fetch on mount and on feedbackUpdated event
  useEffect(() => {
    fetchFeedback();

    const handleRefresh = () => fetchFeedback();
    window.addEventListener('feedbackUpdated', handleRefresh);
    return () => window.removeEventListener('feedbackUpdated', handleRefresh);
  }, []);

  return (
    <div className="p-6 w-full max-w-4xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-4">📩 User Feedback</h2>

      {loading ? (
        <p className="text-gray-300">Loading feedback...</p>
      ) : feedbacks.length === 0 ? (
        <p className="text-gray-400 italic">No feedback has been submitted yet.</p>
      ) : (
        feedbacks.map((f) => (
          <div
            key={f._id}
            className="bg-slate-800 p-4 rounded-lg mb-4 shadow"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <p className="text-lg font-semibold">
                  👤 {f.username || 'Anonymous'}{' '}
                  {f.quizTitle && (
                    <span className="text-sm text-purple-300">
                      on <strong>{f.quizTitle}</strong>
                    </span>
                  )}
                </p>

                {editingId === f._id ? (
                  <textarea
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    className="w-full mt-2 p-2 rounded text-black resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-300 mt-2">{f.message}</p>
                )}

                {f.createdAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(f.createdAt).toLocaleString()}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-2 min-w-[70px]">
                {editingId === f._id ? (
                  <>
                    <button
                      onClick={() => saveEdit(f._id)}
                      className="text-green-400 hover:text-green-600 text-sm"
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      ✖ Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(f._id, f.message)}
                      className="text-yellow-400 hover:text-yellow-600 text-sm"
                    >
                      ✏ Edit
                    </button>
                    <button
                      onClick={() => deleteFeedback(f._id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      🗑 Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
