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
  RotateCcw,
  Sparkles,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { ScamCheckAnalysis, PageId, LanguageCode } from '../types';
import { SCAM_RULES } from '../data/mockData';
import { getLanguageConfig } from '../data/languages';
import { speakText, playGentleChime } from '../utils/speech';

interface ScamShieldPageProps {
  onNavigate?: (page: PageId, initialQuestion?: string) => void;
  language?: LanguageCode;
}

export const ScamShieldPage: React.FC<ScamShieldPageProps> = ({ onNavigate, language = 'en' }) => {
  const langConfig = getLanguageConfig(language);
  const [inputText, setInputText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [analysis, setAnalysis] = useState<ScamCheckAnalysis | null>(null);

  const sampleScamTests = [
    {
      label: 'Sample Electricity Disconnection SMS',
      text: 'Dear consumer, your electricity power will be disconnected tonight at 9.30 pm because your previous month bill was not updated. Please call officer Sharma at 9876543210 immediately.',
    },
    {
      label: 'Sample Lottery / Gift Prize',
      text: 'Congratulations! Your mobile number won Rs 25,00,000 in Kaun Banega Crorepati lucky draw lottery. Send your bank passbook photo and pay Rs 1,500 registration fee on WhatsApp.',
    },
    {
      label: 'Sample KYC Update Threat',
      text: 'Dear Customer, Your SBI Bank account has been blocked today due to pending PAN/KYC update. Click http://bit.ly/sbi-kyc-verify to update immediately or your account will be closed in 24 hours.',
    },
  ];

  const handleCheckScam = async (textToCheck?: string) => {
    const text = (textToCheck || inputText).trim();
    if (!text || isChecking) return;

    playGentleChime('tap');
    setIsChecking(true);

    try {
      const res = await fetch('/api/gemini/scam-shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      const data: ScamCheckAnalysis = await res.json();
      setAnalysis(data);
      setIsChecking(false);

      playGentleChime(data.verdict === 'danger' ? 'alert' : 'success');
      speakText(
        `${data.headline}. ${data.explanation}. What to do: ${data.safeAction}. Remember: ${data.securityAdvice || ''}`,
        language
      );
    } catch (err) {
      console.error('Error in handleCheckScam:', err);
      setIsChecking(false);

      // Rule-based fallback for senior protection in chosen language
      const lower = text.toLowerCase();
      let fallbackResult: ScamCheckAnalysis;

      if (
        lower.includes('disconnected tonight') ||
        lower.includes('power cut') ||
        lower.includes('lottery') ||
        lower.includes('won') ||
        lower.includes('kbc') ||
        lower.includes('anydesk') ||
        lower.includes('share otp') ||
        lower.includes('registration fee')
      ) {
        fallbackResult = {
          verdict: 'danger',
          verdictLabel: language === 'hi' ? 'उच्च जोखिम (धोखाधड़ी)' : 'High Risk',
          headline:
            language === 'hi'
              ? '🚨 उच्च जोखिम: यह निश्चित रूप से धोखाधड़ी (Scam) का प्रयास है'
              : '🚨 High Risk: This is Almost Certainly a FRAUD Attempt',
          explanation:
            language === 'hi'
              ? 'यह संदेश आपको जल्दबाजी में डालने का प्रयास कर रहा है। असली बिजली विभाग कभी भी तुरंत बिजली नहीं काटता और न ही लॉटरी में पैसे मांगे जाते हैं।'
              : 'This message uses fear or greed to rush you into an unsafe action. Real utility offices never disconnect power without weeks of written notice, and lottery wins never ask for registration fees.',
          identifiedRedFlags:
            language === 'hi'
              ? [
                  'झूठी तात्कालिकता और डर ("आज रात 9:30 बजे बिजली कट जाएगी")',
                  'व्यक्तिगत 10-अंकीय नंबर दिया गया है',
                  'तुरंत पैसे भेजने या फोन करने का दबाव',
                ]
              : [
                  'Fake panic and urgency ("Tonight at 9:30 PM")',
                  'Personal 10-digit phone number instead of official office helpdesk',
                  'Pressure to pay money or call immediately',
                ],
          safeAction:
            language === 'hi'
              ? 'जवाब न दें। उस नंबर पर कॉल न करें। कोई पैसे या ओटीपी न भेजें। आप सुरक्षित हैं।'
              : 'DO NOT reply. DO NOT call that phone number. DO NOT send any money or OTP. Delete the message. You are completely safe.',
          securityAdvice:
            language === 'hi'
              ? 'कभी भी किसी के साथ फोन या संदेश पर अपना ओटीपी, पिन, पासवर्ड या सीवीवी साझा न करें।'
              : 'Never share your OTP, PIN, password, or CVV with anyone on phone calls or messages.',
          suggestedMitraQuestion:
            language === 'hi'
              ? 'बिजली बिल धोखाधड़ी कैसे काम करती है, और मैं अपना असली बिल कैसे जांच सकता हूँ?'
              : 'How do electricity disconnection scams work, and how can I check my real bill?',
        };
      } else {
        fallbackResult = {
          verdict: 'warning',
          verdictLabel: language === 'hi' ? 'सावधान रहें' : 'Be Careful',
          headline:
            language === 'hi'
              ? '⚠️ सावधानी: कृपया इस संदेश की ध्यान से पुष्टि करें'
              : '⚠️ Caution: Please Verify This Message Carefully',
          explanation:
            language === 'hi'
              ? 'किसी भी संदेश में पैसे या व्यक्तिगत जानकारी मांगे जाने पर हमेशा रुकें और पुष्टि करें।'
              : 'Always pause and verify any message that asks for money, personal details, or unexpected action.',
          identifiedRedFlags:
            language === 'hi'
              ? [
                  'कोई भी कदम उठाने से पहले अपने बैंक या परिवार से पुष्टि करें',
                  'अपरिचित नंबरों से भेजे गए लिंक पर कभी क्लिक न करें',
                ]
              : [
                  'Always verify with your bank or family before taking action',
                  'Never click unknown links sent from unknown numbers',
                ],
          safeAction:
            language === 'hi'
              ? 'कोई बैंक विवरण या गुप्त पासवर्ड साझा न करें। संदेह होने पर परिवार से सलाह लें।'
              : 'Do not share any bank details or secret passwords. When in doubt, consult family.',
          securityAdvice:
            language === 'hi'
              ? 'कभी भी किसी के साथ अपना ओटीपी, पिन, पासवर्ड या सीवीवी साझा न करें।'
              : 'Never share your OTP, PIN, password, or CVV with anyone.',
          suggestedMitraQuestion:
            language === 'hi'
              ? 'यदि कोई अज्ञात कॉलर व्यक्तिगत विवरण मांगता है तो मुझे क्या करना चाहिए?'
              : 'What should I do if an unknown caller asks for personal details?',
        };
      }

      setAnalysis(fallbackResult);
      playGentleChime(fallbackResult.verdict === 'danger' ? 'alert' : 'tap');
      speakText(`${fallbackResult.headline}. ${fallbackResult.explanation}`, language);
    }
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
      {/* Top Banner matching Reference Screen */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {langConfig.name} ({langConfig.nativeName})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f2942] font-display">
            Scam Shield
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            Paste a message, SMS or call details to check if someone is trying to cheat you.
          </p>
        </div>

        <button
          onClick={() =>
            speakText(
              'Scam Shield. Paste a message, SMS or call details to check if someone is trying to cheat you. Never share your secret OTP, PIN or password with anyone.',
              language
            )
          }
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-extrabold text-xs sm:text-sm cursor-pointer shrink-0 shadow-xs transition-colors"
          title="Read instructions aloud in selected language"
        >
          <Volume2 className="w-4 h-4 text-amber-300" />
          <span>Read Aloud</span>
        </button>
      </div>

      {/* Critical Senior Safety Banner */}
      <div className="bg-[#fff8f2] rounded-2xl p-4 sm:p-5 border border-[#fed7aa] flex items-start gap-3.5 text-stone-800 shadow-xs text-left">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold border border-amber-200">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-black text-[#0f2942]">
            Privacy First Safety Rule for Seniors:
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-stone-700 mt-0.5 leading-relaxed">
            <strong>NEVER</strong> share your <strong>OTP, ATM PIN, Password, or CVV</strong> number with anyone—even if they claim to be from your bank, police, or electricity department. Genuine officers and MITRA ONE will <strong>never</strong> ask for them.
          </p>
        </div>
      </div>

      {/* Interactive Scam Checker Box */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e7e3da] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0f2942] font-display">
              Check a Message or Call
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Paste the text or describe what the caller asked for. Gemini AI will analyze it immediately.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  const clip = await navigator.clipboard.readText();
                  if (clip) {
                    setInputText(clip);
                    handleCheckScam(clip);
                  }
                } catch {
                  // clipboard unavailable
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 text-xs font-bold border border-[#d8d3c7] cursor-pointer"
            >
              <span>📋 Paste</span>
            </button>

            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setAnalysis(null);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 text-xs font-bold border border-[#d8d3c7] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
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
                className="px-3 py-1.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-[#0f2942] text-xs sm:text-sm font-bold border border-[#d8d3c7] transition-colors cursor-pointer"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <textarea
          id="scam-shield-input-text"
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste SMS, WhatsApp message, or type what the caller told you..."
          className="w-full p-4 rounded-xl border-2 border-[#d8d3c7] bg-[#fbf9f5] focus:bg-white text-sm sm:text-base font-medium text-[#0f2942] placeholder:text-stone-400 focus:border-[#ea580c] transition-all outline-none"
        />

        <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
          <span className="text-xs text-stone-500 font-medium">
            AI examines caller pressure, fake urgency, suspicious links, and unverified bank demands.
          </span>

          <button
            id="scam-shield-check-btn"
            onClick={() => handleCheckScam()}
            disabled={!inputText.trim() || isChecking}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-40 text-white font-black text-sm sm:text-base shadow-sm cursor-pointer transition-all active:scale-[0.98]"
          >
            {isChecking ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Checking Message...</span>
              </>
            ) : (
              <>
                <span>Check for Safety</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Clear Safety Status Indicator Cards */}
      <div className="space-y-2 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
          Safety Status Standards:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-4 rounded-2xl border-2 transition-all ${analysis?.verdict === 'safe' ? 'bg-[#f0fdf4] border-[#16a34a] ring-2 ring-emerald-500/20' : 'bg-white border-[#e7e3da]'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16a34a] flex items-center justify-center font-black">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0f2942] text-sm sm:text-base">1. Safe</h3>
                <p className="text-[11px] text-stone-500 font-medium">Official verified format</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border-2 transition-all ${analysis?.verdict === 'warning' ? 'bg-[#fffbeb] border-[#f59e0b] ring-2 ring-amber-500/20' : 'bg-white border-[#e7e3da]'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0f2942] text-sm sm:text-base">2. Suspicious</h3>
                <p className="text-[11px] text-stone-500 font-medium">Caution needed, verify first</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border-2 transition-all ${analysis?.verdict === 'danger' ? 'bg-[#fff1f2] border-[#e11d48] ring-2 ring-rose-500/20' : 'bg-white border-[#e7e3da]'}`}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#0f2942] text-sm sm:text-base">3. Danger / Scam</h3>
                <p className="text-[11px] text-stone-500 font-medium">Fraud attempt detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Detailed Result Card */}
      {analysis && (
        <div
          className={`p-5 sm:p-7 rounded-2xl border-2 shadow-xs space-y-4 text-left ${
            analysis.verdict === 'danger'
              ? 'bg-rose-50/90 border-rose-300 text-rose-950'
              : analysis.verdict === 'safe'
              ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
              : 'bg-amber-50/90 border-amber-300 text-amber-950'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border inline-block mb-2 ${
                  analysis.verdict === 'danger'
                    ? 'bg-rose-600 text-white border-rose-700'
                    : analysis.verdict === 'safe'
                    ? 'bg-emerald-700 text-white border-emerald-800'
                    : 'bg-amber-600 text-white border-amber-700'
                }`}
              >
                {analysis.verdict === 'danger' ? 'DANGER / SCAM' : analysis.verdict === 'safe' ? 'SAFE' : 'CAUTION'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display">
                {analysis.headline}
              </h3>
            </div>

            <button
              onClick={() =>
                speakText(
                  `${analysis.headline}. ${analysis.explanation}. What you should do now: ${analysis.safeAction}.`,
                  language
                )
              }
              className="p-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 cursor-pointer shrink-0 shadow-xs"
              title="Read verdict aloud in selected language"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          {/* Plain explanation */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Why this was flagged:
            </span>
            <p className="text-sm sm:text-base font-semibold leading-relaxed">
              {analysis.explanation}
            </p>
          </div>

          {/* Red flags identified */}
          <div className="bg-white/95 rounded-xl p-4 sm:p-5 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
              Red Flags Found:
            </h4>
            <div className="space-y-2">
              {analysis.identifiedRedFlags.map((flag, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold">
                  {analysis.verdict === 'danger' ? (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : analysis.verdict === 'safe' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>

          {/* What you should do now */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
              What you should do now:
            </span>
            <p className="text-sm sm:text-base font-extrabold text-[#0f2942]">
              {analysis.safeAction}
            </p>
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
                🚫 Do not click links
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold">
                🔒 Do not share OTP
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-bold">
                📱 Block the number
              </span>
            </div>
          </div>

          {/* Quick actions: Report Scam or Call 1930 */}
          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <a
              href="tel:1930"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-extrabold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Call 1930 Cyber Helpline</span>
            </a>

            {analysis.suggestedMitraQuestion && onNavigate && (
              <button
                onClick={() => onNavigate('ask-mitra-one', analysis.suggestedMitraQuestion)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#0f2942] font-bold text-xs sm:text-sm border border-stone-300 cursor-pointer transition-colors shadow-2xs"
              >
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Ask Mitra for more details</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* The 4 Golden Rules for Digital Safety */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] font-display">
            The 4 Golden Rules of Digital Safety
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-semibold mt-0.5">
            Memorize these simple principles to keep your bank savings safe and secure.
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
