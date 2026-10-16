import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { AgriculturalIllustration } from '../assets/illustrations';
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
    if (selectedOption === option) {
      // Second tap: open screen
      onSelectOption(option);
    } else {
      // First tap: highlight and announce voice
      setSelectedOption(option);
      speakText(getSpokenText(option), language);
    }
  };

  // Number key shortcuts: 1 for Work, 2 for Services (two-tap via keyboard too!)
  useKeyboardNav({
    '1': () => handleCardClick('LOOKING_FOR_WORK'),
    '2': () => handleCardClick('NEED_SERVICES'),
  });

  return (
    <div className="kiosk-screen home-menu-screen">
      <div className="screen-header-center">
        <h2 className="welcome-title">{t.welcome}</h2>
        <p className="welcome-question">{t.whatWouldYouLike}</p>
        <p className="voice-guidance-instruction">
          <Volume2 size={18} />
          <span>{t.twoTapHint}</span>
        </p>
        <div className="kiosk-divider" />
      </div>

      <AgriculturalHeroBanner language={language} compact={true} />

      <div className="kiosk-menu-grid">
        {/* Option 1: Looking for Work / Offer Services */}
        <button
          type="button"
          className={`kiosk-menu-card choice-work ${selectedOption === 'LOOKING_FOR_WORK' ? 'selected-highlight' : ''}`}
          onClick={() => handleCardClick('LOOKING_FOR_WORK')}
        >
          <div className="card-top-bar">
            <span className="card-number-badge">1</span>
            {selectedOption === 'LOOKING_FOR_WORK' && (
              <div className="card-selected-top-controls">
                <span className="tap-confirm-badge">{t.tapAgainToOpen}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="card-audio-replay-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(getSpokenText('LOOKING_FOR_WORK'), language);
                  }}
                  title={t.replayVoice}
                >
                  <Volume2 size={18} />
                </span>
              </div>
            )}
          </div>

          <div className="card-illustration-wrap">
            <AgriculturalIllustration name="worker_sowing" size={130} />
          </div>

          <div className="card-details">
            <h3 className="card-main-title">{t.optionWork}</h3>
            <p className="card-desc">{t.optionWorkSub}</p>
          </div>

          <div className="card-go-arrow" aria-hidden="true">→</div>

          {selectedOption === 'LOOKING_FOR_WORK' && (
            <div className="card-tap-again-footer">
              <span>{t.tapAgainToOpen}</span>
            </div>
          )}
        </button>

        {/* Option 2: Need Agricultural Services */}
        <button
          type="button"
          className={`kiosk-menu-card choice-services ${selectedOption === 'NEED_SERVICES' ? 'selected-highlight' : ''}`}
          onClick={() => handleCardClick('NEED_SERVICES')}
        >
          <div className="card-top-bar">
            <span className="card-number-badge">2</span>
            {selectedOption === 'NEED_SERVICES' && (
              <div className="card-selected-top-controls">
                <span className="tap-confirm-badge">{t.tapAgainToOpen}</span>
                <span
                  role="button"
                  tabIndex={0}
                  className="card-audio-replay-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(getSpokenText('NEED_SERVICES'), language);
                  }}
                  title={t.replayVoice}
                >
                  <Volume2 size={18} />
                </span>
              </div>
            )}
          </div>

          <div className="card-illustration-wrap">
            <AgriculturalIllustration name="main_tractor" size={130} />
          </div>

          <div className="card-details">
            <h3 className="card-main-title">{t.optionService}</h3>
            <p className="card-desc">{t.optionServiceSub}</p>
          </div>

          <div className="card-go-arrow" aria-hidden="true">→</div>

          {selectedOption === 'NEED_SERVICES' && (
            <div className="card-tap-again-footer">
              <span>{t.tapAgainToOpen}</span>
            </div>
          )}
        </button>
      </div>

      <div className="kiosk-footer-instructions">
        <p>
          👉 <strong>{t.twoTapHint}</strong> | {language === 'te' ? 'కీబోర్డ్ 1 లేదా 2 నొక్కండి' : language === 'hi' ? 'कीबोर्ड 1 या 2 दबाएं' : 'Press keyboard key 1 or 2'}
        </p>
      </div>
    </div>
  );
};
