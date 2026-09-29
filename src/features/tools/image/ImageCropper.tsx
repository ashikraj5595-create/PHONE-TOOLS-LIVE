import React, { useState, useEffect, useRef } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { FileDropZone } from '../../../components/file/FileDropZone';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import {
  validateImageFile,
  sanitizeFilename,
  MAX_CANVAS_DIMENSION,
  MAX_CANVAS_PIXELS,
} from '../../../lib/security';
import { Crop, Loader2 } from 'lucide-react';

type AspectPreset = 'free' | '1:1' | '4:5' | '16:9' | '9:16';

export const ImageCropper: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspect, setAspect] = useState<AspectPreset>('1:1');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Normalized crop rectangle: 0 to 1 relative to image
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0.1,
    y: 0.1,
    width: 0.8,
    height: 0.8,
  });

  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const isDraggingRef = useRef<string | null>(null); // 'move' or 'nw', 'ne', 'se', 'sw'
  const dragStartRef = useRef<{ clientX: number; clientY: number; crop: typeof crop }>({
    clientX: 0,
    clientY: 0,
    crop: { x: 0, y: 0, width: 0, height: 0 },
  });

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    };
  }, [imageUrl, croppedUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    const check = validateImageFile(selected, 50);
    if (!check.valid) {
      showToast(check.error || 'Please select a valid image file', 'error');
      return;
    }

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);

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
      imgRef.current = img;
      // Initialize centered square crop
      setCrop({ x: 0.1, y: 0.1, width: 0.8, height: 0.8 });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Failed to load image. The file may be corrupt.', 'error');
    };
    img.src = url;
  };

  // Adjust crop aspect ratio when preset changes
  const applyPreset = (preset: AspectPreset) => {
    setAspect(preset);
    if (!imgRef.current) return;
    const img = imgRef.current;
    const naturalRatio = img.naturalWidth / img.naturalHeight;

    if (preset === 'free') {
      return;
    }

    let targetRatio = 1;
    if (preset === '1:1') targetRatio = 1;
    else if (preset === '4:5') targetRatio = 4 / 5;
    else if (preset === '16:9') targetRatio = 16 / 9;
    else if (preset === '9:16') targetRatio = 9 / 16;

    // Calculate normalized w & h matching targetRatio
    let w = 0.8;
    let h = (w * naturalRatio) / targetRatio;
    if (h > 0.9) {
      h = 0.8;
      w = (h * targetRatio) / naturalRatio;
    }

    setCrop({
      x: Math.max(0, (1 - w) / 2),
      y: Math.max(0, (1 - h) / 2),
      width: Math.min(w, 1),
      height: Math.min(h, 1),
    });
  };

  // Perform canvas crop
  const generateCroppedImage = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const sourceX = crop.x * img.naturalWidth;
    const sourceY = crop.y * img.naturalHeight;
    const sourceW = crop.width * img.naturalWidth;
    const sourceH = crop.height * img.naturalHeight;

    if (sourceW <= 0 || sourceH <= 0) return;

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(sourceW);
    canvas.height = Math.round(sourceH);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setIsProcessing(false);
        if (!blob) return;
        if (croppedUrl) URL.revokeObjectURL(croppedUrl);
        const url = URL.createObjectURL(blob);
        setCroppedBlob(blob);
        setCroppedUrl(url);
      },
      file?.type || 'image/png',
      0.95
    );
  };

  useEffect(() => {
    if (imgRef.current) {
      const timer = setTimeout(() => {
        generateCroppedImage();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [crop, imageUrl]);

  // Touch and mouse drag handlers for crop box
  const startDrag = (handle: string, clientX: number, clientY: number) => {
    isDraggingRef.current = handle;
    dragStartRef.current = {
      clientX,
      clientY,
      crop: { ...crop },
    };
  };

  const handlePointerDown = (handle: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    startDrag(handle, e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const deltaX = (e.clientX - dragStartRef.current.clientX) / rect.width;
    const deltaY = (e.clientY - dragStartRef.current.clientY) / rect.height;
    const init = dragStartRef.current.crop;

    if (isDraggingRef.current === 'move') {
      const newX = Math.max(0, Math.min(1 - init.width, init.x + deltaX));
      const newY = Math.max(0, Math.min(1 - init.height, init.y + deltaY));
      setCrop((prev) => ({ ...prev, x: newX, y: newY }));
    } else if (isDraggingRef.current === 'se') {
      const newW = Math.max(0.1, Math.min(1 - init.x, init.width + deltaX));
      const newH = Math.max(0.1, Math.min(1 - init.y, init.height + deltaY));
      setCrop((prev) => ({ ...prev, width: newW, height: newH }));
    }
  };

  const handlePointerUp = () => {
    isDraggingRef.current = null;
  };

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (croppedUrl) URL.revokeObjectURL(croppedUrl);
    setFile(null);
    setImageUrl(null);
    setCroppedBlob(null);
    setCroppedUrl(null);
    setAspect('1:1');
  };

  const handleDownload = () => {
    if (!croppedBlob || !file) return;
    const urlToDownload = croppedUrl || URL.createObjectURL(croppedBlob);
    const a = document.createElement('a');
    a.href = urlToDownload;
    a.download = sanitizeFilename(`cropped-${file.name}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!croppedUrl) URL.revokeObjectURL(urlToDownload);
    showToast(t('toast_download_started'), 'success');
  };

  const presets: { id: AspectPreset; label: string }[] = [
    { id: 'free', label: 'Free' },
    { id: '1:1', label: '1:1 Square' },
    { id: '4:5', label: '4:5 Portrait' },
    { id: '16:9', label: '16:9 Landscape' },
    { id: '9:16', label: '9:16 Story' },
  ];

  return (
    <ToolContainer toolId="image-cropper" onReset={handleReset} canReset={!!file}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone
            accept="image/*"
            onFilesSelected={handleFilesSelected}
            label="Select an image to crop"
            sublabel="Interactive touch & mouse cropper with aspect presets."
          />
        ) : (
          <div className="space-y-6">
            {/* Aspect Presets Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Aspect Ratio
              </span>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      aspect === p.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Cropper Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Drag box to position, drag corner handle to resize:
                </span>

                <div
                  ref={containerRef}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  className="relative aspect-square max-h-80 w-full rounded-xl bg-slate-950 overflow-hidden select-none flex items-center justify-center touch-none"
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Crop source"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  )}

                  {/* Dark overlay & crop window */}
                  <div
                    onPointerDown={handlePointerDown('move')}
                    style={{
                      left: `${crop.x * 100}%`,
                      top: `${crop.y * 100}%`,
                      width: `${crop.width * 100}%`,
                      height: `${crop.height * 100}%`,
                    }}
                    className="absolute border-2 border-white shadow-2xl cursor-move bg-white/10 backdrop-brightness-110"
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-white/30" />
                      <div className="border-r border-white/30" />
                      <div />
                    </div>

                    {/* Resize handle (bottom right) */}
                    <div
                      onPointerDown={handlePointerDown('se')}
                      className="absolute -right-2 -bottom-2 h-6 w-6 rounded-full bg-blue-500 border-2 border-white shadow-md cursor-se-resize flex items-center justify-center touch-none"
                    >
                      <Crop className="h-3 w-3 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Cropped Result */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-3">
                    Cropped Preview
                  </span>

                  <div className="relative aspect-square max-h-80 w-full rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-800">
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center gap-2 py-8 text-xs text-slate-500 dark:text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                        <span>Generating crop...</span>
                      </div>
                    ) : croppedUrl ? (
                      <img
                        src={croppedUrl}
                        alt="Cropped output"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-xs text-slate-400">Cropping...</div>
                    )}
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <ShareDownloadBar
                    onDownload={handleDownload}
                    downloadLabel="Download Crop"
                    downloadFilename={`cropped-${file.name}`}
                    blobToShare={croppedBlob || undefined}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
};
