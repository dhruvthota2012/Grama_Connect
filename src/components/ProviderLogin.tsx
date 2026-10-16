import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { validateIndianMobile } from '../utils/validation';
import {
  getAccountByMobile,
  ProviderAccount,
  upsertProviderAccount,
} from '../utils/providerAccounts';
import { speakText } from '../utils/speechGuidance';
import {
  Phone,
  KeyRound,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  Sparkles,
  Check,
  Smartphone,
} from 'lucide-react';

interface ProviderLoginProps {
  language: Language;
  onLoginSuccess: (account: ProviderAccount, token: string) => void;
  onCancel: () => void;
  onRegisterNew: () => void;
}

export const ProviderLogin: React.FC<ProviderLoginProps> = ({
  language,
  onLoginSuccess,
  onCancel,
  onRegisterNew,
}) => {
  const t = translations[language];

  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [mobile, setMobile] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Timer & cooldown states
  const [expiresIn, setExpiresIn] = useState<number>(300); // 5 mins
  const [cooldown, setCooldown] = useState<number>(0);
  const [isSimulatedGateway, setIsSimulatedGateway] = useState<boolean>(true);
  const [showKeypad, setShowKeypad] = useState<boolean>(true);

  // Check auth server status on mount
  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        setIsSimulatedGateway(Boolean(data.demoMode));
      })
      .catch(() => {
        setIsSimulatedGateway(true);
      });
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry countdown timer
  useEffect(() => {
    if (step !== 'OTP' || expiresIn <= 0) return;
    const timer = setInterval(() => {
      setExpiresIn((prev) => {
        if (prev <= 1) {
          setErrorMessage(
            language === 'hi'
              ? 'सत्यापन कोड (OTP) समाप्त हो गया है। कृपया नया कोड भेजें।'
              : language === 'te'
              ? 'ధృవీకరణ కోడ్ (OTP) గడువు ముగిసింది. దయచేసి మళ్లీ కొత్త కోడ్ పంపండి.'
              : 'Verification code has expired. Please request a new code.'
          );
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, expiresIn, language]);

  // Keypad helper
  const handleKeypadPress = (val: string) => {
    if (step === 'MOBILE') {
      if (mobile.length < 10) {
        setMobile((prev) => prev + val);
      }
    } else {
      if (otp.length < 6) {
        setOtp((prev) => prev + val);
      }
    }
  };

  const handleKeypadBackspace = () => {
    if (step === 'MOBILE') {
      setMobile((prev) => prev.slice(0, -1));
    } else {
      setOtp((prev) => prev.slice(0, -1));
    }
  };

  const handleKeypadClear = () => {
    if (step === 'MOBILE') {
      setMobile('');
    } else {
      setOtp('');
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const validation = validateIndianMobile(mobile, language);
    if (!validation.isValid) {
      setErrorMessage(
        validation.errorMessage || validation.errorMessageEn || 'Invalid mobile number'
      );
      return;
    }

    const cleanMobile = validation.cleanMobile || mobile.replace(/\D/g, '').slice(-10);

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Failed to send OTP.');
        setIsLoading(false);
        return;
      }

      setStep('OTP');
      setExpiresIn(data.expiresInSeconds || 300);
      setCooldown(data.cooldownSeconds || 30);
      setIsSimulatedGateway(Boolean(data.isSimulated));
      setSuccessNotice(data.message);
      setOtp('');

      speakText(
        language === 'hi'
          ? 'सत्यापन कोड भेजा गया है।'
          : language === 'te'
          ? 'ధృవీకరణ కోడ్ పంపబడింది.'
          : 'Verification code sent.',
        language
      );
    } catch (err: any) {
      setErrorMessage('Network error while requesting OTP. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (otp.length !== 6) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया 6-अंकों का पूरा सत्यापन कोड दर्ज करें।'
          : language === 'te'
          ? 'దయచేసి పూర్తి 6 అంకెల OTP కోడ్‌ను నమోదు చేయండి.'
          : 'Please enter the complete 6-digit OTP code.'
      );
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile, otp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Incorrect verification code.');
        setIsLoading(false);
        return;
      }

      // Verification passed! Load existing account or link profile
      let account = getAccountByMobile(cleanMobile);

      if (!account) {
        // If first-time login without prior registration, create base worker/provider account
        account = upsertProviderAccount({
          id: `acc-live-${Date.now()}`,
          type: 'worker',
          name: 'Registered Farm Provider',
          mobile: cleanMobile,
          skills: ['sowing', 'transplanting', 'weeding'],
          dailyWage: 450,
          villageId: 'rampur',
          villageNameEn: 'Rampur',
          isActive: true,
          registeredAt: new Date().toISOString(),
        });
      }

      speakText(
        language === 'hi'
          ? 'सत्यापन सफल। प्रदाता डैशबोर्ड खुला।'
          : language === 'te'
          ? 'ధృవీకరణ విజయవంతమైంది. డ్యాష్‌బోర్డ్ తెరవబడింది.'
          : 'Verification successful. Dashboard opened.',
        language
      );

      onLoginSuccess(account, data.token);
    } catch (err: any) {
      setErrorMessage('Network error during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = () => {
    if (cooldown > 0) return;
    handleSendOtp();
  };

  // Localized Welcome Copy
  const welcomeHeading =
    language === 'te'
      ? 'రైతు మిత్రునికి స్వాగతం!'
      : language === 'hi'
      ? 'किसान भाई, आपका स्वागत है!'
      : 'Welcome Back, Farmer!';

  const welcomeSub =
    language === 'te'
      ? 'మీ గ్రామ వ్యవసాయ వర్గంతో నేరుగా అనుసంధానం అవ్వండి'
      : language === 'hi'
      ? 'अपने गाँव के कृषि समुदाय से सीधे जुड़ें'
      : 'Connect with your village agricultural community';

  const benefits = [
    {
      title:
        language === 'te'
          ? 'రోజువారీ లభ్యత యాక్టివేషన్'
          : language === 'hi'
          ? 'दैनिक उपलब्धता सक्रियकरण'
          : '1-Tap Daily Availability',
      desc:
        language === 'te'
          ? 'మీ ట్రాక్టర్ లేదా పని లభ్యతను రోజూ సులభంగా యాక్టివేట్ చేయండి'
          : language === 'hi'
          ? 'अपने ट्रैक्टर या मजदूरी कार्य को रोज़ सक्रिय करें'
          : 'Activate your tractor or worker availability each working day',
    },
    {
      title:
        language === 'te'
          ? 'నేరుగా రైతులతో సంప్రదింపులు'
          : language === 'hi'
          ? 'किसानों से सीधा संपर्क'
          : 'Direct Farmer Connect',
      desc:
        language === 'te'
          ? 'ఎలాంటి మధ్యవర్తులు లేకుండా పూర్తి పారదర్శకత'
          : language === 'hi'
          ? 'बिना किसी बिचौलिए के पूरी पारदर्शिता के साथ'
          : 'Zero commission, direct village kiosk matching',
    },
    {
      title:
        language === 'te'
          ? 'సురక్షిత మొబైల్ OTP లాగిన్'
          : language === 'hi'
          ? 'सुरक्षित मोबाइल OTP लॉगिन'
          : 'Fast & Secure OTP Login',
      desc:
        language === 'te'
          ? 'పాస్‌వర్డ్ అవసరం లేకుండా కేవలం మొబైల్ నంబర్‌తో లాగిన్'
          : language === 'hi'
          ? 'पासवर्ड याद रखने की जरूरत नहीं, केवल 1 मिनट में'
          : 'No password needed, verify securely in under a minute',
    },
  ];

  return (
    <div className="kiosk-screen provider-login-screen">
      {/* Two-Column Responsive Grid */}
      <div className="provider-login-split-grid">
        {/* LEFT COLUMN: Agricultural Welcome Panel */}
        <aside className="provider-login-welcome-panel" aria-label="Welcome Information">
          {/* Decorative Illustrated Indian Farm Artwork */}
          <div className="welcome-farm-artwork">
            <svg
              viewBox="0 0 460 220"
              preserveAspectRatio="xMidYMid meet"
              className="welcome-farm-svg"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="welSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#43B5E8" stopOpacity="0.4" />
                  <stop offset="65%" stopColor="#EAF6FC" />
                  <stop offset="100%" stopColor="#FFF9ED" />
                </linearGradient>
                <radialGradient id="welSunGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFF9ED" />
                  <stop offset="50%" stopColor="#F3C969" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#F3C969" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="welHillsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#279653" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#176B45" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="welCropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#279653" />
                  <stop offset="100%" stopColor="#176B45" />
                </linearGradient>
              </defs>

              {/* Sky background */}
              <rect x="0" y="0" width="460" height="220" fill="url(#welSkyGrad)" rx="14" />

              {/* Radiant morning sun */}
              <circle cx="370" cy="55" r="42" fill="url(#welSunGrad)" />
              <circle cx="370" cy="55" r="22" fill="#F3C969" opacity="0.9" />

              {/* Distant green hills */}
              <path
                d="M0,125 Q115,95 230,115 T460,110 L460,220 L0,220 Z"
                fill="url(#welHillsGrad)"
              />

              {/* Village trees & hut */}
              <circle cx="85" cy="115" r="14" fill="#176B45" opacity="0.7" />
              <circle cx="98" cy="112" r="12" fill="#176B45" opacity="0.7" />
              <rect x="91" y="120" width="4" height="15" fill="#5C381E" />
              <polygon points="190,126 205,112 220,126" fill="#174A8B" opacity="0.8" />
              <rect x="195" y="126" width="20" height="12" fill="#174A8B" opacity="0.7" />

              {/* Foreground lush paddy fields & furrow lines */}
              <path
                d="M0,145 Q120,135 240,142 T460,140 L460,220 L0,220 Z"
                fill="url(#welCropGrad)"
              />
              <path d="M120,220 L160,145" stroke="#F3C969" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />
              <path d="M260,220 L270,145" stroke="#F3C969" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />
              <path d="M380,220 L350,145" stroke="#F3C969" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" />

              {/* Healthy crop shoots at bottom */}
              <g fill="#279653">
                {[30, 75, 140, 205, 290, 360, 420].map((cx, idx) => (
                  <path
                    key={idx}
                    d={`M${cx},216 Q${cx + 4},198 ${cx + 10},194 Q${cx + 5},204 ${cx + 3},216 Z`}
                  />
                ))}
              </g>
            </svg>
          </div>

          <div className="welcome-panel-content">
            <div className="welcome-tag">
              <Sparkles size={16} />
              <span>GramaConnect • Kisan Seva</span>
            </div>

            <h1 className="welcome-hero-heading">{welcomeHeading}</h1>
            <p className="welcome-hero-sub">{welcomeSub}</p>

            <div className="welcome-benefits-list">
              {benefits.map((b, i) => (
                <div key={i} className="benefit-item">
                  <div className="benefit-icon-badge">
                    <Check size={16} />
                  </div>
                  <div className="benefit-text">
                    <h2 className="benefit-title">{b.title}</h2>
                    <p className="benefit-desc">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Demo Helper Box */}
            <div className="welcome-demo-helper">
              <span className="demo-helper-title">
                💡 {language === 'hi' ? 'परीक्षण हेतु डेमो खाता' : language === 'te' ? 'పరీక్షించడానికి డెమో ఖాతా' : 'Demo Account for Testing'}:
              </span>
              <button
                type="button"
                className="demo-phone-chip"
                onClick={() => setMobile('9848011901')}
                title="Click to fill 9848011901"
              >
                <Smartphone size={14} />
                <span>98480 11901</span>
                <span className="chip-tag">(B. Srinivasa Rao)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Polished Login Card */}
        <section className="provider-login-card" aria-label="Login Form">
          {/* Card Top Header */}
          <div className="login-card-header">
            <div className="login-shield-badge">
              <ShieldCheck size={28} />
            </div>
            <div className="login-header-text">
              <h2 className="login-card-title">{t.providerLoginTitle}</h2>
              <p className="login-card-subtitle">{t.providerLoginSub}</p>
            </div>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className="login-alert-banner alert-error" role="alert">
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && !errorMessage && (
            <div className="login-alert-banner alert-success" role="status">
              <CheckCircle size={20} />
              <span>{successNotice}</span>
            </div>
          )}

          {/* STEP 1: ENTER MOBILE NUMBER */}
          {step === 'MOBILE' && (
            <form className="login-form-step" onSubmit={handleSendOtp}>
              <div className="input-group-large">
                <label htmlFor="login-mobile-input" className="input-label-large">
                  <Phone size={18} />
                  <span>{t.enterMobilePrompt} *</span>
                </label>

                <div className="mobile-display-box">
                  <span className="country-prefix" title="India Country Code">
                    🇮🇳 +91
                  </span>
                  <input
                    id="login-mobile-input"
                    type="tel"
                    className="mobile-large-input"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    placeholder="98480 12345"
                    maxLength={10}
                    autoFocus
                  />
                  {mobile.length > 0 && (
                    <button
                      type="button"
                      className="input-clear-icon-btn"
                      onClick={() => setMobile('')}
                      aria-label="Clear number"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="input-helper-row">
                  <span className="input-hint-text">
                    {language === 'hi'
                      ? '10 अंकों का पंजीकृत भारतीय मोबाइल नंबर दर्ज करें'
                      : language === 'te'
                      ? '10 అంకెల రిజిస్టర్డ్ భారతీయ మొబైల్ నంబర్ నమోదు చేయండి'
                      : 'Enter 10-digit registered Indian mobile number to receive OTP'}
                  </span>
                  <span className="digit-counter">{mobile.length}/10</span>
                </div>
              </div>

              {/* Toggleable Kiosk Numeric Touch Keypad */}
              <div className="keypad-toggle-bar">
                <button
                  type="button"
                  className="keypad-toggle-btn"
                  onClick={() => setShowKeypad(!showKeypad)}
                >
                  <Smartphone size={14} />
                  <span>
                    {showKeypad
                      ? language === 'hi'
                        ? 'कीपैड छुपाएं'
                        : language === 'te'
                        ? 'కీప్యాడ్ దాచండి'
                        : 'Hide Touch Keypad'
                      : language === 'hi'
                      ? 'स्क्रीन कीपैड दिखाएं'
                      : language === 'te'
                      ? 'టచ్ కీప్యాడ్ చూపించండి'
                      : 'Show Touch Keypad'}
                  </span>
                </button>
              </div>

              {showKeypad && (
                <div className="kiosk-touch-keypad" aria-label="Touch numeric keypad">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      className="keypad-digit-btn"
                      onClick={() => handleKeypadPress(digit)}
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="keypad-action-btn clear-btn"
                    onClick={handleKeypadClear}
                    title="Clear"
                  >
                    C
                  </button>
                  <button
                    type="button"
                    className="keypad-digit-btn"
                    onClick={() => handleKeypadPress('0')}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    className="keypad-action-btn backspace-btn"
                    onClick={handleKeypadBackspace}
                    aria-label="Backspace"
                    title="Backspace"
                  >
                    ⌫
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="login-action-buttons">
                <button
                  type="submit"
                  className="kiosk-btn-primary full-width-btn"
                  disabled={mobile.length < 10 || isLoading}
                >
                  {isLoading ? (
                    <span>Sending OTP...</span>
                  ) : (
                    <>
                      <KeyRound size={20} />
                      <span>{t.btnSendOtp}</span>
                    </>
                  )}
                </button>

                <div className="login-secondary-actions">
                  <button
                    type="button"
                    className="kiosk-btn-outline"
                    onClick={onCancel}
                  >
                    <ArrowLeft size={18} />
                    <span>{t.btnBack}</span>
                  </button>

                  <button
                    type="button"
                    className="kiosk-btn-secondary"
                    onClick={onRegisterNew}
                  >
                    <UserPlus size={18} />
                    <span>
                      {language === 'hi'
                        ? 'नया पंजीकरण करें'
                        : language === 'te'
                        ? 'కొత్తగా నమోదు చేసుకోండి'
                        : 'Register New Profile'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER OTP */}
          {step === 'OTP' && (
            <form className="login-form-step" onSubmit={handleVerifyOtp}>
              <div className="otp-step-header">
                <div className="otp-sent-info">
                  <span className="sent-to-label">
                    {language === 'hi'
                      ? 'सत्यापन कोड भेजा गया:'
                      : language === 'te'
                      ? 'OTP పంపబడిన నంబర్:'
                      : 'OTP sent to:'}
                  </span>
                  <span className="sent-to-number">+91 {mobile}</span>
                </div>
                <button
                  type="button"
                  className="change-mobile-link"
                  onClick={() => setStep('MOBILE')}
                >
                  {language === 'hi'
                    ? 'नंबर बदलें'
                    : language === 'te'
                    ? 'నంబర్ మార్చండి'
                    : 'Change number'}
                </button>
              </div>

              {/* Clear Demonstration SMS notice */}
              {isSimulatedGateway && (
                <div className="demo-sms-notice-card">
                  <span className="demo-tag">SIMULATION DEMO</span>
                  <p className="demo-text">{t.demoOtpNotice}</p>
                </div>
              )}

              <div className="input-group-large">
                <label htmlFor="login-otp-input" className="input-label-large">
                  <KeyRound size={18} />
                  <span>{t.enterOtpPrompt} *</span>
                </label>
                <input
                  id="login-otp-input"
                  type="text"
                  inputMode="numeric"
                  className="otp-large-input"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                />
                <div className="otp-expiry-row">
                  <span className="timer-countdown">
                    <Clock size={15} />
                    <span>
                      {t.otpExpiresIn}: {Math.floor(expiresIn / 60)}:
                      {String(expiresIn % 60).padStart(2, '0')}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="resend-otp-btn"
                    onClick={handleResend}
                    disabled={cooldown > 0 || isLoading}
                  >
                    <RotateCcw size={15} />
                    <span>
                      {cooldown > 0
                        ? `${t.btnResendOtp} (${cooldown}s)`
                        : t.btnResendOtp}
                    </span>
                  </button>
                </div>
              </div>

              {/* Touch Keypad for OTP entry */}
              {showKeypad && (
                <div className="kiosk-touch-keypad" aria-label="Touch numeric keypad">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      className="keypad-digit-btn"
                      onClick={() => handleKeypadPress(digit)}
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="keypad-action-btn clear-btn"
                    onClick={handleKeypadClear}
                    title="Clear"
                  >
                    C
                  </button>
                  <button
                    type="button"
                    className="keypad-digit-btn"
                    onClick={() => handleKeypadPress('0')}
                  >
                    0
                  </button>
                  <button
                    type="button"
                    className="keypad-action-btn backspace-btn"
                    onClick={handleKeypadBackspace}
                    aria-label="Backspace"
                    title="Backspace"
                  >
                    ⌫
                  </button>
                </div>
              )}

              <div className="login-action-buttons">
                <button
                  type="submit"
                  className="kiosk-btn-primary full-width-btn"
                  disabled={otp.length !== 6 || isLoading}
                >
                  {isLoading ? (
                    <span>Verifying code...</span>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>{t.btnVerifyOtp}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="kiosk-btn-outline"
                  onClick={() => setStep('MOBILE')}
                >
                  <ArrowLeft size={18} />
                  <span>{t.btnBack}</span>
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
