import { useEffect, useState } from "react";

export default function useSuperadminData() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const pendingRes = await fetch("http://localhost:5000/api/superadmin/pending");
        const pendingData = await pendingRes.json();
        const userRes = await fetch("http://localhost:5000/api/superadmin/users");
        const userData = await userRes.json();

        setRequests(pendingData);
        setUsers(userData.users || []);
        setAdmins(userData.admins || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching:", err);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleApprove = async (id) => {
    const res = await fetch(`http://localhost:5000/api/superadmin/approve/${id}`, {
      method: "POST",
    });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } else {
      alert("Approval failed");
    }
  };

  const handleReject = async (id) => {
    const res = await fetch(`http://localhost:5000/api/superadmin/reject/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } else {
      alert("Rejection failed");
    }
  };

  return { users, admins, requests, loading, error, handleApprove, handleReject };
}
