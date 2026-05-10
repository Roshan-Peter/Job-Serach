import Job from '../models/Job.js';

export default class JobService {
  static async create(data) {
    return Job.create(data);
  }

  static async findAll({ limit = 20, skip = 0, postedBy = null } = {}) {
    const filter = { isActive: true };
    if (postedBy) filter.postedBy = postedBy;
    return Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  static async findById(id) {
    return Job.findById(id).populate('postedBy', 'name email');
  }

  static async update(id, userId, data) {
    const job = await Job.findOne({ _id: id, postedBy: userId });
    if (!job) {
      const err = new Error('Job not found or unauthorized');
      err.status = 404;
      throw err;
    }
    Object.assign(job, data);
    return job.save();
  }

  static async remove(id, userId) {
    const job = await Job.findOneAndDelete({ _id: id, postedBy: userId });
    if (!job) {
      const err = new Error('Job not found or unauthorized');
      err.status = 404;
      throw err;
    }
    return job;
  }

  static async getApplicationById(applicationId) {
  const application = await JobApply.findById(applicationId)
    .populate('userId', '-password')
    .populate('jobId')
    .populate('resumeId'); // ✅ populate resume

  if (!application) {
    const err = new Error('Application not found');
    err.status = 404;
    throw err;
  }
  return application;
}


  static async findJob(jobId, user){
    return await Job.findOne({
        _id: jobId,
        postedBy: user._id
      });
  }
}
