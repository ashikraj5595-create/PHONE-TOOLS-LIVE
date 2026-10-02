import React, { useState, useEffect, useRef } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { FileDropZone } from '../../../components/file/FileDropZone';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { PremiumResultCard } from '../../../components/common/PremiumResultCard';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import { ArrowDown, Sliders, Loader2 } from 'lucide-react';
import {
  validateImageFile,
  sanitizeFilename,
  MAX_CANVAS_DIMENSION,
  MAX_CANVAS_PIXELS,
} from '../../../lib/security';

export const ImageCompressor: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalMeta, setOriginalMeta] = useState<{ width: number; height: number; size: number } | null>(null);

  const [quality, setQuality] = useState<number>(75);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/webp'>('image/jpeg');

  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedMeta, setCompressedMeta] = useState<{ width: number; height: number; size: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    };
  }, [originalUrl, compressedUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    const check = validateImageFile(selected, 50);
    if (!check.valid) {
      showToast(check.error || 'Please select a valid image file', 'error');
      return;
    }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);

    const url = URL.createObjectURL(selected);
    const img = new Image();
    img.onload = () => {
      if (
        img.naturalWidth > MAX_CANVAS_DIMENSION ||
        img.naturalHeight > MAX_CANVAS_DIMENSION ||
        img.naturalWidth * img.naturalHeight > MAX_CANVAS_PIXELS
      ) {
        URL.revokeObjectURL(url);
        showToast('Image dimensions exceed the safe maximum limit (8192px).', 'error');
        return;
      }

      setFile(selected);
      setOriginalUrl(url);
      setOriginalMeta({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: selected.size,
      });
      imgRef.current = img;
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Failed to load image. The file may be corrupt.', 'error');
    };
    img.src = url;
  };

  // Perform compression whenever file, quality or format changes
  useEffect(() => {
    if (!imgRef.current || !file) return;

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const img = imgRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Fill white background for JPEGs to avoid black background on transparent PNGs
    if (outputFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsProcessing(false);
          return;
        }
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        const newUrl = URL.createObjectURL(blob);
        setCompressedBlob(blob);
        setCompressedUrl(newUrl);
        setCompressedMeta({
          width: canvas.width,
          height: canvas.height,
          size: blob.size,
        });
        setIsProcessing(false);
      },
      outputFormat,
      quality / 100
    );
  }, [file, quality, outputFormat]);

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null);
    setOriginalUrl(null);
    setOriginalMeta(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setCompressedMeta(null);
    setQuality(75);
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : 'webp';
    const originalBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const downloadName = sanitizeFilename(`${originalBase}-compressed.${ext}`);

    const urlToDownload = compressedUrl || URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = urlToDownload;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!compressedUrl) URL.revokeObjectURL(urlToDownload);
    showToast(t('toast_download_started'), 'success');
  };

  const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const reductionPct =
    originalMeta && compressedMeta
      ? Math.round(((originalMeta.size - compressedMeta.size) / originalMeta.size) * 100)
      : 0;

  return (
    <ToolContainer toolId="image-compressor" onReset={handleReset} canReset={!!file}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone
            accept="image/jpeg,image/png,image/webp,image/bmp"
            onFilesSelected={handleFilesSelected}
            label="Select an image to compress"
            sublabel="Supports JPG, PNG, WebP up to 50MB. Never uploaded to servers."
          />
        ) : (
          <div className="space-y-6">
            {/* Compression Settings Controls */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-blue-500" />
                  <span>Compression Settings</span>
                </span>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="comp-quality" className="font-semibold text-slate-700 dark:text-slate-300">
                    Quality Level: {quality}%
                  </label>
                  <span className="text-slate-500">
                    {quality > 80 ? 'High Quality' : quality > 50 ? 'Balanced' : 'Max Compression'}
                  </span>
                </div>
                <input
                  id="comp-quality"
                  type="range"
                  min="10"
                  max="95"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Format Select */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Output Format
                </span>
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setOutputFormat('image/jpeg')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      outputFormat === 'image/jpeg'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    JPEG
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat('image/webp')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      outputFormat === 'image/webp'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    WebP
                  </button>
                </div>
              </div>
            </div>

            {/* Before vs After Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Original
                  </span>
                  {originalMeta && (
                    <span>
                      {originalMeta.width} × {originalMeta.height} px
                    </span>
                  )}
                </div>

                <div className="relative aspect-video max-h-56 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-800">
                  {originalUrl && (
                    <img
                      src={originalUrl}
                      alt="Original preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>

                <div className="text-center py-1">
                  <span className="text-xs text-slate-400">File Size:</span>
                  <p className="font-display text-lg font-bold text-slate-900 dark:text-white tabular-nums">
                    {originalMeta ? formatSize(originalMeta.size) : '—'}
                  </p>
                </div>
              </div>

              {/* Compressed Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Compressed
                  </span>
                  {compressedMeta && (
                    <span className="text-slate-500">
                      {compressedMeta.width} × {compressedMeta.height} px
                    </span>
                  )}
                </div>

                <div className="relative aspect-video max-h-56 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-800">
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-xs text-slate-500 dark:text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                      <span>Compressing image...</span>
                    </div>
                  ) : compressedUrl ? (
                    <img
                      src={compressedUrl}
                      alt="Compressed preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Compressing...</div>
                  )}
                </div>

                <div className="flex items-center justify-around py-1">
                  <div className="text-center">
                    <span className="text-xs text-slate-400">New Size:</span>
                    <p className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {compressedMeta ? formatSize(compressedMeta.size) : '—'}
                    </p>
                  </div>
                  {reductionPct > 0 && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <ArrowDown className="h-3.5 w-3.5" />
                      <span>{reductionPct}% smaller</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Premium Result Summary & Actions */}
            <PremiumResultCard
              title="Compression Complete"
              badgeText={reductionPct > 0 ? `${reductionPct}% smaller` : undefined}
              stats={[
                { label: 'Original Size', value: originalMeta ? formatSize(originalMeta.size) : '—' },
                { label: 'Compressed Size', value: compressedMeta ? formatSize(compressedMeta.size) : '—', highlight: true },
                { label: 'Format', value: outputFormat === 'image/jpeg' ? 'JPEG' : 'WebP', subtext: `${quality}% quality` },
              ]}
              onDownload={handleDownload}
              downloadLabel="Download Image"
              downloadFilename={
                file
                  ? `${file.name.substring(0, file.name.lastIndexOf('.')) || file.name}-compressed.${outputFormat === 'image/jpeg' ? 'jpg' : 'webp'}`
                  : `compressed-image.${outputFormat === 'image/jpeg' ? 'jpg' : 'webp'}`
              }
              blobToShare={compressedBlob || undefined}
              onReset={handleReset}
              resetLabel="Do Another"
              disabled={!compressedBlob || isProcessing}
            />
          </div>
        )}
      </div>
    </ToolContainer>
  );
};
