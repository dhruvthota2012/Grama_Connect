import type { Plugin, ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

// In-memory audio cache to reduce API calls and latency
const audioCache = new Map<string, Buffer>();

// Official Google Cloud Text-to-Speech Voices
const DEFAULT_VOICES = {
  te: process.env.TTS_VOICE_TE || 'te-IN-Standard-A', // Female Telugu
  hi: process.env.TTS_VOICE_HI || 'hi-IN-Standard-A', // Female Hindi
  en: process.env.TTS_VOICE_EN || 'en-IN-Standard-A', // Female English (India)
};

export function ttsPlugin(): Plugin {
  return {
    name: 'gramaconnect-tts-server',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url) {
          return next();
        }

        const parsedUrl = new URL(req.url, 'http://localhost');
        const pathname = parsedUrl.pathname;

        // 1. Status Check Endpoint: /api/tts/status
        if (pathname === '/api/tts/status') {
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
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(status, null, 2));
          return;
        }

        // 2. Synthesize Speech Endpoint: /api/tts?text=...&lang=te
        if (pathname === '/api/tts') {
          const text = parsedUrl.searchParams.get('text')?.trim();
          const lang = (parsedUrl.searchParams.get('lang') || 'te').toLowerCase();
          const requestedVoice = parsedUrl.searchParams.get('voice');

          if (!text) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'MISSING_TEXT', message: 'Query parameter "text" is required.' }));
            return;
          }

          const targetLang = lang === 'hi' ? 'hi' : lang === 'en' ? 'en' : 'te';
          const cacheKey = `${targetLang}:${text}`;

          // Check in-memory cache
          if (audioCache.has(cacheKey)) {
            const cachedBuffer = audioCache.get(cacheKey)!;
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Length', cachedBuffer.length);
            res.setHeader('X-TTS-Engine', 'memory-cache');
            res.end(cachedBuffer);
            return;
          }

          // Check if a pre-generated audio file matches in public/audio/
          const publicAudioMap: Record<string, string> = {
            'welcome to gramaconnect.': 'welcome.mp3',
            'గ్రామ కనెక్ట్కు స్వాగతం.': 'welcome.mp3',
            'ग्राम कनेक्ट में आपका स्वागत है।': 'welcome.mp3',
            'language selected: english. welcome to gramaconnect.': 'lang_selected.mp3',
            'భాష ఎంపిక చేయబడింది: తెలుగు. గ్రామకనెక్ట్‌కి స్వాగతం.': 'lang_selected.mp3',
            'भाषा चुनी गई: हिन्दी। ग्रामकनेक्ट में आपका स्वागत है।': 'lang_selected.mp3',
            'నాకు పని కావాలి లేదా యంత్రాలను నమోదు చేయాలి': 'menu_work.mp3',
            'నాకు వ్యవసాయ సేవలు కావాలి. కూలీలు, ట్రాక్టర్, హార్వెస్టర్ మరియు రవాణా': 'menu_services.mp3',
            'తెరిచేందుకు మరోసారి నొక్కండి': 'two_tap_hint.mp3',
          };

          const normalizedText = text.toLowerCase();
          const matchedFilename = publicAudioMap[normalizedText];

          if (matchedFilename) {
            const localFilePath = path.join(process.cwd(), 'public', 'audio', targetLang, matchedFilename);
            if (fs.existsSync(localFilePath)) {
              try {
                const buffer = fs.readFileSync(localFilePath);
                audioCache.set(cacheKey, buffer);
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Content-Length', buffer.length);
                res.setHeader('X-TTS-Engine', 'pre-generated-file');
                res.end(buffer);
                return;
              } catch (e) {
                console.warn('Error reading pre-generated audio:', e);
              }
            }
          }

          const apiKey = process.env.GOOGLE_TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;

          // Strategy A: Official Google Cloud Text-to-Speech API
          if (apiKey) {
            const voiceName = requestedVoice || DEFAULT_VOICES[targetLang];
            const bcp47 = targetLang === 'te' ? 'te-IN' : targetLang === 'hi' ? 'hi-IN' : 'en-IN';

            try {
              const cloudUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;
              const cloudRes = await fetch(cloudUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  input: { text },
                  voice: {
                    languageCode: bcp47,
                    name: voiceName,
                    ssmlGender: 'FEMALE',
                  },
                  audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: 0.9,
                    pitch: 0.5,
                  },
                }),
              });

              if (cloudRes.ok) {
                const data = (await cloudRes.json()) as { audioContent: string };
                if (data.audioContent) {
                  const audioBuffer = Buffer.from(data.audioContent, 'base64');
                  audioCache.set(cacheKey, audioBuffer);
                  res.setHeader('Content-Type', 'audio/mpeg');
                  res.setHeader('Content-Length', audioBuffer.length);
                  res.setHeader('X-TTS-Engine', 'google-cloud-tts');
                  res.setHeader('X-TTS-Voice', voiceName);
                  res.end(audioBuffer);
                  return;
                }
              } else {
                const errText = await cloudRes.text();
                console.warn(`[Google Cloud TTS Error] HTTP ${cloudRes.status}:`, errText);
              }
            } catch (err) {
              console.warn('[Google Cloud TTS Exception]:', err);
            }
          }

          // Strategy B: Development Network Stream Fallback
          // Ensures developer/tester immediately hears genuine spoken Telugu/Hindi without API setup
          try {
            const devUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${targetLang}&client=tw-ob&q=${encodeURIComponent(text)}`;
            const devRes = await fetch(devUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Referer': 'https://translate.google.com/',
              },
            });

            if (devRes.ok) {
              const buffer = Buffer.from(await devRes.arrayBuffer());
              audioCache.set(cacheKey, buffer);
              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Content-Length', buffer.length);
              res.setHeader('X-TTS-Engine', 'dev-audio-stream');
              res.setHeader('X-TTS-Voice', `${targetLang}-online-stream`);
              res.end(buffer);
              return;
            }
          } catch (devErr) {
            console.warn('[Dev Audio Stream Fallback Error]:', devErr);
          }

          // Strategy C: If no network and no API key
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'TTS_UNAVAILABLE',
              message:
                'Telugu TTS audio is unavailable because no browser voice is installed, no local pre-generated file matches this text, and Google Cloud TTS API key is not configured.',
              language: targetLang,
              suggestedAction:
                'Set GOOGLE_TTS_API_KEY in .env file or use one of the pre-recorded kiosk menu phrases.',
            })
          );
          return;
        }

        next();
      });
    },
  };
}
