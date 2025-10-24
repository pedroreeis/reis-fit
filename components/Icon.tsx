
import React from 'react';
import {
  Home,
  Dumbbell,
  History,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  Save,
  Play,
  Check,
  X,
  Timer,
  MoreVertical
} from 'lucide-react';

export type IconName =
  | 'Home'
  | 'Dumbbell'
  | 'History'
  | 'Settings'
  | 'Plus'
  | 'ChevronLeft'
  | 'ChevronRight'
  | 'Trash2'
  | 'Edit'
  | 'Save'
  | 'Play'
  | 'Check'
  | 'X'
  | 'Timer'
  | 'MoreVertical';


const icons: { [key in IconName]: React.ElementType } = {
  Home,
  Dumbbell,
  History,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Edit,
  Save,
  Play,
  Check,
  X,
  Timer,
  MoreVertical
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, size = 24, className, ...props }) => {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} {...props} />;
};

export default Icon;
