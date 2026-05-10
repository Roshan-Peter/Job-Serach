import Job from '../models/Job.js';
import JobApply from '../models/JobApply.js';

export default class JobApplyService {
  /* ---------------- APPLY FOR JOB ---------------- */

static async applyForJob(data) {
  try {
    const existing = await JobApply.findOne({
      userId: data.userId,
      jobId:  data.jobId,
    });

    if (existing) {
      const err = new Error('You already applied for this job');
      err.status = 400;
      throw err;
    }

    return await JobApply.create({
      userId:      data.userId,
      jobId:       data.jobId,
      name:        data.name,
      email:       data.email,
      number:      data.number      || null,
      url:         data.url         || null,
      coverLetter: data.coverLetter || null,
      resumeId:    data.resumeId    || null, 
    });
  } catch (err) {
    if (err.code === 11000) {
      const e = new Error('You already applied for this job');
      e.status = 400;
      throw e;
    }
    throw err;
  }
}

  /* ---------------- GET USER APPLICATIONS ---------------- */

  static async getUserApplications(userId) {
    return await JobApply.find({
      userId,
    })
      .populate('jobId')
      .sort({ createdAt: -1 });
  }

  /* ---------------- GET JOB APPLICATIONS ---------------- */

  static async getJobApplications(jobId) {
    return await JobApply.find({
      jobId,
    })
      .populate('userId', '-password')
      .sort({ createdAt: -1 });
  }

  /* ---------------- GET SINGLE APPLICATION ---------------- */

  static async getApplicationById(applicationId) {
    const application = await JobApply.findById(applicationId)
      .populate('userId', '-password')
      .populate('jobId');

    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      throw err;
    }

    return application;
  }

  /* ---------------- UPDATE APPLICATION STATUS ---------------- */

  static async updateApplicationStatus(applicationId, status) {
    const allowed = ['pending', 'reviewed', 'accepted', 'rejected'];

    if (!allowed.includes(status)) {
      const err = new Error('Invalid status');
      err.status = 400;
      throw err;
    }

    const application = await JobApply.findById(applicationId);

    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      throw err;
    }

    application.status = status;

    await application.save();

    return application;
  }

  /* ---------------- DELETE APPLICATION ---------------- */

  static async deleteApplication(applicationId, userId) {
    const application = await JobApply.findById(applicationId);

    if (!application) {
      const err = new Error('Application not found');
      err.status = 404;
      throw err;
    }

    // owner check
    if (application.userId.toString() !== userId.toString()) {
      const err = new Error('Unauthorized');
      err.status = 403;
      throw err;
    }

    await application.deleteOne();

    return true;
  }

  /* ---------------- CHECK IF USER APPLIED ---------------- */

  static async hasUserApplied(userId, jobId) {
    const exists = await JobApply.exists({
      userId,
      jobId,
    });

    return !!exists;
  }

  /* ---------------- GET TOTAL APPLICATION COUNT ---------------- */

  static async getApplicationCount(jobId) {
    return await JobApply.countDocuments({
      jobId,
    });
  }

  static async getPostedJobs(user) {
    const jobs = await Job.find({
      postedBy: user._id,
    }).sort({ createdAt: -1 });

    return jobs;
  }
}
