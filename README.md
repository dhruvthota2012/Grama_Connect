# GramaConnect — Smart Agricultural Service Kiosk
> **Rural Agricultural Worker & Machinery Service Kiosk for Indian Villages**
> Built as an accessibility-first public service kiosk software simulator.

---

## 🌾 1. Project Objective

In rural Indian villages, smallholder farmers often struggle with severe agricultural labour shortages during critical seasonal windows (sowing, transplanting, weeding, and harvesting). Concurrently, access to tractors with specialized attachments, crop harvesters, and produce transport is fragmented, leading to crop losses and exploitation by middlemen.

**GramaConnect** is a touchscreen digital kiosk software simulator designed for installation at Village Gram Panchayat Seva Kendras (demonstration node: **Rampur Gram Panchayat**). It provides:
1. **Farmers**: Instant discovery of local agricultural workers, tractors with implements, crop-specific harvesters, and mini-trucks stationed right at their Gram Panchayat without filling lengthy forms.
2. **Rural Agricultural Workers**: Fast, optional registration where workers can list their farming skills and optionally provide a display name and contact number with explicit consent.
3. **Machinery & Transport Owners**: Direct self-service kiosk registration for **Tractors**, **Harvesters**, and **Mini-Trucks** with an instant review confirmation slip and dynamic addition to the kiosk search catalog.
4. **Trilingual Voice Accessibility**: Comprehensive support for **English**, **తెలుగు (Telugu)**, and **हिन्दी (Hindi)** with natural female voice guidance, two-tap navigation, speaker replay button, telephone-style number shortcuts, and an **80mm ATM-style thermal contact slip printer**.

---

## 🖥️ 2. Visual Design & Accessibility Rules

- **Strict Monochrome Palette**: Exclusively pure black (`#000000`), clean white (`#ffffff`), and neutral functional greys (`#f4f4f5`, `#e4e4e7`, `#71717a`). No distracting colors, gradients, or non-functional styling.
- **54 Authentic Indian Rural Agricultural Illustrations (No Stick Figures)**: Every single category and subcategory features a detailed, high-contrast black-and-white illustration or contoured silhouette depicting realistic Indian rural farming scenes (farmers in *pagdi, gamcha, dhoti, saree*, paddy transplanting, knapsack sprayers with safety cloths, sickle harvesting, Mahindra & Swaraj tractors with implements, rubber track paddy combines, and Tata Ace mini-trucks). Each illustration includes a clear caption in the selected language.
- **Two-Tap Selection with Voice**:
  - **First Tap**: Highlights the option with high contrast, plays a subtle selection pulse, and speaks the option name and a short explanation in the active language (`en-IN`, `te-IN`, or `hi-IN`).
  - **Second Tap**: Tapping the same highlighted card opens the option or proceeds to the next screen.
  - Tapping a different option moves the highlight and speaks the newly selected option.
- **Audio Replay Button**: A dedicated speaker button on highlighted cards and in the top header allows users to replay announcements at any time.
- **Typography & Diacritics**: Generous line-height (1.45–1.5) ensures all Telugu and Devanagari (Hindi) vowel signs (*matras*) and conjuncts render crisply without vertical clipping.
- **Dual Navigation**: Large touch targets (minimum 56px–70px) plus telephone-style number key shortcuts (`1` to `9`) that do not interfere with text inputs.
- **Idle Inactivity Countdown**: 60-second kiosk timer with an urgent warning modal at 15 seconds remaining. If unattended, it resets the session to protect user privacy.

---

## 🗣️ 3. Trilingual Voice Guidance & Browser Voice Support

GramaConnect uses the standard browser **Web Speech Synthesis API** with automatic language matching:
- **English**: BCP-47 language tag `en-IN` (e.g., Google English India, Microsoft Heera/Neerja).
- **Telugu (తెలుగు)**: BCP-47 language tag `te-IN` (e.g., Google Telugu India, Microsoft Chitra/Shruti).
- **Hindi (हिन्दी)**: BCP-47 language tag `hi-IN` (e.g., Google Hindi India, Microsoft Swara/Kalpana/Geeta).

### Voice Engine Characteristics:
- **Female Voice Prioritization**: The speech engine inspects all voices provided by the client operating system/browser, checking for female markers (`female`, `swara`, `kalpana`, `geeta`, `chitra`, `shruti`, `heera`, `neerja`, `zira`).
- **Graceful Fallback**: If a female voice is unavailable for the selected language, the best matching language voice is used. If no language-specific voice is installed on the user's OS, speech fails gracefully without breaking any visual functionality.
- **Anti-Overlap Protection**: Any in-progress speech is cancelled before a new announcement begins, preventing confusing overlapping audio.
- **Replay Feature**: Users can replay any voice announcement with one click.
- **Browser Limitations Note**: Speech synthesis voice availability depends on the operating system (Windows, macOS, Android, Linux), browser engine (Chromium, Firefox, Safari), and installed system language packs. In environments where Indian voices are not pre-installed by the OS, the browser may fall back to default synthesizer voices.

---

## 🚜 4. Core Architecture & Workflow

### Interface 1 — Language & Path Selection
- **3-Language Selector**: Choose between English (1), Telugu (2), or Hindi (3).
- **Path Selection**:
  1. `నాకు పని లేదా యంత్రాలను నమోదు చేయాలి / I AM A PROVIDER / REGISTER SERVICES` → Directs to Provider Hub.
  2. `నాకు వ్యవసాయ సేవలు కావాలి / I NEED AGRICULTURAL SERVICES` → Directs to Agricultural Services (Interface 2).

### Interface 2 — Agricultural Services (Direct Panchayat Discovery)
The kiosk represents a specific Gram Panchayat service location (**Rampur Gram Panchayat**). Farmers do not need to fill out tedious forms with village, dates, or wages. They simply tap the service, pick the subcategory, and instantly view available providers registered at this kiosk.

1. **PERSON / వ్యవసాయ కూలీలు / कृषि श्रमिक (16 Subcategories)**:
   - Sowing seeds, Rice transplanting, Harvesting crops, Weeding, Fertilizer application, Pesticide spraying, Irrigation & watering, Ploughing assistance, Fruit picking, Vegetable picking, Cotton picking, Paddy harvesting, Groundnut harvesting, Sugarcane cutting, Produce loading/unloading, General agricultural labour.
2. **TRACTOR / ట్రాక్టర్ & పరికరాలు / ट्रैक्टर व उपकरण (14 Subcategories)**:
   - Tractor with trolley, plough, seed drill / seeder, cultivator, rotavator, harrow, disc plough, trailer, water tanker, boom sprayer, grass cutter, grass collector, baler, land leveller.
   - *Clear distinction between rental of implement bank attachments vs. tractor service with skilled driver.*
3. **HARVESTER / హార్వెస్టర్ / कंबाइन हार्वेस्टर (12 Subcategories)**:
   - Paddy / rice harvester, Combine harvester, Wheat harvester, Maize / corn harvester, Sugarcane harvester, Cotton picker, Groundnut digger, Potato digger, Vegetable harvester, Forage harvester, Reaper binder, Stationary thresher.
4. **MINI TRUCK / మినీ ట్రక్ రవాణా / मिनी ट्रक परिवहन (8 Subcategories)**:
   - Vegetable transport, Fruit transport, Paddy bags, Fertilizer & seed bags, Farm machinery transport, Open bed truck, Covered waterproof container, Farm-to-Market Mandi express.

### Interface 3 — Provider Hub & Registration
- **No "Open Farm Jobs" Section**: As per requirements, the obsolete open farm jobs board has been completely removed to keep the interface simple, focused, and uncluttered.
- **Simplified Worker Registration**:
  - Optional display name and contact number with explicit consent checkbox.
  - Skill multi-picker covering all 16 farm operations with authentic illustrations.
  - Generates unique reference token (`GC-WRK-2026-XXXX`).
- **Machinery & Vehicle Registration**:
  - Dedicated registration interfaces for **Tractors**, **Harvesters**, and **Mini-Trucks**.
  - Collects machine model, attachments/crops, operator inclusion, optional contact name and phone with consent.
  - Provides a comprehensive **Registration Confirmation Review Screen** (`GC-MCH-2026-XXXX`).
  - Dynamically adds the registered machine to the live session catalog so other farmers at the kiosk immediately find it.

### Transparent Panchayat Matching Engine
- Multi-factor proximity and capability engine:
  - Skill / Attachment / Cargo capability match (Mandatory).
  - Proximity to Rampur Gram Panchayat (0 km = +55 pts, ≤5 km = +40 pts).
  - Availability scoring (Immediate = +20 to +30 pts; Unknown availability is explicitly labeled without claiming false immediate availability).
  - Operator inclusion bonus (+20 pts).
- Detailed match reasons in English, Telugu, and Hindi:
  - e.g., `"चुने गए कृषि कार्य में अनुभवी व कुशल"` / `"ఈరోజే అందుబాటులో ఉన్నారు"`
- Exact empty state when no providers exist:
  - `"No matching service providers are registered at this kiosk yet."` / `"ఈ కియోస్క్ వద్ద సరిపోలే సేవా ప్రదాతలు ఇంకా నమోదు కాలేదు."` / `"इस कियोस्क पर अभी तक कोई उपयुक्त सेवा प्रदाता पंजीकृत नहीं है।"`

### 🖨️ Printable Kiosk Receipts & Strict Minimal ATM Worker Slip
- **Worker Search Receipts (Strict Minimal ATM Slip)**:
  - When printing worker search results, the receipt prints in compact 80mm ATM format containing **strictly worker name and contact number**.
  - All unnecessary fields (wages, skills, village, titles, and headers) are omitted.
- **Machinery Receipts**:
  - Retains machine model, operator status, demo ID, rate, and contact information for equipment hiring.
- Formatted for standard 80mm thermal receipt roll with `@media print` CSS optimization.

---

## 🛠️ 5. How to Install and Run Locally

### Prerequisites
- Node.js (v18 or higher recommended; tested on v24 LTS)
- npm (v10 or higher)

### Setup Steps
```bash
# 1. Navigate to the project directory
cd gramaconnect

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# Visit http://localhost:5173
```

### Running Automated Verification Tests
```bash
npm test
```
*Executes all 61 automated test assertions covering trilingual translation parity (199 keys across EN, TE, HI), subcategory uniqueness, proximity math, matching algorithms with Hindi explanations, machinery registration, removal of Open Farm Jobs, BCP-47 voice codes, authentic editorial illustrations, and ATM worker slip formatting.*

### Building for Production
```bash
npm run build
```
*Generates production-optimized bundle in `dist/` with full TypeScript type safety.*

---

## 👥 6. Demo-Data Limitations & Ethics

- **Sample Records**: All worker names, tractor owners, and driver profiles are purely fictional demonstration records created for kiosk software simulation.
- **Fictional Phone Numbers**: All contact numbers use standard fictional formats (`98480-XXXXX (Demo)`) to prevent accidental calling of real individuals.
- **Village Proximity**: Distances are computed using an explicit demo distance matrix for 8 representative Telangana villages (Rampur, Chandanpur, Shivapuram, Krishnapuram, Vemulawada, Gollapalli, Mallapur, Siricilla).
- **Privacy by Design**: No Aadhaar numbers, biometric identifiers, or banking passwords are collected. Inactivity timeout ensures personal data clears automatically after 60 seconds.

---

## 🏆 7. Demonstration Walkthrough

Follow this step-by-step demonstration:

1. **Trilingual Voice & Two-Tap Selection**
   - On the landing screen, select **हिन्दी (Hindi)** by tapping Option 3.
   - The interface translates immediately and announces: *"भाषा चुनी गई: हिन्दी। ग्रामकनेक्ट में आपका स्वागत है।"*
   - Tap once on `2. मुझे कृषि सेवाएं चाहिए / I NEED AGRICULTURAL SERVICES`.
   - The card highlights, pulses, and announces the option aloud in Hindi.
   - Tap the card again to proceed into the service menu.
   - Tap the speaker replay button (`🔊`) in the header or on the card to hear it again.
2. **Direct Panchayat Service Discovery**
   - Select `1. कृषि श्रमिक / PERSON` using two-tap navigation.
   - Pick `2. धान की रोपाई (వరి నాట్లు వేయడం / Transplanting Rice Seedlings)`.
   - The kiosk displays registered workers at Rampur Gram Panchayat immediately, with match reasons in Hindi and availability status.
3. **ATM Minimal Worker Contact Slip**
   - Click `PRINT WORKER CONTACTS SLIP`.
   - Notice the slip format: It contains **ONLY the worker names and mobile numbers**, perfectly sized for an 80mm kiosk receipt printer.
4. **Provider Hub & Machinery Registration**
   - Return Home and select `1. मुझे काम या मशीन दर्ज करनी है / I AM A PROVIDER`.
   - Notice the Open Farm Jobs section is completely gone; the screen cleanly presents options to register as Worker, Tractor, Harvester, or Mini-Truck.
   - Select `REGISTER A TRACTOR`.
   - Enter machine details (e.g., Swaraj 855 FE), select attachments, check consent, and submit.
   - Review the generated confirmation slip (`GC-MCH-2026-XXXX`).
   - Return to services → Tractor: **The newly registered machine is now dynamically searchable!**
5. **Inactivity Security Countdown**
   - Notice the 60-second idle timer in the header.
   - At 15 seconds, an urgent warning modal appears, offering extra time or resetting to protect user data.

---

## 📂 Project Directory Structure

```
gramaconnect/
├── index.html                     # Kiosk root HTML with trilingual meta tags & favicon
├── package.json                   # Dependencies, build, and test scripts
├── tsconfig.json / tsconfig.app.json
├── test-verification.ts           # 61 automated test assertions (19 test groups)
├── src/
│   ├── main.tsx                   # React root entry
│   ├── App.tsx                    # Kiosk state machine, router, and live registry
│   ├── App.css                    # Strict monochrome CSS & 80mm thermal receipt styles
│   ├── index.css                  # Clean reset styling
│   ├── types/
│   │   └── index.ts               # Complete TypeScript interfaces (Language = 'en' | 'te' | 'hi')
│   ├── i18n/
│   │   └── translations.ts        # Comprehensive English, Telugu & Hindi dictionaries (199 keys each)
│   ├── data/
│   │   ├── villages.ts            # 8 demo villages & distance matrix with trilingual names
│   │   ├── categories.ts          # 4 main services & 50 subcategories with trilingual descriptions
│   │   ├── demoWorkers.ts         # Sample worker profiles with fictional contacts
│   │   └── demoMachinery.ts       # Tractors, attachments, harvesters, and mini-trucks
│   ├── assets/
│   │   └── illustrations.tsx      # 54 bespoke monochrome Indian rural agricultural SVGs (no stick figures)
│   ├── utils/
│   │   ├── matchingEngine.ts      # Multi-factor proximity and trilingual scoring algorithm
│   │   ├── receiptGenerator.ts    # Unique token generation (REQ/WRK/MCH) & formatting
│   │   └── speechGuidance.ts      # Female SpeechSynthesis engine for English, Telugu & Hindi
│   ├── hooks/
│   │   ├── useKioskTimer.ts       # 60s idle countdown with auto-reset & pause
│   │   └── useKeyboardNav.ts      # Number key navigation without input interference
│   └── components/
│       ├── Header.tsx             # Brand banner, 3-language switcher, voice toggle, replay button, timer
│       ├── IdleWarningModal.tsx   # Urgent countdown dialog (15s alert)
│       ├── LanguageSelection.tsx  # Interface 1 language selector (English, Telugu, Hindi)
│       ├── HomeMenu.tsx           # Interface 1 path selector (Work vs Services) with two-tap voice
│       ├── ServiceSelection.tsx   # Interface 2 (Person, Tractor, Harvester, Truck) with two-tap voice
│       ├── SubcategoryGrid.tsx    # 50 subcategory cards with distinct Indian SVGs & captions
│       ├── ProviderHub.tsx        # Registration portal for worker & machinery services
│       ├── WorkerRegistration.tsx # Minimal worker registration with optional details
│       ├── MachineryRegistration.tsx # Tractor, harvester, and mini-truck registration
│       ├── RegistrationConfirmation.tsx # Review screen for submitted listings
│       ├── MatchResults.tsx       # Ranked match cards with Rampur Panchayat location
│       └── PrintableReceipt.tsx   # 80mm thermal receipt (strict ATM slip for workers)
└── README.md
```

---

*GramaConnect — Built for Indian farmers and agricultural workers. 🌾*
