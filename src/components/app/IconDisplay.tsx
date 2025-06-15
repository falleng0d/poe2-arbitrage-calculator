import React from 'react';
import { getIconPath, DEFAULT_ICON } from './iconConstants';

export interface IconDisplayProps {
  iconName: string;
  className?: string;
  alt?: string;
  fallbackIcon?: string;
}

export const IconDisplay: React.FC<IconDisplayProps> = ({
  iconName,
  className = 'h-6 w-6',
  alt,
  fallbackIcon = DEFAULT_ICON,
}) => {
  const iconPath = getIconPath(iconName);
  const displayAlt = alt || iconName;

  return (
    <img
      src={iconPath}
      alt={displayAlt}
      className={`object-contain ${className}`}
      onError={(e) => {
        // Fallback to default icon if the specific icon fails to load
        if (e.currentTarget.src !== fallbackIcon) {
          e.currentTarget.src = fallbackIcon;
        }
      }}
    />
  );
};

// Utility function to get icon component by name (replacement for the old Lucide-based function)
export const getIconComponent = (iconName: string) => {
  return ({ className = 'h-6 w-6', alt }: { className?: string; alt?: string }) => (
    <IconDisplay iconName={iconName} className={className} alt={alt} />
  );
};
