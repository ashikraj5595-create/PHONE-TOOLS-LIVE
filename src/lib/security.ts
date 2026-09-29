/**
 * PHONE TOOLS — Security Architecture & Hardening Utilities
 * Centralized, zero-dependency helpers for client-side security:
 * - File validation and size bounding
 * - Path traversal and filename sanitization
 * - Safe URL validation (preventing javascript:, data:, vbscript: schemes)
 * - Safe numeric bounding and NaN/Infinity defense
 * - Safe LocalStorage JSON parsing
 * - Cryptographically secure random value generation (Web Crypto API only)
 */

/**
 * Strips path traversal sequences, control characters, and reserved filesystem names.
 */
export function sanitizeFilename(filename: string, fallback = 'download'): string {
  if (!filename || typeof filename !== 'string') return fallback;

  // Remove directory traversal sequences and slashes
  let sanitized = filename
    .replace(/[/\\]+/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '') // Control characters
    .replace(/[<>:"|?*]/g, '_') // Windows reserved chars
    .trim();

  // Strip leading dots or underscores that could hide files or cause issues
  sanitized = sanitized.replace(/^[._]+/, '');

  // Prevent Windows reserved names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
  const baseName = sanitized.split('.')[0]?.toUpperCase() || '';
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  if (reservedNames.includes(baseName)) {
    sanitized = `file_${sanitized}`;
  }

  // Cap filename length to safe filesystem bounds (max 100 chars while preserving extension)
  if (sanitized.length > 100) {
    const extIndex = sanitized.lastIndexOf('.');
    if (extIndex > 0 && sanitized.length - extIndex <= 8) {
      const ext = sanitized.substring(extIndex);
      const name = sanitized.substring(0, 100 - ext.length);
      sanitized = `${name}${ext}`;
    } else {
      sanitized = sanitized.substring(0, 100);
    }
  }

  return sanitized || fallback;
}

/**
 * Validates whether a given string is a safe, valid web URL (http: or https: only).
 * Rejects javascript:, data:, vbscript:, file:, or malformed protocols.
 */
export function isValidHttpUrl(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  // Quick pre-filter against dangerous schemes before parsing
  const trimmed = str.trim();
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return false;

  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.hostname.length > 0 &&
      !parsed.username &&
      !parsed.password
    );
  } catch {
    return false;
  }
}

/**
 * Safely clamps numeric inputs to bounded finite ranges.
 * Defends against NaN, Infinity, -Infinity, and extreme values.
 */
export function clampNumber(
  val: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (!Number.isFinite(num)) return fallback;
  return Math.min(Math.max(num, min), max);
}

/**
 * Safe JSON parser for localStorage that never throws and validates against prototype pollution.
 */
export function safeJsonParse<T>(jsonStr: string | null, fallback: T): T {
  if (!jsonStr || typeof jsonStr !== 'string') return fallback;
  try {
    const parsed = JSON.parse(jsonStr, (key, value) => {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
    return (parsed !== null && parsed !== undefined) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Cryptographically secure random integer generation with rejection sampling
 * to eliminate modulo bias. Uses Web Crypto API exclusively.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 1) return 0;
  const cryptoObj =
    typeof window !== 'undefined' && window.crypto
      ? window.crypto
      : typeof globalThis !== 'undefined' && globalThis.crypto
      ? globalThis.crypto
      : null;

  if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
    throw new Error('Web Cryptography API is unavailable. Cryptographically secure random generator required.');
  }

  // Determine rejection limit to eliminate modulo bias
  const limit = Math.floor(0xffffffff / max) * max;
  const uintBuffer = new Uint32Array(1);

  do {
    cryptoObj.getRandomValues(uintBuffer);
  } while (uintBuffer[0] >= limit);

  return uintBuffer[0] % max;
}

/**
 * Validates image file type, size, and extension against allowlist.
 */
const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'ico']);
const ALLOWED_IMAGE_MIME_PREFIX = 'image/';

export function validateImageFile(
  file: File,
  maxSizeMB = 50
): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: 'No file provided' };

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_IMAGE_EXTENSIONS.has(ext) && !file.type.startsWith(ALLOWED_IMAGE_MIME_PREFIX)) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type || ext}). Allowed: PNG, JPG, WebP, GIF, BMP, SVG.`,
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `File size exceeds the ${maxSizeMB}MB limit.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty (0 bytes).',
    };
  }

  return { valid: true };
}

/**
 * Validates PDF file type, size, and extension.
 */
export function validatePdfFile(
  file: File,
  maxSizeMB = 50
): { valid: boolean; error?: string } {
  if (!file) return { valid: false, error: 'No file provided' };

  const isPdfType = file.type === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfType && !isPdfExt) {
    return {
      valid: false,
      error: 'Invalid file format. Please select a valid PDF document (.pdf).',
    };
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `PDF exceeds the ${maxSizeMB}MB limit.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'PDF file is empty (0 bytes).',
    };
  }

  return { valid: true };
}

/**
 * Maximum safe dimensions for canvas-based image processing to prevent
 * memory exhaustion / decompression bomb DoS attacks.
 */
export const MAX_CANVAS_DIMENSION = 8192; // 8K max width or height
export const MAX_CANVAS_PIXELS = 8192 * 8192; // 67 megapixels max area
