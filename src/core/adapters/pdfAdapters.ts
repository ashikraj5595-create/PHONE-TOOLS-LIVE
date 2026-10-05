import { ToolCapability, OperationInput, OperationOutput } from '../types/workflow';
import { createFileAsset } from '../types/asset';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  validateImageFile,
  validatePdfFile,
  sanitizeFilename,
  clampNumber,
} from '../../lib/security';
import { objectUrlManager } from '../memory/objectUrlManager';
import { ToolAdapter } from './registry';

// ==========================================
// 1. IMAGE TO PDF ADAPTER
// ==========================================
const imageToPdfCapability: ToolCapability = {
  toolId: 'image-to-pdf',
  category: 'pdf',
  acceptedInputs: ['image'],
  producedOutput: 'pdf',
  supportsBatch: true,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: true,
  isBridge: true,
  maxInputSizeMB: 50,
};

export const imageToPdfAdapter: ToolAdapter = {
  capability: imageToPdfCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset, parameters } = input;

    const validation = validateImageFile(
      asset.raw instanceof File ? asset.raw : new File([asset.raw], asset.name, { type: asset.mimeType }),
      imageToPdfCapability.maxInputSizeMB || 50
    );
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid image file.',
        executionDurationMs: performance.now() - startTime,
      };
    }

    if (signal?.aborted) {
      return { success: false, error: 'Operation aborted', executionDurationMs: 0 };
    }

    let tempUrl: string | null = null;
    try {
      // Dynamic import to keep initial bundle light
      const { default: jsPDF } = await import('jspdf');

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      tempUrl = objectUrlManager.create(asset.raw);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const imageObj = new Image();
        imageObj.onload = () => resolve(imageObj);
        imageObj.onerror = () => reject(new Error('Failed to decode image'));
        imageObj.src = tempUrl as string;
      });

      const orientation = parameters.orientation === 'landscape' ? 'l' : 'p';
      const pageSize = (parameters.pageSize as string) || 'a4';
      const margin = clampNumber(Number(parameters.margin ?? 10), 0, 50, 10);

      const doc = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      const imgAspect = img.naturalWidth / img.naturalHeight;
      let renderW = usableWidth;
      let renderH = renderW / imgAspect;

      if (renderH > usableHeight) {
        renderH = usableHeight;
        renderW = renderH * imgAspect;
      }

      const posX = margin + (usableWidth - renderW) / 2;
      const posY = margin + (usableHeight - renderH) / 2;

      // Draw to offscreen canvas to produce JPEG buffer for jsPDF
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(img.naturalWidth, 4096);
      canvas.height = Math.round((canvas.width * img.naturalHeight) / img.naturalWidth);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { success: false, error: 'Canvas initialization failed', executionDurationMs: performance.now() - startTime };
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      doc.addImage(dataUrl, 'JPEG', posX, posY, renderW, renderH);
      const pdfBlob = doc.output('blob');

      const sanitizedBase = sanitizeFilename(asset.name.replace(/\.[^/.]+$/, ''));
      const outputName = `${sanitizedBase}.pdf`;

      const outputAsset = createFileAsset({
        raw: pdfBlob,
        name: outputName,
        mimeType: 'application/pdf',
        origin: 'tool_output',
        producerToolId: imageToPdfCapability.toolId,
        parentAssetId: asset.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          pageSize,
          orientation,
          pdfByteSize: pdfBlob.size,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'Image to PDF conversion failed',
        executionDurationMs: performance.now() - startTime,
      };
    } finally {
      if (tempUrl) {
        objectUrlManager.revoke(tempUrl);
      }
    }
  },
};

// ==========================================
// 2. PDF TO IMAGE ADAPTER
// ==========================================
const pdfToImageCapability: ToolCapability = {
  toolId: 'pdf-to-image',
  category: 'pdf',
  acceptedInputs: ['pdf'],
  producedOutput: 'image',
  supportsBatch: false,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: false,
  isBridge: true,
  maxInputSizeMB: 50,
};

export const pdfToImageAdapter: ToolAdapter = {
  capability: pdfToImageCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset, parameters } = input;

    const validation = validatePdfFile(
      asset.raw instanceof File ? asset.raw : new File([asset.raw], asset.name, { type: asset.mimeType }),
      pdfToImageCapability.maxInputSizeMB || 50
    );
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid PDF file.',
        executionDurationMs: performance.now() - startTime,
      };
    }

    if (signal?.aborted) {
      return { success: false, error: 'Operation aborted', executionDurationMs: 0 };
    }

    let pdfDoc: PDFDocumentProxy | null = null;
    let totalPages = 1;

    try {
      const pdfjsLib = await import('pdfjs-dist');

      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        try {
          const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
        } catch {
          // Workerless fallback
        }
      }

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      const arrayBuffer = await asset.raw.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      pdfDoc = await loadingTask.promise;
      totalPages = pdfDoc.numPages;

      const pageNumber = clampNumber(Number(parameters.pageNumber ?? 1), 1, Math.max(1, totalPages), 1);
      const page = await pdfDoc.getPage(pageNumber);

      const scale = clampNumber(Number(parameters.scale ?? 1.5), 0.5, 3.0, 1.5);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { success: false, error: 'Failed to obtain 2D canvas context', executionDurationMs: performance.now() - startTime };
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };
      await (page.render as (opts: unknown) => { promise: Promise<void> })(renderContext).promise;

      const outputFormat = (parameters.format as string) === 'image/jpeg' ? 'image/jpeg' : 'image/png';
      const ext = outputFormat === 'image/jpeg' ? 'jpg' : 'png';

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputFormat, 0.92);
      });

      if (!blob) {
        return { success: false, error: 'Rendered page export failed', executionDurationMs: performance.now() - startTime };
      }

      const sanitizedBase = sanitizeFilename(asset.name.replace(/\.[^/.]+$/, ''));
      const outputName = `${sanitizedBase}_page_${pageNumber}.${ext}`;

      const outputAsset = createFileAsset({
        raw: blob,
        name: outputName,
        mimeType: outputFormat,
        origin: 'tool_output',
        producerToolId: pdfToImageCapability.toolId,
        parentAssetId: asset.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          pageNumber,
          totalPages,
          width: canvas.width,
          height: canvas.height,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'PDF page extraction failed',
        executionDurationMs: performance.now() - startTime,
      };
    } finally {
      if (pdfDoc) {
        try {
          if (typeof pdfDoc.cleanup === 'function') pdfDoc.cleanup();
          const docWithDestroy = pdfDoc as unknown as { destroy?: () => void };
          if (typeof docWithDestroy.destroy === 'function') docWithDestroy.destroy();
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  },
};
