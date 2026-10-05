import { FileAsset } from '../types/asset';
import { InputType, OperationInput, OperationOutput } from '../types/workflow';
import { getToolAdapter } from '../adapters/registry';

/**
 * Configuration for an individual step in a linear workflow plan.
 */
export interface WorkflowStepConfig {
  readonly toolId: string;
  readonly parameters?: Readonly<Record<string, unknown>>;
}

/**
 * Execution plan for a linear workflow.
 */
export interface WorkflowExecutionPlan {
  readonly id: string;
  readonly initialAsset: FileAsset;
  readonly steps: readonly WorkflowStepConfig[];
}

/**
 * Result record for a single step in the workflow pipeline.
 */
export interface WorkflowStepResult {
  readonly stepIndex: number;
  readonly toolId: string;
  readonly status: 'completed' | 'failed' | 'skipped';
  readonly outputAsset?: FileAsset;
  readonly metrics?: Readonly<Record<string, string | number>>;
  readonly error?: string;
  readonly executionDurationMs: number;
}

/**
 * Overall outcome of executing a linear workflow.
 */
export interface WorkflowResult {
  readonly workflowId: string;
  readonly status: 'completed' | 'failed' | 'aborted';
  readonly initialAssetId: string;
  readonly finalAsset?: FileAsset;
  readonly stepResults: readonly WorkflowStepResult[];
  readonly totalDurationMs: number;
  readonly error?: string;
}

/**
 * Optional callbacks for monitoring linear workflow progress.
 * Callbacks are purely observational and cannot alter workflow control flow.
 */
export interface WorkflowExecutionOptions {
  readonly signal?: AbortSignal;
  readonly onStepStart?: (stepIndex: number, toolId: string) => void;
  readonly onStepComplete?: (stepIndex: number, toolId: string, outputAsset: FileAsset) => void;
  readonly onStepError?: (stepIndex: number, toolId: string, error: string) => void;
}

/**
 * Resolves a FileAsset's MIME type and filename into a supported InputType.
 */
export function resolveInitialInputType(mimeType: string, filename: string): InputType | null {
  const lowerMime = (mimeType || '').toLowerCase();
  const lowerName = (filename || '').toLowerCase();

  if (lowerMime.startsWith('image/')) return 'image';
  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf';
  if (
    lowerMime.startsWith('text/') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.json') ||
    lowerName.endsWith('.csv')
  ) {
    return 'text';
  }

  return null;
}

/**
 * Pre-flight validation of a linear workflow execution plan.
 * Verifies adapter presence and step-by-step type compatibility BEFORE any execution begins.
 */
export function validateWorkflowPlan(
  plan: WorkflowExecutionPlan
): { readonly valid: boolean; readonly error?: string } {
  if (!plan) {
    return { valid: false, error: 'Workflow plan cannot be null or undefined.' };
  }

  if (!plan.initialAsset || !plan.initialAsset.raw) {
    return { valid: false, error: 'Initial asset is missing or invalid.' };
  }

  const initialType = resolveInitialInputType(plan.initialAsset.mimeType, plan.initialAsset.name);
  if (!initialType) {
    return {
      valid: false,
      error: `Unsupported initial asset MIME type: ${plan.initialAsset.mimeType || 'unknown'}`,
    };
  }

  if (!Array.isArray(plan.steps) || plan.steps.length === 0) {
    return { valid: false, error: 'Workflow plan must contain at least one step.' };
  }

  let currentType: InputType = initialType;

  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];
    if (!step || typeof step.toolId !== 'string') {
      return { valid: false, error: `Invalid step definition at index ${i}.` };
    }

    const adapter = getToolAdapter(step.toolId);
    if (!adapter) {
      return {
        valid: false,
        error: `Tool at step ${i} ('${step.toolId}') is not a registered workflow adapter.`,
      };
    }

    const { capability } = adapter;
    if (!capability.acceptedInputs.includes(currentType)) {
      return {
        valid: false,
        error: `Type mismatch at step ${i} ('${step.toolId}'): Expected one of [${capability.acceptedInputs.join(
          ', '
        )}], received '${currentType}'.`,
      };
    }

    const produced = capability.producedOutput;
    if (produced !== 'image' && produced !== 'pdf' && produced !== 'text') {
      // Non-asset outputs (e.g. metrics, number, none) are terminal and cannot feed further steps
      if (i < plan.steps.length - 1) {
        return {
          valid: false,
          error: `Step ${i} ('${step.toolId}') produces terminal output type '${produced}' and cannot be followed by subsequent steps.`,
        };
      }
    }

    currentType = produced as InputType;
  }

  return { valid: true };
}

/**
 * PHONE TOOLS — Universal Linear Workflow Engine
 *
 * Executes a verified linear workflow plan sequentially.
 *
 * Guarantees:
 * - 100% In-memory: Pipes FileAsset.raw directly between adapters; zero storage or network calls.
 * - Zero Unnecessary Object URLs: No intermediate Object URLs are allocated during execution.
 * - Fail-Safe Termination: Execution halts immediately upon error; remaining steps are marked 'skipped'.
 * - Lineage Preservation: The last valid asset produced prior to a failure or abort is retained.
 * - Cooperative Cancellation: Listens to AbortSignal before each step and propagates it to adapters.
 */
export async function executeWorkflow(
  plan: WorkflowExecutionPlan,
  options?: WorkflowExecutionOptions
): Promise<WorkflowResult> {
  const startTime = performance.now();

  // 1. Pre-flight Validation
  const validation = validateWorkflowPlan(plan);
  if (!validation.valid) {
    return {
      workflowId: plan.id,
      status: 'failed',
      initialAssetId: plan.initialAsset?.id || '',
      stepResults: [],
      totalDurationMs: performance.now() - startTime,
      error: validation.error || 'Workflow plan validation failed.',
    };
  }

  const stepResults: WorkflowStepResult[] = [];
  let currentAsset: FileAsset = plan.initialAsset;
  let lastSuccessfulAsset: FileAsset = plan.initialAsset;

  // 2. Sequential Step Execution
  for (let i = 0; i < plan.steps.length; i++) {
    const step = plan.steps[i];

    // Check cancellation prior to step execution
    if (options?.signal?.aborted) {
      for (let j = i; j < plan.steps.length; j++) {
        stepResults.push({
          stepIndex: j,
          toolId: plan.steps[j].toolId,
          status: 'skipped',
          executionDurationMs: 0,
        });
      }

      return {
        workflowId: plan.id,
        status: 'aborted',
        initialAssetId: plan.initialAsset.id,
        finalAsset: lastSuccessfulAsset,
        stepResults,
        totalDurationMs: performance.now() - startTime,
        error: 'Workflow was aborted by user.',
      };
    }

    const adapter = getToolAdapter(step.toolId)!;

    // Observational callback (exceptions isolated)
    try {
      options?.onStepStart?.(i, step.toolId);
    } catch {
      // Ignore callback errors
    }

    const stepStartTime = performance.now();
    let opOutput: OperationOutput;

    try {
      const opInput: OperationInput = {
        asset: currentAsset,
        parameters: step.parameters ?? {},
      };

      opOutput = await adapter.execute(opInput, options?.signal);
    } catch (err: unknown) {
      opOutput = {
        success: false,
        error: (err as Error).message || `Step ${i} ('${step.toolId}') failed unexpectedly.`,
        executionDurationMs: performance.now() - stepStartTime,
      };
    }

    // Check if cancellation fired during execution
    if (options?.signal?.aborted) {
      stepResults.push({
        stepIndex: i,
        toolId: step.toolId,
        status: 'skipped',
        executionDurationMs: opOutput.executionDurationMs,
      });

      for (let j = i + 1; j < plan.steps.length; j++) {
        stepResults.push({
          stepIndex: j,
          toolId: plan.steps[j].toolId,
          status: 'skipped',
          executionDurationMs: 0,
        });
      }

      return {
        workflowId: plan.id,
        status: 'aborted',
        initialAssetId: plan.initialAsset.id,
        finalAsset: lastSuccessfulAsset,
        stepResults,
        totalDurationMs: performance.now() - startTime,
        error: 'Workflow was aborted by user.',
      };
    }

    // Handle failure
    if (!opOutput.success || !opOutput.outputAsset) {
      const errorMsg = opOutput.error || `Step ${i} ('${step.toolId}') failed.`;

      stepResults.push({
        stepIndex: i,
        toolId: step.toolId,
        status: 'failed',
        error: errorMsg,
        executionDurationMs: opOutput.executionDurationMs,
      });

      try {
        options?.onStepError?.(i, step.toolId, errorMsg);
      } catch {
        // Ignore callback errors
      }

      // Skip remaining steps
      for (let j = i + 1; j < plan.steps.length; j++) {
        stepResults.push({
          stepIndex: j,
          toolId: plan.steps[j].toolId,
          status: 'skipped',
          executionDurationMs: 0,
        });
      }

      return {
        workflowId: plan.id,
        status: 'failed',
        initialAssetId: plan.initialAsset.id,
        finalAsset: lastSuccessfulAsset,
        stepResults,
        totalDurationMs: performance.now() - startTime,
        error: errorMsg,
      };
    }

    // Handle successful step
    currentAsset = opOutput.outputAsset;
    lastSuccessfulAsset = currentAsset;

    stepResults.push({
      stepIndex: i,
      toolId: step.toolId,
      status: 'completed',
      outputAsset: currentAsset,
      metrics: opOutput.metrics,
      executionDurationMs: opOutput.executionDurationMs,
    });

    try {
      options?.onStepComplete?.(i, step.toolId, currentAsset);
    } catch {
      // Ignore callback errors
    }
  }

  // 3. Workflow Completion
  return {
    workflowId: plan.id,
    status: 'completed',
    initialAssetId: plan.initialAsset.id,
    finalAsset: currentAsset,
    stepResults,
    totalDurationMs: performance.now() - startTime,
  };
}
