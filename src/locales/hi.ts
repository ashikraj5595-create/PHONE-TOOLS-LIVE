import { LocaleData } from './types';

export const hi: LocaleData = {
  categories: {
    image: {
      name: 'इमेज टूल्स',
      description: 'ब्राउज़र में इमेज कंप्रेस, रीसाइज़, क्रॉप और कन्वर्ट करें।',
    },
    pdf: {
      name: 'PDF टूल्स',
      description: 'फ़ोटो से PDF बनाएं या PDF से पेज निकालें।',
    },
    text: {
      name: 'टेक्स्ट टूल्स',
      description: 'शब्द गणना, टेक्स्ट फ़ॉर्मेटिंग और केस रूपांतरण।',
    },
    qr: {
      name: 'QR कोड्स',
      description: 'कैमरे से QR कोड स्कैन करें या तुरंत नए कोड बनाएं।',
    },
    calculators: {
      name: 'कैलकुलेटर',
      description: 'प्रतिशत, डिस्काउंट और सटीक उम्र कैलकुलेटर।',
    },
    converters: {
      name: 'कन्वर्टर्स',
      description: 'सटीक यूनिट मापक और डिजिटल डेटा स्टोरेज कन्वर्टर।',
    },
    security: {
      name: 'सुरक्षा और यूटिलिटी',
      description: 'बिना किसी डेटा लीक के सुरक्षित और मजबूत पासवर्ड बनाएं।',
    },
  },
  tools: {
    'image-compressor': {
      name: 'इमेज कंप्रेसर',
      description: 'ब्राउज़र में सीधे JPG, PNG और WebP इमेज का साइज़ घटाएं।',
    },
    'image-resizer': {
      name: 'इमेज रीसाइज़र',
      description: 'पहलू अनुपात बनाए रखकर पिक्सल या प्रतिशत में इमेज रीसाइज़ करें।',
    },
    'image-cropper': {
      name: 'इमेज क्रॉपर',
      description: '1:1, 4:5 और 16:9 जैसे मानक आस्पेक्ट रेशियो के साथ फ़ोटो क्रॉप करें।',
    },
    'image-converter': {
      name: 'इमेज कन्वर्टर',
      description: 'डिवाइस पर ही JPG, PNG और WebP फ़ॉर्मेट में परस्पर रूपांतरण करें।',
    },
    'image-to-pdf': {
      name: 'इमेज से PDF',
      description: 'कई फ़ोटो को मिलाकर एक व्यवस्थित PDF दस्तावेज़ तैयार करें।',
    },
    'pdf-to-image': {
      name: 'PDF से इमेज',
      description: 'PDF के किसी भी पेज को साफ़ JPG या PNG इमेज में बदलें।',
    },
    'text-counter': {
      name: 'टेक्स्ट काउंटर',
      description: 'अक्षर, शब्द, वाक्य, पैराग्राफ और अनुमानित पढ़ने के समय की तुरंत गिनती।',
    },
    'text-cleaner': {
      name: 'टेक्स्ट क्लीनर',
      description: 'अतिरिक्त स्पेस, ट्रेलिंग स्पेस और खाली लाइनें हटाकर टेक्स्ट साफ़ करें।',
    },
    'case-converter': {
      name: 'केस कन्वर्टर',
      description: 'टेक्स्ट को UPPERCASE, lowercase, Title Case और Sentence case में बदलें।',
    },
    'qr-scanner': {
      name: 'QR स्कैनर',
      description: 'डिवाइस के कैमरे से या अपलोड की गई फ़ोटो से सीधे QR कोड स्कैन करें।',
    },
    'qr-generator': {
      name: 'QR जनरेटर',
      description: 'किसी भी लिंक, टेक्स्ट या वाई-फ़ाई जानकारी के लिए QR कोड बनाएं और डाउनलोड करें।',
    },
    'percentage-calculator': {
      name: 'प्रतिशत कैलकुलेटर',
      description: 'Y का X%, प्रतिशत अनुपात और प्रतिशत वृद्धि/कमी की गणना करें।',
    },
    'discount-calculator': {
      name: 'डिस्काउंट कैलकुलेटर',
      description: 'मूल कीमत और छूट प्रतिशत से अंतिम कीमत और कुल बचत जानें।',
    },
    'age-calculator': {
      name: 'आयु कैलकुलेटर',
      description: 'जन्मतिथि से वर्ष, महीने और दिन में अपनी सटीक आयु की गणना करें।',
    },
    'unit-converter': {
      name: 'यूनिट कन्वर्टर',
      description: 'लंबाई, वज़न, तापमान, क्षेत्रफल, आयतन, गति और समय की इकाइयां बदलें।',
    },
    'data-storage-converter': {
      name: 'डेटा स्टोरेज कन्वर्टर',
      description: 'Bit, Byte, KB, MB, GB, TB को सटीक दशमलव व बाइनरी मानकों में बदलें।',
    },
    'password-generator': {
      name: 'पासवर्ड जनरेटर',
      description: 'अपनी पसंद के अनुसार बेहद मजबूत और सुरक्षित यादृच्छिक पासवर्ड बनाएं।',
    },
  },
  strings: {
    // Navigation
    nav_home: 'होम',
    nav_all_tools: 'सभी टूल्स',
    nav_tools: 'टूल्स',
    nav_favorites: 'पसंदीदा',
    nav_settings: 'सेटिंग्स',
    search_tools_btn: 'टूल्स खोजें',
    search_placeholder: 'कोई भी टूल खोजें (कंप्रेसर, pdf, qr, कैलकुलेटर, पासवर्ड)...',
    search_modal_placeholder: 'सभी 17 टूल्स में खोजें (जैसे compress, pdf, qr, password, unit)...',
    no_tools_match: 'कोई टूल नहीं मिला',
    tools_available: 'टूल्स उपलब्ध हैं',
    tap_to_open: 'खोलने के लिए टैप करें',
    esc: 'Esc',
    theme_title: 'थीम',
    toggle_theme: 'कलर थीम बदलें',
    home_label: 'PHONE TOOLS होम',

    // Hero / Home
    privacy_badge: 'गोपनीयता-प्रथम · 100% ऑन-डिवाइस',
    app_tagline: 'आपका रोज़मर्रा का डिजिटल टूलबॉक्स। 17 तेज़ और भरोसेमंद टूल्स जो बिना किसी डेटा ट्रैकिंग के पूरी तरह आपके ब्राउज़र में चलते हैं।',
    recently_used: 'हाल ही में उपयोग किए गए',
    clear: 'हटाएं',
    favorite_tools: 'पसंदीदा टूल्स',
    view_all: 'सभी देखें',
    all_tools: 'सभी टूल्स',
    search_results: 'खोज परिणाम',
    of_tools: '17 टूल्स में से',
    open_tool: 'टूल खोलें',
    no_tools_found: 'आपकी खोज से मेल खाता कोई टूल नहीं मिला।',
    adjust_query: 'अपनी खोज या श्रेणी फ़िल्टर बदलकर पुनः प्रयास करें।',
    reset_filters: 'फ़िल्टर रीसेट करें',

    // Privacy cards
    zero_server_uploads: 'सर्वर पर कोई अपलोड नहीं',
    zero_server_uploads_desc: 'आपकी इमेज, दस्तावेज़ और टेक्स्ट पूरी तरह आपके डिवाइस की मेमोरी में सुरक्षित रहते हैं।',
    instant_offline: 'तुरंत ऑफ़लाइन प्रोसेसिंग',
    instant_offline_desc: 'गणना और इमेज प्रोसेसिंग सीधे ब्राउज़र के नेटिव हार्डवेयर API द्वारा की जाती है।',
    no_signups: 'कोई साइन-अप या ट्रैकिंग नहीं',
    no_signups_desc: 'कोई अकाउंट नहीं, कोई टेलीमेट्री नहीं, कोई कुकीज़ नहीं और कोई शुल्क नहीं।',

    // Tools Page
    all_tools_title: 'सभी टूल्स',
    all_tools_subtitle: 'श्रेणी के अनुसार समूहीकृत सभी 17 ऑन-डिवाइस टूल्स देखें।',
    filter_placeholder: 'कीवर्ड से टूल्स फ़िल्टर करें (जैसे compress, pdf, qr, password, unit)...',
    tools_found: 'टूल्स मिले',
    tool_found: 'टूल मिला',
    all: 'सभी',

    // Favorites Page
    favorites_title: 'पसंदीदा टूल्स',
    favorites_subtitle: 'अपने पसंदीदा रोज़मर्रा के टूल्स तक तुरंत पहुंचें। आपके ब्राउज़र में सुरक्षित रूप से सहेजे गए।',
    favorite_count_single: 'पसंदीदा टूल',
    favorite_count_multi: 'पसंदीदा टूल्स',
    no_favorites_title: 'अभी तक कोई पसंदीदा टूल नहीं जोड़ा गया',
    no_favorites_desc: 'किसी भी टूल कार्ड या हेडर पर दिल के आइकन पर टैप करके उसे यहाँ पिन करें।',
    browse_all_tools: 'सभी टूल्स देखें',

    // Settings Page
    settings_title: 'सेटिंग्स और गोपनीयता',
    settings_subtitle: 'ऐप का रूप, भाषा चयन, डिवाइस प्रोसेसिंग पारदर्शिता और लोकल स्टोरेज नियंत्रण।',
    appearance: 'थीम व रूप-रंग',
    appearance_desc: 'लाइट, डार्क या अपने डिवाइस के सिस्टम मोड के अनुसार चुनें।',
    theme_light: 'लाइट',
    theme_dark: 'डार्क',
    theme_system: 'सिस्टम',
    language: 'भाषा (Language)',
    language_desc: 'अपनी पसंदीदा इंटरफ़ेस भाषा चुनें।',
    lang_en: 'English',
    lang_hi: 'हिंदी',
    lang_bn: 'বাংলা',
    local_arch_title: 'लोकल ऑन-डिवाइस आर्किटेक्चर',
    local_arch_desc: 'PHONE TOOLS सभी गणनाएं, इमेज प्रोसेसिंग, PDF निर्माण, QR स्कैनिंग और पासवर्ड निर्माण सीधे आपके ब्राउज़र में करता है।',
    privacy_point_1: 'फ़ाइलें कभी भी इंटरनेट के ज़रिए किसी बाहरी सर्वर पर नहीं भेजी जातीं',
    privacy_point_2: 'किसी अकाउंट रजिस्ट्रेशन, पासवर्ड या व्यक्तिगत प्रोफ़ाइल की आवश्यकता नहीं है',
    privacy_point_3: 'उपयोग के तुरंत बाद ब्राउज़र मेमोरी और ऑब्जेक्ट URL साफ़ कर दिए जाते हैं',
    privacy_point_4: 'शून्य विज्ञापन ट्रैकिंग कोड, टेलीमेट्री या कोई ट्रैकिंग एनालिटिक्स नहीं',
    data_mgmt_title: 'डेटा प्रबंधन',
    data_mgmt_desc: 'केवल उपयोगी प्राथमिकताएं (थीम, भाषा, पसंदीदा टूल्स, हालिया इतिहास) आपके ब्राउज़र में स्थानीय रूप से सहेजी जाती हैं।',
    clear_history_title: 'हालिया टूल्स हटाएं',
    clear_history_desc: 'आपके स्थानीय रूप से सहेजे गए टूल इतिहास को हटाता है।',
    clear_history_btn: 'इतिहास हटाएं',
    reset_all_title: 'सभी लोकल डेटा रीसेट करें',
    reset_all_desc: 'पसंदीदा, थीम चयन और हालिया इतिहास सभी को साफ़ करता है।',
    reset_all_btn: 'सब रीसेट करें',
    web_engine_capabilities: 'वेब इंजन क्षमताएं:',
    web_crypto: 'वेब क्रिप्टो:',
    web_share: 'वेब शेयर:',
    active: 'सक्रिय',
    supported: 'समर्थित',
    fallback: 'फ़ॉलबैक',
    download_fallback: 'डाउनलोड फ़ॉलबैक',

    // Common Actions & Tool Layout
    download: 'डाउनलोड करें',
    copy: 'कॉपी करें',
    copied: 'कॉपी हो गया',
    share: 'शेयर करें',
    reset: 'रीसेट करें',
    reset_tool: 'टूल रीसेट करें',
    add_to_favorites: 'पसंदीदा में जोड़ें',
    remove_from_favorites: 'पसंदीदा से हटाएं',
    local_and_private: 'लोकल और सुरक्षित',
    browse_file: 'फ़ाइल चुनें',
    browse_files: 'फ़ाइलें चुनें',
    drop_label: 'फ़ाइल चुनें या यहाँ खींचकर छोड़ें',
    drop_sublabel: 'पूरी तरह से आपके डिवाइस पर प्रोसेस किया जाएगा',
    back_to_tools: 'सभी टूल्स',
    tool_not_found: 'टूल नहीं मिला।',
    view_all_tools: 'सभी टूल्स देखें',

    // Toasts
    toast_copied: 'क्लिपबोर्ड पर कॉपी हो गया!',
    toast_copy_failed: 'क्लिपबोर्ड पर कॉपी नहीं हो सका',
    toast_shared: 'सफलतापूर्वक शेयर किया गया!',
    toast_share_cancelled: 'शेयर रद्द या विफल हो गया',
    toast_recent_cleared: 'हालिया टूल्स हटा दिए गए',
    toast_all_cleared: 'सभी लोकल डेटा साफ़ कर दिया गया',
    toast_download_started: 'डाउनलोड शुरू हो गया',
    toast_lang_updated: 'भाषा बदल दी गई',
    toast_added_favorite: 'पसंदीदा में जोड़ा गया',
    toast_removed_favorite: 'पसंदीदा से हटाया गया',

    // 404
    not_found_title: 'पेज या टूल नहीं मिला',
    not_found_desc: 'अनुरोधित टूल मौजूद नहीं है या हटा दिया गया है।',
    return_home: 'होम पर लौटें',

    // Quick & Suggested Tools
    quick_tools: 'क्विक टूल्स',
    quick_tools_desc: 'आपके पसंदीदा और सबसे ज्यादा उपयोग किए जाने वाले टूल्स',
    suggested_tools: 'सुझाए गए टूल्स',
    suggested_tools_desc: 'शुरू करने के लिए नीचे दिए गए लोकप्रिय टूल्स में से चुनें',
    popular_badge: 'लोकप्रिय',
    clear_search: 'खोज साफ़ करें',
    quick_access: 'त्वरित पहुंच',
  },
};
