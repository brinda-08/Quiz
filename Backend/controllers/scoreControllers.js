import Score from "../models/score.js";
import Quiz from "../models/quiz.js";

// POST  /api/scores  – save one attempt
export const saveScore = async (req, res) => {
  const { username, quizId, score } = req.body;
  if (!username || !quizId || score == null)
    return res.status(400).json({ error: "Missing username / quizId / score" });

  try {
    const saved = await Score.create({ username, quizId, score });
    res.status(201).json(saved);   // send the new document back
  } catch (err) {
    console.error("❌ saveScore:", err);
    res.status(500).json({ error: "DB insert failed" });
  }
};

// GET  /api/scores/leaderboard
export const getLeaderboard = async (_req, res) => {
  try {
    const rows = await Score.find()
      .sort({ score: -1, createdAt: 1 })   // best score first, earliest tie-break
      .limit(20)
      .populate("quizId", "title");        // fetch title from Quiz model

    const formatted = rows.map(r => ({
      username:  r.username,
      score:     r.score,
      quizTitle: r.quizId?.title || "Unknown"
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
