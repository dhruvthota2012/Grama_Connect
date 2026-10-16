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

export interface SpeakOptions {
  audioKey?: string;
  forceEngine?: 'browser' | 'cloud' | 'auto';
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

// Server status state & session cache
let serverTtsStatusState = {
  configured: false,
  provider: 'unknown',
  apiKeyConfigured: false,
  checked: false,
};
let serverTtsAvailableForSession: boolean | null = null;
const failedAudioFiles = new Set<string>();

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
let isAudioUnlocked = false;

// Active utterance reference to prevent V8 garbage collection mid-speech
let activeUtterance: SpeechSynthesisUtterance | null = null;

// Keep-alive timers (only run for utterances > 10 seconds, never leave paused)
let keepAliveTimeout: ReturnType<typeof setTimeout> | null = null;
let keepAliveInterval: ReturnType<typeof setInterval> | null = null;

function clearKeepAlive() {
  if (keepAliveTimeout) {
    clearTimeout(keepAliveTimeout);
    keepAliveTimeout = null;
  }
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
}

function scheduleKeepAlive() {
  clearKeepAlive();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  // Only start keep-alive if utterance takes longer than ~10 seconds
  keepAliveTimeout = setTimeout(() => {
    keepAliveInterval = setInterval(() => {
      try {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      } catch {
        // ignore
      }
    }, 10000);
  }, 10000);
}

/**
 * Unlocks the Web Audio / SpeechSynthesis context on user interaction.
 */
export function unlockAudioContext(): void {
  if (isAudioUnlocked || typeof window === 'undefined') return;
  isAudioUnlocked = true;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    }
  } catch {
    // ignore
  }

  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
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
    'తెలుగు': '/audio/te/lang_selected.mp3',
    'తెలుగు. ఎంపిక చేయడానికి మరోసారి నొక్కండి.': '/audio/te/lang_selected.mp3',
    'నాకు పని కావాలి లేదా యంత్రాలను నమోదు చేయాలి': '/audio/te/menu_work.mp3',
    'నాకు పని కావాలి లేదా సేవలు అందించడానికి': '/audio/te/menu_work.mp3',
    'నాకు వ్యవసాయ సేవలు కావాలి. కూలీలు, ట్రాక్టర్, హార్వెస్టర్ మరియు రవాణా': '/audio/te/menu_services.mp3',
    'నాకు వ్యవసాయ సేవలు కావాలి': '/audio/te/menu_services.mp3',
    'తెరిచేందుకు మరోసారి నొక్కండి': '/audio/te/two_tap_hint.mp3',
    'వినడానికి ఒకసారి తాకండి, తెరవడానికి మళ్ళీ తాకండి': '/audio/te/two_tap_hint.mp3',
    'వ్యవసాయ కూలీలు. విత్తనాలు, నాట్లు, కలుపు మరియు కోత పనులకు కూలీలు': '/audio/te/cat_person.mp3',
    'వ్యవసాయ కూలీలు ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.': '/audio/te/cat_person.mp3',
    'ట్రాక్టర్ మరియు వ్యవసాయ పరికరాలు. నాగలి, రోటవేటర్, గొర్రు మరియు ట్రాలీ': '/audio/te/cat_tractor.mp3',
    'ట్రాక్టర్ మరియు పరికరాలు ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.': '/audio/te/cat_tractor.mp3',
    'పంట కోత హార్వెస్టర్ సేవలు. వరి, మొక్కజొన్న మరియు గోధుమ కోత యంత్రాలు': '/audio/te/cat_harvester.mp3',
    'కోత హార్వెస్టర్ ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.': '/audio/te/cat_harvester.mp3',
    'మినీ ట్రక్ రవాణా. మార్కెట్ లేదా మిల్లుకు పంట ఉత్పత్తుల రవాణా': '/audio/te/cat_truck.mp3',
    'మినీ ట్రక్ రవాణా ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.': '/audio/te/cat_truck.mp3',
    'వ్యవసాయ కూలీగా నమోదు చేసుకోండి': '/audio/te/hub_worker.mp3',
    'మీ ట్రాక్టర్ వివరాలను నమోదు చేయండి': '/audio/te/hub_tractor.mp3',
    'ట్రాక్టర్ రోజువారీ నమోదు (ఈ రోజు మాత్రమే)': '/audio/te/hub_tractor.mp3',
    'హార్వెస్టర్ సేవలను నమోదు చేయండి': '/audio/te/hub_harvester.mp3',
    'పంట కోత హార్వెస్టర్‌ను నమోదు చేయండి': '/audio/te/hub_harvester.mp3',
    'మినీ ట్రక్ రవాణా సేవలను నమోదు చేయండి': '/audio/te/hub_truck.mp3',
    'మినీ ట్రక్ రవాణా వాహనాన్ని నమోదు చేయండి': '/audio/te/hub_truck.mp3',
  },
  hi: {
    'ग्राम कनेक्ट में आपका स्वागत है।': '/audio/hi/welcome.mp3',
    'भाषा चुनी गई: हिन्दी। ग्रामकनेक्ट में आपका स्वागत है।': '/audio/hi/lang_selected.mp3',
    'हिन्दी': '/audio/hi/lang_selected.mp3',
    'हिन्दी। चुनने के लिए दोबारा टैप करें।': '/audio/hi/lang_selected.mp3',
    'मुझे काम चाहिए या मशीनरी पंजीकृत करनी है': '/audio/hi/menu_work.mp3',
    'मुझे काम चाहिए या सेवाएं प्रदान करनी हैं': '/audio/hi/menu_work.mp3',
    'मुझे कृषि सेवाएं चाहिए। श्रमिक, ट्रैक्टर, हार्वेस्टर या परिवहन': '/audio/hi/menu_services.mp3',
    'मुझे कृषि सेवाएं चाहिए': '/audio/hi/menu_services.mp3',
    'खोलने के लिए दोबारा टैप करें': '/audio/hi/two_tap_hint.mp3',
    'सुनने के लिए एक बार टैप करें, खोलने के लिए दोबारा टैप करें': '/audio/hi/two_tap_hint.mp3',
    'कृषि मजदूर चुना गया। विशिष्ट कार्य चुनने के लिए दोबारा टैप करें।': '/audio/hi/cat_person.mp3',
    'ట్రాక్టర్ మరియు పరికరాలు...': '/audio/hi/cat_tractor.mp3',
  },
  en: {
    'welcome to gramaconnect.': '/audio/en/welcome.mp3',
    'language selected: english. welcome to gramaconnect.': '/audio/en/lang_selected.mp3',
    'english': '/audio/en/lang_selected.mp3',
    'english. tap again to select.': '/audio/en/lang_selected.mp3',
    'i am looking for work or registering machinery': '/audio/en/menu_work.mp3',
    'i am looking for work or offering services': '/audio/en/menu_work.mp3',
    'i need agricultural services. workers, tractor, harvester, or transport': '/audio/en/menu_services.mp3',
    'i need agricultural services': '/audio/en/menu_services.mp3',
    'tap again to open': '/audio/en/two_tap_hint.mp3',
    'tap once to hear, tap again to open': '/audio/en/two_tap_hint.mp3',
    'selected agricultural workers. tap again to choose the specific agricultural work.': '/audio/en/cat_person.mp3',
    'selected tractor and attachments. tap again to choose the specific agricultural work.': '/audio/en/cat_tractor.mp3',
    'selected crop harvesters. tap again to choose the specific agricultural work.': '/audio/en/cat_harvester.mp3',
    'selected mini truck transport. tap again to choose the specific agricultural work.': '/audio/en/cat_truck.mp3',
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
  } catch {
    // ignore
  }
}

// Initialise on script load
if (typeof window !== 'undefined') {
  initVoices();
  setTimeout(checkServerTtsStatus, 100);
}

/**
 * Checks server TTS endpoint status.
 */
export async function checkServerTtsStatus(): Promise<ServerTtsStatus | null> {
  if (typeof window === 'undefined') return null;

  try {
    const res = await fetch(getApiUrl('/api/tts/status'));
    if (res.ok) {
      const data = (await res.json()) as ServerTtsStatus;
      serverTtsStatusState = {
        configured: data.configured,
        provider: data.provider,
        apiKeyConfigured: data.apiKeyConfigured,
        checked: true,
      };
      updateDiagnostics();
      return data;
    }
  } catch {
    serverTtsStatusState.checked = true;
    updateDiagnostics();
  }
  return null;
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

function resetActiveAudioElement() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
      activeAudioElement = null;
    } catch {
      // ignore
    }
  }
}

/**
 * Cancels all speech: stops both browser speechSynthesis and any playing HTMLAudioElement.
 */
export function cancelSpeech() {
  speechSequenceId++;
  clearKeepAlive();

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }

  activeUtterance = null;
  resetActiveAudioElement();
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
 * Plays audio through an HTMLAudioElement.
 */
function playAudioUrl(url: string, seqId?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (seqId !== undefined && seqId !== speechSequenceId) {
      resolve();
      return;
    }

    resetActiveAudioElement();

    const audio = new Audio(url);
    activeAudioElement = audio;

    audio.onplay = () => {
      if (seqId !== undefined && seqId !== speechSequenceId) {
        audio.pause();
        return;
      }
      notifySpeechListeners(true);
    };

    audio.onended = () => {
      if (activeAudioElement === audio) {
        activeAudioElement = null;
      }
      notifySpeechListeners(false);
      resolve();
    };

    audio.onerror = () => {
      resetActiveAudioElement();
      notifySpeechListeners(false);
      reject(new Error(`Audio playback error: ${audio.error ? audio.error.message : 'File not found or format unsupported'}`));
    };

    audio.play().catch((err) => {
      notifySpeechListeners(false);
      resetActiveAudioElement();
      reject(err);
    });
  });
}

/**
 * Plays audio with an enforced timeout (default 4 seconds).
 */
function playAudioWithTimeout(url: string, seqId: number, timeoutMs = 4000): Promise<void> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let finished = false;

    const cleanup = () => {
      finished = true;
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    timer = setTimeout(() => {
      if (finished) return;
      cleanup();
      resetActiveAudioElement();
      reject(new Error(`Audio playback timed out after ${timeoutMs}ms for ${url}`));
    }, timeoutMs);

    playAudioUrl(url, seqId)
      .then(() => {
        if (!finished) {
          cleanup();
          resolve();
        }
      })
      .catch((err) => {
        if (!finished) {
          cleanup();
          reject(err);
        }
      });
  });
}

/**
 * Speaks text using the browser's built-in Web Speech API.
 */
function speakWithBrowserSpeech(
  text: string,
  language: Language,
  currentSeq: number,
  browserVoice?: SpeechSynthesisVoice
): Promise<void> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const voice = browserVoice || findBestVoice(language);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getSpeechLangCode(language);
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = 0.88;
      utterance.pitch = 1.05;

      // Retain module-level reference to prevent V8 GC mid-speech
      activeUtterance = utterance;
      scheduleKeepAlive();

      utterance.onstart = () => {
        if (speechSequenceId === currentSeq) {
          notifySpeechListeners(true);
        }
      };

      utterance.onend = () => {
        clearKeepAlive();
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        if (speechSequenceId === currentSeq) {
          notifySpeechListeners(false);
          if (latestDiagnostics.lastAttempt) {
            latestDiagnostics.lastAttempt.status = 'success';
            updateDiagnostics();
          }
        }
        resolve();
      };

      utterance.onerror = (event) => {
        clearKeepAlive();
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
        notifySpeechListeners(false);
        const errDetail = event.error || 'SpeechSynthesisUtterance error';
        console.warn('Browser TTS utterance error:', errDetail);
        if (speechSequenceId === currentSeq && latestDiagnostics.lastAttempt) {
          latestDiagnostics.lastAttempt.status = 'error';
          latestDiagnostics.lastAttempt.errorDetails = String(errDetail);
          updateDiagnostics();
        }
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err: unknown) {
      clearKeepAlive();
      activeUtterance = null;
      notifySpeechListeners(false);
      console.warn('SpeechSynthesis speak call error:', err);
      resolve();
    }
  });
}

/**
 * Speaks text using the best available engine:
 * 1. Pre-recorded audio clip (checked via key or phrase match; 4s timeout)
 * 2. Browser SpeechSynthesis (if authentic installed voice available)
 * 3. Server Cloud TTS fallback (/api/tts)
 * 4. Browser SpeechSynthesis fallback with standard language code
 */
export async function speakText(
  text: string,
  language: Language,
  options?: SpeakOptions
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

  // 1. Resolve Pre-recorded Audio File Candidate
  let candidateAudioPath: string | undefined = undefined;
  if (options?.audioKey) {
    candidateAudioPath = `/audio/${language}/${options.audioKey.toLowerCase()}.mp3`;
  } else {
    const preRecordedMap = PRE_RECORDED_AUDIO[language];
    candidateAudioPath = preRecordedMap?.[normalizedText] || preRecordedMap?.[lowerText];
  }

  // If candidate exists and has NOT previously 404'd/failed in this session
  if (forceEngine !== 'browser' && candidateAudioPath && !failedAudioFiles.has(candidateAudioPath)) {
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
      await playAudioWithTimeout(candidateAudioPath, currentSeq, 4000);
      if (speechSequenceId === currentSeq && latestDiagnostics.lastAttempt) {
        latestDiagnostics.lastAttempt.status = 'success';
        updateDiagnostics();
      }
      return;
    } catch (e: unknown) {
      console.warn(`[SpeechGuidance] Audio file ${candidateAudioPath} failed or timed out; falling back to synthesis:`, e);
      failedAudioFiles.add(candidateAudioPath);
      resetActiveAudioElement();
    }
  }

  // 2. Browser Speech Synthesis with authentic voice
  const browserVoice = findBestVoice(language);
  if (forceEngine !== 'cloud' && browserVoice) {
    latestDiagnostics.lastAttempt = {
      text: normalizedText,
      lang: language,
      engine: 'browser_speech_api',
      voiceName: `${browserVoice.name} (${browserVoice.lang})`,
      status: 'playing',
      timestamp: Date.now(),
    };
    updateDiagnostics();

    await new Promise((r) => setTimeout(r, 60));
    if (speechSequenceId !== currentSeq) {
      return;
    }

    return speakWithBrowserSpeech(normalizedText, language, currentSeq, browserVoice);
  }

  // 3. Server Cloud TTS fallback (/api/tts)
  if (forceEngine !== 'browser' && serverTtsAvailableForSession !== false) {
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
      await playAudioWithTimeout(ttsUrl, currentSeq, 3500);
      if (speechSequenceId === currentSeq && latestDiagnostics.lastAttempt) {
        latestDiagnostics.lastAttempt.status = 'success';
        serverTtsAvailableForSession = true;
        updateDiagnostics();
      }
      return;
    } catch (err: unknown) {
      console.warn(`[SpeechGuidance] Cloud TTS failed; caching session failure and falling back to browser synthesis:`, err);
      serverTtsAvailableForSession = false;
      resetActiveAudioElement();
    }
  }

  // 4. Guaranteed Browser Fallback (Ensures user NEVER hears silence)
  latestDiagnostics.lastAttempt = {
    text: normalizedText,
    lang: language,
    engine: 'browser_speech_api',
    voiceName: `Browser Built-in (${getSpeechLangCode(language)})`,
    status: 'playing',
    timestamp: Date.now(),
  };
  updateDiagnostics();

  await new Promise((r) => setTimeout(r, 60));
  if (speechSequenceId !== currentSeq) {
    return;
  }

  return speakWithBrowserSpeech(normalizedText, language, currentSeq);
}

/**
 * Replays the last spoken announcement on user demand.
 */
export function replaySpeech() {
  if (lastSpokenText) {
    speakText(lastSpokenText, lastSpokenLang);
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
  const candidate = `/audio/${language}/welcome.mp3`;
  const hasPreRecorded = !failedAudioFiles.has(candidate);

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
    await speakText(phrase, language, { audioKey: 'welcome' });
    return {
      success: true,
      language,
      phrase,
      engine: latestDiagnostics.lastAttempt?.engine || engineName,
      voice: latestDiagnostics.lastAttempt?.voiceName || voiceName,
      source: expectedSource,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Speech playback failed';
    return {
      success: false,
      language,
      phrase,
      engine: engineName,
      voice: voiceName,
      source: expectedSource,
      error: errorMsg,
    };
  }
}
