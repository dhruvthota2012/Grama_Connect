import * as fs from 'fs';
import * as path from 'path';
import {
  PERSON_CATEGORIES,
  TRACTOR_CATEGORIES,
  HARVESTER_CATEGORIES,
  MINI_TRUCK_CATEGORIES,
} from '../src/data/categories';

interface ManifestEntry {
  en: string;
  te: string;
  hi: string;
}

const manifest: Record<string, ManifestEntry> = {
  // 1. Language Tiles & Guidance
  welcome: {
    en: 'Welcome to GramaConnect.',
    te: 'గ్రామ కనెక్ట్కు స్వాగతం.',
    hi: 'ग्राम कनेक्ट में आपका स्वागत है।',
  },
  lang_selected: {
    en: 'Language selected: English. Welcome to GramaConnect.',
    te: 'భాష ఎంపిక చేయబడింది: తెలుగు. గ్రామకనెక్ట్‌కి స్వాగతం.',
    hi: 'भाषा चुनी गई: हिन्दी। ग्रामकनेक्ट में आपका स्वागत है।',
  },
  lang_en: {
    en: 'English. Tap again to select.',
    te: 'ఇంగ్లీష్. ఎంపిక చేయడానికి మరోసారి నొక్కండి.',
    hi: 'अंग्रेजी। चुनने के लिए दोबारा टैप करें।',
  },
  lang_te: {
    en: 'Telugu. Tap again to select.',
    te: 'తెలుగు. ఎంపిక చేయడానికి మరోసారి నొక్కండి.',
    hi: 'तेलुगु। चुनने के लिए दोबारा टैप करें।',
  },
  lang_hi: {
    en: 'Hindi. Tap again to select.',
    te: 'హిందీ. ఎంపిక చేయడానికి మరోసారి నొక్కండి.',
    hi: 'हिन्दी। चुनने के लिए दोबारा टैप करें।',
  },
  two_tap_hint: {
    en: 'Tap once to hear, tap again to open',
    te: 'తెరిచేందుకు మరోసారి నొక్కండి',
    hi: 'खोलने के लिए दोबारा टैप करें',
  },
  two_tap_open: {
    en: 'Tap again to open',
    te: 'తెరిచేందుకు మరోసారి నొక్కండి',
    hi: 'खोलने के लिए दोबारा टैप करें',
  },
  replay_announcement: {
    en: 'Replay announcement',
    te: 'మళ్ళీ వినండి',
    hi: 'दोबारा सुनें',
  },

  // 2. Step Entrance Announcements
  step_language_select: {
    en: 'Select your language. English, Telugu, or Hindi.',
    te: 'మీ భాషను ఎంచుకోండి. ఇంగ్లీష్, తెలుగు లేదా హిందీ.',
    hi: 'अपनी भाषा चुनें। अंग्रेजी, तेलुगु या हिन्दी।',
  },
  step_home_menu: {
    en: 'Welcome to GramaConnect. Choose an option: looking for work, or need agricultural services.',
    te: 'గ్రామ కనెక్ట్‌కు స్వాగతం. పని కావాలా లేక వ్యవసాయ సేవలు కావాలా? ఒకదాన్ని ఎంచుకోండి.',
    hi: 'ग्राम कनेक्ट में आपका स्वागत है। काम चाहिए या कृषि सेवाएं चाहिए? एक विकल्प चुनें।',
  },
  step_service_select: {
    en: 'Select the agricultural service you need: workers, tractor, harvester, or mini truck.',
    te: 'మీకు అవసరమైన వ్యవసాయ సేవను ఎంచుకోండి: కూలీలు, ట్రాక్టర్, హార్వెస్టర్ లేదా మినీ ట్రక్.',
    hi: 'आवश्यक कृषि सेवा चुनें: श्रमिक, ट्रैक्टर, हार्वेस्टर या मिनी ट्रक परिवहन।',
  },
  step_subcat_person: {
    en: 'Select type of farm work.',
    te: 'కూలీల పని రకాన్ని ఎంచుకోండి.',
    hi: 'कृषि कार्य का प्रकार चुनें।',
  },
  step_subcat_tractor: {
    en: 'Select tractor attachment or service.',
    te: 'ట్రాక్టర్ పరికరం లేదా పనిని ఎంచుకోండి.',
    hi: 'ट्रैक्टर उपकरण या सेवा चुनें।',
  },
  step_subcat_harvester: {
    en: 'Select crop-specific harvester.',
    te: 'పంట కోత హార్వెస్టర్‌ను ఎంచుకోండి.',
    hi: 'फसल कटाई हार्वेस्टर चुनें।',
  },
  step_subcat_mini_truck: {
    en: 'Select transport service type.',
    te: 'రవాణా వాహన రకాన్ని ఎంచుకోండి.',
    hi: 'परिवहन वाहन का प्रकार चुनें।',
  },
  step_provider_hub: {
    en: 'Provider registration hub. Choose to register worker, tractor, harvester, or provider login.',
    te: 'సేవా ప్రదాతల కేంద్రం. కూలీ, ట్రాక్టర్, హార్వెస్టర్ నమోదు లేదా ప్రొవైడర్ లాగిన్ ఎంచుకోండి.',
    hi: 'प्रदाता केंद्र। श्रमिक, ट्रैक्टर, हार्वेस्टर पंजीकरण या प्रदाता लॉगिन चुनें।',
  },
  step_provider_login: {
    en: 'Provider login. Enter your registered 10-digit mobile number.',
    te: 'ప్రొవైడర్ లాగిన్. మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.',
    hi: 'प्रदाता लॉगिन। अपना 10 अंकों का मोबाइल नंबर दर्ज करें।',
  },
  step_worker_reg: {
    en: 'Agricultural worker registration. Select your farm skills, then enter your full name and 10-digit mobile number.',
    te: 'వ్యవసాయ కూలీ నమోదు. మీ పనులను ఎంచుకుని, పూర్తి పేరు మరియు 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.',
    hi: 'कृषि श्रमिक पंजीकरण। अपने कौशल चुनें और पूरा नाम तथा 10 अंकों का मोबाइल नंबर दर्ज करें।',
  },
  step_machinery_reg_tractor: {
    en: 'Tractor daily registration. Select current working attachment and enter contact details.',
    te: 'ట్రాక్టర్ రోజువారీ నమోదు. ప్రస్తుత పని పరికరాన్ని ఎంచుకుని వివరాలు నమోదు చేయండి.',
    hi: 'ट्रैक्टर दैनिक पंजीकरण। वर्तमान कार्य उपकरण चुनें और विवरण दर्ज करें।',
  },
  step_machinery_reg_harvester: {
    en: 'Harvester registration. Select supported crops and enter contact details.',
    te: 'హార్వెస్టర్ నమోదు. పంటలను ఎంచుకుని వివరాలు నమోదు చేయండి.',
    hi: 'हार्वेस्टर पंजीकरण। समर्थित फसलें चुनें और विवरण दर्ज करें।',
  },
  step_machinery_reg_mini_truck: {
    en: 'Mini-truck registration. Choose vehicle configuration and enter contact details.',
    te: 'మినీ ట్రక్ రవాణా నమోదు. వాహన వివరాలు మరియు ఫోన్ నంబర్ నమోదు చేయండి.',
    hi: 'मिनी-ट्रक परिवहन पंजीकरण। वाहन विनिर्देश चुनें और संपर्क विवरण दर्ज करें।',
  },

  // 3. Home Menu Choices (Tap to Speak)
  menu_work: {
    en: 'I am looking for work or offering services',
    te: 'నాకు పని కావాలి లేదా సేవలు అందించడానికి',
    hi: 'मुझे काम चाहिए या सेवाएं प्रदान करनी हैं',
  },
  menu_services: {
    en: 'I need agricultural services',
    te: 'నాకు వ్యవసాయ సేవలు కావాలి',
    hi: 'मुझे कृषि सेवाएं चाहिए',
  },

  // 4. Main Service Categories (Tap to Speak)
  cat_person: {
    en: 'Selected Agricultural Workers. Tap again to choose the specific agricultural work.',
    te: 'వ్యవసాయ కూలీలు ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.',
    hi: 'कृषि मजदूर चुना गया। विशिष्ट कार्य चुनने के लिए दोबारा टैप करें।',
  },
  cat_tractor: {
    en: 'Selected Tractor and Attachments. Tap again to choose the specific agricultural work.',
    te: 'ట్రాక్టర్ మరియు పరికరాలు ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.',
    hi: 'ट्रैक्टर और उपकरण चुना गया। विशिष्ट कार्य चुनने के लिए दोबारा टैप करें।',
  },
  cat_harvester: {
    en: 'Selected Crop Harvesters. Tap again to choose the specific agricultural work.',
    te: 'కోత హార్వెస్టర్ ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.',
    hi: 'फसल कटाई हार्वेस्टर चुना गया। विशिष्ट कार्य चुनने के लिए दोबारा टैप करें।',
  },
  cat_truck: {
    en: 'Selected Mini Truck Transport. Tap again to choose the specific agricultural work.',
    te: 'మినీ ట్రక్ రవాణా ఎంపిక చేయబడింది. రకాన్ని ఎంచుకోవడానికి మరోసారి నొక్కండి.',
    hi: 'मिनी ट्रक परिवहन चुना गया। विशिष्ट कार्य चुनने के लिए दोबारा टैप करें।',
  },

  // 5. Provider Hub Options (Tap to Speak)
  hub_worker: {
    en: 'Register as Agricultural Worker',
    te: 'వ్యవసాయ కూలీగా నమోదు చేసుకోండి',
    hi: 'कृषि मजदूर के रूप में पंजीकरण',
  },
  hub_tractor: {
    en: 'Tractor Daily Registration (Valid Today Only)',
    te: 'ట్రాక్టర్ రోజువారీ నమోదు (ఈ రోజు మాత్రమే)',
    hi: 'ट्रैक्टर दैनिक पंजीकरण (केवल आज के लिए मान्य)',
  },
  hub_harvester: {
    en: 'Register a Crop Harvester',
    te: 'పంట కోత హార్వెస్టర్‌ను నమోదు చేయండి',
    hi: 'फसल हार्वेस्टर पंजीकृत करें',
  },
  hub_truck: {
    en: 'Register a Mini-Truck for Transport',
    te: 'మినీ ట్రక్ రవాణా వాహనాన్ని నమోదు చేయండి',
    hi: 'मिनी ट्रक परिवहन वाहन पंजीकृत करें',
  },
  hub_login: {
    en: 'Provider Login & Account Dashboard',
    te: 'ప్రొవైడర్ లాగిన్ & ఖాతా డ్యాష్‌బోర్డ్',
    hi: 'प्रदाता लॉगिन व खाता डैशबोर्ड',
  },
};

// Add All Subcategories (Person: 16, Tractor: 14, Harvester: 12, Mini Truck: 8)
PERSON_CATEGORIES.forEach((cat) => {
  const key = `subcat_person_${cat.id}`;
  manifest[key] = {
    en: `Selected ${cat.titleEn}. Tap again to view available providers at Rampur Panchayat.`,
    te: `${cat.titleTe} ఎంపిక చేయబడింది. రాంపూర్ పంచాయతీలో అందుబాటులో ఉన్నవారిని చూడటానికి మరోసారి నొక్కండి.`,
    hi: `${cat.titleHi} चुना गया। रामपुर पंचायत में उपलब्ध प्रदाता देखने के लिए दोबारा टैप करें।`,
  };
});

TRACTOR_CATEGORIES.forEach((cat) => {
  const cleanId = cat.id.startsWith('tractor_') ? cat.id : `tractor_${cat.id}`;
  const key = `subcat_${cleanId}`;
  manifest[key] = {
    en: `Selected ${cat.titleEn}. Tap again to view available providers at Rampur Panchayat.`,
    te: `${cat.titleTe} ఎంపిక చేయబడింది. రాంపూర్ పంచాయతీలో అందుబాటులో ఉన్నవారిని చూడటానికి మరోసారి నొక్కండి.`,
    hi: `${cat.titleHi} चुना गया। रामपुर पंचायत में उपलब्ध प्रदाता देखने के लिए दोबारा टैप करें।`,
  };
});

HARVESTER_CATEGORIES.forEach((cat) => {
  const cleanId = cat.id.startsWith('harvester_') ? cat.id : `harvester_${cat.id}`;
  const key = `subcat_${cleanId}`;
  manifest[key] = {
    en: `Selected ${cat.titleEn}. Tap again to view available providers at Rampur Panchayat.`,
    te: `${cat.titleTe} ఎంపిక చేయబడింది. రాంపూర్ పంచాయతీలో అందుబాటులో ఉన్నవారిని చూడటానికి మరోసారి నొక్కండి.`,
    hi: `${cat.titleHi} चुना गया। रामपुर पंचायत में उपलब्ध प्रदाता देखने के लिए दोबारा टैप करें।`,
  };
});

MINI_TRUCK_CATEGORIES.forEach((cat) => {
  const cleanId = cat.id.startsWith('truck_') ? cat.id : `truck_${cat.id}`;
  const key = `subcat_${cleanId}`;
  manifest[key] = {
    en: `Selected ${cat.titleEn}. Tap again to view available providers at Rampur Panchayat.`,
    te: `${cat.titleTe} ఎంపిక చేయబడింది. రాంపూర్ పంచాయతీలో అందుబాటులో ఉన్నవారిని చూడటానికి మరోసారి నొక్కండి.`,
    hi: `${cat.titleHi} चुना गया। रामपुर पंचायत में उपलब्ध प्रदाता देखने के लिए दोबारा टैप करें।`,
  };
});

// Output manifest to scripts/audio-manifest.json
const outputPath = path.join(process.cwd(), 'scripts', 'audio-manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`Generated audio manifest with ${Object.keys(manifest).length} clips at: ${outputPath}`);
