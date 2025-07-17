import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { resetAuth } from "../store/slices/authslice";

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    setUsername(sessionStorage.getItem('username') || '');
    setRole(sessionStorage.getItem('role') || '');
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    dispatch(resetAuth());
    navigate("/login");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full z-[1000] bg-gradient-to-br from-[#0a0e1a] to-[#1a1f2e] text-white transition-all duration-300 shadow-2xl border-r border-white/10
      flex flex-col ${isOpen ? 'w-[250px]' : 'w-[60px]'} overflow-hidden`}
    >
      {/* Sidebar Header */}
      <div className="p-5 border-b border-white/10 text-center">
        {isOpen && (
          <>
            <h2 className="text-xl font-semibold">Admin Panel</h2>
            <div className="mt-2 text-sm">
              <div className="text-blue-400 font-medium">👤 {username}</div>
              <div className="text-blue-300 uppercase tracking-widest text-xs">{role}</div>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 py-4">
        <button
          onClick={() => navigate('/admin-dashboard/leaderboard')}
          className="flex items-center gap-2 px-5 py-3 hover:bg-blue-400/10 hover:text-blue-300 transition-all duration-150 text-left"
          title="Leaderboard"
        >
          📊 <span className={`${!isOpen && 'hidden'} transition-all`}>Leaderboard</span>
        </button>

        <button
          onClick={() => navigate('/admin-dashboard/custom-quiz')}
          className="flex items-center gap-2 px-5 py-3 hover:bg-blue-400/10 hover:text-blue-300 transition-all duration-150 text-left"
          title="Custom Quiz"
        >
          🛠️ <span className={`${!isOpen && 'hidden'} transition-all`}>Custom Quiz</span>
        </button>

        {/* ➕ New Feedback Option */}
        <button
          

          onClick={() => navigate('/admin-dashboard/feedback')}
          className="flex items-center gap-2 px-5 py-3 hover:bg-blue-400/10 hover:text-blue-300 transition-all duration-150 text-left"
          title="Feedback"
        >
          📝 <span className={`${!isOpen && 'hidden'} transition-all`}>Feedback</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 mt-auto hover:bg-red-400/20 hover:text-red-400 transition-all duration-150 text-left"
          title={!isOpen ? 'Logout' : ''}
        >
          🚪 <span className={`${!isOpen && 'hidden'} transition-all`}>Logout</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
