import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { NextAction } from '../../core/types/workflow';
import { getToolById } from '../../registry/toolRegistry';
import { useLanguage } from '../../context/LanguageContext';
import { ToolIcon } from './ToolIcon';

interface NextActionsBarProps {
  readonly actions: readonly NextAction[];
  readonly onSelect: (action: NextAction) => void;
  readonly className?: string;
}

/**
 * PHONE TOOLS — Smart Next Actions Bar
 *
 * Renders a maximum of 3 prioritized, contextual next actions.
 * Guarantees:
 * - Pure presentation component: No file processing, no automatic navigation.
 * - Accessible: Minimum 44px touch targets, visible focus states, Enter/Space activation.
 * - Reduced motion compatible.
 * - Deterministic: Preserves order of incoming actions.
 * - Safe: No raw HTML, zero dynamic code evaluation.
 */
export const NextActionsBar: React.FC<NextActionsBarProps> = ({
  actions,
  onSelect,
  className = '',
}) => {
  const { t, tTool } = useLanguage();

  if (!actions || actions.length === 0) return null;

  const displayActions = actions.slice(0, 3);

  return (
    <div
      role="region"
      aria-label={t('suggested_next_steps') || 'Suggested Next Steps'}
      className={`space-y-2.5 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <Sparkles className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
        <span>{t('suggested_next_steps') || 'Suggested Next Steps'}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {displayActions.map((action) => {
          const tool = getToolById(action.targetToolId);
          const localizedTool = tTool(action.targetToolId);
          const toolName = localizedTool?.name || tool?.name || action.targetToolId;
          const translatedLabel = t(action.labelKey);
          const displayLabel =
            translatedLabel && translatedLabel !== action.labelKey
              ? translatedLabel
              : toolName;

          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelect(action)}
              className="group inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-slate-500 active:scale-[0.98]"
              aria-label={`Next action: ${displayLabel}`}
            >
              {tool?.icon && (
                <div className="flex h-5 w-5 items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                  <ToolIcon name={tool.icon} className="h-4 w-4" />
                </div>
              )}
              <span className="truncate">{displayLabel}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 group-hover:translate-x-0.5 transition-transform motion-reduce:transition-none" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
