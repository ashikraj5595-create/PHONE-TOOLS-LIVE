import React, { useState, useEffect, useRef } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { FileDropZone } from '../../../components/file/FileDropZone';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { useApp } from '../../../context/AppContext';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { validatePdfFile, sanitizeFilename, clampNumber } from '../../../lib/security';

// Setup worker for pdfjs using local bundled worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
} catch (e) {
  // worker setup fallback
}

export const PdfToImage: React.FC = () => {
  const { showToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [scale, setScale] = useState<number>(1.5); // high dpi preview

  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [renderedBlob, setRenderedBlob] = useState<Blob | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  pdfDocRef.current = pdfDoc;
  const renderedUrlRef = useRef<string | null>(null);
  renderedUrlRef.current = renderedImageUrl;

  useEffect(() => {
    return () => {
      if (renderedUrlRef.current) URL.revokeObjectURL(renderedUrlRef.current);
      if (pdfDocRef.current) {
        try {
          pdfDocRef.current.cleanup();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    const check = validatePdfFile(selected, 50);
    if (!check.valid) {
      showToast(check.error || 'Please select a valid PDF document (.pdf)', 'error');
      return;
    }

    // Clean previous doc
    if (pdfDocRef.current) {
      try {
        pdfDocRef.current.cleanup();
      } catch {
        // ignore
      }
    }

    setError(null);
    setFile(selected);
    setIsRendering(true);

    try {
      const arrayBuffer = await selected.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setCurrentPage(1);
    } catch {
      setError('Could not read PDF. The file may be password-protected or corrupted.');
      showToast('Failed to open PDF document', 'error');
    } finally {
      setIsRendering(false);
    }
  };

  const renderPage = async (pageNumber: number) => {
    if (!pdfDoc) return;
    const safePage = clampNumber(pageNumber, 1, Math.max(1, numPages), 1);
    setIsRendering(true);
    setError(null);

    try {
      const page = await pdfDoc.getPage(safePage);
      const safeScale = clampNumber(scale, 0.5, 3.0, 1.5);
      const viewport = page.getViewport({ scale: safeScale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill white background for pages
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: ctx,
        viewport,
        canvas,
      };

      await page.render(renderContext).promise;

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          if (renderedImageUrl) URL.revokeObjectURL(renderedImageUrl);
          const url = URL.createObjectURL(blob);
          setRenderedBlob(blob);
          setRenderedImageUrl(url);
          setIsRendering(false);
        },
        outputFormat,
        0.95
      );
    } catch {
      setError('Failed to render PDF page into image.');
      setIsRendering(false);
    }
  };

  useEffect(() => {
    if (pdfDoc && numPages > 0) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, outputFormat, scale]);

  const handleReset = () => {
    if (renderedImageUrl) URL.revokeObjectURL(renderedImageUrl);
    setFile(null);
    setPdfDoc(null);
    setNumPages(0);
    setCurrentPage(1);
    setRenderedBlob(null);
    setRenderedImageUrl(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!renderedBlob || !file) return;
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : 'png';
    const base = file.name.replace(/\.pdf$/i, '');
    const urlToDownload = renderedImageUrl || URL.createObjectURL(renderedBlob);
    const a = document.createElement('a');
    a.href = urlToDownload;
    a.download = sanitizeFilename(`${base}-page-${currentPage}.${ext}`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (!renderedImageUrl) URL.revokeObjectURL(urlToDownload);
    showToast(`Page ${currentPage} downloaded as ${ext.toUpperCase()}`, 'success');
  };

  return (
    <ToolContainer toolId="pdf-to-image" onReset={handleReset} canReset={!!file}>
      <div className="space-y-6">
        {!file ? (
          <FileDropZone
            accept="application/pdf,.pdf"
            onFilesSelected={handleFilesSelected}
            label="Select a PDF to extract pages as images"
            sublabel="Convert any PDF page into crisp high-resolution JPG or PNG. 100% on-device."
          />
        ) : (
          <div className="space-y-6">
            {/* Controls Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rose-500" />
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  Total {numPages} {numPages === 1 ? 'Page' : 'Pages'}
                </span>
              </div>

              {/* Page Navigator */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1 || isRendering}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>Page</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(parseInt(e.target.value, 10))}
                    className="h-8 px-2 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    {Array.from({ length: numPages }, (_, i) => i + 1).map((pg) => (
                      <option key={pg} value={pg}>
                        {pg}
                      </option>
                    ))}
                  </select>
                  <span>of {numPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                  disabled={currentPage >= numPages || isRendering}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Format & Scale */}
              <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Output:
                  </span>
                  <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                    <button
                      onClick={() => setOutputFormat('image/png')}
                      className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                        outputFormat === 'image/png'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      PNG (Crisp)
                    </button>
                    <button
                      onClick={() => setOutputFormat('image/jpeg')}
                      className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                        outputFormat === 'image/jpeg'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      JPG (Compact)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Resolution:
                  </span>
                  <select
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    <option value={1}>Standard (1x)</option>
                    <option value={1.5}>Crisp (1.5x)</option>
                    <option value={2}>High Res (2x)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rendered Page Image Preview */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Page {currentPage} Preview
                </span>
                {renderedBlob && (
                  <span className="text-slate-400 font-medium tabular-nums">
                    {(renderedBlob.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>

              <div
                aria-live="polite"
                aria-busy={isRendering}
                className="min-h-[300px] max-h-[550px] overflow-auto rounded-xl bg-slate-100 dark:bg-slate-800/60 p-4 flex items-center justify-center border border-slate-200/80 dark:border-slate-800"
              >
                {isRendering ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-2 text-center text-xs text-slate-500 font-medium">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    <span>Rendering page {currentPage}...</span>
                  </div>
                ) : renderedImageUrl ? (
                  <img
                    src={renderedImageUrl}
                    alt={`Page ${currentPage} preview`}
                    className="max-w-full max-h-[500px] object-contain shadow-md rounded"
                  />
                ) : error ? (
                  <div className="text-xs text-rose-500 font-medium" role="alert">{error}</div>
                ) : null}
              </div>

              <div className="flex justify-end pt-2">
                <ShareDownloadBar
                  onDownload={handleDownload}
                  downloadLabel={`Download Page ${currentPage} (${outputFormat === 'image/jpeg' ? 'JPG' : 'PNG'})`}
                  downloadFilename={`page-${currentPage}.${outputFormat === 'image/jpeg' ? 'jpg' : 'png'}`}
                  blobToShare={renderedBlob || undefined}
                  disabled={isRendering || !renderedBlob}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
};
