import express from 'express';
import HomeController from '../controllers/HomeController.js';
import AuthController from '../controllers/AuthController.js';
import JobController from '../controllers/JobController.js';
import { requireAuth, requireGuest, requireConfirmedEmail, requireAdmin, requireSuperAdmin } from '../middleware/auth.js';
import AccountSettingsController from '../controllers/AccountSettingsController.js';
import AdminController from '../controllers/AdminController.js';


const router = express.Router();

// Route Fix
router.get("/welcome", (req, res) => { res.redirect("/dashboard"); });



router.get('/', (req, res) => new HomeController(req, res).index());
router.get('/register',     requireGuest, AuthController.showRegister);
router.post('/register',    requireGuest, AuthController.register);
router.get('/login',        requireGuest, AuthController.showLogin);
router.post('/login',       requireGuest, AuthController.login);
router.get('/confirm-otp',               AuthController.showConfirmOtp);
router.post('/confirm-otp',              AuthController.verifyOtp);
router.post('/resend-otp',               AuthController.resendOtp);

// protected routes
router.get('/dashboard', requireAuth, requireConfirmedEmail, AuthController.showDashboard);
router.get('/welcome',   requireAuth, AuthController.showWelcome);

// logout
router.post('/logout', AuthController.logout);


// ─── jobs (protected) ────────────────────────────────────────────────────
router.get('/jobs/create',    requireAuth, requireConfirmedEmail, JobController.showCreate);
router.post('/jobs',          requireAuth, requireConfirmedEmail, JobController.create);
router.post('/jobs/:id/delete', requireAuth,                      JobController.remove);

// ─── jobs (public) ────────────────────────────────────────────────────────

router.get('/jobs',          JobController.index);
router.get('/jobs/:id',      JobController.show);


router.get('/account-settings', requireAuth, requireConfirmedEmail, AccountSettingsController.AccountSettings)
router.post('/account/company/register', requireAuth, requireConfirmedEmail, AccountSettingsController.registerCompany);


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




export default router;
