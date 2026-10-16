import type { IncomingMessage, ServerResponse } from 'http';
import { applyCors } from '../cors';
import { sendJson } from '../_authShared';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Only GET is allowed.' });
  }

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
      : 'DEMONSTRATION SMS GATEWAY: Live SMS provider is not configured. For testing this prototype, use verification code: 123456. To enable real SMS delivery, configure SMS_API_KEY and SMS_PROVIDER in Vercel environment variables.',
  });
}
