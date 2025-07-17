import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  sendOtp,
  verifyOtpAndLogin,
  clearError,
  clearMessage,
  setTempUserData,
  setAuthState
} from '../store/slices/authslice';

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [errorPopup, setErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error, message, showOtpStep, token, role, tempUserData } = useSelector((state) => state.auth);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  useEffect(() => {
    if (token && role && isAuthenticating) {
      setTimeout(() => {
        setIsAuthenticating(false);
        if (role === 'superadmin') {
          navigate('/superadmin-dashboard');
        } else if (role === 'admin') {
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    }
  }, [token, role, isAuthenticating, navigate]);

  useEffect(() => {
    if (message) {
      showError(message);
      dispatch(clearMessage());
    }
    if (error) {
      showError(`❌ ${error}`);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  const handleInitialLogin = async (e) => {
    e.preventDefault();

    if (!emailOrUsername || !password) {
      showError("⚠️ Please fill in all fields");
      return;
    }

    setIsAuthenticating(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.role === 'admin' || data.role === 'superadmin') {
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("username", data.username);
          sessionStorage.setItem("role", data.role);

          dispatch(setAuthState({
            token: data.token,
            username: data.username,
            role: data.role,
            email: data.email
          }));

          showError("✅ Admin login successful! Redirecting...");
        } else {
          dispatch(setTempUserData({ username: data.username, email: data.email }));
          const otpResult = await dispatch(sendOtp({
            username: data.username,
            email: data.email,
            password,
            purpose: 'login'
          }));
          if (otpResult.type === 'auth/sendOtp/fulfilled') {
            setOtpTimer(300);
            showError("📧 OTP sent to your registered email");
            setIsAuthenticating(false);
          } else {
            setIsAuthenticating(false);
          }
        }
      } else {
        showError(data.error || data.message || "❌ Login failed");
        setIsAuthenticating(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("❌ Server error. Please try again later.");
      setIsAuthenticating(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showError('❌ Please enter a valid 6-digit OTP');
      return;
    }
    setIsAuthenticating(true);
    const result = await dispatch(verifyOtpAndLogin({
      username: tempUserData?.username || emailOrUsername,
      otp
    }));

    if (result.type === 'auth/verifyOtpAndLogin/fulfilled') {
      showError('✅ Login successful! Redirecting...');
    } else {
      setIsAuthenticating(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;

    const email = tempUserData?.email;
    const username = tempUserData?.username;

    if (!email || !username) {
      showError('❌ Session expired. Please login again.');
      return;
    }

    const result = await dispatch(sendOtp({
      username,
      email,
      password,
      purpose: 'login'
    }));

    if (result.type === 'auth/sendOtp/fulfilled') {
      setOtpTimer(300);
      setOtp('');
    }
  };

  const showError = (message) => {
    setErrorMessage(message);
    setErrorPopup(true);
    setTimeout(() => {
      setErrorPopup(false);
      setErrorMessage("");
    }, 3000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
   <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-[#443d67] to-[#696969] font-['Poppins'] relative z-[1]">
    
    {/* Login Card Container */}
    <div className="relative p-8 w-80 text-center rounded-2xl bg-white/15 backdrop-blur-[15px] border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
      
      {/* Blue vertical accent bar */}
      <div className="absolute top-6 left-6 w-1 h-12 bg-blue-500 rounded-full"></div>

      <h2 className="text-2xl font-bold mb-6 text-white ml-4 text-left">
        Login
      </h2>

      {!showOtpStep ? (
        <form onSubmit={handleInitialLogin}>
          {/* Username/Email input */}
          <div className="mb-4 text-left">
            <input
              type="text"
              placeholder="Email or Username"
              required
              className="w-full px-4 py-3 rounded-lg text-sm bg-white/95 text-gray-700 border-none outline-none"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              disabled={isAuthenticating}
            />
            <p className="text-xs mt-1 ml-1 text-white/80">
              Using username
            </p>
          </div>
          
          {/* Password input */}
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-4 py-3 rounded-lg text-sm bg-white/95 text-gray-700 border-none outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isAuthenticating}
            />
          </div>
          
          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || isAuthenticating}
            className="w-full py-3 rounded-lg font-semibold text-base transition-all duration-200 bg-red-500 hover:bg-red-600 text-white border-none outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading || isAuthenticating ? 'Verifying...' : 'Login'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="p-4 rounded-lg mb-4 text-left bg-white/10">
            <p className="text-sm mb-1 text-white">
              📧 OTP sent to: <strong>{tempUserData?.email}</strong>
            </p>
            <p className="text-sm text-white/80">
              Enter the 6-digit OTP
            </p>
          </div>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 rounded-lg mb-4 bg-white/95 text-gray-700 border-none outline-none text-center text-lg tracking-[0.2em] font-mono font-bold"
            maxLength="6"
            required
            disabled={isAuthenticating}
          />
          <div className="text-sm mb-4 text-white">
            {otpTimer > 0 ? (
              <p>OTP expires in: <span className="text-green-400 font-mono font-bold">{formatTime(otpTimer)}</span></p>
            ) : (
              <p className="text-red-400 font-semibold">OTP expired</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || otpTimer === 0 || isAuthenticating}
            className="w-full py-3 rounded-lg font-semibold mb-3 transition-all duration-200 bg-red-500 text-white border-none outline-none disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading || isAuthenticating ? 'Verifying...' : 'Verify OTP & Login'}
          </button>
          <button
            type="button"
            className="w-full py-3 rounded-lg font-semibold transition-all duration-200 border-none outline-none disabled:cursor-not-allowed"
            style={{
              backgroundColor: otpTimer > 0 || isLoading || isAuthenticating ? '#9CA3AF' : '#6B7280',
              color: otpTimer > 0 || isLoading || isAuthenticating ? '#D1D5DB' : 'white',
            }}
            onClick={handleResendOtp}
            disabled={otpTimer > 0 || isLoading || isAuthenticating}
          >
            {otpTimer > 0 ? `Resend in ${formatTime(otpTimer)}` : 'Resend OTP'}
          </button>
        </form>
      )}

      <p className="text-sm mt-6 text-white/80">
        Don't have an account?
        <Link 
          to="/register" 
          className="underline ml-1 transition-colors duration-200 text-blue-400 hover:text-blue-300"
        >
          Register
        </Link>
      </p>
    </div>

    {/* Error Popup */}
    {errorPopup && (
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-sm z-50 bg-red-900/90 backdrop-blur-[8px] text-white border border-red-500/50 shadow-lg">
        {errorMessage}
      </div>
    )}
  </div>
); // <--- Added the missing closing parenthesis and curly brace for the return statement

} // <--- Added the missing closing curly brace for the function Login()

export default Login;