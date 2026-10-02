import React, { useState, useEffect, useRef } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { FileDropZone } from '../../../components/file/FileDropZone';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import { jsPDF } from 'jspdf';
import { Plus, Trash2, ArrowUp, ArrowDown, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { validateImageFile, sanitizeFilename } from '../../../lib/security';

interface SelectedImageItem {
  id: string;
  file: File;
  previewUrl: string;
}

const MAX_PDF_IMAGES = 100;

export const ImageToPdf: React.FC = () => {
  const { showToast } = useApp();
  const { t } = useLanguage();
  const [images, setImages] = useState<SelectedImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<number>(10); // mm

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const imagesRef = useRef<SelectedImageItem[]>([]);
  imagesRef.current = images;
  const pdfUrlRef = useRef<string | null>(null);
  pdfUrlRef.current = pdfUrl;

  useEffect(() => {
    return () => {
      // Clean up all object URLs when unmounting using latest refs
      imagesRef.current.forEach((img) => {
        try {
          URL.revokeObjectURL(img.previewUrl);
        } catch {
          // ignore
        }
      });
      if (pdfUrlRef.current) {
        try {
          URL.revokeObjectURL(pdfUrlRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleFilesSelected = (files: File[]) => {
    const valid = files.filter((f) => validateImageFile(f, 50).valid);
    if (valid.length === 0) {
      showToast('Please select valid image files (JPG, PNG, WebP, etc.)', 'error');
      return;
    }

    if (images.length + valid.length > MAX_PDF_IMAGES) {
      showToast(`Maximum ${MAX_PDF_IMAGES} images allowed in a single PDF.`, 'error');
      return;
    }

    const newItems: SelectedImageItem[] = valid.map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newItems]);
    // Reset previously generated PDF
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfBlob(null);
    setPdfUrl(null);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfBlob(null);
    setPdfUrl(null);
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setImages((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfBlob(null);
    setPdfUrl(null);
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          doc.addPage(pageSize, orientation);
        }

        const item = images[i];
        // Load image as data url via HTMLImageElement to obtain natural dimensions
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const imageObj = new Image();
          imageObj.onload = () => resolve(imageObj);
          imageObj.onerror = reject;
          imageObj.src = item.previewUrl;
        });

        // Compute aspect ratio scaling
        const imgAspect = img.naturalWidth / img.naturalHeight;
        let renderW = usableWidth;
        let renderH = renderW / imgAspect;

        if (renderH > usableHeight) {
          renderH = usableHeight;
          renderW = renderH * imgAspect;
        }

        // Center on page
        const posX = margin + (usableWidth - renderW) / 2;
        const posY = margin + (usableHeight - renderH) / 2;

        // Render to temporary canvas to get clean JPEG data with safe canvas dimension limits
        const maxCanvasDim = 4096;
        let cWidth = img.naturalWidth;
        let cHeight = img.naturalHeight;
        if (cWidth > maxCanvasDim || cHeight > maxCanvasDim) {
          if (cWidth > cHeight) {
            cHeight = Math.round((cHeight * maxCanvasDim) / cWidth);
            cWidth = maxCanvasDim;
          } else {
            cWidth = Math.round((cWidth * maxCanvasDim) / cHeight);
            cHeight = maxCanvasDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, cWidth);
        canvas.height = Math.max(1, cHeight);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          doc.addImage(dataUrl, 'JPEG', posX, posY, renderW, renderH);
        }
      }

      const blob = doc.output('blob');
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const newPdfUrl = URL.createObjectURL(blob);
      setPdfBlob(blob);
      setPdfUrl(newPdfUrl);
      showToast('PDF compiled successfully!', 'success');
    } catch {
      showToast('Failed to compile PDF. Check images and try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setImages([]);
    setPdfBlob(null);
    setPdfUrl(null);
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const urlToDownload = pdfUrl || URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = urlToDownload;
    a.download = sanitizeFilename(`phone-tools-doc-${Date.now()}.pdf`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!pdfUrl) URL.revokeObjectURL(urlToDownload);
    showToast(t('toast_download_started'), 'success');
  };

  return (
    <ToolContainer toolId="image-to-pdf" onReset={handleReset} canReset={images.length > 0}>
      <div className="space-y-6">
        {images.length === 0 ? (
          <FileDropZone
            accept="image/*"
            multiple={true}
            onFilesSelected={handleFilesSelected}
            label="Select images to combine into PDF"
            sublabel="Select multiple photos, screenshots, or receipts. Supports JPG, PNG, WebP."
          />
        ) : (
          <div className="space-y-6">
            {/* Document Layout Settings */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                PDF Page Configuration
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Page Size */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page Size
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPageSize('a4')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        pageSize === 'a4'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      A4 Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageSize('letter')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        pageSize === 'letter'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      US Letter
                    </button>
                  </div>
                </div>

                {/* Orientation */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        orientation === 'portrait'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        orientation === 'landscape'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>

                {/* Margin */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page Margin
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setMargin(5)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        margin === 5
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Small (5mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMargin(15)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        margin === 15
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Standard (15mm)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Images List & Reorder */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pages Order ({images.length} {images.length === 1 ? 'page' : 'pages'})
                </span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add More</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) handleFilesSelected(Array.from(e.target.files));
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {images.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-xs font-bold font-mono text-slate-400 w-5 text-center">
                        {index + 1}
                      </span>
                      <img
                        src={item.previewUrl}
                        alt="Thumbnail"
                        className="h-10 w-10 rounded-lg object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                      />
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.file.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveImage(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                        title="Move page up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveImage(index, 'down')}
                        disabled={index === images.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none"
                        title="Move page down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeImage(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove page"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generate Button */}
              <div className="pt-2">
                <button
                  onClick={generatePdf}
                  disabled={isGenerating}
                  aria-busy={isGenerating}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md shadow-rose-600/10 active:scale-[0.99] transition-all disabled:opacity-60"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" />
                  ) : (
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span aria-live="polite">
                    {isGenerating ? 'Compiling PDF on device...' : `Generate ${images.length}-Page PDF`}
                  </span>
                </button>
              </div>
            </div>

            {/* Generated PDF Output */}
            {pdfBlob && (
              <div
                aria-live="polite"
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
              >
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Your PDF has been successfully generated locally!</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        Compiled Document.pdf
                      </p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        {images.length} pages · {(pdfBlob.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <ShareDownloadBar
                    onDownload={handleDownload}
                    downloadLabel="Download PDF"
                    downloadFilename="document.pdf"
                    blobToShare={pdfBlob}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolContainer>
  );
};
