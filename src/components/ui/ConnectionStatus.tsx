'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  lastUpdate?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  showLabel = true,
  className = '',
  size = 'md',
  lastUpdate
}) => {
  const sizeClasses = {
    sm: 'text-xs gap-1.5',
    md: 'text-sm gap-2',
    lg: 'text-base gap-3'
  };

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };

  const getStatusConfig = () => {
    if (isConnected) {
      return {
        color: 'bg-success',
        textColor: 'text-success',
        label: 'Connected',
        animation: 'animate-pulse',
        icon: '🟢'
      };
    } else {
      return {
        color: 'bg-danger',
        textColor: 'text-danger',
        label: 'Disconnected',
        animation: 'animate-ping',
        icon: '🔴'
      };
    }
  };

  const status = getStatusConfig();

  return (
    <motion.div 
      className={cn(
        'flex items-center font-medium',
        sizeClasses[size],
        className
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Status Indicator */}
      <div className="relative flex items-center">
        <motion.div
