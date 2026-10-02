import React, { useMemo } from 'react';
import { getToolById } from '../../registry/toolRegistry';
import { ToolCard } from '../cards/ToolCard';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles } from 'lucide-react';

interface SmartSuggestionsProps {
  currentToolId: string;
}

const WORKFLOW_MAP: Record<string, string[]> = {
  // Image workflows
  'image-compressor': ['image-resizer', 'image-converter', 'image-cropper'],
  'image-resizer': ['image-compressor', 'image-cropper', 'image-converter'],
  'image-cropper': ['image-resizer', 'image-compressor', 'image-converter'],
  'image-converter': ['image-compressor', 'image-to-pdf', 'image-resizer'],

  // PDF workflows
  'image-to-pdf': ['pdf-to-image', 'image-compressor', 'image-converter'],
  'pdf-to-image': ['image-to-pdf', 'image-compressor', 'image-resizer'],

  // Text workflows
  'text-counter': ['case-converter', 'text-cleaner'],
  'text-cleaner': ['case-converter', 'text-counter'],
  'case-converter': ['text-cleaner', 'text-counter'],

  // QR workflows
  'qr-scanner': ['qr-generator', 'text-cleaner'],
  'qr-generator': ['qr-scanner', 'text-counter'],

  // Calculators & Converters
  'percentage-calculator': ['discount-calculator', 'age-calculator'],
  'discount-calculator': ['percentage-calculator', 'unit-converter'],
  'age-calculator': ['percentage-calculator', 'unit-converter'],
  'unit-converter': ['data-storage-converter', 'percentage-calculator'],
  'data-storage-converter': ['unit-converter', 'image-compressor'],

  // Security
  'password-generator': ['qr-generator', 'text-cleaner'],
};

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ currentToolId }) => {
  const { t } = useLanguage();

  const suggestedTools = useMemo(() => {
    const ids = WORKFLOW_MAP[currentToolId] || [];
    return ids
      .filter((id) => id !== currentToolId)
      .slice(0, 3)
      .map((id) => getToolById(id))
      .filter((tool): tool is NonNullable<typeof tool> => !!tool);
  }, [currentToolId]);

  if (suggestedTools.length === 0) return null;

  return (
    <section
      aria-label={t('you_may_also_need') || 'You may also need'}
      className="space-y-3 transition-opacity duration-300 ease-out motion-reduce:transition-none"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5" />
        </div>
        <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white">
          {t('you_may_also_need') || 'You may also need'}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {suggestedTools.map((tool) => (
          <ToolCard key={`suggest-${tool.id}`} tool={tool} variant="compact" />
        ))}
      </div>
    </section>
  );
};
