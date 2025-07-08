'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  pulse?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({
  className,
  variant = 'default',
  size = 'md',
  animated = false,
  pulse = false,
  icon,
  iconPosition = 'left',
  children,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full border transition-all duration-200';

  const variantClasses = {
    default: 'bg-gray-500/10 text-text-dim border-gray-500/30',
    success: 'bg-success/10 text-success border-success/30',
    warning: 'bg-warning/10 text-warning border-warning/30',
    danger: 'bg-danger/10 text-danger border-danger/30',
    info: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
    accent: 'bg-accent/10 text-accent border-accent/30',
    outline: 'bg-transparent text-accent border-accent/50 hover:bg-accent/10',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-0.5 text-sm gap-1.5',
    lg: 'px-3 py-1 text-sm gap-2',
  };

  const Component = animated ? motion.span : 'span';
  const motionProps = animated ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
    whileHover: { scale: 1.05 },
  } : {};

  const pulseAnimation = pulse ? {
    animate: { opacity: [0.7, 1, 0.7] },
    transition: { duration: 2, repeat: Infinity }
  } : {};

  return (
    <Component
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        pulse && 'animate-pulse',
        className
      )}
      {...motionProps}
      {...pulseAnimation}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      
      {children && (
        <span>{children}</span>
      )}
      
      {icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </Component>
  );
});

Badge.displayName = 'Badge';

// Status Badge - specialized for common statuses
export const StatusBadge = forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant'> & {
  status: 'online' | 'offline' | 'pending' | 'active' | 'completed' | 'failed' | 'expired';
}>(({
  status,
  className,
  ...props
}, ref) => {
  const statusConfig = {
    online: { variant: 'success' as const, icon: '🟢', text: 'Online' },
    offline: { variant: 'default' as const, icon: '⚫', text: 'Offline' },
    pending: { variant: 'warning' as const, icon: '⏳', text: 'Pending' },
    active: { variant: 'info' as const, icon: '🔵', text: 'Active' },
    completed: { variant: 'success' as const, icon: '✅', text: 'Completed' },
    failed: { variant: 'danger' as const, icon: '❌', text: 'Failed' },
    expired: { variant: 'default' as const, icon: '⏰', text: 'Expired' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      icon={config.icon}
      pulse={status === 'online' || status === 'active'}
      className={className}
      {...props}
    >
      {config.text}
    </Badge>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Priority Badge
export const PriorityBadge = forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant'> & {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}>(({
  priority,
  className,
  ...props
}, ref) => {
  const priorityConfig = {
    low: { variant: 'default' as const, icon: '🔵', text: 'Low' },
    medium: { variant: 'info' as const, icon: '🟡', text: 'Medium' },
    high: { variant: 'warning' as const, icon: '🟠', text: 'High' },
    urgent: { variant: 'danger' as const, icon: '🔴', text: 'URGENT', pulse: true },
  };

  const config = priorityConfig[priority];

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      icon={config.icon}
      pulse={config.pulse}
      animated={priority === 'urgent'}
      className={cn(
        priority === 'urgent' && 'font-bold',
        className
      )}
      {...props}
    >
      {config.text}
    </Badge>
  );
});

PriorityBadge.displayName = 'PriorityBadge';

// Change Badge - for showing percentage changes
export const ChangeBadge = forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant' | 'icon'> & {
  value: number;
  showIcon?: boolean;
  formatAsPercent?: boolean;
}>(({
  value,
  showIcon = true,
  formatAsPercent = true,
  className,
  children,
  ...props
}, ref) => {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const variant = isNeutral ? 'default' : isPositive ? 'success' : 'danger';
  const icon = showIcon ? (isNeutral ? '➡️' : isPositive ? '📈' : '📉') : undefined;
  
  const formattedValue = formatAsPercent 
    ? `${isPositive ? '+' : ''}${value.toFixed(1)}%`
    : `${isPositive ? '+' : ''}${value.toLocaleString()}`;

  return (
    <Badge
      ref={ref}
      variant={variant}
      icon={icon}
      className={className}
      {...props}
    >
      {children || formattedValue}
    </Badge>
  );
});

ChangeBadge.displayName = 'ChangeBadge';

// Network Badge
export const NetworkBadge = forwardRef<HTMLSpanElement, Omit<BadgeProps, 'variant' | 'icon'> & {
  chainId: number;
}>(({
  chainId,
  className,
  ...props
}, ref) => {
  const networkConfig: Record<number, { name: string; icon: string; variant: BadgeProps['variant'] }> = {
    1: { name: 'Ethereum', icon: '🔷', variant: 'info' },
    8453: { name: 'Base', icon: '🔵', variant: 'accent' },
    84532: { name: 'Base Sepolia', icon: '🔵', variant: 'warning' },
    11155111: { name: 'Ethereum Sepolia', icon: '🔷', variant: 'warning' },
    137: { name: 'Polygon', icon: '🟣', variant: 'accent' },
    10: { name: 'Optimism', icon: '🔴', variant: 'danger' },
    42161: { name: 'Arbitrum', icon: '🔵', variant: 'info' },
  };

  const config = networkConfig[chainId] || { 
    name: `Chain ${chainId}`, 
    icon: '⚡', 
    variant: 'default' as const 
  };

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      icon={config.icon}
      className={className}
      {...props}
    >
      {config.name}
    </Badge>
  );
});

NetworkBadge.displayName = 'NetworkBadge';

export default Badge;
