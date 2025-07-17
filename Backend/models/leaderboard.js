// models/leaderboard.js
import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },     // ✅ username field
    score:    { type: Number, required: true },     // ✅ score field
  },
  { versionKey: false }  // optional: removes __v
);
export default mongoose.model('Leaderboard', leaderboardSchema);
