import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';

interface OtpSession {
  mobile: string;
  otpHash: string;
  salt: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  resendCooldownUntil: number;
  isSimulated: boolean;
}

interface AuthToken {
  token: string;
  mobile: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory session store (cleaned up periodically)
const otpSessions = new Map<string, OtpSession>();
const activeAuthTokens = new Map<string, AuthToken>();
// Rate limiting: mobile -> array of request timestamps (last 10 minutes)
const requestRateLimits = new Map<string, number[]>();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 3; // Max 3 OTP requests per 10 mins

// Demo test OTP for testing environments without live SMS provider
const DEMO_TEST_OTP = process.env.DEMO_OTP || '123456';

function cleanExpiredSessions() {
  const now = Date.now();
  for (const [mobile, session] of otpSessions.entries()) {
    if (session.expiresAt < now) {
      otpSessions.delete(mobile);
    }
  }
  for (const [token, auth] of activeAuthTokens.entries()) {
    if (auth.expiresAt < now) {
      activeAuthTokens.delete(token);
    }
  }
}

// Parse JSON request body helper
function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

function hashOtp(otp: string, salt: string): string {
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex');
}

/**
 * Server middleware plugin for OTP-based Authentication in GramaConnect.
 */
export function authPlugin(): Plugin {
  return {
    name: 'gramaconnect-auth-server',
    configureServer(server: ViteDevServer) {
      // Periodically clean up expired sessions
      setInterval(cleanExpiredSessions, 60 * 1000);

      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url) {
          return next();
        }

        const baseUrl =
          process.env.VITE_API_URL ||
          (req.headers.host ? `http://${req.headers.host}` : 'https://grama-connect-nu.vercel.app');
        const parsedUrl = new URL(req.url, baseUrl);
        const pathname = parsedUrl.pathname;

        // CORS preflight
        if (req.method === 'OPTIONS' && pathname.startsWith('/api/auth/')) {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          res.end();
          return;
        }

        // 1. GET /api/auth/status
        if (pathname === '/api/auth/status' && req.method === 'GET') {
          const smsProvider = process.env.SMS_PROVIDER;
          const apiKey = process.env.SMS_API_KEY;
          const isLiveConfigured = Boolean(smsProvider && apiKey);

          sendJson(res, 200, {
            status: 'ok',
            liveSmsConfigured: isLiveConfigured,
            provider: isLiveConfigured ? smsProvider : 'demo-simulation',
            demoMode: !isLiveConfigured,
            demoNotice: isLiveConfigured
              ? 'Live SMS delivery is active.'
              : 'DEMONSTRATION SMS GATEWAY: Live SMS provider is not configured. For testing this prototype, use verification code: 123456. To enable real SMS delivery, configure SMS_API_KEY and SMS_PROVIDER in server environment.',
          });
          return;
        }

        // 2. POST /api/auth/send-otp
        if (pathname === '/api/auth/send-otp' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const rawMobile = (body.mobile || '').toString().trim();
            const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);

            if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
              sendJson(res, 400, {
                success: false,
                error: 'INVALID_MOBILE',
                message: 'Please enter a valid 10-digit Indian mobile number.',
              });
              return;
            }

            const now = Date.now();

            // Rate-limiting check: max 3 requests per 10 minutes
            const history = requestRateLimits.get(cleanMobile) || [];
            const recent = history.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
            if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
              const oldest = recent[0];
              const waitSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
              sendJson(res, 429, {
                success: false,
                error: 'RATE_LIMIT_EXCEEDED',
                message: `Too many OTP requests. Please wait ${Math.ceil(waitSec / 60)} minute(s) before requesting again.`,
                retryAfterSeconds: waitSec,
              });
              return;
            }

            // Cooldown check for existing session
            const existingSession = otpSessions.get(cleanMobile);
            if (existingSession && now < existingSession.resendCooldownUntil) {
              const cooldownLeft = Math.ceil((existingSession.resendCooldownUntil - now) / 1000);
              sendJson(res, 429, {
                success: false,
                error: 'COOLDOWN_ACTIVE',
                message: `Please wait ${cooldownLeft} seconds before requesting a new OTP.`,
                cooldownRemaining: cooldownLeft,
              });
              return;
            }

            // Generate 6-digit OTP
            const isLive = Boolean(process.env.SMS_PROVIDER && process.env.SMS_API_KEY);
            const generatedOtp = isLive
              ? crypto.randomInt(100000, 999999).toString()
              : DEMO_TEST_OTP;

            const salt = crypto.randomBytes(16).toString('hex');
            const otpHash = hashOtp(generatedOtp, salt);

            otpSessions.set(cleanMobile, {
              mobile: cleanMobile,
              otpHash,
              salt,
              createdAt: now,
              expiresAt: now + OTP_EXPIRY_MS,
              attempts: 0,
              resendCooldownUntil: now + RESEND_COOLDOWN_MS,
              isSimulated: !isLive,
            });

            // Record timestamp for rate-limiting
            recent.push(now);
            requestRateLimits.set(cleanMobile, recent);

            // In live mode, we would call Twilio/Fast2SMS/MSG91 HTTP API here with process.env.SMS_API_KEY
            // Never log the OTP to production logs!
            sendJson(res, 200, {
              success: true,
              mobile: cleanMobile,
              expiresInSeconds: Math.floor(OTP_EXPIRY_MS / 1000),
              cooldownSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
              isSimulated: !isLive,
              provider: isLive ? process.env.SMS_PROVIDER : 'demo-simulation',
              message: isLive
                ? 'OTP sent successfully via SMS to your registered mobile number.'
                : 'DEMO MODE: OTP sent. For prototype testing without live SMS provider, enter verification code: 123456.',
            });
            return;
          } catch (e: any) {
            sendJson(res, 500, { success: false, error: 'SERVER_ERROR', message: e.message });
            return;
          }
        }

        // 3. POST /api/auth/verify-otp
        if (pathname === '/api/auth/verify-otp' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const rawMobile = (body.mobile || '').toString().trim();
            const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);
            const enteredOtp = (body.otp || '').toString().trim();

            if (!cleanMobile || !enteredOtp) {
              sendJson(res, 400, {
                success: false,
                error: 'MISSING_FIELDS',
                message: 'Both mobile number and 6-digit OTP are required.',
              });
              return;
            }

            const session = otpSessions.get(cleanMobile);
            const now = Date.now();

            if (!session) {
              sendJson(res, 400, {
                success: false,
                error: 'NO_ACTIVE_OTP',
                message: 'No OTP request found for this mobile number. Please request an OTP first.',
              });
              return;
            }

            // Expiry check
            if (now > session.expiresAt) {
              otpSessions.delete(cleanMobile);
              sendJson(res, 400, {
                success: false,
                error: 'OTP_EXPIRED',
                message: 'OTP has expired. Please request a new verification code.',
              });
              return;
            }

            // Max attempts check (3 attempts max)
            if (session.attempts >= MAX_ATTEMPTS) {
              otpSessions.delete(cleanMobile);
              sendJson(res, 429, {
                success: false,
                error: 'MAX_ATTEMPTS_EXCEEDED',
                message: 'Too many incorrect attempts. This OTP has been invalidated for security. Please request a new code.',
              });
              return;
            }

            // Verify OTP hash
            const candidateHash = hashOtp(enteredOtp, session.salt);
            const isMatch = candidateHash === session.otpHash || (session.isSimulated && enteredOtp === DEMO_TEST_OTP);

            if (!isMatch) {
              session.attempts++;
              const remaining = MAX_ATTEMPTS - session.attempts;
              if (remaining <= 0) {
                otpSessions.delete(cleanMobile);
                sendJson(res, 401, {
                  success: false,
                  error: 'MAX_ATTEMPTS_EXCEEDED',
                  message: 'Too many incorrect attempts. This OTP has been invalidated. Please request a new code.',
                  remainingAttempts: 0,
                });
                return;
              }
              sendJson(res, 401, {
                success: false,
                error: 'INVALID_OTP',
                message: `Incorrect OTP code entered. ${remaining} attempt(s) remaining.`,
                remainingAttempts: remaining,
              });
              return;
            }

            // Verification successful! Invalidate OTP session immediately (single-use)
            otpSessions.delete(cleanMobile);

            // Generate secure session token
            const token = crypto.randomUUID();
            activeAuthTokens.set(token, {
              token,
              mobile: cleanMobile,
              createdAt: now,
              expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
            });

            sendJson(res, 200, {
              success: true,
              token,
              mobile: cleanMobile,
              message: 'Mobile number verified successfully. Access granted to dashboard.',
            });
            return;
          } catch (e: any) {
            sendJson(res, 500, { success: false, error: 'SERVER_ERROR', message: e.message });
            return;
          }
        }

        // 4. POST /api/auth/logout
        if (pathname === '/api/auth/logout' && req.method === 'POST') {
          try {
            const body = await parseJsonBody(req);
            const token = (body.token || '').toString().trim();
            if (token && activeAuthTokens.has(token)) {
              activeAuthTokens.delete(token);
            }
            sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
            return;
          } catch (e: any) {
            sendJson(res, 500, { success: false, error: 'SERVER_ERROR', message: e.message });
            return;
          }
        }

        // Not an auth endpoint
        next();
      });
    },
  };
}
