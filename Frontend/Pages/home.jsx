import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetAuth } from "../store/slices/authslice";

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const username = sessionStorage.getItem("username") || "User";

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    dispatch(resetAuth());
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#5c5d9d] to-[#673d83] relative p-5">
      {/* Header */}
      <div className="absolute top-5 right-8 flex items-center gap-4 z-10">
        <span className="text-white font-semibold text-sm">
          Hello, {username}!
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:opacity-85 text-white font-bold py-1.5 px-4 rounded-md transition-opacity"
        >
          Logout
        </button>
      </div>

      {/* Centered Content */}
      <div className="m-auto max-w-3xl bg-white/5 p-10 md:p-16 rounded-2xl text-center shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">
          Welcome to Quiz App
        </h1>
        <div className="flex justify-center gap-6 flex-wrap">
          <button
            onClick={() => navigate("/joinquiz")}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold text-lg py-3 px-6 rounded-lg transition"
          >
            Join Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
