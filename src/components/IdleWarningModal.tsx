import React from 'react';
import { Language } from '../types';
import { translations } from '../i18n/translations';
import { Clock } from 'lucide-react';

interface IdleWarningModalProps {
  language: Language;
  secondsRemaining: number;
  onExtendSession: () => void;
}

export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({
  language,
  secondsRemaining,
  onExtendSession,
}) => {
  const t = translations[language];

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="timeout-title">
      <div className="modal-card timeout-modal">
        <div className="timeout-icon-wrap">
          <Clock size={48} strokeWidth={2.5} />
        </div>
        <h2 id="timeout-title" className="timeout-heading">
          {t.timerWarningHeading}
        </h2>
        <p className="timeout-msg">{t.timerWarningMsg}</p>
        <div className="timeout-digits">
          <span className="digits">{secondsRemaining}</span>
          <span className="unit">{t.timerWarningSec}</span>
        </div>
        <button
          type="button"
          className="kiosk-btn-primary full-width-btn"
          onClick={onExtendSession}
          autoFocus
        >
          {t.timerContinueBtn}
        </button>
      </div>
    </div>
  );
};

