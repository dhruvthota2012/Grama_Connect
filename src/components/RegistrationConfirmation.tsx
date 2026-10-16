import React, { useEffect } from 'react';
import { Language, AnyRegistrationData } from '../types';
import { translations } from '../i18n/translations';
import { ALL_SUBCATEGORIES } from '../data/categories';
import { speakText } from '../utils/speechGuidance';
import { CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface RegistrationConfirmationProps {
  language: Language;
  registration: AnyRegistrationData;
  referenceNumber: string;
  onDone: () => void;
}

export const RegistrationConfirmation: React.FC<RegistrationConfirmationProps> = ({
  language,
  registration,
  referenceNumber,
  onDone,
}) => {
  const t = translations[language];

  useEffect(() => {
    const msg =
      language === 'hi'
        ? `पंजीकरण सफलतापूर्वक पूरा हुआ। टोकन नंबर है ${referenceNumber}। आपका विवरण अब रामपुर पंचायत में सक्रिय है।`
        : language === 'te'
        ? `నమోదు విజయవంతంగా పూర్తయింది. టోకెన్ సంఖ్య ${referenceNumber}. మీ వివరాలు రాంపూర్ పంచాయతీలో అందుబాటులో ఉన్నాయి.`
        : `Registration completed successfully. Your reference token is ${referenceNumber}. Your details are now active at Rampur Panchayat.`;
    speakText(msg, language);
  }, [language, referenceNumber]);

  const getSubcatTitle = (id: string, service: 'person' | 'tractor' | 'harvester' | 'mini_truck') => {
    const list = ALL_SUBCATEGORIES[service] || [];
    const item = list.find((c) => c.id === id);
    if (!item) return id;
    return language === 'hi'
      ? item.titleHi || item.titleEn
      : language === 'te'
      ? item.titleTe
      : item.titleEn;
  };

  const renderDetails = () => {
    switch (registration.type) {
      case 'worker': {
        const d = registration.data;
        return (
          <div className="summary-grid-2">
            <div className="sum-field">
              <span className="sum-label">{t.fieldName}:</span>
              <span className="sum-val">
                {d.name ||
                  (language === 'hi'
                    ? 'नाम नहीं दिया गया (गुमनाम)'
                    : language === 'te'
                    ? 'పేరు పేర్కొనబడలేదు (ఐచ్ఛికం)'
                    : 'Not specified (Anonymous)')}
              </span>
            </div>
            <div className="sum-field">
              <span className="sum-label">{t.fieldPhone}:</span>
              <span className="sum-val">
                {d.contactNumber ||
                  (language === 'hi'
                    ? 'फ़ोन नंबर नहीं दिया गया'
                    : language === 'te'
                    ? 'ఫోన్ పేర్కొనబడలేదు'
                    : 'Not provided')}
              </span>
            </div>
            <div className="sum-field full-width">
              <span className="sum-label">{t.skillsLabel}:</span>
              <div className="chips-wrap">
                {d.selectedSkills.map((sk) => (
                  <span key={sk} className="skill-chip-pill">
                    {getSubcatTitle(sk, 'person')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'tractor': {
        const d = registration.data;
        return (
          <div className="summary-grid-2">
            <div className="sum-field">
              <span className="sum-label">Tractor Model:</span>
              <span className="sum-val"><strong>{d.tractorModel}</strong></span>
            </div>
            <div className="sum-field">
              <span className="sum-label">Service Type:</span>
              <span className="sum-val">{d.includesOperator ? t.optWithOperator : t.optEquipmentOnly}</span>
            </div>
            <div className="sum-field">
              <span className="sum-label">{t.fieldOwnerName}:</span>
              <span className="sum-val">
                {d.ownerName ||
                  (language === 'hi'
                    ? 'उल्लेख नहीं किया गया'
                    : language === 'te'
                    ? 'పేర్కొనబడలేదు'
                    : 'Not provided')}
              </span>
            </div>
            <div className="sum-field">
              <span className="sum-label">{t.fieldPhone}:</span>
              <span className="sum-val">
                {d.contactNumber ||
                  (language === 'hi'
                    ? 'उल्लेख नहीं किया गया'
                    : language === 'te'
                    ? 'పేర్కొనబడలేదు'
                    : 'Not provided')}
              </span>
            </div>
            <div className="sum-field full-width">
              <span className="sum-label">{t.fieldAttachments}:</span>
              <div className="chips-wrap">
                {d.selectedAttachments.map((att) => (
                  <span key={att} className="skill-chip-pill">
                    {getSubcatTitle(att, 'tractor')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'harvester': {
        const d = registration.data;
        return (
          <div className="summary-grid-2">
            <div className="sum-field">
              <span className="sum-label">Machine Type:</span>
              <span className="sum-val"><strong>{d.machineType}</strong></span>
            </div>
            <div className="sum-field">
              <span className="sum-label">{t.fieldOwnerName}:</span>
              <span className="sum-val">
                {d.ownerName ||
                  (language === 'hi'
                    ? 'उल्लेख नहीं किया गया'
                    : language === 'te'
                    ? 'పేర్కొనబడలేదు'
                    : 'Not provided')}
              </span>
            </div>
            <div className="sum-field">
              <span className="sum-label">{t.fieldPhone}:</span>
              <span className="sum-val">
                {d.contactNumber ||
                  (language === 'hi'
                    ? 'उल्लेख नहीं किया गया'
                    : language === 'te'
                    ? 'పేర్కొనబడలేదు'
                    : 'Not provided')}
              </span>
            </div>
            <div className="sum-field full-width">
              <span className="sum-label">{t.fieldCrops}:</span>
              <div className="chips-wrap">
                {d.compatibleCrops.map((cr) => (
                  <span key={cr} className="skill-chip-pill">
                    {getSubcatTitle(cr, 'harvester')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }
      case 'mini_truck': {
        const d = registration.data;
        return (
          <div className="summary-grid-2">
            <div className="sum-field">
              <span className="sum-label">Vehicle Model:</span>
              <span className="sum-val"><strong>{d.vehicleModel}</strong></span>
            </div>
            <div className="sum-field">
              <span className="sum-label">Cargo Body:</span>
              <span className="sum-val">{d.bodyType === 'OPEN' ? t.bodyTypeOpen : t.bodyTypeCovered} ({d.capacityTons}T)</span>
            </div>
            <div className="sum-field">
              <span className="sum-label">{t.fieldOwnerName}:</span>
              <span className="sum-val">
                {d.driverName ||
                  (language === 'hi'
                    ? 'उल्लेख नहीं किया गया'
                    : language === 'te'
                    ? 'పేర్కొనబడలేదు'
                    : 'Not provided')}
              </span>
            </div>
            <div className="sum-field">
              <span className="sum-label">{t.fieldPhone}:</span>
              <span className="sum-val">
                {d.contactNumber ||
                  (language === 'hi'
                    ? 'उल्लेख नहीं किया गया'
                    : language === 'te'
                    ? 'పేర్కొనబడలేదు'
                    : 'Not provided')}
              </span>
            </div>
            <div className="sum-field full-width">
              <span className="sum-label">Cargo Specialties:</span>
              <div className="chips-wrap">
                {d.cargoSpeciality.map((sp) => (
                  <span key={sp} className="skill-chip-pill">
                    {getSubcatTitle(sp, 'mini_truck')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="kiosk-screen registration-confirmation-screen">
      <div className="success-banner-box">
        <CheckCircle size={60} strokeWidth={2.5} />
        <h2 className="success-title">{t.regReviewTitle}</h2>
        <p className="success-subtitle">{t.regReviewSubtitle}</p>
        <div className="worker-id-badge">
          <span>Registration Token:</span>
          <strong>{referenceNumber}</strong>
        </div>
      </div>

      {/* Prominent Demo Notice */}
      <div className="demo-warning-banner">
        <AlertTriangle size={20} />
        <span>{t.demoRegNotice}</span>
      </div>

      {/* Profile Review Card */}
      <div className="registration-summary-card">
        <h3 className="card-section-heading">
          {language === 'hi'
            ? 'दर्ज विवरण की समीक्षा'
            : language === 'te'
            ? 'నమోదైన వివరాల సమీక్ష'
            : 'Submitted Listing Review'}
        </h3>
        {renderDetails()}
      </div>

      {/* Action Buttons */}
      <div className="confirmation-actions-row">
        <button type="button" className="kiosk-btn-primary action-btn" onClick={onDone}>
          <span>
            {language === 'hi'
              ? 'पूर्ण करें / होम पर जाएं'
              : language === 'te'
              ? 'ముగించండి / హోమ్‌కు వెళ్లండి'
              : 'FINISH / RETURN TO HOME'}
          </span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
