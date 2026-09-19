export type PageId =
  | 'home'
  | 'my-day'
  | 'ask-mitra-one'
  | 'understand'
  | 'scam-shield'
  | 'reminders'
  | 'profile'
  | 'nearby-care';

export type FontSizeMode = 'normal' | 'large' | 'extra-large';

export type LanguageCode = 'en' | 'hi';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  speechLang: string;
  scriptLabel: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  identifier: string; // mobile number or email
  trustedContactName: string;
  trustedContactPhone: string;
  relationship?: string;
  preferredLanguage?: LanguageCode;
  age?: number | string;
  city?: string;
  bloodGroup?: string;
  allergies?: string;
  primaryDoctor?: string;
}

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

export interface UnderstandAnalysis {
  whatIsThis: string;
  importantInfo: string[];
  whatDoINeedToDo: string;
  importantDates: string;
  amount?: string;
  isUrgent: boolean;
  extractedReminder?: {
    canCreateReminder: boolean;
    reminderTitle: string;
    reminderTime: string;
    reminderPeriod: 'morning' | 'afternoon' | 'evening';
    reminderCategory: 'medicine' | 'call' | 'appointment' | 'routine';
    reminderDetails: string;
    importantDates?: string;
  } | null;
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
  verdictLabel?: string;
  headline: string;
  explanation: string;
  identifiedRedFlags: string[];
  safeAction: string;
  securityAdvice?: string;
  confidence?: string;
  suggestedMitraQuestion?: string;
}

export interface NearbyFacility {
  id: string;
  name: string;
  type: 'Hospital' | 'Clinic' | 'Emergency Care';
  distanceKm?: number;
  distanceText?: string;
  address: string;
  phone?: string;
  isOpen?: boolean | null;
  statusText?: string;
  isEmergency?: boolean;
  directionsUrl: string;
  cityOrArea?: string;
}
