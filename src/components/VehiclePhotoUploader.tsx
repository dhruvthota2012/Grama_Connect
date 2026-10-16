import React, { useState, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

// Sample vehicle photo presets for convenient 1-tap testing in kiosk environments
const SAMPLE_VEHICLE_PHOTOS = {
  tractor: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="60%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <linearGradient id="fieldGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#84cc16"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
  </defs>
  <rect width="400" height="150" fill="url(#skyGrad)"/>
  <rect y="150" width="400" height="110" fill="url(#fieldGrad)"/>
  <!-- Field furrow lines -->
  <path d="M 0 190 Q 200 175 400 190" stroke="#166534" stroke-width="3" fill="none"/>
  <path d="M 0 220 Q 200 205 400 220" stroke="#14532d" stroke-width="4" fill="none"/>
  <!-- Indian Red Tractor -->
  <g transform="translate(60, 45)">
    <!-- Silencer exhaust pipe -->
    <rect x="75" y="15" width="8" height="50" rx="3" fill="#1e293b"/>
    <path d="M 75 15 Q 85 8 95 18" stroke="#1e293b" stroke-width="5" fill="none"/>
    <!-- Engine hood (Mahindra Red) -->
    <path d="M 70 65 L 175 65 L 185 85 L 185 110 L 70 110 Z" fill="#dc2626"/>
    <!-- Headlight -->
    <circle cx="182" cy="78" r="6" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
    <!-- Engine grill & details -->
    <rect x="180" y="86" width="4" height="20" fill="#1e293b"/>
    <line x1="90" y1="80" x2="160" y2="80" stroke="#fca5a5" stroke-width="2"/>
    <line x1="90" y1="90" x2="160" y2="90" stroke="#fca5a5" stroke-width="2"/>
    <text x="125" y="102" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">575 DI</text>
    <!-- Steering & Seat -->
    <path d="M 68 70 L 52 50" stroke="#1e293b" stroke-width="4"/>
    <circle cx="50" cy="48" r="7" fill="none" stroke="#1e293b" stroke-width="3"/>
    <rect x="35" y="70" width="22" height="10" rx="3" fill="#1e293b"/>
    <rect x="32" y="55" width="8" height="25" rx="3" fill="#1e293b"/>
    <!-- Driver canopy frame & roof -->
    <line x1="30" y1="80" x2="30" y2="10" stroke="#f59e0b" stroke-width="4"/>
    <line x1="85" y1="80" x2="85" y2="10" stroke="#f59e0b" stroke-width="4"/>
    <path d="M 20 12 L 95 12 L 90 6 L 25 6 Z" fill="#d97706"/>
    <!-- Big Rear Wheel -->
    <circle cx="45" cy="115" r="42" fill="#1e293b"/>
    <circle cx="45" cy="115" r="26" fill="#facc15"/>
    <circle cx="45" cy="115" r="10" fill="#dc2626"/>
    <!-- Rear tire treads -->
    <g stroke="#334155" stroke-width="3">
      <line x1="45" y1="73" x2="45" y2="88"/>
      <line x1="45" y1="142" x2="45" y2="157"/>
      <line x1="3" y1="115" x2="18" y2="115"/>
      <line x1="72" y1="115" x2="87" y2="115"/>
      <line x1="15" y1="85" x2="26" y2="96"/>
      <line x1="64" y1="134" x2="75" y2="145"/>
      <line x1="15" y1="145" x2="26" y2="134"/>
      <line x1="64" y1="96" x2="75" y2="85"/>
    </g>
    <!-- Small Front Wheel -->
    <circle cx="165" cy="125" r="24" fill="#1e293b"/>
    <circle cx="165" cy="125" r="14" fill="#facc15"/>
    <circle cx="165" cy="125" r="5" fill="#dc2626"/>
    <!-- Rotavator implement hitched to back -->
    <rect x="-10" y="115" width="25" height="15" fill="#e11d48" rx="2"/>
    <circle cx="-3" cy="130" r="10" fill="none" stroke="#475569" stroke-width="3"/>
  </g>
  <rect x="12" y="12" width="130" height="24" rx="12" fill="#0f172a" fill-opacity="0.6"/>
  <text x="77" y="28" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">VERIFIED TRACTOR</text>
</svg>
`)}`,
  miniTruck: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="60%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#fed7aa"/>
    </linearGradient>
  </defs>
  <rect width="400" height="150" fill="url(#skyGrad2)"/>
  <rect y="150" width="400" height="110" fill="#334155"/>
  <line x1="0" y1="205" x2="400" y2="205" stroke="#facc15" stroke-dasharray="20,15" stroke-width="4"/>
  <!-- Mini Truck / Pickup -->
  <g transform="translate(60, 60)">
    <!-- Cabin -->
    <path d="M 180 35 L 230 40 L 255 70 L 260 110 L 180 110 Z" fill="#0284c7"/>
    <path d="M 195 45 L 225 48 L 245 72 L 195 72 Z" fill="#e0f2fe"/>
    <!-- Headlight -->
    <circle cx="256" cy="85" r="6" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
    <!-- Cargo Bed -->
    <rect x="40" y="50" width="138" height="60" fill="#0369a1" rx="4"/>
    <line x1="40" y1="75" x2="178" y2="75" stroke="#38bdf8" stroke-width="2"/>
    <!-- Produce sacks in back -->
    <ellipse cx="65" cy="45" rx="15" ry="12" fill="#d97706"/>
    <ellipse cx="95" cy="42" rx="16" ry="13" fill="#b45309"/>
    <ellipse cx="125" cy="44" rx="15" ry="12" fill="#d97706"/>
    <ellipse cx="152" cy="46" rx="14" ry="11" fill="#b45309"/>
    <!-- Wheels -->
    <circle cx="90" cy="115" r="25" fill="#1e293b"/>
    <circle cx="90" cy="115" r="14" fill="#94a3b8"/>
    <circle cx="225" cy="115" r="25" fill="#1e293b"/>
    <circle cx="225" cy="115" r="14" fill="#94a3b8"/>
  </g>
  <rect x="12" y="12" width="130" height="24" rx="12" fill="#0f172a" fill-opacity="0.6"/>
  <text x="77" y="28" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">RURAL TRANSPORT</text>
</svg>
`)}`,
  harvester: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="60%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
  </defs>
  <rect width="400" height="150" fill="url(#skyGrad3)"/>
  <rect y="150" width="400" height="110" fill="#eab308"/>
  <!-- Combine Harvester -->
  <g transform="translate(50, 45)">
    <!-- Cabin & Body -->
    <rect x="90" y="40" width="120" height="70" fill="#15803d" rx="6"/>
    <rect x="170" y="30" width="55" height="45" fill="#86efac" rx="3"/>
    <line x1="170" y1="45" x2="225" y2="45" stroke="#166534" stroke-width="2"/>
    <!-- Unloading auger pipe -->
    <path d="M 120 40 L 70 15 L 50 20" stroke="#facc15" stroke-width="8" stroke-linecap="round" fill="none"/>
    <!-- Cutter Bar / Reel at front -->
    <g transform="translate(230, 80)">
      <circle cx="25" cy="25" r="22" fill="none" stroke="#dc2626" stroke-width="4"/>
      <line x1="25" y1="3" x2="25" y2="47" stroke="#dc2626" stroke-width="3"/>
      <line x1="3" y1="25" x2="47" y2="25" stroke="#dc2626" stroke-width="3"/>
      <!-- Cutter teeth -->
      <path d="M 0 45 L 50 45 L 45 52 L -5 52 Z" fill="#475569"/>
    </g>
    <!-- Big Front Track / Wheel -->
    <circle cx="170" cy="115" r="32" fill="#1e293b"/>
    <circle cx="170" cy="115" r="18" fill="#eab308"/>
    <!-- Rear Wheel -->
    <circle cx="100" cy="120" r="22" fill="#1e293b"/>
    <circle cx="100" cy="120" r="12" fill="#eab308"/>
  </g>
  <rect x="12" y="12" width="140" height="24" rx="12" fill="#0f172a" fill-opacity="0.6"/>
  <text x="82" y="28" font-family="sans-serif" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">COMBINE HARVESTER</text>
</svg>
`)}`,
};

interface VehiclePhotoUploaderProps {
  photoUrl?: string;
  onPhotoChange: (url: string | undefined) => void;
  currentLang: Language;
  vehicleType?: 'tractor' | 'miniTruck' | 'harvester' | 'implements';
  disabled?: boolean;
}

export const VehiclePhotoUploader: React.FC<VehiclePhotoUploaderProps> = ({
  photoUrl,
  onPhotoChange,
  currentLang,
  vehicleType = 'tractor',
  disabled = false,
}) => {
  const t = translations[currentLang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessToast(null);

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate mime type (JPG, PNG, WebP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(t.vehiclePhotoTypeErr);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate size (max 5 MB = 5 * 1024 * 1024 bytes)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(t.vehiclePhotoSizeErr);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Read as Base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onPhotoChange(dataUrl);
      setSuccessToast(t.photoUploadedSuccess);
      setTimeout(() => setSuccessToast(null), 3500);
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onPhotoChange(undefined);
    setErrorMessage(null);
    setSuccessToast(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = (key: 'tractor' | 'miniTruck' | 'harvester') => {
    const sample = SAMPLE_VEHICLE_PHOTOS[key];
    if (sample) {
      onPhotoChange(sample);
      setErrorMessage(null);
      setSuccessToast(t.photoUploadedSuccess);
      setTimeout(() => setSuccessToast(null), 3500);
    }
  };

  const defaultIcon =
    vehicleType === 'miniTruck'
      ? '🚛'
      : vehicleType === 'harvester'
      ? '🌾'
      : vehicleType === 'implements'
      ? '⚙️'
      : '🚜';

  return (
    <div className="vehicle-photo-uploader-container">
      <div className="uploader-header">
        <label className="uploader-title">
          <span className="uploader-icon" aria-hidden="true">{defaultIcon}</span>
          {t.vehiclePhotoLabel}
        </label>
        <span className="uploader-badge">Optional</span>
      </div>

      <p className="uploader-hint">{t.vehiclePhotoHint}</p>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {errorMessage && (
        <div className="uploader-alert uploader-alert-error" role="alert">
          <span className="alert-icon">⚠️</span> {errorMessage}
        </div>
      )}

      {successToast && (
        <div className="uploader-alert uploader-alert-success" role="status">
          <span className="alert-icon">✅</span> {successToast}
        </div>
      )}

      {photoUrl ? (
        <div className="photo-preview-card">
          <div className="preview-image-wrapper">
            <img
              src={photoUrl}
              alt="Registered vehicle machinery preview"
              className="preview-image"
            />
          </div>
          <div className="preview-actions">
            <button
              type="button"
              className="btn-uploader btn-replace-photo"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              📷 {t.vehiclePhotoReplace}
            </button>
            <button
              type="button"
              className="btn-uploader btn-remove-photo"
              onClick={handleRemove}
              disabled={disabled}
            >
              🗑️ {t.vehiclePhotoRemove}
            </button>
          </div>
        </div>
      ) : (
        <div className="photo-empty-dropzone">
          <div className="empty-dropzone-inner" onClick={() => fileInputRef.current?.click()}>
            <div className="empty-icon-circle">
              <span className="empty-camera-icon">📷</span>
            </div>
            <div className="empty-dropzone-text">
              <span className="dropzone-primary-text">{t.vehiclePhotoUpload}</span>
              <span className="dropzone-formats">JPG, PNG, WebP (max 5MB)</span>
            </div>
          </div>

          {/* Quick preset selector for kiosk demo testing */}
          <div className="sample-presets-row">
            <span className="presets-label">Quick sample:</span>
            <button
              type="button"
              className="preset-pill-btn"
              onClick={() => handleLoadSample('tractor')}
              disabled={disabled}
            >
              🚜 Tractor
            </button>
            <button
              type="button"
              className="preset-pill-btn"
              onClick={() => handleLoadSample('miniTruck')}
              disabled={disabled}
            >
              🚛 Mini-Truck
            </button>
            <button
              type="button"
              className="preset-pill-btn"
              onClick={() => handleLoadSample('harvester')}
              disabled={disabled}
            >
              🌾 Harvester
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
