import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PRESET_ICONS } from './iconConstants';

export interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  label?: string;
  className?: string;
  gridCols?: number;
}
export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onIconSelect,
  label = 'Select Icon',
  className = '',
  gridCols = 4,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div className={`grid grid-cols-${gridCols} gap-2`}>
        {PRESET_ICONS.map(({ name, icon: Icon }) => (
          <Button
            key={name}
            type="button"
            variant={selectedIcon === name ? 'default' : 'outline'}
            className="h-12 w-12 p-0"
            onClick={() => onIconSelect(name)}
          >
            <Icon className="h-6 w-6" />
          </Button>
        ))}
      </div>
    </div>
  );
};