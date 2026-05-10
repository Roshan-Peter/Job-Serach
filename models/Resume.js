import mongoose from 'mongoose';

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  title: {
    type: String,
    default: 'My Resume',
    trim: true,
  },

  summary: {
    type: String,
    default: '',
  },

  skills: [
    {
      type: String,
    },
  ],

  experience: [
    {
      company: String,
      role: String,
      startDate: String,
      endDate: String,
      description: String,
    },
  ],

  education: [
    {
      institution: String,
      degree: String,
      year: String,
    },
  ],

  projects: [
    {
      name: String,
      description: String,
      link: String,
    },
  ],

  contact: {
    phone: String,
    email: String,
    website: String,
    location: String,
  },

  isPublic: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Resume || mongoose.model('Resume', ResumeSchema);
