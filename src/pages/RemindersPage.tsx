import React, { useState } from 'react';
import {
  BellRing,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Volume2,
  Trash2,
  X,
  Heart
} from 'lucide-react';
import { ReminderItem } from '../types';
import { speakText, playGentleChime } from '../utils/speech';

interface RemindersPageProps {
  reminders: ReminderItem[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (item: Omit<ReminderItem, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for new reminder
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00 AM');
  const [newPeriod, setNewPeriod] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [newCategory, setNewCategory] = useState<'medicine' | 'call' | 'routine'>('medicine');
  const [newDetails, setNewDetails] = useState('');
  const [newDosage, setNewDosage] = useState('');

  const filteredReminders = reminders.filter((item) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'medicine') return item.category === 'medicine';
    if (filterCategory === 'call') return item.category === 'call';
    if (filterCategory === 'routine') return item.category === 'routine';
    return true;
  });

  const completedCount = reminders.filter((r) => r.completed).length;

  const handleToggle = (item: ReminderItem) => {
    const willBeCompleted = !item.completed;
    playGentleChime(willBeCompleted ? 'success' : 'tap');
    onToggleReminder(item.id);

    if (willBeCompleted) {
      speakText(`Marked ${item.title} as done! Great job taking care of your health.`);
    }
  };

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      title: newTitle.trim(),
      time: newTime,
      period: newPeriod,
      category: newCategory,
      details: newDetails.trim() || 'Scheduled reminder',
      dosage: newDosage.trim() || undefined,
      completed: false,
    });

    playGentleChime('success');
    speakText(`Added reminder for ${newTitle} at ${newTime}.`);

    // Reset
    setNewTitle('');
    setNewDetails('');
    setNewDosage('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20">
      {/* Top Banner */}
      <div className="bg-[#0f2942] text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs sm:text-sm font-bold">
            <BellRing className="w-4 h-4 text-amber-300" />
            <span>Medicine & Daily Care Schedule</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">
            Reminders
          </h1>
          <p className="text-slate-300 text-base sm:text-lg">
            {completedCount} of {reminders.length} tasks completed today.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-base sm:text-lg shadow-xs cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Add Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Reminders' },
          { id: 'medicine', label: 'Medicines 💊' },
          { id: 'call', label: 'Calls & Family 📞' },
          { id: 'routine', label: 'Habits & Health 💧' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              playGentleChime('tap');
              setFilterCategory(tab.id);
            }}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base border cursor-pointer transition-all whitespace-nowrap ${
              filterCategory === tab.id
                ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-2xs'
                : 'bg-white text-stone-700 border-[#e7e3da] hover:bg-[#f5f1ea]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-[#e7e3da] p-6 space-y-3">
            <Heart className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-lg font-bold text-stone-700">
              No reminders in this category today.
            </p>
            <p className="text-sm text-stone-500">
              Tap &ldquo;Add Reminder&rdquo; above to set up a new reminder anytime.
            </p>
          </div>
        ) : (
          filteredReminders.map((item) => (
            <div
              key={item.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] ${
                item.completed
                  ? 'bg-[#fbf9f5] border-[#e7e3da] opacity-75'
                  : 'bg-white border-[#e7e3da] hover:border-[#cbd5e1]'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggle(item)}
                  className="mt-1 cursor-pointer text-[#1b5e3b] hover:opacity-80 transition-transform active:scale-90"
                  aria-label={`Mark ${item.title}`}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-8 h-8 text-[#1b5e3b] fill-emerald-100" />
                  ) : (
                    <Circle className="w-8 h-8 text-stone-400 hover:text-[#1b5e3b]" />
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-md bg-[#f5f1ea] text-[#0f2942] border border-[#e7e3da]">
                      <Clock className="w-3.5 h-3.5" />
                      {item.time}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
                      {item.period}
                    </span>
                    {item.category === 'medicine' && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200">
                        Medicine 💊
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-xl font-extrabold ${
                      item.completed
                        ? 'line-through text-stone-400'
                        : 'text-[#0f2942]'
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p className="text-sm sm:text-base font-medium text-stone-600">
                    {item.details}
                  </p>

                  {item.dosage && (
                    <div className="inline-block text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      Dosage: {item.dosage}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() =>
                    speakText(
                      `Reminder for ${item.time}: ${item.title}. ${item.details}. ${
                        item.dosage ? 'Dose is ' + item.dosage : ''
                      }. Status is ${item.completed ? 'completed' : 'pending'}`
                    )
                  }
                  className="p-3 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 border border-[#d8d3c7] cursor-pointer"
                  title="Read aloud"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <button
                  onClick={() => handleToggle(item)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm sm:text-base border cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-[#f5f1ea] text-stone-700 border-[#d8d3c7]'
                      : 'bg-[#1b5e3b] hover:bg-[#164c30] text-white border-[#1b5e3b] shadow-2xs'
                  }`}
                >
                  {item.completed ? 'Completed ✓' : 'Mark as Done'}
                </button>

                <button
                  onClick={() => onDeleteReminder(item.id)}
                  className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                  title="Delete reminder"
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal to Add New Reminder */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl border border-[#e7e3da] shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#0f2942] text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Plus className="w-6 h-6 text-amber-300" />
                <h2 className="text-xl font-bold font-display">Add a New Reminder</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateReminder} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#0f2942] mb-1">
                  What is the reminder for?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Afternoon Eye Drops, Vitamin C pill, Call family"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#d8d3c7] bg-[#fbf9f5] focus:bg-white font-medium text-base text-[#0f2942]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-[#0f2942] mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#d8d3c7] bg-[#fbf9f5] focus:bg-white font-medium text-base text-[#0f2942]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#0f2942] mb-1">
                    Time of Day
                  </label>
                  <select
                    value={newPeriod}
                    onChange={(e) =>
                      setNewPeriod(
                        e.target.value as 'morning' | 'afternoon' | 'evening'
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#d8d3c7] font-medium text-base text-[#0f2942] bg-[#fbf9f5] focus:bg-white"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0f2942] mb-1">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'medicine', label: 'Medicine 💊' },
                    { id: 'call', label: 'Call 📞' },
                    { id: 'routine', label: 'Habit 💧' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setNewCategory(cat.id as any)}
                      className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                        newCategory === cat.id
                          ? 'bg-[#0f2942] text-white border-[#0f2942]'
                          : 'bg-[#fbf9f5] border-[#e7e3da] text-stone-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#0f2942] mb-1">
                  Dosage or Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 Tablet after breakfast with water"
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#d8d3c7] bg-[#fbf9f5] focus:bg-white font-medium text-base text-[#0f2942]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-[#d8d3c7] font-bold text-stone-700 hover:bg-[#f5f1ea] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-extrabold text-base shadow-xs cursor-pointer"
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
