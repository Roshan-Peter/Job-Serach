import UserService    from '../services/UserService.js';
import LoginLogService from '../services/LoginLogService.js';
import CompanyService from '../services/CompanyService.js';


export default class AccountSettingsController {

  static async AccountSettings(req, res) {
    const user = await UserService.findById(req.session.user._id);

    const company = await CompanyService.findByOwner(req.session.user._id);

    return res.render('account/account-settings', {
      user:     req.session.user,
      publicId: user.publicId,
      created:  user.createdAt,
      company:  company || null,  
      error:    null,
      success:  null,
    });
  }

  static async registerCompany(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const {
      name, website, email, phone,
      industry, size, address, description,
    } = req.body || {};

    try {
      // ── validation ────────────────────────────────────────────────────────
      if (!name || !website || !email || !phone || !industry || !size || !address || !description) {
        const message = 'All fields are required';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('account/account-settings', {
          user:     req.session.user,
          publicId: (await UserService.findById(req.session.user._id)).publicId,
          created:  (await UserService.findById(req.session.user._id)).createdAt,
          company:  null,
          error:    message,
          success:  null,
        });
      }

      // ── one company per user ──────────────────────────────────────────────
      const existing = await CompanyService.findByOwner(req.session.user._id);
      if (existing) {
        const message = 'You have already registered a company';
        if (isJson) return res.status(409).json({ error: message });
        return res.status(409).render('account/account-settings', {
          user:     req.session.user,
          publicId: (await UserService.findById(req.session.user._id)).publicId,
          created:  (await UserService.findById(req.session.user._id)).createdAt,
          company:  existing,
          error:    message,
          success:  null,
        });
      }

      await CompanyService.create({
        name, website, email, phone,
        industry, size, address, description,
        owner: req.session.user._id,
      });

      if (isJson) return res.status(201).json({
        success: true,
        message: 'Company submitted for verification',
      });

      // redirect back to settings with success flag
      return res.redirect('/account/settings?success=company_submitted');

    } catch (err) {
      console.error('registerCompany error', err);

      // handle mongoose validation errors
      let message = err.message || 'Failed to register company';
      if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(e => e.message).join(', ');
      }

      if (isJson) return res.status(err.status || 400).json({ error: message });
      const user = await UserService.findById(req.session.user._id);
      return res.status(err.status || 400).render('account/account-settings', {
        user:     req.session.user,
        publicId: user.publicId,
        created:  user.createdAt,
        company:  null,
        error:    message,
        success:  null,
      });
    }
  }
}