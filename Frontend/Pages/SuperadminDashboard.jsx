import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SuperadminSidebar from "../components/SuperadminSidebar";

function SuperadminDashboard() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const [pendingRes, userRes, scoreRes] = await Promise.all([
        fetch("http://localhost:5000/api/superadmin/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/superadmin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/leaderboard/scores", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pendingData = await pendingRes.json();
      const userData = await userRes.json();
      const scoreData = await scoreRes.json();

      
      const enrichedUsers = (userData.users || []).map((user) => {
        const userScores = scoreData.filter((s) => s.username === user.username);
        return {
          ...user,
          scores: userScores.map((s) => ({
            title: s.quizTitle || "General Quiz",
            score: s.score,
          })),
        };
      });

      setRequests(pendingData);
      setUsers(enrichedUsers);
      setAdmins(userData.admins || []);
    } catch (err) {
      console.error("❌ Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      console.log("🔁 Quiz score updated, refreshing dashboard...");
      fetchDashboardData();
    };
    window.addEventListener("quizScoreUpdated", handleRefresh);
    return () => window.removeEventListener("quizScoreUpdated", handleRefresh);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white overflow-hidden">
      <SuperadminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobile={isMobile}
      />

      <div
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${isMobile ? "pt-20 px-4" : isCollapsed ? "ml-16 px-4" : "ml-64 px-6"}
        `}
      >
        <div className="max-w-7xl mx-auto py-6">
          <Outlet
            context={{
              users,
              admins,
              requests,
              loading,
              error,
              refreshDashboardData: fetchDashboardData,
              handleApprove: async (id) => {
                try {
                  const token = sessionStorage.getItem("token");
                  const res = await fetch(`http://localhost:5000/api/superadmin/approve/${id}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    setRequests((prev) => prev.filter((r) => r._id !== id));
                  } else {
                    alert("Approval failed");
                  }
                } catch (err) {
                  console.error(err);
                  alert("Approval failed");
                }
              },
              handleReject: async (id) => {
                try {
                  const token = sessionStorage.getItem("token");
                  const res = await fetch(`http://localhost:5000/api/superadmin/reject/${id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.ok) {
                    setRequests((prev) => prev.filter((r) => r._id !== id));
                  } else {
                    alert("Rejection failed");
                  }
                } catch (err) {
                  console.error(err);
                  alert("Rejection failed");
                }
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default SuperadminDashboard;
