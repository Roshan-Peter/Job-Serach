import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  company:     { type: String, required: true, trim: true },
  location:    { type: String, default: '',   trim: true },
  startDate:   { type: String, required: true },
  endDate:     { type: String, default: null },
  isCurrent:   { type: Boolean, default: false },
  description: { type: String, default: '', trim: true },
  createdAt:   { type: Date, default: Date.now },
});

export default mongoose.models.Experience || mongoose.model('Experience', experienceSchema);