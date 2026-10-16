import React, { useState, useEffect } from 'react';
import { Language, WorkerRegistrationForm, CategoryItem } from '../types';
import { translations } from '../i18n/translations';
import { PERSON_CATEGORIES } from '../data/categories';
import { AgriculturalIllustration } from '../assets/illustrations';
import { validateFullName, validateIndianMobile } from '../utils/validation';
import { speakText } from '../utils/speechGuidance';
import { User, Phone, CheckSquare, Square, AlertCircle, Sparkles } from 'lucide-react';

interface WorkerRegistrationProps {
  language: Language;
  onRegisterSuccess: (form: WorkerRegistrationForm) => void;
  onCancel?: () => void;
}

export const WorkerRegistration: React.FC<WorkerRegistrationProps> = ({
  language,
  onRegisterSuccess,
  onCancel,
}) => {
  const t = translations[language];

  // Selected skills (multi-select)
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['sowing', 'transplanting']);
  // Mandatory personal details
  const [name, setName] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [consentAgreed, setConsentAgreed] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Announce page guidance on load
  useEffect(() => {
    const welcome =
      language === 'hi'
        ? 'कृषि श्रमिक पंजीकरण। अपने कौशल चुनें और पूरा नाम तथा 10 अंकों का मोबाइल नंबर दर्ज करें।'
        : language === 'te'
        ? 'వ్యవసాయ కూలీ నమోదు. మీ పనులను ఎంచుకుని, పూర్తి పేరు మరియు 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'
        : 'Agricultural worker registration. Select your farm skills, then enter your full name and 10-digit mobile number.';
    speakText(welcome, language);
  }, [language]);

  const toggleSkill = (skillId: string) => {
    const isAdding = !selectedSkills.includes(skillId);
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((s) => s !== skillId) : [...prev, skillId]
    );

    const cat = PERSON_CATEGORIES.find((c) => c.id === skillId);
    if (cat) {
      const title =
        language === 'hi'
          ? cat.titleHi
          : language === 'te'
          ? cat.titleTe
          : cat.titleEn;

      const feedback = isAdding
        ? language === 'hi'
          ? `${title} चुना गया। अन्य कौशल चुनें या संपर्क विवरण भरें।`
          : language === 'te'
          ? `${title} ఎంపిక చేయబడింది. ఇతర పనులను ఎంచుకోండి లేదా వివరాలు నమోదు చేయండి.`
          : `Selected ${title}. Choose more skills or enter your contact details below.`
        : language === 'hi'
        ? `${title} हटाया गया।`
        : language === 'te'
        ? `${title} తీసివేయబడింది.`
        : `Deselected ${title}.`;

      speakText(feedback, language);
    }
  };

  const handleConsentToggle = () => {
    const nextVal = !consentAgreed;
    setConsentAgreed(nextVal);
    const feedback = nextVal
      ? language === 'hi'
        ? 'किसानों के साथ संपर्क साझा करने की सहमति दी गई।'
        : language === 'te'
        ? 'రైతులతో కాంటాక్ట్ పంచుకోవడానికి సమ్మతి ఇవ్వబడింది.'
        : 'Consent given to share contact number with local farmers.'
      : language === 'hi'
      ? 'सहमति हटा दी गई।'
      : language === 'te'
      ? 'సమ్మతి రద్దు చేయబడింది.'
      : 'Consent deselected.';
    speakText(feedback, language);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSkills.length === 0) {
      const err =
        language === 'hi'
          ? 'कृपया कम से कम एक कृषि कार्य चुनें'
          : language === 'te'
          ? 'దయచేసి కనీసం ఒక వ్యవసాయ పనిని ఎంచుకోండి'
          : 'Please select at least one agricultural skill';
      setErrorMessage(err);
      speakText(err, language);
      return;
    }

    const nameValidation = validateFullName(name);
    if (!nameValidation.isValid) {
      const err =
        language === 'hi'
          ? nameValidation.errorMessageHi!
          : language === 'te'
          ? nameValidation.errorMessageTe!
          : nameValidation.errorMessageEn!;
      setErrorMessage(err);
      speakText(err, language);
      return;
    }

    const phoneValidation = validateIndianMobile(contactNumber);
    if (!phoneValidation.isValid) {
      const err =
        language === 'hi'
          ? phoneValidation.errorMessageHi!
          : language === 'te'
          ? phoneValidation.errorMessageTe!
          : phoneValidation.errorMessageEn!;
      setErrorMessage(err);
      speakText(err, language);
      return;
    }

    if (!consentAgreed) {
      setErrorMessage(t.consentRequired);
      speakText(t.consentRequired, language);
      return;
    }

    setErrorMessage(null);

    const successMsg =
      language === 'hi'
        ? 'पंजीकरण सफल रहा। आपका विवरण रामपुर पंचायत में दर्ज हो गया है।'
        : language === 'te'
        ? 'నమోదు విజయవంతమైంది. మీ వివరాలు రాంపూర్ పంచాయతీలో నమోదు చేయబడ్డాయి.'
        : 'Worker registration successful. Your profile is now registered at Rampur Panchayat.';
    speakText(successMsg, language);

    onRegisterSuccess({
      name: name.trim(),
      selectedSkills,
      contactNumber: phoneValidation.normalizedNumber || contactNumber.trim(),
      consentAgreed,
    });
  };

  return (
    <div className="kiosk-screen worker-registration-screen">
      <div className="screen-header">
        <h2 className="screen-title">{t.workerRegHeading}</h2>
        <p className="screen-subtitle">{t.workerRegSubtitle}</p>
      </div>

      {/* Mandatory Requirements Notice */}
      <div className="optional-details-notice-bar">
        <p>
          📋 <strong>
            {language === 'hi'
              ? 'अनिवार्य पंजीकरण: किसानों से सीधे काम के फोन प्राप्त करने के लिए नाम और मोबाइल नंबर अनिवार्य है।'
              : language === 'te'
              ? 'తప్పనిసరి నమోదు: రైతులు మిమ్మల్ని నేరుగా సంప్రదించడానికి పూర్తి పేరు మరియు మొబైల్ నంబర్ తప్పనిసరి.'
              : 'Mandatory Registration: Full Name and Mobile Number are compulsory so farmers can call you.'}
          </strong>
        </p>
      </div>

      {errorMessage && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={22} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="kiosk-form">
        {/* Step 1: Multi-Select Skill Grid */}
        <div className="form-section">
          <h3 className="section-title">{t.workerSkillsHeading}</h3>
          <div className="skills-multi-grid">
            {PERSON_CATEGORIES.map((cat: CategoryItem) => {
              const isSelected = selectedSkills.includes(cat.id);
              const title =
                language === 'hi'
                  ? cat.titleHi || cat.titleEn
                  : language === 'te'
                  ? cat.titleTe
                  : cat.titleEn;
              const subtitle =
                language === 'en'
                  ? cat.titleTe
                  : cat.titleEn;

              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`skill-select-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleSkill(cat.id)}
                >
                  <div className="skill-check-icon">
                    {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                  </div>
                  <div className="skill-illus">
                    <AgriculturalIllustration name={cat.illustrationKey} size={64} />
                  </div>
                  <div className="skill-label">
                    <span className="skill-main-text">{title}</span>
                    <span className="skill-sub-text">{subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Personal Details (MANDATORY) */}
        <div className="form-section">
          <h3 className="section-title">{t.workerDetailsHeading}</h3>
          <p className="section-optional-hint">
            {language === 'hi'
              ? '(पूरा नाम और 10-अंकों का वैध मोबाइल नंबर दर्ज करना अनिवार्य है)'
              : language === 'te'
              ? '(పూర్తి పేరు మరియు సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయడం తప్పనిసరి)'
              : '(Full Name and valid 10-digit Indian Mobile Number are mandatory)'}
          </p>

          {/* Name Field (Mandatory) */}
          <div className="form-group">
            <label className="form-label">
              <User size={20} />
              <span>{t.fieldName} *</span>
            </label>
            <input
              type="text"
              className="kiosk-input"
              value={name}
              required
              placeholder={t.namePlaceholder}
              onChange={(e) => setName(e.target.value)}
              onFocus={() =>
                speakText(
                  language === 'hi'
                    ? 'अपना पूरा नाम दर्ज करें।'
                    : language === 'te'
                    ? 'మీ పూర్తి పేరు నమోదు చేయండి.'
                    : 'Enter your full name.',
                  language
                )
              }
            />
          </div>

          {/* Contact Number (Mandatory) */}
          <div className="form-group">
            <label className="form-label">
              <Phone size={20} />
              <span>{t.fieldPhone} *</span>
            </label>
            <input
              type="text"
              className="kiosk-input"
              value={contactNumber}
              required
              placeholder={t.phonePlaceholder}
              onChange={(e) => setContactNumber(e.target.value)}
              onFocus={() =>
                speakText(
                  language === 'hi'
                    ? 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें।'
                    : language === 'te'
                    ? 'మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'
                    : 'Enter your 10-digit Indian mobile number.',
                  language
                )
              }
            />
          </div>

          {/* Consent Explanation & Checkbox */}
          <div className="consent-explanation-box">
            <p>{t.consentExplanation}</p>
          </div>

          <div
            className="consent-checkbox-card"
            onClick={handleConsentToggle}
            role="checkbox"
            aria-checked={consentAgreed}
            tabIndex={0}
          >
            <div className="consent-icon">
              {consentAgreed ? <CheckSquare size={24} /> : <Square size={24} />}
            </div>
            <div className="consent-text">
              <p>{t.consentLabel}</p>
            </div>
          </div>
        </div>

        {/* Submit Row */}
        <div className="form-submit-row">
          <button type="submit" className="kiosk-btn-primary search-submit-btn">
            <Sparkles size={24} strokeWidth={2.5} />
            <span>{t.btnRegisterWorker}</span>
          </button>
          {onCancel && (
            <button type="button" className="kiosk-btn-outline" onClick={onCancel}>
              {language === 'hi' ? 'रद्द करें' : language === 'te' ? 'రద్దు చేయండి' : 'CANCEL'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
