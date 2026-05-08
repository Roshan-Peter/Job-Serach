import express from 'express';
import HomeController from '../controllers/HomeController.js';
import AuthController from '../controllers/AuthController.js';
import JobController from '../controllers/JobController.js';
import { requireAuth, requireGuest, requireConfirmedEmail } from '../middleware/auth.js';


const router = express.Router();



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






export default router;
