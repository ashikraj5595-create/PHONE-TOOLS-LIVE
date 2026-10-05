import { ToolCapability, OperationInput, OperationOutput } from '../types/workflow';
import { createFileAsset } from '../types/asset';
import { sanitizeFilename } from '../../lib/security';
import { ToolAdapter } from './registry';

const MAX_TEXT_CHARS = 500_000;

// ==========================================
// 1. TEXT CLEANER ADAPTER
// ==========================================
const textCleanerCapability: ToolCapability = {
  toolId: 'text-cleaner',
  category: 'text',
  acceptedInputs: ['text'],
  producedOutput: 'text',
  supportsBatch: true,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: false,
  isBridge: false,
  maxInputSizeMB: 10,
};

export const textCleanerAdapter: ToolAdapter = {
  capability: textCleanerCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset, parameters } = input;

    if (signal?.aborted) {
      return { success: false, error: 'Operation aborted', executionDurationMs: 0 };
    }

    try {
      // Clamped read up to 500,000 characters
      const slice = asset.raw.slice(0, MAX_TEXT_CHARS);
      let res = await slice.text();

      const normalizeBreaks = parameters.normalizeBreaks !== false;
      const stripTabs = Boolean(parameters.stripTabs);
      const collapseSpaces = parameters.collapseSpaces !== false;
      const removeBlankLines = parameters.removeBlankLines !== false;
      const trimEdges = parameters.trimEdges !== false;

      if (normalizeBreaks) {
        res = res.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      }

      if (stripTabs) {
        res = res.replace(/\t+/g, ' ');
      }

      if (signal?.aborted) {
        return { success: false, error: 'Operation aborted', executionDurationMs: performance.now() - startTime };
      }

      if (collapseSpaces) {
        res = res
          .split('\n')
          .map((line) => line.replace(/[^\S\r\n]+/g, ' '))
          .join('\n');
      }

      if (removeBlankLines) {
        res = res
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .join('\n');
      }

      if (trimEdges) {
        res = res
          .split('\n')
          .map((line) => line.trim())
          .join('\n')
          .trim();
      }

      const outputBlob = new Blob([res], { type: 'text/plain;charset=utf-8' });
      const sanitizedBase = sanitizeFilename(asset.name.replace(/\.[^/.]+$/, ''));
      const outputName = `cleaned_${sanitizedBase}.txt`;

      const outputAsset = createFileAsset({
        raw: outputBlob,
        name: outputName,
        mimeType: 'text/plain',
        origin: 'tool_output',
        producerToolId: textCleanerCapability.toolId,
        parentAssetId: asset.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          originalLength: asset.size,
          cleanedLength: outputBlob.size,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'Text cleaning failed',
        executionDurationMs: performance.now() - startTime,
      };
    }
  },
};

// ==========================================
// 2. CASE CONVERTER ADAPTER
// ==========================================
const caseConverterCapability: ToolCapability = {
  toolId: 'case-converter',
  category: 'text',
  acceptedInputs: ['text'],
  producedOutput: 'text',
  supportsBatch: true,
  supportsHeadless: true,
  isWorkflowCompatible: true,
  isTerminal: false,
  isBridge: false,
  maxInputSizeMB: 10,
};

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'toggle';

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

function toSentenceCase(str: string): string {
  return str.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

function toToggleCase(str: string): string {
  return str
    .split('')
    .map((char) => (char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()))
    .join('');
}

export const caseConverterAdapter: ToolAdapter = {
  capability: caseConverterCapability,
  async execute(input: OperationInput, signal?: AbortSignal): Promise<OperationOutput> {
    const startTime = performance.now();
    const { asset, parameters } = input;

    if (signal?.aborted) {
      return { success: false, error: 'Operation aborted', executionDurationMs: 0 };
    }

    try {
      const slice = asset.raw.slice(0, MAX_TEXT_CHARS);
      const str = await slice.text();

      const mode = (parameters.mode as CaseMode) || 'title';
      let converted = str;

      switch (mode) {
        case 'upper':
          converted = str.toUpperCase();
          break;
        case 'lower':
          converted = str.toLowerCase();
          break;
        case 'title':
          converted = toTitleCase(str);
          break;
        case 'sentence':
          converted = toSentenceCase(str);
          break;
        case 'toggle':
          converted = toToggleCase(str);
          break;
        default:
          converted = str;
      }

      const outputBlob = new Blob([converted], { type: 'text/plain;charset=utf-8' });
      const sanitizedBase = sanitizeFilename(asset.name.replace(/\.[^/.]+$/, ''));
      const outputName = `converted_${mode}_${sanitizedBase}.txt`;

      const outputAsset = createFileAsset({
        raw: outputBlob,
        name: outputName,
        mimeType: 'text/plain',
        origin: 'tool_output',
        producerToolId: caseConverterCapability.toolId,
        parentAssetId: asset.id,
      });

      return {
        success: true,
        outputAsset,
        metrics: {
          mode,
          characterCount: converted.length,
        },
        executionDurationMs: performance.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: (err as Error).message || 'Case conversion failed',
        executionDurationMs: performance.now() - startTime,
      };
    }
  },
};
