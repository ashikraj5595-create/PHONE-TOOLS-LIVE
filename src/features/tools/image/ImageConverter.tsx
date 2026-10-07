import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { FileDropZone } from '../../../components/file/FileDropZone';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { PremiumResultCard } from '../../../components/common/PremiumResultCard';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { createFileAsset } from '../../../core/types/asset';
import { predictNextActions } from '../../../core/actions/nextActionEngine';
import { getToolById } from '../../../registry/toolRegistry';
import { NextAction } from '../../../core/types/workflow';
import { FileDNA } from '../../../core/types/dna';
import { FileExplanation, generateFileExplanation } from '../../../core/explain/explainEngine';
import { analyzeFileDNA } from '../../../core/dna/fileDnaEngine';
import { Info, Loader2 } from 'lucide-react';
import {
  validateImageFile,
  sanitizeFilename,
  MAX_CANVAS_DIMENSION,
  MAX_CANVAS_PIXELS,
} from '../../../lib/security';

type TargetFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export const ImageConverter: React.FC = () => {
  const { showToast, navigate } = useApp();
  const { t } = useLanguage();
  const { addAssets, selectAsset } = useWorkspace();
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>('image/png');
  const [quality, setQuality] = useState<number>(90);

  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [outputDna, setOutputDna] = useState<FileDNA | null>(null);
  const [outputExplanation, setOutputExplanation] = useState<FileExplanation | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [imageUrl, convertedUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    const check = validateImageFile(selected, 50);
    if (!check.valid) {
      showToast(check.error || 'Please select a valid image file', 'error');
      return;
    }

    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);

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
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Failed to load image. The file may be corrupt.', 'error');
    };
    img.src = url;
  };

  const processConvert = () => {
    if (!imgRef.current || !file) return;
    setIsProcessing(true);

    const img = imgRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Handle white background for JPEG since JPEG does not support transparency
    if (targetFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    const q = targetFormat === 'image/png' ? undefined : quality / 100;

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setIsProcessing(false);
          return;
        }
        if (convertedUrl) URL.revokeObjectURL(convertedUrl);
        const url = URL.createObjectURL(blob);
        setConvertedBlob(blob);
        setConvertedUrl(url);
        setIsProcessing(false);
      },
      targetFormat,
      q
    );
  };

  useEffect(() => {
    if (imgRef.current) {
      processConvert();
    }
  }, [file, targetFormat, quality]);

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    setFile(null);
    setImageUrl(null);
    setConvertedBlob(null);
    setConvertedUrl(null);
    setOutputDna(null);
    setOutputExplanation(null);
    setTargetFormat('image/png');
  };

  const getExtension = (fmt: TargetFormat) => {
    if (fmt === 'image/jpeg') return 'jpg';
    if (fmt === 'image/webp') return 'webp';
    return 'png';
  };

  const handleDownload = () => {
    if (!convertedBlob || !file) return;
    const ext = getExtension(targetFormat);
    const originalBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const downloadName = sanitizeFilename(`${originalBase}.${ext}`);

    const urlToDownload = convertedUrl || URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    a.href = urlToDownload;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!convertedUrl) URL.revokeObjectURL(urlToDownload);
    showToast(t('toast_download_started'), 'success');
  };

  // FileAsset for Smart Next Actions
  const outputAsset = useMemo(() => {
    if (!convertedBlob || !file) return null;
    const ext = getExtension(targetFormat);
    const originalBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const outputFilename = sanitizeFilename(`${originalBase}.${ext}`);

    return createFileAsset({
      raw: convertedBlob,
      name: outputFilename,
      mimeType: targetFormat,
      origin: 'tool_output',
      producerToolId: 'image-converter',
    });
  }, [convertedBlob, file, targetFormat]);

  const nextActions = useMemo(() => {
    if (!outputAsset) return [];
    return predictNextActions(outputAsset, { producerToolId: 'image-converter' });
  }, [outputAsset]);

  // Activate File DNA & Explain for the output asset
  useEffect(() => {
    let isCurrent = true;
    if (!outputAsset) {
      setOutputDna(null);
      setOutputExplanation(null);
      return;
    }

    analyzeFileDNA(outputAsset, { includeHash: false, includeQr: false })
      .then((dna) => {
        if (!isCurrent) return;
        setOutputDna(dna);
        const explanation = generateFileExplanation(dna, {
          targetToolId: 'image-converter',
        });
        setOutputExplanation(explanation);
      })
      .catch(() => {
        // Fail gracefully without breaking output flow
      });

    return () => {
      isCurrent = false;
    };
  }, [outputAsset]);

  const handleSelectNextAction = async (action: NextAction) => {
    const targetTool = getToolById(action.targetToolId);
    if (!targetTool || !outputAsset) return;

    try {
      const fileToSave =
        outputAsset.raw instanceof File
          ? outputAsset.raw
          : new File([outputAsset.raw], outputAsset.name, { type: outputAsset.mimeType });

      const addedIds = await addAssets([fileToSave]);
      if (addedIds && addedIds.length > 0) {
        selectAsset(addedIds[0]);
        navigate(targetTool.route);
      }
    } catch {
      // Non-blocking: fail gracefully without crashing
    }
  };

  const formatList: { id: TargetFormat; label: string; desc: string }[] = [
    { id: 'image/png', label: 'PNG', desc: 'Lossless quality with transparency support' },
    { id: 'image/jpeg', label: 'JPG / JPEG', desc: 'Compact file size, best for photographs' },
    { id: 'image/webp', label: 'WebP', desc: 'Modern web format, exceptional compression' },
  ];

  return (
    <ToolContainer toolId="image-converter" onReset={handleReset} canReset={!!file}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone
            accept="image/*"
            onFilesSelected={handleFilesSelected}
            label="Select an image to convert"
            sublabel="Convert effortlessly between PNG, JPG, and WebP."
          />
        ) : (
          <div className="space-y-6">
            {/* Format Selection Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Target Format
                </span>
                <span className="text-slate-400">Current: {file.type || 'Unknown'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {formatList.map((f) => {
                  const isSelected = targetFormat === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setTargetFormat(f.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <p className="font-bold text-sm">{f.label}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{f.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Quality Slider for lossy formats */}
              {targetFormat !== 'image/png' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor="convert-quality" className="font-semibold text-slate-700 dark:text-slate-300">
                      Encoding Quality: {quality}%
                    </label>
                    <span className="text-slate-400">Adjust compression vs fidelity</span>
                  </div>
                  <input
                    id="convert-quality"
                    type="range"
                    min="20"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              {/* Transparency Notice for JPG */}
              {targetFormat === 'image/jpeg' && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200">
                  <Info className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>JPG does not support transparency. Any transparent background will be filled with clean white.</span>
                </div>
              )}
            </div>

            {/* Converted Preview & Premium Result Card */}
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Preview ({getExtension(targetFormat).toUpperCase()})
                  </span>
                  {convertedBlob && (
                    <span className="text-slate-500 font-medium tabular-nums">
                      {(convertedBlob.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>

                <div className="relative aspect-video max-h-72 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center border border-slate-200/60 dark:border-slate-800">
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-8 text-xs text-slate-500 dark:text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                      <span>Converting image format...</span>
                    </div>
                  ) : convertedUrl ? (
                    <img
                      src={convertedUrl}
                      alt="Converted output"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Converting image...</div>
                  )}
                </div>
              </div>

              <PremiumResultCard
                title="Conversion Complete"
                badgeText={getExtension(targetFormat).toUpperCase()}
                stats={[
                  { label: 'Original Size', value: `${(file.size / 1024).toFixed(1)} KB` },
                  { label: 'Converted Size', value: convertedBlob ? `${(convertedBlob.size / 1024).toFixed(1)} KB` : '—', highlight: true },
                  { label: 'Target Format', value: getExtension(targetFormat).toUpperCase() },
                ]}
                onDownload={handleDownload}
                downloadLabel={`Download as .${getExtension(targetFormat)}`}
                downloadFilename={`converted-${file.name.substring(0, file.name.lastIndexOf('.'))}.${getExtension(targetFormat)}`}
                blobToShare={convertedBlob || undefined}
                onReset={handleReset}
                resetLabel="Do Another"
                nextActions={nextActions}
                onSelectNextAction={handleSelectNextAction}
                dna={outputDna || undefined}
                explanation={outputExplanation || undefined}
                asset={outputAsset || undefined}
                disabled={!convertedBlob || isProcessing}
              />
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
};
