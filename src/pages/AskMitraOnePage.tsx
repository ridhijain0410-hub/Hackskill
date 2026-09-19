import React, { useState } from 'react';
import {
  Send,
  Mic,
  Volume2,
  Sparkles,
  HelpCircle,
  Lightbulb,
  HeartHandshake
} from 'lucide-react';
import { ChatMessage } from '../types';
import { COMMON_QUESTIONS } from '../data/mockData';
import { speakText, playGentleChime } from '../utils/speech';

export const AskMitraOnePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'mitra-one',
      text: 'Namaste! I am your Mitra One. You can ask me anything about using your smartphone, WhatsApp, booking taxis, online doctor appointments, or paying bills. I will explain everything in simple words without technical jargon.',
      timestamp: 'Just now',
      tips: 'You can tap any of the popular questions below, or type your own question in the box at the bottom.',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (textToSend?: string) => {
    const question = (textToSend || inputText).trim();
    if (!question) return;

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

    setTimeout(() => {
      let answerText = '';
      let steps: string[] = [];
      let tip = '';

      const lower = question.toLowerCase();

      if (lower.includes('video call') || lower.includes('whatsapp')) {
        answerText =
          'To make a video call on WhatsApp, open WhatsApp, tap your family member’s name, and tap the Video Camera icon 📹 in the top-right corner.';
        steps = [
          'Open WhatsApp from your phone screen.',
          'Tap the name or photo of the person you want to call.',
          'Look at the top-right corner for the small Video Camera icon 📹.',
          'Tap the camera icon. The phone will start ringing with video!',
          'Hold the phone in front of you so they can see your smile.',
        ];
        tip = 'If the video looks dark, turn on a nearby room lamp so they can see your face clearly.';
      } else if (lower.includes('cab') || lower.includes('uber') || lower.includes('ola') || lower.includes('taxi')) {
        answerText =
          'Booking a cab on your phone is very convenient. You enter where you want to go, check the price, and choose "Cash" or "UPI".';
        steps = [
          'Open Uber or Ola app.',
          'Tap on the search box that says "Where to?".',
          'Type the hospital, clinic, or friend’s colony name.',
          'Select the ride type (e.g. Auto or Mini Cab).',
          'Tap "Book". The driver name and vehicle number will appear on your screen.',
        ];
        tip = 'Always match the vehicle license plate number before sitting in the vehicle.';
      } else if (lower.includes('train') || lower.includes('irctc') || lower.includes('ticket')) {
        answerText =
          'You can book train tickets on IRCTC or confirm your PNR status. Always ask for Senior Citizen lower berth quota when available.';
        steps = [
          'Open the IRCTC Rail Connect app.',
          'Choose your departure and arrival railway stations.',
          'Select your travel date.',
          'Select "Lower Berth" preference for senior comfort.',
        ];
        tip = 'Keep your Aadhaar card or government ID with you during travel.';
      } else if (lower.includes('medicine') || lower.includes('order') || lower.includes('pharmacy')) {
        answerText =
          'You can order medicines delivered to your doorstep with 15% to 20% discount using apps like Tata 1mg, Apollo 24/7, or Pharmeasy.';
        steps = [
          'Open your pharmacy app (Tata 1mg or Apollo).',
          'Tap "Upload Prescription" and take a clear photo of doctor’s slip.',
          'A qualified pharmacist calls you to confirm every item.',
          'Medicines arrive at your door in a sealed safety box.',
        ];
        tip = 'You can always choose "Cash on Delivery" so you only pay after holding the medicine box in your hands.';
      } else if (lower.includes('font') || lower.includes('bigger') || lower.includes('text') || lower.includes('read')) {
        answerText =
          'To make letters larger on your smartphone screen, go to your phone Settings and increase the font size.';
        steps = [
          'Open the "Settings" app (looks like a gear icon ⚙️).',
          'Tap "Display" or "Display & Brightness".',
          'Tap "Font Size" or "Text Size".',
          'Drag the slider to the right to make all letters comfortable and large.',
        ];
        tip = 'Inside Mitra One, tap the A− / A / A+ buttons in the top bar anytime!';
      } else {
        answerText = `I hear your question: "${question}". Here is the simplest way to do it:`;
        steps = [
          'Take it slow and read one prompt at a time.',
          'If any screen asks for your bank password or OTP, stop and verify first.',
          'Tap the "Help" button in the top bar if you ever feel unsure.',
        ];
        tip = 'You can also tap the Talk to Mitra One button on the home page to speak by voice!';
      }

      const mitraMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'mitra-one',
        text: answerText,
        timestamp: 'Just now',
        steps,
        tips: tip,
      };

      setMessages((prev) => [...prev, mitraMsg]);
      setIsTyping(false);
      playGentleChime('success');
      speakText(answerText);
    }, 700);
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
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      playGentleChime('tap');
      recognition.start();

      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputText(text);
        handleSend(text);
      };
    } catch {
      handleSend('How do I order medicines online?');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Page Header */}
      <div className="bg-[#0f2942] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs sm:text-sm font-bold">
            <HeartHandshake className="w-4 h-4 text-amber-300" />
            <span>Senior Friendly Digital Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Ask Mitra One
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Ask any question. No question is silly. We learn step by step.
          </p>
        </div>

        <button
          onClick={() =>
            speakText(
              'Welcome to Ask Mitra One. Tap any suggested topic or type your question below. I will explain in easy, patient steps.'
            )
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm cursor-pointer transition-colors"
          title="Read instructions aloud"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen</span>
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2">
        <p className="text-sm font-bold text-[#0f2942] px-1">
          Popular Questions (Tap to ask instantly):
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {COMMON_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q.question)}
              className="p-3.5 rounded-2xl bg-white hover:bg-[#f5f1ea] border border-[#e7e3da] hover:border-[#0f2942] text-stone-800 text-left font-semibold text-sm transition-all shadow-2xs cursor-pointer flex items-start gap-2.5"
            >
              <HelpCircle className="w-5 h-5 text-[#ea580c] shrink-0 mt-0.5" />
              <span>{q.question}</span>
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
                          } ${msg.tips || ''}`
                        )
                      }
                      className="p-1.5 rounded-lg bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 cursor-pointer"
                      title="Read aloud"
                      aria-label="Read message aloud"
                    >
                      <Volume2 className="w-4 h-4" />
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
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-medium text-emerald-900">
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
          <div className="flex items-center gap-2 p-4 bg-white rounded-2xl border border-[#e7e3da] text-stone-600 max-w-xs animate-pulse">
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
            <span className="text-sm font-bold">Mitra One is thinking for you...</span>
          </div>
        )}
      </div>

      {/* Input Field at Bottom */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-3xl p-3 sm:p-4 border border-[#e7e3da] shadow-lg space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          <input
            id="ask-mitra-text-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your question here (e.g. How to book cab?)"
            className="flex-1 px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl bg-[#fbf9f5] border border-[#d8d3c7] text-[#0f2942] placeholder:text-stone-400 font-medium text-base focus:bg-white transition-all"
          />

          <button
            type="button"
            id="ask-mitra-voice-input-btn"
            onClick={handleVoiceInput}
            className="p-3.5 sm:p-4 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-[#0f2942] border border-[#d8d3c7] cursor-pointer transition-colors"
            title="Speak your question with microphone"
          >
            <Mic className="w-6 h-6 text-[#ea580c]" />
          </button>

          <button
            type="submit"
            id="ask-mitra-submit-btn"
            disabled={!inputText.trim()}
            className="flex items-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-40 disabled:hover:bg-[#ea580c] text-white font-extrabold text-base sm:text-lg shadow-xs cursor-pointer transition-all"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
        <p className="text-xs text-stone-500 text-center font-medium">
          Ask in simple words. Mitra One will always answer gently.
        </p>
      </div>
    </div>
  );
};
