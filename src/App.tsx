import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { TalkModal } from './components/TalkModal';
import { EmergencyModal } from './components/EmergencyModal';
import { SosModal } from './components/SosModal';
import { AuthScreen } from './components/AuthScreen';
import { HomePage } from './pages/HomePage';
import { MyDayPage } from './pages/MyDayPage';
import { AskMitraOnePage } from './pages/AskMitraOnePage';
import { UnderstandPage } from './pages/UnderstandPage';
import { ScamShieldPage } from './pages/ScamShieldPage';
import { RemindersPage } from './pages/RemindersPage';
import { ProfilePage } from './pages/ProfilePage';
import { NearbyCarePage } from './pages/NearbyCarePage';
import { PageId, FontSizeMode, ReminderItem, UserProfile, LanguageCode } from './types';
import { INITIAL_REMINDERS } from './data/mockData';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from './data/languages';
import { HeartHandshake, PhoneCall, ShieldCheck, ArrowUp, CheckCircle2, ArrowRight, X, VolumeX } from 'lucide-react';
import { playGentleChime, speakText, setCurrentSpeechLanguage, onVoiceUnavailable } from './utils/speech';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [fontSize, setFontSize] = useState<FontSizeMode>('normal');
  const [isTalkModalOpen, setIsTalkModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [askMitraInitialQuestion, setAskMitraInitialQuestion] = useState<string>('');

  // Global Language state (Default: 'en', supports hi, bn, gu, mr, pa, ta, te)
  const [language, setLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('mitra_one_language');
      if (saved === 'hi' || saved === 'en') return saved as LanguageCode;
      const savedUser = localStorage.getItem('mitra_one_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.preferredLanguage === 'hi' || parsed.preferredLanguage === 'en') {
          return parsed.preferredLanguage as LanguageCode;
        }
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  // Authentication state (Mandatory login/registration)
  const [authToken, setAuthToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('mitra_one_token');
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('mitra_one_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Sync language with user profile preference
  useEffect(() => {
    if (user?.preferredLanguage && user.preferredLanguage !== language) {
      setLanguage(user.preferredLanguage);
      setCurrentSpeechLanguage(user.preferredLanguage);
      try {
        localStorage.setItem('mitra_one_language', user.preferredLanguage);
      } catch {
        // ignore
      }
    }
  }, [user?.preferredLanguage]);

  useEffect(() => {
    setCurrentSpeechLanguage(language);
  }, [language]);

  // Listen for voice playback unavailable notifications across the app
  useEffect(() => {
    const unsubscribe = onVoiceUnavailable((message) => {
      setToastMessage({
        title: 'Voice Playback',
        description: message,
      });
    });
    return unsubscribe;
  }, []);

  const handleSelectLanguage = (newLang: LanguageCode) => {
    setLanguage(newLang);
    setCurrentSpeechLanguage(newLang);
    try {
      localStorage.setItem('mitra_one_language', newLang);
    } catch {
      // ignore
    }

    if (user && user.preferredLanguage !== newLang) {
      handleUpdateProfile({
        ...user,
        preferredLanguage: newLang,
      });
    }
  };

  // Verify session on mount if token exists
  useEffect(() => {
    if (authToken && !user) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            localStorage.setItem('mitra_one_user', JSON.stringify(data.user));
          }
        })
        .catch(() => {
          // Token invalid or expired
          setAuthToken(null);
          setUser(null);
          localStorage.removeItem('mitra_one_token');
          localStorage.removeItem('mitra_one_user');
        });
    }
  }, [authToken, user]);

  const handleLoginSuccess = (loggedInUser: UserProfile, token: string) => {
    setUser(loggedInUser);
    setAuthToken(token);
    if (loggedInUser.preferredLanguage) {
      setLanguage(loggedInUser.preferredLanguage);
    }
    try {
      localStorage.setItem('mitra_one_token', token);
      localStorage.setItem('mitra_one_user', JSON.stringify(loggedInUser));
      if (loggedInUser.preferredLanguage) {
        localStorage.setItem('mitra_one_language', loggedInUser.preferredLanguage);
      }
    } catch {
      // ignore
    }
    setCurrentPage('home');
    setToastMessage({
      title: `Welcome, ${loggedInUser.fullName}!`,
      description: 'Your Mitra One companion is ready to assist you.',
    });
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {
        // ignore
      }
    }
    setAuthToken(null);
    setUser(null);
    try {
      localStorage.removeItem('mitra_one_token');
      localStorage.removeItem('mitra_one_user');
    } catch {
      // ignore
    }
    playGentleChime('tap');
    speakText('You have been signed out safely.');
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    if (authToken) {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('mitra_one_user', JSON.stringify(data.user));
        return;
      }
    }
    // Local fallback update
    setUser(updated);
    localStorage.setItem('mitra_one_user', JSON.stringify(updated));
  };

  // Toast notification for user actions
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    targetPage?: PageId;
    actionLabel?: string;
  } | null>(null);

  // Auto-dismiss toast notification
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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

    setToastMessage({
      title: 'Reminder Created!',
      description: `Scheduled "${item.title}" for ${item.time}. View it in My Day.`,
      targetPage: 'my-day',
      actionLabel: 'View in My Day',
    });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleNavigateWithQuestion = (page: PageId, question?: string) => {
    if (question) {
      setAskMitraInitialQuestion(question);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // MANDATORY AUTHENTICATION: Show Login/Register screen first if not authenticated
  if (!user) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        fontSize={fontSize}
        setFontSize={setFontSize}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f5] text-[#0f2942] selection:bg-orange-100 selection:text-orange-900">
      {/* 1. Header with Font Scaling, Brand, SOS Emergency, Profile & Clean Help Button */}
      <Header
        fontSize={fontSize}
        setFontSize={setFontSize}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        onOpenSos={() => setIsSosModalOpen(true)}
        onNavigateHome={() => setCurrentPage('home')}
        onNavigateToProfile={() => setCurrentPage('profile')}
        currentPage={currentPage}
        user={user}
        currentLanguage={language}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* 2. Clean Navigation Bar with Highlighted "Ask Mitra One" and "Profile" */}
      <Navigation
        currentPage={currentPage}
        onSelectPage={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Toast Notification for Connected Workflows & Voice Alerts */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-20 right-4 sm:right-8 z-50 max-w-md bg-white border-2 ${
            toastMessage.title === 'Voice Playback'
              ? 'border-amber-500 shadow-amber-900/10'
              : 'border-[#1b5e3b]'
          } shadow-xl rounded-2xl p-4 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-xl ${
                toastMessage.title === 'Voice Playback'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-[#1b5e3b]'
              } flex items-center justify-center shrink-0 mt-0.5`}
            >
              {toastMessage.title === 'Voice Playback' ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#0f2942]">
                {toastMessage.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-600 font-medium mt-0.5 leading-relaxed">
                {toastMessage.description}
              </p>
              {toastMessage.targetPage && (
                <button
                  onClick={() => {
                    setCurrentPage(toastMessage.targetPage!);
                    setToastMessage(null);
                  }}
                  className="mt-2 text-xs sm:text-sm font-bold text-[#1b5e3b] hover:text-[#164c30] inline-flex items-center gap-1 cursor-pointer underline"
                >
                  <span>{toastMessage.actionLabel || 'View Now'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. Main Page Content Canvas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={(page) => handleNavigateWithQuestion(page)}
            onOpenTalkModal={() => setIsTalkModalOpen(true)}
            onOpenSos={() => setIsSosModalOpen(true)}
            user={user}
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            language={language}
          />
        )}

        {currentPage === 'my-day' && (
          <MyDayPage
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onNavigate={(page) => handleNavigateWithQuestion(page)}
            onAddReminder={handleAddReminder}
            language={language}
          />
        )}

        {currentPage === 'ask-mitra-one' && (
          <AskMitraOnePage
            initialQuestion={askMitraInitialQuestion}
            onClearInitialQuestion={() => setAskMitraInitialQuestion('')}
            language={language}
          />
        )}

        {currentPage === 'understand' && (
          <UnderstandPage
            onAddReminder={handleAddReminder}
            onNavigate={(page) => handleNavigateWithQuestion(page)}
            language={language}
          />
        )}

        {currentPage === 'scam-shield' && (
          <ScamShieldPage
            onNavigate={(page, q) => handleNavigateWithQuestion(page, q)}
            language={language}
          />
        )}

        {currentPage === 'reminders' && (
          <RemindersPage
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            language={language}
          />
        )}

        {currentPage === 'nearby-care' && (
          <NearbyCarePage
            language={language}
            onNavigate={(page) => handleNavigateWithQuestion(page)}
            onOpenSos={() => setIsSosModalOpen(true)}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage
            user={user}
            currentLanguage={language}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
            onSelectLanguage={handleSelectLanguage}
            onUpdateProfile={handleUpdateProfile}
            onLogout={handleLogout}
            onOpenSos={() => setIsSosModalOpen(true)}
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
        onNavigateToPage={(page) => handleNavigateWithQuestion(page)}
        language={language}
        onLanguageChange={setLanguage}
        autoStartOnOpen={true}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onNavigateToCare={() => {
          setIsEmergencyModalOpen(false);
          handleNavigateWithQuestion('nearby-care');
        }}
      />

      {/* Prominent SOS Emergency Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        user={user}
        onNavigateToCare={() => {
          setIsSosModalOpen(false);
          handleNavigateWithQuestion('nearby-care');
        }}
      />
    </div>
  );
}
