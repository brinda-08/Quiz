import Leaderboard from '../models/leaderboard.js';

export const submitScore = async (req, res) => {
  const { username, score } = req.body;
  if (!username || score == null) {
    return res.status(400).json({ error: 'Username or score missing' });
  }

  try {
    const entry = new Leaderboard({ username, score });
    await entry.save();
    res.status(200).json({ message: '✅ Score saved to leaderboard' });
  } catch (err) {
    console.error('❌ Error saving to leaderboard:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
};
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find().sort({ score: -1 }).limit(10);
    res.status(200).json(leaderboard);
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};