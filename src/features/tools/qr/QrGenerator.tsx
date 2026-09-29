import React, { useState, useEffect, useRef } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import QRCode from 'qrcode';
import { Loader2 } from 'lucide-react';
import { sanitizeFilename } from '../../../lib/security';

const MAX_QR_LENGTH = 2000;
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export const QrGenerator: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useLanguage();
  const [text, setText] = useState<string>('https://phonetools.app');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [darkColor, setDarkColor] = useState<string>('#0f172a');
  const [lightColor, setLightColor] = useState<string>('#ffffff');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateQRCode = async () => {
    const trimmed = text.trim();
    if (!trimmed) {
      setDataUrl('');
      setBlob(null);
      return;
    }

    if (trimmed.length > MAX_QR_LENGTH) {
      showToast(`Text exceeds QR limit (${MAX_QR_LENGTH} characters).`, 'error');
      return;
    }

    const safeDark = HEX_COLOR_REGEX.test(darkColor) ? darkColor : '#0f172a';
    const safeLight = HEX_COLOR_REGEX.test(lightColor) ? lightColor : '#ffffff';

    setIsGenerating(true);
    try {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, trimmed, {
        width: 600,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: safeDark,
          light: safeLight,
        },
      });

      const url = canvas.toDataURL('image/png');
      setDataUrl(url);

      canvas.toBlob((b) => {
        if (b) setBlob(b);
      }, 'image/png');
    } catch {
      showToast('Could not generate QR code for given text', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateQRCode();
  }, [text, errorCorrection, darkColor, lightColor]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = sanitizeFilename(`qrcode-${Date.now()}.png`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(t('toast_download_started'), 'success');
  };

  const handleReset = () => {
    setText('https://phonetools.app');
    setErrorCorrection('M');
    setDarkColor('#0f172a');
    setLightColor('#ffffff');
  };

  return (
    <ToolContainer toolId="qr-generator" onReset={handleReset} canReset={text.length > 0}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input & Options Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="qr-content" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                QR Code Content (Text, Link, Wi-Fi, Phone)
              </label>
              <textarea
                id="qr-content"
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL (https://...) or any message..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
              />
            </div>

            {/* Quick Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Quick Content Presets
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setText('https://')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Website URL
                </button>
                <button
                  type="button"
                  onClick={() => setText('tel:+1234567890')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Phone Call
                </button>
                <button
                  type="button"
                  onClick={() => setText('WIFI:S:MyNetwork;T:WPA;P:Password123;;')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Wi-Fi Network
                </button>
              </div>
            </div>

            {/* Error Correction & Colors */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Correction Level
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  QR Pattern Color
                </label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="h-6 w-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono font-medium">{darkColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Generated QR Preview Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-between space-y-4">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-start">
              Live QR Preview
            </span>

            <div className="p-4 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center max-w-[260px] aspect-square">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-700" />
                  <span>Generating QR...</span>
                </div>
              ) : dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Generated QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-slate-400 text-center">
                  Type text to generate QR code
                </div>
              )}
            </div>

            <div className="w-full flex justify-end pt-2">
              <ShareDownloadBar
                onDownload={handleDownload}
                downloadLabel="Download QR Code"
                downloadFilename="qrcode.png"
                blobToShare={blob || undefined}
                onCopyText={text}
                copyLabel="Copy Content"
              />
            </div>
          </div>
        </div>
      </div>
    </ToolContainer>
  );
};
