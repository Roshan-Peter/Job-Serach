import Resume from "../models/Resume.js";

export default class ResumeService {

  // CREATE
  static async createResume(userId, data) {
    return await Resume.create({
      userId,
      ...data
    });
  }

  static async findOne (id, user) {
    return await Resume.findOne({
        _id: id,
        userId: user._id,
      });
  }

  // GET ALL USER RESUMES
  static async getUserResumes(userId) {
    return await Resume.find({ userId }).sort({ createdAt: -1 });
  }

  // GET SINGLE RESUME
  static async getResumeById(id) {
    return await Resume.findById(id);
  }

  // UPDATE
  static async updateResume(id, userId, data) {
    return await Resume.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true }
    );
  }

  // DELETE
  static async deleteResume(id, userId) {
    return await Resume.findOneAndDelete({
      _id: id,
      userId
    });
  }

}