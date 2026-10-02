import React, { useEffect, useState, Suspense, lazy } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { WelcomeSplash } from './components/common/WelcomeSplash';
import { getToolByRoute } from './registry/toolRegistry';

// Core Pages (Eagerly loaded for instant navigation)
import { HomePage } from './features/home/HomePage';
import { ToolsPage } from './features/tools/ToolsPage';
import { FavoritesPage } from './features/favorites/FavoritesPage';
import { SettingsPage } from './features/settings/SettingsPage';

// Lazy-loaded Tool Modules for optimal bundle performance and Core Web Vitals
// 1-4. Image Tools
const ImageCompressor = lazy(() => import('./features/tools/image/ImageCompressor').then(m => ({ default: m.ImageCompressor })));
const ImageResizer = lazy(() => import('./features/tools/image/ImageResizer').then(m => ({ default: m.ImageResizer })));
const ImageCropper = lazy(() => import('./features/tools/image/ImageCropper').then(m => ({ default: m.ImageCropper })));
const ImageConverter = lazy(() => import('./features/tools/image/ImageConverter').then(m => ({ default: m.ImageConverter })));

// 5-6. PDF Tools (Heavy PDF.js/jspdf libraries loaded strictly on demand)
const ImageToPdf = lazy(() => import('./features/tools/pdf/ImageToPdf').then(m => ({ default: m.ImageToPdf })));
const PdfToImage = lazy(() => import('./features/tools/pdf/PdfToImage').then(m => ({ default: m.PdfToImage })));

// 7-9. Text Tools
const TextCounter = lazy(() => import('./features/tools/text/TextCounter').then(m => ({ default: m.TextCounter })));
const TextCleaner = lazy(() => import('./features/tools/text/TextCleaner').then(m => ({ default: m.TextCleaner })));
const CaseConverter = lazy(() => import('./features/tools/text/CaseConverter').then(m => ({ default: m.CaseConverter })));

// 10-11. QR Tools
const QrScanner = lazy(() => import('./features/tools/qr/QrScanner').then(m => ({ default: m.QrScanner })));
const QrGenerator = lazy(() => import('./features/tools/qr/QrGenerator').then(m => ({ default: m.QrGenerator })));

// 12-14. Calculators
const PercentageCalculator = lazy(() => import('./features/tools/calculators/PercentageCalculator').then(m => ({ default: m.PercentageCalculator })));
const DiscountCalculator = lazy(() => import('./features/tools/calculators/DiscountCalculator').then(m => ({ default: m.DiscountCalculator })));
const AgeCalculator = lazy(() => import('./features/tools/calculators/AgeCalculator').then(m => ({ default: m.AgeCalculator })));

// 15-16. Converters
const UnitConverter = lazy(() => import('./features/tools/converters/UnitConverter').then(m => ({ default: m.UnitConverter })));
const DataStorageConverter = lazy(() => import('./features/tools/converters/DataStorageConverter').then(m => ({ default: m.DataStorageConverter })));

// 17. Security
const PasswordGenerator = lazy(() => import('./features/tools/security/PasswordGenerator').then(m => ({ default: m.PasswordGenerator })));

const MainRouter: React.FC = () => {
  const { currentPath, navigate } = useApp();
  const { t, tTool } = useLanguage();

  // Dynamically update document title based on current tool/page & language
  useEffect(() => {
    const tool = getToolByRoute(currentPath);
    if (tool) {
      document.title = `${tTool(tool).name} — PHONE TOOLS`;
    } else if (currentPath === '/tools') {
      document.title = `${t('all_tools_title')} — PHONE TOOLS`;
    } else if (currentPath === '/favorites') {
      document.title = `${t('favorites_title')} — PHONE TOOLS`;
    } else if (currentPath === '/settings') {
      document.title = `${t('nav_settings')} — PHONE TOOLS`;
    } else {
      document.title = 'PHONE TOOLS — Your everyday digital toolbox';
    }
  }, [currentPath, t, tTool]);

  // Route matching
  const renderCurrentView = () => {
    switch (currentPath) {
      case '/':
        return <HomePage />;
      case '/tools':
        return <ToolsPage />;
      case '/favorites':
        return <FavoritesPage />;
      case '/settings':
        return <SettingsPage />;

      // 1. Image Compressor
      case '/tools/image-compressor':
        return <ImageCompressor />;
      // 2. Image Resizer
      case '/tools/image-resizer':
        return <ImageResizer />;
      // 3. Image Cropper
      case '/tools/image-cropper':
        return <ImageCropper />;
      // 4. Image Converter
      case '/tools/image-converter':
        return <ImageConverter />;

      // 5. Image to PDF
      case '/tools/image-to-pdf':
        return <ImageToPdf />;
      // 6. PDF to Image
      case '/tools/pdf-to-image':
        return <PdfToImage />;

      // 7. Text Counter
      case '/tools/text-counter':
        return <TextCounter />;
      // 8. Text Cleaner
      case '/tools/text-cleaner':
        return <TextCleaner />;
      // 9. Case Converter
      case '/tools/case-converter':
        return <CaseConverter />;

      // 10. QR Scanner
      case '/tools/qr-scanner':
        return <QrScanner />;
      // 11. QR Generator
      case '/tools/qr-generator':
        return <QrGenerator />;

      // 12. Percentage Calculator
      case '/tools/percentage-calculator':
        return <PercentageCalculator />;
      // 13. Discount Calculator
      case '/tools/discount-calculator':
        return <DiscountCalculator />;
      // 14. Age Calculator
      case '/tools/age-calculator':
        return <AgeCalculator />;

      // 15. Unit Converter
      case '/tools/unit-converter':
        return <UnitConverter />;
      // 16. Data & Storage Converter
      case '/tools/data-storage-converter':
        return <DataStorageConverter />;

      // 17. Password Generator
      case '/tools/password-generator':
        return <PasswordGenerator />;

      default:
        return (
          <div className="py-24 text-center px-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {t('not_found_title')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('not_found_desc')}
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900"
            >
              {t('return_home')}
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <Header />
      <main className="flex-1 w-full">
        <Suspense
          fallback={
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
              <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-slate-800 dark:border-t-slate-200 animate-spin" />
              <span className="text-xs font-medium">Loading tool...</span>
            </div>
          }
        >
          {renderCurrentView()}
        </Suspense>
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isRoot = window.location.pathname === '/';
    if (!isRoot) return false;
    try {
      return !sessionStorage.getItem('phonetools_welcomed_v1');
    } catch {
      return false;
    }
  });

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          {showSplash && <WelcomeSplash onComplete={() => setShowSplash(false)} />}
          <MainRouter />
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

