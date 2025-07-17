import useSuperadminData from "../hooks/useSuperadminData";

export default function AdminRequestsSection() {
  const { requests, handleApprove, handleReject } = useSuperadminData();

  return (
    <section id="admin-requests" style={{ marginBottom: "3rem" }}>
      <h3>📥 Pending Admin Requests</h3>
      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Username</th>
              <th>Requested At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id}>
                <td>{req.username}</td>
                <td>{new Date(req.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleApprove(req._id)}>✅ Approve</button>
                  <button onClick={() => handleReject(req._id)} style={{ marginLeft: "1rem", color: "white" }}>
                    ❌ Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
