import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TalkModal } from './components/TalkModal';
import { EmergencyModal } from './components/EmergencyModal';
import { HomePage } from './pages/HomePage';
import { MyDayPage } from './pages/MyDayPage';
import { AskMitraOnePage } from './pages/AskMitraOnePage';
import { UnderstandPage } from './pages/UnderstandPage';
import { ScamShieldPage } from './pages/ScamShieldPage';
import { RemindersPage } from './pages/RemindersPage';
import { PageId, FontSizeMode, ReminderItem } from './types';
import { INITIAL_REMINDERS } from './data/mockData';
import { HeartHandshake, PhoneCall, ShieldCheck, ArrowUp } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [fontSize, setFontSize] = useState<FontSizeMode>('normal');
  const [isTalkModalOpen, setIsTalkModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  // Load reminders from localStorage or initial mock data
  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem('mitra_one_reminders') || localStorage.getItem('saathi_reminders');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return INITIAL_REMINDERS;
  });

  // Persist reminders
  useEffect(() => {
    try {
      localStorage.setItem('mitra_one_reminders', JSON.stringify(reminders));
    } catch {
      // ignore
    }
  }, [reminders]);

  // Adjust font size dynamically on root element:
  // normal (A-): 16px
  // large (A): 18.5px
  // extra-large (A+): 21px
  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === 'extra-large') {
      root.style.fontSize = '21px';
    } else if (fontSize === 'large') {
      root.style.fontSize = '18.5px';
    } else {
      root.style.fontSize = '16px';
    }
  }, [fontSize]);

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleAddReminder = (item: Omit<ReminderItem, 'id'>) => {
    const newRem: ReminderItem = {
      ...item,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [newRem, ...prev]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-[#0f2942] selection:bg-orange-100 selection:text-orange-900">
      {/* 1. Header with Font Scaling, Brand, Clean Help Button */}
      <Header
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onNavigateHome={() => setCurrentPage('home')}
        currentPage={currentPage}
      />

      {/* 2. Clean Navigation Bar with Highlighted "Ask Mitra One" */}
      <Navigation
        currentPage={currentPage}
        onSelectPage={(page) => setCurrentPage(page)}
      />

      {/* 3. Main Page Content Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={(page) => setCurrentPage(page)}
            onOpenTalkModal={() => setIsTalkModalOpen(true)}
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
          />
        )}

        {currentPage === 'my-day' && (
          <MyDayPage
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onNavigate={(page) => setCurrentPage(page)}
          />
        )}

        {currentPage === 'ask-mitra-one' && <AskMitraOnePage />}

        {currentPage === 'understand' && <UnderstandPage />}

        {currentPage === 'scam-shield' && <ScamShieldPage />}

        {currentPage === 'reminders' && (
          <RemindersPage
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        )}
      </main>

      {/* 4. Senior-Friendly, Calm Footer */}
      <footer className="mt-auto border-t border-[#e7e3da] bg-white py-8 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f2942] text-white flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="font-black text-[#0f2942] text-lg font-display tracking-tight">
                MITRA ONE
              </span>
              <p className="text-xs sm:text-sm text-stone-600 font-medium">
                Your Everyday Digital Companion • Simple, safe, and patient assistance.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-stone-700">
            <span className="flex items-center gap-1.5 bg-[#fbf9f5] px-3.5 py-1.5 rounded-full border border-[#e7e3da]">
              <ShieldCheck className="w-4 h-4 text-[#1b5e3b]" />
              Cyber Fraud Helpline: <strong className="text-[#0f2942]">1930</strong>
            </span>
            <span className="flex items-center gap-1.5 bg-[#fbf9f5] px-3.5 py-1.5 rounded-full border border-[#e7e3da]">
              <PhoneCall className="w-4 h-4 text-[#ea580c]" />
              Senior Helpline: <strong className="text-[#0f2942]">14567</strong>
            </span>
          </div>

          <button
            id="back-to-top-btn"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fbf9f5] hover:bg-[#f5f1ea] text-stone-700 border border-[#e7e3da] text-xs sm:text-sm font-bold cursor-pointer transition-colors"
            aria-label="Scroll back to top"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Top of Page</span>
          </button>
        </div>
      </footer>

      {/* 5. Modals */}
      <TalkModal
        isOpen={isTalkModalOpen}
        onClose={() => setIsTalkModalOpen(false)}
        onNavigateToPage={(page) => setCurrentPage(page)}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
}
