import React, { useState } from 'react';
import {
  Language,
  MainServiceType,
  CategoryItem,
  SearchQueryParams,
} from '../types';
import { translations } from '../i18n/translations';
import { DEMO_VILLAGES } from '../data/villages';
import { AgriculturalIllustration } from '../assets/illustrations';
import { getKioskTodayDateString } from '../utils/dailyAvailability';
import { MapPin, Calendar, Users, AlertCircle, Search } from 'lucide-react';

interface SearchFormProps {
  language: Language;
  serviceType: MainServiceType;
  subcategory: CategoryItem;
  onSearch: (params: SearchQueryParams) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  language,
  serviceType,
  subcategory,
  onSearch,
}) => {
  const t = translations[language];

  // Default date to today's ISO string (YYYY-MM-DD)
  const todayStr = getKioskTodayDateString();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  // State
  const [villageId, setVillageId] = useState<string>('rampur');
  const [date, setDate] = useState<string>(todayStr);
  const [quantity, setQuantity] = useState<number>(serviceType === 'person' ? 4 : 2);
  const [duration, setDuration] = useState<string>('1_DAY');
  const [fieldSizeAcres, setFieldSizeAcres] = useState<string>('2');
  const [destinationVillageId, setDestinationVillageId] = useState<string>('siricilla');
  const [timeSlot, setTimeSlot] = useState<string>('MORNING');
  const [goodsType, setGoodsType] = useState<string>(
    subcategory.id.includes('paddy')
      ? 'Paddy Bags'
      : subcategory.id.includes('fruit')
      ? 'Fruits'
      : subcategory.id.includes('fertilizer')
      ? 'Fertilizer & Seeds'
      : subcategory.id.includes('equipment')
      ? 'Machinery'
      : 'Vegetables'
  );
  const [approxLoadTons, setApproxLoadTons] = useState<string>('1.5');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!villageId) {
      setErrorMessage(t.errVillageRequired);
      return;
    }
    if (!date) {
      setErrorMessage(t.errDateRequired);
      return;
    }
    if (quantity < 1) {
      setErrorMessage(t.errQuantityInvalid);
      return;
    }
    if (serviceType === 'mini_truck' && !destinationVillageId) {
      setErrorMessage(t.errDestinationRequired);
      return;
    }

    setErrorMessage(null);

    const selectedVillage = DEMO_VILLAGES.find((v) => v.id === villageId);
    const destVillage = DEMO_VILLAGES.find((v) => v.id === destinationVillageId);

    const params: SearchQueryParams = {
      serviceType,
      subcategoryId: subcategory.id,
      subcategoryTitleEn: subcategory.titleEn,
      subcategoryTitleTe: subcategory.titleTe,
      villageId,
      villageNameEn: selectedVillage?.nameEn || villageId,
      villageNameTe: selectedVillage?.nameTe || villageId,
      date,
      quantity,
      duration,
      fieldSizeAcres: (serviceType === 'tractor' || serviceType === 'harvester') && fieldSizeAcres ? Number(fieldSizeAcres) : undefined,
      timeSlot: serviceType === 'mini_truck' ? timeSlot : undefined,
      goodsType: serviceType === 'mini_truck' ? goodsType : undefined,
      approxLoadTons: serviceType === 'mini_truck' && approxLoadTons ? Number(approxLoadTons) : undefined,
      notes,
      destinationVillageId: serviceType === 'mini_truck' ? destinationVillageId : undefined,
      destinationVillageNameEn: destVillage?.nameEn,
      destinationVillageNameTe: destVillage?.nameTe,
    };

    onSearch(params);
  };

  const getSubmitBtnLabel = () => {
    switch (serviceType) {
      case 'person':
        return t.btnFindWorkers;
      case 'tractor':
        return t.btnFindTractor;
      case 'harvester':
        return t.btnFindHarvester;
      case 'mini_truck':
        return t.btnFindTrucks;
    }
  };

  const getQuantityLabel = () => {
    switch (serviceType) {
      case 'person':
        return t.fieldQuantityWorkers;
      case 'tractor':
      case 'harvester':
        return t.fieldQuantityHours;
      case 'mini_truck':
        return t.fieldQuantityTons;
    }
  };

  return (
    <div className="kiosk-screen search-form-screen">
      {/* Selected Task Overview Box */}
      <div className="selected-summary-card">
        <div className="summary-illus">
          <AgriculturalIllustration name={subcategory.illustrationKey} size={70} />
        </div>
        <div className="summary-text">
          <span className="summary-tag">{t.selectedCategoryLabel}</span>
          <h3 className="summary-title">
            {language === 'te' ? subcategory.titleTe : subcategory.titleEn}
          </h3>
          <p className="summary-desc">
            {language === 'te' ? subcategory.descriptionTe : subcategory.descriptionEn}
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="form-error-banner" role="alert">
          <AlertCircle size={22} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Touch-Friendly Form */}
      <form onSubmit={handleSubmit} className="kiosk-form">
        {/* 1. Village Selection */}
        <div className="form-group">
          <label className="form-label">
            <MapPin size={20} />
            <span>{t.fieldVillage}</span>
          </label>
          <div className="village-quick-chips">
            {DEMO_VILLAGES.slice(0, 5).map((v) => (
              <button
                key={v.id}
                type="button"
                className={`chip-btn ${villageId === v.id ? 'active' : ''}`}
                onClick={() => setVillageId(v.id)}
              >
                {language === 'te' ? v.nameTe : v.nameEn}
              </button>
            ))}
          </div>
          <select
            className="kiosk-select"
            value={villageId}
            onChange={(e) => setVillageId(e.target.value)}
          >
            {DEMO_VILLAGES.map((v) => (
              <option key={v.id} value={v.id}>
                {language === 'te' ? v.nameTe : v.nameEn} ({v.nameEn})
              </option>
            ))}
          </select>
        </div>

        {/* Mini Truck Destination Field */}
        {serviceType === 'mini_truck' && (
          <div className="form-group">
            <label className="form-label">
              <MapPin size={20} />
              <span>{t.fieldDestination}</span>
            </label>
            <div className="village-quick-chips">
              {DEMO_VILLAGES.slice(4).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`chip-btn ${destinationVillageId === v.id ? 'active' : ''}`}
                  onClick={() => setDestinationVillageId(v.id)}
                >
                  {language === 'te' ? v.nameTe : v.nameEn}
                </button>
              ))}
            </div>
            <select
              className="kiosk-select"
              value={destinationVillageId}
              onChange={(e) => setDestinationVillageId(e.target.value)}
            >
              {DEMO_VILLAGES.map((v) => (
                <option key={v.id} value={v.id}>
                  {language === 'te' ? v.nameTe : v.nameEn}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 2. Date Selection (Quick Presets + Date Input) */}
        <div className="form-group">
          <label className="form-label">
            <Calendar size={20} />
            <span>{t.fieldWorkDate}</span>
          </label>
          <div className="date-quick-chips">
            <button
              type="button"
              className={`chip-btn ${date === todayStr ? 'active' : ''}`}
              onClick={() => setDate(todayStr)}
            >
              {t.dateToday} (16-Oct)
            </button>
            <button
              type="button"
              className={`chip-btn ${date === tomorrowStr ? 'active' : ''}`}
              onClick={() => setDate(tomorrowStr)}
            >
              {t.dateTomorrow} (17-Oct)
            </button>
          </div>
          <input
            type="date"
            className="kiosk-input date-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* 3. Quantity / Workers Counter with Big Touch +/- Buttons */}
        <div className="form-group">
          <label className="form-label">
            <Users size={20} />
            <span>{getQuantityLabel()}</span>
          </label>
          <div className="counter-row">
            <button
              type="button"
              className="counter-btn"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="counter-val-display">{quantity}</span>
            <button
              type="button"
              className="counter-btn"
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Duration */}
        <div className="form-group">
          <label className="form-label">
            <span>{t.fieldDurationDays}</span>
          </label>
          <div className="duration-chips">
            <button
              type="button"
              className={`chip-btn ${duration === '1_DAY' ? 'active' : ''}`}
              onClick={() => setDuration('1_DAY')}
            >
              {t.opt1Day}
            </button>
            <button
              type="button"
              className={`chip-btn ${duration === '2_3_DAYS' ? 'active' : ''}`}
              onClick={() => setDuration('2_3_DAYS')}
            >
              {t.opt2to3Days}
            </button>
            <button
              type="button"
              className={`chip-btn ${duration === 'WEEK' ? 'active' : ''}`}
              onClick={() => setDuration('WEEK')}
            >
              {t.optWeek}
            </button>
          </div>
        </div>


        {/* Field Size in Acres (for Tractor and Harvester) */}
        {(serviceType === 'tractor' || serviceType === 'harvester') && (
          <div className="form-group">
            <label className="form-label">
              <span>{t.fieldSize}</span>
            </label>
            <div className="wage-quick-chips">
              {['1', '2', '3', '5', '8', '10'].map((acres) => (
                <button
                  key={acres}
                  type="button"
                  className={`chip-btn ${fieldSizeAcres === acres ? 'active' : ''}`}
                  onClick={() => setFieldSizeAcres(acres)}
                >
                  {acres} {language === 'te' ? 'ఎకరాలు' : 'Acres'}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.5"
              className="kiosk-input"
              value={fieldSizeAcres}
              placeholder={t.fieldSize}
              onChange={(e) => setFieldSizeAcres(e.target.value)}
            />
          </div>
        )}

        {/* Mini Truck Specific Controls: Time Slot, Goods Type, Load Weight */}
        {serviceType === 'mini_truck' && (
          <>
            {/* Preferred Time Slot */}
            <div className="form-group">
              <label className="form-label">
                <span>{t.timeSlotLabel}</span>
              </label>
              <div className="duration-chips">
                <button
                  type="button"
                  className={`chip-btn ${timeSlot === 'MORNING' ? 'active' : ''}`}
                  onClick={() => setTimeSlot('MORNING')}
                >
                  {t.timeMorning}
                </button>
                <button
                  type="button"
                  className={`chip-btn ${timeSlot === 'AFTERNOON' ? 'active' : ''}`}
                  onClick={() => setTimeSlot('AFTERNOON')}
                >
                  {t.timeAfternoon}
                </button>
                <button
                  type="button"
                  className={`chip-btn ${timeSlot === 'EVENING' ? 'active' : ''}`}
                  onClick={() => setTimeSlot('EVENING')}
                >
                  {t.timeEvening}
                </button>
              </div>
            </div>

            {/* Type of Goods */}
            <div className="form-group">
              <label className="form-label">
                <span>{t.goodsTypeLabel}</span>
              </label>
              <div className="wage-quick-chips">
                {[
                  { id: 'Vegetables', en: 'Fresh Vegetables', te: 'కూరగాయలు' },
                  { id: 'Paddy Bags', en: 'Paddy / Grain Bags', te: 'వరి ధాన్యం బస్తాలు' },
                  { id: 'Fruits', en: 'Fruits & Mangoes', te: 'పండ్లు / మామిడి' },
                  { id: 'Fertilizer & Seeds', en: 'Fertilizer & Seeds', te: 'ఎరువులు & విత్తనాలు' },
                  { id: 'Machinery', en: 'Pumpset / Equipment', te: 'మోటార్లు / పరికరాలు' },
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={`chip-btn ${goodsType === g.id ? 'active' : ''}`}
                    onClick={() => setGoodsType(g.id)}
                  >
                    {language === 'te' ? g.te : g.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Approximate Load */}
            <div className="form-group">
              <label className="form-label">
                <span>{t.approxLoadLabel}</span>
              </label>
              <div className="wage-quick-chips">
                {['0.5', '1.0', '1.5', '2.0', '2.5', '3.0'].map((tons) => (
                  <button
                    key={tons}
                    type="button"
                    className={`chip-btn ${approxLoadTons === tons ? 'active' : ''}`}
                    onClick={() => setApproxLoadTons(tons)}
                  >
                    {tons} {language === 'te' ? 'టన్నులు' : 'Tons'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 6. Notes / Field Landmark */}
        <div className="form-group">
          <label className="form-label">
            <span>{t.fieldNotes}</span>
          </label>
          <input
            type="text"
            className="kiosk-input"
            value={notes}
            placeholder={
              language === 'te'
                ? 'ఉదా: ఉత్తరం వైపు చేను, రాంపూర్ చెరువు దగ్గర'
                : 'e.g. North field near Rampur lake bund'
            }
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Big Submit Button */}
        <div className="form-submit-row">
          <button type="submit" className="kiosk-btn-primary search-submit-btn">
            <Search size={24} strokeWidth={3} />
            <span>{getSubmitBtnLabel()}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

