import React, { useEffect, useMemo } from 'react';
import {
  Language,
  MainServiceType,
  SearchQueryParams,
  MatchScoreResult,
  Worker,
  TractorService,
  HarvesterService,
  MiniTruckService,
  WorkerRegistrationForm,
} from '../types';
import { formatCleanPersonName, formatCleanMobile } from '../utils/dailyAvailability';
import { Printer, X } from 'lucide-react';

interface PrintableReceiptProps {
  language: Language;
  referenceNumber: string;
  type: 'SERVICE_SEARCH' | 'WORKER_REGISTRATION';
  serviceType?: MainServiceType;
  queryParams?: SearchQueryParams;
  selectedProvider?: Worker | TractorService | HarvesterService | MiniTruckService;
  allResults?: MatchScoreResult<Worker | TractorService | HarvesterService | MiniTruckService>[];
  registrationData?: WorkerRegistrationForm;
  onClose: () => void;
}

interface PrintableContact {
  name: string;
  phone: string;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  language,
  selectedProvider,
  allResults,
  registrationData,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handlePrint = () => {
    window.print();
  };

  // Helper to extract clean Name & Phone strictly adhering to minimal format
  const extractContact = (
    item: Worker | TractorService | HarvesterService | MiniTruckService
  ): PrintableContact => {
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
        'Worker';
      rawPhone = item.contactDemo || item.contactNumber || '';
    }

    return {
      name: formatCleanPersonName(rawName),
      phone: formatCleanMobile(rawPhone),
    };
  };

  // Build the list of contacts to print
  const contacts: PrintableContact[] = useMemo(() => {
    if (selectedProvider) {
      const single = extractContact(selectedProvider);
      return single.name || single.phone ? [single] : [];
    }

    if (allResults && allResults.length > 0) {
      return allResults
        .map((r) => extractContact(r.item))
        .filter((c) => Boolean(c.name || c.phone));
    }

    if (registrationData) {
      return [
        {
          name: formatCleanPersonName(registrationData.name || 'Worker'),
          phone: formatCleanMobile(registrationData.contactNumber || ''),
        },
      ].filter((c) => Boolean(c.name || c.phone));
    }

    return [];
  }, [selectedProvider, allResults, registrationData, language]);

  return (
    <div className="receipt-overlay" role="dialog" aria-modal="true">
      <div className="receipt-modal-container">
        {/* On-Screen Kiosk Action Bar (Hidden during @media print) */}
        <div className="receipt-screen-toolbar no-print">
          <div className="toolbar-left">
            <span className="slip-preview-title">
              {language === 'hi'
                ? 'कांटेक्ट पर्ची पूर्वावलोकन'
                : language === 'te'
                ? 'కాంటాక్ట్ స్లిప్ ప్రివ్యూ'
                : 'Contact Slip Print Preview'}
            </span>
          </div>
          <div className="toolbar-actions">
            <button
              type="button"
              className="kiosk-btn-primary print-now-btn"
              onClick={handlePrint}
            >
              <Printer size={20} strokeWidth={2.5} />
              <span>
                {language === 'hi'
                  ? 'अभी प्रिंट करें / PRINT'
                  : language === 'te'
                  ? 'ఇప్పుడే ప్రింట్ చేయండి / PRINT'
                  : 'PRINT SLIP / SAVE AS PDF'}
              </span>
            </button>
            <button
              type="button"
              className="kiosk-btn-outline close-receipt-btn"
              onClick={onClose}
              aria-label="Close receipt"
            >
              <X size={20} strokeWidth={2.5} />
              <span>{language === 'hi' ? 'बंद करें' : language === 'te' ? 'మూసివేయి' : 'CLOSE'}</span>
            </button>
          </div>
        </div>

        {/* 
          COMPACT PRINT OUTPUT (STRICTLY Person Name + Mobile Number ONLY):
          - NO app name or logo
          - NO receipt title or heading
          - NO date, time, or timestamp
          - NO village or location
          - NO machine details (model, implements, HP, fuel)
          - NO availability status
          - NO rate or price
          - NO labels like "Name:" or "Mobile:"
          - NO footer notes or decorative borders
          - NO QR codes
        */}
        <div className="compact-print-paper printable-area" id="kiosk-receipt-print">
          <div className="compact-print-header">
            <h2 className="compact-print-heading">
              {language === 'te'
                ? 'గ్రామకనెక్ట్ — అందుబాటులో ఉన్న కూలీల / సర్వీస్ జాబితా'
                : language === 'hi'
                ? 'ग्रामकनेक्ट — उपलब्ध कृषि श्रमिक व सेवा सूची'
                : 'GramaConnect — Available Agricultural Services'}
            </h2>
            <p className="compact-print-subheading">
              {language === 'te'
                ? 'రాంపూర్ గ్రామ పంచాయతీ — పేరు & మొబైల్ నంబర్ మాత్రమే'
                : language === 'hi'
                ? 'रामपुर ग्राम पंचायत — केवल नाम और मोबाइल नंबर'
                : 'Rampur Gram Panchayat — Name and Mobile Number Only'}
            </p>
          </div>

          {contacts.length === 0 ? (
            <div className="compact-print-empty">No contacts available.</div>
          ) : (
            <div className="compact-print-list">
              {contacts.map((c, idx) => (
                <div key={idx} className="compact-print-entry">
                  <div className="compact-print-name">
                    {idx + 1}. {c.name}
                  </div>
                  <div className="compact-print-phone">{c.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
