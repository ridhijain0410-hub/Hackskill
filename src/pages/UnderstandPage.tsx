import React, { useState } from 'react';
import {
  HelpCircle,
  FileText,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  CreditCard,
  Pill,
  Sparkles,
  ClipboardPaste,
  RotateCcw
} from 'lucide-react';
import { UnderstandSample } from '../types';
import { UNDERSTAND_SAMPLES } from '../data/mockData';
import { speakText, playGentleChime } from '../utils/speech';

export const UnderstandPage: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<UnderstandSample>(
    UNDERSTAND_SAMPLES[0]
  );
  const [customText, setCustomText] = useState('');
  const [customExplanation, setCustomExplanation] = useState<{
    inOneSentence: string;
    whatItMeans: string[];
    whatYouNeedToDo: string;
    isUrgent: boolean;
  } | null>(null);

  const handleSelectSample = (sample: UnderstandSample) => {
    setSelectedSample(sample);
    setCustomExplanation(null);
    playGentleChime('tap');
  };

  const handleExplainCustomText = () => {
    if (!customText.trim()) return;
    playGentleChime('tap');

    const lower = customText.toLowerCase();
    let sentence = '';
    let bullets: string[] = [];
    let action = '';
    let urgent = false;

    if (
      lower.includes('otp') ||
      lower.includes('block') ||
      lower.includes('kyc') ||
      lower.includes('cut') ||
      lower.includes('disconnect') ||
      lower.includes('lottery') ||
      lower.includes('won')
    ) {
      urgent = true;
      sentence =
        'CAUTION: This message contains words often used in cyber fraud and scam attempts.';
      bullets = [
        'Scammers use fear (like "electricity cut" or "account blocked") to make you panic.',
        'Never share any 6-digit OTP code or click unknown links in such messages.',
        'Real government departments and banks send formal letters, not threatening SMS.',
      ];
      action =
        'Do not click any link. Do not call numbers given in the message. Tap "Help" in the top bar if you need reassurance.';
    } else if (lower.includes('debited') || lower.includes('credited') || lower.includes('inr') || lower.includes('rs')) {
      sentence = 'This is a bank or payment notification about money entering or leaving an account.';
      bullets = [
        'Check if you or someone in your family made this transaction today.',
        'Check the last 4 digits of the account number to see if it matches your bank passbook.',
      ];
      action =
        'If you recognized the purchase, no action is needed. If you did NOT make it, call your bank customer care or check with family.';
    } else {
      sentence = 'Here is a simplified explanation of the text you provided:';
      bullets = [
        'The message is an informational notice or communication.',
        'Take your time reading it comfortably. There is no need to hurry.',
        'Avoid clicking any links unless you personally know the sender.',
      ];
      action =
        'If it asks you to pay money or share personal details, verify with a family member first.';
    }

    setCustomExplanation({
      inOneSentence: sentence,
      whatItMeans: bullets,
      whatYouNeedToDo: action,
      isUrgent: urgent,
    });

    playGentleChime('success');
    speakText(sentence);
  };

  const getSampleIcon = (name: string) => {
    switch (name) {
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-blue-700" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-700" />;
      case 'Pill':
        return <Pill className="w-5 h-5 text-emerald-700" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-rose-700" />;
      default:
        return <FileText className="w-5 h-5 text-stone-600" />;
    }
  };

  const activeExplanation =
    customExplanation || selectedSample.plainEnglish;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Header Banner */}
      <div className="bg-[#0f2942] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs sm:text-sm font-bold">
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>Plain-Language Explainer</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Understand
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl">
            Make bills, letters and messages easier to understand in clear, simple words.
          </p>
        </div>

        <button
          onClick={() =>
            speakText(
              'Welcome to Understand. Choose any sample below or paste your own message. I will break it down into simple, easy words.'
            )
          }
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-base cursor-pointer shrink-0 shadow-xs transition-colors"
          title="Read instructions aloud"
        >
          <Volume2 className="w-5 h-5" />
          <span>Read Aloud</span>
        </button>
      </div>

      {/* Try with Real Samples */}
      <div className="space-y-3">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] font-display">
          Tap a Common Example to See How Mitra One Explains It:
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {UNDERSTAND_SAMPLES.map((sample) => {
            const isSelected =
              !customExplanation && selectedSample.id === sample.id;
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-white border-[#0f2942] ring-2 ring-[#0f2942]/20'
                    : 'bg-white border-[#e7e3da] hover:border-[#cbd5e1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-[#f5f1ea] border border-[#e7e3da]">
                    {getSampleIcon(sample.iconName)}
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      sample.plainEnglish.isUrgent
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-[#f5f1ea] text-[#0f2942]'
                    }`}
                  >
                    {sample.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0f2942] text-base">
                    {sample.title}
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {sample.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split: Original Text vs Mitra One Simple Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Complex Snippet */}
        <div className="bg-[#fbf9f5] rounded-3xl p-6 border border-[#e7e3da] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Original Message / Document
              </span>
              <span className="text-xs text-stone-500 font-semibold">
                (As received on phone)
              </span>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e7e3da] font-mono text-xs sm:text-sm text-[#0f2942] leading-relaxed overflow-x-auto select-all">
              {customExplanation ? customText : selectedSample.originalText}
            </div>
          </div>

          <p className="text-xs text-stone-500 font-medium">
            💡 Many companies write complex abbreviations that confuse readers. Mitra One translates this into clear sentences.
          </p>
        </div>

        {/* Mitra One Simple Explanation Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2 text-[#0f2942] font-bold text-lg font-display">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Mitra One’s Simple Explanation</span>
            </div>

            <button
              onClick={() =>
                speakText(
                  `${activeExplanation.inOneSentence}. What it means: ${activeExplanation.whatItMeans.join(
                    '. '
                  )}. What you need to do: ${activeExplanation.whatYouNeedToDo}`
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 font-bold text-xs sm:text-sm border border-[#d8d3c7] cursor-pointer"
              title="Read aloud"
            >
              <Volume2 className="w-4 h-4" />
              <span>Read Aloud</span>
            </button>
          </div>

          {/* In One Sentence */}
          <div
            className={`p-4 rounded-2xl border ${
              activeExplanation.isUrgent
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider block opacity-75">
              The bottom line in simple words:
            </span>
            <p className="text-lg font-bold mt-1 leading-snug">
              {activeExplanation.inOneSentence}
            </p>
          </div>

          {/* What It Means - 2 to 3 Bullet Points */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Key Details to Know:
            </h4>
            <div className="space-y-2">
              {activeExplanation.whatItMeans.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 text-stone-800 text-sm sm:text-base">
                  <CheckCircle2 className="w-5 h-5 text-[#1b5e3b] shrink-0 mt-0.5" />
                  <span className="font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What You Need to Do (Action Item) */}
          <div className="bg-[#fbf9f5] rounded-2xl p-4 border border-[#e7e3da] space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              What should you do next?
            </span>
            <p className="text-base font-bold text-[#0f2942]">
              {activeExplanation.whatYouNeedToDo}
            </p>
          </div>
        </div>
      </div>

      {/* Paste Your Own Confusing Message */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0f2942] font-display">
              Have a Different Message or Letter?
            </h3>
            <p className="text-sm text-stone-600">
              Paste or type any confusing text from your phone here.
            </p>
          </div>

          {customExplanation && (
            <button
              onClick={() => {
                setCustomText('');
                setCustomExplanation(null);
                setSelectedSample(UNDERSTAND_SAMPLES[0]);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 self-start sm:self-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Examples</span>
            </button>
          )}
        </div>

        <div className="space-y-3">
          <textarea
            id="understand-custom-textarea"
            rows={3}
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Type or paste the SMS, email, or letter here..."
            className="w-full p-4 rounded-2xl bg-[#fbf9f5] border border-[#d8d3c7] text-[#0f2942] font-medium text-base focus:bg-white transition-all"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={async () => {
                try {
                  const clip = await navigator.clipboard.readText();
                  if (clip) setCustomText(clip);
                } catch {
                  // ignore
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 text-xs font-bold border border-[#d8d3c7] cursor-pointer"
            >
              <ClipboardPaste className="w-4 h-4" />
              <span>Paste from Clipboard</span>
            </button>

            <button
              id="explain-custom-text-btn"
              onClick={handleExplainCustomText}
              disabled={!customText.trim()}
              className="px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-40 text-white font-extrabold text-base shadow-xs cursor-pointer transition-all"
            >
              Explain in Simple Words
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
