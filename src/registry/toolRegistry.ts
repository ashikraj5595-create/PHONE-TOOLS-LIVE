import { ToolCategory, CategoryMeta, ToolDefinition, Language } from '../types';
import { LOCALES } from '../locales';

export const CATEGORIES: Record<ToolCategory, CategoryMeta> = {
  image: {
    id: 'image',
    name: 'Image Tools',
    description: 'Compress, resize, crop, and convert image formats locally.',
    badgeColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    iconColor: 'text-blue-600 dark:text-blue-400',
    borderAccent: 'border-blue-500/20',
    cardBg: 'bg-white dark:bg-slate-900 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  },
  pdf: {
    id: 'pdf',
    name: 'PDF Tools',
    description: 'Convert images to PDF and extract pages as images right on your device.',
    badgeColor: 'text-rose-600 dark:text-rose-400',
    iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
    iconColor: 'text-rose-600 dark:text-rose-400',
    borderAccent: 'border-rose-500/20',
    cardBg: 'bg-white dark:bg-slate-900 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  },
  text: {
    id: 'text',
    name: 'Text Tools',
    description: 'Word count, character analysis, text cleanup, and case conversion.',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    borderAccent: 'border-emerald-500/20',
    cardBg: 'bg-white dark:bg-slate-900 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  },
  qr: {
    id: 'qr',
    name: 'QR Tools',
    description: 'Scan QR codes using your camera or images, and generate custom QR codes.',
    badgeColor: 'text-indigo-600 dark:text-indigo-400',
    iconBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    borderAccent: 'border-indigo-500/20',
    cardBg: 'bg-white dark:bg-slate-900 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  },
  calculators: {
    id: 'calculators',
    name: 'Calculators',
    description: 'Fast percentage, discount markdown, and precise chronological age calculations.',
    badgeColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    iconColor: 'text-amber-600 dark:text-amber-400',
    borderAccent: 'border-amber-500/20',
    cardBg: 'bg-white dark:bg-slate-900 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  },
  converters: {
    id: 'converters',
    name: 'Converters',
    description: 'Convert physical metric units and accurate decimal/binary digital data storage.',
    badgeColor: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
    iconColor: 'text-teal-600 dark:text-teal-400',
    borderAccent: 'border-teal-500/20',
    cardBg: 'bg-white dark:bg-slate-900 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  },
  security: {
    id: 'security',
    name: 'Security & Utilities',
    description: 'Generate cryptographically strong passwords offline with zero data leakage.',
    badgeColor: 'text-sky-600 dark:text-sky-400',
    iconBg: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
    iconColor: 'text-sky-600 dark:text-sky-400',
    borderAccent: 'border-sky-500/20',
    cardBg: 'bg-white dark:bg-slate-900 border-slate-200/80 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700',
  },
};

export const TOOL_REGISTRY: ToolDefinition[] = [
  // 1. Image Compressor
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    category: 'image',
    description: 'Compress JPG, PNG, and WebP images directly in your browser with live size comparison.',
    icon: 'Minimize2',
    route: '/tools/image-compressor',
    keywords: ['image', 'compress', 'reduce size', 'optimize', 'photo', 'shrink', 'mb', 'kb', 'lossy', 'छवि', 'तस्वीर', 'ছবি'],
  },
  // 2. Image Resizer
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    category: 'image',
    description: 'Change pixel dimensions or scale by percentage with locked aspect ratio.',
    icon: 'Maximize2',
    route: '/tools/image-resizer',
    keywords: ['image', 'resize', 'scale', 'dimensions', 'width', 'height', 'aspect ratio', 'pixels'],
  },
  // 3. Image Cropper
  {
    id: 'image-cropper',
    name: 'Image Cropper',
    category: 'image',
    description: 'Crop photos with touch-friendly handles and standard aspect presets like 1:1, 4:5, and 16:9.',
    icon: 'Crop',
    route: '/tools/image-cropper',
    keywords: ['image', 'crop', 'trim', 'aspect ratio', 'square', 'story', 'portrait', 'landscape'],
  },
  // 4. Image Converter
  {
    id: 'image-converter',
    name: 'Image Converter',
    category: 'image',
    description: 'Convert between JPG, PNG, and WebP formats on-device with transparency handling.',
    icon: 'RefreshCw',
    route: '/tools/image-converter',
    keywords: ['image', 'convert', 'format', 'jpg', 'jpeg', 'png', 'webp', 'transparency'],
  },
  // 5. Image to PDF
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    category: 'pdf',
    description: 'Combine multiple images into a single clean PDF document with orientation control.',
    icon: 'FileText',
    route: '/tools/image-to-pdf',
    keywords: ['pdf', 'images to pdf', 'combine', 'photos to pdf', 'document', 'page', 'album'],
  },
  // 6. PDF to Image
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    category: 'pdf',
    description: 'Render and extract pages from any PDF document into crisp JPG or PNG images.',
    icon: 'Image',
    route: '/tools/pdf-to-image',
    keywords: ['pdf', 'extract', 'pdf to image', 'pages to jpg', 'png', 'export', 'document render'],
  },
  // 7. Text Counter
  {
    id: 'text-counter',
    name: 'Text Counter',
    category: 'text',
    description: 'Real-time statistics for characters, words, sentences, paragraphs, and reading time.',
    icon: 'FileSpreadsheet',
    route: '/tools/text-counter',
    keywords: ['text', 'counter', 'word count', 'character count', 'spaces', 'sentences', 'reading time'],
  },
  // 8. Text Cleaner
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    category: 'text',
    description: 'Clean up text by removing extra spaces, trailing whitespace, and blank lines.',
    icon: 'Sparkles',
    route: '/tools/text-cleaner',
    keywords: ['text', 'clean', 'format', 'trim', 'remove spaces', 'normalize lines', 'whitespace'],
  },
  // 9. Case Converter
  {
    id: 'case-converter',
    name: 'Case Converter',
    category: 'text',
    description: 'Transform text to UPPERCASE, lowercase, Title Case, Sentence case, and tOGGLE cASE.',
    icon: 'Type',
    route: '/tools/case-converter',
    keywords: ['text', 'case', 'uppercase', 'lowercase', 'title case', 'capitalization', 'toggle case'],
  },
  // 10. QR Scanner
  {
    id: 'qr-scanner',
    name: 'QR Scanner',
    category: 'qr',
    description: 'Scan QR codes using your device camera or directly from an uploaded picture.',
    icon: 'ScanLine',
    route: '/tools/qr-scanner',
    keywords: ['qr', 'scanner', 'camera', 'barcode', 'reader', 'decode', 'link', 'url', 'क्यूआर', 'কিউআর', 'स्कैनर', 'স্ক্যানার'],
  },
  // 11. QR Generator
  {
    id: 'qr-generator',
    name: 'QR Generator',
    category: 'qr',
    description: 'Generate high-contrast QR codes from any text, link, or Wi-Fi info with instant download.',
    icon: 'QrCode',
    route: '/tools/qr-generator',
    keywords: ['qr', 'generator', 'create qr', 'barcode maker', 'link to qr', 'download qr', 'क्यूआर', 'কিউআর'],
  },
  // 12. Percentage Calculator
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    category: 'calculators',
    description: 'Calculate X% of Y, what percentage X is of Y, and percentage increase or decrease.',
    icon: 'Percent',
    route: '/tools/percentage-calculator',
    keywords: ['percentage', 'calculator', 'math', 'increase', 'decrease', 'ratio', 'fraction', 'प्रतिशत', 'शतांश'],
  },
  // 13. Discount Calculator
  {
    id: 'discount-calculator',
    name: 'Discount Calculator',
    category: 'calculators',
    description: 'Determine exact savings and final checkout price from original price and discount percentage.',
    icon: 'Tag',
    route: '/tools/discount-calculator',
    keywords: ['discount', 'calculator', 'sale', 'savings', 'price', 'shopping', 'markdown', 'percent off', 'छूट', 'ছাড়'],
  },
  // 14. Age Calculator
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    category: 'calculators',
    description: 'Calculate your exact age in years, months, and days from date of birth.',
    icon: 'Calendar',
    route: '/tools/age-calculator',
    keywords: ['age', 'calculator', 'birthday', 'date of birth', 'years', 'months', 'days', 'time', 'उम्र', 'आयु', 'বয়স'],
  },
  // 15. Unit Converter
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    category: 'converters',
    description: 'Convert between Length, Weight, Temperature, Area, Volume, Speed, and Time units.',
    icon: 'ArrowLeftRight',
    route: '/tools/unit-converter',
    keywords: ['unit', 'converter', 'length', 'weight', 'temperature', 'celsius', 'fahrenheit', 'metric', 'imperial'],
  },
  // 16. Data & Storage Converter
  {
    id: 'data-storage-converter',
    name: 'Data & Storage Converter',
    category: 'converters',
    description: 'Convert Bit, Byte, KB, MB, GB, TB with accurate decimal (1000) and binary (1024) standards.',
    icon: 'HardDrive',
    route: '/tools/data-storage-converter',
    keywords: ['data', 'storage', 'converter', 'bytes', 'kb', 'mb', 'gb', 'tb', 'binary', 'decimal', 'kib'],
  },
  // 17. Password Generator
  {
    id: 'password-generator',
    name: 'Password Generator',
    category: 'security',
    description: 'Create cryptographically strong, random passwords with customizable length and character sets.',
    icon: 'KeyRound',
    route: '/tools/password-generator',
    keywords: ['password', 'generator', 'security', 'crypto', 'random', 'pin', 'strong password', 'safe'],
  },
];

export const POPULAR_TOOL_IDS: readonly string[] = [
  'image-compressor',
  'qr-scanner',
  'password-generator',
  'percentage-calculator',
];

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((tool) => tool.id === id);
}

export function getToolByRoute(route: string): ToolDefinition | undefined {
  return TOOL_REGISTRY.find((tool) => tool.route === route);
}

export function searchTools(query: string, categoryFilter?: ToolCategory | 'all'): ToolDefinition[] {
  const normalized = query.trim().toLowerCase();
  return TOOL_REGISTRY.filter((tool) => {
    if (categoryFilter && categoryFilter !== 'all' && tool.category !== categoryFilter) {
      return false;
    }
    if (!normalized) return true;

    // 1. Direct registry check (English name, description, category, keywords)
    if (
      tool.name.toLowerCase().includes(normalized) ||
      tool.description.toLowerCase().includes(normalized) ||
      CATEGORIES[tool.category].name.toLowerCase().includes(normalized) ||
      tool.keywords.some((k) => k.toLowerCase().includes(normalized))
    ) {
      return true;
    }

    // 2. Multilingual check across English, Hindi, and Bengali translations
    const localeKeys = Object.keys(LOCALES) as Language[];
    for (const locKey of localeKeys) {
      const locale = LOCALES[locKey];
      if (!locale) continue;

      const toolTrans = locale.tools[tool.id];
      if (toolTrans) {
        if (
          toolTrans.name.toLowerCase().includes(normalized) ||
          toolTrans.description.toLowerCase().includes(normalized)
        ) {
          return true;
        }
      }

      const catTrans = locale.categories[tool.category];
      if (catTrans && catTrans.name.toLowerCase().includes(normalized)) {
        return true;
      }
    }

    return false;
  });
}
