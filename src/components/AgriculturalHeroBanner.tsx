import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface AgriculturalHeroBannerProps {
  language: Language;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

/**
 * AgriculturalHeroBanner — Official GramaConnect Paper-Cut Sunrise Village Hero Banner.
 * Reproduces the visual reference with layered paper-cut hills, rangoli sun rings,
 * village palm silhouettes, Swaraj tractor silhouette, and live Panchayat credentials.
 */
export const AgriculturalHeroBanner: React.FC<AgriculturalHeroBannerProps> = ({
  language,
  title,
  subtitle,
  compact = false,
}) => {
  const t = translations[language];
  const displayTitle = title || t.heroBannerTitle;
  const displaySub = subtitle || t.heroBannerSub;

  return (
    <section
      className={`hero agri-hero-banner-container ${compact ? 'compact-hero' : ''}`}
      aria-label="GramaConnect agricultural banner"
    >
      <svg
        viewBox="0 0 1500 560"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        className="hero-svg"
      >
        <defs>
          <filter id="cut" x="-5%" y="-20%" width="110%" height="140%">
            <feDropShadow dx="0" dy="-6" stdDeviation="6" floodColor="#3B2A1E" floodOpacity=".28" />
          </filter>
          <radialGradient id="halo">
            <stop offset="0" stopColor="#FFF3B0" />
            <stop offset="1" stopColor="#FFB347" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sun Halo & Rangoli Concentric Rings */}
        <circle cx="1150" cy="290" r="260" fill="url(#halo)" />
        <g fill="none" stroke="#FFF" strokeOpacity=".55" strokeWidth="3">
          <circle cx="1150" cy="290" r="150" />
          <circle cx="1150" cy="290" r="190" strokeDasharray="4 12" />
          <circle cx="1150" cy="290" r="235" />
        </g>
        <circle cx="1150" cy="290" r="100" fill="#FFD25A" />
        <circle cx="1150" cy="290" r="78" fill="#FFE590" />

        {/* Paper-Cut Layered Rolling Hills */}
        <path d="M0 360Q250 300 520 350T1000 330T1500 350V560H0Z" fill="#7FC8B5" filter="url(#cut)" />
        <path d="M0 410Q300 350 600 405T1180 390T1500 410V560H0Z" fill="#4FAF7F" filter="url(#cut)" />
        <path d="M0 455Q380 410 760 458T1500 440V560H0Z" fill="#2E9A5C" filter="url(#cut)" />
        <path d="M700 470Q1100 430 1500 462V560H700Z" fill="#E8B84A" filter="url(#cut)" />
        <path d="M0 505Q400 470 800 508T1500 494V560H0Z" fill="#176B45" filter="url(#cut)" />

        {/* Palm Trees */}
        <g transform="translate(1240 340)">
          <path d="M0 130V30" stroke="#3B2A1E" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M0 30Q-40 0-70 24M0 30Q-30-20-60-10M0 30Q30-26 62-6M0 30Q42 0 72 30"
            stroke="#176B45"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
        </g>
        <g transform="translate(1390 380) scale(.8)">
          <path d="M0 100V20" stroke="#3B2A1E" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M0 20Q-40-8-70 16M0 20Q30-24 62-4M0 20Q42-6 72 22"
            stroke="#1F7A4D"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Paper-Cut Tractor Silhouette */}
        <g transform="translate(900 392)">
          <rect x="0" y="10" width="86" height="34" rx="8" fill="#C8553D" />
          <rect x="46" y="-14" width="38" height="28" rx="6" fill="#A8412D" />
          <circle cx="22" cy="48" r="24" fill="#3B2A1E" />
          <circle cx="22" cy="48" r="10" fill="#F3C969" />
          <circle cx="78" cy="54" r="15" fill="#3B2A1E" />
          <circle cx="78" cy="54" r="6" fill="#F3C969" />
        </g>
      </svg>

      {/* Copy overlay */}
      <div className="copy agri-hero-header-panel">
        <div className="hero-badge-row">
          <span className="chip hero-kiosk-pill">
            <i className="hero-pill-dot" aria-hidden="true" />
            {language === 'te'
              ? 'రాంపూర్ గ్రామ పంచాయతీ కియోస్క్'
              : language === 'hi'
              ? 'रामपुर ग्राम पंचायत कियोस्क'
              : 'Rampur Gram Panchayat kiosk'}
          </span>
        </div>

        <h1 className="agri-hero-headline agri-hero-title">
          {displayTitle.includes('&') ? (
            <>
              {displayTitle.split('&')[0]}&amp;{' '}
              <em>{displayTitle.split('&')[1]}</em>
            </>
          ) : (
            displayTitle
          )}
        </h1>
        <p className="agri-hero-subheadline agri-hero-sub">{displaySub}</p>

        <div className="langs hero-lang-chips">
          <span className="lang-pill" lang="te">
            రైతులు, కార్మికులు మరియు వ్యవసాయ యంత్రాలను కలుపుతుంది.
          </span>
          <span className="lang-pill" lang="hi">
            किसानों, श्रमिकों और कृषि मशीनरी को जोड़ता है।
          </span>
        </div>
      </div>
    </section>
  );
};
