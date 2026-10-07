import { FileAsset } from '../types/asset';
import {
  WorkflowExecutionPlan,
  WorkflowStepConfig,
  validateWorkflowPlan,
  resolveInitialInputType,
} from './workflowEngine';
import { getToolAdapter } from '../adapters/registry';

/**
 * Definition contract for a deterministic, capability-aware workflow preset.
 */
export interface WorkflowPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: 'image' | 'text' | 'pdf';
  readonly steps: readonly WorkflowStepConfig[];
}

/**
 * Curated list of deterministic presets for common on-device tool chains.
 * Every step must resolve to a valid registered headless adapter.
 */
export const WORKFLOW_PRESETS: readonly WorkflowPreset[] = [
  // IMAGE PRESETS
  {
    id: 'preset-img-compress-convert',
    name: 'Compress → Convert',
    description: 'Compress image size and convert to modern WebP format',
    category: 'image',
    steps: [
      {
        toolId: 'image-compressor',
        parameters: { quality: 75, format: 'image/jpeg' },
      },
      {
        toolId: 'image-converter',
        parameters: { format: 'image/webp' },
      },
    ],
  },
  {
    id: 'preset-img-compress-resize',
    name: 'Compress → Resize',
    description: 'Compress file size and downscale dimensions to 1200x800',
    category: 'image',
    steps: [
      {
        toolId: 'image-compressor',
        parameters: { quality: 75, format: 'image/jpeg' },
      },
      {
        toolId: 'image-resizer',
        parameters: { width: 1200, height: 800 },
      },
    ],
  },
  {
    id: 'preset-img-resize-convert',
    name: 'Resize → Convert',
    description: 'Scale dimensions to 1200x800 and convert to WebP',
    category: 'image',
    steps: [
      {
        toolId: 'image-resizer',
        parameters: { width: 1200, height: 800 },
      },
      {
        toolId: 'image-converter',
        parameters: { format: 'image/webp' },
      },
    ],
  },
  {
    id: 'preset-img-to-pdf',
    name: 'Image → PDF',
    description: 'Compile image into a clean standardized A4 PDF document',
    category: 'image',
    steps: [
      {
        toolId: 'image-to-pdf',
        parameters: { pageSize: 'a4', orientation: 'portrait', margin: 10 },
      },
    ],
  },

  // TEXT PRESETS
  {
    id: 'preset-text-clean-case',
    name: 'Clean → Title Case',
    description: 'Strip excessive spaces and blank lines, then normalize to Title Case',
    category: 'text',
    steps: [
      {
        toolId: 'text-cleaner',
        parameters: {
          trimEdges: true,
          collapseSpaces: true,
          removeBlankLines: true,
          normalizeBreaks: true,
          stripTabs: false,
        },
      },
      {
        toolId: 'case-converter',
        parameters: { mode: 'title' },
      },
    ],
  },
];

/**
 * Returns only the presets that are strictly capability-compatible with the given asset.
 * Runs pre-flight type checking through validateWorkflowPlan.
 */
export function getCompatiblePresets(asset: FileAsset): readonly WorkflowPreset[] {
  if (!asset || !asset.raw) return [];

  const initialType = resolveInitialInputType(asset.mimeType, asset.name);
  if (!initialType) return [];

  return WORKFLOW_PRESETS.filter((preset) => {
    // 1. Quick category check
    if (preset.category !== initialType) return false;

    // 2. Adapter existence check
    for (const step of preset.steps) {
      if (!getToolAdapter(step.toolId)) return false;
    }

    // 3. Complete pre-flight validation check through workflowEngine
    const testPlan: WorkflowExecutionPlan = {
      id: `check-${preset.id}`,
      initialAsset: asset,
      steps: preset.steps,
    };

    const validation = validateWorkflowPlan(testPlan);
    return validation.valid;
  });
}
