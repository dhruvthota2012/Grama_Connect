import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { AgriculturalIllustration } from '../assets/illustrations';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { speakText } from '../utils/speechGuidance';
import { Volume2 } from 'lucide-react';

interface ProviderHubProps {
  language: Language;
  onSelectAction: (
    action:
      | 'REGISTER_WORKER'
      | 'REGISTER_TRACTOR'
      | 'REGISTER_HARVESTER'
      | 'REGISTER_MINI_TRUCK'
      | 'PROVIDER_LOGIN'
  ) => void;
}

export const ProviderHub: React.FC<ProviderHubProps> = ({ language, onSelectAction }) => {
  const t = translations[language];
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const hubOptions: {
    id:
      | 'REGISTER_WORKER'
      | 'REGISTER_TRACTOR'
      | 'REGISTER_HARVESTER'
      | 'REGISTER_MINI_TRUCK'
      | 'PROVIDER_LOGIN';
    number: number;
    titleEn: string;
    titleTe: string;
    titleHi: string;
    descEn: string;
    descTe: string;
    descHi: string;
    illustrationKey: string;
    badgeEn: string;
    badgeTe: string;
    badgeHi: string;
    caption: { en: string; te: string; hi: string };
  }[] = [
    {
      id: 'REGISTER_WORKER',
      number: 1,
      titleEn: 'Register as Agricultural Worker',
      titleTe: 'వ్యవసాయ కూలీగా నమోదు చేసుకోండి',
      titleHi: 'कृषि मजदूर के रूप में पंजीकरण',
      descEn: 'Select your farm skills. Full name and 10-digit mobile number are mandatory for farmer contact',
      descTe: 'మీ వ్యవసాయ నైపుణ్యాలను ఎంచుకోండి. రైతులు సంప్రదించడానికి పూర్తి పేరు మరియు మొబైల్ నంబర్ తప్పనిసరి',
      descHi: 'अपने कृषि हुनर चुनें। किसानों से सीधे काम पाने हेतु नाम और मोबाइल नंबर अनिवार्य है',
      illustrationKey: 'worker_sowing',
      badgeEn: 'MANDATORY DETAILS',
      badgeTe: 'తప్పనిసరి వివరాలు',
      badgeHi: 'अनिवार्य विवरण',
      caption: { en: 'Worker Registration', te: 'కూలీ నమోదు', hi: 'श्रमिक पंजीकरण' },
    },
    {
      id: 'REGISTER_TRACTOR',
      number: 2,
      titleEn: 'Tractor Daily Registration (Valid Today Only)',
      titleTe: 'ట్రాక్టర్ రోజువారీ నమోదు (ఈ రోజు మాత్రమే)',
      titleHi: 'ट्रैक्टर दैनिक पंजीकरण (केवल आज के लिए मान्य)',
      descEn: 'Single daily registration valid for today only. Select your single active attachment (expires midnight)',
      descTe: 'ఈ రోజుకు మాత్రమే వర్తించే రోజువారీ నమోదు. ఒక పని పరికరాన్ని ఎంచుకోండి (అర్ధరాత్రికి ముగుస్తుంది)',
      descHi: 'केवल आज के लिए मान्य एकल दैनिक पंजीकरण। एक सक्रिय उपकरण चुनें (मध्यरात्रि में समाप्त होगा)',
      illustrationKey: 'main_tractor',
      badgeEn: 'DAILY REGISTRATION',
      badgeTe: 'రోజువారీ నమోదు',
      badgeHi: 'दैनिक पंजीकरण',
      caption: { en: 'Tractor Daily Registration', te: 'ట్రాక్టర్ రోజువారీ నమోదు', hi: 'ट्रैक्टर दैनिक पंजीकरण' },
    },
    {
      id: 'REGISTER_HARVESTER',
      number: 3,
      titleEn: 'Register a Crop Harvester',
      titleTe: 'పంట కోత హార్వెస్టర్‌ను నమోదు చేయండి',
      titleHi: 'फसल हार्वेस्टर पंजीकृत करें',
      descEn: 'List paddy combine, wheat harvester, or thresher with operator for seasonal work',
      descTe: 'వరి, గోధుమ కోత యంత్రాలు లేదా థ్రెషర్లను అద్దెకు ఇవ్వడానికి నమోదు చేయండి',
      descHi: 'धान, गेहूं कटाई कंबाइन या थ्रेशर किराए पर देने के लिए जोड़ें',
      illustrationKey: 'main_harvester',
      badgeEn: 'HARVESTER SERVICE',
      badgeTe: 'హార్వెస్టర్ సేవలు',
      badgeHi: 'हार्वेस्टर सेवा',
      caption: { en: 'Harvester Registration', te: 'హార్వెస్టర్ నమోదు', hi: 'हार्वेस्टर पंजीकरण' },
    },
    {
      id: 'REGISTER_MINI_TRUCK',
      number: 4,
      titleEn: 'Register a Mini-Truck for Transport',
      titleTe: 'మినీ ట్రక్ రవాణా వాహనాన్ని నమోదు చేయండి',
      titleHi: 'मिनी ट्रक परिवहन वाहन पंजीकृत करें',
      descEn: 'Offer farm-to-market goods transport for vegetables, grain bags, and fertilizers',
      descTe: 'కూరగాయలు, ధాన్యం బస్తాల మార్కెట్ రవాణా సేవల కోసం నమోదు చేయండి',
      descHi: 'सब्जी, अनाज की बोरियां मंडी ले जाने के लिए अपना मिनी ट्रक जोड़ें',
      illustrationKey: 'main_mini_truck',
      badgeEn: 'TRANSPORT SERVICE',
      badgeTe: 'రవాణా సేవలు',
      badgeHi: 'परिवहन सेवा',
      caption: { en: 'Mini-Truck Registration', te: 'మినీ ట్రక్ నమోదు', hi: 'मिनी ट्रक पंजीकरण' },
    },
    {
      id: 'PROVIDER_LOGIN',
      number: 5,
      titleEn: 'Provider Login & Account Dashboard',
      titleTe: 'ప్రొవైడర్ లాగిన్ & ఖాతా డ్యాష్‌బోర్డ్',
      titleHi: 'प्रदाता लॉगिन व खाता डैशबोर्ड',
      descEn: 'Log in with Mobile & OTP to activate daily availability, toggle Active/Inactive, and select attachment',
      descTe: 'మొబైల్ & OTP తో లాగిన్ అవ్వండి, లభ్యత యాక్టివేట్ చేయండి, పని పరికరాన్ని ఎంచుకోండి',
      descHi: 'मोबाइल व OTP से लॉगिन करें, दैनिक सक्रियता चालू करें, उपकरण चुनें और स्थिति बदलें',
      illustrationKey: 'tractor_rotavator',
      badgeEn: 'OTP LOGIN & DASHBOARD',
      badgeTe: 'OTP లాగిన్ & డ్యాష్‌బోర్డ్',
      badgeHi: 'OTP लॉगिन व डैशबोर्ड',
      caption: { en: 'Provider Login', te: 'ప్రొవైడర్ లాగిన్', hi: 'प्रदाता लॉगिन' },
    },
  ];

  const getSpokenText = (opt: (typeof hubOptions)[0]) => {
    return language === 'te' ? opt.titleTe : language === 'hi' ? opt.titleHi : opt.titleEn;
  };

  const handleCardClick = (
    action:
      | 'REGISTER_WORKER'
      | 'REGISTER_TRACTOR'
      | 'REGISTER_HARVESTER'
      | 'REGISTER_MINI_TRUCK'
      | 'PROVIDER_LOGIN'
  ) => {
    const opt = hubOptions.find((o) => o.id === action);
    if (!opt) return;

    if (selectedAction === action) {
      // Second tap: open screen
      onSelectAction(action);
    } else {
      // First tap: highlight and announce
      setSelectedAction(action);
      speakText(getSpokenText(opt), language);
    }
  };

  // Keyboard number keys 1 - 5
  useKeyboardNav({
    '1': () => handleCardClick('REGISTER_WORKER'),
    '2': () => handleCardClick('REGISTER_TRACTOR'),
    '3': () => handleCardClick('REGISTER_HARVESTER'),
    '4': () => handleCardClick('REGISTER_MINI_TRUCK'),
    '5': () => handleCardClick('PROVIDER_LOGIN'),
  });

  return (
    <div className="kiosk-screen provider-hub-screen">
      <div className="screen-header">
        <h2 className="screen-title">{t.providerHubHeading}</h2>
        <p className="screen-subtitle">{t.providerHubSub}</p>
        <p className="voice-guidance-instruction">
          <Volume2 size={18} />
          <span>{t.twoTapHint}</span>
        </p>
      </div>

      <div className="provider-hub-grid four-col">
        {hubOptions.map((opt) => {
          const isSelected = selectedAction === opt.id;
          const displayTitle = language === 'te' ? opt.titleTe : language === 'hi' ? opt.titleHi : opt.titleEn;
          const displayDesc = language === 'te' ? opt.descTe : language === 'hi' ? opt.descHi : opt.descEn;
          const displayBadge = language === 'te' ? opt.badgeTe : language === 'hi' ? opt.badgeHi : opt.badgeEn;
          const displayCaption = language === 'te' ? opt.caption.te : language === 'hi' ? opt.caption.hi : opt.caption.en;

          return (
            <button
              key={opt.id}
              type="button"
              className={`hub-card ${isSelected ? 'selected-highlight' : ''}`}
              onClick={() => handleCardClick(opt.id)}
            >
              <div className="hub-card-header">
                <span className="card-number-badge">{opt.number}</span>
                {isSelected ? (
                  <div className="card-selected-top-controls">
                    <span className="tap-confirm-badge">{t.tapAgainToOpen}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="card-audio-replay-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(getSpokenText(opt), language);
                      }}
                      title={t.replayVoice}
                    >
                      <Volume2 size={18} />
                    </span>
                  </div>
                ) : (
                  <span className="service-badge-pill">{displayBadge}</span>
                )}
              </div>

              <div className="hub-card-illustration">
                <AgriculturalIllustration name={opt.illustrationKey} size={100} />
                <span className="illus-caption">{displayCaption}</span>
              </div>

              <div className="hub-card-body">
                <h3 className="hub-card-title">{displayTitle}</h3>
                <p className="hub-card-desc">{displayDesc}</p>
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
          💡 <strong>{t.twoTapHint}</strong> | {language === 'te' ? 'కీబోర్డ్ 1 నుండి 5 నొక్కండి' : language === 'hi' ? 'कीबोर्ड 1 से 5 दबाएं' : 'Press keyboard key 1 - 5'}
        </p>
      </div>
    </div>
  );
};
