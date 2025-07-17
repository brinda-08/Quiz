import Feedback from '../models/Feedback.js';

// Create new feedback
export const createFeedback = async (req, res) => {
  try {
    const { username, message, quizTitle } = req.body;

    if (!username || !message) {
      return res.status(400).json({ error: 'Username and message are required.' });
    }

    const feedback = new Feedback({ username, message, quizTitle });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Error submitting feedback' });
  }
};

// Get all feedback
export const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
};

// Update a feedback entry
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Updated message is required.' });
    }

    await Feedback.findByIdAndUpdate(id, { message });
    res.json({ message: 'Feedback updated' });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
};

// Delete a feedback entry
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.json({ message: 'Feedback deleted' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
};
export const getFeedbackByQuizTitle = async (req, res) => {
  const { quizTitle } = req.params;
  const feedback = await Feedback.find({ quizTitle });
  res.status(200).json(feedback);
};

