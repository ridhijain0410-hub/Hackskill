import React from 'react';
import { Home, CalendarCheck2, HelpCircle, ShieldAlert, BellRing, MessageSquareText } from 'lucide-react';
import { PageId } from '../types';
import { playGentleChime } from '../utils/speech';

interface NavigationProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
}

interface StandardNavItem {
  id: PageId;
  label: string;
  icon: React.ElementType;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onSelectPage }) => {
  const standardNavItems: StandardNavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-day', label: 'My Day', icon: CalendarCheck2 },
    { id: 'understand', label: 'Understand', icon: HelpCircle },
    { id: 'scam-shield', label: 'Scam Shield', icon: ShieldAlert },
    { id: 'reminders', label: 'Reminders', icon: BellRing },
  ];

  const handleNavClick = (pageId: PageId) => {
    playGentleChime('tap');
    onSelectPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAskActive = currentPage === 'ask-mitra-one';

  return (
    <nav
      aria-label="Main Navigation"
      className="bg-white border-b border-[#e7e3da] sticky top-[73px] z-30 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto py-2.5 scrollbar-none">
          {/* Main 5 navigation items */}
          <div className="flex items-center gap-1 sm:gap-2">
            {standardNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-sm sm:text-base border ${
                    isActive
                      ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-2xs'
                      : 'bg-transparent text-[#1e293b] border-transparent hover:bg-[#f5f1ea] hover:border-[#e7e3da]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${
                      isActive ? 'text-amber-300' : 'text-stone-500'
                    }`}
                    strokeWidth={2.2}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Primary Highlighted Action: Ask Mitra One */}
          <div className="shrink-0 pl-2">
            <button
              id="nav-item-ask-mitra-one"
              onClick={() => handleNavClick('ask-mitra-one')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-extrabold transition-all whitespace-nowrap cursor-pointer text-sm sm:text-base border ${
                isAskActive
                  ? 'bg-[#c2410c] text-white border-[#c2410c] shadow-xs'
                  : 'bg-[#ea580c] hover:bg-[#c2410c] text-white border-[#ea580c] shadow-xs'
              }`}
              aria-current={isAskActive ? 'page' : undefined}
            >
              <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-white" strokeWidth={2.4} />
              <span>Ask Mitra One</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
