import {
  Worker,
  TractorService,
  HarvesterService,
  MiniTruckService,
  SearchQueryParams,
  MatchScoreResult,
  KioskConfig,
} from '../types';
import { getVillageDistance } from '../data/villages';
import { isTractorActiveForDate, getKioskTodayDateString } from './dailyAvailability';

export const DEFAULT_KIOSK_CONFIG: KioskConfig = {
  panchayatId: 'rampur',
  panchayatNameEn: 'Rampur Gram Panchayat',
  panchayatNameTe: 'రాంపూర్ గ్రామ పంచాయతీ',
  panchayatNameHi: 'रामपुर ग्राम पंचायत',
  districtEn: 'Karimnagar District',
  districtTe: 'కరీంనగర్ జిల్లా',
  districtHi: 'करीमनगर जिला',
};

export function matchWorkers(
  workers: Worker[],
  params: SearchQueryParams
): MatchScoreResult<Worker>[] {
  const results: MatchScoreResult<Worker>[] = [];
  const kioskLoc = params.kioskPanchayatId || params.villageId || DEFAULT_KIOSK_CONFIG.panchayatId;

  for (const worker of workers) {
    // 0. Active availability check (Inactive providers must not appear in search results)
    if ((worker as any).isActive === false || worker.availability === 'UNAVAILABLE') {
      continue;
    }

    // 1. Must possess the required skill
    const hasSkill = worker.skills.includes(params.subcategoryId);
    if (!hasSkill) {
      continue;
    }

    let score = 0;
    const reasonsEn: string[] = ['Skilled in selected agricultural work'];
    const reasonsTe: string[] = ['ఎంచుకున్న పనిలో అనుభవం మరియు నైపుణ్యం ఉంది'];
    const reasonsHi: string[] = ['चुने गए कृषि कार्य में अनुभवी व कुशल'];

    // 2. Kiosk Gram Panchayat Proximity Calculation
    const distanceKm = getVillageDistance(kioskLoc, worker.villageId);

    if (distanceKm === 0) {
      score += 55;
      reasonsEn.push('Registered at this Gram Panchayat (Rampur)');
      reasonsTe.push('ఈ గ్రామ పంచాయతీలోనే (రాంపూర్) నమోదై ఉన్నారు');
      reasonsHi.push('इसी ग्राम पंचायत (रामपुर) में पंजीकृत हैं');
    } else if (distanceKm <= 5) {
      score += 40;
      reasonsEn.push(`Nearby village (${distanceKm} km from kiosk)`);
      reasonsTe.push(`సమీప గ్రామం (కియోస్క్ నుండి ${distanceKm} కి.మీ. దూరం)`);
      reasonsHi.push(`समीपवर्ती गाँव (कियोस्क से ${distanceKm} किमी दूर)`);
    } else if (distanceKm <= 10) {
      score += 25;
      reasonsEn.push(`Within 10 km Panchayat cluster (${distanceKm} km)`);
      reasonsTe.push(`10 కి.మీ. పరిధిలో ఉన్నారు (${distanceKm} కి.మీ.)`);
      reasonsHi.push(`10 किमी पंचायत दायरे में (${distanceKm} किमी)`);
    } else {
      score += 10;
      reasonsEn.push(`Neighboring Mandal (${distanceKm} km)`);
      reasonsTe.push(`పక్క మండలం (${distanceKm} కి.మీ.)`);
      reasonsHi.push(`समीपवर्ती क्षेत्र (${distanceKm} किमी)`);
    }

    // 3. Availability Check
    if (worker.availability === 'IMMEDIATE') {
      score += 30;
      reasonsEn.push('Available immediately for field deployment');
      reasonsTe.push('పొలం పనికి వెంటనే అందుబాటులో ఉన్నారు');
      reasonsHi.push('खेत के काम के लिए तुरंत उपलब्ध हैं');
    } else if (worker.availability === 'TOMORROW' || worker.availability === 'NEXT_WEEK') {
      score += 15;
      reasonsEn.push('Available on standard schedule');
      reasonsTe.push('షెడ్యూల్ ప్రకారం అందుబాటులో ఉన్నారు');
      reasonsHi.push('शेड्यूल अनुसार उपलब्ध हैं');
    } else {
      // Unknown availability
      reasonsEn.push('Availability: Unknown (Please call to confirm)');
      reasonsTe.push('లభ్యత: పేర్కొనబడలేదు (ధృవీకరణకు ఫోన్ చేయండి)');
      reasonsHi.push('उपलब्धता: अज्ञात (कृपया पुष्टि हेतु फोन करें)');
    }

    // 4. Experience / Registered bonus
    if (worker.isRegisteredUser) {
      score += 15;
      reasonsEn.push('Recently registered at this kiosk');
      reasonsTe.push('ఈ కియోస్క్ వద్ద తాజాగా నమోదైన కూలీ');
      reasonsHi.push('इस कियोस्क पर हाल ही में पंजीकृत श्रमिक');
    } else if (worker.experienceYears && worker.experienceYears >= 5) {
      score += 10;
      reasonsEn.push(`Experience: ${worker.experienceYears}+ years in farming`);
      reasonsTe.push(`అనుభవం: ${worker.experienceYears}+ సంవత్సరాల వ్యవసాయ అనుభవం`);
      reasonsHi.push(`अनुभव: खेती में ${worker.experienceYears}+ वर्ष का अनुभव`);
    }

    results.push({
      item: worker,
      score,
      distanceKm,
      matchReasonsEn: reasonsEn,
      matchReasonsTe: reasonsTe,
      matchReasonsHi: reasonsHi,
    });
  }

  // Sort descending by match score
  return results.sort((a, b) => b.score - a.score);
}

export function matchTractors(
  tractors: TractorService[],
  params: SearchQueryParams
): MatchScoreResult<TractorService>[] {
  const results: MatchScoreResult<TractorService>[] = [];
  const kioskLoc = params.kioskPanchayatId || params.villageId || DEFAULT_KIOSK_CONFIG.panchayatId;

  const targetDate = params.date || getKioskTodayDateString();
  for (const tractor of tractors) {
    // 1. Daily Availability Check: Tractor must be actively activated by driver for today
    if (!isTractorActiveForDate(tractor, targetDate)) {
      continue;
    }

    // 2. Single Current Attachment Check: A tractor works with ONLY ONE attachment at any given time.
    // The single authoritative currentAttachment must match the requested subcategory.
    const activeAttachment = tractor.currentAttachment || (tractor.attachments.length === 1 ? tractor.attachments[0] : undefined);
    if (activeAttachment !== params.subcategoryId) {
      continue;
    }

    let score = 0;
    const reasonsEn: string[] = ['Active today with requested agricultural attachment'];
    const reasonsTe: string[] = ['మీరు కోరిన వ్యవసాయ పరికరంతో ఈరోజు అందుబాటులో ఉంది'];
    const reasonsHi: string[] = ['आज चयनित कृषि उपकरण के साथ सक्रिय व उपलब्ध'];

    // 2. Kiosk Gram Panchayat Proximity
    const distanceKm = getVillageDistance(kioskLoc, tractor.villageId);

    if (distanceKm === 0) {
      score += 55;
      reasonsEn.push('Based in this Gram Panchayat — rapid field dispatch');
      reasonsTe.push('ఈ గ్రామ పంచాయతీలోనే ఉంది — త్వరగా పొలానికి వస్తుంది');
      reasonsHi.push('इसी ग्राम पंचायत में स्थित — त्वरित प्रेषण संभव');
    } else if (distanceKm <= 6) {
      score += 40;
      reasonsEn.push(`Nearby village: ${distanceKm} km from kiosk`);
      reasonsTe.push(`సమీప గ్రామం: కియోస్క్ నుండి ${distanceKm} కి.మీ.`);
      reasonsHi.push(`समीपवर्ती गाँव: कियोस्क से ${distanceKm} किमी`);
    } else if (distanceKm <= 12) {
      score += 25;
      reasonsEn.push(`Operational zone: ${distanceKm} km away`);
      reasonsTe.push(`సేవా పరిధి: ${distanceKm} కి.మీ. దూరం`);
      reasonsHi.push(`परिचालन क्षेत्र: ${distanceKm} किमी दूर`);
    } else {
      score += 10;
      reasonsEn.push(`Outer radius: ${distanceKm} km`);
      reasonsTe.push(`దూరపు ప్రాంతం: ${distanceKm} కి.మీ.`);
      reasonsHi.push(`बाहरी दायरा: ${distanceKm} किमी`);
    }

    // 3. Operator Inclusion Distinction
    if (tractor.includesOperator) {
      score += 20;
      reasonsEn.push('Includes skilled tractor driver/operator');
      reasonsTe.push('అనుభవజ్ఞుడైన డ్రైవర్‌తో కూడిన సేవ');
      reasonsHi.push('कुशल ट्रैक्टर ड्राइवर/ऑपरेटर सहित सेवा');
    } else {
      score += 10;
      reasonsEn.push('Equipment-only rental (Farmer drives or hires driver)');
      reasonsTe.push('పరికరం మాత్రమే అద్దెకు (స్వయంగా నడుపుకోవాలి)');
      reasonsHi.push('केवल उपकरण किराया (स्वयं चलाना होगा)');
    }

    // 4. Availability Check
    if (tractor.availability === 'IMMEDIATE') {
      score += 20;
      reasonsEn.push('Ready for immediate dispatch');
      reasonsTe.push('తక్షణమే పంపడానికి సిద్ధంగా ఉంది');
      reasonsHi.push('तुरंत खेत पर भेजने हेतु तैयार');
    } else if (tractor.availability === 'UNKNOWN' || !tractor.availability) {
      reasonsEn.push('Availability: Unknown (Please call to confirm)');
      reasonsTe.push('లభ్యత: పేర్కొనబడలేదు (ధృవీకరణకు ఫోన్ చేయండి)');
      reasonsHi.push('उपलब्धता: अज्ञात (कृपया पुष्टि हेतु फोन करें)');
    }

    results.push({
      item: tractor,
      score,
      distanceKm,
      matchReasonsEn: reasonsEn,
      matchReasonsTe: reasonsTe,
      matchReasonsHi: reasonsHi,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function matchHarvesters(
  harvesters: HarvesterService[],
  params: SearchQueryParams
): MatchScoreResult<HarvesterService>[] {
  const results: MatchScoreResult<HarvesterService>[] = [];
  const kioskLoc = params.kioskPanchayatId || params.villageId || DEFAULT_KIOSK_CONFIG.panchayatId;

  for (const harvester of harvesters) {
    // 0. Active availability check (Inactive providers must not appear in search results)
    if ((harvester as any).isActive === false || harvester.availability === 'UNAVAILABLE') {
      continue;
    }

    // 1. Must be compatible with the requested crop/harvester type
    const isCompatible = harvester.compatibleCrops.includes(params.subcategoryId);
    if (!isCompatible) {
      continue;
    }

    let score = 0;
    const reasonsEn: string[] = ['Certified crop-compatible harvester header'];
    const reasonsTe: string[] = ['ఈ పంట కోతకు సరిగ్గా సరిపోయే యంత్రం'];
    const reasonsHi: string[] = ['इस फसल की कटाई हेतु प्रमाणित उपयुक्त मशीन'];

    // 2. Kiosk Gram Panchayat Proximity
    const distanceKm = getVillageDistance(kioskLoc, harvester.villageId);

    if (distanceKm === 0) {
      score += 50;
      reasonsEn.push('Parked in this Gram Panchayat');
      reasonsTe.push('ఈ గ్రామ పంచాయతీ పరిధిలోనే అందుబాటులో ఉంది');
      reasonsHi.push('इसी ग्राम पंचायत क्षेत्र में उपलब्ध');
    } else if (distanceKm <= 8) {
      score += 35;
      reasonsEn.push(`Regional harvester hub (${distanceKm} km from kiosk)`);
      reasonsTe.push(`సమీప ప్రాంతం (కియోస్క్ నుండి ${distanceKm} కి.మీ.)`);
      reasonsHi.push(`क्षेत्रीय हार्वेस्टर केंद्र (कियोस्क से ${distanceKm} किमी)`);
    } else {
      score += 20;
      reasonsEn.push(`Transit distance: ${distanceKm} km`);
      reasonsTe.push(`రవాణా దూరం: ${distanceKm} కి.మీ.`);
      reasonsHi.push(`परिवहन दूरी: ${distanceKm} किमी`);
    }

    // 3. Operator
    if (harvester.includesOperator) {
      score += 20;
      reasonsEn.push('Includes certified harvester operator');
      reasonsTe.push('నైపుణ్యం గల ఆపరేటర్‌తో కూడిన సేవ');
      reasonsHi.push('प्रमाणित हार्वेस्टर ऑपरेटर सहित सेवा');
    }

    // 4. Availability
    if (harvester.availability === 'IMMEDIATE') {
      score += 20;
      reasonsEn.push('Field ready for today');
      reasonsTe.push('ఈరోజే కోతకు సిద్ధంగా ఉంది');
      reasonsHi.push('आज ही कटाई हेतु तैयार');
    } else if (harvester.availability === 'UNKNOWN' || !harvester.availability) {
      reasonsEn.push('Availability: Unknown (Please call to confirm)');
      reasonsTe.push('లభ్యత: పేర్కొనబడలేదు (ధృవీకరణకు ఫోన్ చేయండి)');
      reasonsHi.push('उपलब्धता: अज्ञात (कृपया पुष्टि हेतु फोन करें)');
    }

    results.push({
      item: harvester,
      score,
      distanceKm,
      matchReasonsEn: reasonsEn,
      matchReasonsTe: reasonsTe,
      matchReasonsHi: reasonsHi,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export function matchMiniTrucks(
  trucks: MiniTruckService[],
  params: SearchQueryParams
): MatchScoreResult<MiniTruckService>[] {
  const results: MatchScoreResult<MiniTruckService>[] = [];
  const kioskLoc = params.kioskPanchayatId || params.villageId || DEFAULT_KIOSK_CONFIG.panchayatId;

  for (const truck of trucks) {
    // 0. Active availability check (Inactive providers must not appear in search results)
    if ((truck as any).isActive === false || truck.availability === 'UNAVAILABLE') {
      continue;
    }

    // 1. Must support the requested transport type
    const supportsCargo = truck.cargoSpeciality.includes(params.subcategoryId);
    if (!supportsCargo) {
      continue;
    }

    let score = 0;
    const reasonsEn: string[] = ['Vehicle body configured for this agricultural cargo'];
    const reasonsTe: string[] = ['ఈ వ్యవసాయ సరుకు రవాణాకు అనువైన వాహనం'];
    const reasonsHi: string[] = ['इस कृषि उपज परिवहन हेतु उपयुक्त वाहन'];

    // 2. Kiosk Gram Panchayat Proximity
    const distanceKm = getVillageDistance(kioskLoc, truck.villageId);

    if (distanceKm === 0) {
      score += 55;
      reasonsEn.push('Stationed at this Gram Panchayat village stand');
      reasonsTe.push('ఈ గ్రామ పంచాయతీ పరిధిలోనే వాహనం ఉంది');
      reasonsHi.push('इसी ग्राम पंचायत वाहन स्टैंड पर उपलब्ध');
    } else if (distanceKm <= 5) {
      score += 40;
      reasonsEn.push(`Nearby stand: ${distanceKm} km from kiosk`);
      reasonsTe.push(`సమీప గ్రామం: ${distanceKm} కి.మీ. దూరం`);
      reasonsHi.push(`समीपवर्ती स्टैंड: कियोस्क से ${distanceKm} किमी`);
    } else {
      score += 20;
      reasonsEn.push(`Outer stand: ${distanceKm} km`);
      reasonsTe.push(`పక్క గ్రామం: ${distanceKm} కి.మీ.`);
      reasonsHi.push(`बाहरी स्टैंड: ${distanceKm} किमी`);
    }

    // 3. Body type bonus
    if (params.subcategoryId === 'truck_covered_body' && truck.bodyType === 'COVERED') {
      score += 15;
      reasonsEn.push('Weatherproof covered tarpaulin canopy');
      reasonsTe.push('వర్షం తడవకుండా పక్కా టార్పాలిన్ కవర్ బాడీ');
      reasonsHi.push('मौसम से सुरक्षित तिरपाल ढका डाला');
    } else if (params.subcategoryId === 'truck_open_body' && truck.bodyType === 'OPEN') {
      score += 15;
      reasonsEn.push('Open flatbed for 360 degree farm loading');
      reasonsTe.push('సులువుగా లోడ్ చేయడానికి ఓపెన్ ఫ్లాట్‌బెడ్');
      reasonsHi.push('खेत में आसानी से माल लादने हेतु खुला डाला');
    }

    // 4. Availability
    if (truck.availability === 'IMMEDIATE') {
      score += 20;
      reasonsEn.push('Available for immediate trip departure');
      reasonsTe.push('వెంటనే రవాణా ట్రిప్‌కు సిద్ధంగా ఉంది');
      reasonsHi.push('तुरंत यात्रा के लिए उपलब्ध');
    } else if (truck.availability === 'UNKNOWN' || !truck.availability) {
      reasonsEn.push('Availability: Unknown (Please call to confirm)');
      reasonsTe.push('లభ్యత: పేర్కొనబడలేదు (ధృవీకరణకు ఫోన్ చేయండి)');
      reasonsHi.push('उपलब्धता: अज्ञात (कृपया पुष्टि हेतु फोन करें)');
    }

    results.push({
      item: truck,
      score,
      distanceKm,
      matchReasonsEn: reasonsEn,
      matchReasonsTe: reasonsTe,
      matchReasonsHi: reasonsHi,
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
