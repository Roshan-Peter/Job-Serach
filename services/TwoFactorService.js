import speakeasy from 'speakeasy';
import QRCode    from 'qrcode';

export default class TwoFactorService {

  // generate a new secret and QR code for setup
  static async generateSecret(userEmail, appName = 'JobSearch') {
    const secret = speakeasy.generateSecret({
      name:   `${appName} (${userEmail})`,
      length: 20,
    });

    // generate QR code as base64 image
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret:    secret.base32,  // store this in DB
      qrCodeUrl,                 // show this to user
      otpauth:   secret.otpauth_url,
    };
  }

  // verify a TOTP token against a secret
  static verify(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token:    token.replace(/\s/g, ''), // strip spaces
      window:   1, // allow 30s clock drift
    });
  }
}