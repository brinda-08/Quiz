// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex min-h-screen w-full font-sans text-white relative">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} />

      {/* Toggle Button (always visible) */}
      <button
        className="fixed top-4 left-4 z-[1001] bg-gradient-to-br from-[#1a1f2e] to-[#0a0e1a] text-white border border-white/10 rounded-md px-4 py-2 text-xl shadow-md hover:from-[#2a2f3e] hover:to-[#1a1e2a] active:translate-y-0 transition"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile only */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen flex flex-col justify-start overflow-y-auto px-4 md:px-8 transition-all duration-300 ease-in-out
          ${sidebarOpen && !isMobile ? 'ml-[250px]' : 'ml-0'} 
          bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700`}
      >
        <Outlet />
      </main>
    </div>
  );
}
