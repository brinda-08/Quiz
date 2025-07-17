import React, { useEffect, useState } from 'react';

const AdminPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10 text-center">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">User Scores</h1>
      <div className="overflow-x-auto">
        <table className="w-full max-w-4xl mx-auto bg-white border border-gray-300 shadow-lg rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-4 px-6 border">#</th>
              <th className="py-4 px-6 border">Username</th>
              <th className="py-4 px-6 border">Score</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((u, i) => (
                <tr key={u._id} className="hover:bg-gray-100">
                  <td className="py-3 px-5 border">{i + 1}</td>
                  <td className="py-3 px-5 border">{u.name}</td>
                  <td className="py-3 px-5 border">{u.score ?? 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="py-6 text-gray-600 italic">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;
