import React from 'react';
import { Home, CalendarCheck2, HelpCircle, ShieldAlert, BellRing, MessageSquareText, User, Hospital } from 'lucide-react';
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
  const navItems: StandardNavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'my-day', label: 'My Day', icon: CalendarCheck2 },
    { id: 'nearby-care', label: 'Nearby Care', icon: Hospital },
    { id: 'understand', label: 'Understand', icon: HelpCircle },
    { id: 'scam-shield', label: 'Scam Shield', icon: ShieldAlert },
    { id: 'reminders', label: 'Reminders', icon: BellRing },
    { id: 'ask-mitra-one', label: 'Ask Mitra', icon: MessageSquareText },
  ];

  const handleNavClick = (pageId: PageId) => {
    playGentleChime('tap');
    onSelectPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Main Navigation"
      className="bg-white border-b border-[#e7e3da] sticky top-[61px] z-30 shadow-[0_2px_6px_-2px_rgba(15,23,42,0.03)]"
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer text-xs sm:text-sm md:text-base border ${
                  isActive
                    ? 'bg-[#0f2942] text-white border-[#0f2942] shadow-2xs'
                    : 'bg-transparent text-stone-700 border-transparent hover:bg-[#f5f1ea] hover:border-[#e7e3da]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-amber-300' : 'text-stone-500'
                  }`}
                  strokeWidth={2.2}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
