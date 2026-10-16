import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { applyCors } from './cors.js';

export interface OtpSession {
  mobile: string;
  otpHash: string;
  salt: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  resendCooldownUntil: number;
  isSimulated: boolean;
}

export interface AuthToken {
  token: string;
  mobile: string;
  createdAt: number;
  expiresAt: number;
}

export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
export const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
export const MAX_ATTEMPTS = 3;
export const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 OTP requests per 10 mins

export const DEMO_TEST_OTP = process.env.DEMO_OTP || '123456';
const SERVER_SECRET = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'gramaconnect-kiosk-secure-salt-2026';

// In-memory session store (effective for warm container lifetime)
const otpSessions = new Map<string, OtpSession>();
const activeAuthTokens = new Map<string, AuthToken>();
const requestRateLimits = new Map<string, number[]>();

export { otpSessions, activeAuthTokens, requestRateLimits };

export function parseJsonBody(req: IncomingMessage): Promise<any> {
  const reqAny = req as any;
  if (reqAny.body !== undefined && reqAny.body !== null) {
    if (typeof reqAny.body === 'object') {
      return Promise.resolve(reqAny.body);
    }
    if (typeof reqAny.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(reqAny.body));
      } catch {
        return Promise.reject(new Error('Invalid JSON format'));
      }
    }
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

export function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex');
}

/**
 * Creates a stateless signed HMAC token so OTP verification succeeds across
 * cold/warm Vercel serverless containers without requiring an external database.
 */
export function createStatelessOtpToken(mobile: string, otp: string, expiresAt: number): string {
  const salt = crypto.randomBytes(8).toString('hex');
  const signature = crypto
    .createHmac('sha256', SERVER_SECRET)
    .update(`${mobile}:${otp}:${expiresAt}:${salt}`)
    .digest('hex');
  return `${expiresAt}.${salt}.${signature}`;
}

/**
 * Verifies a stateless signed HMAC token against candidate OTP.
 */
export function verifyStatelessOtpToken(mobile: string, enteredOtp: string, token: string): boolean {
  try {
    const [expiresAtStr, salt, signature] = token.split('.');
    if (!expiresAtStr || !salt || !signature) return false;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

    const expectedSignature = crypto
      .createHmac('sha256', SERVER_SECRET)
      .update(`${mobile}:${enteredOtp}:${expiresAt}:${salt}`)
      .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

/**
 * Sends real SMS if provider credentials exist in environment variables.
 * Supports Fast2SMS (India), MSG91 (India), and Twilio.
 */
export async function dispatchSmsIfConfigured(
  mobile: string,
  otp: string
): Promise<{ sent: boolean; provider: string; error?: string }> {
  const provider = (process.env.SMS_PROVIDER || '').toLowerCase();
  const apiKey = process.env.SMS_API_KEY || '';

  if (!apiKey) {
    return { sent: false, provider: 'demo-simulation' };
  }

  try {
    if (provider === 'fast2sms') {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: mobile,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.return === false) {
        return { sent: false, provider: 'fast2sms', error: data.message?.[0] || 'Fast2SMS delivery error' };
      }
      return { sent: true, provider: 'fast2sms' };
    }

    if (provider === 'msg91') {
      const authKey = apiKey;
      const templateId = process.env.SMS_TEMPLATE_ID || process.env.MSG91_TEMPLATE_ID;
      const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=91${mobile}&otp=${otp}&authkey=${authKey}`;
      const response = await fetch(url, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || data.type === 'error') {
        return { sent: false, provider: 'msg91', error: data.message || 'MSG91 delivery error' };
      }
      return { sent: true, provider: 'msg91' };
    }

    if (provider === 'twilio') {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = apiKey;
      const fromNumber = process.env.TWILIO_FROM_NUMBER;
      if (!accountSid || !fromNumber) {
        return { sent: false, provider: 'twilio', error: 'Missing TWILIO_ACCOUNT_SID or TWILIO_FROM_NUMBER' };
      }
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
      const bodyParams = new URLSearchParams({
        To: `+91${mobile}`,
        From: fromNumber,
        Body: `${otp} is your verification code for GramaConnect Rural Kiosk. Valid for 5 minutes.`,
      });
      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });
      const data = await response.json();
      if (!response.ok || data.error_code) {
        return { sent: false, provider: 'twilio', error: data.message || 'Twilio delivery error' };
      }
      return { sent: true, provider: 'twilio' };
    }

    return { sent: false, provider: 'unknown-provider', error: `Unsupported SMS provider: ${provider}` };
  } catch (err: any) {
    return { sent: false, provider, error: err?.message || 'Network error communicating with SMS provider' };
  }
}
