import React, { useState, useEffect } from 'react';
import { Language, Screen } from '../types';
import { translations } from '../i18n/translations';
import { Home, ArrowLeft, RotateCcw, Volume2, VolumeX, Radio, KeyRound, UserCheck } from 'lucide-react';
import { replaySpeech, subscribeSpeechState } from '../utils/speechGuidance';

interface HeaderProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  currentScreen: Screen;
  onNavigateHome: () => void;
  onNavigateBack: () => void;
  onResetSession: () => void;
  secondsRemaining: number;
  canGoBack: boolean;
  isVoiceMuted: boolean;
  onToggleVoice: () => void;
  onOpenProviderLogin?: () => void;
  isLoggedIn?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange: _onLanguageChange,
  currentScreen,
  onNavigateHome,
  onNavigateBack,
  onResetSession,
  secondsRemaining,
  canGoBack,
  isVoiceMuted,
  onToggleVoice,
  onOpenProviderLogin,
  isLoggedIn,
}) => {
  const t = translations[language];
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeSpeechState((speaking) => {
      setIsSpeaking(speaking);
    });
    return unsubscribe;
  }, []);

  return (
    <header className="kiosk-header">
      {/* Top Banner Bar */}
      <div className="header-top-row">
        <div className="brand-group" onClick={onNavigateHome} role="button" tabIndex={0}>
          <div className="brand-badge" aria-label="GramaConnect Logo">
            <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
              <path d="M16 28V15" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              <path d="M16 17C8 18 6 11 5 8c8-1 11 3 11 9Z" fill="#DDF3DF" />
              <path d="M16 15c1-6 5-9 11-9 0 7-4 10-11 9Z" fill="#F3C969" />
            </svg>
          </div>
          <div className="brand-titles">
            <h1 className="brand-title">{t.appTitle}</h1>
            <p className="brand-subtitle">{t.appSubtitle}</p>
          </div>
        </div>

        {/* Action Controls: Voice, Replay, 3-Language Toggle, Timer, Reset */}
        <div className="header-controls">
          {/* Replay Announcement Button */}
          {!isVoiceMuted && (
            <button
              type="button"
              className={`replay-voice-btn ${isSpeaking ? 'speaking-pulse' : ''}`}
              onClick={replaySpeech}
              title={t.replayVoice}
              aria-label={t.replayVoice}
            >
              <Radio size={18} strokeWidth={2.5} className={isSpeaking ? 'spin-anim' : ''} />
              <span className="voice-btn-label">{t.replayVoice}</span>
            </button>
          )}

          {/* Voice Guidance Toggle */}
          <button
            type="button"
            className={`voice-toggle-btn ${isVoiceMuted ? 'muted' : 'active'}`}
            onClick={onToggleVoice}
            title={isVoiceMuted ? t.voiceGuidanceMuted : t.voiceGuidanceActive}
            aria-label={isVoiceMuted ? t.voiceGuidanceMuted : t.voiceGuidanceActive}
          >
            {isVoiceMuted ? <VolumeX size={18} strokeWidth={2.5} /> : <Volume2 size={18} strokeWidth={2.5} />}
            <span className="voice-btn-label">
              {isVoiceMuted ? 'VOICE OFF' : 'VOICE ON'}
            </span>
          </button>

          {/* Language selector removed from persistent header per requirement 5 (chosen once on welcome screen) */}

          {/* Idle Countdown Display */}
          <div
            className={`timer-badge ${secondsRemaining <= 15 ? 'timer-urgent' : ''}`}
            title="Kiosk auto-reset timer"
            style={{
              background: `conic-gradient(var(--leaf) 0 ${Math.max(0, Math.min(100, (secondsRemaining / 60) * 100))}%, #DDE9F1 0)`,
            }}
          >
            <span className="timer-val">
              {secondsRemaining}s
            </span>
          </div>

          {/* Provider Login / Dashboard Button */}
          {currentScreen !== 'LANGUAGE_SELECT' && onOpenProviderLogin && (
            <button
              type="button"
              className={`kiosk-tool-btn provider-login-nav-btn ${
                currentScreen === 'PROVIDER_LOGIN' || currentScreen === 'PROVIDER_DASHBOARD' ? 'active' : ''
              }`}
              onClick={onOpenProviderLogin}
              title={isLoggedIn ? t.dashboardTitle : t.providerLoginTitle}
              aria-label={isLoggedIn ? t.dashboardTitle : t.providerLoginTitle}
            >
              {isLoggedIn ? <UserCheck size={16} strokeWidth={2.5} /> : <KeyRound size={16} strokeWidth={2.5} />}
              <span className="btn-label">
                {isLoggedIn
                  ? language === 'te' ? 'డ్యాష్‌బోర్డ్' : language === 'hi' ? 'डैशबोर्ड' : 'DASHBOARD'
                  : language === 'te' ? 'లాగిన్' : language === 'hi' ? 'लॉगिन' : 'LOGIN'}
              </span>
            </button>
          )}

          {/* Reset Session Button */}
          {currentScreen !== 'LANGUAGE_SELECT' && (
            <button
              type="button"
              className="kiosk-tool-btn reset-btn"
              onClick={onResetSession}
              title="Reset kiosk session"
            >
              <RotateCcw size={16} strokeWidth={2.5} />
              <span className="btn-label">{t.btnRestartSession}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Bar (When inside workflows) */}
      {currentScreen !== 'LANGUAGE_SELECT' && currentScreen !== 'HOME_MENU' && (
        <div className="header-nav-row">
          <div className="nav-left">
            {canGoBack && (
              <button
                type="button"
                className="nav-action-btn back-btn"
                onClick={onNavigateBack}
              >
                <ArrowLeft size={20} strokeWidth={3} />
                <span>{t.btnBack}</span>
              </button>
            )}
            <button
              type="button"
              className="nav-action-btn home-btn"
              onClick={onNavigateHome}
            >
              <Home size={20} strokeWidth={3} />
              <span>{t.btnHome}</span>
            </button>
          </div>
          <div className="kiosk-node-info">
            <span className="node-text">{t.kioskStation}</span>
          </div>
        </div>
      )}
    </header>
  );
};
