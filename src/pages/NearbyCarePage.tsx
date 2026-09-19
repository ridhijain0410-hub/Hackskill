import React, { useState } from 'react';
import {
  MapPin,
  Hospital,
  Navigation as NavigationIcon,
  Phone,
  Search,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Clock,
  Building2,
  Volume2,
  Square,
  ChevronRight,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import { NearbyFacility, LanguageCode, PageId } from '../types';
import { speakText, stopSpeaking, useSpeechStatus, playGentleChime } from '../utils/speech';

interface NearbyCarePageProps {
  language: LanguageCode;
  onNavigate?: (page: PageId) => void;
  onOpenSos?: () => void;
}

type ViewState = 'prompt' | 'loading' | 'results' | 'manual-search' | 'error';

export const NearbyCarePage: React.FC<NearbyCarePageProps> = ({
  language,
  onNavigate,
  onOpenSos,
}) => {
  const [viewState, setViewState] = useState<ViewState>('prompt');
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [currentLocationName, setCurrentLocationName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [facilityFilter, setFacilityFilter] = useState<'all' | 'hospital' | 'clinic' | 'emergency'>('all');
  const isSpeaking = useSpeechStatus();

  // Quick suggestions for senior convenience in India
  const quickSearchAreas = [
    'New Delhi',
    'South Delhi',
    'Noida Sector 62',
    'Ghaziabad',
    'Gurugram',
    'Bandra, Mumbai',
    'Andheri, Mumbai',
    'Jayanagar, Bengaluru',
    'Indiranagar, Bengaluru',
    'Jubilee Hills, Hyderabad',
    'Salt Lake, Kolkata',
    'Anna Nagar, Chennai',
  ];

  // Read page introduction aloud
  const handleReadAloud = () => {
    const textToSpeak =
      language === 'hi'
        ? 'नजदीकी चिकित्सा केंद्र। अपने पास के अस्पताल और क्लिनिक खोजें। यदि कोई गंभीर आपातकाल है, तो कृपया तुरंत 112 डायल करें।'
        : 'Nearby Care. Find hospitals and clinics near you. In a medical emergency, please call 112 immediately.';
    speakText(textToSpeak, language);
  };

  // 1. Explicit user tap to request location (NEVER requested automatically)
  const handleRequestLocation = () => {
    playGentleChime('tap');
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setErrorMessage(
        language === 'hi'
          ? 'आपके ब्राउज़र में ऑटोमैटिक लोकेशन सुविधा उपलब्ध नहीं है। कृपया नीचे अपने शहर या इलाके का नाम लिखकर खोजें।'
          : 'Your browser does not support automatic location. Please type your city or area name below.'
      );
      setViewState('error');
      return;
    }

    setViewState('loading');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/care/nearby?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
          }
          const data = await res.json();
          if (Array.isArray(data.facilities) && data.facilities.length > 0) {
            setFacilities(data.facilities);
            setCurrentLocationName(data.locationName || (language === 'hi' ? 'आपका नजदीकी क्षेत्र' : 'Your Nearby Area'));
            setViewState('results');
            playGentleChime('success');
          } else {
            setErrorMessage(
              language === 'hi'
                ? 'इस क्षेत्र में कोई अस्पताल नहीं मिला। कृपया अपने शहर या इलाके का नाम लिखकर खोजें।'
                : 'No facilities found in this immediate radius. Please try searching by your city or area name.'
            );
            setViewState('error');
          }
        } catch (err) {
          console.error('Failed to fetch nearby care:', err);
          setErrorMessage(
            language === 'hi'
              ? 'नेटवर्क की समस्या के कारण जानकारी लोड नहीं हो सकी। आप नीचे क्षेत्र का नाम लिखकर खोज सकते हैं।'
              : 'Could not connect to the care directory right now. Please try searching manually by area name.'
          );
          setViewState('error');
        }
      },
      (geoError) => {
        console.warn('Geolocation error:', geoError.code, geoError.message);
        playGentleChime('alert');
        let msg = '';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg =
            language === 'hi'
              ? 'लोकेशन की अनुमति नहीं मिली। कोई बात नहीं, आप नीचे अपने शहर या कॉलोनी का नाम लिखकर आसानी से अस्पताल खोज सकते हैं।'
              : 'Location permission was not granted. No problem—you can easily search by typing your city or area name below.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg =
            language === 'hi'
              ? 'आपकी वर्तमान लोकेशन नहीं मिल सकी। कृपया नीचे अपने इलाके का नाम लिखकर खोजें।'
              : 'Your current location could not be determined. Please search manually using your area name.';
        } else {
          msg =
            language === 'hi'
              ? 'लोकेशन प्राप्त करने में समय समाप्त हो गया। कृपया नीचे अपने क्षेत्र का नाम लिखकर खोजें।'
              : 'Location request timed out. Please enter your city or locality below.';
        }
        setErrorMessage(msg);
        setViewState('error');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // 2. Manual search by city, locality or area
  const handleManualSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;

    playGentleChime('tap');
    setViewState('loading');
    setErrorMessage('');
    setSearchQuery(q);

    try {
      const res = await fetch(`/api/care/search?query=${encodeURIComponent(q)}`);
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data.facilities) && data.facilities.length > 0) {
        setFacilities(data.facilities);
        setCurrentLocationName(data.locationName || q);
        setViewState('results');
        playGentleChime('success');
      } else {
        setErrorMessage(
          language === 'hi'
            ? `"${q}" के लिए कोई अस्पताल या क्लिनिक नहीं मिला। कृपया किसी नजदीकी बड़े शहर का नाम आज़माएँ।`
            : `No facilities found for "${q}". Please try a nearby major city or locality name.`
        );
        setViewState('error');
      }
    } catch (err) {
      console.error('Error during manual care search:', err);
      setErrorMessage(
        language === 'hi'
          ? 'खोज के दौरान नेटवर्क त्रुटि हुई। कृपया दोबारा प्रयास करें।'
          : 'Network error while searching for facilities. Please try again.'
      );
      setViewState('error');
    }
  };

  // Filter facilities based on senior selection
  const filteredFacilities = facilities.filter((item) => {
    if (facilityFilter === 'hospital') return item.type === 'Hospital';
    if (facilityFilter === 'clinic') return item.type === 'Clinic';
    if (facilityFilter === 'emergency') return item.isEmergency || item.type === 'Emergency Care';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Life-Threatening Emergency Guidance Banner (Safety First) */}
      <div
        id="care-emergency-banner"
        role="alert"
        aria-live="assertive"
        className="p-4 sm:p-5 rounded-2xl bg-rose-600 text-white shadow-md border-2 border-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.4} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight font-display">
              {language === 'hi' ? 'गंभीर आपातकाल? तुरंत सहायता लें' : 'Severe Medical Emergency? Call Directly'}
            </h2>
            <p className="text-xs sm:text-sm text-rose-100 font-medium mt-0.5">
              {language === 'hi'
                ? 'यदि किसी की जान जोखिम में है, तो अस्पताल जाने की प्रतीक्षा न करें। तुरंत राष्ट्रीय हेल्पलाइन 112 या एम्बुलेंस 108 पर कॉल करें।'
                : 'If someone is critically ill or injured, do not wait. Dial 112 or local ambulance immediately.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <a
            id="care-dial-112-btn"
            href="tel:112"
            className="px-4 py-2.5 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-black text-sm sm:text-base flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
            aria-label="Call Emergency Services 112"
          >
            <Phone className="w-4 h-4 fill-current" />
            <span>Call 112</span>
          </a>
          {onOpenSos && (
            <button
              id="care-open-sos-btn"
              onClick={onOpenSos}
              className="px-4 py-2.5 rounded-xl bg-rose-900/60 hover:bg-rose-900/80 text-white font-bold text-sm sm:text-base border border-rose-400/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>SOS Help</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Header & Title Section */}
      <div className="bg-white rounded-3xl border border-[#99f6e4] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ccfbf1] text-[#0f766e] border border-[#5eead4] flex items-center justify-center shrink-0 shadow-2xs">
              <Hospital className="w-8 h-8" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-[#0f2942] tracking-tight font-display">
                  {language === 'hi' ? 'नजदीकी चिकित्सा केंद्र' : 'Nearby Care'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0f766e] text-xs font-black uppercase tracking-wider">
                  {language === 'hi' ? 'स्वास्थ्य सेवा' : 'Hospitals & Clinics'}
                </span>
              </div>
              <p className="text-base sm:text-lg font-bold text-stone-700 mt-1">
                {language === 'hi'
                  ? 'अपने नजदीकी अस्पताल और क्लिनिक खोजें।'
                  : 'Find hospitals and clinics near you.'}
              </p>
            </div>
          </div>

          {/* Read Aloud Button */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              id="care-read-aloud-btn"
              onClick={isSpeaking ? stopSpeaking : handleReadAloud}
              className={`p-3 rounded-xl border flex items-center gap-2 text-sm sm:text-base font-bold cursor-pointer transition-all ${
                isSpeaking
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : 'bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-800 border-[#d8d3c7]'
              }`}
              aria-label="Read Nearby Care instructions aloud"
            >
              {isSpeaking ? (
                <>
                  <Square className="w-4 h-4 text-amber-900 fill-current" />
                  <span>{language === 'hi' ? 'बोलना रोकें' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#0f766e]" />
                  <span>{language === 'hi' ? 'सुनें' : 'Read Aloud'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Reassuring Privacy Notice */}
        <div className="mt-4 pt-4 border-t border-teal-100 flex items-start gap-2 text-stone-600 text-xs sm:text-sm font-medium">
          <ShieldCheck className="w-4 h-4 text-[#0f766e] shrink-0 mt-0.5" />
          <span>
            {language === 'hi'
              ? 'गोपनीयता सूचना: मित्रा वन को केवल नजदीकी अस्पताल खोजने के लिए आपके स्थान की आवश्यकता है। हम आपकी सटीक लोकेशन को कभी सेव नहीं करते हैं।'
              : 'Privacy Note: MITRA ONE needs your location only to find nearby care. Your precise location is never permanently saved or shared.'}
          </span>
        </div>
      </div>

      {/* 3. Main Interactive View Container */}

      {/* VIEW 1: Initial Prompt (Explicit Permission Request) */}
      {viewState === 'prompt' && (
        <div className="bg-white rounded-3xl border border-[#d8d3c7] p-6 sm:p-10 shadow-xs space-y-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#f0fdfa] text-[#0f766e] border-2 border-[#99f6e4] flex items-center justify-center mx-auto shadow-sm">
            <Compass className="w-10 h-10 animate-pulse" strokeWidth={2} />
          </div>

          <div className="space-y-3 max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-[#0f2942]">
              {language === 'hi' ? 'आप कैसे खोजना चाहेंगे?' : 'How would you like to search?'}
            </h3>
            <p className="text-base sm:text-lg text-stone-700 font-semibold leading-relaxed">
              {language === 'hi'
                ? 'अपने फोन या कंप्यूटर की लोकेशन का उपयोग करके सबसे नजदीकी चिकित्सा सुविधाएं देखें, या अपने क्षेत्र का नाम टाइप करें।'
                : 'View the closest medical facilities using your device location, or type in your city or neighborhood name.'}
            </p>
          </div>

          {/* Action Buttons: ALLOW LOCATION or SEARCH MANUALLY */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-lg mx-auto pt-2">
            <button
              id="care-allow-location-btn"
              onClick={handleRequestLocation}
              className="px-6 py-4 rounded-2xl bg-[#0f766e] hover:bg-[#115e59] text-white font-black text-lg shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-3 border-2 border-[#0f766e]"
              aria-label="Allow Location to find nearby care"
            >
              <MapPin className="w-6 h-6" />
              <span>{language === 'hi' ? 'लोकेशन की अनुमति दें' : 'ALLOW LOCATION'}</span>
            </button>

            <button
              id="care-search-manually-btn"
              onClick={() => {
                playGentleChime('tap');
                setViewState('manual-search');
              }}
              className="px-6 py-4 rounded-2xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-800 font-black text-lg border-2 border-[#d8d3c7] transition-all cursor-pointer flex items-center justify-center gap-3"
              aria-label="Search manually by city or area"
            >
              <Search className="w-6 h-6 text-stone-600" />
              <span>{language === 'hi' ? 'क्षेत्र के नाम से खोजें' : 'SEARCH MANUALLY'}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            {language === 'hi'
              ? 'लोकेशन की अनुमति केवल एक बार इस खोज के लिए ली जाती है।'
              : 'Location permission is only requested when you tap Allow Location.'}
          </p>
        </div>
      )}

      {/* VIEW 2: Loading State */}
      {viewState === 'loading' && (
        <div className="bg-white rounded-3xl border border-[#d8d3c7] p-10 sm:p-14 text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center mx-auto animate-spin">
            <RefreshCw className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#0f2942]">
              {language === 'hi' ? 'नजदीकी अस्पताल खोजे जा रहे हैं...' : 'Finding nearby facilities...'}
            </h3>
            <p className="text-stone-600 font-semibold text-base">
              {language === 'hi'
                ? 'कृपया प्रतीक्षा करें। हम विश्वसनीय सरकारी व निजी स्वास्थ्य केंद्रों की सूची ला रहे हैं।'
                : 'Please wait a moment while we locate reliable healthcare facilities.'}
            </p>
          </div>
        </div>
      )}

      {/* VIEW 3: Error State (Permission Denied, Timeout, or Offline) */}
      {viewState === 'error' && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#0f2942]">
                {language === 'hi' ? 'खोज सहायता' : 'Search Guidance'}
              </h3>
              <p className="text-stone-700 font-bold text-base sm:text-lg">
                {errorMessage}
              </p>
            </div>
          </div>

          {/* Fallback Manual Search Input */}
          <div className="space-y-4 pt-2">
            <label htmlFor="care-error-search-input" className="block text-sm font-extrabold text-[#0f2942]">
              {language === 'hi' ? 'अपने शहर, क्षेत्र या कॉलोनी का नाम लिखें:' : 'Enter your city, area or locality:'}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  id="care-error-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleManualSearch(searchQuery);
                  }}
                  placeholder={language === 'hi' ? 'उदा. रोहिणी दिल्ली, बांद्रा मुंबई, सेक्टर 62...' : 'e.g. Connaught Place, Bandra, Jayanagar...'}
                  className="w-full px-5 py-4 rounded-2xl bg-[#fbf9f5] border-2 border-[#d8d3c7] text-stone-900 text-base sm:text-lg font-bold focus:bg-white focus:border-[#0f766e] focus:outline-hidden"
                />
              </div>
              <button
                id="care-error-search-submit-btn"
                onClick={() => handleManualSearch(searchQuery)}
                className="px-6 py-4 rounded-2xl bg-[#0f766e] hover:bg-[#115e59] text-white font-black text-base sm:text-lg shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                <span>{language === 'hi' ? 'अस्पताल खोजें' : 'Search Care'}</span>
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="pt-2">
              <span className="text-xs font-bold text-stone-500 block mb-2">
                {language === 'hi' ? 'या तुरंत किसी शहर पर टैप करें:' : 'Or tap a popular area:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {quickSearchAreas.slice(0, 6).map((area) => (
                  <button
                    key={area}
                    onClick={() => handleManualSearch(area)}
                    className="px-3.5 py-2 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-800 text-xs sm:text-sm font-bold border border-[#d8d3c7] cursor-pointer transition-colors"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-[#e7e3da]">
              <button
                onClick={() => setViewState('prompt')}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'hi' ? 'वापस जाएं' : 'Back to Options'}</span>
              </button>
              <button
                onClick={handleRequestLocation}
                className="px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0f766e] font-bold text-sm border border-teal-200 cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'hi' ? 'लोकेशन पुनः आज़माएं' : 'Retry Location'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Dedicated Manual Search View */}
      {viewState === 'manual-search' && (
        <div className="bg-white rounded-3xl border border-[#d8d3c7] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-[#0f2942]">
                {language === 'hi' ? 'अस्पताल या क्लिनिक खोजें' : 'Search for a Hospital or Clinic'}
              </h3>
              <p className="text-stone-600 font-medium text-sm sm:text-base">
                {language === 'hi'
                  ? 'अपना शहर, इलाका या पिनकोड दर्ज करें।'
                  : 'Enter your city, neighborhood or locality.'}
              </p>
            </div>
            <button
              onClick={() => setViewState('prompt')}
              className="p-2 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-700 font-bold text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="care-manual-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleManualSearch(searchQuery);
              }}
              placeholder={language === 'hi' ? 'उदा. साकेत नई दिल्ली, बांद्रा, इंदिरानगर...' : 'e.g. Saket Delhi, Bandra Mumbai, Jayanagar...'}
              className="flex-1 px-5 py-4 rounded-2xl bg-[#fbf9f5] border-2 border-[#d8d3c7] text-stone-900 text-base sm:text-lg font-bold focus:bg-white focus:border-[#0f766e] focus:outline-hidden"
              autoFocus
            />
            <button
              id="care-manual-search-submit-btn"
              onClick={() => handleManualSearch(searchQuery)}
              className="px-6 py-4 rounded-2xl bg-[#0f766e] hover:bg-[#115e59] text-white font-black text-base sm:text-lg shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              <span>{language === 'hi' ? 'खोजें' : 'Search'}</span>
            </button>
          </div>

          {/* Quick Select Buttons for common cities */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-stone-500 block uppercase tracking-wider">
              {language === 'hi' ? 'त्वरित क्षेत्र चयन:' : 'Quick Area Selection:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {quickSearchAreas.map((area) => (
                <button
                  key={area}
                  onClick={() => handleManualSearch(area)}
                  className="px-4 py-2.5 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-800 text-xs sm:text-sm font-bold border border-[#d8d3c7] transition-all cursor-pointer hover:border-[#0f766e]"
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 5: Results List (Senior-friendly Cards with Open Directions) */}
      {viewState === 'results' && (
        <div className="space-y-6">
          {/* Results Summary Bar & Controls */}
          <div className="bg-white rounded-2xl border border-[#d8d3c7] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ccfbf1] text-[#0f766e] flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  {language === 'hi' ? 'वर्तमान खोज क्षेत्र' : 'Showing Facilities Near'}
                </span>
                <span className="text-base sm:text-lg font-black text-[#0f2942]">
                  {currentLocationName || 'Nearby Area'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={() => {
                  playGentleChime('tap');
                  setViewState('manual-search');
                }}
                className="px-3.5 py-2 rounded-xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-800 text-xs sm:text-sm font-bold border border-[#d8d3c7] cursor-pointer flex items-center gap-1.5"
              >
                <Search className="w-4 h-4 text-stone-600" />
                <span>{language === 'hi' ? 'स्थान बदलें' : 'Change Area'}</span>
              </button>
              <button
                onClick={handleRequestLocation}
                className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0f766e] text-xs sm:text-sm font-bold border border-teal-200 cursor-pointer flex items-center gap-1.5"
                title="Refresh nearby facilities"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'hi' ? 'रिफ्रेश' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Filter Pills (All / Hospitals / Clinics / 24/7 Emergency) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: language === 'hi' ? 'सभी केंद्र' : 'All Facilities' },
              { id: 'hospital', label: language === 'hi' ? 'अस्पताल' : 'Hospitals' },
              { id: 'clinic', label: language === 'hi' ? 'क्लिनिक' : 'Clinics' },
              { id: 'emergency', label: language === 'hi' ? 'आपातकालीन (24/7)' : '24/7 Emergency' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playGentleChime('tap');
                  setFacilityFilter(tab.id as any);
                }}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer border ${
                  facilityFilter === tab.id
                    ? 'bg-[#0f766e] text-white border-[#0f766e] shadow-2xs'
                    : 'bg-white text-stone-700 border-[#d8d3c7] hover:bg-[#f5f1ea]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Strict Safety Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-stone-700 text-xs sm:text-sm font-medium flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {language === 'hi'
                ? 'महत्वपूर्ण सूचना: मित्रा वन किसी चिकित्सा स्थिति का निदान नहीं करता है और न ही किसी अस्पताल को बेहतर घोषित करता है। ये परिणाम दूरी के आधार पर सुविधा के लिए दिखाए गए हैं।'
                : 'Medical Notice: MITRA ONE does not diagnose conditions or rank medical quality. Facilities are listed simply by proximity for convenience.'}
            </span>
          </div>

          {/* Facilities List */}
          <div className="space-y-4" role="list">
            {filteredFacilities.map((facility, index) => {
              return (
                <div
                  key={facility.id}
                  id={`care-facility-card-${index}`}
                  role="listitem"
                  className="bg-white rounded-3xl border-2 border-[#e7e3da] hover:border-[#99f6e4] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-left"
                >
                  <div className="space-y-3 flex-1">
                    {/* Facility Type Badge & Distance */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                          facility.isEmergency
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : facility.type === 'Clinic'
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-teal-100 text-teal-800 border border-teal-200'
                        }`}
                      >
                        {facility.type}
                      </span>

                      {facility.distanceText && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-black">
                          <Compass className="w-3.5 h-3.5 text-stone-500" />
                          {facility.distanceText}
                        </span>
                      )}

                      {facility.statusText && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {facility.statusText}
                        </span>
                      )}
                    </div>

                    {/* Facility Name */}
                    <div>
                      <h4 className="text-xl sm:text-2xl font-black text-[#0f2942] tracking-tight">
                        {facility.name}
                      </h4>
                      <p className="text-sm sm:text-base font-semibold text-stone-600 mt-1 flex items-start gap-1.5">
                        <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        <span>{facility.address}</span>
                      </p>
                    </div>

                    {/* Phone Number / Contact */}
                    {facility.phone && (
                      <div className="flex items-center gap-2 pt-1 text-xs sm:text-sm font-bold text-stone-700">
                        <Phone className="w-4 h-4 text-[#0f766e]" />
                        <span>{facility.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions: Open Directions & Call */}
                  <div className="flex flex-col sm:flex-col gap-2.5 shrink-0 sm:w-48">
                    {/* Primary Button: OPEN DIRECTIONS (Opens in Google Maps / User's Map Service) */}
                    <a
                      id={`care-directions-btn-${index}`}
                      href={facility.directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#0f766e] hover:bg-[#115e59] text-white font-black text-sm sm:text-base shadow-sm transition-transform active:scale-98 cursor-pointer flex items-center justify-center gap-2 border border-[#0f766e] text-center"
                      aria-label={`Open directions to ${facility.name}`}
                    >
                      <NavigationIcon className="w-4 h-4 fill-current" />
                      <span>{language === 'hi' ? 'रास्ता देखें' : 'OPEN DIRECTIONS'}</span>
                    </a>

                    {/* Call facility button */}
                    {facility.phone && (
                      <a
                        id={`care-call-btn-${index}`}
                        href={`tel:${facility.phone.replace(/[^0-9+]/g, '') || '112'}`}
                        className="w-full py-3 px-4 rounded-2xl bg-[#f5f1ea] hover:bg-[#e7e3da] text-stone-800 font-extrabold text-xs sm:text-sm border border-[#d8d3c7] transition-colors cursor-pointer flex items-center justify-center gap-2 text-center"
                      >
                        <Phone className="w-3.5 h-3.5 text-stone-600" />
                        <span>{language === 'hi' ? 'कॉल करें' : 'Call Facility'}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
