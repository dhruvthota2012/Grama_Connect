import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { speakText } from '../utils/speechGuidance';
import { Volume2 } from 'lucide-react';
import { AgriculturalHeroBanner } from './AgriculturalHeroBanner';

interface HomeMenuProps {
  language: Language;
  onSelectOption: (option: 'LOOKING_FOR_WORK' | 'NEED_SERVICES') => void;
}

export const HomeMenu: React.FC<HomeMenuProps> = ({ language, onSelectOption }) => {
  const t = translations[language];
  const [selectedOption, setSelectedOption] = useState<'LOOKING_FOR_WORK' | 'NEED_SERVICES' | null>(null);
  const armedOptionRef = useRef<'LOOKING_FOR_WORK' | 'NEED_SERVICES' | null>(null);

  // Screen entrance guidance
  useEffect(() => {
    const intro =
      language === 'te'
        ? 'గ్రామ కనెక్ట్‌కు స్వాగతం. పని కావాలా లేక వ్యవసాయ సేవలు కావాలా? ఒకదాన్ని ఎంచుకోండి.'
        : language === 'hi'
        ? 'ग्राम कनेक्ट में आपका स्वागत है। काम चाहिए या कृषि सेवाएं चाहिए? एक विकल्प चुनें।'
        : 'Welcome to GramaConnect. Choose an option: looking for work, or need agricultural services.';
    speakText(intro, language);
  }, [language]);

  const getSpokenText = (option: 'LOOKING_FOR_WORK' | 'NEED_SERVICES') => {
    if (option === 'LOOKING_FOR_WORK') {
      return language === 'te'
        ? 'నాకు పని కావాలి లేదా సేవలు అందించడానికి'
        : language === 'hi'
        ? 'मुझे काम चाहिए या सेवाएं प्रदान करनी हैं'
        : 'I am looking for work or offering services';
    } else {
      return language === 'te'
        ? 'నాకు వ్యవసాయ సేవలు కావాలి'
        : language === 'hi'
        ? 'मुझे कृषि सेवाएं चाहिए'
        : 'I need agricultural services';
    }
  };

  const handleCardClick = (option: 'LOOKING_FOR_WORK' | 'NEED_SERVICES') => {
    if (armedOptionRef.current === option) {
      // Second tap: open screen
      onSelectOption(option);
    } else {
      // First tap: highlight and announce voice immediately
      armedOptionRef.current = option;
      setSelectedOption(option);
      speakText(getSpokenText(option), language).catch((err) =>
        console.warn('[Speech Notice]:', err?.message || err)
      );
    }
  };

  // Number key shortcuts: 1 for Work, 2 for Services (two-tap via keyboard too!)
  useKeyboardNav({
    '1': () => handleCardClick('LOOKING_FOR_WORK'),
    '2': () => handleCardClick('NEED_SERVICES'),
  });

  return (
    <div className="kiosk-screen home-menu-screen">
      <AgriculturalHeroBanner language={language} compact={true} />

      <div className="shell">
        <div className="screen-header-center">
          <h2 className="welcome-title">{t.welcome}</h2>
          <p className="welcome-question">{t.whatWouldYouLike}</p>
          <p className="voice-guidance-instruction">
            <Volume2 size={18} />
            <span>{t.twoTapHint}</span>
          </p>
        </div>

        <div className="choices kiosk-menu-grid">
          {/* Option 1: Looking for Work / Offer Services */}
          <div
            className={`card g kiosk-menu-card choice-work ${selectedOption === 'LOOKING_FOR_WORK' ? 'selected-highlight on' : ''}`}
            onClick={() => handleCardClick('LOOKING_FOR_WORK')}
            role="button"
            tabIndex={0}
          >
            <div className="key card-number-badge">1</div>
            <div className="medal card-illustration-wrap">
              <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
                <circle cx="48" cy="26" r="13" fill="#8A5A3A" />
                <path d="M30 22Q48 2 66 22Z" fill="#F3C969" />
                <path d="M28 86V60Q28 44 48 44T68 60V86Z" fill="#279653" />
                <path d="M68 58q14-6 20 6" stroke="#8A5A3A" strokeWidth="6" fill="none" strokeLinecap="round" />
                <path d="M88 62c-2-9 4-14 4-14s6 6 2 14" fill="#176B45" />
              </svg>
            </div>

            <div className="card-details">
              <h3 className="card-main-title">{t.optionWork}</h3>
              <p className="card-desc">{t.optionWorkSub}</p>
            </div>

            <div className="go card-go-arrow" aria-hidden="true">→</div>

            {selectedOption === 'LOOKING_FOR_WORK' && (
              <div className="card-tap-again-footer">
                <span>{t.tapAgainToOpen}</span>
              </div>
            )}
          </div>

          {/* Option 2: Need Agricultural Services */}
          <div
            className={`card b kiosk-menu-card choice-services ${selectedOption === 'NEED_SERVICES' ? 'selected-highlight on' : ''}`}
            onClick={() => handleCardClick('NEED_SERVICES')}
            role="button"
            tabIndex={0}
          >
            <div className="key card-number-badge">2</div>
            <div className="medal card-illustration-wrap">
              <svg width="110" height="96" viewBox="0 0 110 96" aria-hidden="true">
                <rect x="8" y="46" width="14" height="22" rx="3" fill="#E8A91C" />
                <rect x="30" y="36" width="52" height="30" rx="8" fill="#C8553D" />
                <rect x="56" y="14" width="26" height="26" rx="5" fill="#A8412D" />
                <rect x="60" y="19" width="16" height="12" rx="2" fill="#EAF6FC" />
                <circle cx="40" cy="68" r="18" fill="#3B2A1E" />
                <circle cx="40" cy="68" r="8" fill="#F3C969" />
                <circle cx="84" cy="74" r="12" fill="#3B2A1E" />
                <circle cx="84" cy="74" r="5" fill="#F3C969" />
              </svg>
            </div>

            <div className="card-details">
              <h3 className="card-main-title">{t.optionService}</h3>
              <p className="card-desc">{t.optionServiceSub}</p>
            </div>

            <div className="go card-go-arrow" aria-hidden="true">→</div>

            {selectedOption === 'NEED_SERVICES' && (
              <div className="card-tap-again-footer">
                <span>{t.tapAgainToOpen}</span>
              </div>
            )}
          </div>
        </div>

        <div className="kiosk-footer-instructions">
          <p>
            👉 <strong>{t.twoTapHint}</strong> |{' '}
            {language === 'te'
              ? 'కీబోర్డ్ 1 లేదా 2 నొక్కండి'
              : language === 'hi'
              ? 'कीबोर्ड 1 या 2 दबाएं'
              : 'Press keyboard key 1 or 2'}
          </p>
        </div>
      </div>
    </div>
  );
};
