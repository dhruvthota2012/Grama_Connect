import React, { useState } from 'react';
import { Language, MainServiceType } from '../types';
import { translations } from '../i18n/translations';
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
    categoryClass: string;
    titleEn: string;
    titleTe: string;
    titleHi: string;
    caption: { en: string; te: string; hi: string };
    desc: string;
  }[] = [
    {
      type: 'person',
      number: 1,
      categoryClass: 'svc-worker',
      titleEn: 'PERSON / WORKERS',
      titleTe: 'వ్యవసాయ కూలీలు',
      titleHi: 'कृषि मजदूर',
      caption: { en: 'Labour Services', te: 'కూలీల సేవలు', hi: 'श्रमिक सेवाएं' },
      desc: t.servicePersonDesc,
    },
    {
      type: 'tractor',
      number: 2,
      categoryClass: 'svc-tractor',
      titleEn: 'TRACTOR & ATTACHMENTS',
      titleTe: 'ట్రాక్టర్ & పరికరాలు',
      titleHi: 'ट्रैक्टर और उपकरण',
      caption: { en: 'Tractor Implements', te: 'ట్రాక్టర్ పరికరాలు', hi: 'ट्रैक्टर उपकरण' },
      desc: t.serviceTractorDesc,
    },
    {
      type: 'harvester',
      number: 3,
      categoryClass: 'svc-harvester',
      titleEn: 'HARVESTER MACHINES',
      titleTe: 'హార్వెస్టర్ యంత్రాలు',
      titleHi: 'हार्वेस्टर मशीनें',
      caption: { en: 'Harvesting Machines', te: 'కోత యంత్రాలు', hi: 'कटाई मशीनें' },
      desc: t.serviceHarvesterDesc,
    },
    {
      type: 'mini_truck',
      number: 4,
      categoryClass: 'svc-truck',
      titleEn: 'MINI TRUCK TRANSPORT',
      titleTe: 'మినీ ట్రక్ రవాణా',
      titleHi: 'मिनी ट्रक परिवहन',
      caption: { en: 'Transport Vehicles', te: 'రవాణా వాహనాలు', hi: 'परिवहन वाहन' },
      desc: t.serviceMiniTruckDesc,
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

          return (
            <button
              key={svc.type}
              type="button"
              className={`service-card ${svc.categoryClass} ${isSelected ? 'selected-highlight' : ''}`}
              onClick={() => handleCardClick(svc.type)}
            >
              <div className="service-card-top">
                <span className="card-number-badge">{svc.number}</span>
                {isSelected && (
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
                )}
              </div>

              <div className="card-illustration-wrap">
                {svc.type === 'person' && (
                  <svg width="86" height="86" viewBox="0 0 96 96" aria-hidden="true">
                    <circle cx="48" cy="26" r="13" fill="#8A5A3A" />
                    <path d="M30 22Q48 2 66 22Z" fill="#F3C969" />
                    <path d="M28 86V60Q28 44 48 44T68 60V86Z" fill="#279653" />
                    <path d="M68 58q14-6 20 6" stroke="#8A5A3A" strokeWidth="6" fill="none" strokeLinecap="round" />
                    <path d="M88 62c-2-9 4-14 4-14s6 6 2 14" fill="#176B45" />
                  </svg>
                )}
                {svc.type === 'tractor' && (
                  <svg width="96" height="86" viewBox="0 0 110 96" aria-hidden="true">
                    <rect x="8" y="46" width="14" height="22" rx="3" fill="#E8A91C" />
                    <rect x="30" y="36" width="52" height="30" rx="8" fill="#C8553D" />
                    <rect x="56" y="14" width="26" height="26" rx="5" fill="#A8412D" />
                    <rect x="60" y="19" width="16" height="12" rx="2" fill="#EAF6FC" />
                    <circle cx="40" cy="68" r="18" fill="#3B2A1E" />
                    <circle cx="40" cy="68" r="8" fill="#F3C969" />
                    <circle cx="84" cy="74" r="12" fill="#3B2A1E" />
                    <circle cx="84" cy="74" r="5" fill="#F3C969" />
                  </svg>
                )}
                {svc.type === 'harvester' && (
                  <svg width="96" height="86" viewBox="0 0 110 96" aria-hidden="true">
                    <rect x="12" y="38" width="56" height="32" rx="8" fill="#E8A91C" />
                    <rect x="60" y="16" width="30" height="28" rx="6" fill="#C8890C" />
                    <rect x="64" y="20" width="22" height="14" rx="2" fill="#EAF6FC" />
                    <circle cx="16" cy="54" r="14" fill="#F3C969" stroke="#3B2A1E" strokeWidth="3" />
                    <circle cx="36" cy="70" r="18" fill="#3B2A1E" />
                    <circle cx="36" cy="70" r="8" fill="#F3C969" />
                    <circle cx="84" cy="72" r="14" fill="#3B2A1E" />
                    <circle cx="84" cy="72" r="6" fill="#F3C969" />
                  </svg>
                )}
                {svc.type === 'mini_truck' && (
                  <svg width="96" height="86" viewBox="0 0 110 96" aria-hidden="true">
                    <rect x="10" y="34" width="52" height="34" rx="6" fill="#43B5E8" />
                    <rect x="58" y="24" width="36" height="44" rx="8" fill="#174A8B" />
                    <rect x="66" y="28" width="22" height="18" rx="3" fill="#EAF6FC" />
                    <circle cx="32" cy="74" r="15" fill="#3B2A1E" />
                    <circle cx="32" cy="74" r="6" fill="#F3C969" />
                    <circle cx="80" cy="74" r="15" fill="#3B2A1E" />
                    <circle cx="80" cy="74" r="6" fill="#F3C969" />
                  </svg>
                )}
              </div>

              <div className="card-details">
                <h3 className="service-card-title">{displayTitle}</h3>
                <p className="service-card-desc">{svc.desc}</p>
              </div>

              <div className="card-go-arrow" aria-hidden="true">→</div>

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
