import { Language } from '../types';
import { getApiUrl } from './apiConfig';

export interface SpeechDiagnostics {
  isSpeechSynthesisAvailable: boolean;
  voicesCount: number;
  hasTeluguVoice: boolean;
  hasHindiVoice: boolean;
  hasEnglishVoice: boolean;
  availableVoices: {
    en: string[];
    te: string[];
    hi: string[];
  };
  serverTtsStatus: {
    configured: boolean;
    provider: string;
    apiKeyConfigured: boolean;
    checked: boolean;
  };
  lastAttempt?: {
    text: string;
    lang: Language;
    engine: 'browser_speech_api' | 'google_cloud_tts' | 'pre_generated_file' | 'dev_audio_stream' | 'none';
    voiceName: string;
    status: 'idle' | 'loading' | 'playing' | 'success' | 'error';
    errorDetails?: string;
    timestamp: number;
  };
}

export interface TestPhraseResult {
  success: boolean;
  language: Language;
  phrase: string;
  engine: string;
  voice: string;
  source: 'browser' | 'cloud' | 'pre_generated' | 'none';
  error?: string;
}

export interface ServerTtsStatus {
  status: string;
  configured: boolean;
  provider: string;
  apiKeyConfigured: boolean;
  voices: {
    te: string;
    hi: string;
    en: string;
  };
  hasPreGeneratedAudio: boolean;
}

let isVoiceMuted = false;
let lastSpokenText: string | null = null;
let lastSpokenLang: Language = 'te';
let isSpeakingNow = false;

// Audio player instance for pre-recorded / cloud audio
let activeAudioElement: HTMLAudioElement | null = null;

// Speech synthesis voice cache
let cachedVoices: SpeechSynthesisVoice[] = [];

// Listeners
const speechListeners = new Set<(speaking: boolean) => void>();
const diagnosticListeners = new Set<(d: SpeechDiagnostics) => void>();

// Server status state
let serverTtsStatusState = {
  configured: false,
  provider: 'unknown',
  apiKeyConfigured: false,
  checked: false,
};

let hasCheckedServerStatus = false;
let serverStatusCheckPromise: Promise<boolean> | null = null;
let isServerConfigured = false;

export function resetServerTtsStatusCache(): void {
  hasCheckedServerStatus = false;
  serverStatusCheckPromise = null;
  isServerConfigured = false;
  serverTtsStatusState.checked = false;
  serverTtsStatusState.configured = false;
}

// Diagnostic state
let latestDiagnostics: SpeechDiagnostics = {
  isSpeechSynthesisAvailable: typeof window !== 'undefined' && 'speechSynthesis' in window,
  voicesCount: 0,
  hasTeluguVoice: false,
  hasHindiVoice: false,
  hasEnglishVoice: false,
  availableVoices: { en: [], te: [], hi: [] },
  serverTtsStatus: serverTtsStatusState,
};

let hasWarnedTeluguVoiceMissing = false;
let speechSequenceId = 0;
let keepAliveTimer: any = null;
let isAudioUnlocked = false;

function startKeepAlive() {
  stopKeepAlive();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  keepAliveTimer = setInterval(() => {
    try {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      }
    } catch (e) {
      // ignore
    }
  }, 10000);
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

/**
 * Unlocks the Web Audio / SpeechSynthesis context on user interaction.
 */
export function unlockAudioContext(): void {
  if (isAudioUnlocked || typeof window === 'undefined') return;
  isAudioUnlocked = true;

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    }
  } catch (e) {
    // ignore
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
    } catch {
      // ignore
    }
  }
}

// Attach one-time window listeners for first interaction unlock
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudioContext();
    window.removeEventListener('pointerdown', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
  };
  window.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
  window.addEventListener('keydown', handleFirstInteraction, { passive: true });
  window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
}

// Pre-recorded audio map
const PRE_RECORDED_AUDIO: Record<Language, Record<string, string>> = {
  te: {
    'గ్రామ కనెక్ట్కు స్వాగతం.': '/audio/te/welcome.mp3',
    'గ్రామ కనెక్ట్‌కు స్వాగతం.': '/audio/te/welcome.mp3',
    'గ్రామకనెక్ట్‌కి స్వాగతం.': '/audio/te/welcome.mp3',
    'భాష ఎంపిక చేయబడింది: తెలుగు. గ్రామకనెక్ట్‌కి స్వాగతం.': '/audio/te/lang_selected.mp3',
    'నాకు పని కావాలి లేదా యంత్రాలను నమోదు చేయాలి': '/audio/te/menu_work.mp3',
    'నాకు పని కావాలి లేదా సేవలు అందించడానికి': '/audio/te/menu_work.mp3',
    'నాకు వ్యవసాయ సేవలు కావాలి. కూలీలు, ట్రాక్టర్, హార్వెస్టర్ మరియు రవాణా': '/audio/te/menu_services.mp3',
    'నాకు వ్యవసాయ సేవలు కావాలి': '/audio/te/menu_services.mp3',
    'తెరిచేందుకు మరోసారి నొక్కండి': '/audio/te/two_tap_hint.mp3',
    'వ్యవసాయ కూలీలు. విత్తనాలు, నాట్లు, కలుపు మరియు కోత పనులకు కూలీలు': '/audio/te/cat_person.mp3',
    'ట్రాక్టర్ మరియు వ్యవసాయ పరికరాలు. నాగలి, రోటవేటర్, గొర్రు మరియు ట్రాలీ': '/audio/te/cat_tractor.mp3',
    'పంట కోత హార్వెస్టర్ సేవలు. వరి, మొక్కజొన్న మరియు గోధుమ కోత యంత్రాలు': '/audio/te/cat_harvester.mp3',
    'మినీ ట్రక్ రవాణా. మార్కెట్ లేదా మిల్లుకు పంట ఉత్పత్తుల రవాణా': '/audio/te/cat_truck.mp3',
    'వ్యవసాయ కూలీగా నమోదు చేసుకోండి': '/audio/te/hub_worker.mp3',
    'మీ ట్రాక్టర్ వివరాలను నమోదు చేయండి': '/audio/te/hub_tractor.mp3',
    'హార్వెస్టర్ సేవలను నమోదు చేయండి': '/audio/te/hub_harvester.mp3',
    'మినీ ట్రక్ రవాణా సేవలను నమోదు చేయండి': '/audio/te/hub_truck.mp3',
  },
  hi: {
    'ग्राम कनेक्ट में आपका स्वागत है।': '/audio/hi/welcome.mp3',
    'भाषा चुनी गई: हिन्दी। ग्रामकनेक्ट में आपका स्वागत है।': '/audio/hi/lang_selected.mp3',
    'मुझे काम चाहिए या मशीनरी पंजीकृत करनी है': '/audio/hi/menu_work.mp3',
    'मुझे काम चाहिए या सेवाएं प्रदान करनी हैं': '/audio/hi/menu_work.mp3',
    'मुझे कृषि सेवाएं चाहिए। श्रमिक, ट्रैक्टर, हार्वेस्टर या परिवहन': '/audio/hi/menu_services.mp3',
    'मुझे कृषि सेवाएं चाहिए': '/audio/hi/menu_services.mp3',
    'खोलने के लिए दोबारा टैप करें': '/audio/hi/two_tap_hint.mp3',
  },
  en: {
    'welcome to gramaconnect.': '/audio/en/welcome.mp3',
    'language selected: english. welcome to gramaconnect.': '/audio/en/lang_selected.mp3',
    'i am looking for work or registering machinery': '/audio/en/menu_work.mp3',
    'i am looking for work or offering services': '/audio/en/menu_work.mp3',
    'i need agricultural services. workers, tractor, harvester, or transport': '/audio/en/menu_services.mp3',
    'i need agricultural services': '/audio/en/menu_services.mp3',
    'tap again to open': '/audio/en/two_tap_hint.mp3',
  },
};

/**
 * Initializes voice listeners and loads browser voices asynchronously.
 */
function initVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  const load = () => {
    try {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        cachedVoices = voices;
        updateDiagnostics();
      }
    } catch (e) {
      console.warn('Error loading speech voices:', e);
    }
  };

  load();

  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = load;
  }
  try {
    window.speechSynthesis.addEventListener('voiceschanged', load);
  } catch (e) {
    // ignore
  }
}

// Initialise on script load
if (typeof window !== 'undefined') {
  initVoices();
  // Check server status after small tick
  setTimeout(checkServerTtsStatus, 100);
}

/**
 * Checks server TTS endpoint status once per session and caches the result.
 * Avoids any repeated network requests if the server is unconfigured.
 */
export async function checkServerTtsStatus(): Promise<ServerTtsStatus | null> {
  if (typeof window === 'undefined') return null;

  if (hasCheckedServerStatus) {
    return {
      status: 'ok',
      configured: isServerConfigured,
      provider: serverTtsStatusState.provider,
      apiKeyConfigured: serverTtsStatusState.apiKeyConfigured,
      voices: {
        te: 'te-IN-Standard-A',
        hi: 'hi-IN-Standard-A',
        en: 'en-IN-Standard-A',
      },
      hasPreGeneratedAudio: true,
    };
  }

  if (serverStatusCheckPromise) {
    await serverStatusCheckPromise;
    return {
      status: 'ok',
      configured: isServerConfigured,
      provider: serverTtsStatusState.provider,
      apiKeyConfigured: serverTtsStatusState.apiKeyConfigured,
      voices: {
        te: 'te-IN-Standard-A',
        hi: 'hi-IN-Standard-A',
        en: 'en-IN-Standard-A',
      },
      hasPreGeneratedAudio: true,
    };
  }

  serverStatusCheckPromise = (async () => {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const timeoutId = controller ? setTimeout(() => controller.abort(), 2500) : null;
      const res = await fetch(getApiUrl('/api/tts/status'), {
        signal: controller ? controller.signal : undefined,
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (res.ok) {
        const data = (await res.json()) as ServerTtsStatus;
        isServerConfigured = Boolean(data.configured);
        serverTtsStatusState = {
          configured: isServerConfigured,
          provider: data.provider || 'google-cloud-tts',
          apiKeyConfigured: Boolean(data.apiKeyConfigured ?? isServerConfigured),
          checked: true,
        };
      } else {
        isServerConfigured = false;
        serverTtsStatusState = {
          configured: false,
          provider: 'unknown',
          apiKeyConfigured: false,
          checked: true,
        };
      }
    } catch {
      isServerConfigured = false;
      serverTtsStatusState = {
        configured: false,
        provider: 'unknown',
        apiKeyConfigured: false,
        checked: true,
      };
    } finally {
      hasCheckedServerStatus = true;
      updateDiagnostics();
    }
    return isServerConfigured;
  })();

  await serverStatusCheckPromise;
  return {
    status: 'ok',
    configured: isServerConfigured,
    provider: serverTtsStatusState.provider,
    apiKeyConfigured: serverTtsStatusState.apiKeyConfigured,
    voices: {
      te: 'te-IN-Standard-A',
      hi: 'hi-IN-Standard-A',
      en: 'en-IN-Standard-A',
    },
    hasPreGeneratedAudio: true,
  };
}

/**
 * Computes diagnostic state without notifying listeners.
 */
function computeDiagnostics(): SpeechDiagnostics {
  const isAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voices = cachedVoices.length > 0 ? cachedVoices : (isAvailable ? window.speechSynthesis.getVoices() : []);

  const teVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('te')).map((v) => `${v.name} (${v.lang})`);
  const hiVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('hi')).map((v) => `${v.name} (${v.lang})`);
  const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en')).map((v) => `${v.name} (${v.lang})`);

  latestDiagnostics = {
    isSpeechSynthesisAvailable: isAvailable,
    voicesCount: voices.length,
    hasTeluguVoice: teVoices.length > 0,
    hasHindiVoice: hiVoices.length > 0,
    hasEnglishVoice: enVoices.length > 0,
    availableVoices: {
      te: teVoices,
      hi: hiVoices,
      en: enVoices,
    },
    serverTtsStatus: serverTtsStatusState,
    lastAttempt: latestDiagnostics.lastAttempt,
  };

  return latestDiagnostics;
}

/**
 * Updates diagnostic state and notifies subscribers.
 */
function updateDiagnostics() {
  const diag = computeDiagnostics();
  diagnosticListeners.forEach((cb) => {
    try {
      cb(diag);
    } catch (e) {
      console.warn('Diagnostic listener error:', e);
    }
  });
}

export function getSpeechDiagnostics(): SpeechDiagnostics {
  return computeDiagnostics();
}

export function subscribeDiagnostics(callback: (d: SpeechDiagnostics) => void): () => void {
  diagnosticListeners.add(callback);
  return () => {
    diagnosticListeners.delete(callback);
  };
}

export function subscribeSpeechState(callback: (speaking: boolean) => void): () => void {
  speechListeners.add(callback);
  callback(isSpeakingNow);
  return () => {
    speechListeners.delete(callback);
  };
}

function notifySpeechListeners(speaking: boolean) {
  isSpeakingNow = speaking;
  speechListeners.forEach((cb) => {
    try {
      cb(speaking);
    } catch (e) {
      console.warn('Speech listener error:', e);
    }
  });
}

export function setVoiceMuted(muted: boolean) {
  isVoiceMuted = muted;
  if (muted) {
    cancelSpeech();
  }
}

export function getVoiceMuted(): boolean {
  return isVoiceMuted;
}

/**
 * Cancels all speech: stops both browser speechSynthesis and any playing HTMLAudioElement.
 */
export function cancelSpeech() {
  speechSequenceId++;
  stopKeepAlive();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // ignore
    }
  }

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement = null;
    } catch (e) {
      // ignore
    }
  }

  notifySpeechListeners(false);
}

/**
 * Maps application Language to the standard BCP-47 speech language code.
 */
export function getSpeechLangCode(language: Language): string {
  switch (language) {
    case 'te':
      return 'te-IN';
    case 'hi':
      return 'hi-IN';
    case 'en':
    default:
      return 'en-IN';
  }
}

/**
 * Checks if the browser has an authentic installed voice for the given language.
 * Strictly checks for language prefix (te, hi, en) and NEVER returns true for
 * an English voice when Telugu or Hindi is requested.
 */
export function hasBrowserVoice(language: Language): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return false;

  const targetPrefix = language === 'te' ? 'te' : language === 'hi' ? 'hi' : 'en';
  return voices.some((v) => {
    const langLower = v.lang.toLowerCase().replace(/_/g, '-');
    return (
      langLower.startsWith(targetPrefix) ||
      (language === 'te' && (langLower.includes('te-') || v.name.toLowerCase().includes('telugu')))
    );
  });
}

/**
 * Finds the best matching voice for a given language, prioritizing female voices.
 * Returns undefined if no voice for that specific language prefix is installed.
 * NEVER returns an English voice for Telugu or Hindi!
 */
export function findBestVoice(language: Language): SpeechSynthesisVoice | undefined {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return undefined;
  }

  let voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      cachedVoices = voices;
    }
  }
  if (!voices || voices.length === 0) return undefined;

  const targetPrefix = language === 'te' ? 'te' : language === 'hi' ? 'hi' : 'en';
  const langVoices = voices.filter((v) => {
    const langLower = v.lang.toLowerCase().replace(/_/g, '-');
    return (
      langLower.startsWith(targetPrefix) ||
      (language === 'te' && (langLower.includes('te-') || v.name.toLowerCase().includes('telugu')))
    );
  });

  if (langVoices.length === 0) {
    if (language === 'te' && !hasWarnedTeluguVoiceMissing) {
      hasWarnedTeluguVoiceMissing = true;
      console.warn(
        '[SpeechGuidance] Native Telugu (te-IN) voice is not installed in this browser/device. Voice engine falling back.'
      );
    }
    return undefined;
  }

  const femaleKeywords = [
    'female',
    'woman',
    'swara',
    'kalpana',
    'geeta',
    'heera',
    'priya',
    'neerja',
    'chitra',
    'shruti',
    'veena',
    'zira',
    'aria',
    'jenny',
    'google हिन्दी',
    'google te-in',
    'google hi-in',
    'google',
  ];

  const preferredFemaleVoice = langVoices.find((v) => {
    const name = v.name.toLowerCase();
    return femaleKeywords.some((kw) => name.includes(kw));
  });

  return preferredFemaleVoice || langVoices[0];
}

/**
 * Ensures voices are loaded from window.speechSynthesis, waiting up to 250ms
 * if voices are initially empty on first interaction.
 */
async function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  let voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    cachedVoices = voices;
    return voices;
  }
  await new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        try {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) cachedVoices = v;
        } catch {}
        resolve();
      }
    };
    const timer = setTimeout(finish, 250);
    try {
      window.speechSynthesis.addEventListener(
        'voiceschanged',
        () => {
          clearTimeout(timer);
          finish();
        },
        { once: true }
      );
    } catch {
      // ignore
    }
  });
  return cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
}

/**
 * Plays audio through an HTMLAudioElement with a 4-second timeout and robust error handling.
 */
function playAudioUrl(url: string, seqId?: number, timeoutMs = 4000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (seqId !== undefined && seqId !== speechSequenceId) {
      resolve();
      return;
    }

    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    let settled = false;
    let timer: any = null;

    const cleanup = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const audio = new Audio();
    activeAudioElement = audio;

    timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      try {
        audio.pause();
        audio.src = '';
      } catch {}
      notifySpeechListeners(false);
      reject(new Error(`Audio playback timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    audio.onplay = () => {
      if (seqId !== undefined && seqId !== speechSequenceId) {
        audio.pause();
        return;
      }
      notifySpeechListeners(true);
    };

    audio.onended = () => {
      if (settled) return;
      settled = true;
      cleanup();
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      notifySpeechListeners(false);
      resolve();
    };

    audio.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      notifySpeechListeners(false);
      const errMsg = audio.error
        ? `MediaError ${audio.error.code}: ${audio.error.message || 'Source could not be decoded or loaded'}`
        : 'Audio load/network error';
      reject(new Error(errMsg));
    };

    audio.src = url;

    audio.play().catch((err) => {
      if (settled) return;
      settled = true;
      cleanup();
      notifySpeechListeners(false);
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      reject(err);
    });
  });
}

/**
 * Synthesizes speech using the browser's built-in SpeechSynthesis API.
 * Preserves rural kiosk pacing (0.88 rate), pitch (1.05), sentence chunking,
 * and Chrome keep-alive.
 * If no authentic voice exists for language, logs a single clear warning
 * and attempts default synthesizer voice without throwing.
 */
function speakViaBrowserSpeech(
  normalizedText: string,
  language: Language,
  currentSeq: number,
  browserVoice?: SpeechSynthesisVoice
): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('[SpeechGuidance] SpeechSynthesis API not supported in this browser.');
      resolve();
      return;
    }

    if (speechSequenceId !== currentSeq) {
      resolve();
      return;
    }

    const voice = browserVoice || findBestVoice(language);
    const targetLangCode = getSpeechLangCode(language);

    if (!voice) {
      console.warn(
        `[SpeechGuidance] No authentic browser voice found for language "${language}" (${targetLangCode}). Synthesizer attempting playback with system voice.`
      );
    }

    latestDiagnostics.lastAttempt = {
      text: normalizedText,
      lang: language,
      engine: 'browser_speech_api',
      voiceName: voice ? `${voice.name} (${voice.lang})` : `System Default (${targetLangCode})`,
      status: 'playing',
      timestamp: Date.now(),
    };
    updateDiagnostics();

    try {
      // Split into natural sentence chunks to prevent Chrome 15s freeze
      const rawChunks = normalizedText.split(/(?<=[.!?।\n])\s+/).filter(Boolean);
      const chunks = rawChunks.length > 0 ? rawChunks : [normalizedText];

      let chunkIndex = 0;
      startKeepAlive();

      const speakNextChunk = () => {
        if (speechSequenceId !== currentSeq || chunkIndex >= chunks.length) {
          stopKeepAlive();
          notifySpeechListeners(false);
          if (speechSequenceId === currentSeq && latestDiagnostics.lastAttempt) {
            latestDiagnostics.lastAttempt.status = 'success';
            updateDiagnostics();
          }
          resolve();
          return;
        }

        const chunkText = chunks[chunkIndex++];
        const utterance = new SpeechSynthesisUtterance(chunkText);
        utterance.lang = targetLangCode;
        if (voice) {
          utterance.voice = voice;
        }
        utterance.rate = 0.88; // Relaxed rural kiosk pacing
        utterance.pitch = 1.05;

        utterance.onstart = () => {
          if (speechSequenceId === currentSeq) {
            notifySpeechListeners(true);
          }
        };

        utterance.onend = () => {
          if (speechSequenceId === currentSeq) {
            speakNextChunk();
          } else {
            stopKeepAlive();
            notifySpeechListeners(false);
            resolve();
          }
        };

        utterance.onerror = (event) => {
          stopKeepAlive();
          notifySpeechListeners(false);
          const errDetail = event.error || 'SpeechSynthesisUtterance error';
          console.warn('Browser TTS utterance event:', errDetail);
          if (speechSequenceId === currentSeq && latestDiagnostics.lastAttempt) {
            latestDiagnostics.lastAttempt.status = 'error';
            latestDiagnostics.lastAttempt.errorDetails = errDetail;
            updateDiagnostics();
          }
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    } catch (err: any) {
      stopKeepAlive();
      notifySpeechListeners(false);
      console.warn('[SpeechGuidance] Exception in browser speech synthesis:', err?.message || err);
      if (latestDiagnostics.lastAttempt) {
        latestDiagnostics.lastAttempt.status = 'error';
        latestDiagnostics.lastAttempt.errorDetails = err?.message || String(err);
        updateDiagnostics();
      }
      resolve();
    }
  });
}

/**
 * Speaks text using the best available engine:
 * 1. Pre-generated audio file (if text matches fixed kiosk phrases)
 * 2. Browser SpeechSynthesis (if authentic voice for that language is installed)
 * 3. Server Cloud TTS fallback (/api/tts - if configured)
 * 4. ALWAYS falls back to browser SpeechSynthesis on server failure / unconfigured state
 */
export async function speakText(
  text: string,
  language: Language,
  options?: { forceEngine?: 'browser' | 'cloud' | 'auto' }
): Promise<void> {
  if (!text) {
    return;
  }

  // Cancel prior speech first before setting new sequence
  cancelSpeech();

  if (isVoiceMuted) {
    return;
  }

  // Generate unique sequence ID to prevent collision between rapid taps
  const currentSeq = ++speechSequenceId;

  lastSpokenText = text;
  lastSpokenLang = language;

  const normalizedText = text.trim();
  const lowerText = normalizedText.toLowerCase();
  const forceEngine = options?.forceEngine || 'auto';

  // 1. Check for Pre-generated Audio File (Instant zero-latency audio)
  if (forceEngine !== 'browser') {
    const preRecordedMap = PRE_RECORDED_AUDIO[language];
    const preRecordedPath = preRecordedMap?.[normalizedText] || preRecordedMap?.[lowerText];

    if (preRecordedPath) {
      latestDiagnostics.lastAttempt = {
        text: normalizedText,
        lang: language,
        engine: 'pre_generated_file',
        voiceName: `Pre-Recorded High-Fidelity (${language})`,
        status: 'playing',
        timestamp: Date.now(),
      };
      updateDiagnostics();

      try {
        await playAudioUrl(preRecordedPath, currentSeq, 4000);
        if (speechSequenceId === currentSeq && latestDiagnostics.lastAttempt) {
          latestDiagnostics.lastAttempt.status = 'success';
          updateDiagnostics();
        }
        return;
      } catch (e) {
        console.warn('Pre-generated audio failed, falling back to synthesis:', e);
      }
    }
  }

  // Ensure voices are loaded if browser synthesis is ready
  await ensureVoicesLoaded();
  if (speechSequenceId !== currentSeq) {
    return;
  }

  const browserVoice = findBestVoice(language);

  // 2. If authentic browser voice exists and cloud is not explicitly forced, use browser voice immediately
  if (forceEngine !== 'cloud' && browserVoice) {
    // Chrome buffer: small pause before speaking
    await new Promise((r) => setTimeout(r, 60));
    if (speechSequenceId !== currentSeq) {
      return;
    }
    return speakViaBrowserSpeech(normalizedText, language, currentSeq, browserVoice);
  }

  // 3. Otherwise: Check if Server TTS is configured (checked once per session)
  if (!hasCheckedServerStatus) {
    await checkServerTtsStatus();
  }

  const isServerAvailable = isServerConfigured;

  // If server is configured and forceEngine is not 'browser', try cloud TTS
  if (forceEngine !== 'browser' && isServerAvailable) {
    const ttsUrl = getApiUrl(`/api/tts?text=${encodeURIComponent(normalizedText)}&lang=${language}`);

    latestDiagnostics.lastAttempt = {
      text: normalizedText,
      lang: language,
      engine: 'google_cloud_tts',
      voiceName: language === 'te' ? 'te-IN-Standard-A' : language === 'hi' ? 'hi-IN-Standard-A' : 'en-IN-Standard-A',
      status: 'loading',
      timestamp: Date.now(),
    };
    updateDiagnostics();

    try {
      await playAudioUrl(ttsUrl, currentSeq, 4000);
      if (speechSequenceId === currentSeq && latestDiagnostics.lastAttempt) {
        latestDiagnostics.lastAttempt.status = 'success';
        updateDiagnostics();
      }
      return;
    } catch (err: any) {
      console.warn(
        `[Cloud TTS Failed for ${language} - Falling back to browser speech]:`,
        err?.message || err
      );
      // Fall through to browser speech fallback! Never fail silently!
    }
  }

  // 4. Fallback: Browser Web Speech API (Always called if server is unconfigured, errored, timed out, or non-200)
  return speakViaBrowserSpeech(normalizedText, language, currentSeq, browserVoice);
}

/**
 * Replays the last spoken announcement on user demand.
 */
export function replaySpeech(): Promise<void> | void {
  if (lastSpokenText) {
    return speakText(lastSpokenText, lastSpokenLang);
  }
}

/**
 * Test button execution specifically testing English, Telugu, or Hindi.
 */
export async function testSpeechPhrase(language: Language): Promise<TestPhraseResult> {
  const testPhrases: Record<Language, string> = {
    en: 'Welcome to GramaConnect.',
    te: 'గ్రామ కనెక్ట్కు స్వాగతం.',
    hi: 'ग्राम कनेक्ट में आपका स्वागत है।',
  };

  const phrase = testPhrases[language];
  const browserVoice = findBestVoice(language);
  const preRecordedMap = PRE_RECORDED_AUDIO[language];
  const hasPreRecorded = Boolean(preRecordedMap?.[phrase]);

  let expectedSource: 'browser' | 'cloud' | 'pre_generated' = 'cloud';
  let engineName = 'Google Cloud TTS (/api/tts)';
  let voiceName = language === 'te' ? 'te-IN-Standard-A' : language === 'hi' ? 'hi-IN-Standard-A' : 'en-IN-Standard-A';

  if (hasPreRecorded) {
    expectedSource = 'pre_generated';
    engineName = 'Pre-Recorded High-Fidelity Audio File';
    voiceName = `Native Spoken (${language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : 'English'})`;
  } else if (browserVoice) {
    expectedSource = 'browser';
    engineName = 'Browser Web Speech API';
    voiceName = `${browserVoice.name} (${browserVoice.lang})`;
  }

  try {
    await speakText(phrase, language);
    return {
      success: true,
      language,
      phrase,
      engine: latestDiagnostics.lastAttempt?.engine || engineName,
      voice: latestDiagnostics.lastAttempt?.voiceName || voiceName,
      source: expectedSource,
    };
  } catch (err: any) {
    return {
      success: false,
      language,
      phrase,
      engine: engineName,
      voice: voiceName,
      source: expectedSource,
      error: err?.message || 'Speech playback failed',
    };
  }
}
