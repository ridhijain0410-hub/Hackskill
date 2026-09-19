import React, { useState } from 'react';
import {
  User,
  Phone,
  ShieldCheck,
  Save,
  LogOut,
  AlertOctagon,
  HeartHandshake,
  CheckCircle2,
  Volume2,
  PhoneCall,
  Activity,
  VolumeX,
  Type,
  Languages,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { UserProfile, LanguageCode, FontSizeMode } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../data/languages';
import { speakText, playGentleChime } from '../utils/speech';

interface ProfilePageProps {
  user: UserProfile;
  currentLanguage: LanguageCode;
  fontSize?: FontSizeMode;
  onChangeFontSize?: (size: FontSizeMode) => void;
  onSelectLanguage: (lang: LanguageCode) => void;
  onUpdateProfile: (updated: UserProfile) => Promise<void>;
  onLogout: () => void;
  onOpenSos: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  currentLanguage,
  fontSize = 'large',
  onChangeFontSize,
  onSelectLanguage,
  onUpdateProfile,
  onLogout,
  onOpenSos,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState(user.fullName || 'Ramesh Patel');
  const [age, setAge] = useState(user.age || '72');
  const [city, setCity] = useState(user.city || 'Bengaluru, Karnataka');
  const [identifier, setIdentifier] = useState(user.identifier || '+91 98765 43210');

  // Emergency contact
  const [trustedContactName, setTrustedContactName] = useState(
    user.trustedContactName || 'Sunita Sharma'
  );
  const [relationship, setRelationship] = useState(user.relationship || 'Daughter');
  const [trustedContactPhone, setTrustedContactPhone] = useState(
    user.trustedContactPhone || '+91 98450 12345'
  );

  // Medical info
  const [bloodGroup, setBloodGroup] = useState(user.bloodGroup || 'O+ (Positive)');
  const [allergies, setAllergies] = useState(user.allergies || 'Penicillin, Dust');
  const [primaryDoctor, setPrimaryDoctor] = useState(user.primaryDoctor || 'Dr. Anita Rao (Cardiologist)');

  // App preferences
  const [preferredLanguage, setPreferredLanguage] = useState<LanguageCode>(
    user.preferredLanguage || currentLanguage || 'en'
  );
  const [voiceAssistantEnabled, setVoiceAssistantEnabled] = useState(true);
  const [soundChimeEnabled, setSoundChimeEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updated: UserProfile = {
        ...user,
        fullName: fullName.trim(),
        identifier: identifier.trim(),
        age: age.toString().trim(),
        city: city.trim(),
        trustedContactName: trustedContactName.trim(),
        relationship: relationship.trim(),
        trustedContactPhone: trustedContactPhone.trim(),
        bloodGroup: bloodGroup.trim(),
        allergies: allergies.trim(),
        primaryDoctor: primaryDoctor.trim(),
        preferredLanguage,
      };

      await onUpdateProfile(updated);
      onSelectLanguage(preferredLanguage);
      setSaving(false);
      setSaveSuccess(true);
      setIsEditing(false);
      playGentleChime('success');
      speakText('Your profile and preferences have been saved successfully.', preferredLanguage);

      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setSaving(false);
      playGentleChime('alert');
      console.error(err);
    }
  };

  const activeLangConfig = getLanguageConfig(preferredLanguage);

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 text-left">
      {/* Top Banner matching Reference Screen */}
      <div className="bg-white border border-[#e7e3da] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Profile & Account Settings
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f2942] font-display">
            User Profile
          </h1>
          <p className="text-stone-600 text-sm sm:text-base font-medium">
            Manage your personal emergency contacts, health information, and display preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() =>
              speakText(
                `Profile settings for ${fullName}. Emergency contact: ${trustedContactName}, ${relationship}.`,
                preferredLanguage
              )
            }
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-[#0f2942] border border-[#d8d3c7] font-extrabold text-xs sm:text-sm cursor-pointer transition-colors shadow-2xs"
            title="Read profile aloud"
          >
            <Volume2 className="w-4 h-4 text-amber-500" />
            <span>Read Aloud</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-extrabold text-xs sm:text-sm cursor-pointer transition-colors shadow-xs"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4 text-amber-300" />}
            <span>{isEditing ? 'Close Editing' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Success alert */}
      {saveSuccess && (
        <div
          role="status"
          className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 animate-in fade-in duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span className="font-bold text-sm sm:text-base">
            Profile changes saved successfully! Emergency details updated.
          </span>
        </div>
      )}

      {/* Two-Column Clean Layout for Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: User Info, Emergency Contact, Medical Info */}
        <div className="space-y-6">
          {/* User Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e7e3da] shadow-xs space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-900 flex items-center justify-center font-black text-2xl shrink-0 shadow-xs">
                {fullName.charAt(0) || 'U'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f2942] font-display">
                    {fullName}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Active
                  </span>
                </div>
                <p className="text-sm font-semibold text-stone-600">
                  Age: <strong className="text-[#0f2942]">{age} years</strong> • City: <strong className="text-[#0f2942]">{city}</strong>
                </p>
                <p className="text-xs text-stone-500 font-medium">
                  Contact: {identifier}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="pt-3 border-t border-stone-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#d8d3c7] text-sm font-bold text-[#0f2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Age</label>
                    <input
                      type="text"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#d8d3c7] text-sm font-bold text-[#0f2942]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#d8d3c7] text-sm font-bold text-[#0f2942]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Emergency Contact Card */}
          <div className="bg-[#fff8f2] rounded-2xl p-5 sm:p-6 border-2 border-[#fed7aa] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#ea580c] border border-orange-200 flex items-center justify-center font-bold">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ea580c]">
                    Primary Emergency Contact
                  </span>
                  <h3 className="text-lg font-black text-[#0f2942]">
                    {trustedContactName} ({relationship})
                  </h3>
                </div>
              </div>

              <a
                href={`tel:${trustedContactPhone}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
                title={`Call ${trustedContactName}`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Now</span>
              </a>
            </div>

            <div className="p-3 bg-white/90 rounded-xl border border-orange-200 text-xs sm:text-sm text-stone-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0f2942]">Phone Number: </span>
                <span className="font-semibold text-stone-600">{trustedContactPhone}</span>
              </div>
              <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                Verified SOS Contact
              </span>
            </div>

            {isEditing && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={trustedContactName}
                      onChange={(e) => setTrustedContactName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-bold text-[#0f2942] bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g. Daughter, Son, Neighbor"
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-bold text-[#0f2942] bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={trustedContactPhone}
                    onChange={(e) => setTrustedContactPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 text-sm font-bold text-[#0f2942] bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Medical Quick Info */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e7e3da] shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#0f2942]">
                  Medical Quick Info
                </h3>
                <p className="text-xs text-stone-500">
                  Shared with emergency first responders during an SOS call.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-stone-200 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Blood Group
                </span>
                <span className="text-base font-extrabold text-[#0f2942] block">
                  {bloodGroup}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-stone-200 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Allergies
                </span>
                <span className="text-sm font-bold text-rose-800 block">
                  {allergies}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#fbf9f5] border border-stone-200 space-y-1">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Primary Doctor
                </span>
                <span className="text-xs font-bold text-[#0f2942] block">
                  {primaryDoctor}
                </span>
              </div>
            </div>

            {isEditing && (
              <div className="space-y-3 pt-2 border-t border-stone-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold text-[#0f2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Allergies</label>
                    <input
                      type="text"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold text-[#0f2942]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={primaryDoctor}
                      onChange={(e) => setPrimaryDoctor(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 text-xs font-bold text-[#0f2942]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: App Preferences & Account Actions */}
        <div className="space-y-6">
          {/* App Preferences */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e7e3da] shadow-xs space-y-5">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-[#0f2942] font-display">
                App Preferences
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Customize readability, audio assistants, and guidance voice.
              </p>
            </div>

            {/* 1. Text Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-700">
                <Type className="w-4 h-4 text-[#ea580c]" />
                <span className="text-xs sm:text-sm font-bold text-[#0f2942]">Text Size</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'large', 'extra-large'] as FontSizeMode[]).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      if (onChangeFontSize) onChangeFontSize(size);
                      playGentleChime('tap');
                    }}
                    className={`py-2.5 px-3 rounded-xl border-2 font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                      fontSize === size
                        ? 'border-[#ea580c] bg-[#ea580c] text-white shadow-xs'
                        : 'border-[#e7e3da] bg-[#fbf9f5] text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {size === 'normal' ? 'Normal' : size === 'large' ? 'Large' : 'Extra Large'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Preferred Language Selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-stone-700">
                <Languages className="w-4 h-4 text-[#ea580c]" />
                <span className="text-xs sm:text-sm font-bold text-[#0f2942]">
                  Preferred Language ({activeLangConfig.name})
                </span>
              </div>

              <select
                id="profile-pref-language"
                value={preferredLanguage}
                onChange={(e) => {
                  const newLang = e.target.value as LanguageCode;
                  setPreferredLanguage(newLang);
                  onSelectLanguage(newLang);
                  playGentleChime('tap');
                }}
                className="w-full p-3 rounded-xl border border-[#d8d3c7] bg-[#fbf9f5] font-bold text-xs sm:text-sm text-[#0f2942] focus:border-[#ea580c] outline-none"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Voice Assistant Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f5] border border-stone-200">
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-[#0f2942] block">
                  Voice Assistant & Read Aloud
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  Speaks explanations gently in your language
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setVoiceAssistantEnabled(!voiceAssistantEnabled);
                  playGentleChime('tap');
                }}
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                  voiceAssistantEnabled ? 'bg-[#16a34a]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    voiceAssistantEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 4. Sound / Chime Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fbf9f5] border border-stone-200">
              <div className="space-y-0.5">
                <span className="text-xs sm:text-sm font-bold text-[#0f2942] block">
                  Touch Chimes & Feedback
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  Plays reassuring chimes when tapping buttons
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSoundChimeEnabled(!soundChimeEnabled);
                  playGentleChime('tap');
                }}
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                  soundChimeEnabled ? 'bg-[#16a34a]' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundChimeEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Account Actions Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e7e3da] shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="text-lg font-black text-[#0f2942] font-display">
                Account Actions
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Test emergency triggers, edit details, or sign out safely.
              </p>
            </div>

            <div className="space-y-3">
              {/* Edit Profile Button / Save changes */}
              {isEditing ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#16a34a] hover:bg-[#15803d] text-white font-black text-sm sm:text-base shadow-xs cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-[#0f2942] font-bold text-sm sm:text-base border border-[#d8d3c7] cursor-pointer transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-[#ea580c]" />
                  <span>Edit Profile & Contacts</span>
                </button>
              )}

              {/* Emergency SOS Test button */}
              <button
                id="profile-test-sos-btn"
                type="button"
                onClick={onOpenSos}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-300 font-black text-sm sm:text-base cursor-pointer transition-colors"
              >
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <span>Emergency SOS Test</span>
              </button>

              {/* Sign Out button */}
              {!confirmLogout ? (
                <button
                  id="profile-sign-out-btn"
                  type="button"
                  onClick={() => setConfirmLogout(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of MITRA ONE</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-2 text-center">
                  <p className="text-xs font-bold text-rose-800">
                    Are you sure you want to sign out?
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-700"
                    >
                      Yes, Sign Out
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmLogout(false)}
                      className="px-4 py-2 rounded-lg bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer hover:bg-stone-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Footer Note */}
      <div className="bg-[#f0fdf4] rounded-2xl p-4 sm:p-5 border border-[#bbf7d0] flex items-center gap-3 text-stone-800 text-left">
        <ShieldCheck className="w-6 h-6 text-[#16a34a] shrink-0" />
        <p className="text-xs sm:text-sm font-medium text-stone-700">
          <strong>Privacy Guarantee:</strong> MITRA ONE stores your personal data encrypted locally on your device. We never ask for, collect, or transmit passwords, ATM PINs, or OTPs.
        </p>
      </div>
    </div>
  );
};
