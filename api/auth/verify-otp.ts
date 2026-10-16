import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { applyCors } from '../cors';
import {
  parseJsonBody,
  sendJson,
  hashOtp,
  verifyStatelessOtpToken,
  otpSessions,
  activeAuthTokens,
  MAX_ATTEMPTS,
  DEMO_TEST_OTP,
} from '../_authShared';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Only POST is allowed.' });
  }

  try {
    const body = await parseJsonBody(req);
    const rawMobile = (body.mobile || '').toString().trim();
    const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);
    const enteredOtp = (body.otp || '').toString().trim();
    const verificationSessionToken = (body.verificationSessionToken || body.sessionToken || '').toString().trim();

    if (!cleanMobile || !enteredOtp) {
      return sendJson(res, 400, {
        success: false,
        error: 'MISSING_FIELDS',
        message: 'Both mobile number and 6-digit OTP are required.',
      });
    }

    const now = Date.now();
    let isMatch = false;

    // 1. First check stateless HMAC verification token (works across all serverless instances)
    if (verificationSessionToken) {
      isMatch = verifyStatelessOtpToken(cleanMobile, enteredOtp, verificationSessionToken);
    }

    // 2. Also check universal demo testing OTP fallback
    if (!isMatch && enteredOtp === DEMO_TEST_OTP) {
      isMatch = true;
    }

    // 3. Fallback to in-memory container session if stateless token was not matched or absent
    const session = otpSessions.get(cleanMobile);
    if (!isMatch && session) {
      if (now > session.expiresAt) {
        otpSessions.delete(cleanMobile);
        return sendJson(res, 400, {
          success: false,
          error: 'OTP_EXPIRED',
          message: 'OTP has expired. Please request a new verification code.',
        });
      }

      if (session.attempts >= MAX_ATTEMPTS) {
        otpSessions.delete(cleanMobile);
        return sendJson(res, 429, {
          success: false,
          error: 'MAX_ATTEMPTS_EXCEEDED',
          message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.',
        });
      }

      const candidateHash = hashOtp(enteredOtp, session.salt);
      if (candidateHash === session.otpHash || (session.isSimulated && enteredOtp === DEMO_TEST_OTP)) {
        isMatch = true;
      } else {
        session.attempts++;
        const remaining = MAX_ATTEMPTS - session.attempts;
        if (remaining <= 0) {
          otpSessions.delete(cleanMobile);
          return sendJson(res, 401, {
            success: false,
            error: 'MAX_ATTEMPTS_EXCEEDED',
            message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.',
            remainingAttempts: 0,
          });
        }
        return sendJson(res, 401, {
          success: false,
          error: 'INVALID_OTP',
          message: `Incorrect OTP code entered. ${remaining} attempt(s) remaining.`,
          remainingAttempts: remaining,
        });
      }
    }

    if (!isMatch) {
      return sendJson(res, 401, {
        success: false,
        error: 'INVALID_OTP',
        message: 'Incorrect verification code entered. Please verify or re-request a new code.',
      });
    }

    // Verification successful! Invalidate in-memory session (single use)
    otpSessions.delete(cleanMobile);

    // Generate secure session authorization token
    const token = crypto.randomUUID();
    activeAuthTokens.set(token, {
      token,
      mobile: cleanMobile,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    });

    return sendJson(res, 200, {
      success: true,
      token,
      mobile: cleanMobile,
      message: 'Mobile number verified successfully. Access granted to provider dashboard.',
    });
  } catch (err: any) {
    console.error('[verify-otp server error]:', err);
    return sendJson(res, 500, {
      success: false,
      error: 'SERVER_ERROR',
      message: err?.message || 'Internal server error during verification.',
    });
  }
}
