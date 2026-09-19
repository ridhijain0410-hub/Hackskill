import React from 'react';
import {
  VolumeX,
  HeartHandshake,
  HelpCircle,
  AlertOctagon,
  User,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { FontSizeMode, PageId, UserProfile, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { stopSpeaking, isSpeaking } from '../utils/speech';

interface HeaderProps {
  fontSize: FontSizeMode;
  setFontSize: (size: FontSizeMode) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenEmergency: () => void;
  onOpenSos: () => void;
  onNavigateHome: () => void;
  onNavigateToProfile: () => void;
  currentPage: PageId;
  user: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  fontSize,
  setFontSize,
  currentLanguage,
  onSelectLanguage,
  onOpenEmergency,
  onOpenSos,
  onNavigateHome,
  onNavigateToProfile,
  user,
}) => {
  const [speaking, setSpeaking] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSpeaking(isSpeaking());
    }, 350);
    return () => clearInterval(interval);
  }, []);

  const handleStopAudio = () => {
    stopSpeaking();
    setSpeaking(false);
  };

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'R';

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#e7e3da] px-3 sm:px-8 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: MITRA ONE brand logo */}
        <button
          id="mitra-brand-btn"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 sm:gap-3 text-left group cursor-pointer focus:outline-none rounded-xl p-1 -ml-1 transition-opacity hover:opacity-90 shrink-0"
          aria-label="MITRA ONE - Home"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0f2942] text-white flex items-center justify-center shadow-xs shrink-0">
            <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" strokeWidth={2.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0f2942] font-display">
                MITRA ONE
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-stone-600 font-medium tracking-normal -mt-0.5 hidden xs:block">
              Your Everyday Digital Companion
            </p>
          </div>
        </button>

        {/* Right: Language | A-/A/A+ | SOS | Profile Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Speaking Indicator */}
          {speaking && (
            <button
              id="stop-reading-aloud-btn"
              onClick={handleStopAudio}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              title="Stop speaking voice"
              aria-label="Stop reading aloud"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stop Voice</span>
            </button>
          )}

          {/* 1. Language Dropdown */}
          <div className="relative inline-flex items-center bg-white rounded-xl border border-[#d8d3c7] shadow-2xs hover:border-[#0f2942] transition-colors">
            <select
              id="header-language-select"
              value={currentLanguage}
              onChange={(e) => onSelectLanguage(e.target.value as LanguageCode)}
              className="appearance-none bg-transparent hover:bg-stone-50 text-[#0f2942] font-black text-xs sm:text-sm pl-2.5 pr-6 py-1.5 rounded-xl focus:outline-none cursor-pointer"
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-stone-600 pointer-events-none absolute right-1.5" />
          </div>

          {/* 2. Font Size Controls: A-  A  A+ */}
          <div
            className="flex items-center bg-white rounded-xl border border-[#d8d3c7] p-0.5 shadow-2xs"
            role="group"
            aria-label="Font size adjustment controls"
          >
            <button
              id="font-size-decrease-btn"
              onClick={() => setFontSize('normal')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                fontSize === 'normal'
                  ? 'bg-[#0f2942] text-white font-black'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              title="Standard text size"
            >
              A-
            </button>
            <button
              id="font-size-medium-btn"
              onClick={() => setFontSize('large')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                fontSize === 'large'
                  ? 'bg-[#0f2942] text-white font-black'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              title="Larger text size"
            >
              A
            </button>
            <button
              id="font-size-increase-btn"
              onClick={() => setFontSize('extra-large')}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer ${
                fontSize === 'extra-large'
                  ? 'bg-[#0f2942] text-white font-black'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              title="Extra large text size"
            >
              A+
            </button>
          </div>

          {/* 3. SOS Emergency Button (Red pill with bold SOS) */}
          <button
            id="header-sos-btn"
            onClick={onOpenSos}
            className="flex items-center justify-center px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-black text-xs sm:text-sm tracking-wider shadow-xs transition-all active:scale-95 cursor-pointer border border-[#b91c1c]"
            aria-label="SOS Emergency Help"
            title="SOS Emergency - Tap for immediate help"
          >
            <span>SOS</span>
          </button>

          {/* 4. Profile Avatar / Icon */}
          <button
            id="header-profile-avatar-btn"
            onClick={onNavigateToProfile}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#fed7aa] border-2 border-white text-orange-950 flex items-center justify-center font-black text-xs sm:text-sm shadow-2xs hover:ring-2 hover:ring-[#ea580c] transition-all cursor-pointer shrink-0"
            title={`Profile: ${user?.fullName || 'User'}`}
            aria-label="Open profile settings"
          >
            {userInitial}
          </button>
        </div>
      </div>
    </header>
  );
};
