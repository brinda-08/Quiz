import PendingAdmin from "../models/PendingAdmin.js";
import User from "../models/auth.js";
import Score from "../models/score.js";

// GET all pending admin requests
export const getPending = async (req, res) => {
  try {
    const pending = await PendingAdmin.find();
    res.status(200).json(pending);
  } catch (err) {
    console.error("❌ Error fetching pending:", err.message);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
};

// Approve a pending admin
export const approveAdmin = async (req, res) => {
  try {
    const pending = await PendingAdmin.findById(req.params.id);
    if (!pending) return res.status(404).json({ error: "Not found" });

    const exists = await User.findOne({ username: pending.username });
    if (exists) return res.status(409).json({ error: "Already exists" });

    const newAdmin = new User({
      username: pending.username,
      password: pending.password, // already hashed
      role: "admin",
    });

    await newAdmin.save();
    await PendingAdmin.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "✅ Admin approved" });
  } catch (err) {
    console.error("❌ Approve error:", err.message);
    res.status(500).json({ error: "Approval failed" });
  }
};

// Reject a pending admin
export const rejectAdmin = async (req, res) => {
  try {
    const deleted = await PendingAdmin.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ message: "❌ Admin request rejected" });
  } catch (err) {
    console.error("❌ Reject error:", err.message);
    res.status(500).json({ error: "Rejection failed" });
  }
};

// Get all users + their scores
export const getAllUsersAndAdmins = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("username email");
    const admins = await User.find({ role: "admin" }).select("username");

    const allScores = await Score.find().populate("quizId", "title");

    const enrichedUsers = users.map(user => {
      const userScores = allScores
        .filter(score => score.username === user.username)
        .map(score => ({
          quizId: score.quizId._id,
          title: score.quizId.title,
          score: score.score,
        }));
      return {
        username: user.username,
        email: user.email,
        scores: userScores,
      };
    });

    res.status(200).json({ users: enrichedUsers, admins });
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch users/admins" });
  }
};
