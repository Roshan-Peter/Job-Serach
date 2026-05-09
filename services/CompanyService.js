import Company from '../models/Company.js';

export default class CompanyService {

  static async create(data) {
    return Company.create(data);
  }

  static async findByOwner(ownerId) {
    return Company.findOne({ owner: ownerId });
  }

  static async findById(id) {
    return Company.findById(id).populate('owner', 'name email');
  }

  static async findAll({ limit = 20, skip = 0, status = null } = {}) {
    const filter = {};
    if (status) filter.status = status;
    return Company.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  static async countByStatus() {
    const [pending, approved, rejected] = await Promise.all([
      Company.countDocuments({ status: 'pending' }),
      Company.countDocuments({ status: 'approved' }),
      Company.countDocuments({ status: 'rejected' }),
    ]);
    return { pending, approved, rejected, total: pending + approved + rejected };
  }

  static async updateStatus(id, { status, rejectionReason = null }) {
    const company = await Company.findById(id);
    if (!company) {
      const err = new Error('Company not found');
      err.status = 404;
      throw err;
    }
    company.status          = status;
    company.verifiedAt      = status === 'approved' ? new Date() : null;
    company.rejectionReason = status === 'rejected' ? rejectionReason : null;
    return company.save();
  }
}