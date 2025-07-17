import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  quizTitle: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
