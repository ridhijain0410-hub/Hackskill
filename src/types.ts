export type PageId = 'home' | 'my-day' | 'ask-mitra-one' | 'understand' | 'scam-shield' | 'reminders';

export type FontSizeMode = 'normal' | 'large' | 'extra-large';

export interface ReminderItem {
  id: string;
  title: string;
  time: string; // e.g. "08:30 AM"
  period: 'morning' | 'afternoon' | 'evening';
  category: 'medicine' | 'call' | 'appointment' | 'routine';
  details: string;
  completed: boolean;
  dosage?: string;
  doctorOrContact?: string;
  urgent?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mitra-one';
  text: string;
  timestamp: string;
  steps?: string[];
  tips?: string;
}

export interface UnderstandSample {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  iconName: string;
  originalText: string;
  plainEnglish: {
    inOneSentence: string;
    whatItMeans: string[];
    whatYouNeedToDo: string;
    deadlineOrAmount?: string;
    isUrgent: boolean;
  };
}

export interface ScamRule {
  id: string;
  title: string;
  simpleRule: string;
  explanation: string;
  example: string;
  icon: string;
}

export interface ScamCheckAnalysis {
  verdict: 'danger' | 'warning' | 'safe';
  headline: string;
  explanation: string;
  identifiedRedFlags: string[];
  safeAction: string;
  confidence: string;
}
