import { LocaleData } from './types';

export const en: LocaleData = {
  categories: {
    image: {
      name: 'Image Tools',
      description: 'Compress, resize, crop, and convert images locally.',
    },
    pdf: {
      name: 'PDF Tools',
      description: 'Combine photos into PDF or extract pages into crisp images.',
    },
    text: {
      name: 'Text Tools',
      description: 'Word counter, text formatting, and capitalization converters.',
    },
    qr: {
      name: 'QR Codes',
      description: 'Scan barcodes & QR codes with camera or create custom codes.',
    },
    calculators: {
      name: 'Calculators',
      description: 'Quick percentage, sales discount, and precise age calculators.',
    },
    converters: {
      name: 'Converters',
      description: 'Accurate unit measurements and digital data storage converters.',
    },
    security: {
      name: 'Security & Utilities',
      description: 'Generate cryptographically strong passwords offline with zero data leakage.',
    },
  },
  tools: {
    'image-compressor': {
      name: 'Image Compressor',
      description: 'Compress JPG, PNG, and WebP images directly in your browser with live size comparison.',
    },
    'image-resizer': {
      name: 'Image Resizer',
      description: 'Change pixel dimensions or scale by percentage with locked aspect ratio.',
    },
    'image-cropper': {
      name: 'Image Cropper',
      description: 'Crop photos with touch-friendly handles and standard aspect presets like 1:1, 4:5, and 16:9.',
    },
    'image-converter': {
      name: 'Image Converter',
      description: 'Convert between JPG, PNG, and WebP formats on-device with transparency handling.',
    },
    'image-to-pdf': {
      name: 'Image to PDF',
      description: 'Combine multiple images into a single clean PDF document with orientation control.',
    },
    'pdf-to-image': {
      name: 'PDF to Image',
      description: 'Render and extract pages from any PDF document into crisp JPG or PNG images.',
    },
    'text-counter': {
      name: 'Text Counter',
      description: 'Real-time statistics for characters, words, sentences, paragraphs, and reading time.',
    },
    'text-cleaner': {
      name: 'Text Cleaner',
      description: 'Clean up text by removing extra spaces, trailing whitespace, and blank lines.',
    },
    'case-converter': {
      name: 'Case Converter',
      description: 'Transform text to UPPERCASE, lowercase, Title Case, Sentence case, and tOGGLE cASE.',
    },
    'qr-scanner': {
      name: 'QR Scanner',
      description: 'Scan QR codes using your device camera or directly from an uploaded picture.',
    },
    'qr-generator': {
      name: 'QR Generator',
      description: 'Generate high-contrast QR codes from any text, link, or Wi-Fi info with instant download.',
    },
    'percentage-calculator': {
      name: 'Percentage Calculator',
      description: 'Calculate X% of Y, what percentage X is of Y, and percentage increase or decrease.',
    },
    'discount-calculator': {
      name: 'Discount Calculator',
      description: 'Determine exact savings and final checkout price from original price and discount percentage.',
    },
    'age-calculator': {
      name: 'Age Calculator',
      description: 'Calculate your exact age in years, months, and days from date of birth.',
    },
    'unit-converter': {
      name: 'Unit Converter',
      description: 'Convert between Length, Weight, Temperature, Area, Volume, Speed, and Time units.',
    },
    'data-storage-converter': {
      name: 'Data & Storage Converter',
      description: 'Convert Bit, Byte, KB, MB, GB, TB with accurate decimal (1000) and binary (1024) standards.',
    },
    'password-generator': {
      name: 'Password Generator',
      description: 'Create cryptographically strong, random passwords with customizable length and character sets.',
    },
  },
  strings: {
    // Navigation
    nav_home: 'Home',
    nav_all_tools: 'All Tools',
    nav_tools: 'Tools',
    nav_favorites: 'Favorites',
    nav_settings: 'Settings',
    search_tools_btn: 'Search tools',
    search_placeholder: 'Find any tool (compressor, pdf, qr, calc, unit, password)...',
    search_modal_placeholder: 'Search all 17 tools (e.g. compress, pdf, qr, password, unit)...',
    no_tools_match: 'No tools match',
    tools_available: 'tools available',
    tap_to_open: 'Tap to open',
    esc: 'Esc',
    theme_title: 'Theme',
    toggle_theme: 'Toggle color theme',
    home_label: 'PHONE TOOLS Home',

    // Hero / Home
    privacy_badge: 'Privacy-First · 100% Client-Side',
    app_tagline: 'Your everyday digital toolbox. 17 fast, reliable utilities that run entirely inside your browser with zero data tracking.',
    you_may_also_need: 'You may also need',
    recently_used: 'Recently Used',
    clear: 'Clear',
    favorite_tools: 'Favorite Tools',
    view_all: 'View all',
    all_tools: 'All Tools',
    search_results: 'Search Results',
    of_tools: 'of 17 tools',
    open_tool: 'Open tool',
    no_tools_found: 'No tools found matching your search.',
    adjust_query: 'Try adjusting your query or category filter.',
    reset_filters: 'Reset Filters',

    // Privacy cards
    zero_server_uploads: 'Zero Server Uploads',
    zero_server_uploads_desc: "Your images, documents, and texts stay strictly inside your device's memory.",
    instant_offline: 'Instant Offline Processing',
    instant_offline_desc: 'Calculations and image compressions run directly using native browser hardware APIs.',
    no_signups: 'No Signups or Tracking',
    no_signups_desc: 'No accounts, no telemetry, no tracking cookies, and no payment walls.',

    // Tools Page
    all_tools_title: 'All Tools',
    all_tools_subtitle: 'Explore all 17 on-device utilities grouped by category.',
    filter_placeholder: 'Filter tools by keyword (e.g. compress, pdf, qr, password, unit)...',
    tools_found: 'Tools Found',
    tool_found: 'Tool Found',
    all: 'All',

    // Favorites Page
    favorites_title: 'Favorite Tools',
    favorites_subtitle: 'Quickly access your starred everyday utilities. Stored safely in your browser.',
    favorite_count_single: 'favorite tool',
    favorite_count_multi: 'favorite tools',
    no_favorites_title: 'No favorites saved yet',
    no_favorites_desc: 'Tap the heart icon on any tool card or tool header to pin it here for instant one-handed access.',
    browse_all_tools: 'Browse All Tools',

    // Settings Page
    settings_title: 'Settings & Privacy',
    settings_subtitle: 'App appearance, language selection, device processing transparency, and local storage controls.',
    appearance: 'Appearance',
    appearance_desc: "Choose light, dark, or sync with your device's system mode.",
    theme_light: 'Light',
    theme_dark: 'Dark',
    theme_system: 'System',
    language: 'Language',
    language_desc: 'Choose your preferred user interface language.',
    lang_en: 'English',
    lang_hi: 'हिंदी',
    lang_bn: 'বাংলা',
    local_arch_title: 'Local On-Device Architecture',
    local_arch_desc: 'PHONE TOOLS executes calculations, image processing, PDF compilation, QR scanning, and cryptography directly in your browser.',
    privacy_point_1: 'Files are never sent across the internet to any external server',
    privacy_point_2: 'No account registration, passwords, or personal profiles required',
    privacy_point_3: 'Browser memory and object URLs are immediately purged after use',
    privacy_point_4: 'Zero advertising tracking code, telemetry, or invasive analytics',
    data_mgmt_title: 'Data Management',
    data_mgmt_desc: 'Only harmless user preferences (theme, language, favorites, recent tools) are stored locally in your browser.',
    clear_history_title: 'Clear Recent Tools',
    clear_history_desc: 'Wipes your locally stored tool history.',
    clear_history_btn: 'Clear History',
    reset_all_title: 'Reset All Local Data',
    reset_all_desc: 'Clears favorites, theme selection, and recents.',
    reset_all_btn: 'Reset All',
    web_engine_capabilities: 'Web Engine Capabilities:',
    web_crypto: 'Web Crypto:',
    web_share: 'Web Share:',
    active: 'Active',
    supported: 'Supported',
    fallback: 'Fallback',
    download_fallback: 'Download Fallback',

    // Common Actions & Tool Layout
    download: 'Download',
    copy: 'Copy',
    copied: 'Copied',
    share: 'Share',
    reset: 'Reset',
    reset_tool: 'Reset tool',
    add_to_favorites: 'Add to favorites',
    remove_from_favorites: 'Remove from favorites',
    local_and_private: 'Local & Private',
    browse_file: 'Browse File',
    browse_files: 'Browse Files',
    drop_label: 'Choose a file or drag & drop here',
    drop_sublabel: 'Processed entirely on your device',
    back_to_tools: 'All Tools',
    tool_not_found: 'Tool not found.',
    view_all_tools: 'View all tools',

    // Toasts
    toast_copied: 'Copied to clipboard!',
    toast_copy_failed: 'Could not copy to clipboard',
    toast_shared: 'Shared successfully!',
    toast_share_cancelled: 'Sharing cancelled or failed',
    toast_recent_cleared: 'Recent tools cleared',
    toast_all_cleared: 'All local data cleared',
    toast_download_started: 'Download started',
    toast_lang_updated: 'Language updated',
    toast_added_favorite: 'Added to favorites',
    toast_removed_favorite: 'Removed from favorites',

    // 404
    not_found_title: 'Page or Tool Not Found',
    not_found_desc: 'The requested utility does not exist or has been moved.',
    return_home: 'Return to Home',

    // Quick & Suggested Tools
    quick_tools: 'Quick Tools',
    quick_tools_desc: 'Instant access to your favorite and most accessed utilities',
    suggested_tools: 'Suggested Tools',
    suggested_tools_desc: 'Try one of our popular tools below to get started',
    popular_badge: 'Popular',
    clear_search: 'Clear search',
    quick_access: 'Quick Access',
  },
};
