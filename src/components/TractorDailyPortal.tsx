import React, { useState } from 'react';
import { Language, TractorService, CategoryItem } from '../types';
import { translations } from '../i18n/translations';
import { TRACTOR_CATEGORIES } from '../data/categories';
import { AgriculturalIllustration } from '../assets/illustrations';
import {
  isTractorActiveForDate,
  activateTractorForToday,
  deactivateTractor,
  changeTractorAttachment,
  getKioskTodayDateString,
  KIOSK_TIMEZONE,
} from '../utils/dailyAvailability';
import { speakText } from '../utils/speechGuidance';
import {
  Power,
  PowerOff,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  PlusCircle,
  ArrowLeft,
  CircleDot,
  Circle,
  Award,
} from 'lucide-react';

interface TractorDailyPortalProps {
  language: Language;
  tractors: TractorService[];
  onUpdateTractor: (updated: TractorService) => void;
  onNavigateBack: () => void;
  onRegisterNewTractor: () => void;
}

export const TractorDailyPortal: React.FC<TractorDailyPortalProps> = ({
  language,
  tractors,
  onUpdateTractor,
  onNavigateBack,
  onRegisterNewTractor,
}) => {
  const t = translations[language];
  const todayStr = getKioskTodayDateString();

  // Selected tractor profile to view/manage (defaults to first tractor)
  const [selectedTractorId, setSelectedTractorId] = useState<string>(
    tractors.length > 0 ? tractors[0].id : ''
  );

  const activeTractor = tractors.find((tr) => tr.id === selectedTractorId) || tractors[0];

  const handleActivate = (tr: TractorService) => {
    const attachmentToUse =
      tr.currentAttachment || (tr.attachments && tr.attachments[0]) || 'tractor_rotavator';
    const updated = activateTractorForToday(tr, attachmentToUse);
    onUpdateTractor(updated);

    const attCat = TRACTOR_CATEGORIES.find((c) => c.id === attachmentToUse);
    const attTitle =
      attCat ? (language === 'hi' ? attCat.titleHi : language === 'te' ? attCat.titleTe : attCat.titleEn) : '';
    speakText(`${t.tractorActivatedAnnounce} ${attTitle}`, language);
  };

  const handleDeactivate = (tr: TractorService) => {
    const updated = deactivateTractor(tr);
    onUpdateTractor(updated);
    speakText(t.tractorDeactivatedAnnounce, language);
  };

  const handleSelectAttachment = (tr: TractorService, attachmentId: string) => {
    const updated = changeTractorAttachment(tr, attachmentId);
    onUpdateTractor(updated);

    const attCat = TRACTOR_CATEGORIES.find((c) => c.id === attachmentId);
    const attTitle =
      attCat ? (language === 'hi' ? attCat.titleHi : language === 'te' ? attCat.titleTe : attCat.titleEn) : '';
    speakText(`${t.attachmentChangedAnnounce} ${attTitle}`, language);
  };

  if (tractors.length === 0) {
    return (
      <div className="kiosk-screen tractor-portal-screen">
        <div className="screen-header">
          <h2 className="screen-title">{t.tractorDriverPortal}</h2>
          <p className="screen-subtitle">{t.tractorDriverPortalSub}</p>
        </div>

        <div className="empty-results-box">
          <AlertTriangle size={48} />
          <h3>No Registered Tractors Found</h3>
          <p>
            Please register your tractor profile first. Once registered, your details are saved permanently
            and you only need to activate availability daily.
          </p>
          <div className="empty-actions-row">
            <button
              type="button"
              className="kiosk-btn-primary"
              onClick={onRegisterNewTractor}
            >
              <PlusCircle size={20} />
              <span>Register New Tractor</span>
            </button>
            <button
              type="button"
              className="kiosk-btn-outline"
              onClick={onNavigateBack}
            >
              <ArrowLeft size={20} />
              <span>{t.btnBack}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentActive = isTractorActiveForDate(activeTractor, todayStr);
  const currentAttachmentId = activeTractor.currentAttachment || activeTractor.attachments[0] || 'tractor_rotavator';
  const currentAttachmentCat = TRACTOR_CATEGORIES.find((c) => c.id === currentAttachmentId);
  const currentAttachmentTitle = currentAttachmentCat
    ? language === 'hi'
      ? currentAttachmentCat.titleHi
      : language === 'te'
      ? currentAttachmentCat.titleTe
      : currentAttachmentCat.titleEn
    : currentAttachmentId;

  const driverName =
    (language === 'hi' ? activeTractor.ownerNameHi : language === 'te' ? activeTractor.ownerNameTe : activeTractor.ownerNameEn) ||
    activeTractor.ownerNameEn ||
    'Registered Tractor Driver';

  return (
    <div className="kiosk-screen tractor-portal-screen">
      <div className="screen-header">
        <div className="header-meta-row">
          <span className="kiosk-loc-tag">
            <Calendar size={16} />
            <span>Kiosk Date: <strong>{todayStr}</strong> ({KIOSK_TIMEZONE})</span>
          </span>
        </div>
        <h2 className="screen-title">{t.tractorDriverPortal}</h2>
        <p className="screen-subtitle">{t.tractorDriverPortalSub}</p>
      </div>

      {/* Profile Selector if multiple tractors are registered */}
      {tractors.length > 1 && (
        <div className="profile-selector-bar">
          <span className="selector-label">{t.registeredTractorDriverLabel}:</span>
          <div className="profile-chips">
            {tractors.map((tr) => (
              <button
                key={tr.id}
                type="button"
                className={`profile-chip ${selectedTractorId === tr.id ? 'active' : ''}`}
                onClick={() => setSelectedTractorId(tr.id)}
              >
                <span>{tr.ownerNameEn || tr.tractorModel}</span>
                <span className={`micro-status ${isTractorActiveForDate(tr, todayStr) ? 'micro-active' : 'micro-inactive'}`}>
                  {isTractorActiveForDate(tr, todayStr) ? '● ACTIVE' : '○ INACTIVE'}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Driver Management Panel */}
      <div className="tractor-management-card">
        {/* Top Info Bar */}
        <div className="driver-summary-row">
          <div className="driver-info-block">
            <div className="driver-name-group">
              <User size={22} />
              <h3 className="driver-name">{driverName}</h3>
            </div>
            <div className="driver-meta-group">
              <span className="driver-phone">
                <Phone size={16} />
                <strong>{activeTractor.contactDemo || '98480-11901'}</strong>
              </span>
              <span className="meta-sep">•</span>
              <span className="tractor-model-badge">{activeTractor.tractorModel}</span>
              <span className="meta-sep">•</span>
              <span className="village-badge">{activeTractor.villageNameEn}</span>
            </div>
          </div>

          {/* Large Live Status Badge */}
          <div className="driver-status-block">
            <div className={`kiosk-status-badge ${isCurrentActive ? 'badge-active' : 'badge-inactive'}`}>
              <span className="status-indicator-dot" />
              <strong>{isCurrentActive ? t.statusActiveToday : t.statusInactive}</strong>
            </div>
          </div>
        </div>

        {/* Current Active Attachment Display */}
        <div className="current-attachment-display-box">
          <div className="curr-att-col-info">
            <span className="curr-att-k">Current Working Attachment:</span>
            <div className="curr-att-v">
              {isCurrentActive ? (
                <>
                  <Award size={18} />
                  <strong>Tractor + {currentAttachmentTitle}</strong>
                </>
              ) : (
                <span className="curr-att-inactive">
                  Inactive — Select attachment below and click "Activate for Today"
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Button: Activate or Deactivate */}
          <div className="curr-att-col-btn">
            {isCurrentActive ? (
              <button
                type="button"
                className="kiosk-btn-deactivate"
                onClick={() => handleDeactivate(activeTractor)}
              >
                <PowerOff size={22} />
                <span>{t.deactivateToday}</span>
              </button>
            ) : (
              <button
                type="button"
                className="kiosk-btn-activate"
                onClick={() => handleActivate(activeTractor)}
              >
                <Power size={22} strokeWidth={2.5} />
                <span>{t.activateForToday}</span>
              </button>
            )}
          </div>
        </div>

        {/* Attachment Selection: Strictly ONLY ONE attachment at any given time */}
        <div className="attachment-selection-section">
          <div className="attachment-section-header">
            <h4 className="att-sec-title">
              {t.selectCurrentAttachment}
            </h4>
            <p className="att-sec-rule">
              ⚖️ <strong>{t.singleAttachmentRule}</strong>
            </p>
          </div>

          <div className="skills-multi-grid">
            {TRACTOR_CATEGORIES.map((cat: CategoryItem) => {
              const isSelected = currentAttachmentId === cat.id;
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
                  onClick={() => handleSelectAttachment(activeTractor, cat.id)}
                >
                  <div className="skill-check-icon">
                    {isSelected ? <CircleDot size={24} /> : <Circle size={24} />}
                  </div>
                  <div className="skill-illus">
                    <AgriculturalIllustration name={cat.illustrationKey} size={64} />
                  </div>
                  <div className="skill-label">
                    <span className="skill-main-text">{title}</span>
                    <span className="skill-sub-text">{subtitle}</span>
                  </div>
                  {isSelected && (
                    <div className="current-work-pill">
                      {isCurrentActive ? 'ACTIVE NOW' : 'SELECTED'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="portal-footer-row">
        <button
          type="button"
          className="kiosk-btn-outline"
          onClick={onNavigateBack}
        >
          <ArrowLeft size={20} />
          <span>{t.btnBack}</span>
        </button>

        <button
          type="button"
          className="kiosk-btn-secondary"
          onClick={onRegisterNewTractor}
        >
          <PlusCircle size={20} />
          <span>Register Another Tractor</span>
        </button>
      </div>
    </div>
  );
};
