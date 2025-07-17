import Quiz  from "../models/quiz.js";
import Score from "../models/score.js";
import User from "../models/user.js";   // <-- for submitScore

/* ------------------------------------------------------------------
   ①  CREATE a quiz  ── POST  /api/quizzes
------------------------------------------------------------------ */
export const createQuiz = async (req, res) => {
  const { title, questions } = req.body;

  if (!title || !Array.isArray(questions) || !questions.length) {
    return res.status(400).json({ error: "Missing or invalid title/questions" });
  }

  try {
    // questions already have text / options / correctIndex (or correct) – save as-is
    const quiz = new Quiz({ title, questions });
    await quiz.save();
    res.status(201).json({ message: "✅ Custom quiz created", quizId: quiz._id });
  } catch (err) {
    console.error("❌ Error creating quiz:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

/* ------------------------------------------------------------------
   ②  LIST all quizzes  ── GET  /api/quizzes
------------------------------------------------------------------ */
export const getAllQuizzes = async (_req, res) => {
  try {
    // return title and number-of-questions for quick list rendering
    const list = await Quiz.find({}, { title: 1, questions: 1 }).sort({ createdAt: -1 });
    res.json(list.map(q => ({ _id: q._id, title: q.title, questions: q.questions })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};

/* ------------------------------------------------------------------
   ③  READ one quiz by ID ── GET  /api/quizzes/:id
------------------------------------------------------------------ */
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
};

/* ------------------------------------------------------------------
   ④  UPDATE a quiz  ── PUT  /api/quizzes/:id
------------------------------------------------------------------ */
export const updateQuiz = async (req, res) => {
  try {
    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: "Quiz not found" });
    res.json({ message: "✅ Quiz updated", updated });
  } catch (err) {
    console.error("❌ Error updating quiz:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

/* ------------------------------------------------------------------
   ⑤  DELETE a quiz  ── DELETE  /api/quizzes/:id
------------------------------------------------------------------ */
export const deleteQuiz = async (req, res) => {
  try {
    const deleted = await Quiz.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Quiz not found" });
    res.json({ message: "🗑️ Quiz deleted" });
  } catch (err) {
    console.error("❌ Error deleting quiz:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
};

/* ------------------------------------------------------------------
   ⑥  (optional) SUBMIT a score ── POST  /api/quizzes/submit-score
------------------------------------------------------------------ */ // ← Import your User model too

export const submitScore = async (req, res) => {
  const { quizId, score } = req.body;

  // ✅ Use authenticated user from middleware
  const userId = req.user.id;

  if (!quizId || score == null) {
    return res.status(400).json({ error: "Missing quizId or score" });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    // ✅ Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Save to Score collection (optional)
    await new Score({
      username: user.username,
      quizId,
      score
    }).save();

    // ✅ Push to User model
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          scores: {
            quizId,
            title: quiz.title,
            score
          }
        }
      }
    );

    res.json({ message: "✅ Score submitted successfully" });

  } catch (err) {
    console.error("❌ Error submitting score:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
