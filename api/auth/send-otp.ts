import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { applyCors } from '../cors.ts';
import {
  parseJsonBody,
  sendJson,
  hashOtp,
  createStatelessOtpToken,
  dispatchSmsIfConfigured,
  otpSessions,
  requestRateLimits,
  OTP_EXPIRY_MS,
  RESEND_COOLDOWN_MS,
  RATE_LIMIT_WINDOW_MS,
  MAX_REQUESTS_PER_WINDOW,
  DEMO_TEST_OTP,
} from '../_authShared.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Only POST is allowed.' });
  }

  try {
    const body = await parseJsonBody(req);
    const rawMobile = (body.mobile || '').toString().trim();
    const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);

    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      return sendJson(res, 400, {
        success: false,
        error: 'INVALID_MOBILE',
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
    }

    const now = Date.now();

    console.log(
      `[send-otp] Incoming request for mobile: ${cleanMobile.slice(0, 3)}****${cleanMobile.slice(-2)} (origin: "${req.headers.origin || 'same-origin'}")`
    );

    // 1. Rate-limiting check: max 3 requests per 10 minutes per mobile
    const history = requestRateLimits.get(cleanMobile) || [];
    const recent = history.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
      const oldest = recent[0];
      const waitSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
      console.warn(`[send-otp] Rate limit reached for mobile: ${cleanMobile.slice(0, 3)}****${cleanMobile.slice(-2)}`);
      return sendJson(res, 429, {
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many OTP requests. Please wait ${Math.ceil(waitSec / 60)} minute(s) before requesting again.`,
        retryAfterSeconds: waitSec,
      });
    }

    // 2. Cooldown check: 30 seconds between requests
    const existingSession = otpSessions.get(cleanMobile);
    if (existingSession && now < existingSession.resendCooldownUntil) {
      const cooldownLeft = Math.ceil((existingSession.resendCooldownUntil - now) / 1000);
      console.warn(`[send-otp] Cooldown active for mobile: ${cleanMobile.slice(0, 3)}****${cleanMobile.slice(-2)} (${cooldownLeft}s remaining)`);
      return sendJson(res, 429, {
        success: false,
        error: 'COOLDOWN_ACTIVE',
        message: `Please wait ${cooldownLeft} seconds before requesting a new OTP.`,
        cooldownRemaining: cooldownLeft,
      });
    }

    // 3. Generate 6-digit OTP
    const isLive = Boolean(process.env.SMS_PROVIDER && process.env.SMS_API_KEY);
    const generatedOtp = isLive
      ? crypto.randomInt(100000, 999999).toString()
      : DEMO_TEST_OTP;

    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(generatedOtp, salt);
    const expiresAt = now + OTP_EXPIRY_MS;

    // Create stateless verification token for resilient cross-instance verification
    const verificationSessionToken = createStatelessOtpToken(cleanMobile, generatedOtp, expiresAt);

    // Save in warm container memory
    otpSessions.set(cleanMobile, {
      mobile: cleanMobile,
      otpHash,
      salt,
      createdAt: now,
      expiresAt,
      attempts: 0,
      resendCooldownUntil: now + RESEND_COOLDOWN_MS,
      isSimulated: !isLive,
    });

    recent.push(now);
    requestRateLimits.set(cleanMobile, recent);

    // 4. Send real SMS if live provider configured
    let smsDispatchResult = { sent: false, provider: 'demo-simulation' as string, error: undefined as string | undefined };
    if (isLive) {
      console.log(`[send-otp] Dispatching live SMS via provider: "${process.env.SMS_PROVIDER}"...`);
      smsDispatchResult = await dispatchSmsIfConfigured(cleanMobile, generatedOtp);
      if (!smsDispatchResult.sent && smsDispatchResult.error) {
        console.error(`[SMS Dispatch Error]: Provider "${smsDispatchResult.provider}" failed: ${smsDispatchResult.error}`);
      } else {
        console.log(`[send-otp] SMS successfully dispatched via "${smsDispatchResult.provider}".`);
      }
    } else {
      console.log('[send-otp] Running in DEMO SIMULATION mode (SMS_API_KEY unset). Code: 123456');
    }

    return sendJson(res, 200, {
      success: true,
      mobile: cleanMobile,
      expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
      cooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
      verificationSessionToken,
      sessionToken: verificationSessionToken,
      isSimulated: !isLive || !smsDispatchResult.sent,
      provider: isLive ? smsDispatchResult.provider : 'demo-simulation',
      providerError: smsDispatchResult.error,
      message: isLive && smsDispatchResult.sent
        ? 'OTP sent successfully via SMS to your registered mobile number.'
        : smsDispatchResult.error
        ? `Provider notice: ${smsDispatchResult.error}. For prototype testing, use demo code: 123456.`
        : 'DEMO MODE: OTP sent. For prototype testing without live SMS provider, enter verification code: 123456.',
    });
  } catch (err: any) {
    console.error('[send-otp server error]:', err?.stack || err);
    return sendJson(res, 500, {
      success: false,
      error: 'SERVER_ERROR',
      message: err?.message || 'Internal server error while dispatching OTP.',
    });
  }
}
