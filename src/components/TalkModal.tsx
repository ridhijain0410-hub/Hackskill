import React, { useState, useEffect } from 'react';
import { Mic, X, Volume2, Sparkles, ArrowRight, HeartHandshake } from 'lucide-react';
import { speakText, stopSpeaking, playGentleChime } from '../utils/speech';
import { PageId } from '../types';

interface TalkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPage: (page: PageId) => void;
}

export const TalkModal: React.FC<TalkModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [mitraAnswer, setMitraAnswer] = useState<string | null>(
    'Namaste! I am Mitra One. Speak to me like a friend, or tap any common question below. I will answer in simple words.'
  );
  const [steps, setSteps] = useState<string[]>([]);
  const [suggestedPage, setSuggestedPage] = useState<{ id: PageId; label: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      playGentleChime('tap');
      speakText(
        'Namaste! I am Mitra One. Speak to me or tap any question below. How can I help you today?'
      );
    } else {
      stopSpeaking();
      setIsListening(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickQuestion = (
    q: string,
    answer: string,
    stepList: string[] = [],
    pageLink?: { id: PageId; label: string }
  ) => {
    setTranscript(q);
    setMitraAnswer(answer);
    setSteps(stepList);
    setSuggestedPage(pageLink || null);
    playGentleChime('success');
    speakText(answer);
  };

  const handleToggleListening = () => {
    const windowWithSpeech = window as unknown as {
      webkitSpeechRecognition?: new () => any;
      SpeechRecognition?: new () => any;
    };
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsListening(false);
      handleQuickQuestion(
        'What medicines do I have today?',
        'You have your Blood Pressure tablet in the morning (Telmisartan 40mg), lubricating eye drops at 2 PM, and Calcium tablet at 8:30 PM after dinner.',
        [
          'Morning (8:30 AM): Telmisartan 40mg',
          'Afternoon (2:00 PM): 1 drop eye drops',
          'Evening (8:30 PM): Calcium tablet after dinner',
        ],
        { id: 'reminders', label: 'View All Reminders' }
      );
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      playGentleChime('tap');

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        processUserSpeech(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const processUserSpeech = (speech: string) => {
    const lower = speech.toLowerCase();
    playGentleChime('success');

    if (lower.includes('medicine') || lower.includes('pill') || lower.includes('tablet')) {
      handleQuickQuestion(
        speech,
        'You have 3 medicine timings scheduled today. Your morning Blood Pressure medicine is completed. Next is eye drops at 2 PM.',
        [
          'Morning: Telmisartan 40mg (Completed ✅)',
          'Afternoon (2:00 PM): Lubricating eye drops',
          'Evening (8:30 PM): Shelcal Calcium tablet after meal',
        ],
        { id: 'reminders', label: 'Open Reminders Page' }
      );
    } else if (lower.includes('scam') || lower.includes('bank') || lower.includes('otp') || lower.includes('fraud')) {
      handleQuickQuestion(
        speech,
        'Important safety reminder: Never share your 6-digit OTP code or bank password with anyone who calls you. Real banks will never ask for your password.',
        [
          '1. Never give any OTP or PIN over a phone call.',
          '2. Do not click links claiming your electricity or SIM card will be blocked.',
          '3. If someone calls aggressively, press the red button to cut the call.',
        ],
        { id: 'scam-shield', label: 'Open Scam Shield' }
      );
    } else if (lower.includes('bill') || lower.includes('electric') || lower.includes('sms')) {
      handleQuickQuestion(
        speech,
        'Your electricity bill of 1,450 rupees is due tomorrow. You can pay it through authorized payment apps or visit the local BESCOM counter.',
        [
          'Due Date: Tomorrow, 20 September',
          'Consumer Number: 50493821',
          'Pay safely without clicking unknown SMS links',
        ],
        { id: 'understand', label: 'Open Understand' }
      );
    } else {
      handleQuickQuestion(
        speech,
        `I understood: "${speech}". I am here to help make everyday tasks easy. You can ask me to explain bills, check scam messages, or check your schedule anytime.`,
        [
          'Ask anything about phone settings or apps.',
          'Check if an SMS is safe or a scam.',
          'See today’s schedule and medicines.',
        ]
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="talk-mitra-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-3xl border border-[#e7e3da] shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto flex flex-col relative">
        {/* Header */}
        <div className="bg-[#fbf9f5] px-6 py-4 border-b border-[#e7e3da] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f2942] text-white flex items-center justify-center shadow-2xs">
              <HeartHandshake className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2
                id="talk-mitra-title"
                className="text-xl sm:text-2xl font-extrabold text-[#0f2942] font-display"
              >
                Talking to Mitra One
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Your patient, friendly voice companion
              </p>
            </div>
          </div>
          <button
            id="close-talk-modal-btn"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center border border-[#d8d3c7] cursor-pointer transition-colors"
            aria-label="Close voice assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-6">
          {/* Voice Orb */}
          <div className="relative">
            <div
              className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all shadow-md ${
                isListening
                  ? 'bg-rose-600 text-white ring-8 ring-rose-100 animate-pulse scale-105'
                  : 'bg-[#ea580c] text-white ring-8 ring-orange-50'
              }`}
            >
              <Mic className="w-12 h-12" strokeWidth={2.4} />
            </div>
            {isListening && (
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                Listening...
              </span>
            )}
          </div>

          {/* Voice Button */}
          <div>
            <button
              id="voice-mic-trigger-btn"
              onClick={handleToggleListening}
              className={`px-8 py-3.5 rounded-xl font-extrabold text-lg sm:text-xl shadow-xs cursor-pointer transition-all border ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700'
                  : 'bg-[#ea580c] hover:bg-[#c2410c] text-white border-[#ea580c]'
              }`}
            >
              {isListening ? 'Tap to Stop Listening' : 'Tap to Speak Now 🎙️'}
            </button>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 font-medium">
              Take your time. Speak in your natural comfortable pace.
            </p>
          </div>

          {/* Spoken Query */}
          {transcript && (
            <div className="w-full bg-[#fbf9f5] border border-[#e7e3da] rounded-2xl p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                You asked:
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
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Mitra One’s Answer:</span>
                </div>
                <button
                  id="repeat-voice-answer-btn"
                  onClick={() => speakText(mitraAnswer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 font-bold text-xs sm:text-sm border border-[#d8d3c7] transition-colors cursor-pointer"
                  title="Read aloud again"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Read Again</span>
                </button>
              </div>

              <p className="text-base sm:text-lg font-medium text-stone-900 leading-relaxed">
                {mitraAnswer}
              </p>

              {steps.length > 0 && (
                <div className="bg-[#fbf9f5] rounded-xl p-4 border border-[#e7e3da] space-y-2 mt-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Simple Steps to Follow:
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
          <div className="w-full text-left space-y-2.5 pt-2">
            <p className="text-sm font-bold text-[#0f2942]">
              Or Tap Any of These Common Questions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#fbf9f5] px-6 py-3.5 border-t border-[#e7e3da] text-center">
          <p className="text-xs text-stone-600 font-medium">
            Mitra One is designed to assist you with patience and care.
          </p>
        </div>
      </div>
    </div>
  );
};
