import { useOutletContext } from "react-router-dom";

export default function UserDetailsSection() {
  const { users } = useOutletContext();

console.log("Loaded users with scores:", users);

 return (
    <section className="px-4 md:px-8 py-10 text-white flex justify-center">
      <div className="w-full max-w-7xl">
        <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center">
          👥 Registered Users & Their Quiz Scores
        </h3>

        {users.length === 0 ? (
          <p className="text-gray-300 text-center py-8 text-base">
            No registered users.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full border-collapse text-sm md:text-base text-white">
              <thead>
                <tr className="border-b-2 border-gray-600 bg-gray-800 text-left text-xs md:text-sm uppercase tracking-wider">
                  <th className="p-4">Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Quiz</th>
                  <th className="p-4">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user, idx) =>
                  user.scores && user.scores.length > 0 ? (
                    user.scores.map((quiz, qIdx) => (
                      <tr key={`${idx}-${qIdx}`} className="hover:bg-gray-700/50">
                        <td className="p-4">{qIdx === 0 ? user.username : ""}</td>
                        <td className="p-4 text-gray-300">
                          {qIdx === 0 ? user.email || "N/A" : ""}
                        </td>
                        <td className="p-4">{quiz.title}</td>
                        <td className="p-4 font-semibold text-blue-400">
                          {quiz.score}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key={idx} className="hover:bg-gray-700/50">
                      <td className="p-4">{user.username}</td>
                      <td className="p-4 text-gray-300">{user.email || "N/A"}</td>
                      <td className="p-4 italic text-gray-400">No quizzes taken</td>
                      <td className="p-4">-</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
