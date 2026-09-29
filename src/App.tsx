import React, { useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { getToolByRoute } from './registry/toolRegistry';

// Pages
import { HomePage } from './features/home/HomePage';
import { ToolsPage } from './features/tools/ToolsPage';
import { FavoritesPage } from './features/favorites/FavoritesPage';
import { SettingsPage } from './features/settings/SettingsPage';

// Image Tools
import { ImageCompressor } from './features/tools/image/ImageCompressor';
import { ImageResizer } from './features/tools/image/ImageResizer';
import { ImageCropper } from './features/tools/image/ImageCropper';
import { ImageConverter } from './features/tools/image/ImageConverter';

// PDF Tools
import { ImageToPdf } from './features/tools/pdf/ImageToPdf';
import { PdfToImage } from './features/tools/pdf/PdfToImage';

// Text Tools
import { TextCounter } from './features/tools/text/TextCounter';
import { TextCleaner } from './features/tools/text/TextCleaner';
import { CaseConverter } from './features/tools/text/CaseConverter';

// QR Tools
import { QrScanner } from './features/tools/qr/QrScanner';
import { QrGenerator } from './features/tools/qr/QrGenerator';

// Calculators
import { PercentageCalculator } from './features/tools/calculators/PercentageCalculator';
import { DiscountCalculator } from './features/tools/calculators/DiscountCalculator';
import { AgeCalculator } from './features/tools/calculators/AgeCalculator';

// Converters
import { UnitConverter } from './features/tools/converters/UnitConverter';
import { DataStorageConverter } from './features/tools/converters/DataStorageConverter';

// Security
import { PasswordGenerator } from './features/tools/security/PasswordGenerator';

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
      <main className="flex-1 w-full">{renderCurrentView()}</main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <MainRouter />
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

