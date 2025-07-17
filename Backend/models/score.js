// models/Score.js
import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  score: { type: Number, required: true },
  quizId   : { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Score || mongoose.model("Score", scoreSchema);
