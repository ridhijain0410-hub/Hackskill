import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  CheckCircle2,
  Circle,
  Volume2,
  Coffee,
  Moon,
  Sparkles,
  ArrowRight,
  Plus,
  Calendar,
  Clock,
  X,
  Check
} from 'lucide-react';
import { ReminderItem, PageId, LanguageCode } from '../types';
import { speakText, playGentleChime } from '../utils/speech';

interface MyDayPageProps {
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
  onNavigate: (page: PageId) => void;
  onAddReminder?: (item: Omit<ReminderItem, 'id'>) => void;
  language?: LanguageCode;
}

export const MyDayPage: React.FC<MyDayPageProps> = ({
  reminders,
  onToggleReminder,
  onNavigate,
  onAddReminder,
  language = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for new reminder
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newPeriod, setNewPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [newCategory, setNewCategory] = useState<'medicine' | 'call' | 'routine'>('medicine');
  const [newDetails, setNewDetails] = useState('');
  const [newDosage, setNewDosage] = useState('');

  const todayItems = reminders.filter((r) => !r.completed);
  const completedItems = reminders.filter((r) => r.completed);

  // Mock upcoming reminders for demonstration of upcoming schedule
  const upcomingItems = [
    {
      id: 'up-1',
      title: 'Dr. Sharma Cardiology Review',
      time: 'Tomorrow, 10:30 AM',
      period: 'morning' as const,
      category: 'routine' as const,
      details: 'Apollo Clinic, Room 204. Carry recent ECG and blood reports.',
      completed: false,
    },
    {
      id: 'up-2',
      title: 'Pharmacy Monthly Refill',
      time: 'Sunday, 11:00 AM',
      period: 'morning' as const,
      category: 'medicine' as const,
      details: 'Pick up BP and Calcium tablets from MedPlus store.',
      completed: false,
    },
    {
      id: 'up-3',
      title: 'Pension Verification Call',
      time: 'Monday, 03:00 PM',
      period: 'afternoon' as const,
      category: 'call' as const,
      details: 'Call SBI Branch Manager regarding annual life certificate.',
      completed: false,
    },
  ];

  const morningItems = todayItems.filter((r) => r.period === 'morning');
  const afternoonItems = todayItems.filter((r) => r.period === 'afternoon');
  const eveningItems = todayItems.filter((r) => r.period === 'evening');

  const handleReadSchedule = () => {
    const total = reminders.length;
    const completed = completedItems.length;
    const remaining = todayItems.length;

    const speech =
      language === 'hi'
        ? `आज का आपका कार्यक्रम। आपने कुल ${total} में से ${completed} काम पूरे कर लिए हैं। ${remaining} काम बाकी हैं। पानी पीते रहें और आपका दिन शुभ हो।`
        : `Here is your schedule for today, Friday, 19 September. The weather is pleasant and 24 degrees Celsius. You have completed ${completed} out of ${total} items. You have ${remaining} items remaining today. Stay hydrated and have a peaceful day.`;
    speakText(speech, language);
  };

  const handleToggle = (id: string, completed: boolean) => {
    playGentleChime(completed ? 'tap' : 'success');
    onToggleReminder(id);
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (onAddReminder) {
      onAddReminder({
        title: newTitle.trim(),
        time: newTime,
        period: newPeriod,
        category: newCategory,
        details: newDetails.trim() || 'Daily schedule reminder',
        dosage: newDosage.trim() || undefined,
        completed: false,
      });
    }

    playGentleChime('success');
    speakText(`Added reminder for ${newTitle} at ${newTime}.`, language);

    setNewTitle('');
    setNewDetails('');
    setNewDosage('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 text-left">
      {/* Top Banner matching Reference Screen */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Daily Schedule & Routine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f2942] font-display">
            My Day
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            Everything you need to do today, kept simple and on time.
          </p>
        </div>

        <button
          id="read-my-day-aloud-btn"
          onClick={handleReadSchedule}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-extrabold text-xs sm:text-sm shadow-xs cursor-pointer transition-colors shrink-0"
          title="Read schedule aloud in selected language"
        >
          <Volume2 className="w-4 h-4 text-amber-300" />
          <span>Read Aloud</span>
        </button>
      </div>

      {/* Weather & Daily Thought Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Weather Card */}
        <div className="md:col-span-2 bg-[#f0f9ff] rounded-3xl p-6 border-2 border-[#bae6fd] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#bae6fd] text-[#0f2942] flex items-center justify-center shrink-0 shadow-2xs">
              <CloudSun className="w-9 h-9 text-[#0284c7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#0f2942]">
                  24°C
                </span>
                <span className="text-sm font-bold text-sky-900">
                  • Sunny & Pleasant
                </span>
              </div>
              <p className="text-base text-stone-700 font-medium mt-1">
                Gentle breeze, clean air. Ideal for a 15–20 minute walk in the colony park around 5 PM.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-[#bae6fd] text-center sm:text-right shrink-0 w-full sm:w-auto shadow-2xs">
            <span className="text-xs font-black text-sky-800 uppercase tracking-wider block">
              Hydration Goal
            </span>
            <span className="text-lg font-black text-[#0f2942]">
              💧 6 - 8 Glasses
            </span>
            <span className="text-xs text-stone-600 font-medium block mt-0.5">
              Have a glass every 2 hours
            </span>
          </div>
        </div>

        {/* Daily Positive Affirmation Card */}
        <div className="bg-[#fff8f2] rounded-3xl p-6 border-2 border-[#fed7aa] shadow-xs flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2 text-[#ea580c] font-black text-sm">
            <Sparkles className="w-4 h-4" />
            <span>Today’s Thought</span>
          </div>
          <p className="text-base sm:text-lg font-semibold text-stone-800 italic leading-relaxed">
            &ldquo;Take things one gentle step at a time. You are doing wonderfully.&rdquo;
          </p>
          <div className="text-xs font-bold text-stone-500">
            Mitra One Daily Wellness
          </div>
        </div>
      </div>

      {/* Tabs & Add Reminder Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* The 3 Clean Tabs: Today, Upcoming, Completed */}
        <div className="inline-flex p-1.5 rounded-2xl bg-stone-200/70 border border-stone-300 gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-5 py-2.5 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-[#ea580c] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
            }`}
          >
            Today ({todayItems.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2.5 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-[#ea580c] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
            }`}
          >
            Upcoming ({upcomingItems.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-5 py-2.5 rounded-xl font-black text-sm sm:text-base transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-[#ea580c] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-950 hover:bg-white/60'
            }`}
          >
            Completed ({completedItems.length})
          </button>
        </div>

        {/* Add Reminder Button */}
        <button
          onClick={() => {
            if (onAddReminder) {
              setIsAddModalOpen(true);
            } else {
              onNavigate('reminders');
            }
          }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-base shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-[0.98] shrink-0"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* TAB CONTENT 1: TODAY */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          {todayItems.length === 0 ? (
            <div className="bg-[#f0fdf4] border-2 border-[#bbf7d0] rounded-3xl p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16a34a] flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-2xl font-black text-emerald-950">All Done for Today!</h3>
              <p className="text-stone-700 font-medium max-w-md mx-auto">
                You have completed all scheduled reminders and medicines for today. Wonderful job!
              </p>
            </div>
          ) : (
            <>
              {/* Morning Section */}
              {morningItems.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#e7e3da] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                        <Sun className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-[#0f2942]">Morning Routine</h3>
                        <p className="text-xs sm:text-sm text-stone-600 font-medium">
                          Breakfast and morning medicines
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      {morningItems.length} Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {morningItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-stone-300 bg-[#fbf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                              Morning
                            </span>
                            <span className="text-xs font-bold text-stone-600 bg-white px-2.5 py-0.5 rounded-md border border-stone-200">
                              {item.time}
                            </span>
                            {item.dosage && (
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                                {item.dosage}
                              </span>
                            )}
                          </div>

                          <h4 className="text-lg sm:text-xl font-bold text-[#0f2942]">
                            {item.title}
                          </h4>
                          <p className="text-sm sm:text-base text-stone-600 font-medium">
                            {item.details}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() =>
                              speakText(`Morning reminder. ${item.title}. Time: ${item.time}. ${item.details}`, language)
                            }
                            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer shadow-xs"
                            title="Read reminder aloud"
                          >
                            <Volume2 className="w-4 h-4 text-amber-600" />
                          </button>

                          <button
                            onClick={() => handleToggle(item.id, item.completed)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Mark as Done</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Afternoon Section */}
              {afternoonItems.length > 0 && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e7e3da] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 text-orange-800 flex items-center justify-center font-bold">
                        <Coffee className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0f2942]">Afternoon Routine</h3>
                        <p className="text-xs text-stone-500 font-medium">
                          Lunch and rest
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-900 border border-orange-200">
                      {afternoonItems.length} Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {afternoonItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-stone-300 bg-[#fbf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-md">
                              Afternoon
                            </span>
                            <span className="text-xs font-bold text-stone-600 bg-white px-2.5 py-0.5 rounded-md border border-stone-200">
                              {item.time}
                            </span>
                            {item.dosage && (
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                                {item.dosage}
                              </span>
                            )}
                          </div>

                          <h4 className="text-lg sm:text-xl font-bold text-[#0f2942]">
                            {item.title}
                          </h4>
                          <p className="text-sm sm:text-base text-stone-600 font-medium">
                            {item.details}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() =>
                              speakText(`Afternoon reminder. ${item.title}. Time: ${item.time}. ${item.details}`, language)
                            }
                            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer shadow-xs"
                            title="Read reminder aloud"
                          >
                            <Volume2 className="w-4 h-4 text-amber-600" />
                          </button>

                          <button
                            onClick={() => handleToggle(item.id, item.completed)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Mark as Done</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evening Section */}
              {eveningItems.length > 0 && (
                <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e7e3da] shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-800 flex items-center justify-center font-bold">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0f2942]">Evening & Night</h3>
                        <p className="text-xs text-stone-500 font-medium">
                          Dinner and night medicines
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                      {eveningItems.length} Pending
                    </span>
                  </div>

                  <div className="space-y-3">
                    {eveningItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-2xl border border-stone-200 hover:border-stone-300 bg-[#fbf9f5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-md">
                              Evening
                            </span>
                            <span className="text-xs font-bold text-stone-600 bg-white px-2.5 py-0.5 rounded-md border border-stone-200">
                              {item.time}
                            </span>
                            {item.dosage && (
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                                {item.dosage}
                              </span>
                            )}
                          </div>

                          <h4 className="text-lg sm:text-xl font-bold text-[#0f2942]">
                            {item.title}
                          </h4>
                          <p className="text-sm sm:text-base text-stone-600 font-medium">
                            {item.details}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() =>
                              speakText(`Evening reminder. ${item.title}. Time: ${item.time}. ${item.details}`, language)
                            }
                            className="p-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 cursor-pointer shadow-xs"
                            title="Read reminder aloud"
                          >
                            <Volume2 className="w-4 h-4 text-amber-600" />
                          </button>

                          <button
                            onClick={() => handleToggle(item.id, item.completed)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xs transition-colors"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Mark as Done</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: UPCOMING */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#e7e3da] shadow-xs space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="text-xl font-black text-[#0f2942]">Upcoming Appointments & Events</h3>
              <p className="text-sm text-stone-600 font-medium">
                Scheduled doctor visits and reminders for the coming days
              </p>
            </div>

            <div className="space-y-3">
              {upcomingItems.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border-2 border-stone-200 bg-[#fbf9f5] flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold shrink-0 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-xs font-black text-amber-950 bg-amber-100/70 border border-amber-300 px-3 py-1 rounded-lg">
                          {item.time}
                        </span>
                        <h4 className="text-lg sm:text-xl font-black text-[#0f2942]">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-base text-stone-700 font-semibold">{item.details}</p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      speakText(`${item.time}. ${item.title}. ${item.details}`, language)
                    }
                    className="p-3 rounded-xl bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 shrink-0 cursor-pointer shadow-2xs"
                    title="Read aloud"
                  >
                    <Volume2 className="w-5 h-5 text-amber-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: COMPLETED */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#e7e3da] shadow-xs space-y-4">
            <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-[#0f2942]">Completed Items Today</h3>
                <p className="text-sm text-stone-600 font-medium">
                  Tasks you have successfully checked off
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-black">
                {completedItems.length} Finished
              </span>
            </div>

            {completedItems.length === 0 ? (
              <p className="text-stone-500 font-medium py-6 text-center">
                No completed items yet today. Check off reminders as you finish them!
              </p>
            ) : (
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => handleToggle(item.id, item.completed)}
                        className="mt-0.5 cursor-pointer text-[#16a34a] hover:opacity-80"
                        title="Click to uncheck if finished by mistake"
                      >
                        <CheckCircle2 className="w-8 h-8 fill-emerald-100 stroke-[2.2]" />
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-black text-stone-500 bg-white px-3 py-1 rounded-lg border border-stone-200 line-through">
                            {item.time}
                          </span>
                          <h4 className="text-lg sm:text-xl font-bold text-stone-500 line-through">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-sm text-stone-500">{item.details}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(item.id, item.completed)}
                      className="text-xs font-black text-stone-600 hover:text-[#0f2942] underline cursor-pointer self-center"
                    >
                      Undo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD REMINDER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-stone-300 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#ea580c] flex items-center justify-center font-bold">
                  <Plus className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#0f2942] font-display">Add Reminder</h3>
                  <p className="text-xs text-stone-600 font-medium">Set a new medicine or routine task</p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-sm font-black text-[#0f2942] mb-1.5">
                  Reminder Name or Medicine *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Blood Pressure Tablet, Evening Walk"
                  className="w-full p-4 rounded-2xl border-2 border-stone-300 text-base font-bold text-[#0f2942] focus:border-[#ea580c] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-black text-[#0f2942] mb-1.5">
                    Time *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full p-4 rounded-2xl border-2 border-stone-300 text-base font-bold text-[#0f2942] focus:border-[#ea580c] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0f2942] mb-1.5">
                    Time of Day
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value as any)}
                    className="w-full p-4 rounded-2xl border-2 border-stone-300 text-base font-bold text-[#0f2942] focus:border-[#ea580c] outline-none bg-white"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-[#0f2942] mb-1.5">
                  Dosage or Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  placeholder="e.g., 1 tablet after breakfast"
                  className="w-full p-4 rounded-2xl border-2 border-stone-300 text-base font-bold text-[#0f2942] focus:border-[#ea580c] outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3.5 rounded-2xl text-stone-700 font-extrabold text-base hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-2xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-black text-base shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Save Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
