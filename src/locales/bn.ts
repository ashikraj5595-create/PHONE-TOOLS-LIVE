import { LocaleData } from './types';

export const bn: LocaleData = {
  categories: {
    image: {
      name: 'ইমেজ টুলস',
      description: 'ব্রাউজারে সরাসরি ছবি কম্প্রেস, রিসাইজ, ক্রপ এবং কনভার্ট করুন।',
    },
    pdf: {
      name: 'PDF টুলস',
      description: 'ছবি থেকে PDF তৈরি করুন বা PDF থেকে পৃষ্ঠা বের করুন।',
    },
    text: {
      name: 'টেক্সট টুলস',
      description: 'শব্দ গণনা, টেক্সট ক্লিনার এবং কেস কনভার্টার।',
    },
    qr: {
      name: 'QR কোড',
      description: 'ক্যামেরা দিয়ে QR কোড স্ক্যান করুন বা নতুন কোড তৈরি করুন।',
    },
    calculators: {
      name: 'ক্যালকুলেটর',
      description: 'শতাংশ, ডিসকাউন্ট এবং সঠিক বয়স ক্যালকুলেটর।',
    },
    converters: {
      name: 'কনভার্টার',
      description: 'পরিমাপের একক এবং ডিজিটাল ডেটা স্টোরেজ কনভার্টার।',
    },
    security: {
      name: 'সুরক্ষা ও ইউটিলিটি',
      description: 'কোনো ডেটা লিক ছাড়াই অত্যন্ত শক্তিশালী পাসওয়ার্ড তৈরি করুন।',
    },
  },
  tools: {
    'image-compressor': {
      name: 'ইমেজ কম্প্রেসার',
      description: 'ব্রাউজারে সরাসরি JPG, PNG এবং WebP ছবির সাইজ কমিয়ে অপ্টিমাইজ করুন।',
    },
    'image-resizer': {
      name: 'ইমেজ রিসাইজার',
      description: 'অনুপাত ঠিক রেখে ছবির পিক্সেল বা শতাংশ অনুসারে রিসাইজ করুন।',
    },
    'image-cropper': {
      name: 'ইমেজ ক্রপার',
      description: '1:1, 4:5 এবং 16:9 ফ্রেমের সাহায্যে সহজে ছবি ক্রপ করুন।',
    },
    'image-converter': {
      name: 'ইমেজ কনভার্টার',
      description: 'নিজের ডিভাইসেই JPG, PNG এবং WebP ফরম্যাটে রূপান্তর করুন।',
    },
    'image-to-pdf': {
      name: 'ইমেজ থেকে PDF',
      description: 'একাধিক ছবি যুক্ত করে একটি পরিষ্কার PDF ডকুমেন্ট তৈরি করুন।',
    },
    'pdf-to-image': {
      name: 'PDF থেকে ইমেজ',
      description: 'PDF-এর যে কোনো পাতা থেকে স্পষ্ট JPG বা PNG ছবি বের করুন।',
    },
    'text-counter': {
      name: 'টেক্সট কাউন্টার',
      description: 'অক্ষর, শব্দ, বাক্য, প্যারাগ্রাফ ও পড়ার সময়ের তাৎক্ষণিক হিসাব।',
    },
    'text-cleaner': {
      name: 'টেক্সট ক্লিনার',
      description: 'অতিরিক্ত স্পেস ও খালি লাইন সরিয়ে টেক্সট পরিষ্কার করুন।',
    },
    'case-converter': {
      name: 'কেস কনভার্টার',
      description: 'টেক্সটকে UPPERCASE, lowercase, Title Case ইত্যাদিতে রূপান্তর করুন।',
    },
    'qr-scanner': {
      name: 'QR স্ক্যানার',
      description: 'ডিভাইসের ক্যামেরা দিয়ে বা আপলোড করা ছবি থেকে QR স্ক্যান করুন।',
    },
    'qr-generator': {
      name: 'QR জেনারেটর',
      description: 'যে কোনো লিংক, টেক্সট বা ওয়াই-ফাই তথ্যের জন্য QR কোড তৈরি করুন।',
    },
    'percentage-calculator': {
      name: 'শতাংশ ক্যালকুলেটর',
      description: 'Y-এর X%, অনুপাত এবং শতকরা বৃদ্ধি বা হ্রাস হিসাব করুন।',
    },
    'discount-calculator': {
      name: 'ডিসকাউন্ট ক্যালকুলেটর',
      description: 'আসল দাম ও শতকরা ছাড় থেকে চূড়ান্ত মূল্য ও মোট সাশ্রয় বের করুন।',
    },
    'age-calculator': {
      name: 'বয়স ক্যালকুলেটর',
      description: 'জন্মতারিখ থেকে বছর, মাস এবং দিনে নিজের সঠিক বয়স বের করুন।',
    },
    'unit-converter': {
      name: 'ইউনিট কনভার্টার',
      description: 'দৈর্ঘ্য, ওজন, তাপমাত্রা, ক্ষেত্রফল, আয়তন, গতি ও সময়ের একক রূপান্তর করুন।',
    },
    'data-storage-converter': {
      name: 'ডেটা স্টোরেজ কনভার্টার',
      description: 'Bit, Byte, KB, MB, GB, TB ইত্যাদি সঠিক মানে রূপান্তর করুন।',
    },
    'password-generator': {
      name: 'পাসওয়ার্ড জেনারেটর',
      description: 'ইচ্ছেমতো দৈর্ঘ্য ও ক্যারেক্টার দিয়ে শক্তিশালী ও নিরাপদ পাসওয়ার্ড তৈরি করুন।',
    },
  },
  strings: {
    // Navigation
    nav_home: 'হোম',
    nav_all_tools: 'সব টুলস',
    nav_tools: 'টুলস',
    nav_favorites: 'পছন্দের',
    nav_settings: 'সেটিংস',
    search_tools_btn: 'টুলস খুঁজুন',
    search_placeholder: 'যে কোনো টুল খুঁজুন (কম্প্রেসার, pdf, qr, ক্যালকুলেটর, পাসওয়ার্ড)...',
    search_modal_placeholder: 'সব ১৭টি টুলে খুঁজুন (যেমন compress, pdf, qr, password, unit)...',
    no_tools_match: 'কোনো টুল মেলেনি',
    tools_available: 'টুল উপলব্ধ রয়েছে',
    tap_to_open: 'খুলতে ট্যাপ করুন',
    esc: 'Esc',
    theme_title: 'থিম',
    toggle_theme: 'কালার থিম পরিবর্তন করুন',
    home_label: 'PHONE TOOLS হোম',

    // Hero / Home
    privacy_badge: 'গোপনীয়তা প্রথম · ১০০% অন-ডিভাইস',
    app_tagline: 'আপনার প্রতিদিনের ডিজিটাল টুলবক্স। ১৭টি দ্রুত ও নির্ভরযোগ্য টুল যা কোনো তথ্য ট্র্যাকিং ছাড়াই সম্পূর্ণ আপনার ব্রাউজারে চলে।',
    you_may_also_need: 'আপনার এগুলোরও প্রয়োজন হতে পারে',
    recently_used: 'সম্প্রতি ব্যবহৃত',
    clear: 'মুছুন',
    favorite_tools: 'পছন্দের টুলস',
    view_all: 'সব দেখুন',
    all_tools: 'সব টুলস',
    search_results: 'অনুসন্ধানের ফলাফল',
    of_tools: '১৭টি টুলের মধ্যে',
    open_tool: 'টুল খুলুন',
    no_tools_found: 'আপনার অনুসন্ধানের সাথে মেলে এমন কোনো টুল পাওয়া যায়নি।',
    adjust_query: 'অনুসন্ধান বা ক্যাটাগরি ফিল্টার পরিবর্তন করে চেষ্টা করুন।',
    reset_filters: 'ফিল্টার রিসেট করুন',

    // Privacy cards
    zero_server_uploads: 'সার্ভারে কোনো আপলোড নেই',
    zero_server_uploads_desc: 'আপনার ছবি, ডকুমেন্ট ও টেক্সট সম্পূর্ণ আপনার ডিভাইসের মেমোরিতেই থাকে।',
    instant_offline: 'তাৎক্ষণিক অফলাইন প্রসেসিং',
    instant_offline_desc: 'হিসাব-নিকাশ এবং ছবি প্রসেসিং সরাসরি ব্রাউজারের নেটিভ হার্ডওয়্যার এপিআই দিয়ে সম্পন্ন হয়।',
    no_signups: 'কোনো সাইন-আপ বা ট্র্যাকিং নেই',
    no_signups_desc: 'কোনো অ্যাকাউন্ট, ট্র্যাকিং কুকিজ বা লুকানো ফি নেই।',

    // Tools Page
    all_tools_title: 'সব টুলস',
    all_tools_subtitle: 'ক্যাটাগরি অনুযায়ী সাজানো সব ১৭টি অন-ডিভাইস টুল দেখুন।',
    filter_placeholder: 'কিওয়ার্ড দিয়ে ফিল্টার করুন (যেমন compress, pdf, qr, password, unit)...',
    tools_found: 'টুলস পাওয়া গেছে',
    tool_found: 'টুল পাওয়া গেছে',
    all: 'সব',

    // Favorites Page
    favorites_title: 'পছন্দের টুলস',
    favorites_subtitle: 'আপনার প্রিয় টুলগুলোতে দ্রুত প্রবেশ করুন। ব্রাউজারে নিরাপদে সংরক্ষিত।',
    favorite_count_single: 'পছন্দের টুল',
    favorite_count_multi: 'পছন্দের টুলস',
    no_favorites_title: 'এখনো কোনো প্রিয় টুল যোগ করা হয়নি',
    no_favorites_desc: 'যেকোনো টুল কার্ড বা হেডারে হার্ট আইকনে ট্যাপ করে এখানে যুক্ত করুন।',
    browse_all_tools: 'সব টুলস দেখুন',

    // Settings Page
    settings_title: 'সেটিংস ও গোপনীয়তা',
    settings_subtitle: 'অ্যাপের রূপ, ভাষা নির্বাচন, অন-ডিভাইস প্রসেসিং ও লোকাল স্টোরেজ নিয়ন্ত্রণ।',
    appearance: 'থিম ও রূপ',
    appearance_desc: 'লাইট, ডার্ক বা আপনার ডিভাইসের সিস্টেম মোড অনুযায়ী বেছে নিন।',
    theme_light: 'লাইট',
    theme_dark: 'ডার্ক',
    theme_system: 'সিস্টেম',
    language: 'ভাষা (Language)',
    language_desc: 'আপনার পছন্দের ইন্টারফেস ভাষা বেছে নিন।',
    lang_en: 'English',
    lang_hi: 'हिंदी',
    lang_bn: 'বাংলা',
    local_arch_title: 'লোকাল অন-ডিভাইস আর্কিটেকচার',
    local_arch_desc: 'PHONE TOOLS সমস্ত গণনা, ছবি প্রসেসিং, PDF তৈরি, QR স্ক্যান এবং পাসওয়ার্ড জেনারেশন সরাসরি আপনার ব্রাউজারে সম্পাদন করে।',
    privacy_point_1: 'ফাইল কখনোই ইন্টারনেটের মাধ্যমে কোনো বহিরাগত সার্ভারে পাঠানো হয় না',
    privacy_point_2: 'কোনো অ্যাকাউন্ট রেজিস্ট্রেশন, পাসওয়ার্ড বা ব্যক্তিগত তথ্যের প্রয়োজন নেই',
    privacy_point_3: 'ব্যবহারের পরপরই ব্রাউজার মেমোরি ও অবজেক্ট ইউআরএল পরিষ্কার করা হয়',
    privacy_point_4: 'কোনো বিজ্ঞাপন ট্র্যাকিং কোড বা অ্যানালিটিক্স নেই',
    data_mgmt_title: 'ডেটা ম্যানেজমেন্ট',
    data_mgmt_desc: 'শুধুমাত্র প্রয়োজনীয় পছন্দসমূহ (থিম, ভাষা, পছন্দের টুলস, সাম্প্রতিক ইতিহাস) আপনার ব্রাউজারে সংরক্ষিত থাকে।',
    clear_history_title: 'সাম্প্রতিক টুলস মুছুন',
    clear_history_desc: 'আপনার স্থানীয়ভাবে সংরক্ষিত টুলের ইতিহাস মুছে ফেলে।',
    clear_history_btn: 'ইতিহাস মুছুন',
    reset_all_title: 'সব লোকাল ডেটা রিসেট করুন',
    reset_all_desc: 'পছন্দের তালিকা, থিম এবং সাম্প্রতিক ইতিহাস মুছে দেয়।',
    reset_all_btn: 'সব রিসেট করুন',
    web_engine_capabilities: 'ওয়েব ইঞ্জিন সক্ষমতা:',
    web_crypto: 'ওয়েব ক্রিপ্টো:',
    web_share: 'ওয়েব শেয়ার:',
    active: 'সক্রিয়',
    supported: 'সমর্থিত',
    fallback: 'ফলব্যাক',
    download_fallback: 'ডাউনলোড ফলব্যাক',

    // Common Actions & Tool Layout
    download: 'ডাউনলোড করুন',
    copy: 'কপি করুন',
    copied: 'কপি হয়েছে',
    share: 'শেয়ার করুন',
    reset: 'রিসেট করুন',
    reset_tool: 'টুল রিসেট করুন',
    add_to_favorites: 'পছন্দের তালিকায় যোগ করুন',
    remove_from_favorites: 'পছন্দের তালিকা থেকে সরান',
    local_and_private: 'লোকাল ও নিরাপদ',
    browse_file: 'ফাইল বাছুন',
    browse_files: 'ফাইলগুলো বাছুন',
    drop_label: 'ফাইল বাছুন বা এখানে টেনে এনে ড্রপ করুন',
    drop_sublabel: 'সম্পূর্ণ আপনার ডিভাইসে প্রসেস করা হবে',
    back_to_tools: 'সব টুলস',
    tool_not_found: 'টুল পাওয়া যায়নি।',
    view_all_tools: 'সব টুলস দেখুন',

    // Toasts
    toast_copied: 'ক্লিপবোর্ডে কপি হয়েছে!',
    toast_copy_failed: 'ক্লিপবোর্ডে কপি করা যায়নি',
    toast_shared: 'সফলভাবে শেয়ার করা হয়েছে!',
    toast_share_cancelled: 'শেয়ার বাতিল বা ব্যর্থ হয়েছে',
    toast_recent_cleared: 'সাম্প্রতিক টুলস মুছে ফেলা হয়েছে',
    toast_all_cleared: 'সমস্ত লোকাল ডেটা মুছে ফেলা হয়েছে',
    toast_download_started: 'ডাউনলোড শুরু হয়েছে',
    toast_lang_updated: 'ভাষা পরিবর্তিত হয়েছে',
    toast_added_favorite: 'পছন্দের তালিকায় যোগ করা হয়েছে',
    toast_removed_favorite: 'পছন্দের তালিকা থেকে সরানো হয়েছে',

    // 404
    not_found_title: 'পৃষ্ঠা বা টুল পাওয়া যায়নি',
    not_found_desc: 'অনুরোধ করা টুলটি নেই বা সরানো হয়েছে।',
    return_home: 'হোমে ফিরে যান',

    // Quick & Suggested Tools
    quick_tools: 'কুইক টুলস',
    quick_tools_desc: 'আপনার পছন্দের ও সর্বাধিক ব্যবহৃত টুলস',
    suggested_tools: 'প্রস্তাবিত টুলস',
    suggested_tools_desc: 'শুরু করতে নিচের জনপ্রিয় টুলগুলো ব্যবহার করে দেখুন',
    popular_badge: 'জনপ্রিয়',
    clear_search: 'অনুসন্ধান মুছুন',
    quick_access: 'ঝটপট ব্যবহার',
  },
};
