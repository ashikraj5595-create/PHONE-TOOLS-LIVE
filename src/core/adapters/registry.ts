import { ToolCapability, OperationInput, OperationOutput } from '../types/workflow';

/**
 * Headless Tool Adapter contract for orchestration.
 */
export interface ToolAdapter {
  readonly capability: ToolCapability;
  execute: (input: OperationInput, signal?: AbortSignal) => Promise<OperationOutput>;
}

import {
  imageCompressorAdapter,
  imageResizerAdapter,
  imageConverterAdapter,
} from './imageAdapters';
import {
  imageToPdfAdapter,
  pdfToImageAdapter,
} from './pdfAdapters';
import {
  textCleanerAdapter,
  caseConverterAdapter,
} from './textAdapters';
import {
  qrGeneratorAdapter,
  qrScannerAdapter,
} from './qrAdapters';

/**
 * Registry of workflow-compatible headless tool adapters.
 * Camera/MediaStream QR scanning and standalone calculators are intentionally excluded.
 */
const ADAPTER_REGISTRY: ReadonlyMap<string, ToolAdapter> = new Map<string, ToolAdapter>([
  [imageCompressorAdapter.capability.toolId, imageCompressorAdapter],
  [imageResizerAdapter.capability.toolId, imageResizerAdapter],
  [imageConverterAdapter.capability.toolId, imageConverterAdapter],
  [imageToPdfAdapter.capability.toolId, imageToPdfAdapter],
  [pdfToImageAdapter.capability.toolId, pdfToImageAdapter],
  [textCleanerAdapter.capability.toolId, textCleanerAdapter],
  [caseConverterAdapter.capability.toolId, caseConverterAdapter],
  [qrGeneratorAdapter.capability.toolId, qrGeneratorAdapter],
  [qrScannerAdapter.capability.toolId, qrScannerAdapter],
]);

/**
 * Retrieves a headless ToolAdapter by toolId.
 */
export function getToolAdapter(toolId: string): ToolAdapter | undefined {
  return ADAPTER_REGISTRY.get(toolId);
}

/**
 * Returns all registered headless tool adapters.
 */
export function getAllToolAdapters(): readonly ToolAdapter[] {
  return Array.from(ADAPTER_REGISTRY.values());
}

/**
 * Checks if a tool has a registered workflow-compatible adapter.
 */
export function isWorkflowCompatible(toolId: string): boolean {
  return ADAPTER_REGISTRY.has(toolId);
}
