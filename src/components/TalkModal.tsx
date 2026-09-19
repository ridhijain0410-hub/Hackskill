import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Square,
  AlertTriangle,
  Keyboard,
  Send,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import {
  speakText,
  stopSpeaking,
  playGentleChime,
  isVoiceAvailableForLanguage,
  HINDI_UNAVAILABLE_MESSAGE,
} from '../utils/speech';
import { PageId, LanguageCode } from '../types';

export type VoiceState = 'normal' | 'listening' | 'processing' | 'speaking';

interface TalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPage: (page: PageId) => void;
  language?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
  autoStartOnOpen?: boolean;
}

export const TalkModal: React.FC<TalkModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPage,
  language = 'en',
  onLanguageChange,
  autoStartOnOpen = false,
}) => {
  // Enforce English (en-IN) and Hindi (hi-IN) only
  const activeLang: LanguageCode = language === 'hi' ? 'hi' : 'en';

  // Voice state: 'normal' | 'listening' | 'processing' | 'speaking'
  const [voiceState, setVoiceState] = useState<VoiceState>('normal');
  const [transcript, setTranscript] = useState('');
  const [mitraAnswer, setMitraAnswer] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [suggestedPage, setSuggestedPage] = useState<{ id: PageId; label: string } | null>(null);

  // Errors and fallbacks
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [hindiVoiceUnavailable, setHindiVoiceUnavailable] = useState(false);

  // Fallback typing mode
  const [showTypeInstead, setShowTypeInstead] = useState(false);
  const [typedQuestion, setTypedQuestion] = useState('');
  const [isSubmittingType, setIsSubmittingType] = useState(false);

  // Speech recognition reference
  const recognitionRef = useRef<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const hasAutoStartedRef = useRef(false);

  // Stop Speech Recognition safely
  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort?.();
        recognitionRef.current.stop?.();
        recognitionRef.current = null;
      }
    } catch {
      // ignore
    }
  };

  // Stop Speech Synthesis safely and return to normal
  const handleStopSpeaking = () => {
    stopSpeaking();
    setVoiceState('normal');
    playGentleChime('tap');
  };

  // Set default welcoming text based on language
  useEffect(() => {
    if (!mitraAnswer) {
      setMitraAnswer(
        activeLang === 'hi'
          ? 'नमस्ते! मैं मित्रा वन हूँ। मुझसे बोलकर बात करें या नीचे दिए गए किसी भी सवाल को चुनें। मैं सरल शब्दों में मदद करूँगा।'
          : 'Namaste! I am Mitra One. Speak to me like a friend, or tap any common question below. I will answer in simple words.'
      );
    }
  }, [activeLang, mitraAnswer]);

  // Clean up on modal open / close
  useEffect(() => {
    if (isOpen) {
      playGentleChime('tap');
      setErrorMessage(null);
      setMicPermissionDenied(false);
      setHindiVoiceUnavailable(false);
      setShowTypeInstead(false);
      setVoiceState('normal');

      // Check if Hindi voice is available when opened in Hindi mode
      if (activeLang === 'hi' && !isVoiceAvailableForLanguage('hi')) {
        setHindiVoiceUnavailable(true);
      }

      // If auto-start requested and hasn't started yet
      if (autoStartOnOpen && !hasAutoStartedRef.current) {
        hasAutoStartedRef.current = true;
        // Small delay to let modal mount and give focus
        const timer = setTimeout(() => {
          startListening();
        }, 350);
        return () => clearTimeout(timer);
      }
    } else {
      // Modal closed: Stop everything cleanly
      handleStopSpeaking();
      stopListening();
      setVoiceState('normal');
      hasAutoStartedRef.current = false;
    }
  }, [isOpen, activeLang]);

  // Keyboard accessibility: Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Switch voice language (strictly English en-IN or Hindi hi-IN)
  const handleLanguageSelect = (newLang: LanguageCode) => {
    if (voiceState === 'speaking') {
      handleStopSpeaking();
    }
    stopListening();
    setVoiceState('normal');
    setErrorMessage(null);

    if (onLanguageChange) {
      onLanguageChange(newLang);
    }

    if (newLang === 'hi') {
      const hiAvailable = isVoiceAvailableForLanguage('hi');
      setHindiVoiceUnavailable(!hiAvailable);
      setMitraAnswer(
        'नमस्ते! मैं मित्रा वन हूँ। मुझसे बोलकर बात करें या नीचे दिए गए किसी भी सवाल को चुनें। मैं सरल शब्दों में मदद करूँगा।'
      );
    } else {
      setHindiVoiceUnavailable(false);
      setMitraAnswer(
        'Namaste! I am Mitra One. Speak to me like a friend, or tap any common question below. I will answer in simple words.'
      );
    }
  };

  // Start real browser speech recognition (only on explicit user tap)
  const startListening = () => {
    // Stop any ongoing speech playback first
    if (voiceState === 'speaking') {
      handleStopSpeaking();
    }

    setErrorMessage(null);
    setMicPermissionDenied(false);

    const windowWithSpeech = window as unknown as {
      webkitSpeechRecognition?: new () => any;
      SpeechRecognition?: new () => any;
    };
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceState('normal');
      setErrorMessage(
        activeLang === 'hi'
          ? 'इस डिवाइस या ब्राउज़र पर आवाज़ पहचान उपलब्ध नहीं है। आप लिखकर पूछ सकते हैं।'
          : 'Voice recognition is not supported in this browser. You can type your question instead.'
      );
      setShowTypeInstead(true);
      return;
    }

    try {
      stopListening();

      const recognition = new SpeechRecognitionClass();
      // Strict Locale mapping
      recognition.lang = activeLang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      // Real state: ONLY transition to 'listening' when onstart fires!
      recognition.onstart = () => {
        setVoiceState('listening');
        setErrorMessage(null);
        setMicPermissionDenied(false);
        playGentleChime('tap');
      };

      recognition.onresult = (event: any) => {
        const text = event.results?.[0]?.[0]?.transcript;
        if (text && text.trim()) {
          setTranscript(text.trim());
          setVoiceState('processing');
          processUserSpeech(text.trim());
        } else {
          setVoiceState('normal');
        }
      };

      recognition.onerror = (event: any) => {
        const errType = event?.error;
        console.warn('Speech recognition error event:', errType);
        stopListening();
        setVoiceState('normal');

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setMicPermissionDenied(true);
          setErrorMessage(
            activeLang === 'hi'
              ? 'मित्रा वन से बात करने के लिए माइक्रोफ़ोन की अनुमति चाहिए। आप लिखकर भी पूछ सकते हैं।'
              : 'Microphone access is needed to talk to MITRA ONE. You can type your question instead.'
          );
        } else if (errType === 'no-speech') {
          setErrorMessage(
            activeLang === 'hi'
              ? 'मुझे कोई आवाज़ नहीं सुनाई दी। कृपया दोबारा बोलने के लिए बटन दबाएँ।'
              : 'I could not hear anything. Please tap to speak again or choose a question below.'
          );
        } else {
          setErrorMessage(
            activeLang === 'hi'
              ? 'आवाज़ पहचान में रुकावट आई। कृपया दोबारा प्रयास करें या लिखकर पूछें।'
              : 'Voice recognition was interrupted. Please tap to speak again or type instead.'
          );
        }
      };

      recognition.onend = () => {
        // Return to normal only if still in listening state (e.g. silence or cancel)
        setVoiceState((current) => (current === 'listening' ? 'normal' : current));
      };

      recognition.start();
    } catch (err: any) {
      console.warn('SpeechRecognition.start error:', err);
      stopListening();
      setVoiceState('normal');
      if (err?.name === 'NotAllowedError' || String(err).includes('not-allowed')) {
        setMicPermissionDenied(true);
        setErrorMessage(
          activeLang === 'hi'
            ? 'मित्रा वन से बात करने के लिए माइक्रोफ़ोन की अनुमति चाहिए। आप लिखकर भी पूछ सकते हैं।'
            : 'Microphone access is needed to talk to MITRA ONE. You can type your question instead.'
        );
      } else {
        setErrorMessage(
          activeLang === 'hi'
            ? 'माइक्रोफ़ोन शुरू करने में समस्या आई। आप लिखकर पूछ सकते हैं।'
            : 'Could not activate microphone. You can type your question instead.'
        );
      }
    }
  };

  // Primary toggle handler for the central Voice Assistant Control
  const handleVoiceControlClick = () => {
    if (voiceState === 'speaking') {
      handleStopSpeaking();
    } else if (voiceState === 'listening') {
      stopListening();
      setVoiceState('normal');
    } else if (voiceState === 'processing') {
      // Still processing, do not interrupt
    } else {
      startListening();
    }
  };

  // Process user speech or typed text via Gemini API
  const processUserSpeech = async (speech: string) => {
    try {
      const res = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: speech, language: activeLang }),
      });
      const data = await res.json();
      const answerText: string =
        data.answer ||
        (activeLang === 'hi'
          ? 'मैं आपकी बात सुन रहा हूँ और आपकी मदद के लिए उपस्थित हूँ।'
          : 'I am here with you and glad to help.');
      const stepList: string[] = Array.isArray(data.steps) ? data.steps : [];

      // Determine smart page navigation
      let pageLink: { id: PageId; label: string } | undefined = undefined;
      const lower = speech.toLowerCase();
      if (
        lower.includes('bill') ||
        lower.includes('electric') ||
        lower.includes('notice') ||
        lower.includes('letter') ||
        lower.includes('बिल')
      ) {
        pageLink = {
          id: 'understand',
          label: activeLang === 'hi' ? 'दस्तावेज़ समझें (Understand)' : 'Open Understand',
        };
      } else if (
        lower.includes('scam') ||
        lower.includes('fraud') ||
        lower.includes('otp') ||
        lower.includes('threat') ||
        lower.includes('धोखा') ||
        lower.includes('फ़्रॉड')
      ) {
        pageLink = {
          id: 'scam-shield',
          label: activeLang === 'hi' ? 'स्कैम शील्ड खोलें (Scam Shield)' : 'Open Scam Shield',
        };
      } else if (
        lower.includes('medicine') ||
        lower.includes('remind') ||
        lower.includes('appointment') ||
        lower.includes('schedule') ||
        lower.includes('दवा')
      ) {
        pageLink = {
          id: 'reminders',
          label: activeLang === 'hi' ? 'दवाइयाँ देखें (Reminders)' : 'Open Reminders',
        };
      } else {
        pageLink = {
          id: 'ask-mitra-one',
          label: activeLang === 'hi' ? 'और सवाल पूछें' : 'Open Ask Mitra One',
        };
      }

      setMitraAnswer(answerText);
      setSteps(stepList);
      setSuggestedPage(pageLink || null);

      // Play chime on response arrival
      playGentleChime('success');

      // Now speak the answer, respecting voice availability
      triggerSpeechPlayback(answerText);
    } catch (err) {
      console.error('Error in voice TalkModal:', err);
      playGentleChime('success');

      // Friendly fallback responses
      let fallbackAnswer = '';
      let fallbackSteps: string[] = [];
      let fallbackPage: { id: PageId; label: string } | null = null;
      const lower = speech.toLowerCase();

      if (lower.includes('medicine') || lower.includes('दवा')) {
        fallbackAnswer =
          activeLang === 'hi'
            ? 'आज आपके लिए 3 दवाइयों का समय निर्धारित है। सुबह की बीपी की गोली ली जा चुकी है। अगली दवा दोपहर 2 बजे आँखों की बूँदें हैं।'
            : 'You have 3 medicine timings scheduled today. Your morning Blood Pressure medicine is completed. Next is eye drops at 2 PM.';
        fallbackSteps =
          activeLang === 'hi'
            ? [
                'सुबह: टेल्मिसर्टन 40mg (पूर्ण ✅)',
                'दोपहर 2:00 बजे: लुब्रिकेटिंग आई ड्रॉप्स',
                'रात 8:30 बजे: शेल्कल कैल्शियम भोजन के बाद',
              ]
            : [
                'Morning: Telmisartan 40mg (Completed ✅)',
                'Afternoon (2:00 PM): Lubricating eye drops',
                'Evening (8:30 PM): Calcium tablet after meal',
              ];
        fallbackPage = {
          id: 'reminders',
          label: activeLang === 'hi' ? 'दवाइयों की सूची देखें' : 'Open Reminders Page',
        };
      } else if (
        lower.includes('scam') ||
        lower.includes('bank') ||
        lower.includes('otp') ||
        lower.includes('धोखा')
      ) {
        fallbackAnswer =
          activeLang === 'hi'
            ? 'महत्वपूर्ण सुरक्षा नियम: फोन पर किसी को भी अपना 6 अंकों का ओटीपी या बैंक पासवर्ड कभी न बताएं। असली बैंक कभी पासवर्ड नहीं मांगते।'
            : 'Important safety reminder: Never share your 6-digit OTP code or bank password with anyone who calls you. Real banks will never ask for your password.';
        fallbackSteps =
          activeLang === 'hi'
            ? [
                '1. फोन कॉल पर कोई ओटीपी या पिन कभी न बताएं।',
                '2. बिजली या सिम बंद होने की धमकी वाले लिंक पर क्लिक न करें।',
                '3. कोई ज़बरदस्ती करे तो तुरंत लाल बटन दबाकर फोन काट दें।',
              ]
            : [
                '1. Never give any OTP or PIN over a phone call.',
                '2. Do not click links claiming your electricity or SIM will be blocked.',
                '3. If someone pressures you, press the red button to cut the call.',
              ];
        fallbackPage = {
          id: 'scam-shield',
          label: activeLang === 'hi' ? 'स्कैम शील्ड देखें' : 'Open Scam Shield',
        };
      } else {
        fallbackAnswer =
          activeLang === 'hi'
            ? `मैंने समझा: "${speech}"। मैं रोज़मर्रा के कामों को आसान बनाने के लिए हमेशा तैयार हूँ। आप मुझसे बिल समझने, संदेश जाँचने या दिन का कार्यक्रम पूछ सकते हैं।`
            : `I understood: "${speech}". I am here to help make everyday tasks easy. You can ask me to explain bills, check scam messages, or check your schedule anytime.`;
        fallbackSteps =
          activeLang === 'hi'
            ? [
                'फोन सेटिंग्स या ऐप के बारे में पूछें।',
                'जाँचें कि कोई संदेश सुरक्षित है या धोखाधड़ी।',
                'आज की दवाइयों और काम का समय देखें।',
              ]
            : [
                'Ask anything about phone settings or apps.',
                'Check if an SMS is safe or a scam.',
                'See today’s schedule and medicines.',
              ];
        fallbackPage = {
          id: 'ask-mitra-one',
          label: activeLang === 'hi' ? 'और सवाल पूछें' : 'Ask More Questions',
        };
      }

      setMitraAnswer(fallbackAnswer);
      setSteps(fallbackSteps);
      setSuggestedPage(fallbackPage);
      triggerSpeechPlayback(fallbackAnswer);
    }
  };

  // Trigger Speech Playback with strict Hindi voice availability check
  const triggerSpeechPlayback = (textToSpeak: string) => {
    // For Hindi: Check if a Hindi voice is available
    if (activeLang === 'hi') {
      const hasHiVoice = isVoiceAvailableForLanguage('hi');
      if (!hasHiVoice) {
        // Never silently speak Hindi using an English voice!
        setHindiVoiceUnavailable(true);
        setVoiceState('normal');
        return;
      }
    }

    setHindiVoiceUnavailable(false);

    // Call speakText with accurate state hooks
    speakText(textToSpeak, activeLang, {
      onStart: () => {
        // Only show 'speaking' when Speech Synthesis is ACTUALLY speaking
        setVoiceState('speaking');
      },
      onEnd: () => {
        setVoiceState('normal');
      },
      onError: () => {
        setVoiceState('normal');
      },
      onFallback: () => {
        // Hindi voice unavailable fallback
        setVoiceState('normal');
        setHindiVoiceUnavailable(true);
      },
    });
  };

  // Quick Starter Question click handler
  const handleQuickQuestion = (
    q: string,
    answer: string,
    stepList: string[] = [],
    pageLink?: { id: PageId; label: string }
  ) => {
    if (voiceState === 'speaking') {
      handleStopSpeaking();
    }
    stopListening();
    setTranscript(q);
    setMitraAnswer(answer);
    setSteps(stepList);
    setSuggestedPage(pageLink || null);
    playGentleChime('success');
    triggerSpeechPlayback(answer);
  };

  // Handle Typed question submission ("Type Instead")
  const handleSubmitTypedQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedQuestion.trim() || isSubmittingType) return;
    const q = typedQuestion.trim();
    setTranscript(q);
    setTypedQuestion('');
    setVoiceState('processing');
    setIsSubmittingType(true);
    processUserSpeech(q).finally(() => {
      setIsSubmittingType(false);
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="talk-mitra-title"
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/65 backdrop-blur-xs"
    >
      <div className="bg-white rounded-3xl border border-[#e7e3da] shadow-2xl max-w-2xl w-full max-h-[94vh] overflow-y-auto flex flex-col relative">
        {/* Header */}
        <div className="bg-[#fbf9f5] px-5 sm:px-6 py-4 border-b border-[#e7e3da] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0f2942] text-white flex items-center justify-center shadow-2xs shrink-0">
              <HeartHandshake className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2
                id="talk-mitra-title"
                className="text-xl sm:text-2xl font-extrabold text-[#0f2942] font-display"
              >
                {activeLang === 'hi' ? 'मित्रा वन से बात करें' : 'Talk to MITRA ONE'}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                {activeLang === 'hi'
                  ? 'धीमी, स्पष्ट और धैर्यवान आवाज़ सहायक'
                  : 'Your calm, patient, and friendly voice companion'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector strictly for English (en-IN) and Hindi (hi-IN) */}
            <div
              className="flex items-center bg-[#f0ecdc] p-1 rounded-xl border border-[#d8d3c7]"
              role="group"
              aria-label="Voice language"
            >
              <button
                id="voice-select-en-btn"
                onClick={() => handleLanguageSelect('en')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeLang === 'en'
                    ? 'bg-[#0f2942] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-white/60'
                }`}
                aria-pressed={activeLang === 'en'}
              >
                English
              </button>
              <button
                id="voice-select-hi-btn"
                onClick={() => handleLanguageSelect('hi')}
                className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeLang === 'hi'
                    ? 'bg-[#0f2942] text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-white/60'
                }`}
                aria-pressed={activeLang === 'hi'}
              >
                हिंदी
              </button>
            </div>

            {/* Close Modal Button */}
            <button
              id="close-talk-modal-btn"
              onClick={() => {
                handleStopSpeaking();
                stopListening();
                onClose();
              }}
              className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center border border-[#d8d3c7] cursor-pointer transition-colors shrink-0"
              aria-label="Close voice assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 flex flex-col items-center text-center space-y-6">
          {/* Accessible Live Region for State Announcements */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {voiceState === 'listening' && 'Mitra One is listening. Speak now.'}
            {voiceState === 'processing' && 'Mitra One is thinking. Please wait.'}
            {voiceState === 'speaking' && 'Mitra One is speaking.'}
            {voiceState === 'normal' && 'Mitra One is ready. Tap to speak.'}
          </div>

          {/* Hindi Voice Unavailable Banner */}
          {hindiVoiceUnavailable && (
            <div
              id="hindi-voice-unavailable-banner"
              role="alert"
              className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-left flex items-start gap-3 shadow-2xs"
            >
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-900 font-medium">
                <p className="font-bold text-amber-950">
                  {HINDI_UNAVAILABLE_MESSAGE}
                </p>
                <p className="mt-0.5 text-amber-800 text-xs">
                  {activeLang === 'hi'
                    ? 'आप अपना सवाल पूछ सकते हैं और उत्तर नीचे साफ़ अक्षरों में पढ़ सकते हैं।'
                    : 'You can still speak in Hindi and read the full text answer below.'}
                </p>
              </div>
            </div>
          )}

          {/* Microphone Permission Denied or General Error Banner */}
          {errorMessage && (
            <div
              id="voice-error-banner"
              role="alert"
              className="w-full bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-sm font-bold text-rose-900 leading-snug">
                  {errorMessage}
                </p>
              </div>
              <button
                id="voice-type-instead-btn"
                onClick={() => {
                  setShowTypeInstead(true);
                  setErrorMessage(null);
                }}
                className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-800 font-extrabold text-xs sm:text-sm border border-rose-300 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Keyboard className="w-4 h-4" />
                <span>Type Instead</span>
              </button>
            </div>
          )}

          {/* 1. POLISHED SENIOR-FRIENDLY VOICE ASSISTANT CONTROL WITH 4 STATES */}
          <div className="w-full max-w-md flex flex-col items-center">
            {/* NORMAL STATE */}
            {voiceState === 'normal' && (
              <button
                id="voice-assistant-control-btn"
                onClick={handleVoiceControlClick}
                className="w-full py-5 px-6 rounded-3xl bg-[#ea580c] hover:bg-[#c2410c] active:bg-[#9a3412] text-white shadow-lg hover:shadow-xl border-2 border-orange-600/60 cursor-pointer transition-all flex items-center justify-center gap-4 group active:scale-[0.98]"
                aria-label="Talk to MITRA ONE - Tap to speak"
              >
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                  <Mic className="w-8 h-8 sm:w-9 sm:h-9 text-white" strokeWidth={2.4} />
                </div>
                <div className="text-left">
                  <span className="block font-black text-xl sm:text-2xl tracking-wide uppercase font-display leading-tight text-white">
                    TALK TO MITRA ONE
                  </span>
                  <span className="block text-sm sm:text-base font-semibold text-orange-100 mt-1">
                    {activeLang === 'hi' ? 'बोलने के लिए दबाएँ' : 'Tap to speak'}
                  </span>
                </div>
              </button>
            )}

            {/* LISTENING STATE */}
            {voiceState === 'listening' && (
              <div className="w-full flex flex-col items-center space-y-3">
                <button
                  id="voice-assistant-control-btn-listening"
                  onClick={handleVoiceControlClick}
                  className="w-full py-5 px-6 rounded-3xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-xl border-2 border-rose-700 cursor-pointer transition-all flex items-center justify-center gap-4 ring-8 ring-rose-200/60 animate-pulse active:scale-[0.98]"
                  aria-label="Listening to your voice - Speak now - Tap to finish speaking"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/25 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                    <Mic className="w-8 h-8 sm:w-9 sm:h-9 text-white" strokeWidth={2.4} />
                    {/* Calm, subtle soundwave bars */}
                    <div className="flex items-center gap-1 h-3 mt-1" aria-hidden="true">
                      <span className="w-1 h-2 bg-white rounded-full animate-pulse" />
                      <span className="w-1 h-3 bg-white rounded-full animate-pulse delay-75" />
                      <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-xl sm:text-2xl tracking-wide uppercase font-display leading-tight text-white">
                      {activeLang === 'hi' ? 'सुन रहा हूँ...' : 'Listening...'}
                    </span>
                    <span className="block text-sm sm:text-base font-semibold text-rose-100 mt-1">
                      {activeLang === 'hi' ? 'अब बोलें' : 'Speak now'}
                    </span>
                  </div>
                </button>
                <p className="text-xs sm:text-sm text-stone-600 font-medium">
                  {activeLang === 'hi'
                    ? 'अपनी सहज गति से बोलें। बोलना समाप्त होने पर दोबारा दबा सकते हैं।'
                    : 'Speak at your natural comfortable pace. Tap when finished speaking.'}
                </p>
              </div>
            )}

            {/* PROCESSING STATE */}
            {voiceState === 'processing' && (
              <div className="w-full py-5 px-6 rounded-3xl bg-[#0f2942] text-white shadow-lg border-2 border-[#1e3a5f] flex items-center justify-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-8 h-8 text-amber-300 animate-spin" strokeWidth={2.2} />
                </div>
                <div className="text-left">
                  <span className="block font-black text-xl sm:text-2xl tracking-wide uppercase font-display leading-tight text-white">
                    {activeLang === 'hi' ? 'सोच रहा हूँ...' : 'Thinking...'}
                  </span>
                  <span className="block text-sm sm:text-base font-semibold text-slate-200 mt-1">
                    {activeLang === 'hi' ? 'कृपया प्रतीक्षा करें' : 'Please wait'}
                  </span>
                </div>
              </div>
            )}

            {/* SPEAKING STATE WITH PROMINENT LARGE STOP BUTTON */}
            {voiceState === 'speaking' && (
              <div className="w-full flex flex-col items-center space-y-4">
                {/* Speaking Banner */}
                <div className="w-full py-4 px-6 rounded-3xl bg-[#0f766e] text-white shadow-md border-2 border-[#0d9488] flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <Volume2 className="w-7 h-7 text-teal-100 animate-pulse" strokeWidth={2.4} />
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-lg sm:text-xl tracking-wide font-display leading-tight text-white">
                      {activeLang === 'hi' ? 'मित्रा वन बोल रहे हैं...' : 'Mitra One is speaking...'}
                    </span>
                    {/* Audio waves animation */}
                    <div className="flex items-center gap-1.5 h-3 mt-1" aria-hidden="true">
                      <span className="w-1.5 h-2 bg-teal-200 rounded-full animate-bounce" />
                      <span className="w-1.5 h-3.5 bg-white rounded-full animate-bounce delay-100" />
                      <span className="w-1.5 h-2 bg-teal-200 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>

                {/* LARGE STOP BUTTON */}
                <button
                  id="voice-stop-speaking-btn"
                  onClick={handleStopSpeaking}
                  className="w-full py-4 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xl sm:text-2xl shadow-xl border-3 border-rose-700 flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer"
                  aria-label="Stop Mitra One from speaking immediately"
                >
                  <Square className="w-6 h-6 fill-current text-white" />
                  <span>STOP</span>
                </button>
              </div>
            )}
          </div>

          {/* Type Instead Box (Collapsible or Revealed on Demand) */}
          {showTypeInstead && (
            <form
              onSubmit={handleSubmitTypedQuestion}
              className="w-full bg-[#fbf9f5] border border-[#e7e3da] rounded-2xl p-4 text-left space-y-3 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="type-question-input"
                  className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5"
                >
                  <Keyboard className="w-4 h-4 text-stone-500" />
                  <span>{activeLang === 'hi' ? 'अपना प्रश्न यहाँ लिखें:' : 'Type your question:'}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTypeInstead(false)}
                  className="text-xs text-stone-500 hover:text-stone-800 font-semibold cursor-pointer"
                >
                  {activeLang === 'hi' ? 'छिपाएँ' : 'Hide'}
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  id="type-question-input"
                  type="text"
                  value={typedQuestion}
                  onChange={(e) => setTypedQuestion(e.target.value)}
                  placeholder={
                    activeLang === 'hi'
                      ? 'जैसे: बिजली का बिल कैसे भरें?'
                      : 'e.g., How do I pay my electricity bill?'
                  }
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#d8d3c7] text-stone-900 text-base focus:outline-hidden focus:ring-2 focus:ring-[#ea580c]"
                />
                <button
                  id="submit-typed-question-btn"
                  type="submit"
                  disabled={!typedQuestion.trim() || isSubmittingType}
                  className="px-5 py-3 rounded-xl bg-[#0f2942] hover:bg-[#162a45] text-white font-bold text-base flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-2xs"
                >
                  {isSubmittingType ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  <span>{activeLang === 'hi' ? 'पूछें' : 'Ask'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Spoken / Asked Query */}
          {transcript && (
            <div className="w-full bg-[#fbf9f5] border border-[#e7e3da] rounded-2xl p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                {activeLang === 'hi' ? 'आपने पूछा:' : 'You asked:'}
              </p>
              <p className="text-base sm:text-lg font-bold text-[#0f2942]">
                &ldquo;{transcript}&rdquo;
              </p>
            </div>
          )}

          {/* Mitra One Spoken Answer Card */}
          {mitraAnswer && (
            <div className="w-full bg-white border border-[#e7e3da] rounded-2xl p-5 sm:p-6 text-left shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[#0f2942] font-bold text-sm sm:text-base">
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>
                    {activeLang === 'hi' ? 'मित्रा वन का उत्तर:' : 'Mitra One’s Answer:'}
                  </span>
                </div>
                <button
                  id="repeat-voice-answer-btn"
                  onClick={() => triggerSpeechPlayback(mitraAnswer)}
                  disabled={voiceState === 'listening' || voiceState === 'processing'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 font-bold text-xs sm:text-sm border border-[#d8d3c7] transition-colors cursor-pointer disabled:opacity-50"
                  title={activeLang === 'hi' ? 'उत्तर दोबारा सुनें' : 'Read aloud again'}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{activeLang === 'hi' ? 'दोबारा सुनें' : 'Read Again'}</span>
                </button>
              </div>

              <p className="text-base sm:text-lg font-medium text-stone-900 leading-relaxed">
                {mitraAnswer}
              </p>

              {steps.length > 0 && (
                <div className="bg-[#fbf9f5] rounded-xl p-4 border border-[#e7e3da] space-y-2 mt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    {activeLang === 'hi' ? 'सरल चरण:' : 'Simple Steps to Follow:'}
                  </p>
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-stone-800">
                      <span className="w-6 h-6 rounded-full bg-[#0f2942] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {suggestedPage && (
                <button
                  id="modal-suggested-page-btn"
                  onClick={() => {
                    handleStopSpeaking();
                    stopListening();
                    onClose();
                    onNavigateToPage(suggestedPage.id);
                  }}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0f2942] hover:bg-[#162a45] text-white font-bold text-base flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <span>{suggestedPage.label}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Quick Tap Starter Questions */}
          <div className="w-full text-left space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-[#0f2942]">
                {activeLang === 'hi'
                  ? 'या नीचे दिए गए किसी भी सवाल को चुनें:'
                  : 'Or Tap Any Common Question:'}
              </p>
              {!showTypeInstead && (
                <button
                  id="open-type-input-btn"
                  onClick={() => setShowTypeInstead(true)}
                  className="text-xs text-stone-600 hover:text-[#ea580c] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>{activeLang === 'hi' ? 'लिखकर पूछें' : 'Type Instead'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeLang === 'hi' ? (
                <>
                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        'आज मेरी कौन सी दवाइयाँ हैं?',
                        'आज आपके लिए 3 दवाइयों का समय है। सुबह की बीपी की गोली ली जा चुकी है। दोपहर 2 बजे आँखों की बूँदें हैं, और रात 8:30 बजे कैल्शियम की गोली है।',
                        [
                          'सुबह: बीपी की गोली (पूर्ण ✅)',
                          'दोपहर 2:00 बजे: 1 बूँद आई ड्रॉप्स',
                          'रात 8:30 बजे: भोजन के बाद कैल्शियम की गोली',
                        ],
                        { id: 'reminders', label: 'दवाइयों की सूची देखें' }
                      )
                    }
                    className="p-3.5 rounded-xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-800 font-semibold text-sm transition-all text-left cursor-pointer"
                  >
                    💊 &ldquo;आज मेरी कौन सी दवाइयाँ हैं?&rdquo;
                  </button>

                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        'क्या यह बैंक एसएमएस कोई धोखाधड़ी है?',
                        'यदि एसएमएस में खाता बंद होने की धमकी है या किसी लिंक पर क्लिक करने को कहा गया है, तो यह निश्चित रूप से धोखाधड़ी है। कभी भी किसी लिंक को न खोलें और ओटीपी न दें।',
                        [
                          'संदेश में दिए किसी भी लिंक को न छुएँ।',
                          'अपना 6 अंकों का ओटीपी किसी से साझा न करें।',
                          'संदेह होने पर बैंक के एटीएम कार्ड के पीछे छपे नंबर पर बात करें।',
                        ],
                        { id: 'scam-shield', label: 'स्कैम शील्ड में संदेश जाँचें' }
                      )
                    }
                    className="p-3.5 rounded-xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-800 font-semibold text-sm transition-all text-left cursor-pointer"
                  >
                    🛡️ &ldquo;क्या यह बैंक एसएमएस धोखा है?&rdquo;
                  </button>

                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        'मेरा बिजली का बिल समझाएँ',
                        'आपका 1,450 रुपये का बिजली का बिल कल तक देय है। आप इसे अधिकृत ऐप से या नज़दीकी बिजली केंद्र पर जाकर सुरक्षित रूप से भर सकते हैं।',
                        [
                          'राशि: ₹1,450',
                          'अंतिम तिथि: कल, 20 सितंबर',
                          'अंतिम तिथि तक भरने पर कोई अतिरिक्त शुल्क नहीं',
                        ],
                        { id: 'understand', label: 'पूरा बिल समझें' }
                      )
                    }
                    className="p-3.5 rounded-xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-800 font-semibold text-sm transition-all text-left cursor-pointer"
                  >
                    ⚡ &ldquo;मेरा बिजली का बिल समझाएँ&rdquo;
                  </button>

                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        'व्हाट्सएप वीडियो कॉल कैसे करें?',
                        'व्हाट्सएप खोलें, अपने परिवार के सदस्य का नाम चुनें, और ऊपर दाईं ओर दिए गए छोटे वीडियो कैमरे के निशान को दबाएँ।',
                        [
                          'व्हाट्सएप खोलें',
                          'परिवार के सदस्य का नाम दबाएँ',
                          'ऊपर दाईं ओर वीडियो कैमरा आइकन 📹 दबाएँ',
                        ],
                        { id: 'ask-mitra-one', label: 'और सवाल पूछें' }
                      )
                    }
                    className="p-3.5 rounded-xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-800 font-semibold text-sm transition-all text-left cursor-pointer"
                  >
                    📞 &ldquo;व्हाट्सएप वीडियो कॉल कैसे करें?&rdquo;
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        'What medicines do I have today?',
                        'You have your Blood Pressure tablet in the morning (Telmisartan 40mg), lubricating eye drops at 2 PM, and Calcium tablet at 8:30 PM after dinner.',
                        [
                          'Morning: Blood pressure tablet (Completed ✅)',
                          'Afternoon 2:00 PM: 1 drop eye drops',
                          'Evening 8:30 PM: Calcium tablet with warm milk',
                        ],
                        { id: 'reminders', label: 'View All Reminders' }
                      )
                    }
                    className="p-3.5 rounded-xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-800 font-semibold text-sm transition-all text-left cursor-pointer"
                  >
                    💊 &ldquo;What medicines do I take today?&rdquo;
                  </button>

                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        'Is this bank SMS a scam?',
                        'If the SMS says your bank account will be blocked or asks you to click a link, it is almost certainly a scam. Never click links or give OTPs.',
                        [
                          'Do NOT tap any website link in the message.',
                          'Never share your 6-digit OTP with anyone.',
                          'Call your bank helpline printed on your ATM card if worried.',
                        ],
                        { id: 'scam-shield', label: 'Check Message in Scam Shield' }
                      )
                    }
                    className="p-3.5 rounded-xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-800 font-semibold text-sm transition-all text-left cursor-pointer"
                  >
                    🛡️ &ldquo;Is this bank SMS a scam?&rdquo;
                  </button>

                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        'Explain my electricity bill',
                        'Your electricity bill of 1,450 rupees is due tomorrow. You can pay online or have someone help you at the counter.',
                        [
                          'Amount: ₹1,450',
                          'Due date: Tomorrow, 20 September',
                          'No penalty if paid on or before the due date',
                        ],
                        { id: 'understand', label: 'Explain Full Bill' }
                      )
                    }
                    className="p-3.5 rounded-xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-800 font-semibold text-sm transition-all text-left cursor-pointer"
                  >
                    ⚡ &ldquo;Explain my electricity bill&rdquo;
                  </button>

                  <button
                    onClick={() =>
                      handleQuickQuestion(
                        'How do I make a WhatsApp video call?',
                        'Open WhatsApp, tap your family member’s name, and tap the small video camera icon in the top right corner.',
                        ['Open WhatsApp', 'Tap family member', 'Tap top-right Video Camera icon 📹'],
                        { id: 'ask-mitra-one', label: 'Ask More Questions' }
                      )
                    }
                    className="p-3.5 rounded-xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-800 font-semibold text-sm transition-all text-left cursor-pointer"
                  >
                    📞 &ldquo;How to do a WhatsApp video call?&rdquo;
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#fbf9f5] px-6 py-3.5 border-t border-[#e7e3da] text-center">
          <p className="text-xs text-stone-600 font-medium">
            {activeLang === 'hi'
              ? 'मित्रा वन आपके डिजिटल जीवन को सरल, शांत और सुरक्षित बनाने के लिए समर्पित है।'
              : 'Mitra One is designed to assist you with patience, warmth, and care.'}
          </p>
        </div>
      </div>
    </div>
  );
};
