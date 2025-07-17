import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendOtp,
  verifyOtpAndRegister,
  clearError,
  clearMessage,
  setTempUserData
} from '../store/slices/authslice';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [requestAdmin, setRequestAdmin] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, message, showOtpStep } = useSelector((state) => state.auth);

  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  // Show popup
  const showBottomPopup = (msg) => {
    setPopupMessage(msg);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  useEffect(() => {
    if (message) {
      showBottomPopup(message);
      dispatch(clearMessage());
    }
    if (error) {
      showBottomPopup(`❌ ${error}`);
      dispatch(clearError());
    }
  }, [message, error, dispatch]);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      showBottomPopup('❌ Please fill in all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showBottomPopup('❌ Invalid email format');
      return;
    }

    dispatch(setTempUserData({ username, email, password, requestAdmin }));
    const result = await dispatch(sendOtp({ username, email, password }));
    if (result.type === 'auth/sendOtp/fulfilled') {
      setOtpTimer(300);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showBottomPopup('❌ Please enter a valid 6-digit OTP');
      return;
    }

    const result = await dispatch(verifyOtpAndRegister({ email, otp, requestAdmin }));
    if (result.type === 'auth/verifyOtpAndRegister/fulfilled') {
      showBottomPopup('✅ Registration successful! Redirecting...');
      setUsername('');
      setEmail('');
      setPassword('');
      setOtp('');
      setRequestAdmin(false);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      showBottomPopup(`❌ ${result.payload || 'Registration failed'}`);
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    const result = await dispatch(sendOtp({ username, email, password }));
    if (result.type === 'auth/sendOtp/fulfilled') {
      setOtp('');
      setOtpTimer(300);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-[#443d67] to-[#696969] flex items-center justify-center">
     <div className="bg-gradient-to-b from-[#443d67] to-[#696969] rounded-xl px-10 py-10 w-[360px] shadow-[0_12px_24px_rgba(0,0,0,0.2)] text-center relative border border-white/20 backdrop-blur-sm">

        <div className="absolute top-10 left-0 h-6 w-1 bg-blue-600 rounded-r-md"></div>
       <h2 className="text-xl font-semibold text-black mb-6">Register</h2>

    {!showOtpStep ? (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md"
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md"
          required
        />
        <div className="flex justify-start items-center text-sm gap-2">
          <input
            type="checkbox"
            checked={requestAdmin}
            onChange={(e) => setRequestAdmin(e.target.checked)}
            className="h-4 w-4"
          />
          <label className="text-gray-800">Request Admin Access</label>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700"
        >
          {isLoading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </form>
    ) : (
      <form onSubmit={handleVerifyOtp} className="space-y-4">
        <div className="bg-gray-100 text-sm text-gray-800 p-4 border-l-4 border-blue-600 rounded-md">
          <p>
            📧 OTP sent to:{' '}
            <strong className="text-blue-600">{email}</strong>
          </p>
          <p>Enter the 6-digit OTP to complete registration</p>
        </div>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
          }
          maxLength={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-md text-center font-mono tracking-widest text-lg"
          required
        />
        <div className="text-sm">
          {otpTimer > 0 ? (
            <p>
              OTP expires in:{' '}
              <span className="text-green-600 font-semibold font-mono">
                {formatTime(otpTimer)}
              </span>
            </p>
          ) : (
            <p className="text-red-600 font-bold">OTP expired</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || otpTimer === 0}
          className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700"
        >
          {isLoading ? 'Verifying...' : 'Verify OTP & Register'}
        </button>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={otpTimer > 0 || isLoading}
          className={`w-full py-2 rounded-md font-semibold ${
            otpTimer > 0
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-800'
          }`}
        >
          {otpTimer > 0 ? `Resend in ${formatTime(otpTimer)}` : 'Resend OTP'}
        </button>
      </form>
    )}

    <p className="mt-6 text-sm text-gray-700">
      Already have an account?{' '}
      <Link to="/login" className="text-black underline font-semibold">
        Login
      </Link>
    </p>

    {showPopup && (
      <div
        className={`fixed bottom-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full text-white text-sm font-medium shadow-lg z-[9999] animate-slideUp max-w-[90%] ${
          popupMessage.startsWith('❌') ? 'bg-[#721c24]' : 'bg-[#155724]'
        }`}
      >
        {popupMessage}
      </div>
    )}
  </div>
</div>

  );
};

export default Register;
