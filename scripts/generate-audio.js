import fs from 'fs';
import path from 'path';

const phrases = [
  // 1. Test phrases
  { lang: 'en', filename: 'welcome.mp3', text: 'Welcome to GramaConnect.' },
  { lang: 'te', filename: 'welcome.mp3', text: 'గ్రామ కనెక్ట్కు స్వాగతం.' },
  { lang: 'hi', filename: 'welcome.mp3', text: 'ग्राम कनेक्ट में आपका स्वागत है।' },

  // 2. Language selection confirmation
  { lang: 'en', filename: 'lang_selected.mp3', text: 'Language selected: English. Welcome to GramaConnect.' },
  { lang: 'te', filename: 'lang_selected.mp3', text: 'భాష ఎంపిక చేయబడింది: తెలుగు. గ్రామకనెక్ట్‌కి స్వాగతం.' },
  { lang: 'hi', filename: 'lang_selected.mp3', text: 'भाषा चुनी गई: हिन्दी। ग्रामकनेक्ट में आपका स्वागत है।' },

  // 3. Home menu options
  { lang: 'en', filename: 'menu_work.mp3', text: 'I am looking for work or registering machinery' },
  { lang: 'en', filename: 'menu_services.mp3', text: 'I need agricultural services. Workers, tractor, harvester, or transport' },
  { lang: 'en', filename: 'two_tap_hint.mp3', text: 'Tap again to open' },

  { lang: 'te', filename: 'menu_work.mp3', text: 'నాకు పని కావాలి లేదా యంత్రాలను నమోదు చేయాలి' },
  { lang: 'te', filename: 'menu_services.mp3', text: 'నాకు వ్యవసాయ సేవలు కావాలి. కూలీలు, ట్రాక్టర్, హార్వెస్టర్ మరియు రవాణా' },
  { lang: 'te', filename: 'two_tap_hint.mp3', text: 'తెరిచేందుకు మరోసారి నొక్కండి' },

  { lang: 'hi', filename: 'menu_work.mp3', text: 'मुझे काम चाहिए या मशीनरी पंजीकृत करनी है' },
  { lang: 'hi', filename: 'menu_services.mp3', text: 'मुझे कृषि सेवाएं चाहिए। श्रमिक, ट्रैक्टर, हार्वेस्टर या परिवहन' },
  { lang: 'hi', filename: 'two_tap_hint.mp3', text: 'खोलने के लिए दोबारा टैप करें' },

  // 4. 4 Main Services
  { lang: 'te', filename: 'cat_person.mp3', text: 'వ్యవసాయ కూలీలు. విత్తనాలు, నాట్లు, కలుపు మరియు కోత పనులకు కూలీలు' },
  { lang: 'te', filename: 'cat_tractor.mp3', text: 'ట్రాక్టర్ మరియు వ్యవసాయ పరికరాలు. నాగలి, రోటవేటర్, గొర్రు మరియు ట్రాలీ' },
  { lang: 'te', filename: 'cat_harvester.mp3', text: 'పంట కోత హార్వెస్టర్ సేవలు. వరి, మొక్కజొన్న మరియు గోధుమ కోత యంత్రాలు' },
  { lang: 'te', filename: 'cat_truck.mp3', text: 'మినీ ట్రక్ రవాణా. మార్కెట్ లేదా మిల్లుకు పంట ఉత్పత్తుల రవాణా' },

  // 5. Provider Hub options
  { lang: 'te', filename: 'hub_worker.mp3', text: 'వ్యవసాయ కూలీగా నమోదు చేసుకోండి' },
  { lang: 'te', filename: 'hub_tractor.mp3', text: 'మీ ట్రాక్టర్ వివరాలను నమోదు చేయండి' },
  { lang: 'te', filename: 'hub_harvester.mp3', text: 'హార్వెస్టర్ సేవలను నమోదు చేయండి' },
  { lang: 'te', filename: 'hub_truck.mp3', text: 'మినీ ట్రక్ రవాణా సేవలను నమోదు చేయండి' },
];

async function generateAll() {
  console.log('Generating pre-recorded audio assets...');
  
  for (const item of phrases) {
    const dir = path.join(process.cwd(), 'public', 'audio', item.lang);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const targetFile = path.join(dir, item.filename);
    console.log(`[${item.lang}] Generating "${item.text}" -> ${item.filename}`);

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${item.lang}&client=tw-ob&q=${encodeURIComponent(item.text)}`;

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://translate.google.com/',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(targetFile, buffer);
      console.log(`  -> Saved ${buffer.length} bytes to ${targetFile}`);
    } catch (err) {
      console.error(`  -> Failed to generate ${item.filename}:`, err);
    }
  }

  console.log('\nAll audio files generated successfully.');
}

generateAll();
