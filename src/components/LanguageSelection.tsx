import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { speakText } from '../utils/speechGuidance';
import { AgriculturalHeroBanner } from './AgriculturalHeroBanner';
import { MapPin, Sparkles } from 'lucide-react';

interface LanguageSelectionProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
  const t = translations[currentLanguage];

  const handleLanguageChoice = (lang: Language) => {
    onSelectLanguage(lang);
    if (lang === 'en') {
      speakText('Language selected: English. Welcome to GramaConnect.', 'en');
    } else if (lang === 'te') {
      speakText('భాష ఎంపిక చేయబడింది: తెలుగు. గ్రామకనెక్ట్‌కి స్వాగతం.', 'te');
    } else if (lang === 'hi') {
      speakText('भाषा चुनी गई: हिन्दी। ग्रामकनेक्ट में आपका स्वागत है।', 'hi');
    }
  };

  // Number key shortcuts: 1 for English, 2 for Telugu, 3 for Hindi
  useKeyboardNav({
    '1': () => handleLanguageChoice('en'),
    '2': () => handleLanguageChoice('te'),
    '3': () => handleLanguageChoice('hi'),
  });

  return (
    <div className="kiosk-screen language-select-screen">
      {/* 1. Visually engaging heading area with location badge */}
      <div className="screen-header-center">
        <div className="welcome-location-badge">
          <span className="location-pulse-dot" aria-hidden="true" />
          <MapPin size={16} className="location-pin-icon" />
          <span className="location-name-text">
            {currentLanguage === 'te'
              ? 'రాంపూర్ గ్రామ పంచాయతీ కియోస్క్ కేంద్రం'
              : currentLanguage === 'hi'
              ? 'रामपुर ग्राम पंचायत कियोस्क केंद्र'
              : 'Rampur Gram Panchayat Kiosk Center'}
          </span>
          <span className="badge-kiosk-sim">
            <span>{t.simNotice}</span>
          </span>
        </div>

        <h1 className="main-display-title">
          <span className="title-highlight">GRAMA</span>CONNECT
        </h1>
        <p className="main-display-subtitle">{t.appSubtitle}</p>
        <div className="kiosk-divider" />
        <h2 className="prompt-title">
          <Sparkles size={20} className="prompt-sparkle" />
          <span>Select your language / భాషను ఎంచుకోండి / अपनी भाषा चुनें</span>
        </h2>
      </div>

      {/* 2. Official GramaConnect Agricultural Hero Banner */}
      <AgriculturalHeroBanner language={currentLanguage} compact={true} />

      {/* 3. Premium Interactive Language Cards */}
      <div className="language-cards-container three-col-grid">
        {/* Option 1: English */}
        <button
          type="button"
          className={`kiosk-selection-card lang-card ${
            currentLanguage === 'en' ? 'lang-card-active' : ''
          }`}
          onClick={() => handleLanguageChoice('en')}
          aria-label="Select English language"
        >
          <div className="card-number-badge">1</div>
          <div className="card-cultural-icon" aria-hidden="true">🌾</div>
          <div className="card-content-center">
            <span className="lang-native-title">English</span>
            <span className="lang-sub-title">STANDARD ENGLISH</span>
            <div className="lang-card-action">
              <span className="card-action-hint">[ Press Key 1 / Touch ]</span>
            </div>
          </div>
        </button>

        {/* Option 2: Telugu */}
        <button
          type="button"
          className={`kiosk-selection-card lang-card ${
            currentLanguage === 'te' ? 'lang-card-active' : ''
          }`}
          onClick={() => handleLanguageChoice('te')}
          aria-label="తెలుగు భాషను ఎంచుకోండి"
        >
          <div className="card-number-badge">2</div>
          <div className="card-cultural-icon" aria-hidden="true">🌿</div>
          <div className="card-content-center">
            <span className="lang-native-title">తెలుగు</span>
            <span className="lang-sub-title">TELUGU</span>
            <div className="lang-card-action">
              <span className="card-action-hint">[ నంబర్ 2 నొక్కండి / తాకండి ]</span>
            </div>
          </div>
        </button>

        {/* Option 3: Hindi */}
        <button
          type="button"
          className={`kiosk-selection-card lang-card ${
            currentLanguage === 'hi' ? 'lang-card-active' : ''
          }`}
          onClick={() => handleLanguageChoice('hi')}
          aria-label="हिन्दी भाषा चुनें"
        >
          <div className="card-number-badge">3</div>
          <div className="card-cultural-icon" aria-hidden="true">🚜</div>
          <div className="card-content-center">
            <span className="lang-native-title">हिन्दी</span>
            <span className="lang-sub-title">HINDI</span>
            <div className="lang-card-action">
              <span className="card-action-hint">[ नंबर 3 दबाएं / छुएं ]</span>
            </div>
          </div>
        </button>
      </div>

      {/* 4. Touch & Keyboard guidance instruction bar */}
      <div className="kiosk-instructions-bar">
        <p>
          💡 <strong>Touch screen</strong> to select, or press keyboard key <strong>1</strong>,{' '}
          <strong>2</strong>, or <strong>3</strong>
        </p>
      </div>
    </div>
  );
};
