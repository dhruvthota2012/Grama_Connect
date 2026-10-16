import React from 'react';

export type GrassProgressStage =
  | 'start'
  | 'progress'
  | 'completed'
  | 'error'
  | 1
  | 2
  | 3
  | 4
  | 5;

interface GrowingGrassStripProps {
  stage: GrassProgressStage;
  hasError?: boolean;
}

/**
 * GrowingGrassStrip — Single Developing Indian Agricultural Plant (Paddy/Rice Crop)
 * Visibly develops from a tiny sprout into a mature harvest crop across 5 distinct stages:
 * - Stage 1: Seedling — Small green shoot emerging from warm-brown soil patch with two delicate leaves.
 * - Stage 2: Early growth — Taller stem with unfolding leaves.
 * - Stage 3: Developing plant — Stronger stem with several well-spaced leaves.
 * - Stage 4: Mature plant — Healthy, full-grown crop with detailed leaves & grain panicle.
 * - Stage 5: Completion — Full harvest pose with golden grain highlight and success glow.
 *
 * Positioned centrally in a compact progress area at the bottom, blended into pale-blue & warm-cream theme.
 * Never overlaps buttons or inputs (pointer-events: none).
 */
export const GrowingGrassStrip: React.FC<GrowingGrassStripProps> = ({
  stage,
  hasError = false,
}) => {
  // Normalize stage into 1..5 numeric index
  let stageIndex = 1;
  if (stage === 'completed' || stage === 5) {
    stageIndex = 5;
  } else if (stage === 4) {
    stageIndex = 4;
  } else if (stage === 'progress' || stage === 3) {
    stageIndex = 3;
  } else if (stage === 2) {
    stageIndex = 2;
  } else {
    stageIndex = 1;
  }

  const isDormant = hasError || stage === 'error';
  const effectiveStageClass = isDormant
    ? 'stage-dormant'
    : `stage-${stageIndex}`;

  return (
    <aside
      className={`growing-grass-container ${effectiveStageClass} ${
        stageIndex === 5 ? 'is-completed' : ''
      }`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="single-plant-pod">
        {/* Compact Crop Growth Visualizer */}
        <div className="grass-artwork-wrapper">
          <svg
            viewBox="0 0 240 76"
            className="grass-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Rich Warm Farm Soil Gradient */}
              <linearGradient id="paddySoilGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8D5B3A" />
                <stop offset="50%" stopColor="#5C381E" />
                <stop offset="100%" stopColor="#3E2412" />
              </linearGradient>

              {/* Young Fresh Sprout Leaf Gradient */}
              <linearGradient id="sproutGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#279653" />
                <stop offset="100%" stopColor="#86EFAC" />
              </linearGradient>

              {/* Robust Paddy Stalk & Leaves Gradient */}
              <linearGradient id="paddyStemGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#176B45" />
                <stop offset="60%" stopColor="#279653" />
                <stop offset="100%" stopColor="#4ADE80" />
              </linearGradient>

              {/* Golden Harvest Grain Gradient */}
              <linearGradient id="goldenGrainGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#F3C969" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>

              {/* Completion Aura / Halo Filter */}
              <radialGradient id="successHaloGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F3C969" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#279653" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#279653" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Stage 5 Golden Success Glow Halo */}
            {stageIndex === 5 && !isDormant && (
              <circle
                cx="120"
                cy="32"
                r="36"
                fill="url(#successHaloGrad)"
                className="harvest-glow-aura"
              />
            )}

            {/* 1. Fertile Soil Mound (Ground Base) */}
            <path
              d="M30,70 Q120,54 210,70 L210,76 L30,76 Z"
              fill="url(#paddySoilGrad)"
              className="soil-bed-path"
            />
            {/* Soil texture dots */}
            <g fill="#3E2412" opacity="0.7">
              <circle cx="95" cy="65" r="1.4" />
              <circle cx="110" cy="64" r="1.8" />
              <circle cx="120" cy="63" r="1.6" />
              <circle cx="132" cy="64" r="1.8" />
              <circle cx="145" cy="66" r="1.4" />
            </g>

            {/* ========================================================
                STAGE 1: SEEDLING (Shoot emerging with 2 delicate leaves)
               ======================================================== */}
            <g
              className={`plant-stage-group stage-1-group ${
                stageIndex >= 1 && !isDormant ? 'active-visible' : 'dormant'
              }`}
            >
              {/* Emerging central shoot */}
              <path
                d="M119,64 Q120,58 120,52 Q120,58 121,64 Z"
                fill="url(#sproutGrad)"
              />
              {/* Left delicate cotyledon leaf */}
              <path
                d="M120,57 Q112,54 107,51 Q113,56 120,60 Z"
                fill="url(#sproutGrad)"
                className="seedling-leaf sway-left"
              />
              {/* Right delicate cotyledon leaf */}
              <path
                d="M120,57 Q128,54 133,51 Q127,56 120,60 Z"
                fill="url(#sproutGrad)"
                className="seedling-leaf sway-right"
              />
            </g>

            {/* ========================================================
                STAGE 2: EARLY GROWTH (Taller stem, 3 unfolding leaves)
               ======================================================== */}
            <g
              className={`plant-stage-group stage-2-group ${
                stageIndex >= 2 && !isDormant ? 'active-visible' : 'hidden'
              }`}
            >
              {/* Taller stalk extending to Y=40 */}
              <path
                d="M118.5,64 Q120,50 120,40 Q120.5,50 121.5,64 Z"
                fill="url(#paddyStemGrad)"
              />
              {/* Lower left arching leaf */}
              <path
                d="M120,52 Q105,48 98,42 Q108,50 120,54 Z"
                fill="url(#paddyStemGrad)"
                className="sway-left"
              />
              {/* Lower right arching leaf */}
              <path
                d="M120,48 Q135,44 142,39 Q132,47 120,51 Z"
                fill="url(#paddyStemGrad)"
                className="sway-right"
              />
              {/* Top emerging young leaf */}
              <path
                d="M120,41 Q116,33 118,28 Q120,34 120,41 Z"
                fill="url(#sproutGrad)"
                className="sway-left"
              />
            </g>

            {/* ========================================================
                STAGE 3: DEVELOPING PLANT (Strong stem, 5 well-spaced leaves)
               ======================================================== */}
            <g
              className={`plant-stage-group stage-3-group ${
                stageIndex >= 3 && !isDormant ? 'active-visible' : 'hidden'
              }`}
            >
              {/* Stronger central stem reaching Y=24 */}
              <path
                d="M118,64 Q120,42 120,24 Q121,42 122,64 Z"
                fill="url(#paddyStemGrad)"
              />
              {/* Wide Left Leaf 1 */}
              <path
                d="M120,46 Q92,40 82,34 Q98,44 120,49 Z"
                fill="url(#paddyStemGrad)"
                className="sway-left"
              />
              {/* Wide Right Leaf 2 */}
              <path
                d="M120,42 Q148,36 158,30 Q142,41 120,45 Z"
                fill="url(#paddyStemGrad)"
                className="sway-right"
              />
              {/* Upper Left Leaf 3 */}
              <path
                d="M120,33 Q102,26 95,19 Q108,27 120,35 Z"
                fill="url(#paddyStemGrad)"
                className="sway-left"
              />
              {/* Upper Right Leaf 4 */}
              <path
                d="M120,29 Q138,22 145,16 Q133,24 120,31 Z"
                fill="url(#paddyStemGrad)"
                className="sway-right"
              />
            </g>

            {/* ========================================================
                STAGE 4: MATURE PLANT (Full grown crop, detailed leaves & grain)
               ======================================================== */}
            <g
              className={`plant-stage-group stage-4-group ${
                stageIndex >= 4 && !isDormant ? 'active-visible' : 'hidden'
              }`}
            >
              {/* Central mature arching stem */}
              <path
                d="M117.5,64 Q120,36 120,15 Q121.5,36 122.5,64 Z"
                fill="url(#paddyStemGrad)"
              />
              {/* Lowest heavy left leaf */}
              <path
                d="M120,50 Q80,45 68,36 Q88,48 120,53 Z"
                fill="url(#paddyStemGrad)"
                className="sway-left"
              />
              {/* Lowest heavy right leaf */}
              <path
                d="M120,47 Q160,42 172,33 Q152,45 120,50 Z"
                fill="url(#paddyStemGrad)"
                className="sway-right"
              />
              {/* High arching leaf left */}
              <path
                d="M120,28 Q88,18 80,8 Q95,19 120,30 Z"
                fill="url(#paddyStemGrad)"
                className="sway-left"
              />
              {/* High arching leaf right */}
              <path
                d="M120,25 Q152,15 160,5 Q145,17 120,27 Z"
                fill="url(#paddyStemGrad)"
                className="sway-right"
              />

              {/* Emerging green-golden grain panicle head */}
              <path
                d="M120,15 Q126,8 134,7 Q128,12 120,16 Z"
                fill="url(#goldenGrainGrad)"
                className="sway-right"
              />
              <circle cx="127" cy="10" r="2" fill="#F3C969" />
              <circle cx="132" cy="8" r="2.2" fill="#F3C969" />
              <circle cx="137" cy="9" r="2" fill="#F3C969" />
            </g>

            {/* ========================================================
                STAGE 5: COMPLETION (Full harvest golden bloom & triumph)
                Retains .flourishing-harvest-group for test compatibility
               ======================================================== */}
            <g
              className={`flourishing-harvest-group ${
                stageIndex === 5 && !isDormant ? 'visible' : 'dormant'
              }`}
            >
              {/* Pendulous Golden Rice Panicle (Bountiful Grains) */}
              <g className="paddy-panicle-cluster sway-right">
                {/* Main panicle stem arching downward with weight of grains */}
                <path
                  d="M120,15 Q135,5 146,8 Q154,12 158,20 Q152,14 142,10 Q132,8 120,16 Z"
                  fill="url(#goldenGrainGrad)"
                />
                {/* Plump Golden Rice Grains along panicle */}
                <ellipse cx="132" cy="7" rx="3.5" ry="2" transform="rotate(15 132 7)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
                <ellipse cx="139" cy="8" rx="3.5" ry="2" transform="rotate(25 139 8)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
                <ellipse cx="146" cy="11" rx="3.5" ry="2" transform="rotate(40 146 11)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
                <ellipse cx="152" cy="16" rx="3.5" ry="2" transform="rotate(60 152 16)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
                <ellipse cx="156" cy="22" rx="3.5" ry="2" transform="rotate(75 156 22)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
                <ellipse cx="157" cy="28" rx="3.2" ry="1.8" transform="rotate(90 157 28)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
              </g>

              {/* Second secondary panicle branch */}
              <g className="paddy-panicle-cluster sway-left">
                <path
                  d="M120,18 Q110,9 100,12 Q93,17 90,24 Q95,18 104,14 Q112,12 120,19 Z"
                  fill="url(#goldenGrainGrad)"
                />
                <ellipse cx="109" cy="11" rx="3.2" ry="1.8" transform="rotate(-20 109 11)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
                <ellipse cx="102" cy="13" rx="3.2" ry="1.8" transform="rotate(-35 102 13)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
                <ellipse cx="96" cy="18" rx="3.2" ry="1.8" transform="rotate(-55 96 18)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
                <ellipse cx="91" cy="24" rx="3.2" ry="1.8" transform="rotate(-80 91 24)" fill="url(#goldenGrainGrad)" stroke="#B45309" strokeWidth="0.5" />
              </g>

              {/* Sparkling Golden Dewdrops */}
              <circle cx="120" cy="10" r="2.2" fill="#FFF9ED" className="dewdrop-sparkle" />
              <circle cx="154" cy="14" r="1.6" fill="#FFF9ED" className="dewdrop-sparkle" />
              <circle cx="94" cy="15" r="1.6" fill="#FFF9ED" className="dewdrop-sparkle" />
            </g>
          </svg>
        </div>

        {/* 5-Step Progress Indicators synced with plant growth */}
        <div className="plant-progress-indicators" aria-label={`Progress stage ${stageIndex} of 5`}>
          <div className="step-dots-row">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`step-dot ${s <= stageIndex ? 'dot-filled' : ''} ${
                  s === stageIndex ? 'dot-current' : ''
                }`}
                title={`Stage ${s}`}
              />
            ))}
          </div>
          <span className="step-caption-text">
            {stageIndex === 1 && '🌱 1/5: Sprout'}
            {stageIndex === 2 && '🌿 2/5: Growing'}
            {stageIndex === 3 && '🌾 3/5: Developing'}
            {stageIndex === 4 && '🌾 4/5: Mature'}
            {stageIndex === 5 && '✨ 5/5: Harvest Ready'}
          </span>
        </div>
      </div>
    </aside>
  );
};
