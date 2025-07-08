'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency, formatNumber, formatPercent, cn } from '@/lib/utils';
import type { MarketStats } from '@/lib/types';

interface KPICardsProps {
  marketStats: MarketStats | null;
  loading?: boolean;
  className?: string;
}

interface KPICardData {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  color: 'success' | 'warning' | 'accent' | 'danger' | 'info';
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

const KPICards: React.FC<KPICardsProps> = ({
  marketStats,
  loading = false,
  className = ''
}) => {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  // Animate numbers counting up
  const animateValue = (key: string, targetValue: number, duration: number = 2000) => {
    const startValue = animatedValues[key] || 0;
    const startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
      
      setAnimatedValues(prev => ({ ...prev, [key]: currentValue }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Generate KPI data based on market stats
  const generateKPIData = (): KPICardData[] => {
    if (!marketStats) {
      return [
        {
          id: 'tvl',
          title: 'Total Value Locked',
          value: '--',
          icon: '💰',
          color: 'success',
          subtitle: 'USDC Staked'
        },
        {
          id: 'provers',
          title: 'Active Provers',
          value: '--',
          icon: '👥',
          color: 'accent',
          subtitle: 'Online Now'
        },
        {
          id: 'orders',
          title: 'Active Orders',
          value: '--',
          icon: '⚡',
          color: 'warning',
          subtitle: 'Pending Execution'
        },
        {
          id: 'success',
          title: 'Success Rate',
          value: '--',
          icon: '🎯',
          color: 'info',
          subtitle: 'Network Average'
        }
      ];
    }

    return [
      {
        id: 'tvl',
        title: 'Total Value Locked',
        value: formatCurrency(animatedValues.tvl || 0),
        change: 5.8,
        changeLabel: '24h',
        icon: '💰',
        color: 'success',
        subtitle: 'USDC Staked',
        trend: 'up'
      },
      {
        id: 'provers',
        title: 'Active Provers',
        value: Math.floor(animatedValues.provers || 0).toLocaleString(),
        change: 12.3,
        changeLabel: '24h',
        icon: '👥',
        color: 'accent',
        subtitle: `${marketStats.totalProvers} Total`,
        trend: 'up'
      },
      {
        id: 'orders',
        title: 'Active Orders',
        value: Math.floor(animatedValues.orders || 0).toLocaleString(),
        change: -2.1,
        changeLabel: '1h',
        icon: '⚡',
        color: 'warning',
        subtitle: `${formatCurrency(marketStats.averageReward)} Avg Reward`,
        trend: 'down'
      },
      {
        id: 'success',
        title: 'Success Rate',
        value: `${(animatedValues.success || 0).toFixed(1)}%`,
        change: 1.2,
        changeLabel: '7d',
        icon: '🎯',
        color: 'info',
        subtitle: `${(marketStats.avgResponseTime / 1000).toFixed(1)}s Avg Time`,
        trend: 'up'
      }
    ];
  };

  // Update animated values when market stats change
  useEffect(() => {
    if (marketStats) {
      animateValue('tvl', marketStats.totalValueLocked);
      animateValue('provers', marketStats.activeProvers);
      animateValue('orders', marketStats.activeOrders);
      animateValue('success', marketStats.successRate);
    }
  }, [marketStats]);

  const kpiData = generateKPIData();

  // Color mappings
  const colorMappings = {
    success: {
      bg: 'bg-success/10',
      border: 'border-success/30',
      text: 'text-success',
      icon: 'text-success'
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      text: 'text-warning',
      icon: 'text-warning'
    },
    accent: {
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      text: 'text-accent',
      icon: 'text-accent'
    },
    danger: {
      bg: 'bg-danger/10',
      border: 'border-danger/30',
      text: 'text-danger',
      icon: 'text-danger'
    },
    info: {
      bg: 'bg-blue-400/10',
      border: 'border-blue-400/30',
      text: 'text-blue-400',
      icon: 'text-blue-400'
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-bg-card border border-white/10 rounded-2xl p-6 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
              <div className="w-16 h-6 bg-gray-700 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-20 h-4 bg-gray-700 rounded"></div>
              <div className="w-32 h-8 bg-gray-700 rounded"></div>
              <div className="w-24 h-3 bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {kpiData.map((kpi, index) => {
        const colors = colorMappings[kpi.color];
        
        return (
          <motion.div
            key={kpi.id}
            className={cn(
              'bg-bg-card border rounded-2xl p-6 hover:shadow-glow transition-all duration-300 relative overflow-hidden group',
              colors.border
            )}
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Background Gradient */}
            <div className={cn('absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300', colors.bg)} />
            
            {/* Header */}
            <div className="flex items-start justify-between mb-4 relative z-10">
              {/* Icon */}
              <motion.div 
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-xl',
                  colors.bg,
                  colors.border,
                  'border backdrop-blur-sm'
                )}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                {kpi.icon}
              </motion.div>

              {/* Change Indicator */}
              {kpi.change !== undefined && (
                <motion.div 
                  className={cn(
                    'px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1',
                    kpi.change > 0 ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <span className="text-xs">
                    {kpi.change > 0 ? '↗' : '↘'}
                  </span>
                  {Math.abs(kpi.change).toFixed(1)}%
                  {kpi.changeLabel && (
                    <span className="opacity-70 ml-1">{kpi.changeLabel}</span>
                  )}
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="relative z-10">
              {/* Title */}
              <h3 className="text-sm font-medium text-text-dim mb-2 uppercase tracking-wide">
                {kpi.title}
              </h3>

              {/* Value */}
              <motion.div 
                className={cn('text-3xl font-bold mb-2', colors.text)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                {kpi.value}
              </motion.div>

              {/* Subtitle */}
              {kpi.subtitle && (
                <p className="text-xs text-text-dim">
                  {kpi.subtitle}
                </p>
              )}
            </div>

            {/* Progress Bar (animated) */}
            <div className="mt-4 relative z-10">
              <div className="bg-gray-800/50 h-1 rounded-full overflow-hidden">
                <motion.div 
                  className={cn('h-full rounded-full', colors.bg.replace('/10', '/60'))}
                  initial={{ width: 0 }}
                  animate={{ width: `${75 + (index * 5)}%` }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 1.5, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Trend Indicator */}
            {kpi.trend && (
              <motion.div 
                className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                {kpi.trend === 'up' && (
                  <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {kpi.trend === 'down' && (
                  <svg className="w-8 h-8 text-
