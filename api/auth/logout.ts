import type { IncomingMessage, ServerResponse } from 'http';
import { applyCors } from '../cors.ts';
import { parseJsonBody, sendJson, activeAuthTokens } from '../_authShared.ts';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED', message: 'Only POST is allowed.' });
  }

  try {
    const body = await parseJsonBody(req);
    const token = (body.token || '').toString().trim();
    if (token && activeAuthTokens.has(token)) {
      activeAuthTokens.delete(token);
    }
    return sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    return sendJson(res, 500, { success: false, error: 'SERVER_ERROR', message: err?.message });
  }
}
