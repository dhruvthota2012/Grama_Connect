import React from 'react';

interface IllustrationProps {
  name: string;
  className?: string;
  size?: number;
}

export const AgriculturalIllustration: React.FC<IllustrationProps> = ({
  name,
  className = '',
  size = 80,
}) => {
  const commonSvgProps = {
    width: size,
    height: size,
    viewBox: '0 0 100 100',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: `agri-illus ${className}`,
    role: 'img',
    'aria-label': name,
  };

  switch (name) {
    // ==========================================
    // MAIN SERVICES (4)
    // ==========================================
    case 'main_person':
    case 'person':
    case 'hub_worker':
      return (
        <svg {...commonSvgProps}>
          {/* Detailed Silhouette: Indian farmer with turban, gamcha, kurta/dhoti, holding sickle */}
          {/* Pagdi / Turban */}
          <path d="M40 13 C40 7 50 5 60 8 C65 10 65 17 62 20 C58 23 45 23 40 18 Z" fill="#000" />
          <path d="M43 9 C48 6 56 6 60 10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M38 16 C45 13 55 14 62 16" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
          {/* Head & Neck */}
          <path d="M46 19 C44 23 44 26 47 28 C49 29 53 29 55 27 C57 24 57 20 54 18 Z" fill="#000" />
          {/* Gamcha / Scarf draped over shoulder */}
          <path d="M43 27 C38 31 36 38 35 46 C37 46 39 37 42 32 Z" fill="#000" />
          {/* Kurta Torso */}
          <path d="M43 28 L59 28 L62 55 L39 55 Z" fill="#000" />
          <path d="M51 28 L51 44" stroke="#fff" strokeWidth="1.2" />
          {/* Arms */}
          {/* Left arm resting on waist */}
          <path d="M43 29 C37 34 35 41 37 48 L41 47 C40 42 42 36 46 32 Z" fill="#000" />
          {/* Right arm extended forward holding sickle */}
          <path d="M59 30 C65 34 71 39 74 43 L72 47 C68 43 63 39 58 35 Z" fill="#000" />
          {/* Curved Sickle (Hansiya) */}
          <rect x="73" y="42" width="4" height="8" rx="1.5" fill="#000" />
          <path d="M75 42 C76 34 84 30 89 33 C91 35 91 38 88 39 C83 40 77 43 75 48" stroke="#000" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Dhoti / Lower Garment */}
          <path d="M39 54 L62 54 L65 76 C63 80 57 82 54 75 L51 64 L48 76 C45 82 39 80 37 76 Z" fill="#000" />
          <path d="M51 55 L51 72" stroke="#fff" strokeWidth="1.2" />
          {/* Legs & Feet */}
          <path d="M41 76 L41 90 L46 90 L46 76 Z" fill="#000" />
          <path d="M56 76 L56 90 L61 90 L61 76 Z" fill="#000" />
          {/* Lush Paddy Crops at base */}
          <path d="M12 92 L88 92" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 92 Q20 78 24 74 Q26 84 28 92" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M25 92 Q30 76 35 72 Q36 84 38 92" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M72 92 Q76 76 80 74 Q83 83 85 92" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'main_tractor':
    case 'tractor':
    case 'hub_tractor':
      return (
        <svg {...commonSvgProps}>
          {/* Indian Tractor Silhouette: Swaraj/Mahindra style */}
          {/* Driver with Turban */}
          <circle cx="42" cy="30" r="4.5" fill="#000" />
          <path d="M38 27 C38 22 47 22 47 27 Z" fill="#000" />
          <path d="M40 35 L47 35 L48 48 L39 48 Z" fill="#000" />
          <path d="M45 37 L53 43" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          {/* Steering Wheel & Column */}
          <line x1="50" y1="48" x2="55" y2="40" stroke="#000" strokeWidth="2" />
          <line x1="52" y1="39" x2="57" y2="42" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          {/* Mudguard & Seat */}
          <path d="M26 48 C26 38 42 38 44 48 L26 48 Z" fill="#000" />
          {/* Tractor Hood / Engine Body */}
          <path d="M48 44 L80 44 C84 44 86 48 86 52 L86 66 L48 66 Z" fill="#000" />
          {/* Front Grille detail */}
          <line x1="82" y1="48" x2="82" y2="62" stroke="#fff" strokeWidth="1.5" />
          <line x1="78" y1="48" x2="78" y2="62" stroke="#fff" strokeWidth="1.5" />
          {/* Headlamp */}
          <circle cx="84" cy="50" r="2" fill="#fff" />
          {/* Exhaust Pipe / Silencer */}
          <path d="M72 44 L72 24 L70 24 L70 44" fill="#000" />
          <rect x="69" y="22" width="4" height="3" rx="1" fill="#000" />
          {/* Air Filter */}
          <rect x="76" y="32" width="4" height="8" rx="1.5" fill="#000" />
          {/* Large Rear Tyre with Deep Cleats */}
          <circle cx="34" cy="68" r="18" fill="#000" />
          <circle cx="34" cy="68" r="11" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="34" cy="68" r="4.5" fill="#000" />
          {/* Tyre Tread Marks */}
          <line x1="34" y1="50" x2="34" y2="56" stroke="#fff" strokeWidth="2" />
          <line x1="34" y1="80" x2="34" y2="86" stroke="#fff" strokeWidth="2" />
          <line x1="16" y1="68" x2="22" y2="68" stroke="#fff" strokeWidth="2" />
          <line x1="46" y1="68" x2="52" y2="68" stroke="#fff" strokeWidth="2" />
          {/* Front Wheel */}
          <circle cx="76" cy="73" r="11" fill="#000" />
          <circle cx="76" cy="73" r="5.5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="76" cy="73" r="2.5" fill="#000" />
          {/* Ground Furrows */}
          <line x1="6" y1="86" x2="94" y2="86" stroke="#000" strokeWidth="2" />
          <path d="M12 90 Q30 87 50 90 Q70 87 90 90" stroke="#000" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    case 'main_harvester':
    case 'harvester':
    case 'hub_harvester':
      return (
        <svg {...commonSvgProps}>
          {/* Heavy Combine Harvester in Paddy Field */}
          {/* Harvester Body */}
          <path d="M18 36 L62 36 L72 50 L76 50 L76 72 L18 72 Z" fill="#000" />
          {/* Cabin Glass Window */}
          <path d="M48 38 L62 38 L68 49 L48 49 Z" fill="#fff" stroke="#000" strokeWidth="1.5" />
          {/* Operator silhouette in cabin */}
          <circle cx="56" cy="43" r="3" fill="#000" />
          {/* Grain Discharge Unloading Tube (Auger) */}
          <path d="M26 38 L8 22 L6 25 L22 43 Z" fill="#000" />
          {/* Rotating Reel Header at Front */}
          <circle cx="86" cy="62" r="13" stroke="#000" strokeWidth="2.5" fill="#fff" />
          <circle cx="86" cy="62" r="3.5" fill="#000" />
          {/* Reel Bats & Tines */}
          <line x1="86" y1="49" x2="86" y2="75" stroke="#000" strokeWidth="2" />
          <line x1="73" y1="62" x2="99" y2="62" stroke="#000" strokeWidth="2" />
          <line x1="77" y1="53" x2="95" y2="71" stroke="#000" strokeWidth="2" />
          <line x1="77" y1="71" x2="95" y2="53" stroke="#000" strokeWidth="2" />
          {/* Cutter Bar Table */}
          <path d="M72 65 L84 73 L74 77 Z" fill="#000" />
          {/* Crawler Track / Heavy Wheels */}
          <rect x="22" y="68" width="48" height="15" rx="7.5" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="29" cy="75.5" r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="46" cy="75.5" r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="63" cy="75.5" r="5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          {/* Field Grain Base */}
          <line x1="6" y1="87" x2="94" y2="87" stroke="#000" strokeWidth="2" />
          <path d="M84 87 L87 79 M88 87 L91 78 M92 87 L95 80" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'main_mini_truck':
    case 'mini_truck':
    case 'hub_truck':
      return (
        <svg {...commonSvgProps}>
          {/* Indian Mini-Truck: Tata Ace Chhota Hathi / Bolero Maxi Truck */}
          {/* Driver Cabin */}
          <path d="M58 40 L76 40 C80 40 86 46 88 52 L90 68 L58 68 Z" fill="#000" />
          {/* Windshield */}
          <path d="M68 43 L76 43 C79 43 83 47 85 52 L68 52 Z" fill="#fff" stroke="#000" strokeWidth="1" />
          {/* Side Window */}
          <rect x="60" y="44" width="6" height="8" fill="#fff" />
          {/* Headlamp & Grille */}
          <circle cx="88" cy="62" r="2.5" fill="#fff" />
          <rect x="80" y="60" width="6" height="5" fill="#fff" />
          {/* Rear Cargo Bed with Loading Slats */}
          <rect x="14" y="46" width="43" height="22" fill="#000" />
          {/* Cargo Sacks / Crates piled above bed */}
          <path d="M18 46 C18 36 28 36 28 46" fill="#000" />
          <path d="M28 46 C28 34 40 34 40 46" fill="#000" />
          <path d="M38 46 C38 38 48 38 48 46" fill="#000" />
          <line x1="14" y1="56" x2="57" y2="56" stroke="#fff" strokeWidth="1.5" />
          {/* Chassis & Mudguard */}
          <rect x="16" y="67" width="70" height="4" fill="#000" />
          {/* Wheels */}
          <circle cx="28" cy="74" r="10" fill="#000" />
          <circle cx="28" cy="74" r="4.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="75" cy="74" r="10" fill="#000" />
          <circle cx="75" cy="74" r="4.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          {/* Road */}
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2.5" />
          <line x1="18" y1="89" x2="82" y2="89" stroke="#000" strokeWidth="1.5" strokeDasharray="6 4" />
        </svg>
      );

    // ==========================================
    // PERSON SUBCATEGORIES (16)
    // ==========================================
    case 'worker_sowing':
      return (
        <svg {...commonSvgProps}>
          {/* Farmer walking along furrows, broadcasting seeds from cloth pouch */}
          {/* Turban & Head */}
          <path d="M32 18 C32 11 44 11 44 18 C46 22 36 24 32 18 Z" fill="#000" />
          <circle cx="38" cy="23" r="5" fill="#000" />
          {/* Body & Torso */}
          <path d="M34 28 L46 28 L44 54 L32 54 Z" fill="#000" />
          {/* Shoulder bag (Jhola) */}
          <path d="M36 29 L28 46 C26 50 36 52 38 47 L44 32" stroke="#fff" strokeWidth="1.5" fill="#000" />
          {/* Right Arm swinging forward broadcasting seeds */}
          <path d="M44 32 C54 30 64 34 72 38 L70 42 C62 38 52 35 44 38 Z" fill="#000" />
          {/* Seed particles flying into soil */}
          <circle cx="76" cy="40" r="1.5" fill="#000" />
          <circle cx="82" cy="44" r="1.5" fill="#000" />
          <circle cx="78" cy="50" r="1.5" fill="#000" />
          <circle cx="85" cy="56" r="1.5" fill="#000" />
          <circle cx="80" cy="62" r="1.5" fill="#000" />
          {/* Dhoti / Legs walking */}
          <path d="M33 54 L44 54 L46 75 L38 75 Z" fill="#000" />
          <path d="M34 75 L30 90 L35 90 L40 76 Z" fill="#000" />
          <path d="M42 75 L48 90 L53 90 L45 76 Z" fill="#000" />
          {/* Furrow lines */}
          <path d="M8 88 Q30 85 55 88 Q75 85 92 88" stroke="#000" strokeWidth="2.5" />
          <path d="M12 94 Q40 91 65 94 Q80 92 92 94" stroke="#000" strokeWidth="2" strokeDasharray="4 4" />
        </svg>
      );

    case 'worker_transplanting':
      return (
        <svg {...commonSvgProps}>
          {/* Two rural farmers bending low to plant rice seedlings in flooded paddy */}
          {/* Left Farmer (Bending low) */}
          <path d="M22 36 C22 28 32 28 32 36 Z" fill="#000" />
          <circle cx="28" cy="38" r="4.5" fill="#000" />
          <path d="M26 42 C32 40 40 45 42 54 L34 57 C30 50 26 47 22 45 Z" fill="#000" />
          <path d="M42 54 L46 72 L42 73 L38 57 Z" fill="#000" />
          {/* Arm holding seedling bundle into puddle */}
          <path d="M38 50 C44 56 46 68 47 74 L44 75 C42 68 40 58 35 52 Z" fill="#000" />
          {/* Seedling bunch in hand */}
          <path d="M47 74 Q49 66 52 64 M47 74 Q45 65 43 63" stroke="#000" strokeWidth="2" />
          {/* Legs standing in puddle */}
          <path d="M24 50 L18 78 L23 78 L28 54 Z" fill="#000" />
          {/* Right Farmer (Planting in line) */}
          <circle cx="68" cy="32" r="4.5" fill="#000" />
          <path d="M64 26 C64 20 74 20 74 26 Z" fill="#000" />
          <path d="M65 36 C72 35 78 42 79 50 L72 52 C70 46 66 42 62 40 Z" fill="#000" />
          <path d="M74 48 C77 56 78 67 79 72 L76 73 C74 67 72 58 68 51 Z" fill="#000" />
          <path d="M79 72 Q82 64 85 62 M79 72 Q76 63 74 62" stroke="#000" strokeWidth="2" />
          <path d="M64 48 L62 76 L66 76 L70 52 Z" fill="#000" />
          {/* Flooded Water Surface & Planted Seedling Rows */}
          <line x1="8" y1="78" x2="92" y2="78" stroke="#000" strokeWidth="2" />
          <path d="M12 84 Q24 81 36 84 Q48 81 60 84 Q72 81 88 84" stroke="#000" strokeWidth="1.5" />
          {/* Seedlings planted in neat row */}
          <path d="M14 78 Q15 70 17 68 M14 78 Q12 70 11 68" stroke="#000" strokeWidth="2" />
          <path d="M28 78 Q30 70 32 68 M28 78 Q26 70 25 68" stroke="#000" strokeWidth="2" />
          <path d="M58 78 Q60 70 62 68 M58 78 Q56 70 55 68" stroke="#000" strokeWidth="2" />
          <path d="M88 78 Q90 70 92 68 M88 78 Q86 70 85 68" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_harvesting':
      return (
        <svg {...commonSvgProps}>
          {/* Farmer harvesting crops with sickle and bundling sheaves */}
          <path d="M38 18 C38 11 48 11 48 18 Z" fill="#000" />
          <circle cx="43" cy="22" r="4.5" fill="#000" />
          {/* Bending Torso */}
          <path d="M40 27 L52 27 L56 50 L38 50 Z" fill="#000" />
          {/* Left Arm holding sheaf */}
          <path d="M40 32 C34 38 32 46 36 54 L38 52 C35 46 38 40 43 36 Z" fill="#000" />
          {/* Right Arm swinging sickle */}
          <path d="M52 32 C60 38 66 46 68 54 L64 56 C62 48 56 42 50 36 Z" fill="#000" />
          {/* Curved Sickle cutting base */}
          <path d="M68 54 C72 48 80 48 82 54 C82 58 76 62 68 62" stroke="#000" strokeWidth="2.5" fill="none" />
          {/* Standing Crop being reaped */}
          <path d="M72 78 Q74 58 80 50 Q84 56 86 78" stroke="#000" strokeWidth="2.5" fill="none" />
          <path d="M78 78 Q80 54 86 46 Q90 54 92 78" stroke="#000" strokeWidth="2.5" fill="none" />
          {/* Legs */}
          <path d="M39 50 L36 78 L41 78 L45 52 Z" fill="#000" />
          <path d="M48 50 L52 78 L57 78 L53 52 Z" fill="#000" />
          <line x1="8" y1="84" x2="92" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_weeding':
      return (
        <svg {...commonSvgProps}>
          {/* Farm worker squatting with khurpi weeding hand-tool */}
          <path d="M38 28 C38 20 48 20 48 28 Z" fill="#000" />
          <circle cx="43" cy="32" r="4.5" fill="#000" />
          {/* Squatting curved back */}
          <path d="M40 36 C48 34 56 40 54 52 C50 62 42 66 34 66 L34 58 C40 58 46 54 46 44 Z" fill="#000" />
          {/* Arm holding khurpi at ground */}
          <path d="M46 44 C52 50 56 60 58 72 L54 73 C52 62 48 54 44 48 Z" fill="#000" />
          {/* Khurpi tool blade scraping soil */}
          <rect x="56" y="70" width="3" height="6" fill="#000" />
          <path d="M55 76 L66 76 L63 79 L54 79 Z" fill="#000" />
          {/* Squatted bent legs */}
          <path d="M34 62 C30 68 28 78 32 82 L38 82 C34 76 36 68 40 64 Z" fill="#000" />
          {/* Grass / weeds uprooted */}
          <path d="M66 76 Q68 70 72 68 M68 76 Q72 71 75 72" stroke="#000" strokeWidth="2" />
          <line x1="10" y1="84" x2="90" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_fertilizer':
      return (
        <svg {...commonSvgProps}>
          {/* Worker carrying fertilizer basket, broadcasting granular nutrients */}
          <circle cx="40" cy="20" r="4.5" fill="#000" />
          <path d="M35 15 C35 9 45 9 45 15 Z" fill="#000" />
          <path d="M35 25 L47 25 L45 52 L34 52 Z" fill="#000" />
          {/* Basket held against waist */}
          <path d="M28 40 C28 34 42 34 42 40 L40 48 C40 52 30 52 30 48 Z" fill="#000" />
          {/* Broadcasting arm */}
          <path d="M46 30 C56 28 66 32 76 35 L74 39 C66 36 56 33 46 35 Z" fill="#000" />
          {/* Granular fertilizer spray dots */}
          <circle cx="80" cy="38" r="1.5" fill="#000" />
          <circle cx="85" cy="42" r="1.5" fill="#000" />
          <circle cx="82" cy="48" r="1.5" fill="#000" />
          <circle cx="88" cy="52" r="1.5" fill="#000" />
          <circle cx="78" cy="56" r="1.5" fill="#000" />
          {/* Legs */}
          <path d="M36 52 L34 78 L39 78 L42 54 Z" fill="#000" />
          <path d="M43 52 L47 78 L52 78 L47 54 Z" fill="#000" />
          <line x1="12" y1="86" x2="88" y2="86" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_spraying':
      return (
        <svg {...commonSvgProps}>
          {/* Farmer with backpack sprayer, protective cloth, holding spray lance */}
          <circle cx="42" cy="20" r="4.5" fill="#000" />
          <path d="M37 15 C37 9 47 9 47 15 Z" fill="#000" />
          {/* Mask / cloth around lower face */}
          <path d="M39 22 L45 22 L43 26 L40 26 Z" fill="#000" />
          {/* Body */}
          <path d="M38 26 L50 26 L48 54 L36 54 Z" fill="#000" />
          {/* Knapsack Sprayer Tank on Back */}
          <rect x="26" y="28" width="12" height="24" rx="4" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Tank Straps */}
          <path d="M36 28 L42 34 L38 46 L34 46" stroke="#fff" strokeWidth="1.2" fill="none" />
          {/* Spray Lance & Hose held in hands */}
          <path d="M30 52 C32 60 42 62 48 54" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M48 35 L62 45 L76 42" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          {/* Spray Nozzle Cone */}
          <path d="M76 42 L88 34 L88 50 Z" stroke="#000" strokeWidth="1.5" fill="none" strokeDasharray="2 2" />
          {/* Legs */}
          <path d="M38 54 L36 82 L41 82 L44 56 Z" fill="#000" />
          <path d="M46 54 L50 82 L55 82 L49 56 Z" fill="#000" />
          <line x1="8" y1="88" x2="92" y2="88" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_irrigation':
      return (
        <svg {...commonSvgProps}>
          {/* Farmer with spade (phawra) channeling canal water into crops */}
          <circle cx="40" cy="22" r="4.5" fill="#000" />
          <path d="M35 17 C35 11 45 11 45 17 Z" fill="#000" />
          <path d="M36 27 L48 27 L46 54 L35 54 Z" fill="#000" />
          {/* Arms holding spade handle */}
          <path d="M46 32 L58 44 L54 48 L44 36 Z" fill="#000" />
          <line x1="48" y1="28" x2="68" y2="68" stroke="#000" strokeWidth="3" />
          {/* Spade head in soil */}
          <path d="M64 64 L74 68 L70 76 L60 72 Z" fill="#000" />
          {/* Flowing Water Channel */}
          <path d="M10 82 Q30 76 50 82 Q70 88 90 82" stroke="#000" strokeWidth="3" fill="none" />
          <path d="M14 88 Q34 82 54 88 Q74 94 94 88" stroke="#000" strokeWidth="2" fill="none" />
          {/* Legs */}
          <path d="M37 54 L35 78 L40 78 L43 56 Z" fill="#000" />
          <path d="M44 54 L48 78 L53 78 L47 56 Z" fill="#000" />
        </svg>
      );

    case 'worker_ploughing_assist':
      return (
        <svg {...commonSvgProps}>
          {/* Assistant farmer shaping bunds and breaking clods */}
          <circle cx="38" cy="24" r="4.5" fill="#000" />
          <path d="M33 19 C33 13 43 13 43 19 Z" fill="#000" />
          <path d="M34 29 L46 29 L44 56 L33 56 Z" fill="#000" />
          {/* Holding wooden mallet/hoe */}
          <line x1="44" y1="36" x2="66" y2="64" stroke="#000" strokeWidth="3" />
          <rect x="62" y="60" width="12" height="6" rx="2" fill="#000" transform="rotate(30 68 63)" />
          {/* Earthen bund and furrow */}
          <path d="M8 84 Q30 74 55 84 Q75 74 92 84" stroke="#000" strokeWidth="3" fill="none" />
          <path d="M36 56 L34 80 L39 80 L42 58 Z" fill="#000" />
          <path d="M43 56 L47 80 L52 80 L47 58 Z" fill="#000" />
        </svg>
      );

    case 'worker_fruit_picking':
      return (
        <svg {...commonSvgProps}>
          {/* Farmer reaching into tree canopy picking fruit */}
          <circle cx="44" cy="36" r="4.5" fill="#000" />
          <path d="M40 41 L50 41 L48 64 L38 64 Z" fill="#000" />
          {/* Reaching arm upwards */}
          <path d="M48 42 L58 24 L62 26 L52 44 Z" fill="#000" />
          {/* Hand picking mango/citrus */}
          <circle cx="62" cy="20" r="3.5" fill="#000" />
          {/* Tree Canopy Branch with Hanging Fruit */}
          <path d="M30 16 Q50 6 70 14 Q85 8 92 22 Q75 28 65 24" stroke="#000" strokeWidth="2.5" fill="none" />
          <circle cx="75" cy="18" r="3.5" fill="#000" />
          <circle cx="84" cy="22" r="3.5" fill="#000" />
          {/* Shoulder Harvest Basket */}
          <path d="M32 48 C32 44 42 44 42 48 L40 56 C40 60 32 60 32 56 Z" fill="#000" stroke="#fff" strokeWidth="1" />
          <path d="M40 64 L38 86 L43 86 L46 66 Z" fill="#000" />
          <path d="M46 64 L50 86 L55 86 L49 66 Z" fill="#000" />
          <line x1="12" y1="90" x2="88" y2="90" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_vegetable_picking':
      return (
        <svg {...commonSvgProps}>
          {/* Worker harvesting vegetables into crate */}
          <circle cx="36" cy="30" r="4.5" fill="#000" />
          <path d="M34 35 L44 35 L46 54 L32 54 Z" fill="#000" />
          <path d="M42 40 L52 48 L56 60" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          {/* Vegetable Crate on Ground */}
          <rect x="54" y="62" width="24" height="16" fill="#000" />
          <line x1="54" y1="70" x2="78" y2="70" stroke="#fff" strokeWidth="1.5" />
          {/* Harvested vegetables in crate */}
          <circle cx="60" cy="59" r="3" fill="#000" />
          <circle cx="66" cy="58" r="3" fill="#000" />
          <circle cx="72" cy="60" r="3" fill="#000" />
          {/* Vegetable Plant */}
          <path d="M18 78 Q22 58 26 50 Q28 62 30 78" stroke="#000" strokeWidth="2" />
          <circle cx="22" cy="60" r="2.5" fill="#000" />
          <circle cx="28" cy="56" r="2.5" fill="#000" />
          {/* Legs */}
          <path d="M34 54 L32 78 L37 78 L40 56 Z" fill="#000" />
          <line x1="8" y1="84" x2="92" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_cotton_picking':
      return (
        <svg {...commonSvgProps}>
          {/* Farmer picking fluffy cotton bolls into waist sack */}
          <circle cx="46" cy="24" r="4.5" fill="#000" />
          <path d="M42 29 L54 29 L52 56 L40 56 Z" fill="#000" />
          {/* Cotton Sack tied to waist */}
          <path d="M30 46 C30 38 42 38 42 46 L40 68 C40 76 28 76 28 68 Z" fill="#000" />
          <path d="M32 46 C34 40 40 40 40 46" stroke="#fff" strokeWidth="1.5" fill="none" />
          {/* Reaching arm into cotton plant */}
          <path d="M52 35 C62 34 68 40 74 44" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cotton Plant with White Bolls */}
          <path d="M72 78 L75 44 L84 52" stroke="#000" strokeWidth="2" />
          <circle cx="75" cy="42" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="85" cy="50" r="4.5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="68" cy="58" r="4.5" fill="#fff" stroke="#000" strokeWidth="2" />
          {/* Legs */}
          <path d="M42 56 L40 82 L45 82 L48 58 Z" fill="#000" />
          <path d="M49 56 L53 82 L58 82 L52 58 Z" fill="#000" />
          <line x1="12" y1="88" x2="90" y2="88" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_paddy_harvesting':
      return (
        <svg {...commonSvgProps}>
          {/* Worker holding reaped paddy sheaves, threshing/winnowing */}
          <circle cx="44" cy="22" r="4.5" fill="#000" />
          <path d="M40 27 L52 27 L50 54 L38 54 Z" fill="#000" />
          {/* Holding bundle of paddy */}
          <path d="M40 32 L26 44 L32 48 L44 38 Z" fill="#000" />
          <path d="M50 32 L64 44 L58 48 L48 38 Z" fill="#000" />
          {/* Sheaf of Rice with Golden Heads */}
          <path d="M44 36 Q38 24 30 20 M44 36 Q46 22 52 18 M44 36 Q54 26 60 22" stroke="#000" strokeWidth="2.5" />
          {/* Threshing stand / base */}
          <rect x="24" y="68" width="48" height="12" rx="2" fill="#000" />
          <path d="M40 54 L38 78 L43 78 L46 56 Z" fill="#000" />
          <path d="M48 54 L52 78 L57 78 L51 56 Z" fill="#000" />
          <line x1="10" y1="86" x2="90" y2="86" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_groundnut_harvesting':
      return (
        <svg {...commonSvgProps}>
          {/* Worker lifting peanut vine from loose soil */}
          <circle cx="42" cy="24" r="4.5" fill="#000" />
          <path d="M38 29 L50 29 L48 56 L36 56 Z" fill="#000" />
          <path d="M46 36 L56 50 L64 54" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          {/* Uprooted peanut plant with pods hanging from roots */}
          <path d="M64 54 L68 70 M64 54 L60 68 M64 54 L74 66" stroke="#000" strokeWidth="2" />
          <ellipse cx="68" cy="72" rx="2.5" ry="4" fill="#000" />
          <ellipse cx="60" cy="70" rx="2.5" ry="4" fill="#000" />
          <ellipse cx="74" cy="68" rx="2.5" ry="4" fill="#000" />
          <path d="M38 56 L36 82 L41 82 L44 58 Z" fill="#000" />
          <path d="M46 56 L50 82 L55 82 L49 58 Z" fill="#000" />
          <line x1="8" y1="88" x2="92" y2="88" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_sugarcane_cutting':
      return (
        <svg {...commonSvgProps}>
          {/* Worker cutting tall sugarcane stalks with machete */}
          <circle cx="36" cy="26" r="4.5" fill="#000" />
          <path d="M32 31 L44 31 L42 58 L30 58 Z" fill="#000" />
          {/* Arm holding cane knife */}
          <path d="M40 36 L52 44 L60 40" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M60 40 L68 34 L72 38 L62 43 Z" fill="#000" />
          {/* Tall Sugarcane Stalks */}
          <line x1="68" y1="14" x2="68" y2="84" stroke="#000" strokeWidth="3.5" />
          <line x1="76" y1="12" x2="76" y2="84" stroke="#000" strokeWidth="3.5" />
          <line x1="84" y1="16" x2="84" y2="84" stroke="#000" strokeWidth="3.5" />
          {/* Cane joints / nodes */}
          <line x1="66" y1="30" x2="70" y2="30" stroke="#fff" strokeWidth="1.5" />
          <line x1="66" y1="50" x2="70" y2="50" stroke="#fff" strokeWidth="1.5" />
          <line x1="74" y1="28" x2="78" y2="28" stroke="#fff" strokeWidth="1.5" />
          <line x1="74" y1="48" x2="78" y2="48" stroke="#fff" strokeWidth="1.5" />
          <line x1="12" y1="88" x2="92" y2="88" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_produce_loading':
      return (
        <svg {...commonSvgProps}>
          {/* Strong worker carrying heavy 75kg grain sack on shoulder */}
          <circle cx="38" cy="26" r="4.5" fill="#000" />
          <path d="M34 31 L46 31 L44 58 L32 58 Z" fill="#000" />
          {/* Heavy Burlap Sack on Shoulder */}
          <ellipse cx="44" cy="22" rx="14" ry="8" fill="#000" transform="rotate(-15 44 22)" stroke="#fff" strokeWidth="1" />
          <path d="M32 20 L28 18 M56 24 L60 26" stroke="#fff" strokeWidth="1.5" />
          {/* Arms holding sack firmly */}
          <path d="M44 34 L48 24 L52 26 L46 38 Z" fill="#000" />
          {/* Walking legs carrying load */}
          <path d="M34 58 L30 84 L36 84 L41 60 Z" fill="#000" />
          <path d="M42 58 L48 84 L54 84 L46 60 Z" fill="#000" />
          <line x1="10" y1="88" x2="90" y2="88" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'worker_general_labour':
      return (
        <svg {...commonSvgProps}>
          {/* General farm worker with spade and basket */}
          <circle cx="44" cy="22" r="4.5" fill="#000" />
          <path d="M39 17 C39 11 49 11 49 17 Z" fill="#000" />
          <path d="M40 27 L52 27 L50 54 L38 54 Z" fill="#000" />
          {/* Spade held upright */}
          <line x1="28" y1="26" x2="28" y2="86" stroke="#000" strokeWidth="2.5" />
          <path d="M22 82 L34 82 L31 90 L25 90 Z" fill="#000" />
          {/* Hand holding spade */}
          <path d="M40 32 L28 36" stroke="#000" strokeWidth="2" />
          {/* Basket on Ground */}
          <path d="M60 74 C60 70 76 70 76 74 L74 84 L62 84 Z" fill="#000" />
          <path d="M40 54 L38 84 L43 84 L46 56 Z" fill="#000" />
          <path d="M48 54 L52 84 L57 84 L51 56 Z" fill="#000" />
          <line x1="10" y1="90" x2="90" y2="90" stroke="#000" strokeWidth="2" />
        </svg>
      );

    // ==========================================
    // TRACTOR SUBCATEGORIES (14)
    // ==========================================
    case 'tractor_trolley':
      return (
        <svg {...commonSvgProps}>
          {/* Tractor pulling a loaded 2-wheel tipping trolley */}
          {/* Small Tractor Silhouette */}
          <rect x="10" y="52" width="22" height="16" fill="#000" />
          <circle cx="15" cy="68" r="8" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="28" cy="71" r="5" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Tow hitch */}
          <line x1="32" y1="62" x2="42" y2="62" stroke="#000" strokeWidth="3" />
          {/* Big Trolley Body */}
          <rect x="42" y="44" width="46" height="22" fill="#000" />
          {/* Slats */}
          <line x1="42" y1="52" x2="88" y2="52" stroke="#fff" strokeWidth="1.5" />
          <line x1="42" y1="60" x2="88" y2="60" stroke="#fff" strokeWidth="1.5" />
          {/* Trolley Wheel */}
          <circle cx="65" cy="72" r="11" fill="#000" stroke="#fff" strokeWidth="2" />
          <circle cx="65" cy="72" r="4" fill="#fff" />
          {/* Sacks mounded above trolley */}
          <path d="M46 44 C46 36 56 36 56 44" fill="#000" />
          <path d="M58 44 C58 34 72 34 72 44" fill="#000" />
          <path d="M74 44 C74 38 84 38 84 44" fill="#000" />
          <line x1="6" y1="83" x2="94" y2="83" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_plough':
      return (
        <svg {...commonSvgProps}>
          {/* Tractor with Mouldboard Plough turning deep soil */}
          <rect x="14" y="44" width="34" height="20" fill="#000" />
          <circle cx="24" cy="68" r="14" fill="#000" stroke="#fff" strokeWidth="2" />
          <circle cx="44" cy="72" r="8" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Three-point linkage */}
          <line x1="48" y1="54" x2="62" y2="60" stroke="#000" strokeWidth="3" />
          {/* 3 Plough shares cutting soil */}
          <path d="M62 58 L72 74 L68 76 L58 60 Z" fill="#000" />
          <path d="M72 58 L82 76 L78 78 L68 60 Z" fill="#000" />
          <path d="M82 58 L92 78 L88 80 L78 60 Z" fill="#000" />
          {/* Furrow curl */}
          <path d="M60 82 Q76 74 92 82" stroke="#000" strokeWidth="2.5" fill="none" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_seeder':
      return (
        <svg {...commonSvgProps}>
          {/* Tractor with Seed Drill hopper and multiple seed tubes */}
          <rect x="12" y="46" width="32" height="18" fill="#000" />
          <circle cx="20" cy="68" r="12" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Seed Hopper Box */}
          <path d="M52 40 L86 40 L80 62 L58 62 Z" fill="#000" />
          <line x1="52" y1="46" x2="86" y2="46" stroke="#fff" strokeWidth="1.5" />
          {/* Vertical seed drop tubes */}
          <line x1="60" y1="62" x2="60" y2="78" stroke="#000" strokeWidth="2.5" />
          <line x1="68" y1="62" x2="68" y2="78" stroke="#000" strokeWidth="2.5" />
          <line x1="76" y1="62" x2="76" y2="78" stroke="#000" strokeWidth="2.5" />
          {/* Furrow openers */}
          <path d="M58 78 L62 82 M66 78 L70 82 M74 78 L78 82" stroke="#000" strokeWidth="2.5" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_cultivator':
      return (
        <svg {...commonSvgProps}>
          {/* Cultivator with curved spring tines */}
          <rect x="14" y="46" width="30" height="18" fill="#000" />
          <circle cx="22" cy="68" r="12" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Tool bar frame */}
          <rect x="50" y="52" width="38" height="6" fill="#000" />
          {/* Curved Spring Tines */}
          <path d="M54 58 Q50 68 58 78" stroke="#000" strokeWidth="3" fill="none" />
          <path d="M64 58 Q60 68 68 78" stroke="#000" strokeWidth="3" fill="none" />
          <path d="M74 58 Q70 68 78 78" stroke="#000" strokeWidth="3" fill="none" />
          <path d="M84 58 Q80 68 88 78" stroke="#000" strokeWidth="3" fill="none" />
          <line x1="8" y1="82" x2="92" y2="82" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_rotavator':
      return (
        <svg {...commonSvgProps}>
          {/* Rotary tiller hood with spinning L-blades pulverizing soil */}
          <rect x="14" y="46" width="30" height="18" fill="#000" />
          <circle cx="22" cy="68" r="12" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Rotavator Curved Shield Cover */}
          <path d="M52 50 C52 42 86 42 86 50 L88 72 L50 72 Z" fill="#000" />
          {/* Rotating Rotor Drum & Blades */}
          <circle cx="69" cy="64" r="8" fill="#fff" stroke="#000" strokeWidth="2" />
          <line x1="69" y1="56" x2="69" y2="76" stroke="#000" strokeWidth="2.5" />
          <line x1="59" y1="64" x2="79" y2="64" stroke="#000" strokeWidth="2.5" />
          {/* Fine soil spray */}
          <path d="M88 68 Q92 62 96 66" stroke="#000" strokeWidth="2" />
          <line x1="8" y1="80" x2="92" y2="80" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_harrow':
      return (
        <svg {...commonSvgProps}>
          {/* Disc harrow gang chopping clods */}
          <rect x="14" y="46" width="28" height="18" fill="#000" />
          <circle cx="22" cy="68" r="12" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Disc Gang Frame */}
          <line x1="48" y1="54" x2="88" y2="54" stroke="#000" strokeWidth="4" />
          {/* Concave Discs */}
          <ellipse cx="56" cy="68" rx="4" ry="12" fill="#000" />
          <ellipse cx="66" cy="68" rx="4" ry="12" fill="#000" />
          <ellipse cx="76" cy="68" rx="4" ry="12" fill="#000" />
          <ellipse cx="86" cy="68" rx="4" ry="12" fill="#000" />
          <line x1="8" y1="82" x2="92" y2="82" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_disc_plough':
      return (
        <svg {...commonSvgProps}>
          {/* Heavy 3-bottom Disc Plough */}
          <rect x="14" y="46" width="28" height="18" fill="#000" />
          <circle cx="22" cy="68" r="12" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Diagonal Heavy Beam */}
          <line x1="48" y1="50" x2="88" y2="64" stroke="#000" strokeWidth="4" />
          {/* 3 Heavy Discs */}
          <ellipse cx="58" cy="68" rx="6" ry="14" fill="#000" transform="rotate(-15 58 68)" />
          <ellipse cx="72" cy="72" rx="6" ry="14" fill="#000" transform="rotate(-15 72 72)" />
          <ellipse cx="86" cy="76" rx="6" ry="14" fill="#000" transform="rotate(-15 86 76)" />
          <line x1="8" y1="88" x2="94" y2="88" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_trailer_heavy':
      return (
        <svg {...commonSvgProps}>
          {/* 4-wheel dual-axle heavy transport trailer */}
          <rect x="10" y="52" width="20" height="16" fill="#000" />
          <circle cx="15" cy="68" r="8" fill="#000" />
          <line x1="30" y1="62" x2="40" y2="62" stroke="#000" strokeWidth="3" />
          {/* Heavy Box Trailer */}
          <rect x="40" y="44" width="50" height="22" fill="#000" />
          <line x1="40" y1="50" x2="90" y2="50" stroke="#fff" strokeWidth="1.5" />
          <line x1="40" y1="58" x2="90" y2="58" stroke="#fff" strokeWidth="1.5" />
          {/* Dual Wheels */}
          <circle cx="52" cy="72" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="78" cy="72" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="83" x2="94" y2="83" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_water_tanker':
      return (
        <svg {...commonSvgProps}>
          {/* 5000L Cylindrical mobile water tanker on chassis */}
          <rect x="10" y="52" width="20" height="16" fill="#000" />
          <circle cx="15" cy="68" r="8" fill="#000" />
          <line x1="30" y1="62" x2="38" y2="62" stroke="#000" strokeWidth="3" />
          {/* Cylindrical Tanker */}
          <rect x="38" y="40" width="50" height="26" rx="8" fill="#000" />
          <line x1="38" y1="53" x2="88" y2="53" stroke="#fff" strokeWidth="1.5" />
          {/* Manhole dome on top */}
          <rect x="58" y="36" width="10" height="5" rx="2" fill="#000" />
          {/* Tanker Wheel */}
          <circle cx="63" cy="72" r="11" fill="#000" stroke="#fff" strokeWidth="2" />
          <circle cx="63" cy="72" r="4" fill="#fff" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_sprayer':
      return (
        <svg {...commonSvgProps}>
          {/* Tractor with horizontal boom sprayer arms with downward nozzles */}
          <rect x="14" y="46" width="26" height="18" fill="#000" />
          <circle cx="20" cy="68" r="12" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Liquid Tank */}
          <rect x="44" y="44" width="16" height="20" rx="3" fill="#000" />
          {/* Wide Horizontal Boom Arms */}
          <line x1="36" y1="52" x2="92" y2="52" stroke="#000" strokeWidth="3" />
          {/* Spray Droplet Nozzles */}
          <line x1="64" y1="52" x2="64" y2="62" stroke="#000" strokeWidth="2" />
          <path d="M64 62 L60 74 L68 74 Z" stroke="#000" strokeWidth="1" fill="none" strokeDasharray="2 2" />
          <line x1="78" y1="52" x2="78" y2="62" stroke="#000" strokeWidth="2" />
          <path d="M78 62 L74 74 L82 74 Z" stroke="#000" strokeWidth="1" fill="none" strokeDasharray="2 2" />
          <line x1="8" y1="84" x2="92" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_grass_cutter':
      return (
        <svg {...commonSvgProps}>
          {/* Fodder / Grass cutter implement with reciprocating teeth */}
          <rect x="14" y="46" width="28" height="18" fill="#000" />
          <circle cx="22" cy="68" r="12" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Side Cutter Bar extending horizontally */}
          <line x1="48" y1="66" x2="88" y2="66" stroke="#000" strokeWidth="4" />
          {/* Triangular Cutting Knife Teeth */}
          <path d="M52 66 L55 74 L58 66 L61 74 L64 66 L67 74 L70 66 L73 74 L76 66 L79 74 L82 66 L85 74" stroke="#000" strokeWidth="2" fill="#000" />
          <line x1="8" y1="82" x2="92" y2="82" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_grass_collector':
      return (
        <svg {...commonSvgProps}>
          {/* Finger wheel rake windrowing cut hay */}
          <rect x="14" y="46" width="26" height="18" fill="#000" />
          <circle cx="20" cy="68" r="12" fill="#000" />
          {/* 3 Rake Finger Wheels */}
          <circle cx="50" cy="66" r="10" stroke="#000" strokeWidth="2" fill="none" />
          <circle cx="66" cy="66" r="10" stroke="#000" strokeWidth="2" fill="none" />
          <circle cx="82" cy="66" r="10" stroke="#000" strokeWidth="2" fill="none" />
          {/* Rake Spokes */}
          <line x1="50" y1="56" x2="50" y2="76" stroke="#000" strokeWidth="1.5" />
          <line x1="66" y1="56" x2="66" y2="76" stroke="#000" strokeWidth="1.5" />
          <line x1="82" y1="56" x2="82" y2="76" stroke="#000" strokeWidth="1.5" />
          <line x1="8" y1="82" x2="92" y2="82" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_baler':
      return (
        <svg {...commonSvgProps}>
          {/* Straw baler with pickup reel discharging rectangular tied straw bale */}
          <rect x="12" y="50" width="22" height="16" fill="#000" />
          <circle cx="16" cy="68" r="8" fill="#000" />
          {/* Baler Body */}
          <rect x="38" y="46" width="36" height="22" rx="3" fill="#000" />
          <circle cx="52" cy="72" r="8" fill="#fff" stroke="#000" strokeWidth="2" />
          {/* Discharged tied straw bale */}
          <rect x="76" y="58" width="16" height="10" fill="#000" stroke="#fff" strokeWidth="1" />
          <line x1="84" y1="58" x2="84" y2="68" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="82" x2="94" y2="82" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'tractor_leveller':
      return (
        <svg {...commonSvgProps}>
          {/* Laser Land Leveller with vertical laser mast and grading blade */}
          <rect x="14" y="46" width="28" height="18" fill="#000" />
          <circle cx="22" cy="68" r="12" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Tall Laser Receiver Mast */}
          <line x1="72" y1="20" x2="72" y2="68" stroke="#000" strokeWidth="3" />
          <rect x="68" y="16" width="8" height="10" rx="2" fill="#000" />
          {/* Heavy Curved Bucket Scraper Blade */}
          <path d="M54 58 L86 58 L88 78 L52 78 Z" fill="#000" />
          {/* Perfectly leveled ground line */}
          <line x1="6" y1="82" x2="94" y2="82" stroke="#000" strokeWidth="2.5" />
        </svg>
      );

    // ==========================================
    // HARVESTER SUBCATEGORIES (12)
    // ==========================================
    case 'harvester_paddy':
      return (
        <svg {...commonSvgProps}>
          {/* Rubber crawler track paddy harvester */}
          <path d="M22 38 L62 38 L68 50 L76 50 L76 70 L22 70 Z" fill="#000" />
          <path d="M50 40 L62 40 L66 49 L50 49 Z" fill="#fff" />
          <circle cx="86" cy="62" r="11" stroke="#000" strokeWidth="2.5" fill="#fff" />
          <line x1="86" y1="51" x2="86" y2="73" stroke="#000" strokeWidth="2" />
          {/* Rubber Track Under Chassis */}
          <rect x="22" y="68" width="46" height="14" rx="7" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="28" cy="75" r="4" fill="#fff" />
          <circle cx="45" cy="75" r="4" fill="#fff" />
          <circle cx="62" cy="75" r="4" fill="#fff" />
          {/* Mud / puddle line */}
          <path d="M8 86 Q28 82 48 86 Q68 82 92 86" stroke="#000" strokeWidth="2" fill="none" />
        </svg>
      );

    case 'harvester_combine':
      return (
        <svg {...commonSvgProps}>
          {/* Multi-crop combine harvester with grain tank */}
          <path d="M18 34 L66 34 L72 48 L76 48 L76 70 L18 70 Z" fill="#000" />
          <rect x="52" y="36" width="12" height="10" fill="#fff" />
          <path d="M28 36 L10 22 L8 24 L24 40" stroke="#000" strokeWidth="2.5" fill="#000" />
          <circle cx="86" cy="62" r="12" stroke="#000" strokeWidth="2.5" fill="#fff" />
          <circle cx="34" cy="74" r="11" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="68" cy="74" r="11" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="8" y1="87" x2="92" y2="87" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_wheat':
      return (
        <svg {...commonSvgProps}>
          {/* Wheat combine with reel cutting standing golden wheat */}
          <path d="M18 36 L64 36 L70 48 L76 48 L76 70 L18 70 Z" fill="#000" />
          <circle cx="86" cy="62" r="12" stroke="#000" strokeWidth="2.5" fill="#fff" />
          <circle cx="36" cy="74" r="10" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Standing Wheat Stalks in front */}
          <path d="M82 86 L84 76 M86 86 L88 74 M90 86 L92 76 M94 86 L96 74" stroke="#000" strokeWidth="2" />
          <line x1="8" y1="87" x2="94" y2="87" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_maize':
      return (
        <svg {...commonSvgProps}>
          {/* Corn/Maize harvester with pointed snouts stripping cobs */}
          <path d="M16 38 L60 38 L66 50 L72 50 L72 72 L16 72 Z" fill="#000" />
          {/* Pointed Corn Snout Dividers */}
          <path d="M72 64 L92 74 L72 78 Z" fill="#000" />
          <path d="M72 54 L88 64 L72 68 Z" fill="#000" />
          <circle cx="34" cy="74" r="10" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="8" y1="86" x2="94" y2="86" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_sugarcane':
      return (
        <svg {...commonSvgProps}>
          {/* Sugarcane chopper harvester with high elevator conveyor */}
          <path d="M18 44 L56 44 L60 56 L68 56 L68 76 L18 76 Z" fill="#000" />
          {/* High Elevator Arm */}
          <line x1="30" y1="46" x2="10" y2="18" stroke="#000" strokeWidth="4" />
          <circle cx="28" cy="78" r="9" fill="#000" />
          <circle cx="56" cy="78" r="9" fill="#000" />
          <line x1="8" y1="88" x2="92" y2="88" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_cotton':
      return (
        <svg {...commonSvgProps}>
          {/* Mechanical cotton picker machine */}
          <path d="M18 36 L64 36 L70 50 L70 72 L18 72 Z" fill="#000" />
          {/* High Cotton Storage Basket on Top */}
          <path d="M22 36 L26 18 L58 18 L60 36 Z" fill="#000" stroke="#fff" strokeWidth="1" />
          <circle cx="32" cy="76" r="10" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="60" cy="76" r="10" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="8" y1="88" x2="92" y2="88" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_groundnut':
      return (
        <svg {...commonSvgProps}>
          {/* Peanut digger inverter lifting and shaking vines */}
          <rect x="20" y="46" width="30" height="18" fill="#000" />
          <circle cx="28" cy="68" r="11" fill="#000" />
          <path d="M50 56 L84 56 L88 74 L54 74 Z" fill="#000" />
          {/* Shaker tines */}
          <line x1="58" y1="74" x2="62" y2="82" stroke="#000" strokeWidth="2" />
          <line x1="68" y1="74" x2="72" y2="82" stroke="#000" strokeWidth="2" />
          <line x1="78" y1="74" x2="82" y2="82" stroke="#000" strokeWidth="2" />
          <line x1="8" y1="84" x2="92" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_potato':
      return (
        <svg {...commonSvgProps}>
          {/* Potato digger chain conveyor separating soil */}
          <rect x="20" y="46" width="28" height="18" fill="#000" />
          <circle cx="26" cy="68" r="10" fill="#000" />
          {/* Sloping web conveyor */}
          <line x1="48" y1="74" x2="88" y2="52" stroke="#000" strokeWidth="3" />
          <ellipse cx="80" cy="72" rx="3" ry="2" fill="#000" />
          <ellipse cx="86" cy="74" rx="3" ry="2" fill="#000" />
          <line x1="8" y1="84" x2="92" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_vegetable':
      return (
        <svg {...commonSvgProps}>
          {/* Mechanised vegetable root lifter */}
          <rect x="20" y="46" width="30" height="18" fill="#000" />
          <circle cx="28" cy="68" r="11" fill="#000" />
          <path d="M50 52 L84 64 L78 78 L48 66 Z" fill="#000" />
          <line x1="8" y1="84" x2="92" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_forage':
      return (
        <svg {...commonSvgProps}>
          {/* Silage chopper with discharge chute blowing fodder */}
          <path d="M24 46 L62 46 L66 58 L72 58 L72 74 L24 74 Z" fill="#000" />
          {/* High Discharge Spout */}
          <path d="M38 46 L38 22 C38 16 54 16 58 24 L52 26" stroke="#000" strokeWidth="3" fill="none" />
          <circle cx="36" cy="76" r="9" fill="#000" />
          <line x1="8" y1="86" x2="92" y2="86" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_reaper_binder':
      return (
        <svg {...commonSvgProps}>
          {/* Reaper binder machine tying cereal sheaves with twine */}
          <rect x="20" y="48" width="32" height="18" fill="#000" />
          <circle cx="28" cy="70" r="10" fill="#000" />
          {/* Cutter bar & tying table */}
          <path d="M52 54 L84 54 L86 70 L52 70 Z" fill="#000" />
          <circle cx="70" cy="54" r="5" stroke="#fff" strokeWidth="1.5" fill="#000" />
          <line x1="8" y1="82" x2="92" y2="82" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'harvester_thresher':
      return (
        <svg {...commonSvgProps}>
          {/* Stationary spike-tooth thresher with hopper and twin blowers */}
          <rect x="26" y="34" width="48" height="34" rx="3" fill="#000" />
          {/* Feed Hopper */}
          <path d="M60 22 L82 22 L74 34 L60 34 Z" fill="#000" />
          {/* Large PTO Belt Flywheel */}
          <circle cx="36" cy="52" r="14" fill="#fff" stroke="#000" strokeWidth="2.5" />
          <circle cx="36" cy="52" r="4" fill="#000" />
          {/* Grain discharge chute */}
          <path d="M48 68 L44 80 L54 80 L56 68 Z" fill="#000" />
          <line x1="10" y1="84" x2="90" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    // ==========================================
    // MINI-TRUCK SUBCATEGORIES (8)
    // ==========================================
    case 'truck_vegetable':
      return (
        <svg {...commonSvgProps}>
          {/* Mini-truck carrying stacked vegetable crates */}
          <path d="M58 44 L74 44 C78 44 84 50 86 56 L88 70 L58 70 Z" fill="#000" />
          <path d="M68 46 L74 46 C76 46 80 50 82 54 L68 54 Z" fill="#fff" />
          {/* Open Bed with Crates */}
          <rect x="14" y="52" width="44" height="18" fill="#000" />
          <rect x="18" y="38" width="10" height="14" fill="#000" stroke="#fff" strokeWidth="1" />
          <rect x="30" y="38" width="10" height="14" fill="#000" stroke="#fff" strokeWidth="1" />
          <rect x="42" y="38" width="10" height="14" fill="#000" stroke="#fff" strokeWidth="1" />
          <circle cx="28" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="74" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'truck_fruit':
      return (
        <svg {...commonSvgProps}>
          {/* Truck with fruit crates and airflow vents */}
          <path d="M58 44 L74 44 C78 44 84 50 86 56 L88 70 L58 70 Z" fill="#000" />
          <rect x="14" y="44" width="44" height="26" fill="#000" />
          <circle cx="26" cy="54" r="4" fill="#fff" />
          <circle cx="38" cy="54" r="4" fill="#fff" />
          <circle cx="50" cy="54" r="4" fill="#fff" />
          <circle cx="28" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="74" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'truck_paddy_bags':
      return (
        <svg {...commonSvgProps}>
          {/* Truck stacked high with jute grain bags tied with rope */}
          <path d="M58 44 L74 44 C78 44 84 50 86 56 L88 70 L58 70 Z" fill="#000" />
          <rect x="14" y="52" width="44" height="18" fill="#000" />
          {/* Stacked Bags */}
          <ellipse cx="26" cy="46" rx="9" ry="5" fill="#000" stroke="#fff" strokeWidth="1" />
          <ellipse cx="44" cy="46" rx="9" ry="5" fill="#000" stroke="#fff" strokeWidth="1" />
          <ellipse cx="35" cy="37" rx="9" ry="5" fill="#000" stroke="#fff" strokeWidth="1" />
          {/* Securing Rope */}
          <line x1="16" y1="52" x2="48" y2="34" stroke="#fff" strokeWidth="1.5" />
          <circle cx="28" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="74" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'truck_fertilizer':
      return (
        <svg {...commonSvgProps}>
          {/* Truck carrying seed and fertilizer sacks */}
          <path d="M58 44 L74 44 C78 44 84 50 86 56 L88 70 L58 70 Z" fill="#000" />
          <rect x="14" y="50" width="44" height="20" fill="#000" />
          <rect x="20" y="40" width="12" height="10" rx="2" fill="#000" stroke="#fff" strokeWidth="1" />
          <rect x="36" y="40" width="12" height="10" rx="2" fill="#000" stroke="#fff" strokeWidth="1" />
          <circle cx="28" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="74" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'truck_machinery':
      return (
        <svg {...commonSvgProps}>
          {/* Truck with drop-gate carrying machinery, pump set, pipes */}
          <path d="M58 44 L74 44 C78 44 84 50 86 56 L88 70 L58 70 Z" fill="#000" />
          <rect x="14" y="52" width="44" height="18" fill="#000" />
          {/* Power Tiller / Pump set on bed */}
          <rect x="22" y="40" width="16" height="12" rx="2" fill="#000" stroke="#fff" strokeWidth="1" />
          <circle cx="34" cy="46" r="4" fill="#fff" />
          <circle cx="28" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="74" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'truck_open_body':
      return (
        <svg {...commonSvgProps}>
          {/* Clean open bed flat drop-side truck */}
          <path d="M58 44 L74 44 C78 44 84 50 86 56 L88 70 L58 70 Z" fill="#000" />
          <rect x="14" y="54" width="44" height="16" fill="#000" />
          <line x1="14" y1="62" x2="58" y2="62" stroke="#fff" strokeWidth="1.5" />
          <circle cx="28" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="74" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'truck_covered_body':
      return (
        <svg {...commonSvgProps}>
          {/* Weatherproof covered tarpaulin canopy container truck */}
          <path d="M58 44 L74 44 C78 44 84 50 86 56 L88 70 L58 70 Z" fill="#000" />
          {/* Covered Canopy Body */}
          <path d="M14 36 L58 36 L58 70 L14 70 Z" fill="#000" />
          {/* Tarpaulin ribs / seams */}
          <line x1="28" y1="36" x2="28" y2="70" stroke="#fff" strokeWidth="1.5" />
          <line x1="44" y1="36" x2="44" y2="70" stroke="#fff" strokeWidth="1.5" />
          <circle cx="28" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="74" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'truck_mandi_express':
      return (
        <svg {...commonSvgProps}>
          {/* Express truck in motion with speed lines heading towards market */}
          <path d="M58 44 L74 44 C78 44 84 50 86 56 L88 70 L58 70 Z" fill="#000" />
          <rect x="18" y="48" width="40" height="22" fill="#000" />
          <circle cx="30" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          <circle cx="74" cy="74" r="9" fill="#000" stroke="#fff" strokeWidth="1.5" />
          {/* Speed / motion lines */}
          <line x1="6" y1="52" x2="14" y2="52" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="58" x2="14" y2="58" stroke="#000" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="8" y1="64" x2="14" y2="64" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="84" x2="94" y2="84" stroke="#000" strokeWidth="2" />
        </svg>
      );

    default:
      return (
        <svg {...commonSvgProps}>
          <rect x="20" y="20" width="60" height="60" rx="6" fill="#000" />
          <circle cx="50" cy="50" r="16" fill="#fff" />
          <circle cx="50" cy="50" r="8" fill="#000" />
        </svg>
      );
  }
};
