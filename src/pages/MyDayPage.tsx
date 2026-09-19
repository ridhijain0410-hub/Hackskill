import React from 'react';
import {
  Sun,
  CloudSun,
  CheckCircle2,
  Circle,
  Volume2,
  Coffee,
  Moon,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ReminderItem, PageId } from '../types';
import { speakText, playGentleChime } from '../utils/speech';

interface MyDayPageProps {
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
  onNavigate: (page: PageId) => void;
}

export const MyDayPage: React.FC<MyDayPageProps> = ({
  reminders,
  onToggleReminder,
  onNavigate,
}) => {
  const morningItems = reminders.filter((r) => r.period === 'morning');
  const afternoonItems = reminders.filter((r) => r.period === 'afternoon');
  const eveningItems = reminders.filter((r) => r.period === 'evening');

  const handleReadSchedule = () => {
    const total = reminders.length;
    const completed = reminders.filter((r) => r.completed).length;
    const remaining = total - completed;

    const speech = `Here is your schedule for today, Friday, 19 September. The weather is pleasant and 24 degrees Celsius. You have completed ${completed} out of ${total} items. You have ${remaining} items remaining today. Stay hydrated and have a peaceful day.`;
    speakText(speech);
  };

  const handleToggle = (id: string, completed: boolean) => {
    playGentleChime(completed ? 'tap' : 'success');
    onToggleReminder(id);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Top Banner with Date & Read Aloud button */}
      <div className="bg-[#0f2942] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs sm:text-sm font-bold">
            <Sun className="w-4 h-4 text-amber-300" />
            <span>Today’s Routine & Schedule</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Friday, 19 September 2026
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            A calm, step-by-step look at your day.
          </p>
        </div>

        <button
          id="read-my-day-aloud-btn"
          onClick={handleReadSchedule}
          className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-base sm:text-lg shadow-xs cursor-pointer transition-all shrink-0"
        >
          <Volume2 className="w-5 h-5" />
          <span>Read Schedule Aloud</span>
        </button>
      </div>

      {/* Weather & Daily Thought Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Weather */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#f5f1ea] border border-[#e7e3da] text-[#0f2942] flex items-center justify-center shrink-0">
              <CloudSun className="w-9 h-9 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0f2942]">
                  24°C
                </span>
                <span className="text-sm font-semibold text-stone-500">
                  • Sunny & Pleasant
                </span>
              </div>
              <p className="text-base text-stone-600 font-medium mt-1">
                Gentle breeze, clean air. Ideal for a 15–20 minute walk in the colony park around 5 PM.
              </p>
            </div>
          </div>

          <div className="bg-[#fbf9f5] rounded-2xl p-3.5 border border-[#e7e3da] text-center sm:text-right shrink-0 w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-500 uppercase block">
              Hydration Goal
            </span>
            <span className="text-lg font-extrabold text-[#0f2942]">
              💧 6 - 8 Glasses
            </span>
            <span className="text-xs text-stone-500 block">
              Have a glass every 2 hours
            </span>
          </div>
        </div>

        {/* Daily Positive Affirmation */}
        <div className="bg-white rounded-3xl p-6 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2 text-[#0f2942] font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Today’s Thought</span>
          </div>
          <p className="text-base sm:text-lg font-medium text-stone-800 italic leading-relaxed">
            &ldquo;Take things one gentle step at a time. You are doing wonderfully.&rdquo;
          </p>
          <div className="text-xs font-bold text-stone-500">
            Mitra One Daily Wellness
          </div>
        </div>
      </div>

      {/* Routine Timeline */}
      <div className="space-y-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] font-display">
          Your Routine by Time of Day
        </h2>

        {/* 1. Morning */}
        <div className="bg-white rounded-3xl p-6 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f1ea] border border-[#e7e3da] text-[#0f2942] flex items-center justify-center font-bold">
                <Sun className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0f2942]">Morning</h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  Wake up, breakfast, and morning medicines
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f5f1ea] text-[#0f2942] border border-[#e7e3da]">
              {morningItems.filter((i) => i.completed).length}/{morningItems.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {morningItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  item.completed
                    ? 'bg-[#fbf9f5] border-[#e7e3da] opacity-75'
                    : 'bg-white border-[#e7e3da] hover:border-[#cbd5e1]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    className="mt-1 cursor-pointer text-[#1b5e3b] hover:opacity-80 transition-transform active:scale-90"
                    aria-label={`Toggle ${item.title}`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-7 h-7 text-[#1b5e3b] fill-emerald-100" />
                    ) : (
                      <Circle className="w-7 h-7 text-stone-400 hover:text-[#1b5e3b]" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#0f2942] bg-[#f5f1ea] px-2.5 py-0.5 rounded-md border border-[#e7e3da]">
                        {item.time}
                      </span>
                      <h4
                        className={`text-lg font-bold ${
                          item.completed ? 'line-through text-stone-400' : 'text-[#0f2942]'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-sm text-stone-600 mt-1 font-medium">{item.details}</p>
                    {item.dosage && (
                      <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mt-1.5">
                        Dose: {item.dosage}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => speakText(`${item.time}. ${item.title}. ${item.details}`)}
                  className="p-2 rounded-xl bg-white hover:bg-[#f5f1ea] text-stone-600 border border-[#e7e3da] shrink-0 cursor-pointer"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Afternoon */}
        <div className="bg-white rounded-3xl p-6 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f1ea] border border-[#e7e3da] text-[#0f2942] flex items-center justify-center font-bold">
                <Coffee className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0f2942]">Afternoon</h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  Lunch, quiet rest, and eye drops
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f5f1ea] text-[#0f2942] border border-[#e7e3da]">
              {afternoonItems.filter((i) => i.completed).length}/{afternoonItems.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {afternoonItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  item.completed
                    ? 'bg-[#fbf9f5] border-[#e7e3da] opacity-75'
                    : 'bg-white border-[#e7e3da] hover:border-[#cbd5e1]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    className="mt-1 cursor-pointer text-[#1b5e3b] hover:opacity-80 transition-transform active:scale-90"
                    aria-label={`Toggle ${item.title}`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-7 h-7 text-[#1b5e3b] fill-emerald-100" />
                    ) : (
                      <Circle className="w-7 h-7 text-stone-400 hover:text-[#1b5e3b]" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#0f2942] bg-[#f5f1ea] px-2.5 py-0.5 rounded-md border border-[#e7e3da]">
                        {item.time}
                      </span>
                      <h4
                        className={`text-lg font-bold ${
                          item.completed ? 'line-through text-stone-400' : 'text-[#0f2942]'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-sm text-stone-600 mt-1 font-medium">{item.details}</p>
                    {item.dosage && (
                      <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mt-1.5">
                        Dose: {item.dosage}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => speakText(`${item.time}. ${item.title}. ${item.details}`)}
                  className="p-2 rounded-xl bg-white hover:bg-[#f5f1ea] text-stone-600 border border-[#e7e3da] shrink-0 cursor-pointer"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Evening */}
        <div className="bg-white rounded-3xl p-6 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f5f1ea] border border-[#e7e3da] text-[#0f2942] flex items-center justify-center font-bold">
                <Moon className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0f2942]">Evening & Night</h3>
                <p className="text-xs sm:text-sm text-stone-500">
                  Doctor visit, call family, dinner & calcium tablet
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f5f1ea] text-[#0f2942] border border-[#e7e3da]">
              {eveningItems.filter((i) => i.completed).length}/{eveningItems.length} Done
            </span>
          </div>

          <div className="space-y-3">
            {eveningItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  item.completed
                    ? 'bg-[#fbf9f5] border-[#e7e3da] opacity-75'
                    : 'bg-white border-[#e7e3da] hover:border-[#cbd5e1]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    className="mt-1 cursor-pointer text-[#1b5e3b] hover:opacity-80 transition-transform active:scale-90"
                    aria-label={`Toggle ${item.title}`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-7 h-7 text-[#1b5e3b] fill-emerald-100" />
                    ) : (
                      <Circle className="w-7 h-7 text-stone-400 hover:text-[#1b5e3b]" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#0f2942] bg-[#f5f1ea] px-2.5 py-0.5 rounded-md border border-[#e7e3da]">
                        {item.time}
                      </span>
                      <h4
                        className={`text-lg font-bold ${
                          item.completed ? 'line-through text-stone-400' : 'text-[#0f2942]'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-sm text-stone-600 mt-1 font-medium">{item.details}</p>
                    {item.dosage && (
                      <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 mt-1.5">
                        Dose: {item.dosage}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => speakText(`${item.time}. ${item.title}. ${item.details}`)}
                  className="p-2 rounded-xl bg-white hover:bg-[#f5f1ea] text-stone-600 border border-[#e7e3da] shrink-0 cursor-pointer"
                  title="Read aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Navigation to Reminders */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e7e3da] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#0f2942]">
            Want to add a new medicine or appointment?
          </h3>
          <p className="text-sm text-stone-600 mt-0.5">
            You can customize your reminder timings anytime.
          </p>
        </div>

        <button
          onClick={() => onNavigate('reminders')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0f2942] hover:bg-[#162a45] text-white font-bold text-base cursor-pointer transition-all shadow-2xs"
        >
          <span>Manage Reminders</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
