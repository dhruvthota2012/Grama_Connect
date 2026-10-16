import React from 'react';
import { Language } from '../types';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { speakText } from '../utils/speechGuidance';
import { AgriculturalHeroBanner } from './AgriculturalHeroBanner';

interface LanguageSelectionProps {
  currentLanguage: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({
  currentLanguage,
  onSelectLanguage,
}) => {
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
      {/* 1. Paper-Cut Layered Sunrise Hero Banner (780px cinematic dawn) */}
      <AgriculturalHeroBanner language={currentLanguage} compact={false} />

      {/* 2. Floating Language Tiles Bar Overlapping Hero Bottom Edge (-84px) */}
      <div className="shell">
        <div className="lang">
          <h3>
            Select your language
            <small>భాషను ఎంచుకోండి · अपनी भाषा चुनें</small>
          </h3>
          <button
            type="button"
            className={`tile t1 ${currentLanguage === 'en' ? 'on tile-active' : ''}`}
            onClick={() => handleLanguageChoice('en')}
            aria-label="Select English language"
          >
            <b>A</b>
            <span>English</span>
          </button>
          <button
            type="button"
            className={`tile t2 ${currentLanguage === 'te' ? 'on tile-active' : ''}`}
            onClick={() => handleLanguageChoice('te')}
            aria-label="తెలుగు భాషను ఎంచుకోండి"
          >
            <b lang="te">అ</b>
            <span lang="te">తెలుగు</span>
          </button>
          <button
            type="button"
            className={`tile t3 ${currentLanguage === 'hi' ? 'on tile-active' : ''}`}
            onClick={() => handleLanguageChoice('hi')}
            aria-label="हिन्दी भाषा चुनें"
          >
            <b lang="hi">अ</b>
            <span lang="hi">हिन्दी</span>
          </button>
        </div>

        {/* 3. Touch & Keyboard guidance instruction bar */}
        <div className="kiosk-instructions-bar">
          <p>
            💡 <strong>Touch screen</strong> to select, or press keyboard key <strong>1</strong>,{' '}
            <strong>2</strong>, or <strong>3</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
