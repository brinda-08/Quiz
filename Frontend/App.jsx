import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store/store';
import { setAuthState } from './store/slices/authslice';

import './index.css';

// Import components
import Login from './Pages/login';
import Home from './Pages/home';
import Quiz from './components/Quiz/Quiz.jsx';
import AdminDashboard from './Pages/AdminDashboard';
import Register from './Pages/register';
import JoinQuiz from "./Pages/joinquiz";
import CustomQuiz from "./Pages/customquiz";
import SuperadminDashboard from './Pages/SuperadminDashboard';
import Leaderboard from './Pages/Leaderboard';
import DashboardSection from "./Pages/DashboardSection";
import AdminRequestsSection from "./Pages/AdminRequestsSection";
import UserDetailsSection from "./Pages/UserDetailsSection";
import AdminWelcome from './Pages/AdminWelcome';
import ApprovedAdminsSection from "./Pages/ApprovedAdminsSection";
import SuperadminWelcome from './Pages/SuperadminWelcome.jsx';
import QuizPlay from "./Pages/QuizPlay";
import CustomQuizList from "./Pages/CustomQuizList";
import AdminFeedbackSection from "./Pages/AdminFeedbackSection";


// ✅ Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, role } = useSelector((state) => state.auth);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
    return children;
  }

  switch (role) {
    case "superadmin":
      return <Navigate to="/superadmin-dashboard" replace />;
    case "admin":
      return <Navigate to="/admin-dashboard" replace />;
    default:
      return <Navigate to="/home" replace />;
  }
};

// ✅ Public Route Component
const PublicRoute = ({ children }) => {
  const { token, role } = useSelector((state) => state.auth);

  if (token && role) {
    switch (role) {
      case "superadmin":
        return <Navigate to="/superadmin-dashboard" replace />;
      case "admin":
        return <Navigate to="/admin-dashboard" replace />;
      default:
        return <Navigate to="/home" replace />;
    }
  }

  return children;
};

// ✅ Main App Router Component
const AppRouter = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem("token");
    const savedRole = sessionStorage.getItem("role");
    const savedUsername = sessionStorage.getItem("username");

    if (savedToken && savedRole && savedUsername) {
      dispatch(setAuthState({
        token: savedToken,
        role: savedRole,
        username: savedUsername
      }));
    }

    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [dispatch]);

  if (!isInitialized) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* User Routes */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/joinquiz" element={<ProtectedRoute><JoinQuiz /></ProtectedRoute>} />
      <Route path="/play-quiz/:id" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />

      {/* Admin Dashboard */}
      <Route path="/admin-dashboard" element={
        <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<AdminWelcome />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="custom-quiz" element={<CustomQuiz />} />
        <Route path="feedback" element={<AdminFeedbackSection />} />
      </Route>

      {/* Superadmin Dashboard */}
      <Route path="/superadmin-dashboard" element={
        <ProtectedRoute allowedRoles={["superadmin"]}>
          <SuperadminDashboard />
        </ProtectedRoute>
      }>
        <Route index element={<SuperadminWelcome />} />
        <Route path="dashboard-section" element={<DashboardSection />} />
        <Route path="admin-requests" element={<AdminRequestsSection />} />
        <Route path="registered-users" element={<UserDetailsSection />} />
        <Route path="approved-admins" element={<ApprovedAdminsSection />} />
        <Route path="custom-quiz-list" element={<CustomQuizList />} />
        <Route path="custom-quiz" element={<CustomQuiz />} />
        <Route path="custom-quiz/:id" element={<CustomQuiz />} />


      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

// ✅ Main App Component
function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRouter />
      </Router>
    </Provider>
  );
}

export default App;
