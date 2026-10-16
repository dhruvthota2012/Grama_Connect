import React, { useEffect } from 'react';
import {
  Language,
  MainServiceType,
  SearchQueryParams,
  MatchScoreResult,
  Worker,
  TractorService,
  HarvesterService,
  MiniTruckService,
} from '../types';
import { translations } from '../i18n/translations';
import { formatCleanPersonName, formatCleanMobile } from '../utils/dailyAvailability';
import { speakText } from '../utils/speechGuidance';
import { Printer, MapPin, AlertTriangle, Phone } from 'lucide-react';

interface MatchResultsProps {
  language: Language;
  serviceType: MainServiceType;
  queryParams: SearchQueryParams;
  referenceNumber: string;
  results: MatchScoreResult<Worker | TractorService | HarvesterService | MiniTruckService>[];
  onPrintSlip: (selectedItem?: Worker | TractorService | HarvesterService | MiniTruckService) => void;
  onModifySearch: () => void;
}

export const MatchResults: React.FC<MatchResultsProps> = ({
  language,
  serviceType,
  queryParams,
  referenceNumber,
  results,
  onPrintSlip,
  onModifySearch,
}) => {
  const t = translations[language];

  // Trilingual audio announcement on search results load
  useEffect(() => {
    if (results.length > 0) {
      const count = results.length;
      const subTitle =
        language === 'hi'
          ? queryParams.subcategoryTitleHi || queryParams.subcategoryTitleEn
          : language === 'te'
          ? queryParams.subcategoryTitleTe
          : queryParams.subcategoryTitleEn;

      const msg =
        language === 'hi'
          ? `${subTitle} हेतु रामपुर पंचायत में ${count} उपलब्ध हैं। सूची प्राप्त करने हेतु प्रिंट उपलब्ध श्रमिक बटन दबाएं।`
          : language === 'te'
          ? `${subTitle} కోసం రాంపూర్ పంచాయతీలో ${count} అందుబాటులో ఉన్నారు. వివరాల కోసం ప్రింట్ బటన్ నొక్కండి.`
          : `Found ${count} available contacts for ${subTitle} at Rampur Panchayat. Tap print available workers to print contact list.`;

      speakText(msg, language);
    } else {
      const noMsg =
        language === 'hi'
          ? 'इस श्रेणी में फिलहाल कोई सक्रिय प्रदाता पंजीकृत नहीं है।'
          : language === 'te'
          ? 'ఈ కేటగిరీలో ప్రస్తుతం ఎవరూ అందుబాటులో లేరు.'
          : 'No available providers registered for this category currently.';
      speakText(noMsg, language);
    }
  }, [results.length, language, queryParams]);

  const handlePrintAll = () => {
    const msg =
      language === 'hi'
        ? 'उपलब्ध संपर्क सूची प्रिंट हो रही है।'
        : language === 'te'
        ? 'అందుబాటులో ఉన్న కాంటాక్ట్ జాబితా ప్రింట్ అవుతోంది.'
        : 'Printing available contacts list.';
    speakText(msg, language);
    onPrintSlip();
  };

  const handlePrintSingle = (
    item: Worker | TractorService | HarvesterService | MiniTruckService,
    name: string
  ) => {
    const msg =
      language === 'hi'
        ? `${name} का संपर्क प्रिंट हो रहा है।`
        : language === 'te'
        ? `${name} కాంటాక్ట్ ప్రింట్ అవుతోంది.`
        : `Printing contact for ${name}.`;
    speakText(msg, language);
    onPrintSlip(item);
  };

  // Helper to extract clean Name & Phone strictly adhering to minimal format (Name + Mobile Number ONLY)
  const extractCleanRow = (
    item: Worker | TractorService | HarvesterService | MiniTruckService
  ) => {
    let rawName = '';
    let rawPhone = '';

    if ('tractorModel' in item) {
      rawName =
        (language === 'hi' ? item.ownerNameHi : language === 'te' ? item.ownerNameTe : item.ownerNameEn) ||
        item.ownerNameEn ||
        'Tractor Driver';
      rawPhone = item.contactDemo || item.contactNumber || '';
    } else if ('machineType' in item) {
      rawName =
        (language === 'hi' ? item.ownerNameHi : language === 'te' ? item.ownerNameTe : item.ownerNameEn) ||
        item.ownerNameEn ||
        'Harvester Provider';
      rawPhone = item.contactDemo || item.contactNumber || '';
    } else if ('bodyType' in item) {
      rawName =
        (language === 'hi' ? item.driverNameHi : language === 'te' ? item.driverNameTe : item.driverNameEn) ||
        item.driverNameEn ||
        'Truck Driver';
      rawPhone = item.contactDemo || item.contactNumber || '';
    } else {
      // Worker
      rawName =
        (language === 'hi' ? item.nameHi : language === 'te' ? item.nameTe : item.nameEn) ||
        item.nameEn ||
        'Agricultural Worker';
      rawPhone = item.contactDemo || item.contactNumber || '';
    }

    return {
      displayName: formatCleanPersonName(rawName),
      cleanPhone: formatCleanMobile(rawPhone),
    };
  };

  /**
   * Renders a provider row containing STRICTLY Name & Mobile Number.
   * Requirement 6: "For public worker and machinery-provider result lists,
   * display only the name and mobile number. Do not show skills descriptions,
   * personal profiles, addresses, village information, or any other details."
   */
  const renderProviderRow = (
    res: MatchScoreResult<Worker | TractorService | HarvesterService | MiniTruckService>,
    idx: number
  ) => {
    const item = res.item;
    const { displayName, cleanPhone } = extractCleanRow(item);
    const photoUrl = 'vehiclePhotoUrl' in item ? (item as TractorService | HarvesterService | MiniTruckService).vehiclePhotoUrl : undefined;

    return (
      <div key={item.id} className="compact-provider-row" role="listitem">
        <div className="compact-provider-thumb-wrap" aria-hidden="true">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="compact-provider-thumb" />
          ) : (
            <div className="compact-provider-thumb compact-provider-thumb-placeholder">
              {'tractorModel' in item ? '🚜' : 'machineType' in item ? '🌾' : 'bodyType' in item ? '🚛' : '👨‍🌾'}
            </div>
          )}
        </div>

        <div className="compact-provider-main">
          <div className="compact-primary-line">
            <span className="compact-row-index">{idx + 1}.</span>
            <strong className="compact-person-name">{displayName}</strong>
            <span className="compact-phone-pill">
              <Phone size={15} />
              <span>{cleanPhone}</span>
            </span>
          </div>
        </div>

        <div className="compact-provider-actions">
          <button
            type="button"
            className="compact-row-print-btn"
            onClick={() => handlePrintSingle(item, displayName)}
            title="Print Contact"
            aria-label={`Print ${displayName}`}
          >
            <Printer size={16} />
            <span>{language === 'hi' ? 'प्रिंट' : language === 'te' ? 'ప్రింట్' : 'Print'}</span>
          </button>
        </div>
      </div>
    );
  };

  const printButtonLabel =
    serviceType === 'person' ? t.btnPrintAvailableWorkers : t.btnPrintAvailableProviders;

  return (
    <div className="kiosk-screen match-results-screen">
      {/* Kiosk Header Bar */}
      <div className="results-header-bar">
        <div className="header-info">
          <div className="kiosk-loc-tag">
            <MapPin size={16} />
            <span>{t.kioskPanchayatLocation}</span>
            {referenceNumber && <span className="ref-badge">({referenceNumber})</span>}
          </div>
          <h2 className="results-title">{t.kioskServiceResultsHeading}</h2>
          <p className="results-subtitle">
            {language === 'te'
              ? 'ధృవీకరించబడిన సంప్రదింపు వివరాలు (పేరు & మొబైల్ నంబర్ మాత్రమే)'
              : language === 'hi'
              ? 'सत्यापित संपर्क विवरण (केवल नाम और मोबाइल नंबर)'
              : 'Verified contact directory (Name & Mobile Number Only)'}
          </p>
        </div>

        {results.length > 0 && (
          <button
            type="button"
            className="kiosk-btn-primary print-all-contacts-btn print-available-workers-btn"
            onClick={handlePrintAll}
            title={printButtonLabel}
          >
            <Printer size={22} strokeWidth={2.5} />
            <span>{printButtonLabel}</span>
          </button>
        )}
      </div>

      {/* Selected Task Pill */}
      <div className="query-spec-pills">
        <span className="spec-pill">
          {t.selectedCategoryLabel}:{' '}
          <strong>
            {language === 'hi'
              ? queryParams.subcategoryTitleHi || queryParams.subcategoryTitleEn
              : language === 'te'
              ? queryParams.subcategoryTitleTe
              : queryParams.subcategoryTitleEn}
          </strong>
        </span>
        <span className="spec-pill">
          Panchayat:{' '}
          <strong>
            {language === 'hi'
              ? queryParams.kioskPanchayatNameHi || queryParams.kioskPanchayatNameEn
              : language === 'te'
              ? queryParams.kioskPanchayatNameTe || queryParams.kioskPanchayatNameEn
              : queryParams.kioskPanchayatNameEn}
          </strong>
        </span>
      </div>

      {/* Results List: Continuous list with subtle dividers showing STRICTLY Name & Mobile Number */}
      {results.length === 0 ? (
        <div className="no-matches-box">
          <AlertTriangle size={64} strokeWidth={2} />
          <h3 className="no-matches-title">{t.noMatchesTitle}</h3>
          <p className="no-matches-desc">{t.noProvidersRegisteredMsg}</p>
          <p className="no-matches-suggestion">{t.noMatchesSuggestion}</p>
          <button
            type="button"
            className="kiosk-btn-primary modify-btn"
            onClick={onModifySearch}
          >
            {t.btnModifySearch}
          </button>
        </div>
      ) : (
        <div className="compact-results-list" role="list">
          {results.map((res, idx) => renderProviderRow(res, idx))}
        </div>
      )}
    </div>
  );
};
