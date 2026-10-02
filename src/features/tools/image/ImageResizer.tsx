import React, { useState, useEffect, useRef } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { FileDropZone } from '../../../components/file/FileDropZone';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { PremiumResultCard } from '../../../components/common/PremiumResultCard';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Lock, Unlock, RefreshCw, Loader2 } from 'lucide-react';
import {
  validateImageFile,
  sanitizeFilename,
  clampNumber,
  MAX_CANVAS_DIMENSION,
  MAX_CANVAS_PIXELS,
} from '../../../lib/security';

export const ImageResizer: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<{ width: number; height: number } | null>(null);

  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  const [resizedBlob, setResizedBlob] = useState<Blob | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    };
  }, [imageUrl, resizedUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    const check = validateImageFile(selected, 50);
    if (!check.valid) {
      showToast(check.error || 'Please select a valid image file', 'error');
      return;
    }

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);

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
      setImageUrl(url);
      setOriginalDims({ width: img.naturalWidth, height: img.naturalHeight });
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
      imgRef.current = img;
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Failed to load image. The file may be corrupt.', 'error');
    };
    img.src = url;
  };

  const handleWidthChange = (val: number) => {
    const safeW = clampNumber(val, 1, MAX_CANVAS_DIMENSION, 1);
    setTargetWidth(safeW);
    if (lockAspectRatio && originalDims && originalDims.width > 0) {
      const ratio = originalDims.height / originalDims.width;
      const safeH = clampNumber(Math.round(safeW * ratio), 1, MAX_CANVAS_DIMENSION, 1);
      setTargetHeight(safeH);
    }
  };

  const handleHeightChange = (val: number) => {
    const safeH = clampNumber(val, 1, MAX_CANVAS_DIMENSION, 1);
    setTargetHeight(safeH);
    if (lockAspectRatio && originalDims && originalDims.height > 0) {
      const ratio = originalDims.width / originalDims.height;
      const safeW = clampNumber(Math.round(safeH * ratio), 1, MAX_CANVAS_DIMENSION, 1);
      setTargetWidth(safeW);
    }
  };

  const applyScalePreset = (percent: number) => {
    if (!originalDims) return;
    const w = Math.round((originalDims.width * percent) / 100);
    const h = Math.round((originalDims.height * percent) / 100);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const applyResolutionPreset = (w: number, h: number) => {
    if (!originalDims) return;
    if (lockAspectRatio) {
      const imgAspect = originalDims.width / originalDims.height;
      if (imgAspect >= 1) {
        setTargetWidth(w);
        setTargetHeight(Math.round(w / imgAspect));
      } else {
        setTargetHeight(h);
        setTargetWidth(Math.round(h * imgAspect));
      }
    } else {
      setTargetWidth(w);
      setTargetHeight(h);
    }
  };

  // Perform canvas resize
  const processResize = () => {
    if (!imgRef.current || targetWidth <= 0 || targetHeight <= 0) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    ctx.drawImage(imgRef.current, 0, 0, targetWidth, targetHeight);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsProcessing(false);
          return;
        }
        if (resizedUrl) URL.revokeObjectURL(resizedUrl);
        const newUrl = URL.createObjectURL(blob);
        setResizedBlob(blob);
        setResizedUrl(newUrl);
        setIsProcessing(false);
        showToast('Image resized successfully!', 'success');
      },
      file?.type || 'image/png',
      0.92
    );
  };

  // Auto trigger resize when target dimensions stabilize
  useEffect(() => {
    if (targetWidth > 0 && targetHeight > 0 && imgRef.current) {
      const timer = setTimeout(() => {
        processResize();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [targetWidth, targetHeight]);

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setFile(null);
    setImageUrl(null);
    setOriginalDims(null);
    setResizedBlob(null);
    setResizedUrl(null);
  };

  const handleDownload = () => {
    if (!resizedBlob || !file) return;
    const urlToDownload = resizedUrl || URL.createObjectURL(resizedBlob);
    const a = document.createElement('a');
    a.href = urlToDownload;
    a.download = sanitizeFilename(`resized-${targetWidth}x${targetHeight}-${file.name}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!resizedUrl) URL.revokeObjectURL(urlToDownload);
    showToast(t('toast_download_started'), 'success');
  };

  return (
    <ToolContainer toolId="image-resizer" onReset={handleReset} canReset={!!file}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone
            accept="image/*"
            onFilesSelected={handleFilesSelected}
            label="Select an image to resize"
            sublabel="Change dimensions by pixels or percentage scale locally."
          />
        ) : (
          <div className="space-y-6">
            {/* Dimensions Control Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Target Dimensions (Pixels)
                </span>
                {originalDims && (
                  <span>
                    Original: {originalDims.width} × {originalDims.height} px
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 space-y-1">
                  <label htmlFor="target-width" className="text-[11px] font-semibold text-slate-500">
                    Width (px)
                  </label>
                  <input
                    id="target-width"
                    type="number"
                    min="1"
                    max="12000"
                    value={targetWidth || ''}
                    onChange={(e) => handleWidthChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                  />
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className={`h-11 w-11 flex items-center justify-center rounded-xl border transition-colors ${
                      lockAspectRatio
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
                    }`}
                    title={lockAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                  >
                    {lockAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex-1 space-y-1">
                  <label htmlFor="target-height" className="text-[11px] font-semibold text-slate-500">
                    Height (px)
                  </label>
                  <input
                    id="target-height"
                    type="number"
                    min="1"
                    max="12000"
                    value={targetHeight || ''}
                    onChange={(e) => handleHeightChange(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Quick Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => applyScalePreset(25)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => applyScalePreset(50)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => applyScalePreset(75)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    75%
                  </button>
                  <button
                    onClick={() => applyResolutionPreset(1920, 1080)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    1080p (Full HD)
                  </button>
                  <button
                    onClick={() => applyResolutionPreset(1280, 720)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    720p (HD)
                  </button>
                  <button
                    onClick={() => {
                      if (originalDims) {
                        setTargetWidth(originalDims.width);
                        setTargetHeight(originalDims.height);
                      }
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Original 100%
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Area & Premium Result Card */}
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Preview Output
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {targetWidth} × {targetHeight} px
                  </span>
                </div>

                <div className="relative aspect-video max-h-72 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-800">
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-xs text-slate-500 dark:text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                      <span>Resizing image...</span>
                    </div>
                  ) : resizedUrl ? (
                    <img
                      src={resizedUrl}
                      alt="Resized output"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Loading preview...</div>
                  )}
                </div>
              </div>

              <PremiumResultCard
                title="Resize Complete"
                badgeText={`${targetWidth} × ${targetHeight} px`}
                stats={[
                  { label: 'Original Dimensions', value: originalDims ? `${originalDims.width} × ${originalDims.height}` : '—' },
                  { label: 'New Dimensions', value: `${targetWidth} × ${targetHeight}`, highlight: true },
                  { label: 'Output Size', value: resizedBlob ? `${(resizedBlob.size / 1024).toFixed(1)} KB` : '—' },
                ]}
                onDownload={handleDownload}
                downloadLabel={`Download (${targetWidth}×${targetHeight})`}
                downloadFilename={`resized-${targetWidth}x${targetHeight}.png`}
                blobToShare={resizedBlob || undefined}
                onReset={handleReset}
                resetLabel="Do Another"
                disabled={!resizedBlob || isProcessing}
              />
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
};
