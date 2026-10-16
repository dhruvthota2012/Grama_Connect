import React, { useState } from 'react';
import { Language, MainServiceType, CategoryItem } from '../types';
import { translations } from '../i18n/translations';
import { ALL_SUBCATEGORIES } from '../data/categories';
import { AgriculturalIllustration } from '../assets/illustrations';
import { useKeyboardNav } from '../hooks/useKeyboardNav';
import { speakText } from '../utils/speechGuidance';
import { Volume2 } from 'lucide-react';

interface SubcategoryGridProps {
  language: Language;
  serviceType: MainServiceType;
  onSelectSubcategory: (subcategory: CategoryItem) => void;
}

export const SubcategoryGrid: React.FC<SubcategoryGridProps> = ({
  language,
  serviceType,
  onSelectSubcategory,
}) => {
  const t = translations[language];
  const items: CategoryItem[] = ALL_SUBCATEGORIES[serviceType] || [];
  const [selectedSubcatId, setSelectedSubcatId] = useState<string | null>(null);

  const getSpokenText = (item: CategoryItem) => {
    const title = language === 'te' ? item.titleTe : language === 'hi' ? item.titleHi : item.titleEn;
    if (language === 'te') {
      return `${title} ఎంపిక చేయబడింది. రాంపూర్ పంచాయతీలో అందుబాటులో ఉన్నవారిని చూడటానికి మరోసారి నొక్కండి.`;
    }
    if (language === 'hi') {
      return `${title} चुना गया। रामपुर पंचायत में उपलब्ध प्रदाता देखने के लिए दोबारा टैप करें।`;
    }
    return `Selected ${title}. Tap again to view available providers at Rampur Panchayat.`;
  };

  const handleCardClick = (item: CategoryItem) => {
    if (selectedSubcatId === item.id) {
      // Second tap: open match results
      onSelectSubcategory(item);
    } else {
      // First tap: highlight and speak
      setSelectedSubcatId(item.id);
      speakText(getSpokenText(item), language);
    }
  };

  // Key navigation for items 1-9 with two-tap flow
  const keyMap: Record<string, () => void> = {};
  items.slice(0, 9).forEach((item) => {
    keyMap[String(item.number)] = () => handleCardClick(item);
  });
  useKeyboardNav(keyMap);

  const getHeading = () => {
    switch (serviceType) {
      case 'person':
        return { title: t.subcatPersonHeading, sub: t.subcatPersonSub };
      case 'tractor':
        return { title: t.subcatTractorHeading, sub: t.subcatTractorSub };
      case 'harvester':
        return { title: t.subcatHarvesterHeading, sub: t.subcatHarvesterSub };
      case 'mini_truck':
        return { title: t.subcatMiniTruckHeading, sub: t.subcatMiniTruckSub };
    }
  };

  const { title, sub } = getHeading();

  return (
    <div className="kiosk-screen subcategory-grid-screen">
      <div className="screen-header">
        <h2 className="screen-title">{title}</h2>
        <p className="screen-subtitle">{sub}</p>
        <p className="voice-guidance-instruction">
          <Volume2 size={18} />
          <span>{t.twoTapHint}</span>
        </p>
      </div>

      <div className="subcategories-grid">
        {items.map((item) => {
          const isSelected = selectedSubcatId === item.id;
          const displayTitle = language === 'te' ? item.titleTe : language === 'hi' ? item.titleHi : item.titleEn;
          const displayDesc = language === 'te' ? item.descriptionTe : language === 'hi' ? item.descriptionHi : item.descriptionEn;

          return (
            <button
              key={item.id}
              type="button"
              className={`subcat-card ${isSelected ? 'selected-highlight' : ''}`}
              onClick={() => handleCardClick(item)}
            >
              <div className="subcat-card-top">
                <span className="card-number-badge">{item.number}</span>
                {isSelected ? (
                  <div className="card-selected-top-controls">
                    <span className="tap-confirm-badge">{t.tapAgainToOpen}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      className="card-audio-replay-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(getSpokenText(item), language);
                      }}
                      title={t.replayVoice}
                    >
                      <Volume2 size={16} />
                    </span>
                  </div>
                ) : (
                  item.number <= 9 && <span className="key-hint">[ KEY {item.number} ]</span>
                )}
              </div>

              <div className="subcat-card-illustration">
                <AgriculturalIllustration name={item.illustrationKey} size={84} />
                <span className="illus-caption">{displayTitle}</span>
              </div>

              <div className="subcat-card-body">
                <h4 className="subcat-title-primary">{displayTitle}</h4>
                <p className="subcat-desc">{displayDesc}</p>
              </div>

              {isSelected && (
                <div className="card-tap-again-footer">
                  <span>{t.tapAgainToOpen}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="kiosk-footer-instructions">
        <p>
          👆 <strong>{t.twoTapHint}</strong>
        </p>
      </div>
    </div>
  );
};
