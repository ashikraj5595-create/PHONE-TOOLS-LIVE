/**
 * PHONE TOOLS — File DNA Domain Contract
 *
 * Type contracts for diagnostic metadata extracted client-side.
 *
 * Invariants:
 * - Purely client-side analysis
 * - Lightweight & non-blocking: Expensive operations (like SHA-256) are strictly optional
 * - No raw-RGBA compression calculations to preserve mobile memory
 * - Readonly domain model
 */

export type MediaType = 'image' | 'pdf' | 'text' | 'qr' | 'binary';

export interface UniversalDNA {
  /** High-level media category */
  readonly mediaType: MediaType;

  /** File size in bytes */
  readonly byteSize: number;

  /** Human-formatted file size (e.g. "2.4 MB") */
  readonly humanSize: string;

  /** Lowercase file extension without dot (e.g. "png", "pdf") */
  readonly extension: string;

  /** Reported MIME type */
  readonly mimeType: string;

  /** Last modified epoch timestamp, if available from native File */
  readonly lastModified?: number;

  /**
   * Optional cryptographic hash (SHA-256).
   * Computed strictly on-demand (e.g., for deduplication) to avoid mobile intake bottlenecks.
   */
  readonly contentHash?: string;
}

export interface ImageSpecificDNA {
  /** Width in pixels */
  readonly width: number;

  /** Height in pixels */
  readonly height: number;

  /** Standard aspect ratio representation (e.g. "16:9", "1:1", "4:3") */
  readonly aspectRatio: string;

  /** Total megapixels (e.g. 12.2) */
  readonly megapixels: number;

  /** Whether image dimensions exceed the safe canvas limit (8192px / 67MP) */
  readonly exceedsCanvasLimit: boolean;

  /** Whether the image contains multiple animated frames (GIF/APNG) */
  readonly isAnimated?: boolean;
}

export interface PdfSpecificDNA {
  /** Total page count in document */
  readonly pageCount: number;

  /** Detected PDF specification version (e.g. "1.7") */
  readonly version?: string;

  /** Whether the document requires a password or encryption key to open */
  readonly isEncrypted: boolean;
}

export interface TextSpecificDNA {
  /** Total character count including whitespace */
  readonly charCount: number;

  /** Word count based on whitespace boundary splits */
  readonly wordCount: number;

  /** Total newline-delimited lines */
  readonly lineCount: number;

  /** Ratio of whitespace characters to total characters (0.0 to 1.0) */
  readonly whitespaceRatio: number;
}

export interface QrSpecificDNA {
  /** Decoded payload content if QR code was found */
  readonly detectedPayload?: string;

  /** Classified payload semantic type */
  readonly payloadType?: 'url' | 'text' | 'wifi' | 'contact' | 'unknown';

  /** Whether the payload URL passes security protocol allowlist */
  readonly isSafeUrl?: boolean;
}

export interface FileDNAHealth {
  /** True if file data failed decoding or threw an unrecoverable parse error */
  readonly isCorrupt: boolean;

  /** True if file conforms to expected MIME and header format standards */
  readonly isValidMime: boolean;

  /** User-readable explanation if health checks detected anomalies */
  readonly errorReason?: string;
}

export interface FileDNA {
  /** Universal metadata guaranteed for all files */
  readonly universal: UniversalDNA;

  /** Populated only if universal.mediaType === 'image' */
  readonly image?: ImageSpecificDNA;

  /** Populated only if universal.mediaType === 'pdf' */
  readonly pdf?: PdfSpecificDNA;

  /** Populated only if universal.mediaType === 'text' */
  readonly text?: TextSpecificDNA;

  /** Populated only if QR payload was analyzed */
  readonly qr?: QrSpecificDNA;

  /** Health, security, and integrity diagnostic results */
  readonly health: FileDNAHealth;
}
