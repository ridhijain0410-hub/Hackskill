import React from 'react';
import { Phone, Heart, X, MessageCircle, Hospital } from 'lucide-react';
import { playGentleChime } from '../utils/speech';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToCare?: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, onNavigateToCare }) => {
  if (!isOpen) return null;

  const contacts = [
    {
      role: 'Family Member (Daughter)',
      name: 'Sunita Sharma',
      phone: '+91 98765 43210',
      note: 'Lives 15 mins away • Primary family contact',
    },
    {
      role: 'Family Doctor (Physician)',
      name: 'Dr. Anand Sharma, MD',
      phone: '+91 98111 22334',
      note: 'Clinic open 10 AM - 1 PM, 5 PM - 8 PM',
    },
    {
      role: 'ElderLine (Govt. of India)',
      name: 'National Senior Helpline',
      phone: '14567',
      note: 'Toll-free • Free emotional, legal & healthcare support',
    },
    {
      role: 'Cyber Fraud Emergency',
      name: 'National Cyber Crime Portal',
      phone: '1930',
      note: 'Report bank fraud promptly to protect your account',
    },
  ];

  const handleCall = (phone: string) => {
    playGentleChime('alert');
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs"
    >
      <div className="bg-white rounded-3xl border border-[#e7e3da] shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto flex flex-col relative">
        {/* Header */}
        <div className="bg-[#0f2942] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 id="emergency-modal-title" className="text-xl sm:text-2xl font-bold font-display">
                Help & Trusted Contacts
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Direct one-touch phone dialers for your circle
              </p>
            </div>
          </div>
          <button
            id="close-emergency-modal-btn"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Close contacts"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="bg-[#fbf9f5] rounded-2xl p-4 border border-[#e7e3da] flex items-start gap-3">
            <Heart className="w-6 h-6 text-[#1b5e3b] shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-stone-700 leading-relaxed">
              Never hesitate to call. Your family and senior helplines are always happy to help you anytime.
            </p>
          </div>

          <div className="space-y-3">
            {contacts.map((contact, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-[#e7e3da] bg-white hover:border-[#cbd5e1] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                    {contact.role}
                  </span>
                  <h3 className="text-lg font-bold text-[#0f2942]">{contact.name}</h3>
                  <p className="text-sm font-bold text-stone-700 mt-0.5">{contact.phone}</p>
                  <p className="text-xs text-stone-500 mt-0.5">{contact.note}</p>
                </div>

                <button
                  id={`dial-contact-${idx}-btn`}
                  onClick={() => handleCall(contact.phone)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold text-base bg-[#1b5e3b] hover:bg-[#164c30] shadow-2xs cursor-pointer transition-all shrink-0"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </button>
              </div>
            ))}
          </div>

          {/* Quick WhatsApp SOS button */}
          <div className="pt-2 space-y-2.5">
            <a
              id="send-whatsapp-sos-btn"
              href="https://wa.me/919876543210?text=Hello%20Sunita,%20I%20am%20using%20Mitra%20One%20app.%20Please%20give%20me%20a%20call%20when%20you%20are%20free."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-[#1b5e3b] hover:bg-[#164c30] text-white font-bold text-base transition-colors shadow-2xs"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Send Quick WhatsApp Message to Daughter</span>
            </a>

            {onNavigateToCare && (
              <button
                id="emergency-modal-care-btn"
                onClick={() => {
                  playGentleChime('tap');
                  onClose();
                  onNavigateToCare();
                }}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-[#f0fdfa] hover:bg-[#ccfbf1] text-[#0f766e] font-bold text-sm sm:text-base border border-[#99f6e4] transition-colors cursor-pointer"
              >
                <Hospital className="w-5 h-5" />
                <span>Find Nearby Hospitals & Clinics</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#fbf9f5] px-6 py-3 border-t border-[#e7e3da] text-center text-xs text-stone-600 font-medium">
          Emergency Services (Police / Ambulance / Fire): Dial <strong className="text-[#0f2942]">112</strong>
        </div>
      </div>
    </div>
  );
};
