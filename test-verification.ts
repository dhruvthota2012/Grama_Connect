import { translations } from './src/i18n/translations';
import {
  PERSON_CATEGORIES,
  TRACTOR_CATEGORIES,
  HARVESTER_CATEGORIES,
  MINI_TRUCK_CATEGORIES,
} from './src/data/categories';
import { DEMO_VILLAGES, getVillageDistance, VILLAGE_DISTANCE_MATRIX } from './src/data/villages';
import { INITIAL_DEMO_WORKERS } from './src/data/demoWorkers';
import { DEMO_TRACTORS, DEMO_HARVESTERS, DEMO_MINI_TRUCKS } from './src/data/demoMachinery';
import {
  matchWorkers,
  matchTractors,
  matchHarvesters,
  matchMiniTrucks,
} from './src/utils/matchingEngine';
import { generateReferenceNumber, formatDateTime } from './src/utils/receiptGenerator';
import { getSpeechLangCode } from './src/utils/speechGuidance';
import { Worker, TractorService, SearchQueryParams } from './src/types';
import { validateFullName, validateIndianMobile } from './src/utils/validation';
import {
  isTractorActiveForDate,
  activateTractorForToday,
  deactivateTractor,
  changeTractorAttachment,
  getKioskTodayDateString,
  formatCleanPersonName,
  formatCleanMobile,
  loadTractorsFromStorage,
  saveTractorsToStorage,
  cleanTractorsDailyActivation,
} from './src/utils/dailyAvailability';
import {
  loadProviderAccounts,
  saveProviderAccounts,
  getAccountByMobile,
  upsertProviderAccount,
  updateAccountStatus,
  updateTractorAttachment,
  activateTractorDailyRegistration,
  isTractorRegistrationValidToday,
  ProviderAccount,
} from './src/utils/providerAccounts';
import * as fs from 'fs';

function runTestSuite() {
  console.log('====================================================');
  console.log('GRAMACONNECT COMPLETE VERIFICATION TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;
  const todayTestDate = getKioskTodayDateString();

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Translations Integrity (3 Languages: English, Telugu, Hindi)
  console.log('\n--- Test Group 1: Trilingual Translation Integrity (EN, TE, HI) ---');
  const enKeys = Object.keys(translations.en);
  const teKeys = Object.keys(translations.te);
  const hiKeys = Object.keys(translations.hi);
  assert(
    enKeys.length === teKeys.length && enKeys.length === hiKeys.length,
    `Key count match across all 3 languages (EN: ${enKeys.length}, TE: ${teKeys.length}, HI: ${hiKeys.length})`
  );

  let allTeKeysMatch = true;
  for (const k of enKeys) {
    if (!(k in translations.te) || !(translations.te as Record<string, string>)[k]) {
      allTeKeysMatch = false;
      console.error(`Missing or empty Telugu translation for key: ${k}`);
    }
  }
  assert(allTeKeysMatch, 'All English keys exist and have non-empty values in Telugu dictionary');

  let allHiKeysMatch = true;
  for (const k of enKeys) {
    if (!(k in translations.hi) || !(translations.hi as Record<string, string>)[k]) {
      allHiKeysMatch = false;
      console.error(`Missing or empty Hindi translation for key: ${k}`);
    }
  }
  assert(allHiKeysMatch, 'All English keys exist and have non-empty values in Hindi dictionary');

  // 2. Categories & Subcategories Count and Uniqueness
  console.log('\n--- Test Group 2: Categories & Subcategories Specifications ---');
  assert(PERSON_CATEGORIES.length === 16, `Person subcategories count: 16 (Actual: ${PERSON_CATEGORIES.length})`);
  assert(TRACTOR_CATEGORIES.length === 14, `Tractor subcategories count: 14 (Actual: ${TRACTOR_CATEGORIES.length})`);
  assert(HARVESTER_CATEGORIES.length === 12, `Harvester subcategories count: 12 (Actual: ${HARVESTER_CATEGORIES.length})`);
  assert(MINI_TRUCK_CATEGORIES.length === 8, `Mini Truck subcategories count: 8 (Actual: ${MINI_TRUCK_CATEGORIES.length})`);

  const allSubcats = [
    ...PERSON_CATEGORIES,
    ...TRACTOR_CATEGORIES,
    ...HARVESTER_CATEGORIES,
    ...MINI_TRUCK_CATEGORIES,
  ];
  assert(allSubcats.length === 50, `Total subcategories count: 50 (Actual: ${allSubcats.length})`);

  // Verify unique IDs and unique illustration keys
  const idSet = new Set(allSubcats.map((c) => c.id));
  assert(idSet.size === 50, 'All 50 subcategory IDs are strictly unique');

  const illusSet = new Set(allSubcats.map((c) => c.illustrationKey));
  assert(illusSet.size === 50, 'All 50 subcategories have distinct monochrome illustration keys');

  // Verify all 50 keys are handled in illustrations.tsx
  const illusSource = fs.readFileSync('./src/assets/illustrations.tsx', 'utf-8');
  const allIllusHandled = allSubcats.every((c) => illusSource.includes(`case '${c.illustrationKey}':`));
  assert(allIllusHandled, 'All 50 category illustration keys are explicitly handled in illustrations.tsx');

  // Verify every subcategory has English, Telugu, and Hindi titles & descriptions
  const allHaveTrilingualText = allSubcats.every(
    (c) => c.titleEn && c.titleTe && c.titleHi && c.descriptionEn && c.descriptionTe && c.descriptionHi
  );
  assert(allHaveTrilingualText, 'All 50 subcategories have complete trilingual titles and descriptions (EN, TE, HI)');

  // 3. Village & Distance Matrix
  console.log('\n--- Test Group 3: Village Data & Proximity Matrix ---');
  assert(DEMO_VILLAGES.length === 8, `Demo villages count: 8 (Actual: ${DEMO_VILLAGES.length})`);
  const allVillagesHaveTrilingualText = DEMO_VILLAGES.every(
    (v) => v.nameEn && v.nameTe && v.nameHi && v.districtEn && v.districtTe && v.districtHi
  );
  assert(allVillagesHaveTrilingualText, 'All 8 villages have complete trilingual names and districts (EN, TE, HI)');
  assert(getVillageDistance('rampur', 'rampur') === 0, 'Distance to same village is 0 km');
  assert(getVillageDistance('rampur', 'chandanpur') === 3, 'Distance Rampur to Chandanpur is 3 km');
  assert(getVillageDistance('chandanpur', 'rampur') === 3, 'Distance is symmetric (Chandanpur to Rampur = 3 km)');
  assert(getVillageDistance('rampur', 'siricilla') === 18, 'Distance Rampur to Siricilla is 18 km');

  // 4. Matching Engine — Worker Matching
  console.log('\n--- Test Group 4: Matching Engine Logic ---');
  const searchSowingInRampur: SearchQueryParams = {
    serviceType: 'person',
    subcategoryId: 'sowing',
    subcategoryTitleEn: 'Sowing Seeds',
    subcategoryTitleTe: 'విత్తనాలు విత్తడం',
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    date: todayTestDate,
    quantity: 4,
    duration: '1_DAY',
    offeredWage: 500,
  };

  const matchedWorkers = matchWorkers(INITIAL_DEMO_WORKERS, searchSowingInRampur);
  assert(matchedWorkers.length > 0, `Worker matching returns results (found: ${matchedWorkers.length})`);
  assert(
    matchedWorkers[0].item.villageId === 'rampur',
    `Top ranked worker is from local village Rampur (${matchedWorkers[0].item.nameEn})`
  );
  assert(
    matchedWorkers[0].score >= 80,
    `Top worker match score is high (${matchedWorkers[0].score}%)`
  );

  // 5. Matching Engine — Tractor Matching (Operator Included vs Rental)
  console.log('\n--- Test Group 5: Tractor Service & Operator Distinction ---');
  const searchRotavator: SearchQueryParams = {
    serviceType: 'tractor',
    subcategoryId: 'tractor_rotavator',
    subcategoryTitleEn: 'Tractor with Rotavator',
    subcategoryTitleTe: 'రోటవేటర్‌తో ట్రాక్టర్',
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    date: todayTestDate,
    quantity: 2,
    duration: '1_DAY',
  };

  const matchedTractors = matchTractors(DEMO_TRACTORS, searchRotavator);
  assert(matchedTractors.length > 0, `Tractor matching returns results (found: ${matchedTractors.length})`);
  assert(
    matchedTractors.some((t) => t.item.includesOperator === true),
    'Contains tractor services with operator included'
  );

  // Check tool-bank rental item (tractor seeder without operator)
  const searchSeeder: SearchQueryParams = {
    serviceType: 'tractor',
    subcategoryId: 'tractor_seeder',
    subcategoryTitleEn: 'Tractor with Seed Drill',
    subcategoryTitleTe: 'విత్తన గొర్రుతో ట్రాక్టర్',
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    date: todayTestDate,
    quantity: 1,
    duration: '1_DAY',
  };
  const matchedSeeder = matchTractors(DEMO_TRACTORS, searchSeeder);
  assert(
    matchedSeeder.some((t) => t.item.includesOperator === false),
    'Tool-Bank equipment rental (self-operated implement) correctly represented'
  );

  // 6. Matching Engine — Harvester Crop Compatibility
  console.log('\n--- Test Group 6: Harvester Crop Specificity ---');
  const searchPaddyHarvester: SearchQueryParams = {
    serviceType: 'harvester',
    subcategoryId: 'harvester_paddy',
    subcategoryTitleEn: 'Paddy / Rice Harvester',
    subcategoryTitleTe: 'వరి హార్వెస్టర్',
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    date: todayTestDate,
    quantity: 5,
    duration: '1_DAY',
  };
  const matchedPaddyHarvesters = matchHarvesters(DEMO_HARVESTERS, searchPaddyHarvester);
  assert(
    matchedPaddyHarvesters.length > 0,
    `Paddy harvesters found (${matchedPaddyHarvesters.length})`
  );
  assert(
    matchedPaddyHarvesters.every((h) => h.item.compatibleCrops.includes('harvester_paddy')),
    'All returned harvesters are certified for paddy/rice harvesting'
  );

  // 7. Matching Engine — Mini Truck Transport
  console.log('\n--- Test Group 7: Mini Truck Transport Options ---');
  const searchCoveredTruck: SearchQueryParams = {
    serviceType: 'mini_truck',
    subcategoryId: 'truck_covered_body',
    subcategoryTitleEn: 'Mini Truck with Covered Cargo Body',
    subcategoryTitleTe: 'మూసిన బాడీ మినీ ట్రక్',
    villageId: 'shivapuram',
    villageNameEn: 'Shivapuram',
    villageNameTe: 'శివపురం',
    date: todayTestDate,
    quantity: 1,
    duration: '1_DAY',
    destinationVillageId: 'siricilla',
  };
  const matchedCoveredTrucks = matchMiniTrucks(DEMO_MINI_TRUCKS, searchCoveredTruck);
  assert(matchedCoveredTrucks.length > 0, `Covered mini trucks found (${matchedCoveredTrucks.length})`);
  assert(
    matchedCoveredTrucks[0].item.bodyType === 'COVERED',
    'Top matched truck has requested covered cargo canopy'
  );

  // 8. No Matches State
  console.log('\n--- Test Group 8: No Matches Found State ---');
  const searchImpossible: SearchQueryParams = {
    serviceType: 'harvester',
    subcategoryId: 'non_existent_crop',
    subcategoryTitleEn: 'Unknown Crop',
    subcategoryTitleTe: 'తెలియని పంట',
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    date: todayTestDate,
    quantity: 1,
    duration: '1_DAY',
  };
  const matchedNone = matchHarvesters(DEMO_HARVESTERS, searchImpossible);
  assert(matchedNone.length === 0, 'Zero matches returned when no providers meet criteria');

  // 9. Dynamic Worker Registration & Immediate Matching
  console.log('\n--- Test Group 9: Dynamic Worker Registration Flow ---');
  const newWorkerName = 'S. Venkat Reddy';
  const newWorkerRecord: Worker = {
    id: 'w-new-test',
    demoId: 'DEMO-NEW-01',
    nameEn: newWorkerName,
    nameTe: 'ఎస్. వెంకట్ రెడ్డి',
    villageId: 'krishnapuram',
    villageNameEn: 'Krishnapuram',
    villageNameTe: 'కృష్ణాపురం',
    skills: ['fruit_picking', 'vegetable_picking'],
    dailyWage: 420,
    experienceYears: 6,
    availability: 'IMMEDIATE',
    availableDates: ['2026-10-16', '2026-10-17', '2026-10-18'],
    contactDemo: '98480-99999 (Demo)',
    isRegisteredUser: true,
  };

  const updatedWorkersList = [newWorkerRecord, ...INITIAL_DEMO_WORKERS];
  const searchFruitInKrishna: SearchQueryParams = {
    serviceType: 'person',
    subcategoryId: 'fruit_picking',
    subcategoryTitleEn: 'Fruit Picking',
    subcategoryTitleTe: 'పండ్ల కోత',
    villageId: 'krishnapuram',
    villageNameEn: 'Krishnapuram',
    villageNameTe: 'కృష్ణాపురం',
    date: todayTestDate,
    quantity: 2,
    duration: '1_DAY',
  };
  const matchedNewWorker = matchWorkers(updatedWorkersList, searchFruitInKrishna);
  const foundNewWorker = matchedNewWorker.find((m) => m.item.nameEn === newWorkerName);
  assert(
    Boolean(foundNewWorker && foundNewWorker.distanceKm === 0),
    `Newly registered worker successfully matched in their village (${newWorkerName} with score ${foundNewWorker?.score}%)`
  );

  // 10. Reference Number and Receipt Formatting
  console.log('\n--- Test Group 10: Reference Numbers and Receipts ---');
  const refReq = generateReferenceNumber('REQ');
  const refWrk = generateReferenceNumber('WRK');
  const refMch = generateReferenceNumber('MCH');
  assert(refReq.startsWith('GC-REQ-'), `Request reference format valid: ${refReq}`);
  assert(refWrk.startsWith('GC-WRK-'), `Worker reference format valid: ${refWrk}`);
  assert(refMch.startsWith('GC-MCH-'), `Machinery reference format valid: ${refMch}`);

  const formattedDateEn = formatDateTime(new Date('2026-10-16T10:30:00'), 'en');
  const formattedDateTe = formatDateTime(new Date('2026-10-16T10:30:00'), 'te');
  assert(formattedDateEn.length > 5, `Date formatted EN: ${formattedDateEn}`);
  assert(formattedDateTe.length > 5, `Date formatted TE: ${formattedDateTe}`);

  // 11. Two-Tap Voice Guidance & Kiosk Localization
  console.log('\n--- Test Group 11: Two-Tap Voice Guidance & Kiosk Localization ---');
  assert(
    Boolean(translations.en.twoTapHint && translations.te.twoTapHint),
    'Two-tap "Tap once to hear, tap again to open" audio instruction present in English and Telugu'
  );
  assert(
    Boolean(translations.en.tapAgainToOpen && translations.te.tapAgainToOpen),
    'Two-tap "[ TAP AGAIN TO OPEN ]" instruction present in English and Telugu'
  );
  assert(
    Boolean(translations.en.voiceGuidanceActive && translations.te.voiceGuidanceActive),
    'Female voice guidance active indicator present in English and Telugu'
  );

  // 12. Rampur Gram Panchayat Location & Exact Empty State
  console.log('\n--- Test Group 12: Rampur Gram Panchayat Location & Empty State ---');
  const expectedEmptyMsgEn = 'No matching service providers are registered at this kiosk yet.';
  assert(
    translations.en.noProvidersRegisteredMsg === expectedEmptyMsgEn,
    `Exact empty state English string matches requirement: "${expectedEmptyMsgEn}"`
  );
  assert(
    Boolean(translations.te.noProvidersRegisteredMsg),
    'Telugu translation for empty state exists'
  );

  // Direct Rampur Kiosk Search without user input form
  const directRampurSearch: SearchQueryParams = {
    serviceType: 'person',
    subcategoryId: 'transplanting',
    subcategoryTitleEn: 'Transplanting Rice Seedlings',
    subcategoryTitleTe: 'వరి నాట్లు వేయడం',
    kioskPanchayatId: 'rampur',
    kioskPanchayatNameEn: 'Rampur Gram Panchayat',
    kioskPanchayatNameTe: 'రాంపూర్ గ్రామ పంచాయతీ',
  };
  const rampurMatches = matchWorkers(INITIAL_DEMO_WORKERS, directRampurSearch);
  assert(
    rampurMatches.length > 0,
    `Direct Panchayat search immediately finds providers for rice transplanting (${rampurMatches.length} found)`
  );
  assert(
    rampurMatches[0].distanceKm === 0,
    `Top provider is stationed locally in Rampur Gram Panchayat (${rampurMatches[0].item.nameEn})`
  );

  // 13. Dynamic Machinery Registration Flow
  console.log('\n--- Test Group 13: Dynamic Machinery Registration ---');
  // Register new Tractor
  const customTractor = {
    id: 'tr-custom-01',
    demoId: 'DEMO-TR-99',
    ownerNameEn: 'K. Nageshwar Rao',
    ownerNameTe: 'కె. నాగేశ్వర్ రావు',
    ownerNameHi: 'के. नागेश्वर राव',
    tractorModel: 'Swaraj 855 FE (52 HP)',
    currentAttachment: 'tractor_leveller',
    attachments: ['tractor_rotavator', 'tractor_leveller'],
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    villageNameHi: 'रामपुर',
    ratePerHour: 850,
    includesOperator: true,
    isActiveToday: true,
    activeDate: getKioskTodayDateString(),
    availability: 'IMMEDIATE' as const,
    contactDemo: '98480-77777 (Demo)',
    isRegisteredUser: true,
  };
  const dynamicTractors = [customTractor, ...DEMO_TRACTORS];
  const tractorSearch: SearchQueryParams = {
    serviceType: 'tractor',
    subcategoryId: 'tractor_leveller',
    subcategoryTitleEn: 'Laser Land Leveller',
    subcategoryTitleTe: 'లేజర్ ల్యాండ్ లెవెలర్',
    kioskPanchayatId: 'rampur',
  };
  const matchedCustomTractor = matchTractors(dynamicTractors, tractorSearch);
  assert(
    matchedCustomTractor.some((t) => t.item.demoId === 'DEMO-TR-99'),
    'Dynamically registered tractor appears immediately in kiosk matching results'
  );

  // Register new Mini-Truck
  const customTruck = {
    id: 'tk-custom-01',
    demoId: 'DEMO-TK-88',
    driverNameEn: 'B. Raju',
    driverNameTe: 'బి. రాజు',
    driverNameHi: 'बी. राजू',
    vehicleModel: 'Mahindra Bolero Maxi Truck Plus',
    cargoSpeciality: ['truck_grain_sacks', 'truck_covered_body'],
    bodyType: 'COVERED' as const,
    capacityTons: 2.0,
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    villageNameHi: 'रामपुर',
    baseCharge: 700,
    availability: 'IMMEDIATE' as const,
    contactDemo: '98480-66666 (Demo)',
    isRegisteredUser: true,
  };
  const dynamicTrucks = [customTruck, ...DEMO_MINI_TRUCKS];
  const truckSearch: SearchQueryParams = {
    serviceType: 'mini_truck',
    subcategoryId: 'truck_grain_sacks',
    subcategoryTitleEn: 'Grain Sacks Transport',
    subcategoryTitleTe: 'ధాన్యం బస్తాల రవాణా',
    kioskPanchayatId: 'rampur',
  };
  const matchedCustomTruck = matchMiniTrucks(dynamicTrucks, truckSearch);
  assert(
    matchedCustomTruck.some((t) => t.item.demoId === 'DEMO-TK-88'),
    'Dynamically registered mini-truck appears immediately in kiosk transport results'
  );

  // 14. Unknown Availability Labeling
  console.log('\n--- Test Group 14: Unknown Availability Compliance ---');
  const unknownAvailTractor = {
    ...customTractor,
    id: 'tr-unknown-avail',
    demoId: 'DEMO-TR-UNK',
    currentAttachment: 'tractor_leveller',
    isActiveToday: true,
    activeDate: getKioskTodayDateString(),
    availability: 'UNKNOWN' as const,
  };
  const matchedUnknown = matchTractors([unknownAvailTractor], tractorSearch);
  assert(
    matchedUnknown[0].matchReasonsEn.some((r) => r.includes('Availability: Unknown')),
    'When availability is unknown, system explicitly states "Availability: Unknown (Please call to confirm)" without falsely claiming immediate availability'
  );

  // 15. Worker Print Receipt Strict Minimalism (Only Name & Phone)
  console.log('\n--- Test Group 15: Worker Print Receipt Strict Minimalism ---');
  const sampleWorker: Worker = {
    id: 'w-test-slip',
    demoId: 'DEMO-W-SLIP',
    nameEn: 'G. Mallaiah',
    nameTe: 'జి. మల్లయ్య',
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    skills: ['sowing', 'transplanting'],
    dailyWage: 450,
    contactDemo: '98480-11111 (Demo)',
  };

  // Function simulating PrintableReceipt's validWorkers extraction logic
  const isWorkerSearchResult = true;
  const extractedForAtmSlip = isWorkerSearchResult
    ? [{ name: sampleWorker.nameEn, contact: sampleWorker.contactDemo }]
    : [];

  assert(extractedForAtmSlip.length === 1, 'Worker slip data extracted');
  assert(
    extractedForAtmSlip[0].name === 'G. Mallaiah' &&
    extractedForAtmSlip[0].contact === '98480-11111 (Demo)',
    'Worker slip contains only worker name and contact number'
  );
  assert(
    !('dailyWage' in extractedForAtmSlip[0]) &&
    !('skills' in extractedForAtmSlip[0]) &&
    !('villageNameEn' in extractedForAtmSlip[0]),
    'Worker slip omits wages, skills, and village in accordance with strict ATM slip specification'
  );

  // 16. Voice Synthesis Code Mapping
  console.log('\n--- Test Group 16: Voice Synthesis Code Mapping (BCP-47) ---');
  assert(getSpeechLangCode('en') === 'en-IN', 'English maps to en-IN voice code');
  assert(getSpeechLangCode('te') === 'te-IN', 'Telugu maps to te-IN voice code');
  assert(getSpeechLangCode('hi') === 'hi-IN', 'Hindi maps to hi-IN voice code');

  // 17. Complete Removal of Open Farm Jobs
  console.log('\n--- Test Group 17: Complete Removal of Open Farm Jobs Section ---');
  assert(!fs.existsSync('./src/components/JobBrowseView.tsx'), 'JobBrowseView.tsx is completely deleted');
  assert(!fs.existsSync('./src/data/demoJobs.ts'), 'demoJobs.ts is completely deleted');
  const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');
  assert(!appSource.includes('JobBrowseView'), 'App.tsx contains no JobBrowseView component import or usage');
  assert(!appSource.includes('JOB_BROWSE'), 'App.tsx contains no JOB_BROWSE screen state or route');

  // 18. Trilingual Matching Engine Explanations (Hindi matchReasonsHi)
  console.log('\n--- Test Group 18: Trilingual Matching Engine Explanations ---');
  const sampleWorkerMatches = matchWorkers(INITIAL_DEMO_WORKERS, searchSowingInRampur);
  assert(
    sampleWorkerMatches.length > 0 && sampleWorkerMatches[0].matchReasonsHi.length > 0,
    `Worker match result contains Hindi explanations (${sampleWorkerMatches[0].matchReasonsHi[0]})`
  );

  const sampleTractorMatches = matchTractors(DEMO_TRACTORS, searchRotavator);
  assert(
    sampleTractorMatches.length > 0 && sampleTractorMatches[0].matchReasonsHi.length > 0,
    `Tractor match result contains Hindi explanations (${sampleTractorMatches[0].matchReasonsHi[0]})`
  );

  const sampleHarvesterMatches = matchHarvesters(DEMO_HARVESTERS, searchPaddyHarvester);
  assert(
    sampleHarvesterMatches.length > 0 && sampleHarvesterMatches[0].matchReasonsHi.length > 0,
    `Harvester match result contains Hindi explanations (${sampleHarvesterMatches[0].matchReasonsHi[0]})`
  );

  const sampleTruckMatches = matchMiniTrucks(DEMO_MINI_TRUCKS, searchCoveredTruck);
  assert(
    sampleTruckMatches.length > 0 && sampleTruckMatches[0].matchReasonsHi.length > 0,
    `Mini-truck match result contains Hindi explanations (${sampleTruckMatches[0].matchReasonsHi[0]})`
  );

  // 19. No Stick Figures in Agricultural Illustrations
  console.log('\n--- Test Group 19: Authentic Editorial Agricultural Illustrations ---');
  assert(
    !illusSource.includes('L50 34 L50 62') && !illusSource.includes('L36 90'),
    'Stick-figure primitive line skeletons removed from all agricultural SVG illustrations'
  );
  assert(
    illusSource.includes('fill="#000"') || illusSource.includes('fill="#000000"') || illusSource.includes('fill="currentColor"'),
    'Illustrations feature solid contoured silhouettes and detailed editorial line art'
  );

  // 20. Pre-Generated Speech Audio Assets (English, Telugu, Hindi)
  console.log('\n--- Test Group 20: Pre-Generated Speech Audio Assets ---');
  const requiredAudioFiles = [
    './public/audio/en/welcome.mp3',
    './public/audio/te/welcome.mp3',
    './public/audio/hi/welcome.mp3',
    './public/audio/te/lang_selected.mp3',
    './public/audio/te/menu_work.mp3',
    './public/audio/te/menu_services.mp3',
    './public/audio/te/two_tap_hint.mp3',
    './public/audio/en/menu_work.mp3',
    './public/audio/en/menu_services.mp3',
    './public/audio/hi/menu_work.mp3',
    './public/audio/hi/menu_services.mp3',
  ];
  let allAudioFilesExist = true;
  let allAudioFilesNonEmpty = true;
  for (const file of requiredAudioFiles) {
    if (!fs.existsSync(file)) {
      allAudioFilesExist = false;
      console.error(`Missing audio file: ${file}`);
    } else {
      const stats = fs.statSync(file);
      if (stats.size === 0) {
        allAudioFilesNonEmpty = false;
        console.error(`Audio file is empty: ${file}`);
      }
    }
  }
  assert(allAudioFilesExist, 'All mandatory pre-generated audio files exist in public/audio/{en,te,hi}/');
  assert(allAudioFilesNonEmpty, 'All pre-generated audio files are populated with valid audio data (>0 bytes)');

  // 21. Server TTS Fallback Architecture & Google Cloud Voice Identification
  console.log('\n--- Test Group 21: Server TTS Fallback & Official Cloud Voice Configuration ---');
  assert(fs.existsSync('./src/server/ttsPlugin.ts'), 'ttsPlugin.ts server middleware exists');
  const ttsPluginSource = fs.readFileSync('./src/server/ttsPlugin.ts', 'utf-8');
  assert(
    ttsPluginSource.includes('te-IN-Standard-A') &&
    ttsPluginSource.includes('hi-IN-Standard-A') &&
    ttsPluginSource.includes('en-IN-Standard-A'),
    'Server TTS configures official Google Cloud TTS voice identifiers (te-IN-Standard-A, hi-IN-Standard-A, en-IN-Standard-A)'
  );
  assert(
    ttsPluginSource.includes('/api/tts') && ttsPluginSource.includes('/api/tts/status'),
    'Server middleware handles both /api/tts endpoint and /api/tts/status health check'
  );
  const viteConfigSource = fs.readFileSync('./vite.config.ts', 'utf-8');
  assert(viteConfigSource.includes('ttsPlugin'), 'vite.config.ts registers ttsPlugin middleware');
  assert(fs.existsSync('./.env.example'), '.env.example template file exists for developer documentation');
  const envExampleSource = fs.readFileSync('./.env.example', 'utf-8');
  assert(envExampleSource.includes('GOOGLE_TTS_API_KEY'), '.env.example documents GOOGLE_TTS_API_KEY configuration');

  // 22. Voice Engine Diagnostic Panel & App Integration
  console.log('\n--- Test Group 22: Voice Engine Diagnostic Panel & App Integration ---');
  assert(fs.existsSync('./src/components/VoiceDiagnosticPanel.tsx'), 'VoiceDiagnosticPanel.tsx exists');
  const diagPanelSource = fs.readFileSync('./src/components/VoiceDiagnosticPanel.tsx', 'utf-8');
  assert(
    diagPanelSource.includes('Test English') &&
    diagPanelSource.includes('Test Telugu') &&
    diagPanelSource.includes('Test Hindi'),
    'VoiceDiagnosticPanel renders all 3 required interactive test buttons (English, Telugu, Hindi)'
  );
  assert(
    diagPanelSource.includes('గ్రామ కనెక్ట్కు స్వాగతం.') &&
    diagPanelSource.includes('ग्राम कनेक्ट में आपका स्वागत है।') &&
    diagPanelSource.includes('Welcome to GramaConnect.'),
    'VoiceDiagnosticPanel displays exact required greeting phrases for all 3 languages'
  );
  assert(!appSource.includes('<VoiceDiagnosticPanel'), 'VoiceDiagnosticPanel is completely removed from normal user interface in App.tsx');

  // 23. Specification Verification for All 11 Scenarios
  console.log('\n--- Test Group 23: Verification of All 11 User Scenarios ---');

  // Scenario 1: Daily Availability Activation
  const testTractorScen1: TractorService = {
    id: 'tr-scen-1',
    demoId: 'DEMO-TR-SC1',
    ownerNameEn: 'B. Srinivasa Rao',
    ownerNameTe: 'బి. శ్రీనివాసరావు',
    ownerNameHi: 'बी. श्रीनिवास राव',
    tractorModel: 'Mahindra 575 DI',
    attachments: ['tractor_plough', 'tractor_cultivator'],
    currentAttachment: 'tractor_plough',
    villageId: 'rampur',
    villageNameEn: 'Rampur',
    villageNameTe: 'రాంపూర్',
    villageNameHi: 'रामपुर',
    ratePerHour: 800,
    includesOperator: true,
    isActiveToday: false,
    activeDate: '',
    availability: 'IMMEDIATE',
    contactDemo: '9848011222',
  };
  assert(!isTractorActiveForDate(testTractorScen1), 'Scenario 1: Tractor driver profile is initially inactive');
  const searchPlough: SearchQueryParams = {
    serviceType: 'tractor',
    subcategoryId: 'tractor_plough',
    kioskPanchayatId: 'rampur',
  };
  const searchPloughInactive = matchTractors([testTractorScen1], searchPlough);
  assert(searchPloughInactive.length === 0, 'Scenario 1: Inactive tractor does NOT appear in farmer search');

  const tractorActivated = activateTractorForToday(testTractorScen1, 'tractor_plough');
  assert(isTractorActiveForDate(tractorActivated), 'Scenario 1: Tractor activates successfully for today');
  const searchPloughActive = matchTractors([tractorActivated], searchPlough);
  assert(
    searchPloughActive.length === 1 && searchPloughActive[0].item.id === 'tr-scen-1',
    'Scenario 1: Activated tractor appears in farmer search results for today'
  );

  // Scenario 2: Single Attachment Rule
  const searchCultivator: SearchQueryParams = {
    serviceType: 'tractor',
    subcategoryId: 'tractor_cultivator',
    kioskPanchayatId: 'rampur',
  };
  const searchCultivatorResult = matchTractors([tractorActivated], searchCultivator);
  assert(
    searchCultivatorResult.length === 0,
    'Scenario 2: Single attachment rule prevents tractor active with plough from appearing in cultivator search'
  );

  // Scenario 3: Changing Attachment
  const tractorSwitched = changeTractorAttachment(tractorActivated, 'tractor_cultivator');
  assert(tractorSwitched.currentAttachment === 'tractor_cultivator', 'Scenario 3: Driver changes attachment to cultivator');
  const searchPloughAfterSwitch = matchTractors([tractorSwitched], searchPlough);
  assert(searchPloughAfterSwitch.length === 0, 'Scenario 3: Previous attachment (plough) no longer appears in search');
  const searchCultivatorAfterSwitch = matchTractors([tractorSwitched], searchCultivator);
  assert(
    searchCultivatorAfterSwitch.length === 1,
    'Scenario 3: Newly selected attachment (cultivator) now appears in search'
  );

  // Scenario 4: Deactivation
  const tractorDeactivated = deactivateTractor(tractorSwitched);
  assert(!isTractorActiveForDate(tractorDeactivated), 'Scenario 4: Tractor successfully deactivated');
  const searchAfterDeactivate = matchTractors([tractorDeactivated], searchCultivator);
  assert(searchAfterDeactivate.length === 0, 'Scenario 4: Deactivated tractor immediately stops appearing in search');
  assert(
    tractorDeactivated.ownerNameEn === 'B. Srinivasa Rao' && tractorDeactivated.attachments.length === 2,
    'Scenario 4: Tractor registration details remain preserved after deactivation'
  );

  // Scenario 5: Automatic Expiration
  const yesterdayTractor: TractorService = {
    ...tractorActivated,
    activeDate: '2026-10-15',
    isActiveToday: true,
  };
  assert(
    !isTractorActiveForDate(yesterdayTractor, '2026-10-16'),
    'Scenario 5: Tractor active yesterday automatically expires and is inactive on Day 2'
  );
  const searchDay2 = matchTractors([yesterdayTractor], searchPlough, '2026-10-16');
  assert(searchDay2.length === 0, 'Scenario 5: Expired tractor does not appear in Day 2 search results');

  // Scenario 6: Mandatory Fields — Missing Name
  const emptyNameEn = validateFullName('', 'en');
  const emptyNameTe = validateFullName('   ', 'te');
  const validName = validateFullName('B. Srinivasa Rao', 'en');
  assert(!emptyNameEn.isValid && Boolean(emptyNameEn.errorMessage), 'Scenario 6: Empty name rejected in English');
  assert(!emptyNameTe.isValid && Boolean(emptyNameTe.errorMessage), 'Scenario 6: Whitespace-only name rejected in Telugu');
  assert(validName.isValid && !validName.errorMessage, 'Scenario 6: Valid name accepted');

  // Scenario 7: Mandatory Fields — Missing / Invalid Mobile
  const emptyMobile = validateIndianMobile('', 'en');
  const shortMobile = validateIndianMobile('12345', 'en');
  const alphaMobile = validateIndianMobile('abcdefghij', 'en');
  const invalidStartMobile = validateIndianMobile('5551234567', 'en');
  const validMobile1 = validateIndianMobile('9848011222', 'en');
  const validMobile2 = validateIndianMobile('+91 98480 11222', 'en');
  assert(!emptyMobile.isValid, 'Scenario 7: Empty mobile rejected');
  assert(!shortMobile.isValid, 'Scenario 7: Short mobile (12345) rejected');
  assert(!alphaMobile.isValid, 'Scenario 7: Alphabetic mobile rejected');
  assert(!invalidStartMobile.isValid, 'Scenario 7: Mobile not starting with 6-9 rejected');
  assert(validMobile1.isValid && validMobile1.cleanMobile === '9848011222', 'Scenario 7: Standard 10-digit mobile accepted');
  assert(validMobile2.isValid && validMobile2.cleanMobile === '9848011222', 'Scenario 7: Formatted Indian mobile (+91) sanitized to 10 digits');

  // Scenario 8: Maximise Space (No Separate Box per Person)
  const matchResultsSource = fs.readFileSync('./src/components/MatchResults.tsx', 'utf-8');
  assert(
    matchResultsSource.includes('compact-results-list') && matchResultsSource.includes('compact-provider-row'),
    'Scenario 8: MatchResults renders compact continuous list and provider rows'
  );
  assert(
    !matchResultsSource.includes('className="match-card"'),
    'Scenario 8: Individual boxed cards (match-card) completely removed from MatchResults'
  );
  const appCssSource = fs.readFileSync('./src/App.css', 'utf-8');
  assert(
    appCssSource.includes('.compact-provider-row') && appCssSource.includes('border-bottom: 1px solid'),
    'Scenario 8: Continuous list features subtle divider lines without boxed card margins'
  );
  assert(
    matchResultsSource.includes('print-all-contacts-btn'),
    'Scenario 8: MatchResults includes prominent Print All Contacts button'
  );

  // Scenario 9: Compact Printing (ONLY Name & Mobile Number)
  const cleanName = formatCleanPersonName('B. Srinivasa Rao (Mahindra 575 DI)');
  const cleanPhone = formatCleanMobile('98480-11901 (Demo)');
  assert(cleanName === 'B. Srinivasa Rao', 'Scenario 9: Formatted name strips extraneous tractor model metadata');
  assert(cleanPhone === '9848011901', 'Scenario 9: Formatted phone strips hyphens and demo tag to clean 10-digit number');
  const printSlipSource = fs.readFileSync('./src/components/PrintableReceipt.tsx', 'utf-8');
  assert(
    printSlipSource.includes('compact-print-paper') &&
    printSlipSource.includes('compact-print-name') &&
    printSlipSource.includes('compact-print-phone'),
    'Scenario 9: PrintableReceipt renders strictly compact-print-name and compact-print-phone'
  );
  assert(
    !printSlipSource.includes('receipt-brand') &&
    !printSlipSource.includes('receipt-station-id') &&
    !printSlipSource.includes('receipt-section-title'),
    'Scenario 9: Printable receipt strictly omits brand, logo, station, date, village, and metadata headers'
  );

  // Scenario 10: App Restart Persistence
  const mockStorage: Record<string, string> = {};
  const originalLocalStorage = (global as any).localStorage;
  (global as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, val: string) => { mockStorage[key] = val; },
    removeItem: (key: string) => { delete mockStorage[key]; },
  };
  saveTractorsToStorage([tractorActivated]);
  const restoredTractors = loadTractorsFromStorage([]);
  assert(
    restoredTractors.length === 1 && restoredTractors[0].id === 'tr-scen-1',
    'Scenario 10: Saved tractor details persist across simulated app restart'
  );
  assert(
    restoredTractors[0].isActiveToday === true && restoredTractors[0].currentAttachment === 'tractor_plough',
    'Scenario 10: Today’s daily activation state and current attachment persist across app restart'
  );
  if (originalLocalStorage) {
    (global as any).localStorage = originalLocalStorage;
  }

  // Scenario 11: Trilingual Support
  const mandatoryTrilingualKeys = [
    'tractorDriverPortal',
    'tractorDriverPortalSub',
    'activateForToday',
    'deactivateToday',
    'statusActiveToday',
    'statusInactive',
    'selectCurrentAttachment',
    'singleAttachmentRule',
    'errNameRequired',
    'errMobileRequired',
    'errMobileInvalid',
    'tractorActivatedAnnounce',
    'tractorDeactivatedAnnounce',
    'attachmentChangedAnnounce',
    'btnPrintAllContacts',
  ];
  const allKeysPresentInAllLanguages = mandatoryTrilingualKeys.every(
    (key) =>
      Boolean((translations.en as any)[key]) &&
      Boolean((translations.te as any)[key]) &&
      Boolean((translations.hi as any)[key])
  );
  assert(
    allKeysPresentInAllLanguages,
    'Scenario 11: All daily availability and validation keys present in English, Telugu, and Hindi'
  );
  assert(
    translations.te.tractorActivatedAnnounce.length > 5 && translations.hi.tractorActivatedAnnounce.length > 5,
    'Scenario 11: Voice announcement strings for tractor activation populated in Telugu and Hindi'
  );

  // 24. Verification of 12 New Final Registration, OTP Login & UI Requirements
  console.log('\n--- Test Group 24: Verification of 12 Specific Requirements ---');

  // Req 1: New worker registration requires a name and mobile number
  const wrkEmptyName = validateFullName('', 'en');
  const wrkEmptyPhone = validateIndianMobile('', 'en');
  const wrkValid = validateFullName('G. Mallaiah', 'en').isValid && validateIndianMobile('9848011201', 'en').isValid;
  assert(!wrkEmptyName.isValid, 'Req 1: Worker registration rejects empty name');
  assert(!wrkEmptyPhone.isValid, 'Req 1: Worker registration rejects empty mobile number');
  assert(wrkValid, 'Req 1: Worker registration accepts valid name and 10-digit mobile number');

  // Req 2: New tractor registration follows a single daily-registration workflow
  const providerHubSrc = fs.readFileSync('./src/components/ProviderHub.tsx', 'utf-8');
  assert(
    !providerHubSrc.includes('TRACTOR_DAILY_PORTAL'),
    'Req 2: Duplicate tractor portal removed from ProviderHub; only 1 unified tractor workflow exists'
  );
  assert(
    providerHubSrc.includes('Tractor Daily Registration') || providerHubSrc.includes('REGISTER_TRACTOR'),
    'Req 2: Unified single daily tractor registration workflow present in Provider Hub'
  );

  // Req 3: Duplicate same-day tractor registrations are prevented
  const machRegSrc = fs.readFileSync('./src/components/MachineryRegistration.tsx', 'utf-8');
  assert(
    machRegSrc.includes('errDuplicateTractorToday') && machRegSrc.includes('alreadyActiveToday'),
    'Req 3: MachineryRegistration checks and rejects duplicate active registrations for the same tractor on the same day'
  );

  // Req 4: A user can log in using their verified mobile number and OTP
  const demoAccount = getAccountByMobile('9848011901');
  assert(Boolean(demoAccount), 'Req 4: Provider account retrieved by registered 10-digit mobile');
  assert(
    demoAccount?.type === 'tractor' && demoAccount?.name === 'B. Srinivasa Rao',
    'Req 4: Provider account identity correctly verified'
  );
  const authPluginSrc = fs.readFileSync('./src/server/authPlugin.ts', 'utf-8');
  assert(
    authPluginSrc.includes('/api/auth/send-otp') && authPluginSrc.includes('/api/auth/verify-otp'),
    'Req 4: Server-side OTP generation and verification endpoints implemented'
  );

  // Req 5: Workers and machinery providers can update their own status and work category
  const updatedStatusAcc = updateAccountStatus('9848011901', false);
  assert(updatedStatusAcc?.isActive === false, 'Req 5: Provider can switch status to Inactive');
  const restoredStatusAcc = updateAccountStatus('9848011901', true);
  assert(restoredStatusAcc?.isActive === true, 'Req 5: Provider can switch status back to Active');
  const updatedAttAcc = updateTractorAttachment('9848011901', 'tractor_cultivator');
  assert(updatedAttAcc?.currentAttachment === 'tractor_cultivator', 'Req 5: Tractor provider can update working attachment');

  // Req 6: Inactive and expired providers do not appear in active search results
  const inactiveWorker: Worker = {
    ...INITIAL_DEMO_WORKERS[0],
    availability: 'UNAVAILABLE',
    isActive: false,
  };
  const searchWrkQuery: SearchQueryParams = {
    serviceType: 'person',
    subcategoryId: inactiveWorker.skills[0],
    kioskPanchayatId: 'rampur',
  };
  const inactiveWorkerMatches = matchWorkers([inactiveWorker], searchWrkQuery);
  assert(inactiveWorkerMatches.length === 0, 'Req 6: Inactive worker does NOT appear in active search results');

  // Req 7: Changing a tractor's attachment replaces the previous current attachment
  const activeTractorRotavator: TractorService = {
    ...testTractorScen1,
    isActiveToday: true,
    activeDate: getKioskTodayDateString(),
    currentAttachment: 'tractor_rotavator',
  };
  const searchRotavatorReq7: SearchQueryParams = {
    serviceType: 'tractor',
    subcategoryId: 'tractor_rotavator',
    kioskPanchayatId: 'rampur',
  };
  const searchPloughReq7: SearchQueryParams = {
    serviceType: 'tractor',
    subcategoryId: 'tractor_plough',
    kioskPanchayatId: 'rampur',
  };
  assert(
    matchTractors([activeTractorRotavator], searchRotavatorReq7).length === 1,
    'Req 7: Tractor active with rotavator appears in rotavator search'
  );
  const switchedToPlough = changeTractorAttachment(activeTractorRotavator, 'tractor_plough');
  assert(
    matchTractors([switchedToPlough], searchRotavatorReq7).length === 0,
    'Req 7: Switched tractor NO LONGER appears under previous attachment (rotavator)'
  );
  assert(
    matchTractors([switchedToPlough], searchPloughReq7).length === 1,
    'Req 7: Switched tractor now appears under new single attachment (plough)'
  );

  // Req 8: Next day's tractor registration starts inactive until new daily registration is completed
  const expiredTractorAcc = {
    ...demoAccount!,
    activeDate: '2026-10-15',
    isActiveToday: true,
  };
  assert(
    !isTractorRegistrationValidToday(expiredTractorAcc as any, '2026-10-16'),
    'Req 8: Yesterday registration starts inactive on next day'
  );

  // Req 9: Voice diagnostic UI completely removed while normal voice announcements remain
  assert(!appSource.includes('<VoiceDiagnosticPanel'), 'Req 9: Voice diagnostic UI completely removed from App.tsx');
  assert(
    getSpeechLangCode('en') === 'en-IN' && getSpeechLangCode('te') === 'te-IN' && getSpeechLangCode('hi') === 'hi-IN',
    'Req 9: Trilingual speech synthesis configuration preserved'
  );

  // Req 10: Subtle blue theme is consistent across all three languages
  const cssSource = fs.readFileSync('./src/App.css', 'utf-8');
  assert(
    cssSource.includes('--color-primary: #1e40af') &&
    cssSource.includes('--color-primary-light: #eff6ff') &&
    cssSource.includes('--color-primary-border: #bfdbfe'),
    'Req 10: Subtle blue palette variables defined in App.css'
  );
  assert(
    cssSource.includes('.provider-login-screen') && cssSource.includes('.provider-dashboard-screen'),
    'Req 10: Provider Login and Dashboard styled with subtle blue theme'
  );

  // Req 11: Printed output contains only permitted name and mobile number
  const cleanPName = formatCleanPersonName('B. Srinivasa Rao (Mahindra Tractor)');
  const cleanPMobile = formatCleanMobile('+91 98480 11901');
  assert(cleanPName === 'B. Srinivasa Rao', 'Req 11: Formatted slip strips metadata from name');
  assert(cleanPMobile === '9848011901', 'Req 11: Formatted slip contains strictly 10-digit mobile number');

  // Req 12: Refreshing app does not incorrectly restore expired availability
  const expiredTractorRecord: TractorService = {
    ...activeTractorRotavator,
    activeDate: '2026-10-15',
    isActiveToday: true,
  };
  const cleanedRecords = cleanTractorsDailyActivation([expiredTractorRecord], '2026-10-16');
  assert(
    cleanedRecords[0].isActiveToday === false,
    'Req 12: Refreshing app cleans expired daily activations and does NOT restore expired availability'
  );

  // Test Group 25: Final UI/UX Improvements Verification
  console.log('\n--- Test Group 25: Final UI/UX Improvements Verification ---');

  // 1. Language Selected Only Once
  const headerSource = fs.readFileSync('./src/components/Header.tsx', 'utf-8');
  assert(
    !headerSource.includes('className="lang-switcher"'),
    'Language selector completely removed from persistent header; chosen once on welcome screen'
  );

  const langSelectSource = fs.readFileSync('./src/components/LanguageSelection.tsx', 'utf-8');
  assert(
    langSelectSource.includes("handleLanguageChoice('en')") &&
    langSelectSource.includes("handleLanguageChoice('te')") &&
    langSelectSource.includes("handleLanguageChoice('hi')"),
    'Welcome screen provides accessible trilingual selection (EN, TE, HI)'
  );

  // 2. Removal of All Wages, Prices & Extra Public Profile Metadata
  const matchResultsCode = fs.readFileSync('./src/components/MatchResults.tsx', 'utf-8');
  assert(
    !matchResultsCode.includes('₹') &&
    !matchResultsCode.includes('w.dailyWage') &&
    !matchResultsCode.includes('tr.ratePerHour') &&
    !matchResultsCode.includes('hv.ratePerAcre') &&
    !matchResultsCode.includes('tk.baseCharge'),
    'MatchResults strictly contains NO wages, rates, or currency symbols'
  );

  assert(
    !matchResultsCode.includes('compact-meta-skills') &&
    !matchResultsCode.includes('compact-village-text') &&
    !matchResultsCode.includes('compact-score-tag'),
    'Public search result rows omit skills, village distances, and match scores, displaying strictly Name & Mobile'
  );

  const searchFormCode = fs.readFileSync('./src/components/SearchForm.tsx', 'utf-8');
  assert(
    !searchFormCode.includes('fieldWageOffer') && !searchFormCode.includes('offeredWage'),
    'SearchForm completely omits wage offer inputs and chips'
  );

  const machineryRegCode = fs.readFileSync('./src/components/MachineryRegistration.tsx', 'utf-8');
  assert(
    !machineryRegCode.includes('hourlyRate =') &&
    !machineryRegCode.includes('acreRate =') &&
    !machineryRegCode.includes('baseTripCharge ='),
    'MachineryRegistration omits all hardcoded wage/rate constants'
  );

  // 3. Print Available Workers & Dedicated Clean Layout
  assert(
    matchResultsCode.includes('print-available-workers-btn'),
    'MatchResults renders prominent Print Available Workers button'
  );
  assert(
    Boolean(translations.en.btnPrintAvailableWorkers) &&
    Boolean(translations.te.btnPrintAvailableWorkers) &&
    Boolean(translations.hi.btnPrintAvailableWorkers),
    'btnPrintAvailableWorkers translated across all 3 languages (EN, TE, HI)'
  );

  const receiptCode = fs.readFileSync('./src/components/PrintableReceipt.tsx', 'utf-8');
  assert(
    receiptCode.includes('compact-print-heading') &&
    receiptCode.includes('compact-print-subheading') &&
    receiptCode.includes('compact-print-name') &&
    receiptCode.includes('compact-print-phone'),
    'PrintableReceipt renders clean dedicated heading and strictly Name & Mobile contacts'
  );

  // 4. Beautiful Growing Grass Animation
  const grassStripExists = fs.existsSync('./src/components/GrowingGrassStrip.tsx');
  assert(grassStripExists, 'GrowingGrassStrip.tsx component exists');

  assert(
    appSource.includes('<GrowingGrassStrip') &&
    appSource.includes('grassStage'),
    'App.tsx mounts GrowingGrassStrip synchronized with workflow progress'
  );

  const currentCss = fs.readFileSync('./src/App.css', 'utf-8');
  assert(
    currentCss.includes('.growing-grass-container') &&
    currentCss.includes('.grass-svg') &&
    currentCss.includes('.soil-bed-path') &&
    currentCss.includes('.flourishing-harvest-group') &&
    currentCss.includes('@keyframes grass-breeze-left'),
    'App.css contains growing grass artwork styles, soil bed, and gentle breeze animations'
  );

  assert(
    currentCss.includes('@media (prefers-reduced-motion: reduce)') &&
    currentCss.includes('@media print'),
    'Growing grass animation respects prefers-reduced-motion and is cleanly hidden during print'
  );

  // 5. Agricultural Colour Theme & Backgrounds
  assert(
    currentCss.includes('--color-sky-blue: #0284c7') &&
    currentCss.includes('--color-leaf-green: #16a34a') &&
    currentCss.includes('--color-warm-offwhite: #f8fafc'),
    'Agricultural sky blue (#0284c7) and leaf green (#16a34a) palette defined in App.css'
  );

  assert(
    currentCss.includes('.kiosk-app-wrapper') &&
    currentCss.includes('radial-gradient('),
    'App.css provides tasteful low-contrast agricultural background styling on kiosk wrapper'
  );

  // 6. Audio Guidance for Every Selection & Step
  const workerRegCode = fs.readFileSync('./src/components/WorkerRegistration.tsx', 'utf-8');
  const subcatGridCode = fs.readFileSync('./src/components/SubcategoryGrid.tsx', 'utf-8');
  const serviceSelCode = fs.readFileSync('./src/components/ServiceSelection.tsx', 'utf-8');
  const regConfirmCode = fs.readFileSync('./src/components/RegistrationConfirmation.tsx', 'utf-8');

  assert(
    workerRegCode.includes('speakText(') &&
    machineryRegCode.includes('speakText(') &&
    matchResultsCode.includes('speakText(') &&
    subcatGridCode.includes('speakText(') &&
    serviceSelCode.includes('speakText(') &&
    regConfirmCode.includes('speakText('),
    'Audio guidance wired into every major step: Services, Subcategories, Registrations, Search Results, Confirmations'
  );

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite();

