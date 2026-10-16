import type { IncomingMessage, ServerResponse } from 'http';
import { applyCors } from '../cors.js';

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

  const baseUrl =
    process.env.VITE_API_URL ||
    (req.headers.host ? `https://${req.headers.host}` : 'https://grama-connect-nu.vercel.app');
  const parsedUrl = new URL(req.url || '/', baseUrl);
  const text = parsedUrl.searchParams.get('text')?.trim();
  const lang = (parsedUrl.searchParams.get('lang') || 'te').toLowerCase();

  if (!text) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'MISSING_TEXT', message: 'Query parameter "text" is required.' }));
    return;
  }

  const targetLang = lang === 'hi' ? 'hi' : lang === 'en' ? 'en' : 'te';
  const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        configured: false,
        error: 'GOOGLE_TTS_NOT_CONFIGURED',
        message: 'Google Cloud TTS API key is not configured in Vercel environment variables.',
      })
    );
    return;
  }

  const voiceName = DEFAULT_VOICES[targetLang];
  const langCode = targetLang === 'te' ? 'te-IN' : targetLang === 'hi' ? 'hi-IN' : 'en-IN';

  try {
    const googleEndpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
    const payload = {
      input: { text },
      voice: {
        languageCode: langCode,
        name: voiceName,
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.88,
        pitch: 1.05,
      },
    };

    const cloudRes = await fetch(googleEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!cloudRes.ok) {
      const errText = await cloudRes.text();
      res.statusCode = cloudRes.status;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'CLOUD_TTS_FAILURE', details: errText }));
      return;
    }

    const data = (await cloudRes.json()) as { audioContent: string };
    const audioBuffer = Buffer.from(data.audioContent, 'base64');

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.setHeader('X-TTS-Engine', 'google-cloud-tts');
    res.end(audioBuffer);
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'SERVER_ERROR', message: err?.message }));
  }
}
