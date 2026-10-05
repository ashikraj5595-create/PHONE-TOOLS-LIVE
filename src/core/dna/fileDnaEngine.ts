import { FileAsset } from '../types/asset';
import {
  FileDNA,
  UniversalDNA,
  ImageSpecificDNA,
  PdfSpecificDNA,
  TextSpecificDNA,
  QrSpecificDNA,
  FileDNAHealth,
  MediaType,
} from '../types/dna';
import {
  validateImageFile,
  validatePdfFile,
  MAX_CANVAS_DIMENSION,
  MAX_CANVAS_PIXELS,
  isValidHttpUrl,
} from '../../lib/security';
import { objectUrlManager } from '../memory/objectUrlManager';

/**
 * Options for configuring File DNA analysis.
 */
export interface FileDnaOptions {
  /**
   * Whether to compute a SHA-256 content hash.
   * Default: false (to prevent heavy ArrayBuffer allocation on mobile).
   */
  includeHash?: boolean;

  /**
   * Whether to scan an image for embedded QR codes.
   * Default: false (to avoid heavy canvas pixel scanning on every intake).
   */
  includeQr?: boolean;
}

/**
 * Known text extensions for accurate fallback classification.
 */
const TEXT_EXTENSIONS = new Set([
  'txt', 'csv', 'tsv', 'md', 'markdown', 'json', 'xml', 'yaml', 'yml',
  'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'log', 'sql', 'env',
]);

/**
 * Formats byte size into human-readable representation.
 */
function formatByteSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, units.length - 1);
  const val = parseFloat((bytes / Math.pow(k, idx)).toFixed(2));
  return `${val} ${units[idx]}`;
}

/**
 * Computes greatest common divisor for aspect ratio simplification.
 */
function computeGcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/**
 * Derives simplified aspect ratio string from dimensions.
 */
function deriveAspectRatio(width: number, height: number): string {
  if (width <= 0 || height <= 0) return '0:0';
  const divisor = computeGcd(width, height);
  const rw = width / divisor;
  const rh = height / divisor;

  // Use simple ratio if terms are small, else decimal ratio
  if (rw <= 32 && rh <= 32) {
    return `${rw}:${rh}`;
  }
  const ratio = (width / height).toFixed(2);
  return `${ratio}:1`;
}

/**
 * Classifies media type from MIME type and extension.
 */
function classifyMediaType(mime: string, ext: string): MediaType {
  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'ico'].includes(ext)) {
    return 'image';
  }
  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (mime.startsWith('text/') || TEXT_EXTENSIONS.has(ext)) {
    return 'text';
  }
  return 'binary';
}

/**
 * PHONE TOOLS — File DNA Engine
 *
 * Performs non-destructive, client-side diagnostic analysis on a FileAsset.
 * Invariants:
 * - ANALYZES ONLY: Does not mutate, transform, persist, or upload files.
 * - Mobile-safe: Expensive analysis (SHA-256, QR scan) is strictly opt-in.
 * - Zero persistent object URLs: Temporary probe URLs are revoked immediately.
 * - Framework-independent: Pure TypeScript; no UI or React context dependencies.
 */
export async function analyzeFileDNA(
  asset: FileAsset,
  options?: FileDnaOptions
): Promise<FileDNA> {
  const includeHash = options?.includeHash ?? false;
  const includeQr = options?.includeQr ?? false;

  const dotIdx = asset.name.lastIndexOf('.');
  const extension = dotIdx > 0 ? asset.name.substring(dotIdx + 1).toLowerCase() : '';
  const mimeType = asset.mimeType || asset.raw.type || 'application/octet-stream';
  const byteSize = asset.size;
  const humanSize = formatByteSize(byteSize);
  const mediaType = classifyMediaType(mimeType, extension);

  const lastModified = asset.raw instanceof File ? asset.raw.lastModified : undefined;

  // Optional on-demand cryptographic hash calculation
  let contentHash: string | undefined = undefined;
  if (includeHash) {
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
        const buffer = await asset.raw.arrayBuffer();
        const digest = await crypto.subtle.digest('SHA-256', buffer);
        contentHash = Array.from(new Uint8Array(digest))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
      }
    } catch {
      // Hash calculation failure should not fail overall analysis
      contentHash = undefined;
    }
  }

  const universal: UniversalDNA = {
    mediaType,
    byteSize,
    humanSize,
    extension,
    mimeType,
    lastModified,
    contentHash,
  };

  let imageDna: ImageSpecificDNA | undefined = undefined;
  let pdfDna: PdfSpecificDNA | undefined = undefined;
  let textDna: TextSpecificDNA | undefined = undefined;
  let qrDna: QrSpecificDNA | undefined = undefined;

  let isCorrupt = false;
  let isValidMime = true;
  let errorReason: string | undefined = undefined;

  // ==========================================
  // IMAGE ANALYSIS
  // ==========================================
  if (mediaType === 'image') {
    const fileWrapper = asset.raw instanceof File
      ? asset.raw
      : new File([asset.raw], asset.name, { type: mimeType });

    const check = validateImageFile(fileWrapper, 50);
    if (!check.valid) {
      isValidMime = false;
      errorReason = check.error;
    } else {
      let tempUrl: string | null = null;
      try {
        tempUrl = objectUrlManager.create(asset.raw);
        const dims = await new Promise<{ width: number; height: number } | null>((resolve) => {
          const img = new Image();
          let settled = false;

          // Conservative 5-second timeout guarding against malformed images
          const timer = setTimeout(() => {
            if (!settled) {
              settled = true;
              img.src = '';
              resolve(null);
            }
          }, 5000);

          img.onload = () => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve({ width: img.naturalWidth, height: img.naturalHeight });
            }
          };

          img.onerror = () => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve(null);
            }
          };

          img.src = tempUrl as string;
        });

        if (!dims || dims.width === 0 || dims.height === 0) {
          isCorrupt = true;
          errorReason = 'Image data could not be decoded.';
        } else {
          const { width, height } = dims;
          const megapixels = parseFloat(((width * height) / 1_000_000).toFixed(2));
          const exceedsCanvasLimit =
            width > MAX_CANVAS_DIMENSION ||
            height > MAX_CANVAS_DIMENSION ||
            width * height > MAX_CANVAS_PIXELS;
          const aspectRatio = deriveAspectRatio(width, height);
          const isAnimated = extension === 'gif' || mimeType === 'image/gif' ? true : undefined;

          imageDna = {
            width,
            height,
            aspectRatio,
            megapixels,
            exceedsCanvasLimit,
            isAnimated,
          };

          // Optional QR analysis (explicit opt-in only)
          if (includeQr) {
            try {
              qrDna = await scanImageForQr(asset.raw);
            } catch {
              // Ignore optional QR scan failure
              qrDna = undefined;
            }
          }
        }
      } catch {
        isCorrupt = true;
        errorReason = 'Image analysis failed.';
      } finally {
        if (tempUrl) {
          objectUrlManager.revoke(tempUrl);
        }
      }
    }
  }

  // ==========================================
  // PDF ANALYSIS (Dynamic import only)
  // ==========================================
  else if (mediaType === 'pdf') {
    const fileWrapper = asset.raw instanceof File
      ? asset.raw
      : new File([asset.raw], asset.name, { type: mimeType });

    const check = validatePdfFile(fileWrapper, 50);
    if (!check.valid) {
      isValidMime = false;
      errorReason = check.error;
    } else {
      let doc: { numPages: number; cleanup?: () => void; destroy?: () => void } | null = null;
      try {
        const arrayBuffer = await asset.raw.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');

        // Dynamically ensure worker is configured if needed
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          try {
            const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
          } catch {
            // Worker setup fallback
          }
        }

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        doc = await loadingTask.promise;

        pdfDna = {
          pageCount: doc.numPages,
          isEncrypted: false,
        };
      } catch (err: unknown) {
        const errName = (err as { name?: string })?.name;
        if (errName === 'PasswordException') {
          pdfDna = {
            pageCount: 0,
            isEncrypted: true,
          };
        } else {
          isCorrupt = true;
          errorReason = 'PDF file is corrupted or unreadable.';
        }
      } finally {
        if (doc) {
          try {
            if (typeof doc.cleanup === 'function') doc.cleanup();
            if (typeof doc.destroy === 'function') doc.destroy();
          } catch {
            // Ignore cleanup failure
          }
        }
      }
    }
  }

  // ==========================================
  // TEXT ANALYSIS (Clamped to 500,000 characters)
  // ==========================================
  else if (mediaType === 'text') {
    try {
      // Bounded linear read up to 500,000 characters
      const slice = asset.raw.slice(0, 500_000);
      const text = await slice.text();

      const charCount = text.length;
      const trimmed = text.trim();
      const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
      const lineCount = text ? text.split(/\r\n|\r|\n/).length : 0;
      const nonWhitespaceCount = text.replace(/\s/g, '').length;
      const whitespaceRatio = charCount > 0
        ? parseFloat(((charCount - nonWhitespaceCount) / charCount).toFixed(3))
        : 0;

      textDna = {
        charCount,
        wordCount,
        lineCount,
        whitespaceRatio,
      };
    } catch {
      isCorrupt = true;
      errorReason = 'Text content could not be read.';
    }
  }

  const health: FileDNAHealth = {
    isCorrupt,
    isValidMime,
    errorReason,
  };

  return {
    universal,
    image: imageDna,
    pdf: pdfDna,
    text: textDna,
    qr: qrDna,
    health,
  };
}

/**
 * On-demand helper to inspect an image for QR codes.
 * Dynamically loads jsQR and respects the 1600px dimension ceiling.
 */
async function scanImageForQr(blob: Blob | File): Promise<QrSpecificDNA | undefined> {
  let tempUrl: string | null = null;
  try {
    const { default: jsQR } = await import('jsqr');
    tempUrl = objectUrlManager.create(blob);

    const img = await new Promise<HTMLImageElement | null>((resolve) => {
      const el = new Image();
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          el.src = '';
          resolve(null);
        }
      }, 5000);

      el.onload = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(el);
        }
      };
      el.onerror = () => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(null);
        }
      };
      el.src = tempUrl as string;
    });

    if (!img) return undefined;

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
    if (!ctx) return undefined;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imgData.data, imgData.width, imgData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (!code || !code.data) return undefined;

    const payload = code.data;
    const isSafeUrl = isValidHttpUrl(payload);
    let payloadType: 'url' | 'text' | 'wifi' | 'contact' | 'unknown' = 'text';

    if (isSafeUrl) {
      payloadType = 'url';
    } else if (payload.startsWith('WIFI:')) {
      payloadType = 'wifi';
    } else if (payload.startsWith('BEGIN:VCARD') || payload.startsWith('MECARD:')) {
      payloadType = 'contact';
    }

    return {
      detectedPayload: payload,
      payloadType,
      isSafeUrl,
    };
  } finally {
    if (tempUrl) {
      objectUrlManager.revoke(tempUrl);
    }
  }
}
