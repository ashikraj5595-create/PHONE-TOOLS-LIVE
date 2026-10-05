import { ToolCapability, OperationInput, OperationOutput } from '../types/workflow';
import { createFileAsset } from '../types/asset';
import {
  validateImageFile,
  isValidHttpUrl,
  sanitizeFilename,
  clampNumber,
} from '../../lib/security';
import { objectUrlManager } from '../memory/objectUrlManager';
import { ToolAdapter } from './registry';

const MAX_QR_TEXT_LENGTH = 2000;
const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

// ==========================================
// 1. QR GENERATOR ADAPTER
// ==========================================
const qrGeneratorCapability: ToolCapability = {
  toolId: 'qr-generator',
  category: 'qr',
  acceptedInputs: ['text'],
  producedOutput: 'image',
  supportsBatch: true,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: false,
  isBridge: true,
  maxInputSizeMB: 1,
};

export const qrGeneratorAdapter: ToolAdapter = {
  capability: qrGeneratorCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset, parameters } = input;

    if (signal?.aborted) {
      return { success: false, error: 'Operation aborted', executionDurationMs: 0 };
    }

    try {
      // Obtain payload text from parameters or read from text asset
      let text = (parameters.text as string) || '';
      if (!text && asset) {
        text = await asset.raw.slice(0, MAX_QR_TEXT_LENGTH).text();
      }

      const trimmed = text.trim();
      if (!trimmed) {
        return { success: false, error: 'QR payload text is empty', executionDurationMs: performance.now() - startTime };
      }

      if (trimmed.length > MAX_QR_TEXT_LENGTH) {
        return {
          success: false,
          error: `Text exceeds maximum QR capacity of ${MAX_QR_TEXT_LENGTH} characters`,
          executionDurationMs: performance.now() - startTime,
        };
      }

      const errorCorrection = (parameters.errorCorrection as 'L' | 'M' | 'Q' | 'H') || 'M';
      const rawDark = (parameters.darkColor as string) || '#0f172a';
      const rawLight = (parameters.lightColor as string) || '#ffffff';
      const darkColor = HEX_COLOR_REGEX.test(rawDark) ? rawDark : '#0f172a';
      const lightColor = HEX_COLOR_REGEX.test(rawLight) ? rawLight : '#ffffff';
      const width = clampNumber(Number(parameters.width ?? 600), 120, 2048, 600);

      // Dynamic import
      const { default: QRCode } = await import('qrcode');

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, trimmed, {
        width,
        margin: 2,
        errorCorrectionLevel: errorCorrection,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (!blob) {
        return { success: false, error: 'QR canvas export failed', executionDurationMs: performance.now() - startTime };
      }

      const outputName = `qrcode_${Date.now()}.png`;

      const outputAsset = createFileAsset({
        raw: blob,
        name: outputName,
        mimeType: 'image/png',
        origin: 'tool_output',
        producerToolId: qrGeneratorCapability.toolId,
        parentAssetId: asset?.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          payloadLength: trimmed.length,
          dimension: width,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'QR generation failed',
        executionDurationMs: performance.now() - startTime,
      };
    }
  },
};

// ==========================================
// 2. QR SCANNER ADAPTER (FILE INPUT ONLY)
// CAMERA / MediaStream is STRICTLY UI-ONLY
// ==========================================
const qrScannerCapability: ToolCapability = {
  toolId: 'qr-scanner',
  category: 'qr',
  acceptedInputs: ['image'],
  producedOutput: 'text',
  supportsBatch: true,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: false,
  isBridge: true,
  maxInputSizeMB: 50,
};

export const qrScannerAdapter: ToolAdapter = {
  capability: qrScannerCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset } = input;

    const validation = validateImageFile(
      asset.raw instanceof File ? asset.raw : new File([asset.raw], asset.name, { type: asset.mimeType }),
      qrScannerCapability.maxInputSizeMB || 50
    );
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid image file for QR scanning.',
        executionDurationMs: performance.now() - startTime,
      };
    }

    if (signal?.aborted) {
      return { success: false, error: 'Operation aborted', executionDurationMs: 0 };
    }

    let tempUrl: string | null = null;
    try {
      const { default: jsQR } = await import('jsqr');

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      tempUrl = objectUrlManager.create(asset.raw);
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error('Failed to load image for QR scanning'));
        el.src = tempUrl as string;
      });

      const maxDim = 1600;
      let cw = img.naturalWidth;
      let ch = img.naturalHeight;
      if (cw > maxDim || ch > maxDim) {
        if (cw > ch) {
          ch = Math.round((ch * maxDim) / cw);
          cw = maxDim;
        } else {
          cw = Math.round((cw * maxDim) / ch);
          ch = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, cw);
      canvas.height = Math.max(1, ch);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return { success: false, error: 'Canvas initialization failed', executionDurationMs: performance.now() - startTime };
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      const code = jsQR(imgData.data, imgData.width, imgData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (!code || !code.data) {
        return {
          success: false,
          error: 'No readable QR code found in image',
          executionDurationMs: performance.now() - startTime,
        };
      }

      const payload = code.data;
      const isUrl = isValidHttpUrl(payload);

      const outputBlob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
      const sanitizedBase = sanitizeFilename(asset.name.replace(/\.[^/.]+$/, ''));
      const outputName = `decoded_qr_${sanitizedBase}.txt`;

      const outputAsset = createFileAsset({
        raw: outputBlob,
        name: outputName,
        mimeType: 'text/plain',
        origin: 'tool_output',
        producerToolId: qrScannerCapability.toolId,
        parentAssetId: asset.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          payloadLength: payload.length,
          isUrl: isUrl ? 1 : 0,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'QR code decoding failed',
        executionDurationMs: performance.now() - startTime,
      };
    } finally {
      if (tempUrl) {
        objectUrlManager.revoke(tempUrl);
      }
    }
  },
};
