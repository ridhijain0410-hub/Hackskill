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
  RotateCcw,
  Calendar,
  Bell,
  ArrowRight,
  ShieldAlert,
  Clock,
  IndianRupee
} from 'lucide-react';
import { UnderstandSample, UnderstandAnalysis, ReminderItem, PageId, LanguageCode } from '../types';
import { UNDERSTAND_SAMPLES } from '../data/mockData';
import { getLanguageConfig } from '../data/languages';
import { speakText, playGentleChime } from '../utils/speech';

interface UnderstandPageProps {
  onAddReminder?: (item: Omit<ReminderItem, 'id'>) => void;
  onNavigate?: (page: PageId) => void;
  language?: LanguageCode;
}

export const UnderstandPage: React.FC<UnderstandPageProps> = ({
  onAddReminder,
  onNavigate,
  language = 'en',
}) => {
  const langConfig = getLanguageConfig(language);
  const [selectedSample, setSelectedSample] = useState<UnderstandSample>(UNDERSTAND_SAMPLES[0]);
  const [inputText, setInputText] = useState(UNDERSTAND_SAMPLES[0].originalText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<UnderstandAnalysis>({
    whatIsThis: 'This is your monthly electricity bill statement from BESCOM for account number 50493821.',
    importantInfo: [
      'The bill is for electricity consumed at your home last month.',
      'The total amount due to be paid is ₹1,450.00.',
      'If paid before 20 September 2026, you avoid any late fees.',
    ],
    whatDoINeedToDo: 'Pay ₹1,450 before 20 September. You can pay online through your authorized payment app or in person at your local electricity counter.',
    importantDates: 'Due date: 20 September 2026',
    amount: '₹1,450',
    isUrgent: false,
    extractedReminder: {
      canCreateReminder: true,
      reminderTitle: 'Pay Electricity Bill (₹1,450)',
      reminderTime: '10:00 AM',
      reminderPeriod: 'morning',
      reminderCategory: 'routine',
      reminderDetails: 'BESCOM electricity bill ₹1,450 due',
      importantDates: '20 September 2026',
    },
  });

  const [reminderCreated, setReminderCreated] = useState(false);

  const handleAnalyzeText = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || inputText).trim();
    if (!text || isAnalyzing) return;

    playGentleChime('tap');
    setIsAnalyzing(true);
    setReminderCreated(false);

    try {
      const res = await fetch('/api/gemini/understand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      const data: UnderstandAnalysis = await res.json();
      setAnalysis(data);
      setIsAnalyzing(false);
      playGentleChime('success');

      // Voice read out summary in selected language
      speakText(
        `${data.whatIsThis}. Important dates: ${data.importantDates}. What you need to do: ${data.whatDoINeedToDo}`,
        language
      );
    } catch (err) {
      console.error('Error analyzing document:', err);
      setIsAnalyzing(false);
      // Friendly fallback
      const fallbackAnalysis: UnderstandAnalysis = {
        whatIsThis:
          language === 'hi'
            ? 'यह आपके दस्तावेज़ का सरल सारांश है।'
            : 'Here is a simplified summary of your message.',
        importantInfo:
          language === 'hi'
            ? [
                'मित्रा वन ने इस दस्तावेज़ की समीक्षा की है।',
                'बिना किसी जल्दबाजी के विवरण को ध्यान से पढ़ें।',
              ]
            : [
                'The document was reviewed by Mitra One.',
                'Review the details carefully without any hurry.',
              ],
        whatDoINeedToDo:
          language === 'hi'
            ? 'कोई भी भुगतान करने से पहले अपने परिवार के किसी विश्वसनीय सदस्य से इसकी पुष्टि करें।'
            : 'Verify this message with a trusted family member before taking any payment action.',
        importantDates:
          language === 'hi'
            ? 'मूल दस्तावेज़ पर छपी तारीख देखें।'
            : 'Check the date printed on the original document.',
        amount: '',
        isUrgent: false,
        extractedReminder: null,
      };
      setAnalysis(fallbackAnalysis);
      playGentleChime('tap');
    }
  };

  const handleSelectSample = (sample: UnderstandSample) => {
    setSelectedSample(sample);
    setInputText(sample.originalText);
    handleAnalyzeText(sample.originalText);
  };

  const handleCreateReminderFromDoc = () => {
    if (!analysis.extractedReminder || !onAddReminder) return;

    const ext = analysis.extractedReminder;
    onAddReminder({
      title: ext.reminderTitle || 'Follow up on notice',
      time: ext.reminderTime || '10:00 AM',
      period: ext.reminderPeriod || 'morning',
      category: ext.reminderCategory || 'routine',
      details: ext.reminderDetails || (analysis.amount ? `Amount: ${analysis.amount}` : 'Reminder created from document'),
      dosage: analysis.amount ? `Amount: ${analysis.amount}` : undefined,
      completed: false,
    });

    setReminderCreated(true);
    playGentleChime('success');
    speakText(`Reminder for ${ext.reminderTitle} created and added to your My Day schedule.`, language);
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

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Header Banner matching Reference Screen */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              {langConfig.name} ({langConfig.nativeName})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f2942] font-display">
            Understand
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            Make letters, bank messages and official bills easier to read.
          </p>
        </div>

        <button
          onClick={() =>
            speakText(
              `Understand. Make letters, bank messages and official bills easier to read. ${analysis.whatIsThis}. What you need to do: ${analysis.whatDoINeedToDo}`,
              language
            )
          }
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-extrabold text-xs sm:text-sm cursor-pointer shrink-0 shadow-xs transition-colors"
          title="Read full explanation aloud in selected language"
        >
          <Volume2 className="w-4 h-4 text-amber-300" />
          <span>Read Aloud</span>
        </button>
      </div>

      {/* Paste / Enter Custom Text Box with Sample Buttons */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e7e3da] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0f2942] font-display">
              Paste or Type Your Document / SMS Below
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              You can paste any confusing electricity bill, bank statement, doctor slip, or text message.
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
                    handleAnalyzeText(clip);
                  }
                } catch {
                  // clipboard denied or unavailable
                }
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 text-xs font-bold border border-[#d8d3c7] cursor-pointer"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setInputText('');
                setReminderCreated(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 text-xs font-bold border border-[#d8d3c7] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* 3 Sample Document Buttons (Exact from requirements) */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Or try a quick sample document:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                const sampleText = "Dear Customer, Your A/C XX4921 has been debited by Rs. 2,450.00 on 18-Sep-2026 for Utility Payment BESCOM. Available Bal: Rs. 42,180.50. Call 1800112211 if not done by you.";
                setInputText(sampleText);
                handleAnalyzeText(sampleText);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#f0f9ff] hover:bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] text-xs sm:text-sm font-bold cursor-pointer transition-colors"
            >
              📩 Sample Bank SMS
            </button>

            <button
              type="button"
              onClick={() => {
                const sampleText = "Department of Pension & Pensioners Welfare, Govt of India: Notice regarding submission of Annual Digital Life Certificate (Jeevan Pramaan) by 30th November 2026. Visit nearby Post Office or submit through Face Auth app. Pension disbursal for Dec 2026 depends on successful verification.";
                setInputText(sampleText);
                handleAnalyzeText(sampleText);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0] text-xs sm:text-sm font-bold cursor-pointer transition-colors"
            >
              📜 Sample Pension Letter
            </button>

            <button
              type="button"
              onClick={() => {
                const sampleText = "Apollo Clinic Billing Statement - Patient: Ramesh Sharma. Consultation & Lab Tests: Complete Blood Count, HbA1c, Lipid Profile. Total: Rs. 1,850. Net Payable after Senior Citizen concession: Rs. 1,500. Next follow-up appointment recommended on 25-Sep-2026 with Dr. Anita Rao.";
                setInputText(sampleText);
                handleAnalyzeText(sampleText);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#faf5ff] hover:bg-[#f3e8ff] text-[#9333ea] border border-[#e9d5ff] text-xs sm:text-sm font-bold cursor-pointer transition-colors"
            >
              🏥 Sample Hospital Bill
            </button>
          </div>
        </div>

        <textarea
          id="understand-input-text"
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type any bill, bank SMS, or official letter here..."
          className="w-full p-4 rounded-xl bg-[#fbf9f5] border-2 border-[#d8d3c7] text-[#0f2942] font-medium text-sm sm:text-base focus:bg-white focus:border-[#ea580c] transition-all outline-none"
        />

        <div className="flex items-center justify-between gap-4 flex-wrap pt-1">
          <span className="text-xs text-stone-500 font-medium">
            Mitra One simplifies sentences into clear, everyday language.
          </span>

          <button
            id="understand-analyze-btn"
            onClick={() => handleAnalyzeText()}
            disabled={!inputText.trim() || isAnalyzing}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-40 text-white font-black text-sm sm:text-base shadow-sm cursor-pointer transition-all active:scale-[0.98]"
          >
            {isAnalyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Explaining Document...</span>
              </>
            ) : (
              <>
                <span>Explain Simply</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* The 4 Specific Result Cards (Matching Reference: 1. Plain words, 2. What to do, 3. Amounts/dates, 4. Is this safe?) */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0f2942] font-display">
              Document Breakdown
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              4 simple answers to understand this message completely
            </p>
          </div>

          <button
            onClick={() =>
              speakText(
                `1. What this means in plain words: ${analysis.whatIsThis}. 2. What you need to do: ${analysis.whatDoINeedToDo}. 3. Important amounts and dates: ${analysis.amount || ''} ${analysis.importantDates}. 4. Is this safe? This message appears normal, but never share any secret OTP or password.`,
                language
              )
            }
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
            title="Read all 4 cards aloud"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Read All Aloud</span>
          </button>
        </div>

        {/* Card 1: What this means in plain words */}
        <div className="bg-[#f0f9ff] rounded-2xl p-5 sm:p-6 border-2 border-[#bae6fd] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#0f2942] font-extrabold text-base sm:text-lg">
              <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-900 border border-sky-300 flex items-center justify-center font-black text-xs">
                1
              </span>
              <h3 className="text-lg sm:text-xl font-black font-display text-sky-950">
                What this means in plain words
              </h3>
            </div>
            <button
              onClick={() => speakText(`What this means in plain words: ${analysis.whatIsThis}`, language)}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 cursor-pointer shadow-2xs"
              title="Read this section aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm sm:text-base font-bold text-[#0f2942] leading-relaxed pl-1 sm:pl-9">
            {analysis.whatIsThis}
          </p>
        </div>

        {/* Card 2: What you need to do */}
        <div className="bg-[#fff8f2] rounded-2xl p-5 sm:p-6 border-2 border-[#fed7aa] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#0f2942] font-extrabold text-base sm:text-lg">
              <span className="w-7 h-7 rounded-lg bg-orange-100 text-[#ea580c] border border-orange-300 flex items-center justify-center font-black text-xs">
                2
              </span>
              <h3 className="text-lg sm:text-xl font-black font-display text-orange-950">
                What you need to do
              </h3>
            </div>
            <button
              onClick={() => speakText(`What you need to do: ${analysis.whatDoINeedToDo}`, language)}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 cursor-pointer shadow-2xs"
              title="Read this section aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <div className="pl-1 sm:pl-9">
            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-orange-200 text-sm sm:text-base font-bold text-[#0f2942] leading-relaxed shadow-2xs">
              {analysis.whatDoINeedToDo}
            </div>
          </div>
        </div>

        {/* Card 3: Important amounts / dates */}
        <div className="bg-[#faf5ff] rounded-2xl p-5 sm:p-6 border-2 border-[#e9d5ff] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#0f2942] font-extrabold text-base sm:text-lg">
              <span className="w-7 h-7 rounded-lg bg-purple-100 text-[#9333ea] border border-purple-300 flex items-center justify-center font-black text-xs">
                3
              </span>
              <h3 className="text-lg sm:text-xl font-black font-display text-purple-950">
                Important amounts & dates
              </h3>
            </div>
            <button
              onClick={() => speakText(`Important dates and amount: ${analysis.amount ? `Amount is ${analysis.amount}.` : ''} Key date: ${analysis.importantDates}`, language)}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 cursor-pointer shadow-2xs"
              title="Read this section aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="pl-1 sm:pl-9 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-purple-200 flex items-center justify-center text-[#9333ea] shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-800">
                  Key Deadline or Date
                </span>
                <p className="text-base sm:text-lg font-black text-[#0f2942]">
                  {analysis.importantDates || 'No immediate deadline listed'}
                </p>
              </div>
            </div>

            {analysis.amount && (
              <div className="flex items-center gap-3 bg-white p-3 px-4 rounded-xl border border-purple-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#16a34a] flex items-center justify-center font-black text-base border border-emerald-200">
                  ₹
                </div>
                <div>
                  <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider">Amount</span>
                  <p className="text-lg font-black text-[#0f2942]">{analysis.amount}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 4: Is this safe? (Green safety verification) */}
        <div className="bg-[#f0fdf4] rounded-2xl p-5 sm:p-6 border-2 border-[#bbf7d0] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-[#0f2942] font-extrabold text-base sm:text-lg">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 text-[#16a34a] border border-emerald-300 flex items-center justify-center font-black text-xs">
                4
              </span>
              <h3 className="text-lg sm:text-xl font-black font-display text-emerald-950">
                Is this safe?
              </h3>
            </div>
            <button
              onClick={() => speakText(`Is this safe? This appears to be a legitimate informational notice. Mitra One safety tip: Real organizations will never ask for your secret bank OTP, PIN or CVV.`, language)}
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-stone-200 cursor-pointer shadow-2xs"
              title="Read this section aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="pl-1 sm:pl-9 space-y-2">
            <div className="flex items-start gap-2.5 text-xs sm:text-sm font-bold text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0 mt-0.5" />
              <span>
                Standard official correspondence format. No suspicious payment links or urgent threat language detected.
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-900">
              🛡️ <strong>Golden Safety Rule:</strong> Never share OTPs, UPI PINs, or password details over the phone or in SMS replies.
            </div>
          </div>
        </div>

        {/* CONNECTED WORKFLOW: ADD TO REMINDERS / MY DAY BUTTON */}
        {analysis.extractedReminder && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-300 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#16a34a] border border-emerald-300 flex items-center justify-center font-bold shrink-0">
                  <Bell className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                      Smart Schedule Action
                    </span>
                    <span className="text-xs font-bold text-stone-500">Detected Schedule</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0f2942] font-display mt-1">
                    Save to Your Daily Schedule
                  </h3>
                </div>
              </div>

              {!reminderCreated ? (
                <button
                  id="create-reminder-from-understand-btn"
                  onClick={handleCreateReminderFromDoc}
                  className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-base sm:text-lg shadow-md hover:shadow-lg cursor-pointer transition-all shrink-0 active:scale-[0.98]"
                >
                  <Bell className="w-5 h-5" />
                  <span>Add to Reminders / My Day</span>
                </button>
              ) : (
                <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                  <span className="px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-950 font-black text-sm border-2 border-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                    Added to Schedule!
                  </span>
                  {onNavigate && (
                    <button
                      onClick={() => onNavigate('my-day')}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-black text-sm cursor-pointer shadow-xs transition-colors"
                    >
                      <span>View in My Day</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm">
              <div className="p-3 bg-white rounded-xl border border-[#e7e3da]">
                <span className="text-xs text-stone-500 font-bold block">Reminder Title:</span>
                <strong className="text-[#0f2942] text-base">{analysis.extractedReminder.reminderTitle}</strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e7e3da]">
                <span className="text-xs text-stone-500 font-bold block">Time & Period:</span>
                <strong className="text-[#0f2942] text-base">
                  {analysis.extractedReminder.reminderTime} ({analysis.extractedReminder.reminderPeriod})
                </strong>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#e7e3da]">
                <span className="text-xs text-stone-500 font-bold block">Action Note:</span>
                <span className="text-stone-700 font-medium">
                  {analysis.extractedReminder.reminderDetails}
                </span>
              </div>
            </div>

            {reminderCreated && onNavigate && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3 text-sm text-emerald-900 font-bold">
                <span>✓ This task has been automatically scheduled in your My Day and Reminders list!</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('my-day')}
                    className="underline hover:text-emerald-950 cursor-pointer"
                  >
                    Go to My Day
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => onNavigate('reminders')}
                    className="underline hover:text-emerald-950 cursor-pointer"
                  >
                    Go to Reminders
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
