import React, { useState, useEffect } from 'react';
import {
  Mic,
  CalendarCheck2,
  HelpCircle,
  ShieldAlert,
  BellRing,
  Volume2,
  ArrowRight,
  Clock,
  Calendar,
  Zap,
  Phone,
  CheckCircle2,
  Circle,
  MessageSquareText,
  AlertOctagon,
  PhoneCall,
  Hospital
} from 'lucide-react';
import { PageId, ReminderItem, UserProfile, LanguageCode } from '../types';
import { getLanguageConfig } from '../data/languages';
import { speakText, playGentleChime, useSpeechStatus } from '../utils/speech';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenTalkModal: () => void;
  onOpenSos: () => void;
  user: UserProfile | null;
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
  language?: LanguageCode;
}

interface GlanceItem {
  id: string;
  title: string;
  timeNote: string;
  icon: React.ElementType;
  iconColor: string;
  badge: string;
  completed?: boolean;
}

const HeroSpeakButton: React.FC<{ speechText: string; language?: LanguageCode }> = ({
  speechText,
  language,
}) => {
  const isSpeaking = useSpeechStatus(speechText);
  return (
    <button
      id="home-speak-hero-btn"
      onClick={() => speakText(speechText, language)}
      className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
        isSpeaking
          ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
          : 'bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 border-[#d8d3c7]'
      }`}
      title={isSpeaking ? 'Speaking greeting...' : 'Read aloud in selected language'}
      aria-label={isSpeaking ? 'Speaking greeting aloud' : 'Read greeting aloud'}
    >
      <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-[#ea580c] animate-pulse' : 'text-stone-700'}`} />
    </button>
  );
};

const GlanceSpeakButton: React.FC<{ speechText: string; language?: LanguageCode }> = ({
  speechText,
  language,
}) => {
  const isSpeaking = useSpeechStatus('Today at a glance');
  return (
    <button
      id="read-glance-section-btn"
      onClick={() => speakText(speechText, language)}
      className={`p-2.5 rounded-xl border cursor-pointer transition-colors ${
        isSpeaking
          ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-2xs'
          : 'bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 border-[#d8d3c7]'
      }`}
      title={isSpeaking ? 'Reading schedule...' : 'Read schedule aloud'}
      aria-label={isSpeaking ? 'Reading schedule aloud' : 'Read today at a glance aloud'}
    >
      <Volume2 className={`w-5 h-5 ${isSpeaking ? 'text-[#ea580c] animate-pulse' : ''}`} />
    </button>
  );
};

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenTalkModal,
  onOpenSos,
  user,
  reminders,
  onToggleReminder,
  language = 'en',
}) => {
  const [greeting, setGreeting] = useState('Good morning 👋');

  // Interactive state for the "Today at a glance" sample items
  const [glanceItems, setGlanceItems] = useState<GlanceItem[]>([
    {
      id: 'glance-1',
      title: 'Doctor appointment',
      timeNote: '4:00 PM',
      icon: Calendar,
      iconColor: 'text-blue-700 bg-blue-50 border-blue-200',
      badge: 'Dr. Sharma Clinic',
      completed: false,
    },
    {
      id: 'glance-2',
      title: 'Electricity bill',
      timeNote: 'Due tomorrow',
      icon: Zap,
      iconColor: 'text-amber-800 bg-amber-50 border-amber-200',
      badge: '₹1,450 • Due Tomorrow',
      completed: false,
    },
    {
      id: 'glance-3',
      title: 'Call family',
      timeNote: '7:00 PM',
      icon: Phone,
      iconColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      badge: 'Rahul & Sunita',
      completed: false,
    },
  ]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) {
      setGreeting('Good afternoon 👋');
    } else if (hour >= 17 || hour < 4) {
      setGreeting('Good evening 👋');
    } else {
      setGreeting('Good morning 👋');
    }
  }, []);

  const actionCards = [
    {
      id: 'ask-mitra-one' as PageId,
      title: 'Ask Mitra One',
      description: 'Ask any question in simple words. Step-by-step guidance for phones, apps, and daily digital tasks.',
      actionLabel: 'Ask a Question',
      icon: MessageSquareText,
      cardBg: 'bg-[#fff8f2] border-[#fed7aa] hover:border-[#ea580c] hover:shadow-[0_10px_30px_-4px_rgba(234,88,12,0.12)]',
      iconBg: 'bg-[#ffedd5] text-[#ea580c] border-[#fdba74]',
      badgeText: 'Voice & Chat Assistant',
      badgeColor: 'bg-orange-100/80 text-orange-900 border-orange-200',
      ariaLabel: 'Open Ask Mitra One - Ask any question in simple words',
    },
    {
      id: 'understand' as PageId,
      title: 'Understand',
      description: 'Make bills, letters, bank messages and official texts clear and easy to understand.',
      actionLabel: 'Explain a Document',
      icon: HelpCircle,
      cardBg: 'bg-[#f0f9ff] border-[#bae6fd] hover:border-[#0284c7] hover:shadow-[0_10px_30px_-4px_rgba(2,132,199,0.12)]',
      iconBg: 'bg-[#e0f2fe] text-[#0284c7] border-[#7dd3fc]',
      badgeText: 'Document Simplifier',
      badgeColor: 'bg-sky-100/80 text-sky-900 border-sky-200',
      ariaLabel: 'Open Understand - Make bills, letters and messages easier to understand',
    },
    {
      id: 'scam-shield' as PageId,
      title: 'Scam Shield',
      description: 'Check suspicious SMS, WhatsApp messages, lottery claims or calls before you respond.',
      actionLabel: 'Check a Message',
      icon: ShieldAlert,
      cardBg: 'bg-[#f0fdf4] border-[#bbf7d0] hover:border-[#16a34a] hover:shadow-[0_10px_30px_-4px_rgba(22,163,74,0.12)]',
      iconBg: 'bg-[#dcfce7] text-[#16a34a] border-[#86efac]',
      badgeText: 'Safety & Fraud Protection',
      badgeColor: 'bg-emerald-100/80 text-emerald-900 border-emerald-200',
      ariaLabel: 'Open Scam Shield - Check if a message looks suspicious',
    },
    {
      id: 'my-day' as PageId,
      title: 'My Day',
      description: 'See what matters today: medicines, doctor appointments, calls, and daily routine.',
      actionLabel: "View Today's Routine",
      icon: CalendarCheck2,
      cardBg: 'bg-[#faf5ff] border-[#e9d5ff] hover:border-[#9333ea] hover:shadow-[0_10px_30px_-4px_rgba(147,51,234,0.12)]',
      iconBg: 'bg-[#f3e8ff] text-[#9333ea] border-[#d8b4fe]',
      badgeText: 'Care & Daily Schedule',
      badgeColor: 'bg-purple-100/80 text-purple-900 border-purple-200',
      ariaLabel: 'Open My Day - See what matters today',
    },
    {
      id: 'nearby-care' as PageId,
      title: 'Nearby Care',
      description: 'Find hospitals and clinics near you.',
      actionLabel: 'Find Nearby Care',
      icon: Hospital,
      cardBg: 'bg-[#f0fdfa] border-[#99f6e4] hover:border-[#0d9488] hover:shadow-[0_10px_30px_-4px_rgba(13,148,136,0.12)]',
      iconBg: 'bg-[#ccfbf1] text-[#0f766e] border-[#5eead4]',
      badgeText: 'Hospitals & Clinics',
      badgeColor: 'bg-teal-100/80 text-teal-900 border-teal-200',
      ariaLabel: 'Open Nearby Care - Find hospitals and clinics near you',
    },
  ];

  const handleToggleGlance = (id: string) => {
    setGlanceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          playGentleChime(nextState ? 'success' : 'tap');
          if (nextState) {
            speakText(
              language === 'hi'
                ? `${item.title} पूरा हो गया है।`
                : `${item.title} marked as done.`,
              language
            );
          }
          return { ...item, completed: nextState };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* 1. Compact Welcoming Bar (Matching Reference Screen 4) */}
      <section
        aria-label="Welcome and Voice Assistant"
        className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e7e3da] shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)] text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2.5">
            <h1
              id="home-greeting-title"
              className="text-2xl sm:text-3xl font-black text-[#0f2942] tracking-tight font-display"
            >
              {user ? `${greeting.replace(' 👋', '')}, ${user.fullName.split(' ')[0]} 👋` : greeting}
            </h1>
            {(() => {
              const heroSpeechText =
                language === 'hi'
                  ? 'नमस्ते। मैं मित्रा वन हूँ। मैं आपकी कैसे मदद कर सकता हूँ?'
                  : 'Hello. I am Mitra One. How can I help you today?';
              return (
                <HeroSpeakButton speechText={heroSpeechText} language={language} />
              );
            })()}
          </div>

          <p className="text-sm sm:text-base text-stone-600 font-medium">
            How can MITRA ONE help you today? Choose an option or speak your question.
          </p>
        </div>

        {/* Polished Senior-Friendly Voice Assistant Control: "TALK TO MITRA ONE" */}
        <div className="w-full md:w-auto shrink-0">
          <button
            id="talk-to-mitra-primary-btn"
            onClick={onOpenTalkModal}
            className="w-full md:w-auto min-h-[64px] px-6 py-4 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] active:bg-[#9a3412] text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-start sm:justify-center gap-4 border-2 border-orange-600/50 active:scale-[0.98] group"
            aria-label="Talk to MITRA ONE - Tap to speak"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Mic className="w-7 h-7 text-white" strokeWidth={2.4} />
            </div>
            <div className="text-left">
              <span className="block font-black text-base sm:text-lg tracking-wide uppercase font-display leading-tight text-white">
                TALK TO MITRA ONE
              </span>
              <span className="block text-xs sm:text-sm font-semibold text-orange-100 mt-0.5">
                {language === 'hi' ? 'बोलने के लिए दबाएँ' : 'Tap to speak'}
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* 2. Grid of 4 Feature Cards (Directly visible without scrolling - Soft Pastel Design) */}
      <section aria-label="Four Main Services" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                id={`action-card-${card.id}`}
                onClick={() => {
                  playGentleChime('tap');
                  onNavigate(card.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    playGentleChime('tap');
                    onNavigate(card.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={card.ariaLabel}
                className={`rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 group text-left ${card.cardBg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${card.iconBg}`}>
                      <Icon className="w-6 h-6" strokeWidth={2.4} />
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                      {card.badgeText}
                    </span>
                  </div>

                  {/* Read Aloud button for card */}
                  <button
                    id={`read-card-${card.id}-btn`}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(`${card.title}. ${card.description}. Tap to open.`, language);
                    }}
                    className="p-2 rounded-lg bg-white/80 hover:bg-white text-stone-700 border border-[#d8d3c7] shadow-2xs cursor-pointer transition-colors"
                    title="Read card aloud"
                    aria-label={`Read ${card.title} aloud`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f2942] tracking-tight font-display">
                    {card.title}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-stone-700 leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-stone-200/60">
                  <span className="text-xs sm:text-sm font-black text-[#0f2942] group-hover:text-[#ea580c] transition-colors flex items-center">
                    {card.actionLabel}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-white text-[#ea580c] border border-stone-200 flex items-center justify-center group-hover:translate-x-1 transition-all shadow-2xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Emergency SOS Section (Red/Soft-Pink card with Helpline 112 & 14567) */}
      <section
        aria-label="Emergency SOS Action"
        className="bg-rose-50 rounded-2xl p-4 sm:p-5 border-2 border-rose-300 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black shadow-2xs shrink-0">
            <AlertOctagon className="w-6 h-6" strokeWidth={2.6} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg sm:text-xl font-black text-rose-950 font-display">
                Emergency SOS Help
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider">
                Helpline 112
              </span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-rose-900 mt-0.5">
              Need immediate help? Connect with emergency services or your trusted contact ({user?.trustedContactName || 'Family Member'}).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
          <button
            id="home-sos-call-btn"
            onClick={onOpenSos}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-rose-700 active:scale-[0.98]"
            aria-label="Open SOS emergency help"
          >
            <PhoneCall className="w-4 h-4 animate-pulse" />
            <span>OPEN SOS HELP</span>
          </button>

          <a
            href="tel:112"
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-rose-700" />
            <span>Call 112</span>
          </a>

          <a
            href="tel:14567"
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-rose-700" />
            <span>Helpline 14567</span>
          </a>

          <button
            id="home-sos-nearby-care-btn"
            onClick={() => {
              playGentleChime('tap');
              onNavigate('nearby-care');
            }}
            className="px-3 py-2.5 rounded-xl bg-white hover:bg-teal-50 text-[#0f766e] border border-teal-300 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            aria-label="Find nearby hospitals and clinics"
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>Nearby Care</span>
          </button>
        </div>
      </section>

      {/* 3. Section: "Today at a glance" */}
      <section
        aria-labelledby="today-glance-heading"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4"
      >
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h2
              id="today-glance-heading"
              className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] font-display"
            >
              Today at a glance
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-medium mt-0.5">
              Your important appointments and tasks for today
            </p>
          </div>

          <GlanceSpeakButton
            speechText="Today at a glance: Doctor appointment at 4:00 PM. Electricity bill due tomorrow. Call family at 7:00 PM."
            language={language}
          />
        </div>

        {/* 3 Realistic Example Items - Visually calm and easy to scan */}
        <div className="space-y-3">
          {glanceItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                id={`glance-item-${item.id}`}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                  item.completed
                    ? 'bg-[#fbf9f5] border-[#e7e3da] opacity-75'
                    : 'bg-white border-[#e7e3da] hover:border-[#cbd5e1]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Completion Toggle */}
                  <button
                    id={`toggle-glance-${item.id}-btn`}
                    onClick={() => handleToggleGlance(item.id)}
                    className="cursor-pointer text-[#1b5e3b] hover:opacity-80 transition-transform active:scale-90 shrink-0"
                    aria-label={`Mark ${item.title} as ${item.completed ? 'not done' : 'done'}`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-7 h-7 text-[#1b5e3b] fill-emerald-100" />
                    ) : (
                      <Circle className="w-7 h-7 text-stone-400 hover:text-[#1b5e3b]" />
                    )}
                  </button>

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${item.iconColor}`}>
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>

                  {/* Text Details */}
                  <div>
                    <h3
                      className={`text-lg sm:text-xl font-bold ${
                        item.completed ? 'line-through text-stone-400' : 'text-[#0f2942]'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-semibold text-stone-500">
                      {item.badge}
                    </p>
                  </div>
                </div>

                {/* Right note & time */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pl-10 sm:pl-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5f1ea] border border-[#e7e3da] text-sm font-bold text-[#0f2942]">
                    <Clock className="w-4 h-4 text-stone-600" />
                    {item.timeNote}
                  </span>

                  <button
                    id={`read-glance-${item.id}-btn`}
                    onClick={() =>
                      speakText(
                        `${item.title}, ${item.timeNote}. ${item.badge}. ${
                          item.completed ? 'Status: completed.' : 'Status: upcoming.'
                        }`
                      )
                    }
                    className="p-2 rounded-xl bg-white hover:bg-[#f5f1ea] text-stone-600 border border-[#e7e3da] cursor-pointer"
                    title="Read aloud"
                    aria-label={`Read ${item.title} aloud`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Bottom Section: "Need help with something else?" */}
      <section
        aria-label="Additional Assistance"
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <div className="space-y-1 max-w-xl">
          <h2 className="text-xl sm:text-2xl font-black text-[#0f2942] font-display">
            Need help with something else?
          </h2>
          <p className="text-base text-stone-600 font-medium">
            Ask any question about using your phone, apps, or daily digital tasks.
          </p>
        </div>

        <button
          id="ask-mitra-bottom-btn"
          onClick={() => {
            playGentleChime('tap');
            onNavigate('ask-mitra-one');
          }}
          className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
          aria-label="Open Ask Mitra One"
        >
          <MessageSquareText className="w-5 h-5 text-white" />
          <span>Ask Mitra One</span>
        </button>
      </section>
    </div>
  );
};
