import React, { useEffect, useState } from 'react';

function Leaderboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch('http://localhost:5000/api/leaderboard/scores');
        const data = await res.json();
        setScores(data);
      } catch (err) {
        console.error('❌ Error fetching scores:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();
  }, []);

  return (
    <div className="w-full px-6 py-10 flex flex-col items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 min-h-screen text-white">
      <h2 className="text-3xl font-bold mb-6">📊 LEADERBOARD</h2>

      {loading ? (
        <p className="text-lg italic mt-8">Loading…</p>
      ) : (
        <div className="w-full max-w-5xl overflow-x-auto">
          <table className="w-full bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20 rounded-xl overflow-hidden">
            <thead className="bg-black/30 text-white font-bold">
              <tr>
                <th className="px-6 py-4 border-b border-white/20">Username 🆔</th>
                <th className="px-6 py-4 border-b border-white/20">Score 💯</th>
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-6 italic text-white/80">
                    No scores available
                  </td>
                </tr>
              ) : (
                scores.map((user, idx) => (
                  <tr key={idx} className="hover:bg-white/10">
                    <td className="text-center px-6 py-3 border-b border-white/10">
                      {user.username || 'Unknown'}
                    </td>
                    <td className="text-center px-6 py-3 border-b border-white/10">
                      {user.score}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
