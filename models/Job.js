import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  company:        { type: String, required: true, trim: true },
  location:       { type: String, required: true, trim: true },
  type:           { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'], required: true },
  experience:     { type: String, enum: ['Entry level', 'Mid level', 'Senior level', 'Manager', 'Director'], required: true },
  salary: {
    min:          { type: Number, default: null },
    max:          { type: Number, default: null },
    currency:     { type: String, default: 'USD' },
    period:       { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' },
  },
  description:    { type: String, required: true },
  requirements:   [{ type: String }],
  skills:         [{ type: String }],
  applyType:      { type: String, enum: ['easy_apply', 'external'], required: true },
  externalUrl:    { type: String, default: null },  // only if applyType = external
  postedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive:       { type: Boolean, default: true },
  createdAt:      { type: Date, default: Date.now },
});

export default mongoose.models.Job || mongoose.model('Job', jobSchema);