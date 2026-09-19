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
  MessageSquareText
} from 'lucide-react';
import { PageId, ReminderItem } from '../types';
import { speakText, playGentleChime } from '../utils/speech';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  onOpenTalkModal: () => void;
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
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

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenTalkModal,
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
      id: 'my-day' as PageId,
      title: 'MY DAY',
      description: 'See what matters today',
      icon: CalendarCheck2,
      ariaLabel: 'Open My Day - See what matters today',
    },
    {
      id: 'understand' as PageId,
      title: 'UNDERSTAND',
      description: 'Make bills, letters and messages easier to understand',
      icon: HelpCircle,
      ariaLabel: 'Open Understand - Make bills, letters and messages easier to understand',
    },
    {
      id: 'scam-shield' as PageId,
      title: 'SCAM SHIELD',
      description: 'Check if a message looks suspicious',
      icon: ShieldAlert,
      ariaLabel: 'Open Scam Shield - Check if a message looks suspicious',
    },
    {
      id: 'reminders' as PageId,
      title: 'REMINDERS',
      description: 'Keep track of important things',
      icon: BellRing,
      ariaLabel: 'Open Reminders - Keep track of important things',
    },
  ];

  const handleToggleGlance = (id: string) => {
    setGlanceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          playGentleChime(nextState ? 'success' : 'tap');
          if (nextState) {
            speakText(`${item.title} marked as done.`);
          }
          return { ...item, completed: nextState };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* 1. Welcoming Hero Section */}
      <section
        aria-label="Welcome and Voice Assistant"
        className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e7e3da] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] text-left flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8"
      >
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <h1
              id="home-greeting-title"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f2942] tracking-tight font-display"
            >
              {greeting}
            </h1>
            <button
              id="home-speak-hero-btn"
              onClick={() =>
                speakText(
                  `${greeting}. What would you like help with today? Ask me, show me, or tell me what you need. I will guide you step by step.`
                )
              }
              className="p-2.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 border border-[#d8d3c7] cursor-pointer transition-colors"
              title="Read aloud"
              aria-label="Read greeting aloud"
            >
              <Volume2 className="w-5 h-5 text-stone-700" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#0f2942] leading-snug">
            What would you like help with today?
          </h2>

          <p className="text-base sm:text-lg text-stone-600 font-medium leading-relaxed">
            Ask me, show me, or tell me what you need. I&apos;ll guide you step by step.
          </p>
        </div>

        {/* Largest Primary Action: "Talk to Mitra One" */}
        <div className="w-full md:w-auto shrink-0">
          <button
            id="talk-to-mitra-primary-btn"
            onClick={onOpenTalkModal}
            className="w-full md:w-auto min-w-[280px] sm:min-w-[320px] px-8 py-5 sm:py-6 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-xl sm:text-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-4 border border-[#ea580c] active:scale-[0.98]"
            aria-label="Talk to Mitra One voice companion"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Mic className="w-7 h-7 text-white" strokeWidth={2.4} />
            </div>
            <div className="text-left">
              <span className="block leading-tight">Talk to Mitra One</span>
              <span className="text-xs sm:text-sm font-semibold text-orange-100 block mt-0.5">
                Tap to speak with voice
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* 2. Four Large Action Cards */}
      <section aria-label="Main Actions" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:border-[#0f2942] hover:shadow-[0_8px_28px_-4px_rgba(15,23,42,0.1)] transition-all cursor-pointer flex flex-col justify-between gap-5 group text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#f5f1ea] border border-[#e7e3da] text-[#0f2942] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-8 h-8" strokeWidth={2.2} />
                  </div>

                  {/* Read Aloud button for card */}
                  <button
                    id={`read-card-${card.id}-btn`}
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(`${card.title}. ${card.description}. Tap card to open.`);
                    }}
                    className="p-2.5 rounded-xl bg-[#fbf9f5] hover:bg-[#f5f1ea] text-stone-600 border border-[#e7e3da] cursor-pointer"
                    title="Read card aloud"
                    aria-label={`Read ${card.title} aloud`}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl sm:text-2xl font-black text-[#0f2942] tracking-wide font-display">
                    {card.title}
                  </h3>
                  <p className="text-base sm:text-lg font-medium text-stone-600 leading-normal">
                    {card.description}
                  </p>
                </div>

                <div className="flex items-center text-sm sm:text-base font-bold text-[#0f2942] pt-2 border-t border-stone-100 group-hover:underline">
                  <span>Open {card.title}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform text-[#ea580c]" />
                </div>
              </div>
            );
          })}
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

          <button
            id="read-glance-section-btn"
            onClick={() =>
              speakText(
                'Today at a glance: Doctor appointment at 4:00 PM. Electricity bill due tomorrow. Call family at 7:00 PM.'
              )
            }
            className="p-2.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 border border-[#d8d3c7] cursor-pointer"
            title="Read schedule aloud"
            aria-label="Read today at a glance aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
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
