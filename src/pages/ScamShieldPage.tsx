import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  PhoneCall,
  Volume2,
  CheckCircle2,
  XCircle,
  Key,
  ArrowDownLeft,
  ZapOff,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { ScamCheckAnalysis } from '../types';
import { SCAM_RULES } from '../data/mockData';
import { speakText, playGentleChime } from '../utils/speech';

export const ScamShieldPage: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [analysis, setAnalysis] = useState<ScamCheckAnalysis | null>(null);

  const sampleScamTests = [
    {
      label: 'Electricity Cut Threat',
      text: 'Dear consumer, your electricity power will be disconnected tonight at 9.30 pm because your previous month bill was not updated. Please call officer Sharma at 9876543210 immediately.',
    },
    {
      label: 'Lottery Prize WhatsApp',
      text: 'Congratulations! Your mobile number won Rs 25,00,000 in Kaun Banega Crorepati lucky draw lottery. Send your bank passbook photo and pay Rs 1,500 registration fee on WhatsApp.',
    },
    {
      label: 'Legitimate Bank Alert',
      text: 'INR 500.00 withdrawn from ATM at MG Road on 18-Sep-26. Avail Bal: INR 32,100.00. For queries call 1800-425-3800.',
    },
  ];

  const handleCheckScam = (textToCheck?: string) => {
    const text = (textToCheck || inputText).trim();
    if (!text) return;

    playGentleChime('tap');
    const lower = text.toLowerCase();

    let result: ScamCheckAnalysis;

    if (
      lower.includes('disconnected tonight') ||
      lower.includes('power cut') ||
      lower.includes('lottery') ||
      lower.includes('won') ||
      lower.includes('kbc') ||
      lower.includes('crorepati') ||
      lower.includes('anydesk') ||
      lower.includes('teamviewer') ||
      lower.includes('share otp') ||
      lower.includes('apk') ||
      lower.includes('quicksupport') ||
      lower.includes('registration fee') ||
      lower.includes('bit.ly') ||
      lower.includes('ind-post') ||
      lower.includes('kyc update')
    ) {
      result = {
        verdict: 'danger',
        headline: '🚨 DANGER: This is Almost Certainly a FRAUD Attempt',
        explanation:
          'This message uses urgency, fear, or greed to trick you. Government departments and real banks NEVER threaten immediate same-day disconnection over an SMS, and nobody gives random lottery prizes.',
        identifiedRedFlags: [
          'Fake urgency ("Tonight at 9:30 PM", "Within 12 hours")',
          'Asking you to call an unofficial personal 10-digit mobile number',
          'Asking for registration fees, OTPs, or suspicious app downloads',
        ],
        safeAction:
          'DO NOT reply. DO NOT call that number. DO NOT send any money or OTP. Delete the message. You are completely safe.',
        confidence: 'High Risk Scam',
      };
    } else if (
      lower.includes('withdrawn') ||
      lower.includes('debited') ||
      lower.includes('credited') ||
      lower.includes('avail bal')
    ) {
      result = {
        verdict: 'safe',
        headline: '✅ Standard Bank Transaction Notification',
        explanation:
          'This resembles a regular informational bank statement alert. Notice that it does not demand urgent money, does not ask for your secret OTP, and lists an official toll-free number.',
        identifiedRedFlags: [
          'No threats of arrest or sudden account closure',
          'No suspicious link to click',
          'Only reporting transaction details',
        ],
        safeAction:
          'Check your passbook or bank statement to ensure you made this transaction. If you recognize the amount, no action needed.',
        confidence: 'Informational Bank Alert',
      };
    } else {
      result = {
        verdict: 'warning',
        headline: '⚠️ CAUTION: Verify Before Sharing Anything',
        explanation:
          'While this message may not have obvious criminal words, you should always treat unexpected requests with caution.',
        identifiedRedFlags: [
          'Always confirm sender identity through family or official office numbers',
          'Never share passwords or screen access',
        ],
        safeAction:
          'When in doubt, show this to your children or trusted family before taking any action.',
        confidence: 'Needs Caution',
      };
    }

    setAnalysis(result);
    playGentleChime(result.verdict === 'danger' ? 'alert' : 'success');
    speakText(`${result.headline}. ${result.explanation}. Recommended action: ${result.safeAction}`);
  };

  const getRuleIcon = (icon: string) => {
    switch (icon) {
      case 'Key':
        return <Key className="w-6 h-6 text-amber-600" />;
      case 'ArrowDownLeft':
        return <ArrowDownLeft className="w-6 h-6 text-blue-600" />;
      case 'ZapOff':
        return <ZapOff className="w-6 h-6 text-rose-600" />;
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-indigo-600" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner */}
      <div className="bg-[#0f2942] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs sm:text-sm font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>Senior Digital Safety & Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Scam Shield
          </h1>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl">
            Never feel scared or pressured. Check if any message or phone call looks suspicious.
          </p>
        </div>

        <button
          onClick={() =>
            speakText(
              'Welcome to Scam Shield. Never share your OTP with anyone. Check any suspicious message below.'
            )
          }
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-base cursor-pointer shrink-0 shadow-xs transition-colors"
          title="Read instructions aloud"
        >
          <Volume2 className="w-5 h-5" />
          <span>Read Aloud</span>
        </button>
      </div>

      {/* Interactive Scam Checker Box */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#f5f1ea] text-[#0f2942] flex items-center justify-center font-bold border border-[#e7e3da]">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0f2942] font-display">
              Check a Suspicious Message or Number
            </h2>
            <p className="text-sm text-stone-600 font-medium">
              Paste the message below, and Mitra One will tell you if it looks safe or dangerous.
            </p>
          </div>
        </div>

        {/* Quick Test Samples */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Or test with a common sample message:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleScamTests.map((t, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputText(t.text);
                  handleCheckScam(t.text);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-800 text-xs sm:text-sm font-semibold border border-[#d8d3c7] transition-colors cursor-pointer"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste SMS, WhatsApp forward, or type what the caller told you..."
          className="w-full p-4 rounded-2xl border border-[#d8d3c7] bg-[#fbf9f5] focus:bg-white text-base sm:text-lg font-medium text-[#0f2942] placeholder:text-stone-400 transition-all"
        />

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleCheckScam()}
            disabled={!inputText.trim()}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-40 text-white font-extrabold text-base sm:text-lg shadow-xs cursor-pointer transition-all"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Check Safety Now</span>
          </button>

          {inputText && (
            <button
              onClick={() => {
                setInputText('');
                setAnalysis(null);
              }}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 font-bold text-sm border border-[#d8d3c7] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Analysis Result Card */}
        {analysis && (
          <div
            className={`mt-6 p-6 sm:p-7 rounded-3xl border shadow-xs space-y-4 ${
              analysis.verdict === 'danger'
                ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                : analysis.verdict === 'safe'
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-amber-50/70 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border inline-block mb-2 text-stone-700">
                  {analysis.confidence}
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-display">
                  {analysis.headline}
                </h3>
              </div>

              <button
                onClick={() =>
                  speakText(
                    `${analysis.headline}. ${analysis.explanation}. Action: ${analysis.safeAction}`
                  )
                }
                className="p-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 cursor-pointer shrink-0"
                title="Read verdict aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <p className="text-base sm:text-lg font-medium leading-relaxed">
              {analysis.explanation}
            </p>

            {/* Red flags */}
            <div className="bg-white/80 rounded-2xl p-4 border border-stone-200/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Identified Indicators:
              </h4>
              <div className="space-y-1.5">
                {analysis.identifiedRedFlags.map((flag, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm sm:text-base font-medium">
                    {analysis.verdict === 'danger' ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    )}
                    <span>{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safe action to take */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
                What you should do:
              </span>
              <p className="text-base sm:text-lg font-extrabold text-[#0f2942]">
                {analysis.safeAction}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The 4 Golden Rules for Digital Safety */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] font-display">
            The 4 Golden Rules of Digital Safety
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-medium mt-0.5">
            Memorize these simple principles to keep your bank savings 100% safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCAM_RULES.map((rule) => (
            <div
              key={rule.id}
              className="bg-white rounded-3xl p-6 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#f5f1ea] border border-[#e7e3da] flex items-center justify-center">
                    {getRuleIcon(rule.icon)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                      Rule {rule.id}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0f2942]">
                      {rule.title}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => speakText(`Rule ${rule.id}: ${rule.title}. ${rule.simpleRule}. ${rule.explanation}`)}
                  className="p-2 rounded-xl bg-[#fbf9f5] hover:bg-[#f5f1ea] border border-[#e7e3da] text-stone-600 cursor-pointer"
                  title="Read rule aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fbf9f5] border border-[#e7e3da] text-[#0f2942] font-bold text-sm sm:text-base">
                {rule.simpleRule}
              </div>

              <p className="text-sm text-stone-600 font-medium leading-relaxed">
                {rule.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Cyber Crime Helpline Callout */}
      <div className="bg-[#0f2942] text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl sm:text-2xl font-bold font-display">
            Need Immediate Help or Think You Lost Money?
          </h3>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl">
            Call the Government of India Cyber Crime Helpline <strong>1930</strong> immediately within 2 hours to freeze fraudulent transactions.
          </p>
        </div>

        <a
          href="tel:1930"
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1b5e3b] hover:bg-[#164c30] text-white font-extrabold text-base shadow-xs transition-colors shrink-0"
        >
          <PhoneCall className="w-5 h-5" />
          <span>Call 1930 Helpline</span>
        </a>
      </div>
    </div>
  );
};
