import TwoFactorService from '../services/TwoFactorService.js';
import UserService      from '../services/UserService.js';
import User             from '../models/User.js';

export default class TwoFactorController {

  // ─── show setup page ──────────────────────────────────────────────────────
  static async showSetup(req, res) {
    try {
      const user = await User.findById(req.session.user._id);

      // if already enabled, show manage page instead
      if (user.twoFactorEnabled) {
        return res.render('2fa/manage', {
          user: req.session.user,
          error: null,
          success: null,
        });
      }

      // generate fresh secret + QR code
      const { secret, qrCodeUrl } = await TwoFactorService.generateSecret(user.email);

      // temporarily store secret in session until user verifies
      req.session.pending2FASecret = secret;

      return res.render('2fa/setup', {
        user:      req.session.user,
        qrCodeUrl,
        secret,    // show manual entry key too
        error:     null,
      });
    } catch (err) {
      console.error('2fa setup error', err);
      return res.status(500).render('error', { message: 'Failed to load 2FA setup' });
    }
  }

  // ─── verify setup token and enable 2FA ───────────────────────────────────
  static async enableTwoFactor(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const { token } = req.body || {};
    const secret = req.session.pending2FASecret;

    if (!secret) {
      const message = 'Setup session expired. Please start again.';
      if (isJson) return res.status(400).json({ error: message });
      return res.redirect('/account/2fa/setup');
    }

    if (!token) {
      const message = 'Please enter the 6-digit code from your authenticator app';
      if (isJson) return res.status(400).json({ error: message });
      return res.status(400).render('2fa/setup', {
        user:      req.session.user,
        qrCodeUrl: null,
        secret,
        error:     message,
      });
    }

    const valid = TwoFactorService.verify(secret, token);
    if (!valid) {
      // regenerate QR so page still works
      const { qrCodeUrl } = await TwoFactorService.generateSecret(req.session.user.email);
      const message = 'Invalid code. Please try again.';
      if (isJson) return res.status(400).json({ error: message });
      return res.status(400).render('2fa/setup', {
        user: req.session.user,
        qrCodeUrl,
        secret,
        error: message,
      });
    }

    // save secret to DB and enable 2FA
    await User.findByIdAndUpdate(req.session.user._id, {
      twoFactorSecret:  secret,
      twoFactorEnabled: true,
    });

    // update session
    req.session.user.twoFactorEnabled = true;

    // clear pending secret
    delete req.session.pending2FASecret;

    if (isJson) return res.json({ success: true, message: '2FA enabled successfully' });
    return res.redirect('/account/2fa/manage?success=enabled');
  }

  // ─── show manage page (disable 2FA) ──────────────────────────────────────
  static async showManage(req, res) {
    const { success } = req.query;
    return res.render('2fa/manage', {
      user:    req.session.user,
      error:   null,
      success: success === 'enabled' ? '2FA has been enabled successfully' : null,
    });
  }

  // ─── disable 2FA ──────────────────────────────────────────────────────────
  static async disableTwoFactor(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const { token } = req.body || {};

    try {
      const user = await User.findById(req.session.user._id);

      if (!user.twoFactorEnabled) {
        const message = '2FA is not enabled';
        if (isJson) return res.status(400).json({ error: message });
        return res.redirect('/account/2fa/setup');
      }

      if (!token) {
        const message = 'Please enter your authenticator code to disable 2FA';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('2fa/manage', {
          user: req.session.user, error: message, success: null,
        });
      }

      const valid = TwoFactorService.verify(user.twoFactorSecret, token);
      if (!valid) {
        const message = 'Invalid code. Please try again.';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('2fa/manage', {
          user: req.session.user, error: message, success: null,
        });
      }

      // clear 2FA from DB
      await User.findByIdAndUpdate(req.session.user._id, {
        twoFactorSecret:  null,
        twoFactorEnabled: false,
      });

      req.session.user.twoFactorEnabled = false;

      if (isJson) return res.json({ success: true });
      return res.redirect('/account/settings');
    } catch (err) {
      console.error('disable 2fa error', err);
      const message = err.message || 'Failed to disable 2FA';
      if (isJson) return res.status(500).json({ error: message });
      return res.status(500).render('2fa/manage', {
        user: req.session.user, error: message, success: null,
      });
    }
  }

  // ─── show 2FA challenge page (during login) ───────────────────────────────
  static showChallenge(req, res) {
    if (!req.session.pendingUser) return res.redirect('/login');
    return res.render('2fa/challenge', {
      error: null,
    });
  }

  // ─── verify 2FA challenge during login ────────────────────────────────────
  static async verifyChallenge(req, res) {
    const isJson = req.headers.accept?.includes('application/json');
    const { token } = req.body || {};
    const pendingUser = req.session.pendingUser;

    if (!pendingUser) {
      if (isJson) return res.status(400).json({ error: 'Session expired. Please log in again.' });
      return res.redirect('/login');
    }

    if (!token) {
      const message = 'Please enter the 6-digit code';
      if (isJson) return res.status(400).json({ error: message });
      return res.status(400).render('2fa/challenge', { error: message });
    }

    try {
      const user  = await User.findById(pendingUser._id);
      const valid = TwoFactorService.verify(user.twoFactorSecret, token);

      if (!valid) {
        const message = 'Invalid code. Please try again.';
        if (isJson) return res.status(400).json({ error: message });
        return res.status(400).render('2fa/challenge', { error: message });
      }

      // 2FA passed — promote pendingUser to full session
      req.session.user = pendingUser;
      delete req.session.pendingUser;

      const next = req.session.postLoginRedirect || (pendingUser.isAdmin ? '/admin' : '/dashboard');
      delete req.session.postLoginRedirect;

      if (isJson) return res.json({ success: true, redirect: next });
      return res.redirect(next);
    } catch (err) {
      console.error('2fa challenge error', err);
      const message = 'Verification failed. Please try again.';
      if (isJson) return res.status(500).json({ error: message });
      return res.status(500).render('2fa/challenge', { error: message });
    }
  }
}