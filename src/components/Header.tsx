import React from 'react';
import { VolumeX, HeartHandshake, HelpCircle } from 'lucide-react';
import { FontSizeMode, PageId } from '../types';
import { stopSpeaking, isSpeaking } from '../utils/speech';

interface HeaderProps {
  fontSize: FontSizeMode;
  setFontSize: (size: FontSizeMode) => void;
  onOpenEmergency: () => void;
  onNavigateHome: () => void;
  currentPage: PageId;
}

export const Header: React.FC<HeaderProps> = ({
  fontSize,
  setFontSize,
  onOpenEmergency,
  onNavigateHome,
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

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f5]/95 backdrop-blur-md border-b border-[#e7e3da] px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left: MITRA ONE logo/name & tagline */}
        <button
          id="mitra-brand-btn"
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none rounded-xl p-1 -ml-1 transition-opacity hover:opacity-90"
          aria-label="MITRA ONE - Home"
        >
          <div className="w-11 h-11 rounded-2xl bg-[#0f2942] text-white flex items-center justify-center shadow-xs shrink-0">
            <HeartHandshake className="w-6 h-6 text-amber-300" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-2xl font-black tracking-tight text-[#0f2942] font-display">
                MITRA ONE
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium tracking-normal -mt-0.5">
              Your Everyday Digital Companion
            </p>
          </div>
        </button>

        {/* Right: Clean, un-crowded Accessibility controls & Help button */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Active Speaking Indicator (if reading aloud) */}
          {speaking && (
            <button
              id="stop-reading-aloud-btn"
              onClick={handleStopAudio}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
              title="Stop speaking voice"
              aria-label="Stop reading aloud"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Voice</span>
            </button>
          )}

          {/* Accessibility Controls: A−  A  A+ */}
          <div
            className="flex items-center bg-white rounded-xl border border-[#d8d3c7] p-1 shadow-2xs"
            role="group"
            aria-label="Font size adjustment controls"
          >
            <button
              id="font-size-decrease-btn"
              onClick={() => setFontSize('normal')}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center transition-all cursor-pointer ${
                fontSize === 'normal'
                  ? 'bg-[#0f2942] text-white shadow-2xs font-extrabold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              title="Standard text size"
              aria-label="Standard text size A minus"
              aria-pressed={fontSize === 'normal'}
            >
              A−
            </button>
            <button
              id="font-size-medium-btn"
              onClick={() => setFontSize('large')}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center transition-all cursor-pointer ${
                fontSize === 'large'
                  ? 'bg-[#0f2942] text-white shadow-2xs font-extrabold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              title="Larger text size"
              aria-label="Larger text size A"
              aria-pressed={fontSize === 'large'}
            >
              A
            </button>
            <button
              id="font-size-increase-btn"
              onClick={() => setFontSize('extra-large')}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-bold text-lg sm:text-xl flex items-center justify-center transition-all cursor-pointer ${
                fontSize === 'extra-large'
                  ? 'bg-[#0f2942] text-white shadow-2xs font-extrabold'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
              title="Extra large text size"
              aria-label="Extra large text size A plus"
              aria-pressed={fontSize === 'extra-large'}
            >
              A+
            </button>
          </div>

          {/* Help button - soft green, safe, warm & calm */}
          <button
            id="header-help-btn"
            onClick={onOpenEmergency}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#1b5e3b] hover:bg-[#164c30] text-white font-bold text-sm sm:text-base shadow-2xs transition-all cursor-pointer"
            aria-label="Open emergency contacts and helpline support"
          >
            <HelpCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>Help</span>
          </button>
        </div>
      </div>
    </header>
  );
};
