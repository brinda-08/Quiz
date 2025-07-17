import express from "express";
import dotenv   from "dotenv";
import mongoose from "mongoose";
import cors     from "cors";
import http     from "http";
import { Server } from "socket.io";
import emailService from "./utils/emailService.js"; 
import nodemailer from "nodemailer";
import authRoutes        from "./routes/auth.js";
import quizRoutes        from "./routes/quiz.js";     
import leaderboardRoutes from "./routes/leaderboard.js";
import adminRoutes       from "./routes/admin.js";
import superadminRoutes  from "./routes/superadmin.js";
import scoreRoutes       from "./routes/scoreRoutes.js";  
import otpRoutes from './routes/otpRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();
console.log("ENV CHECK:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASSWORD,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT
});

const app  = express();
const PORT = process.env.PORT || 5000;
app.use((req, res, next) => {
  if (req.url.includes('/subscribe')) {
    req.headers['x-no-compression'] = true;
  }
  next();
});


/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- MongoDB ---------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

/* ---------- Root ---------- */
app.get("/", (_req, res) =>
  res.send("🎉 API is running. Try POST /api/auth/login, etc.")
);

/* ---------- API Routes ---------- */
app.use("/api/auth",        authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/quizzes",     quizRoutes);       
app.use("/api/scores",      scoreRoutes);      
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/superadmin",  superadminRoutes);
app.use('/api/otp', otpRoutes);
app.use("/api/email", emailService);
app.use('/api/feedback', feedbackRoutes);
/* ---------- 404 fallback ---------- */
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

/* ---------- WebSocket ---------- */
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
io.on("connection", socket => {
  console.log(`🔌 WebSocket connected: ${socket.id}`);
  socket.on("disconnect", () =>
    console.log(`❌ WebSocket disconnected: ${socket.id}`)
  );
});
// make io available in controllers via req.app.get('io')
app.set("io", io);

/* ---------- Start ---------- */
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
export default app;