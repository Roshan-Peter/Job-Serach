import UserService     from '../services/UserService.js';
import OtpService      from '../services/OtpService.js';
import LoginLogService from '../services/LoginLogService.js';
import AdminService    from '../services/AdminService.js';
import User            from '../models/User.js'; // ✅ needed for 2FA check

export default class AuthController {

  // ─── register ──────────────────────────────────────────────────────────────
  static showRegister(req, res) {
    return res.render('register', { error: null, form: {} });
  }

  static async register(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const { name, email, password, confirmPassword } = req.body || {};

    try {
      if (!name || !email || !password || !confirmPassword) {
        const message = 'All fields are required';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('register', { error: message, form: { name, email } });
      }
      if (password !== confirmPassword) {
        const message = 'Passwords do not match';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('register', { error: message, form: { name, email } });
      }
      if (password.length < 8) {
        const message = 'Password must be at least 8 characters';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('register', { error: message, form: { name, email } });
      }

      await UserService.create({ name, email, password });

      const otp = OtpService.generate(email);
      console.log(`OTP for ${email}: ${otp}`);

      const redirectUrl = `/confirm-otp?email=${encodeURIComponent(email)}`;
      if (isJson) return res.status(201).json({ success: true, redirect: redirectUrl });
      return res.redirect(redirectUrl);
    } catch (err) {
      console.error('register error', err);
      const message = err.status === 409 ? 'Email already in use' : err.message || 'Error';
      if (isJson) return res.status(err.status || 400).json({ error: message });
      return res.status(err.status || 400).render('register', { error: message, form: { name, email } });
    }
  }

  // ─── OTP ───────────────────────────────────────────────────────────────────
  static showConfirmOtp(req, res) {
    const { email } = req.query;
    return res.render('confirm-otp', { error: null, email: email || '' });
  }

  static async verifyOtp(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const { email, otp } = req.body || {};

    if (!email || !otp) {
      const message = 'Email and OTP are required';
      if (isJson) return res.status(400).json({ error: message });
      return res.status(400).render('confirm-otp', { error: message, email });
    }

    const ok = OtpService.verify(email, otp);
    if (!ok) {
      const message = 'Invalid or expired OTP';
      if (isJson) return res.status(400).json({ error: message });
      return res.status(400).render('confirm-otp', { error: message, email });
    }

    const user = await UserService.confirmEmail(email);
    const adminRecord = await AdminService.findByUserId(user._id);

    req.session.user = {
      _id:              user._id,
      name:             user.name,
      email:            user.email,
      isEmailConfirmed: true,
      isAdmin:          !!adminRecord,
      adminRole:        adminRecord?.role || null,
      twoFactorEnabled: user.twoFactorEnabled || false,
    };

    const redirect = adminRecord ? '/admin' : '/dashboard';
    if (isJson) return res.json({ success: true, redirect });
    return res.redirect(redirect);
  }

  static async resendOtp(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const { email } = req.body || {};

    if (!email) {
      const message = 'Email is required';
      if (isJson) return res.status(400).json({ error: message });
      return res.status(400).render('confirm-otp', { error: message, email: '' });
    }

    try {
      const user = await UserService.findByEmail(email);
      if (!user) {
        const message = 'No account found with that email';
        if (isJson) return res.status(404).json({ error: message });
        return res.status(404).render('confirm-otp', { error: message, email });
      }
      if (user.isEmailConfirmed) {
        const message = 'Email is already confirmed';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('confirm-otp', { error: message, email });
      }

      const otp = OtpService.generate(email);
      console.log(`Resent OTP for ${email}: ${otp}`);

      if (isJson) return res.json({ success: true, message: 'OTP resent successfully' });
      return res.redirect(`/confirm-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const message = err.message || 'Error resending OTP';
      if (isJson) return res.status(500).json({ error: message });
      return res.status(500).render('confirm-otp', { error: message, email });
    }
  }

  // ─── login ─────────────────────────────────────────────────────────────────
  static showLogin(req, res) {
    return res.render('login', { error: null });
  }

  static async login(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const { email, password } = req.body || {};

    if (!email || !password) {
      const message = 'Email and password are required';
      if (isJson) return res.status(400).json({ error: message });
      return res.status(400).render('login', { error: message });
    }

    try {
      const user = await UserService.authenticate(email, password);

      if (!user.isEmailConfirmed) {
        await LoginLogService.record({
          email, userId: user._id,
          status: 'failed', reason: 'Email not confirmed', req,
        });
        const otp = OtpService.generate(email);
        console.log(`OTP for unconfirmed user ${email}: ${otp}`);
        const message = 'Please confirm your email before logging in';
        if (isJson) return res.status(403).json({
          error: message,
          redirect: `/confirm-otp?email=${encodeURIComponent(email)}`
        });
        return res.redirect(`/confirm-otp?email=${encodeURIComponent(email)}`);
      }

      // ✅ fetch full user from DB to get 2FA fields
      const fullUser    = await User.findById(user._id);
      const adminRecord = await AdminService.findByUserId(user._id);

      await LoginLogService.record({
        email, userId: user._id, status: 'success', reason: null, req,
      });

      // ✅ build session data once
      const sessionData = {
        _id:              user._id,
        name:             user.name,
        email:            user.email,
        isEmailConfirmed: user.isEmailConfirmed,
        isAdmin:          !!adminRecord,
        adminRole:        adminRecord?.role    || null,
        twoFactorEnabled: fullUser.twoFactorEnabled || false,
      };

      // ✅ if 2FA is enabled hold in pendingUser and redirect to challenge
      if (fullUser.twoFactorEnabled) {
        req.session.pendingUser       = sessionData;
        req.session.postLoginRedirect = req.query.next || (adminRecord ? '/admin' : '/dashboard');
        if (isJson) return res.json({ success: true, redirect: '/account/2fa/challenge' });
        return res.redirect('/account/2fa/challenge');
      }

      // no 2FA — log straight in
      req.session.user = sessionData;
      const defaultRedirect = adminRecord ? '/admin' : '/dashboard';
      const next = req.query.next || defaultRedirect;
      if (isJson) return res.json({ success: true, redirect: next });
      return res.redirect(next);

    } catch (err) {
      await LoginLogService.record({
        email, userId: null,
        status: 'failed',
        reason: err.status === 401 ? 'Invalid credentials' : err.message,
        req,
      });
      const message = err.status === 401 ? 'Invalid email or password' : err.message || 'Error';
      if (isJson) return res.status(err.status || 400).json({ error: message });
      return res.status(err.status || 400).render('login', { error: message });
    }
  }

  // ─── logout ────────────────────────────────────────────────────────────────
  static logout(req, res) {
    req.session.destroy((err) => {
      if (err) console.error('logout error', err);
      res.clearCookie('connect.sid');
      return res.redirect('/login');
    });
  }

  // ─── dashboard ─────────────────────────────────────────────────────────────
  static async showDashboard(req, res) {
    const logs = await LoginLogService.findByUser(req.session.user._id, { limit: 5 });
    return res.render('dashboard', { user: req.session.user, loginLogs: logs });
  }

  static showWelcome(req, res) {
    return res.render('welcome');
  }
}