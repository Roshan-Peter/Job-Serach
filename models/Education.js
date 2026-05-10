import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  school:    { type: String, required: true, trim: true },
  degree:    { type: String, required: true, trim: true },
  field:     { type: String, default: '',   trim: true },
  startYear: { type: String, default: '' },
  endYear:   { type: String, default: '' },
  grade:     { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Education || mongoose.model('Education', educationSchema);