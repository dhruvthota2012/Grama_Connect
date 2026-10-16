import type { IncomingMessage, ServerResponse } from 'http';
import { applyCors } from '../cors.ts';

const DEFAULT_VOICES = {
  te: process.env.TTS_VOICE_TE || 'te-IN-Standard-A',
  hi: process.env.TTS_VOICE_HI || 'hi-IN-Standard-A',
  en: process.env.TTS_VOICE_EN || 'en-IN-Standard-A',
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'METHOD_NOT_ALLOWED' }));
    return;
  }

  const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  const status = {
    status: 'ok',
    configured: Boolean(apiKey),
    provider: 'google-cloud-tts',
    apiKeyConfigured: Boolean(apiKey),
    voices: DEFAULT_VOICES,
    hasPreGeneratedAudio: true,
    serverTimestamp: new Date().toISOString(),
  };

  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(status, null, 2));
}
