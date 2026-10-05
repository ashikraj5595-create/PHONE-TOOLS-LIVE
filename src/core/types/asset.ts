import { sanitizeFilename, getSecureRandomInt } from '../../lib/security';

export type FileAssetOrigin = 'user_upload' | 'tool_output';

/**
 * Secure unique identifier generator for FileAssets.
 * Uses Web Cryptography API with secure fallback.
 */
export function generateSecureAssetId(prefix = 'asset'): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = getSecureRandomInt(256);
    }
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${Date.now()}_${hex}`;
}

/**
 * PHONE TOOLS — FileAsset Domain Contract
 *
 * In-memory representation of any file ingested or generated during a session.
 *
 * Invariants:
 * - Never stores Base64 representations
 * - Never stores filesystem paths or user passwords
 * - Object URLs are LAZY/OPTIONAL to prevent unnecessary allocation
 * - Purely transient; zero persistent disk/cloud storage
 */
export interface FileAsset {
  /** Cryptographically safe random identifier */
  readonly id: string;

  /** Underlying binary source (File or Blob) */
  readonly raw: File | Blob;

  /** Sanitized filename including extension (e.g. "image_compressed.webp") */
  readonly name: string;

  /** Standardized MIME type */
  readonly mimeType: string;

  /** Payload size in bytes */
  readonly size: number;

  /**
   * Optional browser Object URL.
   * Only allocated when DOM display, download, or inspection requires it.
   */
  readonly objectUrl?: string;

  /** Epoch timestamp in milliseconds when the asset was created */
  readonly createdAt: number;

  /** Origin of the asset */
  readonly origin: FileAssetOrigin;

  /** If origin === 'tool_output', references the tool ID that created it */
  readonly producerToolId?: string;

  /** Optional parent asset ID for lineage tracking in chained workflows */
  readonly parentAssetId?: string;
}

export interface CreateFileAssetParams {
  raw: File | Blob;
  name?: string;
  mimeType?: string;
  origin?: FileAssetOrigin;
  producerToolId?: string;
  parentAssetId?: string;
  objectUrl?: string;
}

/**
 * Creates a validated, sanitized FileAsset from a File or Blob.
 */
export function createFileAsset(params: CreateFileAssetParams): FileAsset {
  const raw = params.raw;
  const rawName = params.name || (raw instanceof File ? raw.name : 'unnamed_asset');
  const sanitizedName = sanitizeFilename(rawName, 'asset');
  const mimeType = params.mimeType || raw.type || 'application/octet-stream';
  const size = raw.size;

  return {
    id: generateSecureAssetId(),
    raw,
    name: sanitizedName,
    mimeType,
    size,
    objectUrl: params.objectUrl,
    createdAt: Date.now(),
    origin: params.origin ?? (raw instanceof File ? 'user_upload' : 'tool_output'),
    producerToolId: params.producerToolId,
    parentAssetId: params.parentAssetId,
  };
}

export type WorkspaceItemStatus = 'idle' | 'analyzing' | 'processing' | 'ready' | 'error';

/**
 * WorkspaceItem represents a file asset tracked within the active session workspace.
 */
export interface WorkspaceItem {
  readonly id: string;
  readonly asset: FileAsset;
  readonly status: WorkspaceItemStatus;
  readonly statusMessage?: string;
  readonly outputHistory: readonly string[];
}
