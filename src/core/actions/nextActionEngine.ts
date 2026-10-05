import { FileAsset } from '../types/asset';
import { NextAction, NextActionPriority } from '../types/workflow';

/**
 * Contextual configuration for deriving next actions.
 */
export interface NextActionContext {
  /** Explicit producer tool ID if not already captured in asset.producerToolId */
  readonly producerToolId?: string;
  /** Restricts suggestions strictly to headless, workflow-chainable operations */
  readonly workflowOnly?: boolean;
}

/**
 * Set of registered workflow-compatible tool IDs.
 * Used for filtering when workflowOnly=true.
 */
const WORKFLOW_COMPATIBLE_TOOLS: ReadonlySet<string> = new Set<string>([
  'image-compressor',
  'image-resizer',
  'image-converter',
  'image-to-pdf',
  'pdf-to-image',
  'text-cleaner',
  'case-converter',
  'qr-generator',
  'qr-scanner',
]);

interface ActionBlueprint {
  readonly id: string;
  readonly targetToolId: string;
  readonly labelKey: string;
  readonly reasonKey: string;
  readonly priority: NextActionPriority;
  readonly prefillParams?: Readonly<Record<string, unknown>>;
}

/**
 * Static rule-based mappings of producerToolId -> prioritized ActionBlueprints.
 */
const PRODUCER_RULES: Readonly<Record<string, readonly ActionBlueprint[]>> = {
  'image-compressor': [
    {
      id: 'compressor-to-converter',
      targetToolId: 'image-converter',
      labelKey: 'actions.convert_format',
      reasonKey: 'actions.reasons.convert_modern',
      priority: 'high',
      prefillParams: { targetFormat: 'image/webp' },
    },
    {
      id: 'compressor-to-resizer',
      targetToolId: 'image-resizer',
      labelKey: 'actions.resize_image',
      reasonKey: 'actions.reasons.adjust_dimensions',
      priority: 'medium',
    },
    {
      id: 'compressor-to-pdf',
      targetToolId: 'image-to-pdf',
      labelKey: 'actions.make_pdf',
      reasonKey: 'actions.reasons.document_package',
      priority: 'medium',
    },
    {
      id: 'compressor-to-cropper',
      targetToolId: 'image-cropper',
      labelKey: 'actions.crop_image',
      reasonKey: 'actions.reasons.adjust_framing',
      priority: 'low',
    },
  ],

  'image-resizer': [
    {
      id: 'resizer-to-converter',
      targetToolId: 'image-converter',
      labelKey: 'actions.convert_format',
      reasonKey: 'actions.reasons.convert_modern',
      priority: 'high',
      prefillParams: { targetFormat: 'image/webp' },
    },
    {
      id: 'resizer-to-pdf',
      targetToolId: 'image-to-pdf',
      labelKey: 'actions.make_pdf',
      reasonKey: 'actions.reasons.document_package',
      priority: 'medium',
    },
    {
      id: 'resizer-to-cropper',
      targetToolId: 'image-cropper',
      labelKey: 'actions.crop_image',
      reasonKey: 'actions.reasons.adjust_framing',
      priority: 'low',
    },
  ],

  'image-converter': [
    {
      id: 'converter-to-compressor',
      targetToolId: 'image-compressor',
      labelKey: 'actions.compress_image',
      reasonKey: 'actions.reasons.reduce_size',
      priority: 'high',
    },
    {
      id: 'converter-to-resizer',
      targetToolId: 'image-resizer',
      labelKey: 'actions.resize_image',
      reasonKey: 'actions.reasons.adjust_dimensions',
      priority: 'medium',
    },
    {
      id: 'converter-to-pdf',
      targetToolId: 'image-to-pdf',
      labelKey: 'actions.make_pdf',
      reasonKey: 'actions.reasons.document_package',
      priority: 'low',
    },
  ],

  'image-cropper': [
    {
      id: 'cropper-to-compressor',
      targetToolId: 'image-compressor',
      labelKey: 'actions.compress_image',
      reasonKey: 'actions.reasons.reduce_size',
      priority: 'high',
    },
    {
      id: 'cropper-to-converter',
      targetToolId: 'image-converter',
      labelKey: 'actions.convert_format',
      reasonKey: 'actions.reasons.convert_modern',
      priority: 'medium',
      prefillParams: { targetFormat: 'image/webp' },
    },
    {
      id: 'cropper-to-pdf',
      targetToolId: 'image-to-pdf',
      labelKey: 'actions.make_pdf',
      reasonKey: 'actions.reasons.document_package',
      priority: 'low',
    },
  ],

  'image-to-pdf': [
    {
      id: 'pdf-to-images',
      targetToolId: 'pdf-to-image',
      labelKey: 'actions.extract_pages',
      reasonKey: 'actions.reasons.extract_images',
      priority: 'medium',
    },
  ],

  'pdf-to-image': [
    {
      id: 'pdf-extracted-to-compressor',
      targetToolId: 'image-compressor',
      labelKey: 'actions.compress_image',
      reasonKey: 'actions.reasons.reduce_size',
      priority: 'high',
    },
    {
      id: 'pdf-extracted-to-converter',
      targetToolId: 'image-converter',
      labelKey: 'actions.convert_format',
      reasonKey: 'actions.reasons.convert_modern',
      priority: 'medium',
      prefillParams: { targetFormat: 'image/webp' },
    },
    {
      id: 'pdf-extracted-to-resizer',
      targetToolId: 'image-resizer',
      labelKey: 'actions.resize_image',
      reasonKey: 'actions.reasons.adjust_dimensions',
      priority: 'low',
    },
  ],

  'qr-scanner': [
    {
      id: 'qr-decoded-to-cleaner',
      targetToolId: 'text-cleaner',
      labelKey: 'actions.clean_text',
      reasonKey: 'actions.reasons.format_whitespace',
      priority: 'high',
    },
    {
      id: 'qr-decoded-to-case',
      targetToolId: 'case-converter',
      labelKey: 'actions.change_case',
      reasonKey: 'actions.reasons.adjust_casing',
      priority: 'medium',
    },
    {
      id: 'qr-decoded-to-generator',
      targetToolId: 'qr-generator',
      labelKey: 'actions.create_qr',
      reasonKey: 'actions.reasons.shareable_qr',
      priority: 'low',
    },
  ],

  'text-cleaner': [
    {
      id: 'cleaner-to-qr',
      targetToolId: 'qr-generator',
      labelKey: 'actions.create_qr',
      reasonKey: 'actions.reasons.shareable_qr',
      priority: 'high',
    },
    {
      id: 'cleaner-to-case',
      targetToolId: 'case-converter',
      labelKey: 'actions.change_case',
      reasonKey: 'actions.reasons.adjust_casing',
      priority: 'medium',
    },
    {
      id: 'cleaner-to-counter',
      targetToolId: 'text-counter',
      labelKey: 'actions.count_stats',
      reasonKey: 'actions.reasons.inspect_metrics',
      priority: 'low',
    },
  ],

  'case-converter': [
    {
      id: 'case-to-qr',
      targetToolId: 'qr-generator',
      labelKey: 'actions.create_qr',
      reasonKey: 'actions.reasons.shareable_qr',
      priority: 'high',
    },
    {
      id: 'case-to-cleaner',
      targetToolId: 'text-cleaner',
      labelKey: 'actions.clean_text',
      reasonKey: 'actions.reasons.format_whitespace',
      priority: 'medium',
    },
    {
      id: 'case-to-counter',
      targetToolId: 'text-counter',
      labelKey: 'actions.count_stats',
      reasonKey: 'actions.reasons.inspect_metrics',
      priority: 'low',
    },
  ],

  'qr-generator': [
    {
      id: 'qr-generated-to-pdf',
      targetToolId: 'image-to-pdf',
      labelKey: 'actions.make_pdf',
      reasonKey: 'actions.reasons.document_package',
      priority: 'high',
    },
    {
      id: 'qr-generated-to-resizer',
      targetToolId: 'image-resizer',
      labelKey: 'actions.resize_image',
      reasonKey: 'actions.reasons.adjust_dimensions',
      priority: 'medium',
    },
    {
      id: 'qr-generated-to-compressor',
      targetToolId: 'image-compressor',
      labelKey: 'actions.compress_image',
      reasonKey: 'actions.reasons.reduce_size',
      priority: 'low',
    },
  ],
};

/**
 * Fallback rules based on MIME type when producerToolId is unavailable or has no specific mapping.
 */
const MIME_FALLBACK_RULES = {
  image: [
    {
      id: 'fallback-image-compressor',
      targetToolId: 'image-compressor',
      labelKey: 'actions.compress_image',
      reasonKey: 'actions.reasons.reduce_size',
      priority: 'high' as NextActionPriority,
    },
    {
      id: 'fallback-image-converter',
      targetToolId: 'image-converter',
      labelKey: 'actions.convert_format',
      reasonKey: 'actions.reasons.convert_modern',
      priority: 'medium' as NextActionPriority,
      prefillParams: { targetFormat: 'image/webp' },
    },
    {
      id: 'fallback-image-resizer',
      targetToolId: 'image-resizer',
      labelKey: 'actions.resize_image',
      reasonKey: 'actions.reasons.adjust_dimensions',
      priority: 'medium' as NextActionPriority,
    },
    {
      id: 'fallback-image-pdf',
      targetToolId: 'image-to-pdf',
      labelKey: 'actions.make_pdf',
      reasonKey: 'actions.reasons.document_package',
      priority: 'low' as NextActionPriority,
    },
    {
      id: 'fallback-image-cropper',
      targetToolId: 'image-cropper',
      labelKey: 'actions.crop_image',
      reasonKey: 'actions.reasons.adjust_framing',
      priority: 'low' as NextActionPriority,
    },
  ],

  pdf: [
    {
      id: 'fallback-pdf-to-image',
      targetToolId: 'pdf-to-image',
      labelKey: 'actions.extract_pages',
      reasonKey: 'actions.reasons.extract_images',
      priority: 'medium' as NextActionPriority,
    },
  ],

  text: [
    {
      id: 'fallback-text-cleaner',
      targetToolId: 'text-cleaner',
      labelKey: 'actions.clean_text',
      reasonKey: 'actions.reasons.format_whitespace',
      priority: 'high' as NextActionPriority,
    },
    {
      id: 'fallback-case-converter',
      targetToolId: 'case-converter',
      labelKey: 'actions.change_case',
      reasonKey: 'actions.reasons.adjust_casing',
      priority: 'medium' as NextActionPriority,
    },
    {
      id: 'fallback-qr-generator',
      targetToolId: 'qr-generator',
      labelKey: 'actions.create_qr',
      reasonKey: 'actions.reasons.shareable_qr',
      priority: 'medium' as NextActionPriority,
    },
    {
      id: 'fallback-text-counter',
      targetToolId: 'text-counter',
      labelKey: 'actions.count_stats',
      reasonKey: 'actions.reasons.inspect_metrics',
      priority: 'low' as NextActionPriority,
    },
  ],
};

/**
 * Predicts contextual follow-up actions for a given FileAsset.
 *
 * Guarantees:
 * - 100% Pure & Deterministic: Same asset + context always yields the exact same action list.
 * - Zero Side Effects: Creates no Object URLs, reads no files, writes no storage, performs no network requests.
 * - Producer Suppression: Never suggests the tool that just created the asset as an immediate next action.
 * - Workflow Compatibility Filter: When workflowOnly=true, only chainable headless tools are returned.
 */
export function predictNextActions(
  asset: FileAsset,
  context?: NextActionContext
): readonly NextAction[] {
  if (!asset) return [];

  const effectiveProducer = context?.producerToolId || asset.producerToolId;
  const isWorkflowOnly = Boolean(context?.workflowOnly);

  let candidates: readonly ActionBlueprint[] = [];

  // 1. Try producer-specific rule set first
  if (effectiveProducer && PRODUCER_RULES[effectiveProducer]) {
    candidates = PRODUCER_RULES[effectiveProducer];
  } else {
    // 2. MIME fallback
    const mime = (asset.mimeType || '').toLowerCase();
    const name = (asset.name || '').toLowerCase();

    if (mime.startsWith('image/')) {
      candidates = MIME_FALLBACK_RULES.image;
    } else if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      candidates = MIME_FALLBACK_RULES.pdf;
    } else if (
      mime.startsWith('text/') ||
      name.endsWith('.txt') ||
      name.endsWith('.md') ||
      name.endsWith('.json')
    ) {
      candidates = MIME_FALLBACK_RULES.text;
    }
  }

  // 3. Filter candidates
  const filtered = candidates.filter((action) => {
    // Suppress immediate repetition of the producer tool
    if (effectiveProducer && action.targetToolId === effectiveProducer) {
      return false;
    }

    // Suppress non-workflow tools if workflowOnly requested
    if (isWorkflowOnly && !WORKFLOW_COMPATIBLE_TOOLS.has(action.targetToolId)) {
      return false;
    }

    return true;
  });

  // 4. Return as immutable NextAction array preserving deterministic priority ordering
  return filtered.map((item) => ({
    id: item.id,
    targetToolId: item.targetToolId,
    labelKey: item.labelKey,
    reasonKey: item.reasonKey,
    priority: item.priority,
    ...(item.prefillParams ? { prefillParams: item.prefillParams } : {}),
  }));
}
