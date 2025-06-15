import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { loadAvailableIcons, IconOption } from './iconConstants';

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
  const [availableIcons, setAvailableIcons] = useState<IconOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIcons = async () => {
      try {
        const icons = await loadAvailableIcons();
        setAvailableIcons(icons);
      } catch (error) {
        console.error('Failed to load icons:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadIcons();
  }, []);

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Label>{label}</Label>
        <div className="text-sm text-muted-foreground">Loading icons...</div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      <div className={`grid grid-cols-${gridCols} gap-2 max-h-64 overflow-y-auto`}>
        {availableIcons.map(({ name, path }) => (
          <Button
            key={name}
            type="button"
            variant={selectedIcon === name ? 'default' : 'outline'}
            className="h-12 w-12 p-1"
            onClick={() => onIconSelect(name)}
            title={name}
          >
            <img
              src={path}
              alt={name}
              className="h-8 w-8 object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                e.currentTarget.style.display = 'none';
              }}
            />
          </Button>
        ))}
      </div>
    </div>
  );
};
