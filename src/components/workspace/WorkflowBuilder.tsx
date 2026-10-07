import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileAsset } from '../../core/types/asset';
import { InputType } from '../../core/types/workflow';
import {
  WorkflowExecutionPlan,
  WorkflowStepConfig,
  executeWorkflow,
  validateWorkflowPlan,
  resolveInitialInputType,
} from '../../core/workflow/workflowEngine';
import { getCompatiblePresets, WorkflowPreset } from '../../core/workflow/workflowPresets';
import { predictNextActions } from '../../core/actions/nextActionEngine';
import {
  isWorkflowCompatible,
  getAllToolAdapters,
  getToolAdapter,
} from '../../core/adapters/registry';
import { getToolById } from '../../registry/toolRegistry';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { FileDnaCard } from '../common/FileDnaCard';
import { sanitizeFilename } from '../../lib/security';
import {
  Play,
  StopCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Download,
  ExternalLink,
  ChevronDown,
  Layers,
  Settings2,
} from 'lucide-react';

export type WorkflowExecutionState =
  | 'READY'
  | 'VALIDATING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ABORTED';

const MAX_WORKFLOW_STEPS = 5;

const TOOL_DISPLAY_NAMES: Record<string, string> = {
  'image-compressor': 'Image Compressor',
  'image-resizer': 'Image Resizer',
  'image-converter': 'Image Converter',
  'image-to-pdf': 'Image to PDF',
  'pdf-to-image': 'PDF to Image',
  'text-cleaner': 'Text Cleaner',
  'case-converter': 'Case Converter',
  'qr-generator': 'QR Generator',
  'qr-scanner': 'QR Scanner',
};

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

interface WorkflowBuilderProps {
  asset: FileAsset;
  onAdoptOutput: (outputAsset: FileAsset) => void;
  onCloseDrawer: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  asset,
  onAdoptOutput,
  onCloseDrawer,
}) => {
  const { navigate, showToast } = useApp();
  const { t, tTool } = useLanguage();

  // Workflow steps list (max 5)
  const [steps, setSteps] = useState<WorkflowStepConfig[]>([]);

  // Execution states
  const [executionState, setExecutionState] = useState<WorkflowExecutionState>('READY');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionDurationMs, setExecutionDurationMs] = useState<number>(0);
  const [finalOutputAsset, setFinalOutputAsset] = useState<FileAsset | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Clean steps when active asset changes
  useEffect(() => {
    setSteps([]);
    setExecutionState('READY');
    setActiveStepIndex(-1);
    setExecutionError(null);
    setFinalOutputAsset(null);
  }, [asset.id]);

  // Initial input type of the selected asset
  const initialInputType = useMemo(() => {
    return resolveInitialInputType(asset.mimeType, asset.name);
  }, [asset]);

  // Determine current output type at the end of the planned chain
  const currentChainOutputType = useMemo((): InputType | null => {
    if (!initialInputType) return null;
    if (steps.length === 0) return initialInputType;

    let current: InputType = initialInputType;
    for (const step of steps) {
      const adapter = getToolAdapter(step.toolId);
      if (!adapter) return null;
      const produced = adapter.capability.producedOutput;
      if (produced === 'image' || produced === 'pdf' || produced === 'text') {
        current = produced as InputType;
      } else {
        return null; // Terminal step reached
      }
    }
    return current;
  }, [initialInputType, steps]);

  // Compatible presets for the current asset
  const compatiblePresets = useMemo(() => {
    return getCompatiblePresets(asset);
  }, [asset]);

  // Next actions predicted for the current asset
  const nextActions = useMemo(() => {
    return predictNextActions(asset, { workflowOnly: false });
  }, [asset]);

  // Tools compatible with the current chain end that can be appended
  const availableNextTools = useMemo(() => {
    if (!currentChainOutputType || steps.length >= MAX_WORKFLOW_STEPS) {
      return [];
    }

    const adapters = getAllToolAdapters();
    return adapters.filter((adapter) => {
      // 1. Adapter must accept current output type
      if (!adapter.capability.acceptedInputs.includes(currentChainOutputType)) {
        return false;
      }

      // 2. Validate proposed single extension with workflow engine
      const testPlan: WorkflowExecutionPlan = {
        id: 'test-next-step',
        initialAsset: asset,
        steps: [...steps, { toolId: adapter.capability.toolId }],
      };

      const val = validateWorkflowPlan(testPlan);
      return val.valid;
    });
  }, [asset, steps, currentChainOutputType]);

  // Apply a deterministic workflow preset
  const handleApplyPreset = (preset: WorkflowPreset) => {
    if (executionState === 'PROCESSING' || executionState === 'VALIDATING') return;
    setSteps([...preset.steps]);
    setExecutionState('READY');
    setExecutionError(null);
    setFinalOutputAsset(null);
    showToast(`Loaded preset: ${preset.name}`, 'info');
  };

  // Add a step to the builder
  const handleAddStep = (toolId: string, defaultParams?: Record<string, unknown>) => {
    if (steps.length >= MAX_WORKFLOW_STEPS) {
      showToast(`Maximum ${MAX_WORKFLOW_STEPS} steps allowed.`, 'info');
      return;
    }

    const candidateStep: WorkflowStepConfig = {
      toolId,
      parameters: defaultParams || getDefaultParametersForTool(toolId),
    };

    const testPlan: WorkflowExecutionPlan = {
      id: 'step-candidate',
      initialAsset: asset,
      steps: [...steps, candidateStep],
    };

    const validation = validateWorkflowPlan(testPlan);
    if (!validation.valid) {
      showToast(validation.error || 'Cannot add incompatible step.', 'error');
      return;
    }

    setSteps((prev) => [...prev, candidateStep]);
    setExecutionState('READY');
    setExecutionError(null);
    setFinalOutputAsset(null);
  };

  // Remove a step at index
  const handleRemoveStep = (index: number) => {
    if (executionState === 'PROCESSING' || executionState === 'VALIDATING') return;
    setSteps((prev) => prev.filter((_, i) => i !== index));
    setExecutionState('READY');
    setExecutionError(null);
    setFinalOutputAsset(null);
  };

  // Clear all steps
  const handleClearSteps = () => {
    if (executionState === 'PROCESSING' || executionState === 'VALIDATING') return;
    setSteps([]);
    setExecutionState('READY');
    setExecutionError(null);
    setFinalOutputAsset(null);
  };

  // Default parameters per tool
  function getDefaultParametersForTool(toolId: string): Record<string, unknown> {
    switch (toolId) {
      case 'image-compressor':
        return { quality: 75, format: 'image/jpeg' };
      case 'image-resizer':
        return { width: 1200, height: 800 };
      case 'image-converter':
        return { format: 'image/webp' };
      case 'image-to-pdf':
        return { pageSize: 'a4', orientation: 'portrait', margin: 10 };
      case 'pdf-to-image':
        return { pageNumber: 1, format: 'image/png', scale: 1.5 };
      case 'text-cleaner':
        return {
          trimEdges: true,
          collapseSpaces: true,
          removeBlankLines: true,
          normalizeBreaks: true,
          stripTabs: false,
        };
      case 'case-converter':
        return { mode: 'title' };
      default:
        return {};
    }
  }

  // Update parameters of a specific step
  const handleUpdateStepParam = (
    stepIndex: number,
    paramKey: string,
    paramValue: unknown
  ) => {
    setSteps((prev) =>
      prev.map((step, idx) => {
        if (idx !== stepIndex) return step;
        return {
          ...step,
          parameters: {
            ...(step.parameters || {}),
            [paramKey]: paramValue,
          },
        };
      })
    );
  };

  // Execute the linear workflow
  const handleExecuteWorkflow = async () => {
    if (steps.length === 0) return;

    setExecutionState('VALIDATING');
    setExecutionError(null);
    setFinalOutputAsset(null);

    const plan: WorkflowExecutionPlan = {
      id: `workflow-${Date.now()}`,
      initialAsset: asset,
      steps,
    };

    const validation = validateWorkflowPlan(plan);
    if (!validation.valid) {
      setExecutionState('FAILED');
      setExecutionError(validation.error || 'Workflow plan validation failed.');
      showToast(validation.error || 'Validation failed', 'error');
      return;
    }

    setExecutionState('PROCESSING');
    setActiveStepIndex(0);

    const abortCtrl = new AbortController();
    abortControllerRef.current = abortCtrl;

    try {
      const result = await executeWorkflow(plan, {
        signal: abortCtrl.signal,
        onStepStart: (idx) => {
          setActiveStepIndex(idx);
        },
        onStepComplete: (idx) => {
          setActiveStepIndex(idx + 1);
        },
        onStepError: (_idx, _tid, err) => {
          setExecutionError(err);
        },
      });

      setExecutionDurationMs(Math.round(result.totalDurationMs));

      if (result.status === 'completed' && result.finalAsset) {
        setExecutionState('COMPLETED');
        setFinalOutputAsset(result.finalAsset);
        showToast(
          `Workflow finished successfully in ${Math.round(result.totalDurationMs)}ms`,
          'success'
        );
      } else if (result.status === 'aborted') {
        setExecutionState('ABORTED');
        setExecutionError('Workflow execution was cancelled by user.');
        showToast('Workflow cancelled', 'info');
      } else {
        setExecutionState('FAILED');
        setExecutionError(result.error || 'Workflow execution failed.');
        showToast(result.error || 'Execution failed', 'error');
      }
    } catch (err: unknown) {
      setExecutionState('FAILED');
      const msg = (err as Error).message || 'Unexpected failure during workflow execution.';
      setExecutionError(msg);
      showToast(msg, 'error');
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Abort execution
  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Download the final output asset
  const handleDownloadOutput = () => {
    if (!finalOutputAsset) return;
    const blob = finalOutputAsset.raw;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = sanitizeFilename(finalOutputAsset.name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('toast_download_started'), 'success');
  };

  const isBusy = executionState === 'VALIDATING' || executionState === 'PROCESSING';

  return (
    <div className="space-y-5">
      {/* 1. SMART NEXT ACTION BRIDGE */}
      {nextActions.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Smart Next Actions</span>
            </div>
            <span className="text-[11px] text-slate-400">Contextual Follow-ups</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nextActions.slice(0, 4).map((action) => {
              const tool = getToolById(action.targetToolId);
              const toolName = tool ? tTool(tool).name : TOOL_DISPLAY_NAMES[action.targetToolId] || action.targetToolId;
              const isCompatibleForChain =
                isWorkflowCompatible(action.targetToolId) &&
                steps.length < MAX_WORKFLOW_STEPS &&
                currentChainOutputType &&
                getToolAdapter(action.targetToolId)?.capability.acceptedInputs.includes(currentChainOutputType);

              return (
                <div
                  key={action.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col justify-between gap-2"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {toolName}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      Priority: {action.priority.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    {/* Choice A: Open in tool */}
                    {tool && (
                      <button
                        type="button"
                        onClick={() => {
                          navigate(tool.route);
                          onCloseDrawer();
                        }}
                        className="min-h-[44px] flex-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all"
                        aria-label={`Open ${toolName} page`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Open Tool</span>
                      </button>
                    )}

                    {/* Choice B: Add as next step in workflow */}
                    {isCompatibleForChain && (
                      <button
                        type="button"
                        onClick={() => handleAddStep(action.targetToolId, action.prefillParams as Record<string, unknown>)}
                        disabled={isBusy}
                        className="min-h-[44px] flex-1 px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[11px] font-bold flex items-center justify-center gap-1 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40"
                        aria-label={`Add ${toolName} to workflow chain`}
                      >
                        <Plus className="h-3 w-3" />
                        <span>+ Add Step</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DETERMINISTIC WORKFLOW PRESETS */}
      {compatiblePresets.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              <span>Workflow Presets</span>
            </span>
            <span className="text-[11px] text-slate-400">Pre-validated linear chains</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {compatiblePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                disabled={isBusy}
                className="min-h-[44px] p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-left hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all disabled:opacity-40"
              >
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {preset.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. WORKFLOW BUILDER & ORDERED STEP LIST */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-emerald-500" />
              <span>Workflow Pipeline</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Deterministic on-device execution ({steps.length}/{MAX_WORKFLOW_STEPS} steps)
            </p>
          </div>

          {steps.length > 0 && (
            <button
              type="button"
              onClick={handleClearSteps}
              disabled={isBusy}
              className="min-h-[44px] px-2 text-xs font-semibold text-rose-500 hover:text-rose-600 disabled:opacity-40"
            >
              Clear Steps
            </button>
          )}
        </div>

        {/* Vertical Pipeline Preview */}
        <div className="space-y-2 relative">
          {/* Input Anchor */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                1. Initial Input
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                {asset.name}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase">
              {initialInputType}
            </span>
          </div>

          {/* Planned Steps */}
          {steps.map((step, idx) => {
            const displayName = TOOL_DISPLAY_NAMES[step.toolId] || step.toolId;
            const adapter = getToolAdapter(step.toolId);
            const isProcessingThisStep = executionState === 'PROCESSING' && activeStepIndex === idx;
            const isFinishedStep =
              (executionState === 'PROCESSING' && activeStepIndex > idx) ||
              executionState === 'COMPLETED';

            return (
              <React.Fragment key={`${step.toolId}-${idx}`}>
                <div className="flex justify-center text-slate-300 dark:text-slate-700 py-0.5">
                  <ChevronDown className="h-4 w-4" />
                </div>

                <div
                  className={`p-3 rounded-xl border transition-all text-xs space-y-2 ${
                    isProcessingThisStep
                      ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 ring-1 ring-blue-500'
                      : isFinishedStep
                      ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {displayName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        → {adapter?.capability.producedOutput.toUpperCase()}
                      </span>
                      {!isBusy && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-rose-500"
                          aria-label={`Remove step ${idx + 1} (${displayName})`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Parameter Controls for Specific Steps */}
                  {step.toolId === 'image-compressor' && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Quality: {(step.parameters?.quality as number) || 75}%</span>
                      <input
                        type="range"
                        min="20"
                        max="95"
                        disabled={isBusy}
                        value={(step.parameters?.quality as number) || 75}
                        onChange={(e) =>
                          handleUpdateStepParam(idx, 'quality', parseInt(e.target.value, 10))
                        }
                        className="w-24 accent-slate-900 dark:accent-white"
                      />
                    </div>
                  )}

                  {step.toolId === 'case-converter' && (
                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Case:</span>
                      <div className="flex gap-1">
                        {(['title', 'upper', 'lower'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleUpdateStepParam(idx, 'mode', m)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              step.parameters?.mode === m
                                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                : 'text-slate-400'
                            }`}
                          >
                            {m.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}

          {/* Add Next Step Selector */}
          {steps.length < MAX_WORKFLOW_STEPS && availableNextTools.length > 0 && !isBusy && (
            <div className="pt-3">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                + Append Next Operation
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableNextTools.map((adapter) => {
                  const tid = adapter.capability.toolId;
                  const name = TOOL_DISPLAY_NAMES[tid] || tid;

                  return (
                    <button
                      key={tid}
                      type="button"
                      onClick={() => handleAddStep(tid)}
                      className="min-h-[44px] px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-slate-900 dark:hover:border-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                    >
                      <Plus className="h-3 w-3" />
                      <span>{name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. EXECUTION STATE STATUS / ERROR BANNER */}
        {executionError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5"
          >
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Execution Stopped</p>
              <p>{executionError}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Your original input and last valid assets are safe and unaffected.
              </p>
            </div>
          </div>
        )}

        {/* 5. SUCCESS RESULT & OUTPUT ADOPTION */}
        {executionState === 'COMPLETED' && finalOutputAsset && (
          <div
            role="status"
            className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Workflow Completed ({executionDurationMs}ms) •{' '}
                {formatBytes(finalOutputAsset.raw.size)}
              </span>
            </div>

            {/* Diagnostics on output asset */}
            <FileDnaCard asset={finalOutputAsset} />

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <button
                type="button"
                onClick={() => onAdoptOutput(finalOutputAsset)}
                className="min-h-[44px] flex-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                <span>Save to Workspace & Chain Next</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadOutput}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. PRIMARY WORKFLOW ACTION BUTTON (EXECUTE OR ABORT) */}
        <div className="pt-2">
          {isBusy ? (
            <button
              type="button"
              onClick={handleAbort}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold active:scale-95 transition-all"
            >
              <StopCircle className="h-4 w-4" />
              <span>
                Abort Workflow ({executionState === 'VALIDATING' ? 'Validating' : `Step ${activeStepIndex + 1}/${steps.length}`})
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExecuteWorkflow}
              disabled={steps.length === 0}
              className="min-h-[44px] w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold active:scale-95 transition-all shadow-xs disabled:opacity-40"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>
                {steps.length === 0
                  ? 'Add Steps or Choose a Preset'
                  : `Execute Workflow (${steps.length} ${steps.length === 1 ? 'Step' : 'Steps'})`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
