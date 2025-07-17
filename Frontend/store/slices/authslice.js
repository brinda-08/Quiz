import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ✅ Initialize state from sessionStorage
const getInitialState = () => {
  try {
    const savedToken = sessionStorage.getItem("token");
    const savedUsername = sessionStorage.getItem("username");
    const savedRole = sessionStorage.getItem("role");

    if (savedToken && savedUsername && savedRole) {
      return {
        token: savedToken,
        username: savedUsername,
        role: savedRole,
        email: null,
        isLoading: false,
        error: null,
        message: null,
        showOtpStep: false,
        tempUserData: null,
        isAuthenticated: true
      };
    }
  } catch (error) {
    console.error('Error reading from sessionStorage:', error);
    sessionStorage.clear();
  }

  return {
    token: null,
    username: null,
    role: null,
    email: null,
    isLoading: false,
    error: null,
    message: null,
    showOtpStep: false,
    tempUserData: null,
    isAuthenticated: false
  };
};

const initialState = getInitialState();

// ✅ Async Thunks

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async ({ username, email, password, purpose }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, purpose })
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'Failed to send OTP');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const verifyOtpAndLogin = createAsyncThunk(
  'auth/verifyOtpAndLogin',
  async ({ username, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, otp })
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'OTP verification failed');
      }

      // ✅ Save auth info to sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("role", data.role);

      return data;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

export const verifyOtpAndRegister = createAsyncThunk(
  'auth/verifyOtpAndRegister',
  async ({ email, otp, requestAdmin }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, requestAdmin })
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.error || 'OTP verification failed');
      }

      return data;
    } catch (error) {
      return rejectWithValue('Network error');
    }
  }
);

// ✅ Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState: (state, action) => {
      const { token, username, role, email } = action.payload;
      state.token = token;
      state.username = username;
      state.role = role;
      state.email = email;
      state.isAuthenticated = !!token;
    },
    setTempUserData: (state, action) => {
      state.tempUserData = action.payload;
      state.showOtpStep = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    resetAuth: (state) => {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('role');

      state.token = null;
      state.username = null;
      state.role = null;
      state.email = null;
      state.isAuthenticated = false;
      state.showOtpStep = false;
      state.tempUserData = null;
      state.error = null;
      state.message = null;
      state.isLoading = false;
    },
    initializeAuth: (state) => {
      try {
        const savedToken = sessionStorage.getItem("token");
        const savedUsername = sessionStorage.getItem("username");
        const savedRole = sessionStorage.getItem("role");

        if (savedToken && savedUsername && savedRole) {
          state.token = savedToken;
          state.username = savedUsername;
          state.role = savedRole;
          state.isAuthenticated = true;
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        state.showOtpStep = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 🔄 Verify OTP and Login
      .addCase(verifyOtpAndLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpAndLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.username = action.payload.username;
        state.role = action.payload.role;
        state.email = action.payload.email;
        state.isAuthenticated = true;
        state.showOtpStep = false;
        state.tempUserData = null;
        state.message = 'Login successful!';
      })
      .addCase(verifyOtpAndLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 🔄 Verify OTP and Register
      .addCase(verifyOtpAndRegister.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpAndRegister.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload.message;
        state.showOtpStep = false;
        state.tempUserData = null;
      })
      .addCase(verifyOtpAndRegister.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setAuthState,
  setTempUserData,
  clearError,
  clearMessage,
  resetAuth,
  initializeAuth
} = authSlice.actions;

export default authSlice.reducer;
