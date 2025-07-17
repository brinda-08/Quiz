import { useOutletContext } from "react-router-dom";

export default function DashboardSection() {
  const { users, loading, error } = useOutletContext();

  if (loading) return <p className="p-8">Loading …</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  console.log("👥 Users in DashboardSection:", users);

  return (
    <div className="w-full h-full flex justify-center items-start px-4 py-10 bg-gray-900 text-white">
      <div className="w-full max-w-4xl">
        <h3 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2">
          📊 User Scores
        </h3>

        {users.length === 0 ? (
          <p className="text-center">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border border-gray-700 text-left">
              <thead className="bg-gray-800 text-gray-300">
                <tr>
                  <th className="px-4 py-2 border border-gray-700">Username</th>
                  <th className="px-4 py-2 border border-gray-700">Score</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-700">
                    <td className="px-4 py-2 border border-gray-700">{user.username}</td>
                    <td className="px-4 py-2 border border-gray-700">
                      {user.scores?.length
                        ? user.scores.map((s) => `${s.title}: ${s.score}`).join(", ")
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
