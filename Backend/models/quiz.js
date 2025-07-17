import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  questions: [
    {
      text:    { type: String, required: true },   // ← must match frontend
      options: [{ type: String, required: true }],
      correct: { type: Number, required: true },   // index of right option
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
