const otpStore = new Map(); // key: email, value: { otp, expiresAt }

export default class OtpService {
  static generate(email, digits = 6, ttlSec = 300) {
    const otp = Math.floor(10 ** (digits - 1) + Math.random() * 9 * 10 ** (digits - 1)).toString();
    const expiresAt = Date.now() + ttlSec * 1000;
    otpStore.set(email, { otp, expiresAt });
    return otp;
  }

  static verify(email, otp) {
    const rec = otpStore.get(email);
    if (!rec) return false;
    if (Date.now() > rec.expiresAt) {
      otpStore.delete(email);
      return false;
    }
    const ok = rec.otp === otp;
    if (ok) otpStore.delete(email);
    return ok;
  }
}
