import React from 'react';
import {
  Minimize2,
  Maximize2,
  Crop,
  RefreshCw,
  FileText,
  Image,
  FileSpreadsheet,
  Sparkles,
  Type,
  ScanLine,
  QrCode,
  Percent,
  Tag,
  Calendar,
  ArrowLeftRight,
  HardDrive,
  KeyRound,
  Wrench,
  LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  Minimize2,
  Maximize2,
  Crop,
  RefreshCw,
  FileText,
  Image,
  FileSpreadsheet,
  Sparkles,
  Type,
  ScanLine,
  QrCode,
  Percent,
  Tag,
  Calendar,
  ArrowLeftRight,
  HardDrive,
  KeyRound,
};

interface ToolIconProps extends LucideProps {
  name: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, ...props }) => {
  const IconComponent = ICON_MAP[name] || Wrench;
  return <IconComponent {...props} />;
};
