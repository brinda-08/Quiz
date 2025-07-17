import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user.js';
import PendingAdmin from '../models/PendingAdmin.js';
import { sendOTPEmail } from '../utils/emailService.js';

dotenv.config();

// 🔐 Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Traditional Registration
export const register = async (req, res) => {
  try {
    const { username, password, requestAdmin } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    const pendingUser = await PendingAdmin.findOne({ username });

    if (existingUser || pendingUser) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (requestAdmin) {
      const pending = new PendingAdmin({ username, password: hashedPassword });
      await pending.save();
      return res.status(200).json({ message: '🟡 Admin access request sent to Superadmin' });
    } else {
      const user = new User({ username, password: hashedPassword, role: 'user' });
      await user.save();
      return res.status(201).json({ message: '✅ Registered successfully' });
    }

  } catch (err) {
    console.error('❌ Registration error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

// ✅ Updated Login - handles both email/username and OTP verification
export const login = async (req, res) => {
  try {
    const { username, password, emailOrUsername } = req.body;

    // Handle legacy username/password format
    const loginIdentifier = emailOrUsername || username;
    
    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    // Check for superadmin login
    if (
      loginIdentifier === process.env.SUPERADMIN_USERNAME &&
      password === process.env.SUPERADMIN_PASSWORD
    ) {
      const token = jwt.sign(
        { 
          role: 'superadmin',
          username: process.env.SUPERADMIN_USERNAME 
        }, 
        process.env.JWT_SECRET, 
        { expiresIn: '2h' }
      );
      return res.status(200).json({ 
        token, 
        role: 'superadmin', 
        username: process.env.SUPERADMIN_USERNAME,
        message: 'Superadmin login successful' 
      });
    }

    // Find user by either email or username
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is admin or superadmin
    if (user.role === 'admin' || user.role === 'superadmin') {
      // Generate JWT token for admin/superadmin
      const token = jwt.sign(
        { 
          userId: user._id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Return complete login data for admin/superadmin
      return res.json({
        token,
        username: user.username,
        email: user.email,
        role: user.role,
        userId: user._id,
        message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} login successful`
      });
    } else {
      // Regular user - return data for OTP verification
      return res.json({
        username: user.username,
        email: user.email,
        role: user.role,
        userId: user._id,
        message: 'User found, please verify OTP'
      });
    }

  } catch (err) {
    console.error('❌ Login error:', err.message);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

// ✅ Send OTP for login or registration
export const sendOtp = async (req, res) => {
  try {
    const { username, email, password, purpose } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (purpose === 'login') {
      // For login, user must already exist
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update existing user with OTP
      existingUser.otpCode = otpCode;
      existingUser.otpExpires = otpExpires;
      await existingUser.save();
      
      await sendOTPEmail(existingUser.email, otpCode, existingUser.username);
    } else {
      // For registration
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(password, 10);

        await new User({
          username,
          email,
          password: hashedPassword,
          otpCode,
          otpExpires,
          isEmailVerified: false,
          role: "user",
        }).save();
      } else {
        existingUser.otpCode = otpCode;
        existingUser.otpExpires = otpExpires;
        await existingUser.save();
      }
      
      await sendOTPEmail(email, otpCode, existingUser?.username || email.split("@")[0]);
    }

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("sendOtp error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ✅ Verify OTP for login or registration
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP data
    user.otpCode = null;
    user.otpExpires = null;
    user.isEmailVerified = true;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        score: user.score,
        isEmailVerified: user.isEmailVerified,
      }
    });

  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};
export const verifyOtpLogin = async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({ error: "Username and OTP are required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP data
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      username: user.username,
      email: user.email,
      role: user.role,
      userId: user._id
    });

  } catch (err) {
    console.error("verifyOtpLogin error:", err);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};
// Add this new endpoint to your auth controller

// Add this NEW function to your auth controller (don't modify the existing verifyOtp)

export const verifyOtpAndRegister = async (req, res) => {
  try {
    console.log('verifyOtpAndRegister called with:', req.body);
    const { email, otp, requestAdmin } = req.body;

    if (!email || !otp) {
      console.log('Missing email or OTP');
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ error: "User not found" });
    }

    console.log('User OTP:', user.otpCode, 'Provided OTP:', otp);
    console.log('OTP expires:', user.otpExpires, 'Current time:', new Date());

    if (user.otpCode !== otp || new Date() > user.otpExpires) {
      console.log('Invalid or expired OTP');
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP data
    user.otpCode = null;
    user.otpExpires = null;
    user.isEmailVerified = true;

    console.log('Request admin:', requestAdmin);

    // Handle admin request during registration
    if (requestAdmin) {
      console.log('Creating pending admin request...');
      
      try {
        const pendingAdmin = new PendingAdmin({
          username: user.username,
          email: user.email,
          password: user.password
        });
        await pendingAdmin.save();
        console.log('Pending admin saved');
        
        // Remove from regular users
        await User.deleteOne({ _id: user._id });
        console.log('User removed from regular users');
        
        return res.status(200).json({
          message: "Registration successful! Admin access request sent to Superadmin.",
          success: true,
          isRegistration: true
        });
      } catch (adminError) {
        console.error('Error creating pending admin:', adminError);
        return res.status(500).json({ error: "Error processing admin request" });
      }
    } else {
      console.log('Saving regular user...');
      try {
        await user.save();
        console.log('User saved successfully');
        
        return res.status(200).json({
          message: "Registration successful! You can now login.",
          success: true,
          isRegistration: true
        });
      } catch (saveError) {
        console.error('Error saving user:', saveError);
        return res.status(500).json({ error: "Error completing registration" });
      }
    }

  } catch (err) {
    console.error("verifyOtpAndRegister error:", err);
    return res.status(500).json({ error: "Server error during registration" });
  }
};
