import mongoose from 'mongoose';

const pendingAdminSchema = new mongoose.Schema({
  username: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('PendingAdmin', pendingAdminSchema);
