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
    colorClass: string;
    titleEn: string;
    titleTe: string;
    titleHi: string;
    tagEn: string;
    tagTe: string;
    tagHi: string;
    desc: string;
  }[] = [
    {
      type: 'person',
      number: 1,
      colorClass: 'c1',
      titleEn: 'Person / Workers',
      titleTe: 'వ్యవసాయ కూలీలు',
      titleHi: 'कृषि मजदूर',
      tagEn: 'Press 1',
      tagTe: '1 నొక్కండి',
      tagHi: '1 दबाएं',
      desc: t.servicePersonDesc || 'Skilled agricultural labourers for sowing, harvesting, weeding and picking.',
    },
    {
      type: 'tractor',
      number: 2,
      colorClass: 'c2',
      titleEn: 'Tractor & Attachments',
      titleTe: 'ట్రాక్టర్ & పరికరాలు',
      titleHi: 'ट्रैक्टर और उपकरण',
      tagEn: 'Press 2',
      tagTe: '2 నొక్కండి',
      tagHi: '2 दबाएं',
      desc: t.serviceTractorDesc || 'Tractors with trolleys, ploughs, rotavators, seeders and land levellers.',
    },
    {
      type: 'harvester',
      number: 3,
      colorClass: 'c3',
      titleEn: 'Harvester Machines',
      titleTe: 'హార్వెస్టర్ యంత్రాలు',
      titleHi: 'हार्वेस्टर मशीनें',
      tagEn: 'Press 3',
      tagTe: '3 నొక్కండి',
      tagHi: '3 दबाएं',
      desc: t.serviceHarvesterDesc || 'Combine harvesters, paddy cutters, reapers and threshers with operators.',
    },
    {
      type: 'mini_truck',
      number: 4,
      colorClass: 'c4',
      titleEn: 'Mini Truck Transport',
      titleTe: 'మినీ ట్రక్ రవాణా',
      titleHi: 'मिनी ट्रक परिवहन',
      tagEn: 'Press 4',
      tagTe: '4 నొక్కండి',
      tagHi: '4 दबाएं',
      desc: t.serviceMiniTruckDesc || 'Small agricultural transport vehicles for crops, fertilizers and market haulage.',
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
      <div className="shell">
        <div className="screen-header">
          <h2 className="screen-title">{t.selectServiceHeading}</h2>
          <p className="screen-subtitle">{t.selectServiceSub}</p>
          <p className="voice-guidance-instruction">
            <Volume2 size={18} />
            <span>{t.twoTapHint}</span>
          </p>
        </div>

        <div className="grid services-grid-4">
          {services.map((svc) => {
            const isSelected = selectedService === svc.type;
            const displayTitle = language === 'te' ? svc.titleTe : language === 'hi' ? svc.titleHi : svc.titleEn;
            const defaultTag = language === 'te' ? svc.tagTe : language === 'hi' ? svc.tagHi : svc.tagEn;

            return (
              <article
                key={svc.type}
                className={`pc ${svc.colorClass} service-card ${isSelected ? 'selected-highlight on' : ''}`}
                onClick={() => handleCardClick(svc.type)}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
              >
                {/* 230px Illustrated Art Header */}
                <div className="art card-illustration-wrap">
                  {svc.type === 'person' && (
                    <svg viewBox="0 0 300 230" aria-hidden="true">
                      <rect width="300" height="230" fill="#CFEFD8" />
                      <circle cx="240" cy="50" r="26" fill="#FFE590" />
                      <path d="M0 120Q80 90 160 118T300 108V230H0Z" fill="#7BCB8D" />
                      <path d="M0 160Q100 130 200 160T300 150V230H0Z" fill="#279653" />
                      <g stroke="#176B45" strokeWidth="3">
                        <path d="M20 230l30-60M70 230l30-60M120 230l30-60M170 230l30-60" />
                      </g>
                      <circle cx="150" cy="96" r="17" fill="#8A5A3A" />
                      <path d="M126 90Q150 66 174 90Z" fill="#F3C969" />
                      <path d="M122 190V132Q122 112 150 112T178 132V190Z" fill="#fff" />
                      <path d="M122 190V150h56v40Z" fill="#43B5E8" />
                    </svg>
                  )}

                  {svc.type === 'tractor' && (
                    <svg viewBox="0 0 300 230" aria-hidden="true">
                      <rect width="300" height="230" fill="#FBE3CF" />
                      <circle cx="60" cy="52" r="24" fill="#FFD25A" />
                      <path d="M0 130Q90 100 170 128T300 118V230H0Z" fill="#B97A52" />
                      <path d="M0 170Q100 140 200 170T300 160V230H0Z" fill="#8A5A3A" />
                      <g stroke="#6F4528" strokeWidth="3" opacity=".6">
                        <path d="M0 190Q150 170 300 190M0 212Q150 194 300 212" />
                      </g>
                      <rect x="70" y="124" width="96" height="40" rx="9" fill="#C8553D" />
                      <rect x="118" y="96" width="44" height="34" rx="7" fill="#A8412D" />
                      <rect x="124" y="102" width="26" height="18" rx="3" fill="#EAF6FC" />
                      <circle cx="96" cy="168" r="28" fill="#3B2A1E" />
                      <circle cx="96" cy="168" r="11" fill="#F3C969" />
                      <circle cx="156" cy="174" r="17" fill="#3B2A1E" />
                      <circle cx="156" cy="174" r="7" fill="#F3C969" />
                      <rect x="34" y="150" width="38" height="24" rx="4" fill="#E8A91C" />
                    </svg>
                  )}

                  {svc.type === 'harvester' && (
                    <svg viewBox="0 0 300 230" aria-hidden="true">
                      <rect width="300" height="230" fill="#FFF0C4" />
                      <circle cx="244" cy="48" r="26" fill="#FFD25A" />
                      <path d="M0 120Q100 96 200 120T300 112V230H0Z" fill="#F0CF78" />
                      <path d="M0 160Q100 136 200 160T300 152V230H0Z" fill="#E8B84A" />
                      <g stroke="#C99A2E" strokeWidth="2">
                        <path d="M0 182H300M0 204H300" />
                      </g>
                      <rect x="86" y="116" width="120" height="48" rx="8" fill="#E8A91C" />
                      <rect x="118" y="92" width="52" height="38" rx="6" fill="#F7CE4F" />
                      <rect x="126" y="99" width="36" height="22" rx="3" fill="#EAF6FC" />
                      <rect x="44" y="140" width="44" height="30" rx="4" fill="#C98F12" />
                      <circle cx="64" cy="132" r="18" fill="none" stroke="#9A6A0A" strokeWidth="5" strokeDasharray="7 5" />
                      <circle cx="120" cy="170" r="24" fill="#3B2A1E" />
                      <circle cx="120" cy="170" r="9" fill="#F3C969" />
                      <circle cx="188" cy="174" r="16" fill="#3B2A1E" />
                    </svg>
                  )}

                  {svc.type === 'mini_truck' && (
                    <svg viewBox="0 0 300 230" aria-hidden="true">
                      <rect width="300" height="230" fill="#D5EAFA" />
                      <circle cx="60" cy="50" r="24" fill="#FFE590" />
                      <path d="M0 120Q100 96 200 120T300 112V230H0Z" fill="#7BCB8D" />
                      <path d="M0 150H300V230H0Z" fill="#3FA56E" />
                      <path d="M0 178H300V214H0Z" fill="#E7D2A6" />
                      <g stroke="#fff" strokeWidth="4" strokeDasharray="16 12">
                        <path d="M0 196H300" />
                      </g>
                      <rect x="60" y="116" width="100" height="56" rx="6" fill="#F0B91C" />
                      <path d="M70 116q12-22 26-8t30-6 26 8" fill="#CBA25E" />
                      <rect x="160" y="130" width="62" height="42" rx="8" fill="#1B6FC4" />
                      <rect x="172" y="137" width="30" height="18" rx="3" fill="#EAF6FC" />
                      <circle cx="92" cy="176" r="20" fill="#3B2A1E" />
                      <circle cx="92" cy="176" r="8" fill="#F3C969" />
                      <circle cx="196" cy="176" r="20" fill="#3B2A1E" />
                      <circle cx="196" cy="176" r="8" fill="#F3C969" />
                    </svg>
                  )}

                  <div className="num card-number-badge">{svc.number}</div>

                  {isSelected && (
                    <div
                      className="card-audio-replay-badge"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(getSpokenText(svc), language);
                      }}
                      title={t.replayVoice}
                      role="button"
                      tabIndex={0}
                    >
                      <Volume2 size={16} />
                    </div>
                  )}
                </div>

                {/* Bottom Body */}
                <div className="body card-details">
                  <h3 className="service-card-title">{displayTitle}</h3>
                  <p className="service-card-desc">{svc.desc}</p>
                  <div className="foot card-footer-row">
                    <span className="tag">
                      {isSelected ? t.tapAgainToOpen : defaultTag}
                    </span>
                    <span className="go card-go-arrow" aria-hidden="true">→</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="kiosk-footer-instructions">
          <p>
            💡 <strong>{t.twoTapHint}</strong> |{' '}
            {language === 'te'
              ? 'కీబోర్డ్ 1 నుండి 4 నొక్కండి'
              : language === 'hi'
              ? 'कीबोर्ड 1 से 4 दबाएं'
              : 'Press keyboard key 1 - 4'}
          </p>
        </div>
      </div>
    </div>
  );
};
