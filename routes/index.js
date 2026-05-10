import express from 'express';
import HomeController from '../controllers/HomeController.js';
import AuthController from '../controllers/AuthController.js';
import JobController from '../controllers/JobController.js';
import { requireAuth, requireGuest, requireConfirmedEmail, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import AccountSettingsController from '../controllers/AccountSettingsController.js';
import AdminController from '../controllers/AdminController.js';
import TwoFactorController from '../controllers/TwoFactorController.js';
import ProfileController from '../controllers/ProfileController.js';
import ResumeController from '../controllers/ResumeController.js';


const router = express.Router();

// Route Fix
router.get("/welcome", (req, res) => { res.redirect("/dashboard"); });



router.get('/', (req, res) => new HomeController(req, res).index());
router.get('/about', HomeController.about )
router.get('/privacy', HomeController.getPrivacyPolicyPage )
router.get("/contact", HomeController.getContactPage);
router.post("/contact", HomeController.submitContactForm);
router.get('/register',     requireGuest, AuthController.showRegister);
router.post('/register',    requireGuest, AuthController.register);
router.get('/login',        requireGuest, AuthController.showLogin);
router.post('/login',       requireGuest, AuthController.login);
router.get('/confirm-otp',               AuthController.showConfirmOtp);
router.post('/confirm-otp',              AuthController.verifyOtp);
router.post('/resend-otp',               AuthController.resendOtp);



// ─── 2FA setup (requires login) ───────────────────────────────────────────
router.get('/account/2fa/setup',       requireAuth, TwoFactorController.showSetup);
router.post('/account/2fa/enable',     requireAuth, TwoFactorController.enableTwoFactor);
router.get('/account/2fa/manage',      requireAuth, TwoFactorController.showManage);
router.post('/account/2fa/disable',    requireAuth, TwoFactorController.disableTwoFactor);

// ─── 2FA challenge during login (no requireAuth — user isn't logged in yet) ─
router.get('/account/2fa/challenge',   TwoFactorController.showChallenge);
router.post('/account/2fa/challenge',  TwoFactorController.verifyChallenge);



// protected routes
router.get('/dashboard', requireAuth, requireConfirmedEmail, AuthController.showDashboard);
router.get('/welcome',   requireAuth, AuthController.showWelcome);

// logout
router.post('/logout', AuthController.logout);


// ─── jobs (protected) ────────────────────────────────────────────────────
router.get('/jobs/create',    requireAuth, requireConfirmedEmail, JobController.showCreate);
router.post('/jobs',          requireAuth, requireConfirmedEmail, JobController.create);
router.post('/jobs/:id/delete', requireAuth,                      JobController.remove);
router.post('/jobs/:id/apply', requireAuth, JobController.applyForJob);
router.get('/applications/me', requireAuth, JobController.getMyApplications);
router.get('/my/job/posting', requireAuth, requireConfirmedEmail, JobController.myJobPostings);
router.get('/jobs/:id/applications', requireAuth, requireConfirmedEmail, JobController.viewApplicants);
router.get('/applications/:id', requireAuth, requireConfirmedEmail, JobController.viewApplicationDetail);

// ─── jobs (public) ────────────────────────────────────────────────────────

router.get('/jobs',          JobController.index);
router.get('/jobs/:id',      JobController.show);


router.get('/account-settings', requireAuth, requireConfirmedEmail, AccountSettingsController.AccountSettings)
router.post('/account/company/register', requireAuth, requireConfirmedEmail, AccountSettingsController.registerCompany);
//router.post('/jobs/applications/:id/status', requireAuth, JobController.updateApplicationStatus);



// ─── profile ──────────────────────────────────────────────────────────────
router.post('/profile/experience',          requireAuth, ProfileController.addExperience);
router.put('/profile/experience/:id',       requireAuth, ProfileController.updateExperience);
router.delete('/profile/experience/:id',    requireAuth, ProfileController.deleteExperience);

router.post('/profile/education',           requireAuth, ProfileController.addEducation);
router.put('/profile/education/:id',        requireAuth, ProfileController.updateEducation);
router.delete('/profile/education/:id',     requireAuth, ProfileController.deleteEducation);

router.post('/profile/jobs',                requireAuth, ProfileController.addJob);
router.put('/profile/jobs/:id',             requireAuth, ProfileController.updateJob);
router.delete('/profile/jobs/:id',          requireAuth, ProfileController.deleteJob);

router.post('/profile',                     requireAuth, ProfileController.updateProfile);
router.get('/profile',  requireAuth, requireConfirmedEmail, ProfileController.showProfile);
router.get("/profile/:publicId", ProfileController.getPublicProfile);


// ─── admin ────────────────────────────────────────────────────────────────
router.get('/admin',                          requireAuth, requireAdmin, AdminController.showDashboard);
router.get('/admin/users',                    requireAuth, requireAdmin, AdminController.listUsers);
router.post('/admin/users/:id/delete',        requireAuth, requireAdmin, AdminController.deleteUser);
router.get('/admin/jobs',                     requireAuth, requireAdmin, AdminController.listJobs);
router.post('/admin/jobs/:id/delete',         requireAuth, requireAdmin, AdminController.deleteJob);

// super_admin only — manage who is admin
router.get('/admin/admins',                          requireAuth, requireSuperAdmin, AdminController.listAdmins);
router.post('/admin/admins',                         requireAuth, requireSuperAdmin, AdminController.addAdmin);
router.post('/admin/admins/:userId/remove',          requireAuth, requireSuperAdmin, AdminController.removeAdmin);
router.post('/admin/admins/:userId/role',            requireAuth, requireSuperAdmin, AdminController.updateRole);


// ─── admin companies ──────────────────────────────────────────────────────
router.get('/admin/companies',                  requireAuth, requireAdmin, AdminController.listCompanies);
router.get('/admin/companies/:id',              requireAuth, requireAdmin, AdminController.showCompany);
router.post('/admin/companies/:id/approve',     requireAuth, requireAdmin, AdminController.approveCompany);
router.post('/admin/companies/:id/reject',      requireAuth, requireAdmin, AdminController.rejectCompany);


router.post("/resume/create", ResumeController.create);
router.get("/resumes", ResumeController.myResumes);
router.get("/resume/create", ResumeController.createPage);
router.get("/resume/:id", ResumeController.single);
router.delete("/resume/:id", ResumeController.delete);
router.get("/resume/view/:id", requireAuth, requireConfirmedEmail, JobController.showResume)

export default router;
