import React, { useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface AgriculturalHeroBannerProps {
  language: Language;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}

/**
 * AgriculturalHeroBanner — GramaConnect Paper-Cut Sunrise Village Hero Banner (v2).
 * Features a 780px cinematic dawn sky with star dots, 560px rising sun, 2 drifting clouds,
 * 4-layer paper-cut SVG scene with Swaraj tractor drive animation, spinning wheels, swaying grass,
 * and mouse/pointer parallax across depth layers.
 */
export const AgriculturalHeroBanner: React.FC<AgriculturalHeroBannerProps> = ({
  language,
  title,
  subtitle,
  compact = false,
}) => {
  const t = translations[language];
  const heroRef = useRef<HTMLElement>(null);
  const displayTitle = title || t.heroBannerTitle;
  const displaySub = subtitle || t.heroBannerSub;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = heroRef.current;
    if (!container) return;

    const layers = container.querySelectorAll<HTMLElement>('.par');
    if (!layers.length) return;

    const handlePointerMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      layers.forEach((l) => {
        const d = Number(l.getAttribute('data-d')) || 10;
        l.style.transform = `translate(${-x * d}px, ${(-y * d) / 2}px)`;
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  return (
    <section
      ref={heroRef}
      className={`hero agri-hero-banner-container ${compact ? 'compact-hero' : ''}`}
      aria-label="GramaConnect agricultural banner"
    >
      {/* 560px Rising Sun SVG with halo and rangoli concentric rings */}
      <svg className="sun" viewBox="0 0 560 560" aria-hidden="true">
        <defs>
          <radialGradient id="h">
            <stop offset="0" stopColor="#FFF3B0" />
            <stop offset="1" stopColor="#FFB347" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="280" cy="280" r="280" fill="url(#h)" />
        <g fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3">
          <circle cx="280" cy="280" r="150" />
          <circle cx="280" cy="280" r="195" strokeDasharray="3 12" />
          <circle cx="280" cy="280" r="240" />
        </g>
        <circle cx="280" cy="280" r="104" fill="#FFD25A" />
        <circle cx="280" cy="280" r="80" fill="#FFE590" />
      </svg>

      {/* 2 Drifting Blurred Clouds */}
      <div className="cloud" style={{ top: '190px', width: '200px', animationDelay: '-20s' }} aria-hidden="true" />
      <div className="cloud" style={{ top: '300px', width: '140px', animationDelay: '-55s', opacity: 0.7 }} aria-hidden="true" />

      {/* Copy sits in the clear dark sky above the artwork */}
      <div className="shell">
        <div className="copy agri-hero-header-panel">
          <span className="chip hero-kiosk-pill">
            <i className="hero-pill-dot" aria-hidden="true" />
            {language === 'te'
              ? 'రాంపూర్ గ్రామ పంచాయతీ కియోస్క్'
              : language === 'hi'
              ? 'रामपुर ग्राम पंचायत कियोस्क'
              : 'Rampur Gram Panchayat kiosk'}
          </span>

          <h1 className="agri-hero-headline agri-hero-title">
            {displayTitle.includes('&') ? (
              <>
                {displayTitle.split('&')[0]}&amp;{' '}
                <span>{displayTitle.split('&')[1].trim()}</span>
              </>
            ) : (
              displayTitle
            )}
          </h1>

          <p className="agri-hero-subheadline agri-hero-sub">{displaySub}</p>

          <div className="pills langs hero-lang-chips">
            <span className="lang-pill" lang="te">
              రైతులు, కార్మికులు మరియు వ్యవసాయ యంత్రాలను కలుపుతుంది.
            </span>
            <span className="lang-pill" lang="hi">
              किसानों, श्रमिकों और कृषि मशीनरी को जोड़ता है।
            </span>
          </div>
        </div>
      </div>

      {/* 4-Layer Paper-Cut SVG Scene with Parallax, Tractor, and Swaying Grass */}
      <div className="scene">
        <svg viewBox="0 0 1600 330" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <defs>
            <filter id="s" x="-5%" y="-30%" width="110%" height="160%">
              <feDropShadow dx="0" dy="-7" stdDeviation="7" floodColor="#0F2A4A" floodOpacity=".3" />
            </filter>
          </defs>

          {/* Layer 1: Distant Teal Rolling Hills */}
          <g className="par" data-d="6">
            <path d="M0 120Q260 40 560 112T1100 90T1600 120V330H0Z" fill="#5FB5B0" filter="url(#s)" />
          </g>

          {/* Layer 2: Mid-Distant Green Hills & Palm Tree */}
          <g className="par" data-d="12">
            <path d="M0 170Q320 100 680 165T1300 150T1600 170V330H0Z" fill="#3FA56E" filter="url(#s)" />
            <g transform="translate(1330 40)">
              <path d="M0 130V30" stroke="#3B2A1E" strokeWidth="9" strokeLinecap="round" />
              <path
                d="M0 30Q-42 0-76 24M0 30Q-30-22-62-10M0 30Q32-28 66-6M0 30Q44 0 78 30"
                stroke="#176B45"
                strokeWidth="13"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* Layer 3: Golden Paddy Hill with Swaraj Tractor Silhouette & Animated Drive */}
          <g className="par" data-d="20">
            <path d="M760 230Q1120 190 1600 220V330H760Z" fill="#E8B84A" filter="url(#s)" />
            <g className="tractor">
              <g transform="translate(1180 150)">
                <rect x="0" y="12" width="92" height="36" rx="9" fill="#C8553D" />
                <rect x="48" y="-14" width="42" height="30" rx="7" fill="#A8412D" />
                <rect x="54" y="-8" width="24" height="16" rx="3" fill="#EAF6FC" />
                <g className="wh">
                  <circle cx="24" cy="52" r="26" fill="#3B2A1E" />
                  <circle cx="24" cy="52" r="10" fill="#F3C969" />
                  <path d="M24 40v24M12 52h24" stroke="#8A5A3A" strokeWidth="3" />
                </g>
                <circle cx="82" cy="58" r="16" fill="#3B2A1E" />
                <circle cx="82" cy="58" r="6" fill="#F3C969" />
              </g>
            </g>
          </g>

          {/* Layer 4: Deep Crop Green Foreground with Swaying Grass Blades */}
          <g className="par" data-d="30">
            <path d="M0 250Q420 205 860 252T1600 240V330H0Z" fill="#176B45" filter="url(#s)" />
            <g fill="#2E9A5C">
              <path className="sw" d="M80 330q6-44-2-66q16 26 12 66Z" />
              <path className="sw" d="M220 330q6-40 0-60q14 24 10 60Z" />
              <path className="sw" d="M470 330q6-44-2-66q16 26 12 66Z" />
              <path className="sw" d="M900 330q6-40 0-60q14 24 10 60Z" />
              <path className="sw" d="M1180 330q6-44-2-66q16 26 12 66Z" />
              <path className="sw" d="M1460 330q6-40 0-60q14 24 10 60Z" />
            </g>
          </g>
        </svg>
      </div>
    </section>
  );
};
