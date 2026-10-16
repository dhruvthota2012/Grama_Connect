import type { IncomingMessage, ServerResponse } from 'http';

const ALLOWED_ORIGIN_PATTERNS = [
  /^https:\/\/grama-connect-nu\.vercel\.app$/,
  /^https:\/\/.*\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

export function applyCors(req: IncomingMessage, res: ServerResponse): boolean {
  const origin = (req.headers.origin || req.headers.Origin || '') as string;

  const isAllowed =
    !origin ||
    ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin));

  const allowOrigin = isAllowed && origin ? origin : '*';

  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours preflight cache

  if (allowOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true; // Request handled as preflight
  }

  return false;
}
