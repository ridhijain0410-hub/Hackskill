/**
 * Web Speech API text-to-speech implementation for Mitra One
 * Simplified strictly for English and Hindi:
 *
 * Requirements:
 * 1. Language mapping:
 *    English -> en-IN
 *    Hindi   -> hi-IN
 * 2. When English is selected:
 *    - Speak using an English-compatible voice.
 *    - Prefer en-IN.
 *    - If en-IN is unavailable, use another English voice.
 * 3. When Hindi is selected:
 *    - Speak using a Hindi-compatible voice.
 *    - Prefer hi-IN.
 *    - If a Hindi voice is unavailable, DO NOT use an English voice.
 *    - Do not show a false "Hindi voice is working" state.
 *    - Show: "Hindi voice playback is not available on this device. You can still read the Hindi response."
 * 4. speakText(text, language):
 *    - Stop any currently playing speech using speechSynthesis.cancel().
 *    - Create SpeechSynthesisUtterance.
 *    - Set utterance.lang to:
 *      "en-IN" for English
 *      "hi-IN" for Hindi
 *    - Find a matching voice from speechSynthesis.getVoices().
 *    - Prefer the exact language match.
 *    - Call speechSynthesis.speak(utterance).
 *    - Handle onstart, onend and onerror.
 *    - Do not silently fall back from Hindi to English.
 * 5. Handle speechSynthesis voices loading asynchronously using voiceschanged.
 */

import { useState, useEffect } from 'react';
import { LanguageCode } from '../types';

export const LANGUAGE_LOCALE_MAP: Record<string, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  english: 'en-IN',
  hindi: 'hi-IN',
  en: 'en-IN',
  hi: 'hi-IN',
  'en-IN': 'en-IN',
  'hi-IN': 'hi-IN',
};

// Backwards compatibility alias
export const SPEECH_LANG_MAP = LANGUAGE_LOCALE_MAP;

export const HINDI_UNAVAILABLE_MESSAGE =
  'Hindi voice playback is not available on this device. You can still read the response.';

// Module-level references to prevent garbage collection in Chromium
let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeSpeakingText = '';
let speechResumeInterval: ReturnType<typeof setInterval> | null = null;

// Voice unavailable notification listeners
type VoiceUnavailableListener = (message: string) => void;
const voiceUnavailableListeners: Set<VoiceUnavailableListener> = new Set();

export function onVoiceUnavailable(listener: VoiceUnavailableListener): () => void {
  voiceUnavailableListeners.add(listener);
  return () => {
    voiceUnavailableListeners.delete(listener);
  };
}

export function notifyVoiceUnavailable(message: string = HINDI_UNAVAILABLE_MESSAGE): void {
  voiceUnavailableListeners.forEach((listener) => {
    try {
      listener(message);
    } catch {
      // ignore
    }
  });
}

// Global active speech language tracker (defaults to 'en')
let activeSpeechLanguage: LanguageCode = 'en';

export function setCurrentSpeechLanguage(lang: LanguageCode): void {
  activeSpeechLanguage = lang === 'hi' ? 'hi' : 'en';
}

export function getCurrentSpeechLanguage(): LanguageCode {
  return activeSpeechLanguage;
}

// Global speaking state listeners
type SpeechStateListener = (isSpeaking: boolean, text: string) => void;
const speechStateListeners: Set<SpeechStateListener> = new Set();

export function onSpeechStateChange(listener: SpeechStateListener): () => void {
  speechStateListeners.add(listener);
  try {
    listener(isSpeaking(), activeSpeakingText);
  } catch {
    // ignore
  }
  return () => {
    speechStateListeners.delete(listener);
  };
}

function notifySpeechState(isSpeakingStatus: boolean, text: string): void {
  activeSpeakingText = isSpeakingStatus ? text : '';
  speechStateListeners.forEach((l) => {
    try {
      l(isSpeakingStatus, activeSpeakingText);
    } catch {
      // ignore
    }
  });
}

/**
 * Preload voices on initial module load and register voiceschanged
 */
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      window.speechSynthesis.getVoices();
    });
  } catch {
    // ignore
  }
}

/**
 * Returns a voice matching the language:
 * - English: Prefer 'en-IN', fallback to any other English voice.
 * - Hindi: Prefer 'hi-IN', fallback to any other Hindi voice / Hindi name.
 *   DO NOT return an English voice for Hindi.
 */
export function getVoiceForLanguage(
  languageCode?: string | LanguageCode
): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    return null;
  }

  const langKey = (languageCode || getCurrentSpeechLanguage() || 'en').trim();
  const isHindi =
    langKey === 'hi' ||
    langKey.toLowerCase() === 'hindi' ||
    langKey.toLowerCase().startsWith('hi');

  if (isHindi) {
    // 1. Prefer exact language match 'hi-IN'
    const exactHiIn = voices.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang === 'hi-in';
    });
    if (exactHiIn) return exactHiIn;

    // 2. Prefix match for Hindi ('hi')
    const anyHindiLang = voices.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith('hi');
    });
    if (anyHindiLang) return anyHindiLang;

    // 3. Name match for Hindi
    const hindiByName = voices.find((v) => {
      const name = v.name.toLowerCase();
      const vLang = v.lang.toLowerCase();
      if (vLang.startsWith('en')) return false; // Strictly reject English voice
      return name.includes('hindi') || name.includes('हिन्दी');
    });
    if (hindiByName) return hindiByName;

    // If Hindi voice is unavailable, DO NOT use an English voice
    return null;
  }

  // English:
  // 1. Prefer 'en-IN'
  const exactEnIn = voices.find((v) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    return vLang === 'en-in';
  });
  if (exactEnIn) return exactEnIn;

  // 2. If en-IN is unavailable, use another English voice
  const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  // 3. Default voice if English
  const defaultVoice = voices.find((v) => v.default && v.lang.toLowerCase().startsWith('en'));
  if (defaultVoice) return defaultVoice;

  return null;
}

export function isVoiceAvailableForLanguage(langCode: LanguageCode | string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  const langKey = (langCode || 'en').trim().toLowerCase();
  if (langKey === 'en' || langKey === 'english' || langKey.startsWith('en')) {
    return true;
  }
  return getVoiceForLanguage('hi') !== null;
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: unknown) => void;
  onFallback?: (message: string) => void;
}

/**
 * Clean text for audio synthesis
 */
function sanitizeSpeechText(text: string): string {
  return text
    .replace(/[#*_`~]/g, '')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

/**
 * Main speakText(text, language) function
 *
 * 1. Stop any currently playing speech using speechSynthesis.cancel().
 * 2. Create SpeechSynthesisUtterance.
 * 3. Set utterance.lang to:
 *    "en-IN" for English
 *    "hi-IN" for Hindi
 * 4. Find a matching voice from speechSynthesis.getVoices().
 * 5. Prefer the exact language match.
 * 6. Call speechSynthesis.speak(utterance).
 * 7. Handle onstart, onend and onerror.
 * 8. Do not silently fall back from Hindi to English.
 */
export function speakText(
  text: string,
  language?: string | LanguageCode,
  options?: SpeakOptions | (() => void)
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment.');
    return false;
  }

  const onEnd = typeof options === 'function' ? options : options?.onEnd;
  const onStart = typeof options === 'object' ? options?.onStart : undefined;
  const onError = typeof options === 'object' ? options?.onError : undefined;
  const onFallback = typeof options === 'object' ? options?.onFallback : undefined;

  // 1. Stop any currently playing speech using speechSynthesis.cancel()
  stopSpeaking();

  const cleanText = sanitizeSpeechText(text || '');
  if (!cleanText) {
    notifySpeechState(false, '');
    return false;
  }

  // Check if voices are loaded or wait for voiceschanged
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) {
    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      speakText(cleanText, language, options);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged, { once: true });

    // Fallback retry timeout
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      const retryVoices = window.speechSynthesis.getVoices();
      if (retryVoices && retryVoices.length > 0) {
        speakText(cleanText, language, options);
      }
    }, 300);
    return false;
  }

  // Determine target language: English or Hindi
  const langKey = (language || getCurrentSpeechLanguage() || 'en').trim();
  const isHindi =
    langKey === 'hi' ||
    langKey.toLowerCase() === 'hindi' ||
    langKey.toLowerCase().startsWith('hi');

  const targetLang = isHindi ? 'hi-IN' : 'en-IN';

  // 4. Find a matching voice from speechSynthesis.getVoices()
  // 5. Prefer the exact language match
  const matchingVoice = getVoiceForLanguage(isHindi ? 'hi' : 'en');

  // 8. Do not silently fall back from Hindi to English
  // If Hindi voice is unavailable on the device, show:
  // "Hindi voice playback is not available on this device. You can still read the Hindi response."
  // Do not show a false "Hindi voice is working" state.
  if (isHindi && !matchingVoice) {
    console.warn('Hindi voice playback is not available on this device.');
    notifySpeechState(false, '');
    if (onFallback) {
      onFallback(HINDI_UNAVAILABLE_MESSAGE);
    }
    notifyVoiceUnavailable(HINDI_UNAVAILABLE_MESSAGE);
    return false;
  }

  try {
    // 2. Create SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // 3. Set utterance.lang to "en-IN" for English, "hi-IN" for Hindi
    utterance.lang = targetLang;

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // 7. Handle onstart, onend and onerror
    utterance.onstart = () => {
      notifySpeechState(true, cleanText);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      activeUtterance = null;
      if (speechResumeInterval) {
        clearInterval(speechResumeInterval);
        speechResumeInterval = null;
      }
      notifySpeechState(false, '');
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      activeUtterance = null;
      if (speechResumeInterval) {
        clearInterval(speechResumeInterval);
        speechResumeInterval = null;
      }
      notifySpeechState(false, '');
      if (onError) onError(event);
      if (onEnd) onEnd();
    };

    activeUtterance = utterance;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // 6. Call speechSynthesis.speak(utterance)
    window.speechSynthesis.speak(utterance);

    // Keep active in Chromium browsers
    if (speechResumeInterval) clearInterval(speechResumeInterval);
    speechResumeInterval = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          if (speechResumeInterval) {
            clearInterval(speechResumeInterval);
            speechResumeInterval = null;
          }
        }
      }
    }, 10000);

    return true;
  } catch (err) {
    console.error('Speech synthesis speak error:', err);
    activeUtterance = null;
    notifySpeechState(false, '');
    if (onError) onError(err);
    return false;
  }
}

/**
 * Stops any currently playing speech using speechSynthesis.cancel()
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch {
      // ignore
    }
  }
  activeUtterance = null;
  activeSpeakingText = '';
  if (speechResumeInterval) {
    clearInterval(speechResumeInterval);
    speechResumeInterval = null;
  }
  notifySpeechState(false, '');
}

/**
 * Checks if speech synthesis is currently active
 */
export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  return window.speechSynthesis.speaking;
}

/**
 * React hook to observe speaking status
 */
export function useSpeechStatus(textSnippetToMatch?: string) {
  const [speaking, setSpeaking] = useState<boolean>(() => isSpeaking());

  useEffect(() => {
    return onSpeechStateChange((isSpk, text) => {
      if (!isSpk) {
        setSpeaking(false);
      } else if (textSnippetToMatch) {
        const cleanSnippet = textSnippetToMatch.replace(/[#*_`~]/g, '').trim().toLowerCase();
        const cleanActive = text.toLowerCase();
        setSpeaking(cleanActive.includes(cleanSnippet) || cleanSnippet.includes(cleanActive));
      } else {
        setSpeaking(isSpk);
      }
    });
  }, [textSnippetToMatch]);

  return speaking;
}

/**
 * Pleasant Web Audio API gentle sound chime for feedback
 */
export function playGentleChime(type: 'success' | 'tap' | 'alert' = 'success') {
  if (typeof window === 'undefined') return;
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'alert') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(370, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch {
    // Audio Context might be blocked until user gesture, ignore silently
  }
}
