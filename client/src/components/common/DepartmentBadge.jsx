import React from 'react';
import { motion } from 'framer-motion';

const DEPARTMENT_CONFIG = {
  computer: {
    icon: '💻',
    label: 'Computer',
    color: 'dept-computer',
    bgColor: 'bg-dept-computer/10'
  },
  civil: {
    icon: '🏗️',
    label: 'Civil',
    color: 'dept-civil',
    bgColor: 'bg-dept-civil/10'
  },
  architecture: {
    icon: '🏛️',
    label: 'Architecture',
    color: 'dept-architecture',
    bgColor: 'bg-dept-architecture/10'
  },
  common: {
    icon: '📚',
    label: 'Common',
    color: 'dept-common',
    bgColor: 'bg-dept-common/10'
  }
};

export const DepartmentBadge = ({ 
  department = 'common', 
  size = 'md',
  showLabel = true,
  className = '',
  animated = false
}) => {
  const config = DEPARTMENT_CONFIG[department] || DEPARTMENT_CONFIG.common;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-2 gap-2'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const BadgeContent = () => (
    <div className={`
      inline-flex items-center rounded-full font-medium
      ${config.bgColor} text-${config.color} border border-${config.color}/20
      ${sizeClasses[size]}
      ${className}
    `}>
      <span className={iconSizes[size]}>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BadgeContent />
      </motion.div>
    );
  }

  return <BadgeContent />;
};