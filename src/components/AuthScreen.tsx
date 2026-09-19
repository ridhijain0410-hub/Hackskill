import React, { useState } from 'react';
import {
  HeartHandshake,
  Lock,
  User,
  Phone,
  ArrowRight,
  Eye,
  EyeOff,
  Volume2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Globe
} from 'lucide-react';
import { FontSizeMode, UserProfile, LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../data/languages';
import { speakText, playGentleChime, useSpeechStatus } from '../utils/speech';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, token: string) => void;
  fontSize: FontSizeMode;
  setFontSize: (size: FontSizeMode) => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  fontSize,
  setFontSize,
  currentLanguage,
  onSelectLanguage,
}) => {
  const langConfig = getLanguageConfig(currentLanguage);
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [trustedContactName, setTrustedContactName] = useState('Sunita Sharma (Daughter)');
  const [trustedContactPhone, setTrustedContactPhone] = useState('+91 98765 43210');
  const isSpeaking = useSpeechStatus('Welcome to Mitra One');

  const handleQuickDemo = async () => {
    playGentleChime('tap');
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '9876543210',
          password: 'password123',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      playGentleChime('success');
      speakText(
        currentLanguage === 'hi'
          ? `नमस्ते और स्वागत है, ${data.user.fullName} जी!`
          : `Welcome, ${data.user.fullName}!`,
        currentLanguage
      );
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      // Fallback for offline demo
      const fallbackUser: UserProfile = {
        id: 'usr-demo-local',
        fullName: 'Ramesh Sharma',
        identifier: '9876543210',
        trustedContactName: 'Sunita Sharma (Daughter)',
        trustedContactPhone: '+91 98765 43210',
        relationship: 'Daughter',
      };
      playGentleChime('success');
      speakText(
        currentLanguage === 'hi'
          ? 'नमस्ते और स्वागत है, रमेश शर्मा जी!'
          : 'Welcome, Ramesh Sharma!',
        currentLanguage
      );
      onLoginSuccess(fallbackUser, 'demo-token');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your mobile number or email.');
      speakText('Please enter your mobile number or email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      speakText('Please enter your password.');
      return;
    }

    if (isRegister && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      speakText('Please enter your full name.');
      return;
    }

    playGentleChime('tap');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister
        ? {
            fullName: fullName.trim(),
            identifier: identifier.trim(),
            password,
            preferredLanguage: currentLanguage,
            trustedContactName: trustedContactName.trim(),
            trustedContactPhone: trustedContactPhone.trim(),
          }
        : {
            identifier: identifier.trim(),
            password,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      playGentleChime('success');
      speakText(
        currentLanguage === 'hi'
          ? `नमस्ते और स्वागत है, ${data.user.fullName} जी!`
          : `Welcome, ${data.user.fullName}!`,
        currentLanguage
      );
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      speakText(err.message || 'Something went wrong. Please try again.', currentLanguage);
      playGentleChime('alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex flex-col justify-between text-[#0f2942] p-4 sm:p-6 lg:p-8">
      {/* Top Header bar with Accessibility Controls & Language */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0f2942] text-white flex items-center justify-center shadow-xs shrink-0">
            <HeartHandshake className="w-5 h-5 text-amber-300" strokeWidth={2.4} />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-black text-[#0f2942] font-display tracking-tight">
              MITRA ONE
            </span>
            <p className="text-[11px] text-stone-600 font-medium hidden xs:block">
              Your Everyday Digital Companion
            </p>
          </div>
        </div>

        {/* Accessibility controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector */}
          <div className="relative flex items-center bg-white rounded-xl border border-[#d8d3c7] shadow-2xs px-2.5 py-1">
            <Globe className="w-4 h-4 text-stone-500 mr-1.5 shrink-0" />
            <select
              id="auth-language-select"
              value={currentLanguage}
              onChange={(e) => {
                const newLang = e.target.value as LanguageCode;
                onSelectLanguage(newLang);
                playGentleChime('tap');
                const cfg = getLanguageConfig(newLang);
                speakText(`Language changed to ${cfg.name}. ${cfg.nativeName}`, newLang);
              }}
              className="bg-transparent text-xs sm:text-sm font-extrabold text-[#0f2942] cursor-pointer focus:outline-none pr-1 py-1"
              aria-label="Select language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              speakText(
                currentLanguage === 'hi'
                  ? 'मित्रा वन में आपका स्वागत है। कृपया अपने मोबाइल नंबर या ईमेल और पासवर्ड से लॉग इन करें, या नए उपयोगकर्ता के रूप में पंजीकरण करें। हम कभी भी ओटीपी या बैंक पासवर्ड नहीं मांगते।'
                  : 'Welcome to Mitra One. Please log in with your mobile number or email and password, or register as a new user. We never ask for OTPs or bank passwords.',
                currentLanguage
              )
            }
            className={`p-2 rounded-xl border shadow-2xs cursor-pointer transition-colors ${
              isSpeaking
                ? 'bg-amber-100 border-amber-400 text-amber-900'
                : 'bg-white hover:bg-stone-50 text-stone-700 border-[#d8d3c7]'
            }`}
            title={isSpeaking ? 'Speaking instructions...' : 'Read instructions aloud'}
            aria-label={isSpeaking ? 'Speaking instructions aloud' : 'Read screen instructions aloud'}
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-[#ea580c] animate-pulse' : 'text-stone-700'}`} />
          </button>

          {/* Text size scaling */}
          <div
            className="flex items-center bg-white rounded-xl border border-[#d8d3c7] p-0.5 shadow-2xs"
            role="group"
            aria-label="Font size adjustment controls"
          >
            <button
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
        </div>
      </header>

      {/* Main Split Authentication Section */}
      <main className="max-w-6xl w-full mx-auto my-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
        {/* Left Side: Welcoming Visual Brand & Benefits (Option 1 from reference image) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0f2942] text-white flex items-center justify-center shadow-xs">
                <HeartHandshake className="w-6 h-6 text-amber-300" strokeWidth={2.4} />
              </div>
              <div>
                <span className="text-2xl font-black text-[#0f2942] font-display tracking-tight">
                  MITRA ONE
                </span>
                <p className="text-xs text-stone-600 font-semibold">
                  Your Everyday Digital Companion
                </p>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f2942] font-display tracking-tight leading-[1.15]">
              Technology made simpler for a brighter everyday.
            </h1>
          </div>

          {/* Warm Artistic Card Depicting Senior Digital Confidence */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50/50 to-stone-100 border border-[#e7e3da] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Stylized Avatar Illustration */}
              <div className="relative w-36 h-36 shrink-0 rounded-2xl bg-[#0f2942] overflow-hidden flex items-center justify-center shadow-sm">
                {/* SVG Illustration of Smiling Indian Senior Couple with Smartphone */}
                <svg viewBox="0 0 160 160" className="w-full h-full" aria-hidden="true">
                  <rect width="160" height="160" fill="#0f2942" />
                  <circle cx="80" cy="140" r="70" fill="#1e3a5f" />
                  {/* Husband */}
                  <circle cx="56" cy="65" r="24" fill="#fed7aa" />
                  {/* Grey hair */}
                  <path d="M36 58 Q42 42 62 44 Q76 45 78 58 Q74 50 60 50 Q44 50 36 58 Z" fill="#e2e8f0" />
                  {/* Glasses */}
                  <rect x="42" y="60" width="12" height="9" rx="3" fill="none" stroke="#334155" strokeWidth="2" />
                  <rect x="58" y="60" width="12" height="9" rx="3" fill="none" stroke="#334155" strokeWidth="2" />
                  <line x1="54" y1="64" x2="58" y2="64" stroke="#334155" strokeWidth="2" />
                  {/* Smile */}
                  <path d="M48 76 Q56 82 64 76" fill="none" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
                  {/* Kurta */}
                  <path d="M30 110 Q56 94 82 110 L82 160 L30 160 Z" fill="#ea580c" />

                  {/* Wife */}
                  <circle cx="104" cy="70" r="22" fill="#fcd34d" />
                  {/* Hair bun */}
                  <circle cx="124" cy="64" r="10" fill="#475569" />
                  <path d="M86 64 Q98 48 116 52 Q124 55 124 66" fill="#475569" />
                  {/* Bindi */}
                  <circle cx="104" cy="64" r="2" fill="#b91c1c" />
                  {/* Smile */}
                  <path d="M96 80 Q104 86 112 80" fill="none" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
                  {/* Saree */}
                  <path d="M80 112 Q106 98 132 112 L132 160 L80 160 Z" fill="#15803d" />

                  {/* Smartphone in hands */}
                  <rect x="68" y="102" width="24" height="40" rx="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="80" cy="112" r="3" fill="#ffffff" />
                  <rect x="73" y="118" width="14" height="2" rx="1" fill="#ffffff" opacity="0.8" />
                  <rect x="73" y="123" width="10" height="2" rx="1" fill="#ffffff" opacity="0.8" />
                </svg>
              </div>

              <div className="space-y-2 text-left">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-white border border-[#fed7aa] text-orange-950 font-bold text-xs">
                  Designed for Seniors
                </span>
                <p className="text-sm font-bold text-[#0f2942] leading-snug">
                  Zero confusing technology. Large readable words, voice playback, and warm patient answers anytime.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Feature Badges (Matching Reference Screen 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#e7e3da] shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="text-base">💬</span>
              </div>
              <span className="text-sm font-bold text-[#0f2942]">Get help in simple language</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#e7e3da] shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
              </div>
              <span className="text-sm font-bold text-[#0f2942]">Stay safe from scams</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#e7e3da] shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <span className="text-base">📅</span>
              </div>
              <span className="text-sm font-bold text-[#0f2942]">Manage your daily tasks</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#e7e3da] shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <span className="text-base">💖</span>
              </div>
              <span className="text-sm font-bold text-[#0f2942]">Always here for you</span>
            </div>
          </div>

          {/* Testimonial Quote (From Reference Screen 1) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
            <p className="text-sm sm:text-base font-extrabold text-emerald-950 italic">
              “I can now do things online with confidence!”
            </p>
            <p className="text-xs text-emerald-800 font-semibold">
              — A happier, safer tomorrow
            </p>
          </div>
        </div>

        {/* Right Side: Login / Register Form Card (Option 1 from reference image) */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#e7e3da] shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] p-6 sm:p-8 space-y-5">
          {/* Welcoming Header */}
          <div className="space-y-1 text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0f2942] font-display">
              {isRegister ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-medium">
              {isRegister ? 'Sign up to start your digital journey.' : "Let's get you started."}
            </p>
          </div>

          {/* Error notification banner */}
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-2.5 text-left"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm font-bold">{errorMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {isRegister && (
              <div className="space-y-1">
                <label
                  htmlFor="auth-fullname-input"
                  className="block text-xs sm:text-sm font-extrabold text-[#0f2942]"
                >
                  Your Full Name
                </label>
                <div className="relative">
                  <input
                    id="auth-fullname-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#d8d3c7] bg-white text-sm sm:text-base font-medium text-[#0f2942] focus:ring-2 focus:ring-[#0f2942] focus:outline-none"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Identifier: Mobile or Email */}
            <div className="space-y-1">
              <label
                htmlFor="auth-identifier-input"
                className="block text-xs sm:text-sm font-extrabold text-[#0f2942]"
              >
                Mobile number or Email
              </label>
              <div className="relative">
                <input
                  id="auth-identifier-input"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or name@gmail.com"
                  className="w-full pl-10 pr-3 py-3 rounded-xl border border-[#d8d3c7] bg-white text-sm sm:text-base font-medium text-[#0f2942] focus:ring-2 focus:ring-[#0f2942] focus:outline-none"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="auth-password-input"
                  className="block text-xs sm:text-sm font-extrabold text-[#0f2942]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-stone-600 hover:text-[#0f2942] cursor-pointer inline-flex items-center gap-1"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#d8d3c7] bg-white text-sm sm:text-base font-medium text-[#0f2942] focus:ring-2 focus:ring-[#0f2942] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Primary Orange Submit Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] disabled:opacity-50 text-white font-black text-base sm:text-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Register' : 'Log In'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between login and register */}
          <div className="text-center">
            {isRegister ? (
              <p className="text-xs sm:text-sm text-stone-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#0f2942] hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-stone-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#ea580c] hover:underline cursor-pointer"
                >
                  Register
                </button>
              </p>
            )}
          </div>

          {/* Demo Access for Evaluation (from reference image) */}
          <div className="pt-3 border-t border-[#e7e3da] text-center space-y-2">
            <span className="text-xs font-semibold text-stone-500 block">
              Demo access for evaluation
            </span>
            <button
              id="quick-demo-login-btn"
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 text-[#0f2942] border border-[#d8d3c7] font-bold text-xs sm:text-sm cursor-pointer transition-colors shadow-2xs flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4 text-stone-600" />
              <span>Sign in as Ramesh Sharma</span>
            </button>
          </div>

          {/* Privacy First message with Green Shield (from reference image) */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-2.5 text-left">
            <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0 mt-0.5" />
            <p className="text-[11px] sm:text-xs font-semibold leading-relaxed">
              Privacy first: MITRA ONE never asks for OTPs, PINs, CVVs or banking passwords.
            </p>
          </div>
        </div>
      </main>

      {/* Footer helpline info */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-stone-500 font-medium py-3">
        Government Senior Citizen Helpline: <strong>14567</strong> • Emergency Services: <strong>112</strong>
      </footer>
    </div>
  );
};
