import { ToolCapability, OperationInput, OperationOutput } from '../types/workflow';
import { createFileAsset } from '../types/asset';
import {
  validateImageFile,
  MAX_CANVAS_DIMENSION,
  MAX_CANVAS_PIXELS,
  clampNumber,
  sanitizeFilename,
} from '../../lib/security';
import { objectUrlManager } from '../memory/objectUrlManager';
import { ToolAdapter } from './registry';

/**
 * Loads an image from a blob into an HTMLImageElement with safety timeout and abort checking.
 */
function loadImageElement(
  blob: Blob | File,
  signal?: AbortSignal
): Promise<{ img: HTMLImageElement; tempUrl: string }> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new Error('Operation aborted'));
    }

    const tempUrl = objectUrlManager.create(blob);
    const img = new Image();
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onAbort);
    };

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        img.src = '';
        objectUrlManager.revoke(tempUrl);
        reject(new Error('Image decoding timed out'));
      }
    }, 10000);

    const onAbort = () => {
      if (!settled) {
        settled = true;
        cleanup();
        img.src = '';
        objectUrlManager.revoke(tempUrl);
        reject(new Error('Operation aborted'));
      }
    };

    if (signal) {
      signal.addEventListener('abort', onAbort);
    }

    img.onload = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve({ img, tempUrl });
      }
    };

    img.onerror = () => {
      if (!settled) {
        settled = true;
        cleanup();
        objectUrlManager.revoke(tempUrl);
        reject(new Error('Failed to load image. File may be corrupted.'));
      }
    };

    img.src = tempUrl;
  });
}

// ==========================================
// 1. IMAGE COMPRESSOR ADAPTER
// ==========================================
const compressorCapability: ToolCapability = {
  toolId: 'image-compressor',
  category: 'image',
  acceptedInputs: ['image'],
  producedOutput: 'image',
  supportsBatch: true,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: false,
  isBridge: true,
  maxInputSizeMB: 50,
};

export const imageCompressorAdapter: ToolAdapter = {
  capability: compressorCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset, parameters } = input;

    // Validate input
    const validation = validateImageFile(
      asset.raw instanceof File ? asset.raw : new File([asset.raw], asset.name, { type: asset.mimeType }),
      compressorCapability.maxInputSizeMB || 50
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

    const quality = clampNumber(Number(parameters.quality ?? 0.8), 0.1, 1.0, 0.8);
    const outputFormat = (parameters.outputFormat as string) || (asset.mimeType === 'image/png' ? 'image/png' : 'image/jpeg');

    let tempUrlToRevoke: string | null = null;
    try {
      const { img, tempUrl } = await loadImageElement(asset.raw, signal);
      tempUrlToRevoke = tempUrl;

      if (
        img.naturalWidth > MAX_CANVAS_DIMENSION ||
        img.naturalHeight > MAX_CANVAS_DIMENSION ||
        img.naturalWidth * img.naturalHeight > MAX_CANVAS_PIXELS
      ) {
        return {
          success: false,
          error: `Image dimensions (${img.naturalWidth}x${img.naturalHeight}) exceed safe limit.`,
          executionDurationMs: performance.now() - startTime,
        };
      }

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { success: false, error: 'Failed to obtain 2D canvas context', executionDurationMs: performance.now() - startTime };
      }

      if (outputFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputFormat, quality);
      });

      if (!blob) {
        return { success: false, error: 'Canvas encoding failed', executionDurationMs: performance.now() - startTime };
      }

      const sanitizedBase = sanitizeFilename(asset.name.replace(/\.[^/.]+$/, ''));
      const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/webp' ? 'webp' : 'png';
      const outputName = `compressed_${sanitizedBase}.${ext}`;

      const outputAsset = createFileAsset({
        raw: blob,
        name: outputName,
        mimeType: outputFormat,
        origin: 'tool_output',
        producerToolId: compressorCapability.toolId,
        parentAssetId: asset.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          originalBytes: asset.size,
          compressedBytes: blob.size,
          reductionPercent: Math.round(((asset.size - blob.size) / asset.size) * 100),
          width: canvas.width,
          height: canvas.height,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'Image compression failed',
        executionDurationMs: performance.now() - startTime,
      };
    } finally {
      if (tempUrlToRevoke) {
        objectUrlManager.revoke(tempUrlToRevoke);
      }
    }
  },
};

// ==========================================
// 2. IMAGE RESIZER ADAPTER
// ==========================================
const resizerCapability: ToolCapability = {
  toolId: 'image-resizer',
  category: 'image',
  acceptedInputs: ['image'],
  producedOutput: 'image',
  supportsBatch: true,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: false,
  isBridge: true,
  maxInputSizeMB: 50,
};

export const imageResizerAdapter: ToolAdapter = {
  capability: resizerCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset, parameters } = input;

    const validation = validateImageFile(
      asset.raw instanceof File ? asset.raw : new File([asset.raw], asset.name, { type: asset.mimeType }),
      resizerCapability.maxInputSizeMB || 50
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

    let tempUrlToRevoke: string | null = null;
    try {
      const { img, tempUrl } = await loadImageElement(asset.raw, signal);
      tempUrlToRevoke = tempUrl;

      const origW = img.naturalWidth;
      const origH = img.naturalHeight;

      let targetW = Number(parameters.width ?? origW);
      let targetH = Number(parameters.height ?? origH);
      const maintainRatio = parameters.maintainAspectRatio !== false;

      if (maintainRatio && origW > 0 && origH > 0) {
        if (parameters.width && !parameters.height) {
          targetH = Math.round((targetW * origH) / origW);
        } else if (parameters.height && !parameters.width) {
          targetW = Math.round((targetH * origW) / origH);
        }
      }

      targetW = clampNumber(Math.round(targetW), 1, MAX_CANVAS_DIMENSION, origW);
      targetH = clampNumber(Math.round(targetH), 1, MAX_CANVAS_DIMENSION, origH);

      if (targetW * targetH > MAX_CANVAS_PIXELS) {
        return {
          success: false,
          error: 'Target dimensions exceed maximum safe canvas pixels.',
          executionDurationMs: performance.now() - startTime,
        };
      }

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { success: false, error: 'Canvas context initialization failed', executionDurationMs: performance.now() - startTime };
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const outputFormat = (parameters.outputFormat as string) || asset.mimeType || 'image/png';
      const quality = clampNumber(Number(parameters.quality ?? 0.92), 0.1, 1.0, 0.92);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, outputFormat, quality);
      });

      if (!blob) {
        return { success: false, error: 'Canvas resizing export failed', executionDurationMs: performance.now() - startTime };
      }

      const sanitizedBase = sanitizeFilename(asset.name.replace(/\.[^/.]+$/, ''));
      const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/webp' ? 'webp' : 'png';
      const outputName = `resized_${sanitizedBase}_${targetW}x${targetH}.${ext}`;

      const outputAsset = createFileAsset({
        raw: blob,
        name: outputName,
        mimeType: outputFormat,
        origin: 'tool_output',
        producerToolId: resizerCapability.toolId,
        parentAssetId: asset.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          originalWidth: origW,
          originalHeight: origH,
          resizedWidth: targetW,
          resizedHeight: targetH,
          byteSize: blob.size,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'Image resizing failed',
        executionDurationMs: performance.now() - startTime,
      };
    } finally {
      if (tempUrlToRevoke) {
        objectUrlManager.revoke(tempUrlToRevoke);
      }
    }
  },
};

// ==========================================
// 3. IMAGE CONVERTER ADAPTER
// ==========================================
const converterCapability: ToolCapability = {
  toolId: 'image-converter',
  category: 'image',
  acceptedInputs: ['image'],
  producedOutput: 'image',
  supportsBatch: true,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: false,
  isBridge: true,
  maxInputSizeMB: 50,
};

export const imageConverterAdapter: ToolAdapter = {
  capability: converterCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset, parameters } = input;

    const validation = validateImageFile(
      asset.raw instanceof File ? asset.raw : new File([asset.raw], asset.name, { type: asset.mimeType }),
      converterCapability.maxInputSizeMB || 50
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

    const targetFormat = (parameters.targetFormat as string) || 'image/webp';
    const quality = clampNumber(Number(parameters.quality ?? 0.9), 0.1, 1.0, 0.9);

    let tempUrlToRevoke: string | null = null;
    try {
      const { img, tempUrl } = await loadImageElement(asset.raw, signal);
      tempUrlToRevoke = tempUrl;

      if (
        img.naturalWidth > MAX_CANVAS_DIMENSION ||
        img.naturalHeight > MAX_CANVAS_DIMENSION ||
        img.naturalWidth * img.naturalHeight > MAX_CANVAS_PIXELS
      ) {
        return {
          success: false,
          error: 'Image dimensions exceed safe canvas limit.',
          executionDurationMs: performance.now() - startTime,
        };
      }

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { success: false, error: 'Canvas context initialization failed', executionDurationMs: performance.now() - startTime };
      }

      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, targetFormat, quality);
      });

      if (!blob) {
        return { success: false, error: 'Format conversion failed', executionDurationMs: performance.now() - startTime };
      }

      const extMap: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
      };
      const newExt = extMap[targetFormat] || 'webp';
      const sanitizedBase = sanitizeFilename(asset.name.replace(/\.[^/.]+$/, ''));
      const outputName = `converted_${sanitizedBase}.${newExt}`;

      const outputAsset = createFileAsset({
        raw: blob,
        name: outputName,
        mimeType: targetFormat,
        origin: 'tool_output',
        producerToolId: converterCapability.toolId,
        parentAssetId: asset.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          originalFormat: asset.mimeType,
          convertedFormat: targetFormat,
          originalSize: asset.size,
          convertedSize: blob.size,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'Image conversion failed',
        executionDurationMs: performance.now() - startTime,
      };
    } finally {
      if (tempUrlToRevoke) {
        objectUrlManager.revoke(tempUrlToRevoke);
      }
    }
  },
};
