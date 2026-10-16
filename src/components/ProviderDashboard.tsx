import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import {
  TRACTOR_CATEGORIES,
  PERSON_CATEGORIES,
  HARVESTER_CATEGORIES,
  MINI_TRUCK_CATEGORIES,
} from '../data/categories';
import { AgriculturalIllustration } from '../assets/illustrations';
import { VehiclePhotoUploader } from './VehiclePhotoUploader';
import {
  ProviderAccount,
  TractorAccount,
  WorkerAccount,
  HarvesterAccount,
  MiniTruckAccount,
  updateAccountStatus,
  updateTractorAttachment,
  activateTractorDailyRegistration,
  updateVehiclePhoto,
  upsertProviderAccount,
  isTractorRegistrationValidToday,
} from '../utils/providerAccounts';
import { getKioskTodayDateString, KIOSK_TIMEZONE } from '../utils/dailyAvailability';
import { speakText } from '../utils/speechGuidance';
import {
  User,
  Phone,
  Power,
  PowerOff,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Calendar,
  Sparkles,
  Edit2,
  Check,
  Home,
} from 'lucide-react';

interface ProviderDashboardProps {
  language: Language;
  account: ProviderAccount;
  onUpdateAccount: (updated: ProviderAccount) => void;
  onLogout: () => void;
  onReturnHome: () => void;
}

type DashboardTab = 'tractor' | 'mini_truck' | 'harvester' | 'implements' | 'worker';

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  language,
  account,
  onUpdateAccount,
  onLogout,
  onReturnHome,
}) => {
  const t = translations[language];
  const todayStr = getKioskTodayDateString();

  const [currentAccount, setCurrentAccount] = useState<ProviderAccount>(account);
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (account.type === 'tractor') return 'tractor';
    if (account.type === 'mini_truck') return 'mini_truck';
    if (account.type === 'harvester') return 'harvester';
    return 'worker';
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(account.name);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Screen entrance guidance
  useEffect(() => {
    const msg =
      language === 'te'
        ? `స్వాగతం ${currentAccount.name || 'ప్రొవైడర్'}. ప్రొవైడర్ డ్యాష్‌బోర్డ్. మీ లభ్యత స్థితిని ఇక్కడ నియంత్రించవచ్చు.`
        : language === 'hi'
        ? `स्वागत है ${currentAccount.name || 'प्रदाता'}। प्रदाता डैशबोर्ड। अपनी उपलब्धता स्थिति यहां प्रबंधित करें।`
        : `Welcome ${currentAccount.name || 'Provider'}. Provider dashboard. Manage your availability status here.`;
    speakText(msg, language);
  }, [language, currentAccount.name]);

  // Toggle Active / Inactive Status
  const handleToggleStatus = (newStatus: boolean) => {
    const updated = updateAccountStatus(currentAccount.mobile, newStatus);
    if (updated) {
      setCurrentAccount(updated);
      onUpdateAccount(updated);

      const msg = newStatus
        ? language === 'hi'
          ? 'स्थिति बदलकर सक्रिय कर दी गई है।'
          : language === 'te'
          ? 'స్థితి యాక్టివ్‌గా మార్చబడింది.'
          : 'Status changed to ACTIVE.'
        : language === 'hi'
          ? 'स्थिति बदलकर निष्क्रिय कर दी गई है।'
          : language === 'te'
          ? 'స్థితి నిష్క్రియం చేయబడింది.'
          : 'Status changed to INACTIVE.';

      showNotification(msg);
      speakText(msg, language);
    }
  };

  // Tractor: Change Single Working Attachment
  const handleSelectAttachment = (attachmentId: string) => {
    const updated = updateTractorAttachment(currentAccount.mobile, attachmentId);
    if (updated) {
      setCurrentAccount(updated);
      onUpdateAccount(updated);

      const cat = TRACTOR_CATEGORIES.find((c) => c.id === attachmentId);
      const catTitle = cat
        ? language === 'hi'
          ? cat.titleHi
          : language === 'te'
          ? cat.titleTe
          : cat.titleEn
        : attachmentId;

      const announce = `${t.attachmentChangedAnnounce} ${catTitle}`;
      showNotification(announce);
      speakText(announce, language);
    }
  };

  // Tractor: Activate for Today (Daily Registration Renewal)
  const handleActivateTractorToday = () => {
    const defaultAttachment =
      currentAccount.type === 'tractor'
        ? (currentAccount as TractorAccount).currentAttachment
        : 'tractor_rotavator';

    const updated = activateTractorDailyRegistration(
      currentAccount.mobile,
      defaultAttachment
    );
    if (updated) {
      setCurrentAccount(updated);
      onUpdateAccount(updated);

      const msg = t.tractorActivatedAnnounce;
      showNotification(msg);
      speakText(msg, language);
    }
  };

  // Worker: Toggle Skills
  const handleToggleWorkerSkill = (skillId: string) => {
    const workerAcc = currentAccount as WorkerAccount;
    const existingSkills = workerAcc.skills || [];
    const exists = existingSkills.includes(skillId);
    const newSkills = exists
      ? existingSkills.filter((s) => s !== skillId)
      : [...existingSkills, skillId];

    if (newSkills.length === 0) {
      showNotification('At least one farm skill must remain selected.');
      return;
    }

    const updated: WorkerAccount = {
      ...workerAcc,
      type: 'worker',
      skills: newSkills,
    };
    upsertProviderAccount(updated);
    setCurrentAccount(updated);
    onUpdateAccount(updated);
    showNotification('Skills updated successfully.');
  };

  // Mini-Truck: Toggle Cargo Speciality
  const handleToggleCargoSpeciality = (cargoId: string) => {
    const truckAcc = currentAccount as MiniTruckAccount;
    const existing = truckAcc.cargoSpeciality || [];
    const exists = existing.includes(cargoId);
    const newCargo = exists
      ? existing.filter((c) => c !== cargoId)
      : [...existing, cargoId];

    if (newCargo.length === 0) {
      showNotification('At least one cargo type must remain selected.');
      return;
    }

    const updated: MiniTruckAccount = {
      ...truckAcc,
      type: 'mini_truck',
      cargoSpeciality: newCargo,
    };
    upsertProviderAccount(updated);
    setCurrentAccount(updated);
    onUpdateAccount(updated);
    showNotification('Cargo specialities updated.');
  };

  // Harvester: Toggle Compatible Crop
  const handleToggleHarvesterCrop = (cropId: string) => {
    const hvAcc = currentAccount as HarvesterAccount;
    const existing = hvAcc.compatibleCrops || [];
    const exists = existing.includes(cropId);
    const newCrops = exists
      ? existing.filter((c) => c !== cropId)
      : [...existing, cropId];

    if (newCrops.length === 0) {
      showNotification('At least one crop must remain selected.');
      return;
    }

    const updated: HarvesterAccount = {
      ...hvAcc,
      type: 'harvester',
      compatibleCrops: newCrops,
    };
    upsertProviderAccount(updated);
    setCurrentAccount(updated);
    onUpdateAccount(updated);
    showNotification('Harvester crops updated.');
  };

  // Vehicle Photo Update
  const handlePhotoChange = (newPhotoUrl: string | undefined) => {
    const updated = updateVehiclePhoto(currentAccount.mobile, newPhotoUrl || null);
    if (updated) {
      setCurrentAccount(updated);
      onUpdateAccount(updated);
    } else {
      const nextAcc = { ...currentAccount, vehiclePhotoUrl: newPhotoUrl };
      upsertProviderAccount(nextAcc);
      setCurrentAccount(nextAcc);
      onUpdateAccount(nextAcc);
    }
  };

  // Save Edited Name
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim()) return;

    const updated = {
      ...currentAccount,
      name: editedName.trim(),
    };
    upsertProviderAccount(updated);
    setCurrentAccount(updated);
    onUpdateAccount(updated);
    setIsEditingName(false);
    showNotification('Name updated successfully.');
  };

  const isTractor = currentAccount.type === 'tractor';
  const tractorAcc = isTractor ? (currentAccount as TractorAccount) : null;
  const isTractorValidToday = tractorAcc ? isTractorRegistrationValidToday(tractorAcc, todayStr) : false;

  return (
    <div className="kiosk-screen provider-dashboard-screen">
      {/* 1. TOP PROFILE CARD */}
      <div className="dashboard-profile-header">
        <div className="profile-identity-group">
          <div className="profile-avatar-circle">
            <User size={30} />
          </div>
          <div className="profile-name-col">
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="inline-edit-name-form">
                <input
                  type="text"
                  className="edit-name-input"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  autoFocus
                />
                <button type="submit" className="save-name-btn" title="Save name">
                  <Check size={16} />
                </button>
              </form>
            ) : (
              <div className="profile-name-row">
                <h2 className="provider-name-heading">{currentAccount.name}</h2>
                <button
                  type="button"
                  className="edit-name-trigger"
                  onClick={() => setIsEditingName(true)}
                  title="Edit name"
                >
                  <Edit2 size={15} />
                </button>
              </div>
            )}
            <div className="profile-meta-pills">
              <span className="profile-phone-pill">
                <Phone size={13} />
                <span>+91 {currentAccount.mobile}</span>
              </span>
              <span className="profile-type-badge">
                {currentAccount.type === 'tractor'
                  ? 'TRACTOR OPERATOR'
                  : currentAccount.type === 'worker'
                  ? 'FARM LABOURER'
                  : currentAccount.type === 'harvester'
                  ? 'HARVESTER OPERATOR'
                  : 'MINI-TRUCK DRIVER'}
              </span>
              <span className="kiosk-date-badge">
                <Calendar size={13} />
                <span>{todayStr} ({KIOSK_TIMEZONE})</span>
              </span>
            </div>
          </div>
        </div>

        <div className="profile-header-actions">
          <span
            className={`status-pill-large ${
              currentAccount.isActive ? 'pill-active' : 'pill-inactive'
            }`}
          >
            {currentAccount.isActive ? (
              <>
                <Power size={16} />
                <span>{t.statusActive}</span>
              </>
            ) : (
              <>
                <PowerOff size={16} />
                <span>{t.statusInactive}</span>
              </>
            )}
          </span>

          <button
            type="button"
            className="dashboard-logout-btn"
            onClick={onLogout}
            title={t.btnLogout}
          >
            <LogOut size={16} />
            <span>{t.btnLogout}</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="dashboard-toast-banner" role="status">
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. WORK & SEARCH AVAILABILITY TOGGLE CARD */}
      <div className="dashboard-section-card status-section-card">
        <div className="card-top-row">
          <div>
            <h3 className="section-card-title">{t.providerStatusLabel}</h3>
            <p className="section-card-desc">
              {currentAccount.isActive ? t.statusActiveDesc : t.statusInactiveDesc}
            </p>
          </div>
        </div>

        <div className="status-toggle-controls">
          {currentAccount.isActive ? (
            <button
              type="button"
              className="kiosk-btn-outline btn-stop-work"
              onClick={() => handleToggleStatus(false)}
            >
              <PowerOff size={18} />
              <span>{t.btnToggleToInactive}</span>
            </button>
          ) : (
            <button
              type="button"
              className="kiosk-btn-primary btn-start-work"
              onClick={() => handleToggleStatus(true)}
            >
              <Power size={18} />
              <span>{t.btnToggleToActive}</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. CATEGORY SELECTOR TABS (SEPARATE PROVIDER TYPES) */}
      <div className="provider-categories-selector">
        <div className="selector-header-row">
          <h3 className="selector-title">
            {language === 'te'
              ? 'సేవా వర్గం & పరికరాల నిర్వహణ'
              : language === 'hi'
              ? 'सेवा श्रेणी व उपकरण प्रबंधन'
              : 'Service Category & Equipment Management'}
          </h3>
          <p className="selector-subtitle">
            {language === 'te'
              ? 'మీరు అందించే సేవలను ఎంచుకోండి మరియు నిర్దిష్ట పరికరాలను నిర్వహించండి'
              : language === 'hi'
              ? 'अपनी सेवा का प्रकार चुनें और केवल संबंधित उपकरणों का प्रबंधन करें'
              : 'Choose your provider type to manage relevant machinery and options'}
          </p>
        </div>

        <div className="provider-tabs-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'tractor'}
            className={`provider-tab-btn ${activeTab === 'tractor' ? 'active' : ''}`}
            onClick={() => setActiveTab('tractor')}
          >
            <span className="tab-icon">🚜</span>
            <span className="tab-label">{t.tabTractor}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'mini_truck'}
            className={`provider-tab-btn ${activeTab === 'mini_truck' ? 'active' : ''}`}
            onClick={() => setActiveTab('mini_truck')}
          >
            <span className="tab-icon">🚛</span>
            <span className="tab-label">{t.tabMiniTruck}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'harvester'}
            className={`provider-tab-btn ${activeTab === 'harvester' ? 'active' : ''}`}
            onClick={() => setActiveTab('harvester')}
          >
            <span className="tab-icon">🌾</span>
            <span className="tab-label">{t.tabHarvester}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'implements'}
            className={`provider-tab-btn ${activeTab === 'implements' ? 'active' : ''}`}
            onClick={() => setActiveTab('implements')}
          >
            <span className="tab-icon">⚙️</span>
            <span className="tab-label">{t.tabImplements}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'worker'}
            className={`provider-tab-btn ${activeTab === 'worker' ? 'active' : ''}`}
            onClick={() => setActiveTab('worker')}
          >
            <span className="tab-icon">👨‍🌾</span>
            <span className="tab-label">{t.tabWorker}</span>
          </button>
        </div>
      </div>

      {/* 4. TAB CONTENT: TRACTOR DRIVERS / OWNERS */}
      {activeTab === 'tractor' && (
        <div className="tab-panel-content">
          {/* Daily Validity Card */}
          <div
            className={`dashboard-section-card daily-validity-card ${
              isTractorValidToday ? 'valid-today' : 'expired-today'
            }`}
          >
            <div className="card-top-row">
              <div>
                <h3 className="section-card-title">{t.dailyRegStatusLabel}</h3>
                <p className="section-card-desc">
                  {isTractorValidToday
                    ? `${t.dailyRegValid} (${todayStr})`
                    : t.dailyRegExpired}
                </p>
              </div>
              <span className={`validity-badge ${isTractorValidToday ? 'badge-ok' : 'badge-alert'}`}>
                {isTractorValidToday ? (
                  <>
                    <CheckCircle size={16} />
                    <span>ACTIVE FOR TODAY</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={16} />
                    <span>EXPIRED / INACTIVE</span>
                  </>
                )}
              </span>
            </div>

            {!isTractorValidToday && (
              <div className="daily-activation-prompt-row">
                <p className="prompt-text">
                  Tractor registrations expire each night at midnight. Activate your tractor for today to appear in farmer searches.
                </p>
                <button
                  type="button"
                  className="kiosk-btn-primary activate-today-btn"
                  onClick={handleActivateTractorToday}
                >
                  <Sparkles size={18} />
                  <span>{t.btnCompleteDailyReg}</span>
                </button>
              </div>
            )}
          </div>

          {/* Single Current Working Attachment Selection */}
          <div className="dashboard-section-card attachment-section-card">
            <div className="card-top-row">
              <div>
                <h3 className="section-card-title">
                  {t.selectCurrentAttachment}
                </h3>
                <p className="section-card-desc">{t.singleAttachmentRule}</p>
              </div>
            </div>

            <div className="dashboard-attachments-grid" role="radiogroup">
              {TRACTOR_CATEGORIES.map((cat) => {
                const isSelected =
                  currentAccount.type === 'tractor'
                    ? (currentAccount as TractorAccount).currentAttachment === cat.id
                    : cat.id === 'tractor_rotavator';

                const catTitle =
                  language === 'hi'
                    ? cat.titleHi
                    : language === 'te'
                    ? cat.titleTe
                    : cat.titleEn;

                return (
                  <div
                    key={cat.id}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                    className={`attachment-card-choice ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectAttachment(cat.id)}
                  >
                    <div className="attachment-icon-box">
                      <AgriculturalIllustration name={cat.illustrationKey} size={54} />
                    </div>
                    <div className="attachment-meta">
                      <span className="att-name">{catTitle}</span>
                      {isSelected ? (
                        <span className="att-current-tag">ACTIVE IMPLEMENT</span>
                      ) : (
                        <span className="att-switch-tag">TAP TO SWITCH</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vehicle Photo Uploader for Tractor */}
          <div className="dashboard-section-card">
            <VehiclePhotoUploader
              photoUrl={currentAccount.vehiclePhotoUrl}
              onPhotoChange={handlePhotoChange}
              currentLang={language}
              vehicleType="tractor"
            />
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: MINI-TRUCK & TRANSPORT DRIVERS */}
      {activeTab === 'mini_truck' && (
        <div className="tab-panel-content">
          <div className="dashboard-section-card">
            <h3 className="section-card-title">
              {language === 'te'
                ? 'వ్యవసాయ రవాణా రకాలు'
                : language === 'hi'
                ? 'कृषि उपज परिवहन प्रकार'
                : 'Agricultural Cargo Transport Specialities'}
            </h3>
            <p className="section-card-desc">
              {language === 'te'
                ? 'మీ మినీ ట్రక్ ద్వారా రవాణా చేయగల వ్యవసాయ ఉత్పత్తులను ఎంచుకోండి:'
                : language === 'hi'
                ? 'वे कृषि उत्पाद चुनें जिन्हें आपका वाहन सुरक्षित रूप से ले जा सकता है:'
                : 'Select the farm produce types your mini-truck is equipped to haul:'}
            </p>

            <div className="skills-chips-grid">
              {MINI_TRUCK_CATEGORIES.map((cat) => {
                const isSelected =
                  currentAccount.type === 'mini_truck'
                    ? ((currentAccount as MiniTruckAccount).cargoSpeciality || []).includes(cat.id)
                    : false;

                const catTitle =
                  language === 'hi'
                    ? cat.titleHi
                    : language === 'te'
                    ? cat.titleTe
                    : cat.titleEn;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`skill-chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleCargoSpeciality(cat.id)}
                  >
                    <CheckCircle size={14} className={isSelected ? 'check-visible' : 'check-hidden'} />
                    <span>{catTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle Photo Uploader for Mini-Truck */}
          <div className="dashboard-section-card">
            <VehiclePhotoUploader
              photoUrl={currentAccount.vehiclePhotoUrl}
              onPhotoChange={handlePhotoChange}
              currentLang={language}
              vehicleType="miniTruck"
            />
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: HARVESTER OPERATORS */}
      {activeTab === 'harvester' && (
        <div className="tab-panel-content">
          <div className="dashboard-section-card">
            <h3 className="section-card-title">
              {language === 'te'
                ? 'అనుకూల పంటలు (హార్వెస్టర్)'
                : language === 'hi'
                ? 'अनुकूल फसलें (हार्वेस्टर)'
                : 'Compatible Crops for Harvesting'}
            </h3>
            <p className="section-card-desc">
              {language === 'te'
                ? 'మీ యంత్రం కోయగల పంటలను ఎంచుకోండి:'
                : language === 'hi'
                ? 'वे फसलें चुनें जिनकी कटाई आपकी मशीन कर सकती है:'
                : 'Select the crops your harvesting machinery is configured to reap:'}
            </p>

            <div className="skills-chips-grid">
              {HARVESTER_CATEGORIES.map((cat) => {
                const isSelected =
                  currentAccount.type === 'harvester'
                    ? ((currentAccount as HarvesterAccount).compatibleCrops || []).includes(cat.id)
                    : false;

                const catTitle =
                  language === 'hi'
                    ? cat.titleHi
                    : language === 'te'
                    ? cat.titleTe
                    : cat.titleEn;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`skill-chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleHarvesterCrop(cat.id)}
                  >
                    <CheckCircle size={14} className={isSelected ? 'check-visible' : 'check-hidden'} />
                    <span>{catTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vehicle Photo Uploader for Harvester */}
          <div className="dashboard-section-card">
            <VehiclePhotoUploader
              photoUrl={currentAccount.vehiclePhotoUrl}
              onPhotoChange={handlePhotoChange}
              currentLang={language}
              vehicleType="harvester"
            />
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: OTHER MACHINERY IMPLEMENTS */}
      {activeTab === 'implements' && (
        <div className="tab-panel-content">
          <div className="dashboard-section-card">
            <h3 className="section-card-title">
              {language === 'te'
                ? 'ప్రత్యేక వ్యవసాయ పరికరాలు'
                : language === 'hi'
                ? 'विशेष कृषि उपकरण'
                : 'Specialized Agricultural Machinery & Implements'}
            </h3>
            <p className="section-card-desc">
              {language === 'te'
                ? 'మీ వద్ద ఉన్న వ్యవసాయ పరికరాలు మరియు పనిముట్లను ఎంచుకోండి:'
                : language === 'hi'
                ? 'अपने पास उपलब्ध विशेष कृषि उपकरणों का चयन करें:'
                : 'Select the specialized tractor-hitched implements and attachments available in your fleet:'}
            </p>

            <div className="skills-chips-grid">
              {TRACTOR_CATEGORIES.map((cat) => {
                const catTitle =
                  language === 'hi'
                    ? cat.titleHi
                    : language === 'te'
                    ? cat.titleTe
                    : cat.titleEn;

                return (
                  <div key={cat.id} className="implement-chip-card">
                    <span className="implement-chip-title">{catTitle}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Machinery Photo Uploader */}
          <div className="dashboard-section-card">
            <VehiclePhotoUploader
              photoUrl={currentAccount.vehiclePhotoUrl}
              onPhotoChange={handlePhotoChange}
              currentLang={language}
              vehicleType="implements"
            />
          </div>
        </div>
      )}

      {/* 8. TAB CONTENT: FARM LABOURERS (NO VEHICLE PHOTO REQUIRED) */}
      {activeTab === 'worker' && (
        <div className="tab-panel-content">
          <div className="dashboard-section-card worker-skills-card">
            <h3 className="section-card-title">
              {language === 'te'
                ? 'మీ వ్యవసాయ నైపుణ్యాలు'
                : language === 'hi'
                ? 'आपकी पंजीकृत कृषि कुशलताएं'
                : 'Your Registered Farm Labour Skills'}
            </h3>
            <p className="section-card-desc">
              {language === 'te'
                ? 'మీరు ప్రస్తుతం అందుబాటులో ఉన్న వ్యవసాయ పనులను ఎంచుకోండి లేదా నవీకరించండి:'
                : language === 'hi'
                ? 'वे कृषि कार्य चुनें जिन्हें आप करने के लिए वर्तमान में उपलब्ध हैं:'
                : 'Select or update the agricultural tasks you are currently available to perform:'}
            </p>

            <div className="skills-chips-grid">
              {PERSON_CATEGORIES.map((skill) => {
                const isSelected =
                  currentAccount.type === 'worker'
                    ? ((currentAccount as WorkerAccount).skills || []).includes(skill.id)
                    : false;

                const skillTitle =
                  language === 'hi'
                    ? skill.titleHi
                    : language === 'te'
                    ? skill.titleTe
                    : skill.titleEn;

                return (
                  <button
                    key={skill.id}
                    type="button"
                    className={`skill-chip-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleToggleWorkerSkill(skill.id)}
                  >
                    <CheckCircle size={14} className={isSelected ? 'check-visible' : 'check-hidden'} />
                    <span>{skillTitle}</span>
                  </button>
                );
              })}
            </div>

            <div className="worker-notice-callout">
              <span className="callout-icon">ℹ️</span>
              <span className="callout-text">
                {language === 'te'
                  ? 'వ్యవసాయ కూలీలకు వాహన ఫోటో అవసరం లేదు. మీ నైపుణ్యాల ఆధారంగా రైతులు మిమ్మల్ని నేరుగా సంప్రదిస్తారు.'
                  : language === 'hi'
                  ? 'कृषि श्रमिकों के लिए वाहन फोटो आवश्यक नहीं है। किसान सीधे आपकी कुशलताओं के आधार पर संपर्क करेंगे।'
                  : 'Vehicle photo is not required for farm labourers. Farmers will contact you directly based on your skills.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Return Home Button */}
      <div className="dashboard-footer-actions">
        <button
          type="button"
          className="kiosk-btn-outline"
          onClick={onReturnHome}
        >
          <Home size={18} />
          <span>{t.btnHome}</span>
        </button>
      </div>
    </div>
  );
};
