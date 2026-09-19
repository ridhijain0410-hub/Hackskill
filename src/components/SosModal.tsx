import React, { useState } from 'react';
import {
  AlertOctagon,
  PhoneCall,
  UserCheck,
  X,
  Volume2,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Hospital
} from 'lucide-react';
import { speakText, playGentleChime } from '../utils/speech';
import { UserProfile } from '../types';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onNavigateToCare?: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose, user, onNavigateToCare }) => {
  const [confirmingCall, setConfirmingCall] = useState<{
    type: 'emergency' | 'trusted';
    title: string;
    phone: string;
    numberToDial: string;
  } | null>(null);

  if (!isOpen) return null;

  const trustedName = user?.trustedContactName || 'Family Member';
  const trustedPhone = user?.trustedContactPhone || '+91 98765 43210';
  const cleanTrustedPhone = trustedPhone.replace(/[^\d+]/g, '');

  const handlePromptEmergency = () => {
    playGentleChime('alert');
    setConfirmingCall({
      type: 'emergency',
      title: 'Call 112 National Emergency Services',
      phone: '112 (Police / Ambulance / Fire)',
      numberToDial: '112',
    });
    speakText('Please confirm. Do you want to call 112 National Emergency Services now?');
  };

  const handlePromptTrusted = () => {
    playGentleChime('alert');
    setConfirmingCall({
      type: 'trusted',
      title: `Call Trusted Contact: ${trustedName}`,
      phone: trustedPhone,
      numberToDial: cleanTrustedPhone || '112',
    });
    speakText(`Please confirm. Do you want to call your trusted contact, ${trustedName}?`);
  };

  const handleExecuteCall = () => {
    if (!confirmingCall) return;
    playGentleChime('alert');
    const dialNumber = confirmingCall.numberToDial;
    // Execute device call
    window.location.href = `tel:${dialNumber}`;
  };

  const handleCancelConfirmation = () => {
    playGentleChime('tap');
    setConfirmingCall(null);
  };

  const handleCloseModal = () => {
    playGentleChime('tap');
    setConfirmingCall(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl border-4 border-rose-600 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative text-left">
        {/* Top Crimson Warning Banner */}
        <div className="bg-rose-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-black shadow-xs shrink-0">
              <AlertOctagon className="w-7 h-7" strokeWidth={2.6} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-wider uppercase font-display">
                  SOS
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                  Emergency
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium">
                Immediate Assistance Hotline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                speakText(
                  'Do you need emergency help? Choose Call Emergency Services 112 or Call your trusted contact. Only use SOS for a genuine emergency.'
                )
              }
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
              title="Read SOS instructions aloud"
              aria-label="Read SOS instructions aloud"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              id="close-sos-modal-btn"
              onClick={handleCloseModal}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Cancel and close SOS"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {!confirmingCall ? (
            <>
              {/* Emergency Prompt & Warning */}
              <div className="text-center space-y-2">
                <h2
                  id="sos-dialog-title"
                  className="text-2xl sm:text-3xl font-black text-[#0f2942] font-display"
                >
                  Do you need emergency help?
                </h2>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs sm:text-sm font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Only use SOS for a genuine emergency.</span>
                </div>
              </div>

              {/* Action Buttons with Accidental Call Protection */}
              <div className="space-y-4 pt-1">
                {/* 1. CALL EMERGENCY SERVICES */}
                <button
                  id="sos-call-112-btn"
                  onClick={handlePromptEmergency}
                  className="w-full p-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-4 border-2 border-rose-700 text-left group"
                  aria-label="Call Emergency Services 112"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-7 h-7 text-white" strokeWidth={2.4} />
                    </div>
                    <div>
                      <span className="block text-lg sm:text-xl font-black tracking-tight">
                        CALL EMERGENCY SERVICES
                      </span>
                      <span className="block text-xs sm:text-sm font-semibold text-rose-100 mt-0.5">
                        Dial 112 (Police, Ambulance, Fire in India)
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-white text-rose-700 font-extrabold text-sm shrink-0">
                    112
                  </span>
                </button>

                {/* 2. CALL MY TRUSTED CONTACT */}
                <button
                  id="sos-call-trusted-btn"
                  onClick={handlePromptTrusted}
                  className="w-full p-5 rounded-2xl bg-[#0f2942] hover:bg-[#162a45] text-white shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-4 border-2 border-[#0f2942] text-left group"
                  aria-label={`Call trusted contact: ${trustedName}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <UserCheck className="w-7 h-7 text-amber-300" strokeWidth={2.4} />
                    </div>
                    <div>
                      <span className="block text-lg sm:text-xl font-black tracking-tight">
                        CALL MY TRUSTED CONTACT
                      </span>
                      <span className="block text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                        {trustedName} • {trustedPhone}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-white/10 text-white font-extrabold text-xs sm:text-sm shrink-0">
                    Family
                  </span>
                </button>

                {/* 3. FIND NEARBY HOSPITALS & CLINICS (Nearby Care) */}
                {onNavigateToCare && (
                  <button
                    id="sos-nearby-care-btn"
                    onClick={() => {
                      playGentleChime('tap');
                      handleCloseModal();
                      onNavigateToCare();
                    }}
                    className="w-full p-4 rounded-2xl bg-[#f0fdfa] hover:bg-[#ccfbf1] text-[#0f766e] shadow-xs active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-4 border-2 border-[#99f6e4] text-left group"
                    aria-label="Find nearby hospitals and clinics"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center shrink-0 border border-[#5eead4]">
                        <Hospital className="w-6 h-6" strokeWidth={2.4} />
                      </div>
                      <div>
                        <span className="block text-base sm:text-lg font-black tracking-tight text-[#0f2942]">
                          FIND NEARBY HOSPITALS & CLINICS
                        </span>
                        <span className="block text-xs font-semibold text-stone-600 mt-0.5">
                          Nearby Care • Open directions & hospital numbers
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-teal-100 text-[#0f766e] font-extrabold text-xs shrink-0">
                      Care
                    </span>
                  </button>
                )}

                {/* 4. CANCEL */}
                <button
                  id="sos-cancel-btn"
                  onClick={handleCloseModal}
                  className="w-full py-4 rounded-2xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 font-extrabold text-base sm:text-lg border border-[#d8d3c7] transition-all cursor-pointer text-center"
                >
                  CANCEL (I Am Safe)
                </button>
              </div>
            </>
          ) : (
            /* ACCIDENTAL CALL CONFIRMATION STEP */
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 border-4 border-rose-300 text-rose-600 flex items-center justify-center mx-auto">
                <PhoneCall className="w-8 h-8 animate-bounce" strokeWidth={2.6} />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 block">
                  Confirmation Required
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-[#0f2942] font-display">
                  Confirm Emergency Call?
                </h3>
                <p className="text-base sm:text-lg font-bold text-stone-700 max-w-sm mx-auto">
                  Are you sure you want to dial:
                  <br />
                  <span className="text-xl sm:text-2xl font-black text-rose-700 block mt-1">
                    {confirmingCall.phone}
                  </span>
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  id="sos-confirm-dial-now-btn"
                  onClick={handleExecuteCall}
                  className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xl shadow-lg cursor-pointer flex items-center justify-center gap-3 border border-rose-700"
                >
                  <PhoneCall className="w-6 h-6" />
                  <span>Yes, Place Call Now</span>
                </button>

                <button
                  id="sos-back-to-options-btn"
                  onClick={handleCancelConfirmation}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-800 font-extrabold text-base border border-[#d8d3c7] cursor-pointer flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Go Back / Do Not Call</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-[#fbf9f5] px-6 py-3 border-t border-[#e7e3da] text-center">
          <p className="text-xs text-stone-600 font-medium">
            India Official Emergency Helpline: <strong>112</strong> • Senior Support: <strong>14567</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
