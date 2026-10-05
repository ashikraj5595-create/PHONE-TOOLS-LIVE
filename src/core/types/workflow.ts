import { ToolCategory } from '../../types';
import { FileAsset } from './asset';

export type InputType = 'image' | 'pdf' | 'text' | 'qr_image' | 'number' | 'date';
export type OutputType = 'image' | 'pdf' | 'text' | 'metrics' | 'number' | 'none';

/**
 * Declares the architectural capabilities of an individual tool.
 */
export interface ToolCapability {
  readonly toolId: string;
  readonly category: ToolCategory;
  readonly acceptedInputs: readonly InputType[];
  readonly producedOutput: OutputType;
  readonly supportsBatch: boolean;
  readonly supportsHeadless: boolean;
  readonly isWorkflowCompatible: boolean;
  readonly isTerminal: boolean;
  readonly isBridge: boolean;
  readonly maxInputSizeMB?: number;
}

export type OperationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'aborted';

export interface OperationInput {
  readonly asset: FileAsset;
  readonly parameters: Readonly<Record<string, unknown>>;
}

export interface OperationOutput {
  readonly success: boolean;
  readonly outputAsset?: FileAsset;
  readonly metrics?: Readonly<Record<string, string | number>>;
  readonly error?: string;
  readonly executionDurationMs: number;
}

/**
 * Concrete single execution instance of a tool capability.
 */
export interface Operation {
  readonly id: string;
  readonly toolId: string;
  readonly input: OperationInput;
  readonly status: OperationStatus;
  readonly progress: number; // 0 to 100
  execute: (signal?: AbortSignal) => Promise<OperationOutput>;
  cancel: () => void;
}

export type WorkflowStepStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'skipped';

/**
 * Single step within a linear workflow pipeline.
 */
export interface WorkflowStep {
  readonly stepIndex: number;
  readonly toolId: string;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly status: WorkflowStepStatus;
  readonly intermediateAssetId?: string;
  readonly error?: string;
}

export type WorkflowStatus = 'draft' | 'running' | 'completed' | 'aborted' | 'failed';

/**
 * Linear workflow sequence contract (V1: Strictly linear, zero branching or loops).
 */
export interface Workflow {
  readonly id: string;
  readonly initialAssetId: string;
  readonly steps: readonly WorkflowStep[];
  readonly status: WorkflowStatus;
  readonly currentStepIndex: number;
  readonly finalAssetId?: string;
}

export type NextActionPriority = 'high' | 'medium' | 'low';

/**
 * Deterministic suggestion contract derived from current FileDNA and operation results.
 */
export interface NextAction {
  readonly id: string;
  readonly targetToolId: string;
  readonly labelKey: string;
  readonly reasonKey: string;
  readonly priority: NextActionPriority;
  readonly prefillParams?: Readonly<Record<string, unknown>>;
}
