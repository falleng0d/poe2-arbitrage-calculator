import {
  Coins,
  Crown,
  Diamond,
  DollarSign,
  Euro,
  Shield,
  Star,
  Zap,
  LucideIcon,
} from 'lucide-react';

export interface IconOption {
  name: string;
  icon: LucideIcon;
}

export const PRESET_ICONS: IconOption[] = [
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Euro', icon: Euro },
  { name: 'Coins', icon: Coins },
  { name: 'Star', icon: Star },
  { name: 'Zap', icon: Zap },
  { name: 'Diamond', icon: Diamond },
  { name: 'Crown', icon: Crown },
  { name: 'Shield', icon: Shield },
];

// Utility function to get icon component by name
export const getIconComponent = (iconName: string): LucideIcon => {
  const presetIcon = PRESET_ICONS.find(icon => icon.name === iconName);
  return presetIcon?.icon || DollarSign;
};
