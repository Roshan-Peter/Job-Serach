import Profile    from '../models/Profile.js';
import Experience from '../models/Experience.js';
import Education  from '../models/Education.js';
import UserJob    from '../models/UserJob.js';

export default class ProfileService {

  // ─── profile ──────────────────────────────────────────────────────────────
  static async getOrCreate(userId) {
    let profile = await Profile.findOne({ userId });
    if (!profile) profile = await Profile.create({ userId });
    return profile;
  }


    static async getById(userId) {
    let profile = await Profile.findOne({ userId });
    return profile;
  }

  static async updateProfile(userId, data) {
    const allowed = ['headline', 'bio', 'location', 'website', 'phone', 'skills'];
    const update  = {};
    allowed.forEach(k => { if (data[k] !== undefined) update[k] = data[k]; });

    // skills comes as comma-separated string from form
    if (typeof update.skills === 'string') {
      update.skills = update.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    return Profile.findOneAndUpdate(
      { userId },
      { ...update, updatedAt: new Date() },
      { new: true, upsert: true }
    );
  }

  // ─── full profile (all tables joined) ────────────────────────────────────
  static async getFullProfile(userId) {
    const [profile, experience, education, jobs] = await Promise.all([
      Profile.findOne({ userId }),
      Experience.find({ userId }).sort({ startDate: -1 }),
      Education.find({ userId }).sort({ startYear: -1 }),
      UserJob.find({ userId }).sort({ startDate: -1 }),
    ]);
    return { profile, experience, education, jobs };
  }

  // ─── experience ───────────────────────────────────────────────────────────
  static async addExperience(userId, data) {
    return Experience.create({ userId, ...data });
  }

  static async updateExperience(id, userId, data) {
    const exp = await Experience.findOne({ _id: id, userId });
    if (!exp) {
      const err = new Error('Experience not found');
      err.status = 404;
      throw err;
    }
    Object.assign(exp, data);
    return exp.save();
  }

  static async deleteExperience(id, userId) {
    const exp = await Experience.findOneAndDelete({ _id: id, userId });
    if (!exp) {
      const err = new Error('Experience not found');
      err.status = 404;
      throw err;
    }
    return exp;
  }

  // ─── education ────────────────────────────────────────────────────────────
  static async addEducation(userId, data) {
    return Education.create({ userId, ...data });
  }

  static async updateEducation(id, userId, data) {
    const edu = await Education.findOne({ _id: id, userId });
    if (!edu) {
      const err = new Error('Education not found');
      err.status = 404;
      throw err;
    }
    Object.assign(edu, data);
    return edu.save();
  }

  static async deleteEducation(id, userId) {
    const edu = await Education.findOneAndDelete({ _id: id, userId });
    if (!edu) {
      const err = new Error('Education not found');
      err.status = 404;
      throw err;
    }
    return edu;
  }

  // ─── jobs ─────────────────────────────────────────────────────────────────
  static async addJob(userId, data) {
    return UserJob.create({ userId, ...data });
  }

  static async updateJob(id, userId, data) {
    const job = await UserJob.findOne({ _id: id, userId });
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    Object.assign(job, data);
    return job.save();
  }

  static async deleteJob(id, userId) {
    const job = await UserJob.findOneAndDelete({ _id: id, userId });
    if (!job) {
      const err = new Error('Job not found');
      err.status = 404;
      throw err;
    }
    return job;
  }
}