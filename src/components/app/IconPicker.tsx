import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { loadAvailableIcons, IconOption } from './iconConstants';

export interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (iconName: string) => void;
  label?: string;
  className?: string;
}

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onIconSelect,
  label = 'Select Icon',
  className = '',
}) => {
  const [availableIcons, setAvailableIcons] = useState<IconOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter icons based on search term
  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableIcons;
    }
    return availableIcons.filter(icon =>
      icon.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableIcons, searchTerm]);

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
      <Input
        type="text"
        placeholder="Search icons..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <div className={`flex flex-wrap gap-2.5 max-h-65 overflow-y-auto justify-center`}>
        {filteredIcons.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center w-full py-4">
            {searchTerm.trim() ? 'No icons found matching your search.' : 'No icons available.'}
          </div>
        ) : (
          filteredIcons.map(({ name, path }) => (
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
                onError={(e) => e.currentTarget.style.display = 'none'}
              />
            </Button>
          ))
        )}
      </div>
    </div>
  );
};
