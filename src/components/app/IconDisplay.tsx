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
        if (e.currentTarget.src !== fallbackIcon) {
          e.currentTarget.src = fallbackIcon;
        }
      }}
    />
  );
};
