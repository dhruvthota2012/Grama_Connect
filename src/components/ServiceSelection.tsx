import React, { useState } from 'react';
import { Language, MainServiceType } from '../types';
import { translations } from '../i18n/translations';
import { AgriculturalIllustration } from '../assets/illustrations';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { speakText } from '../utils/speechGuidance';
import { Volume2 } from 'lucide-react';

interface ServiceSelectionProps {
  language: Language;
  onSelectService: (service: MainServiceType) => void;
}

export const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  language,
  onSelectService,
}) => {
  const t = translations[language];
  const [selectedService, setSelectedService] = useState<MainServiceType | null>(null);

  const services: {
    type: MainServiceType;
    number: number;
    titleEn: string;
    titleTe: string;
    titleHi: string;
    caption: { en: string; te: string; hi: string };
    desc: string;
    illustrationKey: string;
  }[] = [
    {
      type: 'person',
      number: 1,
      titleEn: 'PERSON / WORKERS',
      titleTe: 'వ్యవసాయ కూలీలు',
      titleHi: 'कृषि मजदूर',
      caption: { en: 'Labour Services', te: 'కూలీల సేవలు', hi: 'श्रमिक सेवाएं' },
      desc: t.servicePersonDesc,
      illustrationKey: 'main_person',
    },
    {
      type: 'tractor',
      number: 2,
      titleEn: 'TRACTOR & ATTACHMENTS',
      titleTe: 'ట్రాక్టర్ & పరికరాలు',
      titleHi: 'ट्रैक्टर और उपकरण',
      caption: { en: 'Tractor Implements', te: 'ట్రాక్టర్ పరికరాలు', hi: 'ट्रैक्टर उपकरण' },
      desc: t.serviceTractorDesc,
      illustrationKey: 'main_tractor',
    },
    {
      type: 'harvester',
      number: 3,
      titleEn: 'HARVESTER MACHINES',
      titleTe: 'హార్వెస్టర్ యంత్రాలు',
      titleHi: 'हार्वेस्टर मशीनें',
      caption: { en: 'Harvesting Machines', te: 'కోత యంత్రాలు', hi: 'कटाई मशीनें' },
      desc: t.serviceHarvesterDesc,
      illustrationKey: 'main_harvester',
    },
    {
      type: 'mini_truck',
      number: 4,
      titleEn: 'MINI TRUCK TRANSPORT',
      titleTe: 'మినీ ట్రక్ రవాణా',
      titleHi: 'मिनी ट्रक परिवहन',
      caption: { en: 'Transport Vehicles', te: 'రవాణా వాహనాలు', hi: 'परिवहन वाहन' },
      desc: t.serviceMiniTruckDesc,
      illustrationKey: 'main_mini_truck',
    },
  ];

  const getSpokenText = (svc: (typeof services)[0]) => {
    const title = language === 'te' ? svc.titleTe : language === 'hi' ? svc.titleHi : svc.titleEn;
    if (language === 'te') {
      return `${title} ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.`;
    }
    if (language === 'hi') {
      return `${title} चुना गया। विशिष्ट कार्य चुनने के लिए दोबारा टैप करें।`;
    }
    return `Selected ${title}. Tap again to choose the specific agricultural work.`;
  };

  const handleCardClick = (serviceType: MainServiceType) => {
    const svc = services.find((s) => s.type === serviceType);
    if (!svc) return;

    if (selectedService === serviceType) {
      // Second tap: Open subcategory screen
      onSelectService(serviceType);
    } else {
      // First tap: Highlight and speak
      setSelectedService(serviceType);
      speakText(getSpokenText(svc), language);
    }
  };

  // Number key shortcuts 1 - 4 with two-tap flow
  useKeyboardNav({
    '1': () => handleCardClick('person'),
    '2': () => handleCardClick('tractor'),
    '3': () => handleCardClick('harvester'),
    '4': () => handleCardClick('mini_truck'),
  });

  return (
    <div className="kiosk-screen service-selection-screen">
      <div className="screen-header">
        <h2 className="screen-title">{t.selectServiceHeading}</h2>
        <p className="screen-subtitle">{t.selectServiceSub}</p>
        <p className="voice-guidance-instruction">
          <Volume2 size={18} />
          <span>{t.twoTapHint}</span>
        </p>
      </div>

      <div className="services-grid-4">
        {services.map((svc) => {
          const isSelected = selectedService === svc.type;
          const displayTitle = language === 'te' ? svc.titleTe : language === 'hi' ? svc.titleHi : svc.titleEn;
          const displayCaption = language === 'te' ? svc.caption.te : language === 'hi' ? svc.caption.hi : svc.caption.en;

          return (
            <button
              key={svc.type}
              type="button"
              className={`service-card ${isSelected ? 'selected-highlight' : ''}`}
              onClick={() => handleCardClick(svc.type)}
            >
              <div className="service-card-top">
                <span className="card-number-badge">{svc.number}</span>
                {isSelected ? (
                  <div className="card-selected-top-controls">
                    <span className="tap-confirm-badge">{t.tapAgainToOpen}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="card-audio-replay-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(getSpokenText(svc), language);
                      }}
                      title={t.replayVoice}
                    >
                      <Volume2 size={18} />
                    </span>
                  </div>
                ) : (
                  <span className="card-hint-badge">[ KEY {svc.number} ]</span>
                )}
              </div>

              <div className="service-illustration-box">
                <AgriculturalIllustration name={svc.illustrationKey} size={110} />
                <span className="illus-caption">{displayCaption}</span>
              </div>

              <div className="service-card-body">
                <h3 className="service-card-title">{displayTitle}</h3>
                <p className="service-card-desc">{svc.desc}</p>
              </div>

              {isSelected && (
                <div className="card-tap-again-footer">
                  <span>{t.tapAgainToOpen}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="kiosk-footer-instructions">
        <p>
          💡 <strong>{t.twoTapHint}</strong> | {language === 'te' ? 'కీబోర్డ్ 1 నుండి 4 నొక్కండి' : language === 'hi' ? 'कीबोर्ड 1 से 4 दबाएं' : 'Press keyboard key 1 - 4'}
        </p>
      </div>
    </div>
  );
};
