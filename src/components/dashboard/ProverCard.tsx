'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatPercent, formatTimeAgo, cn, copyToClipboard, formatAddress } from '@/lib/utils';
import type { ProverData } from '@/lib/types';

interface ProverCardProps {
  prover: ProverData;
  rank?: number;
  onClick?: (prover: ProverData) => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const ProverCard: React.FC<ProverCardProps> = ({
  prover,
  rank,
  onClick,
  showDetails = false,
  compact = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Get rank icon based on position
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '💎';
    if (rank <= 50) return '⭐';
    return '🟢';
  };

  // Get performance color based on change percentage
  const getPerformanceColor = (change: number) => {
    if (change > 10) return 'text-success bg-success/10 border-success/30';
    if (change > 0) return 'text-warning bg-warning/10 border-warning/30';
    if (change > -5) return 'text-text-dim bg-gray-500/10 border-gray-500/30';
    return 'text-danger bg-danger/10 border-danger/30';
  };

  // Handle address copy
  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(prover.address);
    
    if (success) {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(prover);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  if (compact) {
    return (
      <motion.div
        className={cn(
          'bg-bg-card border border-white/10 rounded-xl p-4 hover:border-accent/30 transition-all duration-300 cursor-pointer',
          className
        )}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        layout
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl">{getRankIcon(prover.rank)}</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{formatAddress(prover.address)}</span>
                <div className={cn('w-2 h-2 rounded-full', prover.isOnline ? 'bg-success animate-pulse' : 'bg-gray-500')} />
              </div>
              <div className="text-xs text-text-dim">
                Rank #{prover.rank} • {formatCurrency(prover.earnings)}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold text-success">
              {formatCurrency(prover.earnings)}
            </div>
            <div className={cn('text-xs px-1.5 py-0.5 rounded border', getPerformanceColor(prover.changePercent))}>
              {prover.changePercent > 0 ? '+' : ''}{prover.changePercent.toFixed(1)}%
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn(
        'bg-bg-card border border-white/10 rounded-2xl p-6 hover:border-accent/30 hover:shadow-glow transition-all duration-300 cursor-pointer',
        isExpanded && 'border-accent/50',
        className
      )}
      whileHover={{ scale: 1.01, y: -4 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardClick}
      layout
    >
      {/* Main Card Content */}
      <div className="flex items-center gap-6">
        {/* Avatar & Rank */}
        <div className="relative">
          <motion.div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-alt flex items-center justify-center shadow-lg"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-2xl font-bold text-white">
              {getRankIcon(prover.rank)}
            </span>
          </motion.div>
          
          {/* Online Status */}
          <motion.div 
            className={cn(
              'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-bg-card flex items-center justify-center',
              prover.isOnline ? 'bg-success' : 'bg-gray-500'
            )}
            animate={prover.isOnline ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={cn('w-2 h-2 rounded-full', prover.isOnline ? 'bg-white' : 'bg-gray-300')} />
          </motion.div>
        </div>

        {/* Prover Info */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <h3 className="text-lg font-semibold text-text-main">
                {prover.name || formatAddress(prover.address)}
              </h3>
              
              {/* Copy Address Button */}
              <button
                onClick={handleCopyAddress}
                className="absolute -right-6 top-0 p-1 rounded hover:bg-white/10 transition-colors"
                title="Copy address"
              >
                <svg className="w-4 h-4 text-text-dim hover:text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            {/* Performance Badge */}
            <motion.div 
              className={cn('px-2 py-1 rounded-full text-xs font-bold border', getPerformanceColor(prover.changePercent))}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {prover.changePercent > 0 ? '+' : ''}{prover.changePercent.toFixed(1)}%
            </motion.div>
            
            {/* Rank Badge */}
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-accent/20 to-accent-alt/20 border border-accent/30">
              <span className="text-sm font-semibold text-accent">Rank #{prover.rank}</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-text-dim">Earnings</span>
              <div className="font-semibold text-success">{formatCurrency(prover.earnings)}</div>
            </div>
            <div>
              <span className="text-text-dim">Orders</span>
              <div className="font-semibold text-text-main">{prover.totalOrders.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-text-dim">Success Rate</span>
              <div className="font-semibold text-blue-400">{prover.successRate.toFixed(1)}%</div>
            </div>
            <div>
              <span className="text-text-dim">Status</span>
              <div className={cn('font-semibold flex items-center gap-1', prover.isOnline ? 'text-success' : 'text-gray-500')}>
                <div className={cn('w-2 h-2 rounded-full', prover.isOnline ? 'bg-success animate-pulse' : 'bg-gray-500')} />
                {prover.isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-gray-800 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-gradient-to-r from-success via-blue-400 to-accent h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(prover.gpuScore, 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs text-text-dim mt-1">
              <span>GPU Performance</span>
              <span>{prover.gpuScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copy Success Notification */}
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div
            className="absolute top-2 right-2 bg-success text-white px-3 py-1 rounded-lg text-sm font-medium"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
          >
            Address copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-6 pt-6 border-t border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Performance Metrics */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-main mb-3">Performance Metrics</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-dim">Completed Orders</span>
                    <span className="font-semibold">{prover.completedOrders.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-text-dim">Success Rate</span>
                    <span className="font-semibold text-blue-400">{formatPercent(prover.successRate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-text-dim">GPU Score</span>
                    <span className="font-semibold text-purple-400">{prover.gpuScore}%</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-text-dim">Stake Amount</span>
                    <span className="font-semibold text-warning">{formatCurrency(prover.stakeAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-text-main mb-3">Additional Info</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-text-dim">Joined Date</span>
                    <span className="font-semibold">{new Date(prover.joinedDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-text-dim">Last Active</span>
                    <span className="font-semibold">{formatTimeAgo(prover.lastActive)}</span>
                  </div>
                  
                  {prover.location && (
                    <div className="flex justify-between items-center">
                      <span className="text-text-dim">Location</span>
                      <span className="font-semibold">{prover.location}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-text-dim">Full Address</span>
                    <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono">
                      {prover.address}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Info (if available) */}
            {prover.hardware && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <h4 className="font-semibold text-text-main mb-3">Hardware Configuration</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-text-dim block">GPU</span>
                    <span className="font-semibold">{prover.hardware.gpuModel}</span>
                    <span className="text-xs text-text-dim block">x{prover.hardware.gpuCount}</span>
                  </div>
                  <div>
                    <span className="text-text-dim block">VRAM</span>
                    <span className="font-semibold">{prover.hardware.totalVRAM}GB</span>
                  </div>
                  <div>
                    <span className="text-text-dim block">RAM</span>
                    <span className="font-semibold">{prover.hardware.ramAmount}GB</span>
                  </div>
                  <div>
                    <span className="text-text-dim block">Storage</span>
                    <span className="font-semibold">{prover.hardware.storageType}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Details (if available) */}
            {prover.performance && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h4 className="font-semibold text-text-main mb-3">Performance Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-text-dim block">Response Time</span>
                    <span className="font-semibold">{prover.performance.avgResponseTime.toFixed(1)}ms</span>
                  </div>
                  <div>
                    <span className="text-text-dim block">Throughput</span>
                    <span className="font-semibold">{prover.performance.throughput.toFixed(1)}/hr</span>
                  </div>
                  <div>
                    <span className="text-text-dim block">Uptime</span>
                    <span className="font-semibold">{prover.performance.uptime.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProverCard;
