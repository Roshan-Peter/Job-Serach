import mongoose from 'mongoose';

const userJobSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  company:     { type: String, required: true, trim: true },
  location:    { type: String, default: '',   trim: true },
  type:        { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'], default: 'Full-time' },
  startDate:   { type: String, required: true },
  endDate:     { type: String, default: null },
  isCurrent:   { type: Boolean, default: false },
  description: { type: String, default: '' },
  createdAt:   { type: Date, default: Date.now },
});

export default mongoose.models.UserJob || mongoose.model('UserJob', userJobSchema);