import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function CustomQuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/quizzes", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`
          }
        });
        const data = await res.json();
        setQuizzes(data);
      } catch (err) {
        alert("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await fetch(`http://localhost:5000/api/quizzes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      });
      setQuizzes(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      alert("Failed to delete quiz");
    }
  };

  if (loading) return <p className="p-5 text-white">Loading…</p>;

  return (
    <div className="min-h-screen bg-[#0f2027] text-white p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold border-l-4 border-[#3498db] pl-3">
          Custom Quizzes
        </h2>
        <button
          className="bg-[#e74c3c] hover:bg-[#c0392b] text-white font-bold py-2 px-4 rounded transition-colors"
          onClick={() => navigate("/superadmin-dashboard/custom-quiz")}
        >
          + New Quiz
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-[#1c1c1c] text-white">
          <thead>
            <tr className="bg-[#1a1a1a] text-left text-base">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Questions</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map(q => (
              <tr key={q._id} className="border-b border-[#333]">
                <td className="px-4 py-3">{q.title}</td>
                <td className="px-4 py-3">{q.questions.length}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <span className="text-[#4fc3f7] font-bold">
                    ✏️ <Link to={`/superadmin-dashboard/custom-quiz/${q._id}`}>Edit</Link>
                  </span>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="bg-[#e74c3c] hover:bg-[#c0392b] text-white font-bold py-1 px-3 rounded"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
