import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  HelpCircle,
  Lightbulb,
  HeartHandshake,
  ShieldCheck,
  RotateCcw,
  Globe
} from 'lucide-react';
import { ChatMessage, LanguageCode } from '../types';
import { COMMON_QUESTIONS } from '../data/mockData';
import { getLanguageConfig } from '../data/languages';
import { speakText, playGentleChime } from '../utils/speech';

interface AskMitraOnePageProps {
  initialQuestion?: string;
  onClearInitialQuestion?: () => void;
  language?: LanguageCode;
}

export const AskMitraOnePage: React.FC<AskMitraOnePageProps> = ({
  initialQuestion,
  onClearInitialQuestion,
  language = 'en',
}) => {
  const langConfig = getLanguageConfig(language);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'mitra-one',
      text:
        language === 'hi'
          ? 'नमस्ते! मैं आपका मित्रा वन (Mitra One) हूँ। आप मुझसे स्मार्टफोन, व्हाट्सएप, डॉक्टर अपॉइंटमेंट या बिल भुगतान के बारे में कोई भी प्रश्न पूछ सकते हैं। मैं सरल शब्दों में समझाऊँगा।'
          : 'Namaste! I am your Mitra One. You can ask me anything about using your smartphone, WhatsApp, booking taxis, online doctor appointments, or paying bills. I will explain everything in simple words without technical jargon.',
      timestamp: 'Just now',
      tips:
        language === 'hi'
          ? 'आप नीचे दिए गए किसी भी लोकप्रिय प्रश्न पर टैप कर सकते हैं, या नीचे अपना प्रश्न लिख सकते हैं।'
          : 'You can tap any of the popular questions below, or type your own question in the box at the bottom.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const processedInitialRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialQuestion && initialQuestion.trim() && processedInitialRef.current !== initialQuestion) {
      processedInitialRef.current = initialQuestion;
      handleSend(initialQuestion.trim());
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  const handleSend = async (textToSend?: string) => {
    const question = (textToSend || inputText).trim();
    if (!question || isTyping) return;

    playGentleChime('tap');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language }),
      });

      const data = await res.json();

      let answerText = data.answer || 'I am happy to assist you.';
      let steps: string[] = Array.isArray(data.steps) ? data.steps : [];
      let tips: string = data.tips || '';

      const mitraMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'mitra-one',
        text: answerText,
        timestamp: 'Just now',
        steps,
        tips,
      };

      setMessages((prev) => [...prev, mitraMsg]);
      setIsTyping(false);
      playGentleChime('success');
      speakText(`${answerText}. ${steps.length > 0 ? steps.join('. ') : ''}`, language);
    } catch (err) {
      console.error('Error calling /api/gemini/ask:', err);
      // Fallback response for senior peace of mind in selected language
      const fallbackText =
        language === 'hi'
          ? `मैं आपके प्रश्न "${question}" को समझ रहा हूँ। कृपया एक-एक कदम उठाएं। किसी भी समय आप परिवार के किसी सदस्य से भी पूछ सकते हैं।`
          : `I am listening to your question: "${question}". Take your time, step by step. If you ever feel stuck, you can also ask your family or tap the Help button in the top bar.`;
      const fallbackSteps =
        language === 'hi'
          ? [
              'आराम से एक-एक निर्देश पढ़ें।',
              'कभी भी किसी के साथ अपना बैंक ओटीपी या पिन साझा न करें।',
              'आप बहुत अच्छा कर रहे हैं।',
            ]
          : [
              'Take it slow and read one prompt at a time.',
              'Never share any OTP or bank PIN with anyone.',
              'You are doing wonderfully.',
            ];

      const mitraMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'mitra-one',
        text: fallbackText,
        timestamp: 'Just now',
        steps: fallbackSteps,
        tips:
          language === 'hi'
            ? 'याद रखें: असली बैंक और सरकारी अधिकारी कभी भी आपका गुप्त पासवर्ड या ओटीपी नहीं मांगते।'
            : 'Remember: Real banks and government officers will never ask for your secret password or OTP.',
      };

      setMessages((prev) => [...prev, mitraMsg]);
      setIsTyping(false);
      playGentleChime('tap');
      speakText(fallbackText, language);
    }
  };

  const handleVoiceInput = () => {
    const windowWithSpeech = window as unknown as {
      webkitSpeechRecognition?: new () => any;
      SpeechRecognition?: new () => any;
    };
    const SpeechRecognitionClass =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      handleSend('How do I make text bigger on my phone?');
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = langConfig.speechLang;
      recognition.interimResults = false;

      playGentleChime('tap');
      recognition.start();

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputText(text);
        handleSend(text);
      };

      recognition.onerror = () => {
        // Fallback default sample question if mic blocked
        setInputText('How do I order medicines online?');
      };
    } catch {
      handleSend('How do I make a WhatsApp video call?');
    }
  };

  const handleResetConversation = () => {
    playGentleChime('tap');
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'mitra-one',
        text:
          language === 'hi'
            ? 'नमस्ते! आपके अगले प्रश्न के लिए तैयार हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?'
            : 'Namaste! Ready for your next question. How can I help you today?',
        timestamp: 'Just now',
        tips:
          language === 'hi'
            ? 'नीचे दिए गए सामान्य प्रश्नों पर टैप करें या अपना प्रश्न लिखें।'
            : 'Tap any common question below or type your own.',
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Page Header matching Reference Screen 8 & requirements */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {langConfig.name} ({langConfig.nativeName})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f2942] font-display">
            Ask Mitra One
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            I am here to help you step by step with anything on your phone or online.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {messages.length > 2 && (
            <button
              onClick={handleResetConversation}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-[#d8d3c7] text-[#0f2942] font-bold text-xs sm:text-sm cursor-pointer transition-colors shadow-2xs"
              title="Start fresh conversation"
            >
              <RotateCcw className="w-4 h-4 text-stone-600" />
              <span>New Question</span>
            </button>
          )}

          <button
            onClick={() =>
              speakText(
                'Ask Mitra One. I am here to help you step by step with anything on your phone or online. Ask any question below or tap a suggested topic.',
                language
              )
            }
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-extrabold text-xs sm:text-sm cursor-pointer transition-colors shadow-xs"
            title="Read instructions aloud"
          >
            <Volume2 className="w-4 h-4 text-amber-300" />
            <span>Read Aloud</span>
          </button>
        </div>
      </div>

      {/* Suggested prompt pills (Exact 4 from instructions) */}
      <div className="space-y-2 text-left">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
          Suggested questions (tap to ask):
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          {[
            'How to pay electricity bill',
            'Send photos on WhatsApp',
            'Check train PNR status',
            'Book gas cylinder',
          ].map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(promptText)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-[#fff8f2] border border-[#d8d3c7] hover:border-[#ea580c] text-[#0f2942] hover:text-[#ea580c] text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-amber-600">💡</span>
              <span>{promptText}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="space-y-4 pt-2">
        {messages.map((msg) => {
          const isMitra = msg.sender === 'mitra-one';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMitra ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-3xl rounded-3xl p-5 sm:p-7 border shadow-2xs space-y-4 ${
                  isMitra
                    ? 'bg-white border-[#e7e3da] text-[#0f2942] rounded-tl-sm'
                    : 'bg-[#0f2942] border-[#0f2942] text-white rounded-tr-sm'
                }`}
              >
                {/* Header inside bubble */}
                <div className="flex items-center justify-between gap-4 border-b pb-2 border-stone-200/40">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isMitra ? (
                      <>
                        <div className="w-6 h-6 rounded-md bg-[#0f2942] text-white flex items-center justify-center text-xs font-black">
                          M
                        </div>
                        <span className="text-[#0f2942]">Mitra One</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-md bg-white/20 text-white flex items-center justify-center text-xs font-bold">
                          You
                        </div>
                        <span className="text-slate-200">You asked</span>
                      </>
                    )}
                  </div>

                  {isMitra && (
                    <button
                      onClick={() =>
                        speakText(
                          `${msg.text} ${
                            msg.steps ? msg.steps.join('. ') : ''
                          } ${msg.tips || ''}`,
                          language
                        )
                      }
                      className="p-1.5 rounded-lg bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 cursor-pointer flex items-center gap-1 text-xs font-bold"
                      title="Read aloud in selected language"
                      aria-label="Read message aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Listen</span>
                    </button>
                  )}
                </div>

                {/* Body message text */}
                <p className="text-base sm:text-lg font-medium leading-relaxed">
                  {msg.text}
                </p>

                {/* Steps if any */}
                {msg.steps && msg.steps.length > 0 && (
                  <div className="bg-[#fbf9f5] rounded-2xl p-4 sm:p-5 border border-[#e7e3da] space-y-2.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-600">
                      Step-by-Step Instructions:
                    </p>
                    <div className="space-y-2">
                      {msg.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 text-sm sm:text-base text-stone-800"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#0f2942] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-medium">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Tip if any */}
                {msg.tips && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-medium text-emerald-900">
                    <Lightbulb className="w-5 h-5 text-[#1b5e3b] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Good to remember:</strong>
                      {msg.tips}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2.5 p-4 bg-white rounded-2xl border border-[#e7e3da] text-stone-700 max-w-sm shadow-2xs">
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
            <span className="text-sm sm:text-base font-bold text-[#0f2942]">
              Mitra One is thinking for you...
            </span>
          </div>
        )}
      </div>

      {/* Safety Notice Bar */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs sm:text-sm font-medium">
        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          Mitra One will never ask you for bank passwords, OTPs, PINs, or CVVs. Never share them with anyone.
        </span>
      </div>

      {/* Large Input Area at Bottom */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-[#e7e3da] shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12)] space-y-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <input
              id="ask-mitra-text-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask anything (e.g. How do I delete old photos?)"
              className="w-full px-5 py-4 rounded-2xl bg-[#fbf9f5] border-2 border-[#d8d3c7] text-[#0f2942] placeholder:text-stone-400 font-bold text-base sm:text-lg focus:bg-white focus:border-[#ea580c] transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              id="ask-mitra-voice-input-btn"
              onClick={handleVoiceInput}
              className="p-4 rounded-2xl bg-[#fff8f2] hover:bg-[#ffedd5] text-[#ea580c] border-2 border-[#fed7aa] cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-2 font-black text-sm"
              title="Speak your question with microphone"
              aria-label="Speak your question"
            >
              <Mic className="w-6 h-6 text-[#ea580c]" />
              <span className="inline sm:hidden font-extrabold">Speak</span>
            </button>

            <button
              type="submit"
              id="ask-mitra-submit-btn"
              disabled={!inputText.trim() || isTyping}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-40 disabled:hover:bg-[#ea580c] text-white font-black text-base sm:text-lg shadow-md cursor-pointer transition-all active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              <span>Ask Mitra One</span>
            </button>
          </div>
        </form>
        <p className="text-xs sm:text-sm text-stone-500 text-center font-medium">
          Ask in simple words. Mitra One will always answer gently, clearly, and patiently.
        </p>
      </div>
    </div>
  );
};
