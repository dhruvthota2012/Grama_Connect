import React, { useState, useEffect } from 'react';
import {
  Language,
  TractorRegistrationForm,
  HarvesterRegistrationForm,
  MiniTruckRegistrationForm,
  AnyRegistrationData,
  CategoryItem,
  TractorService,
} from '../types';
import { translations } from '../i18n/translations';
import {
  TRACTOR_CATEGORIES,
  HARVESTER_CATEGORIES,
  MINI_TRUCK_CATEGORIES,
} from '../data/categories';
import { AgriculturalIllustration } from '../assets/illustrations';
import { VehiclePhotoUploader } from './VehiclePhotoUploader';
import { validateFullName, validateIndianMobile } from '../utils/validation';
import { getKioskTodayDateString } from '../utils/dailyAvailability';
import { speakText } from '../utils/speechGuidance';
import {
  Wrench,
  User,
  Phone,
  CheckSquare,
  Square,
  AlertCircle,
  Truck,
  Sparkles,
  CircleDot,
  Circle,
  KeyRound,
  Calendar,
} from 'lucide-react';

interface MachineryRegistrationProps {
  machineryType: 'tractor' | 'harvester' | 'mini_truck';
  language: Language;
  onSubmit: (reg: AnyRegistrationData) => void;
  onCancel: () => void;
  onGoToLogin?: () => void;
  existingTractors?: TractorService[];
}

export const MachineryRegistration: React.FC<MachineryRegistrationProps> = ({
  machineryType,
  language,
  onSubmit,
  onCancel,
  onGoToLogin,
  existingTractors,
}) => {
  const t = translations[language];

  // Mandatory personal details
  const [contactName, setContactName] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [consentAgreed, setConsentAgreed] = useState<boolean>(true);
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tractor state (Single authoritative attachment rule)
  const [tractorModel, setTractorModel] = useState<string>('Mahindra 575 DI (45 HP)');
  const [currentAttachment, setCurrentAttachment] = useState<string>('tractor_rotavator');
  const [includesOperator, setIncludesOperator] = useState<boolean>(true);

  // Harvester state
  const [harvesterModel, setHarvesterModel] = useState<string>('Paddy Track Combine Harvester');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([
    'harvester_paddy',
    'harvester_combine',
  ]);

  // Mini-Truck state
  const [truckModel, setTruckModel] = useState<string>('Tata Ace (Chhota Hathi - 1.5 Ton)');
  const [bodyType, setBodyType] = useState<'OPEN' | 'COVERED'>('OPEN');
  const [capacityTons, setCapacityTons] = useState<number>(1.5);
  const [selectedCargoSpecialties, setSelectedCargoSpecialties] = useState<string[]>([
    'truck_vegetable',
    'truck_paddy_bags',
  ]);

  // Audio announcement on screen load
  useEffect(() => {
    let welcome = '';
    if (machineryType === 'tractor') {
      welcome =
        language === 'hi'
          ? 'ट्रैक्टर दैनिक पंजीकरण। अपना कार्य उपकरण चुनें, फिर नाम और मोबाइल नंबर दर्ज करें।'
          : language === 'te'
          ? 'ట్రాక్టర్ రోజువారీ నమోదు. మీ పని పరికరాన్ని ఎంచుకుని, పేరు మరియు మొబైల్ నంబర్ నమోదు చేయండి.'
          : 'Tractor daily registration. Choose your working attachment, then enter name and mobile number.';
    } else if (machineryType === 'harvester') {
      welcome =
        language === 'hi'
          ? 'हार्वेस्टर पंजीकरण। समर्थित फसलें चुनें और संपर्क विवरण भरें।'
          : language === 'te'
          ? 'హార్వెస్టర్ నమోదు. పంటలను ఎంచుకుని వివరాలు నమోదు చేయండి.'
          : 'Harvester registration. Select supported crops and enter contact details.';
    } else {
      welcome =
        language === 'hi'
          ? 'मिनी-ट्रक परिवहन पंजीकरण। वाहन विनिर्देश चुनें और संपर्क विवरण दर्ज करें।'
          : language === 'te'
          ? 'మినీ ట్రక్ రవాణా నమోదు. వాహన వివరాలు మరియు ఫోన్ నంబర్ నమోదు చేయండి.'
          : 'Mini-truck registration. Choose vehicle configuration and enter contact details.';
    }
    speakText(welcome, language);
  }, [machineryType, language]);

  const handleSelectAttachment = (catId: string) => {
    setCurrentAttachment(catId);
    const cat = TRACTOR_CATEGORIES.find((c) => c.id === catId);
    if (cat) {
      const title = language === 'hi' ? cat.titleHi : language === 'te' ? cat.titleTe : cat.titleEn;
      const msg =
        language === 'hi'
          ? `उपकरण चुना गया: ${title}। अब नीचे मालिक का नाम और मोबाइल नंबर दर्ज करें।`
          : language === 'te'
          ? `పరికరం ఎంపిక చేయబడింది: ${title}. ఇప్పుడు క్రింద యజమాని పేరు మరియు మొబైల్ నంబర్ నమోదు చేయండి.`
          : `Selected implement: ${title}. Now enter owner name and mobile number below.`;
      speakText(msg, language);
    }
  };

  const toggleCrop = (id: string) => {
    setSelectedCrops((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCargo = (id: string) => {
    setSelectedCargoSpecialties((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory Name Validation
    const nameValidation = validateFullName(contactName);
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

    // 2. Mandatory Mobile Number Validation
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

    // 3. Mandatory Consent Check
    if (!consentAgreed) {
      setErrorMessage(t.consentRequired);
      speakText(t.consentRequired, language);
      return;
    }

    // 4. Machinery specific checks
    if (machineryType === 'tractor' && !currentAttachment) {
      const err =
        language === 'hi'
          ? 'कृपया वर्तमान कार्य उपकरण चुनें'
          : language === 'te'
          ? 'దయచేసి ప్రస్తుత పని పరికరాన్ని ఎంచుకోండి'
          : 'Please select current working attachment';
      setErrorMessage(err);
      speakText(err, language);
      return;
    }

    if (machineryType === 'harvester' && selectedCrops.length === 0) {
      const err =
        language === 'hi'
          ? 'कृपया कम से कम एक समर्थित फसल चुनें'
          : language === 'te'
          ? 'దయచేసి కనీసం ఒక పంటను ఎంచుకోండి'
          : 'Please select at least one supported crop';
      setErrorMessage(err);
      speakText(err, language);
      return;
    }

    if (machineryType === 'mini_truck' && selectedCargoSpecialties.length === 0) {
      const err =
        language === 'hi'
          ? 'कृपया कम से कम एक कार्गो विशेषता चुनें'
          : language === 'te'
          ? 'దయచేసి కనీసం ఒక రవాణా రకాన్ని ఎంచుకోండి'
          : 'Please select at least one cargo specialty';
      setErrorMessage(err);
      speakText(err, language);
      return;
    }

    setErrorMessage(null);

    const validPhone = phoneValidation.normalizedNumber || contactNumber.trim();

    // Prevent duplicate active registration for the same tractor on the same day
    if (machineryType === 'tractor' && existingTractors) {
      const todayStr = getKioskTodayDateString();
      const alreadyActiveToday = existingTractors.some(
        (tr) =>
          tr.isActiveToday &&
          tr.activeDate === todayStr &&
          (tr.contactNumber === validPhone || (tr.contactDemo && tr.contactDemo.includes(validPhone.slice(-6))))
      );
      if (alreadyActiveToday) {
        setErrorMessage(t.errDuplicateTractorToday);
        speakText(t.errDuplicateTractorToday, language);
        return;
      }
    }

    const successMsg =
      language === 'hi'
        ? 'मशीनरी पंजीकरण सफलतापूर्वक पूर्ण हुआ।'
        : language === 'te'
        ? 'యంత్రాల నమోదు విజయవంతంగా పూర్తయింది.'
        : 'Machinery registration submitted successfully.';
    speakText(successMsg, language);

    if (machineryType === 'tractor') {
      const data: TractorRegistrationForm = {
        tractorModel,
        currentAttachment,
        selectedAttachments: [currentAttachment],
        includesOperator,
        ownerName: contactName.trim(),
        contactNumber: validPhone,
        consentAgreed,
        vehiclePhotoUrl,
        notes: notes.trim() || undefined,
      };
      onSubmit({ type: 'tractor', data });
    } else if (machineryType === 'harvester') {
      const data: HarvesterRegistrationForm = {
        machineType: harvesterModel,
        compatibleCrops: selectedCrops,
        includesOperator: true,
        ownerName: contactName.trim(),
        contactNumber: validPhone,
        consentAgreed,
        vehiclePhotoUrl,
        notes: notes.trim() || undefined,
      };
      onSubmit({ type: 'harvester', data });
    } else {
      const data: MiniTruckRegistrationForm = {
        vehicleModel: truckModel,
        bodyType,
        capacityTons,
        cargoSpeciality: selectedCargoSpecialties,
        driverName: contactName.trim(),
        contactNumber: validPhone,
        consentAgreed,
        vehiclePhotoUrl,
        notes: notes.trim() || undefined,
      };
      onSubmit({ type: 'mini_truck', data });
    }
  };

  const getHeading = () => {
    switch (machineryType) {
      case 'tractor':
        return { title: t.tractorRegHeading, sub: t.tractorRegSubtitle };
      case 'harvester':
        return { title: t.harvesterRegHeading, sub: t.harvesterRegSubtitle };
      case 'mini_truck':
        return { title: t.miniTruckRegHeading, sub: t.miniTruckRegSubtitle };
    }
  };

  const { title, sub } = getHeading();

  return (
    <div className="kiosk-screen machinery-registration-screen">
      <div className="screen-header">
        <h2 className="screen-title">{title}</h2>
        <p className="screen-subtitle">{sub}</p>
      </div>

      <div className="optional-details-notice-bar">
        <p>
          📋 <strong>
            {language === 'hi'
              ? 'अनिवार्य पंजीकरण: किसानों से बुकिंग प्राप्त करने हेतु मालिक का नाम और मोबाइल नंबर अनिवार्य है।'
              : language === 'te'
              ? 'తప్పనిసరి నమోదు: రైతులు మిమ్మల్ని నేరుగా సంప్రదించడానికి యజమాని పేరు మరియు మొబైల్ నంబర్ తప్పనిసరి.'
              : 'Mandatory Registration: Provider name and mobile number are compulsory so farmers can call you.'}
          </strong>
        </p>
      </div>

      {machineryType === 'tractor' && (
        <div className="daily-tractor-notice-card">
          <div className="notice-icon">
            <Calendar size={24} />
          </div>
          <div className="notice-content">
            <h4>
              {language === 'hi'
                ? 'दैनिक पंजीकरण नियम (Valid Today Only)'
                : language === 'te'
                ? 'రోజువారీ నమోదు నియమం (Valid Today Only)'
                : 'Daily Registration Rule (Valid Today Only)'}
            </h4>
            <p>{t.tractorDailyRule}</p>
            {onGoToLogin && (
              <button
                type="button"
                className="kiosk-btn-outline inline-login-btn"
                onClick={onGoToLogin}
              >
                <KeyRound size={18} />
                <span>
                  {language === 'hi'
                    ? 'पहले से पंजीकृत हैं? OTP से लॉगिन करें'
                    : language === 'te'
                    ? 'ఇంతకుముందే నమోదయ్యారా? OTP తో లాగిన్ అవ్వండి'
                    : 'Already registered? Log in with OTP'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={22} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="kiosk-form">
        {/* TRACTOR SPECIFIC SECTION */}
        {machineryType === 'tractor' && (
          <>
            <div className="form-section">
              <h3 className="section-title">1. Tractor Details</h3>
              <div className="form-group">
                <label className="form-label">
                  <Wrench size={20} />
                  <span>{t.fieldTractorModel}</span>
                </label>
                <div className="wage-quick-chips">
                  {[
                    'Mahindra 575 DI (45 HP)',
                    'Swaraj 744 FE (48 HP)',
                    'John Deere 5050D (50 HP)',
                    'Farmtrac 60 Powermaxx',
                    'Sonalika DI 745 III',
                  ].map((model) => (
                    <button
                      key={model}
                      type="button"
                      className={`chip-btn ${tractorModel === model ? 'active' : ''}`}
                      onClick={() => setTractorModel(model)}
                    >
                      {model}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="kiosk-input"
                  value={tractorModel}
                  onChange={(e) => setTractorModel(e.target.value)}
                  required
                />
              </div>

              {/* Operator Inclusion */}
              <div className="form-group">
                <label className="form-label">
                  <span>{t.fieldOperatorIncluded}</span>
                </label>
                <div className="duration-chips">
                  <button
                    type="button"
                    className={`chip-btn ${includesOperator ? 'active' : ''}`}
                    onClick={() => setIncludesOperator(true)}
                  >
                    {t.optWithOperator}
                  </button>
                  <button
                    type="button"
                    className={`chip-btn ${!includesOperator ? 'active' : ''}`}
                    onClick={() => setIncludesOperator(false)}
                  >
                    {t.optEquipmentOnly}
                  </button>
                </div>
              </div>
            </div>

            {/* Single Current Working Attachment Selection */}
            <div className="form-section">
              <h3 className="section-title">2. {t.selectCurrentAttachment}</h3>
              <p className="section-optional-hint">
                💡 <strong>{t.singleAttachmentRule}</strong>
              </p>
              <div className="skills-multi-grid">
                {TRACTOR_CATEGORIES.map((cat: CategoryItem) => {
                  const isChecked = currentAttachment === cat.id;
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
                      className={`skill-select-card ${isChecked ? 'selected' : ''}`}
                      onClick={() => handleSelectAttachment(cat.id)}
                    >
                      <div className="skill-check-icon">
                        {isChecked ? <CircleDot size={22} /> : <Circle size={22} />}
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
          </>
        )}

        {/* HARVESTER SPECIFIC SECTION */}
        {machineryType === 'harvester' && (
          <>
            <div className="form-section">
              <h3 className="section-title">1. Harvester Machine Specifications</h3>
              <div className="form-group">
                <label className="form-label">
                  <Wrench size={20} />
                  <span>{t.fieldHarvesterModel}</span>
                </label>
                <div className="wage-quick-chips">
                  {[
                    'Rubber Track Paddy Combine',
                    'Multi-Crop Wheel Combine',
                    'Self-Propelled Reaper Binder',
                    'Stationary Multi-Crop Thresher',
                  ].map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`chip-btn ${harvesterModel === m ? 'active' : ''}`}
                      onClick={() => setHarvesterModel(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="kiosk-input"
                  value={harvesterModel}
                  onChange={(e) => setHarvesterModel(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Compatible Crops Checklist */}
            <div className="form-section">
              <h3 className="section-title">2. {t.fieldCrops}</h3>
              <div className="skills-multi-grid">
                {HARVESTER_CATEGORIES.map((cat: CategoryItem) => {
                  const isChecked = selectedCrops.includes(cat.id);
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
                      className={`skill-select-card ${isChecked ? 'selected' : ''}`}
                      onClick={() => toggleCrop(cat.id)}
                    >
                      <div className="skill-check-icon">
                        {isChecked ? <CheckSquare size={22} /> : <Square size={22} />}
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
          </>
        )}

        {/* MINI-TRUCK SPECIFIC SECTION */}
        {machineryType === 'mini_truck' && (
          <>
            <div className="form-section">
              <h3 className="section-title">1. Transport Vehicle Specifications</h3>
              <div className="form-group">
                <label className="form-label">
                  <Truck size={20} />
                  <span>{t.fieldTruckModel}</span>
                </label>
                <div className="wage-quick-chips">
                  {[
                    'Tata Ace (Chhota Hathi - 1.5T)',
                    'Mahindra Bolero Pik-Up (2.0T)',
                    'Ashok Leyland Dost (1.8T)',
                    'Mahindra Maxi Truck Plus (2.5T)',
                  ].map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`chip-btn ${truckModel === m ? 'active' : ''}`}
                      onClick={() => setTruckModel(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="kiosk-input"
                  value={truckModel}
                  onChange={(e) => setTruckModel(e.target.value)}
                  required
                />
              </div>

              {/* Body Type */}
              <div className="form-group">
                <label className="form-label">
                  <span>{t.fieldBodyType}</span>
                </label>
                <div className="duration-chips">
                  <button
                    type="button"
                    className={`chip-btn ${bodyType === 'OPEN' ? 'active' : ''}`}
                    onClick={() => setBodyType('OPEN')}
                  >
                    {t.bodyTypeOpen}
                  </button>
                  <button
                    type="button"
                    className={`chip-btn ${bodyType === 'COVERED' ? 'active' : ''}`}
                    onClick={() => setBodyType('COVERED')}
                  >
                    {t.bodyTypeCovered}
                  </button>
                </div>
              </div>

              {/* Capacity */}
              <div className="form-group">
                <label className="form-label">
                  <span>{t.fieldCapacity}</span>
                </label>
                <div className="wage-quick-chips">
                  {[1.0, 1.5, 2.0, 2.5, 3.0].map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`chip-btn ${capacityTons === c ? 'active' : ''}`}
                      onClick={() => setCapacityTons(c)}
                    >
                      {c} {language === 'hi' ? 'टन' : language === 'te' ? 'టన్నులు' : 'Tons'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cargo Specialties */}
            <div className="form-section">
              <h3 className="section-title">2. Supported Produce & Cargo</h3>
              <div className="skills-multi-grid">
                {MINI_TRUCK_CATEGORIES.map((cat: CategoryItem) => {
                  const isChecked = selectedCargoSpecialties.includes(cat.id);
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
                      className={`skill-select-card ${isChecked ? 'selected' : ''}`}
                      onClick={() => toggleCargo(cat.id)}
                    >
                      <div className="skill-check-icon">
                        {isChecked ? <CheckSquare size={22} /> : <Square size={22} />}
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
          </>
        )}

        {/* COMMON MANDATORY CONTACT & CONSENT SECTION */}
        <div className="form-section">
          <h3 className="section-title">
            {language === 'hi'
              ? 'संपर्क विवरण (अनिवार्य)'
              : language === 'te'
              ? 'సంప్రదింపు వివరాలు (తప్పనిసరి)'
              : 'Contact Person Details (Mandatory)'}
          </h3>
          <p className="section-optional-hint">
            {language === 'hi'
              ? '(पूरा नाम और 10-अंकों का वैध मोबाइल नंबर दर्ज करना अनिवार्य है)'
              : language === 'te'
              ? '(పూర్తి పేరు మరియు సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయడం తప్పనిసరి)'
              : '(Full Name and valid 10-digit Indian Mobile Number are mandatory)'}
          </p>

          <div className="form-group">
            <label className="form-label">
              <User size={20} />
              <span>{t.fieldOwnerName} *</span>
            </label>
            <input
              type="text"
              className="kiosk-input"
              value={contactName}
              required
              placeholder={
                language === 'hi'
                  ? 'उदा: बी. वेंकटेश्वर राव'
                  : language === 'te'
                  ? 'ఉదా: బి. వెంకటేశ్వర్లు'
                  : 'e.g. B. Venkateswarlu'
              }
              onChange={(e) => setContactName(e.target.value)}
              onFocus={() =>
                speakText(
                  language === 'hi'
                    ? 'मालिक या चालक का पूरा नाम दर्ज करें।'
                    : language === 'te'
                    ? 'యజమాని లేదా డ్రైవర్ పూర్తి పేరు నమోదు చేయండి.'
                    : 'Enter owner or driver full name.',
                  language
                )
              }
            />
          </div>

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
              placeholder="e.g. 9848012345"
              onChange={(e) => setContactNumber(e.target.value)}
              onFocus={() =>
                speakText(
                  language === 'hi'
                    ? 'सत्यापन हेतु 10 अंकों का मोबाइल नंबर दर्ज करें।'
                    : language === 'te'
                    ? 'ధృవీకరణ కోసం 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'
                    : 'Enter your 10-digit Indian mobile number.',
                  language
                )
              }
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>{t.fieldNotes}</span>
            </label>
            <input
              type="text"
              className="kiosk-input"
              value={notes}
              placeholder={
                language === 'hi'
                  ? 'उदा: रामपुर ग्राम पंचायत कार्यालय के पास उपलब्ध'
                  : language === 'te'
                  ? 'ఉదా: రాంపూర్ గ్రామ పంచాయతీ దగ్గర అందుబాటులో ఉంది'
                  : 'e.g. Stationed near Rampur Gram Panchayat office'
              }
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* VEHICLE / MACHINERY PHOTO UPLOAD */}
          <VehiclePhotoUploader
            photoUrl={vehiclePhotoUrl}
            onPhotoChange={setVehiclePhotoUrl}
            currentLang={language}
            vehicleType={
              machineryType === 'tractor'
                ? 'tractor'
                : machineryType === 'harvester'
                ? 'harvester'
                : 'miniTruck'
            }
          />

          <div className="consent-explanation-box">
            <p>{t.consentExplanation}</p>
          </div>

          <div
            className="consent-checkbox-card"
            onClick={() => setConsentAgreed(!consentAgreed)}
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

        {/* Action Buttons */}
        <div className="form-submit-row">
          <button type="submit" className="kiosk-btn-primary search-submit-btn">
            <Sparkles size={24} strokeWidth={2.5} />
            <span>{t.btnSubmitRegistration}</span>
          </button>

          <button type="button" className="kiosk-btn-outline" onClick={onCancel}>
            {language === 'hi' ? 'रद्द करें' : language === 'te' ? 'రద్దు చేయండి' : 'CANCEL'}
          </button>
        </div>
      </form>
    </div>
  );
};
