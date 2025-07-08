'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDuration, formatTimeAgo, cn, copyToClipboard } from '@/lib/utils';
import type { OrderData } from '@/lib/types';

interface LiveOrderCardProps {
  order: OrderData;
  onClick?: (order: OrderData) => void;
  showActions?: boolean;
  compact?: boolean;
  isNew?: boolean;
  className?: string;
}

const LiveOrderCard: React.FC<LiveOrderCardProps> = ({
  order,
  onClick,
  showActions = false,
  compact = false,
  isNew = false,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(order.timeLeft);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Get status styling
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-warning bg-warning/10 border-warning/30';
      case 'active':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'proving':
        return 'text-accent bg-accent/10 border-accent/30';
      case 'completed':
        return 'text-success bg-success/10 border-success/30';
      case 'failed':
        return 'text-danger bg-danger/10 border-danger/30';
      case 'expired':
        return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
      default:
        return 'text-text-dim bg-gray-500/10 border-gray-500/30';
    }
  };

  // Get priority styling
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-danger bg-danger/20 border-danger/40 animate-pulse';
      case 'high':
        return 'text-warning bg-warning/20 border-warning/40';
      case 'medium':
        return 'text-blue-400 bg-blue-400/20 border-blue-400/40';
      case 'low':
        return 'text-gray-400 bg-gray-400/20 border-gray-400/40';
      default:
        return 'text-text-dim bg-gray-500/20 border-gray-500/40';
    }
  };

  // Get time urgency color
  const getTimeUrgencyColor = (seconds: number) => {
    if (seconds <= 0) return 'text-gray-500';
    if (seconds < 300) return 'text-danger'; // < 5 minutes
    if (seconds < 900) return 'text-warning'; // < 15 minutes
    if (seconds < 3600) return 'text-blue-400'; // < 1 hour
    return 'text-text-main';
  };

  // Handle copy order ID
  const handleCopyOrderId = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(order.id);
    
    if (success) {
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
    }
  };

  // Handle card click
  const handleCardClick = () => {
    if (onClick) {
      onClick(order);
    } else {
      setIsExpanded(!isExpanded);
    }
  };

  // Compact version
  if (compact) {
    return (
      <motion.div
        className={cn(
          'bg-bg-card border border-white/10 rounded-xl p-3 hover:border-accent/30 transition-all duration-300 cursor-pointer relative',
          isNew && 'border-blue-400/60 shadow-glow',
          className
        )}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCardClick}
        layout
      >
        {/* New order pulse effect */}
        {isNew && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-blue-400/60"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-accent">
              #{order.id.slice(-6)}
            </span>
            <span className={cn('px-1.5 py-0.5 rounded text-xs font-medium border', getStatusStyle(order.status))}>
              {order.status}
            </span>
            {order.priority === 'urgent' && (
              <span className="text-xs">🔥</span>
            )}
          </div>
          
          <div className="text-right">
            <div className="font-bold text-success text-sm">
              {formatCurrency(order.reward)}
            </div>
            <div className={cn('text-xs font-medium', getTimeUrgencyColor(timeLeft))}>
              {timeLeft > 0 ? formatDuration(timeLeft) : 'Expired'}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full version
  return (
    <motion.div
      className={cn(
        'bg-bg-card border border-white/10 rounded-xl p-4 hover:border-accent/30 hover:shadow-glow transition-all duration-300 cursor-pointer relative overflow-hidden',
        isNew && 'border-blue-400/60',
        isExpanded && 'border-accent/50',
        className
      )}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardClick}
      layout
    >
      {/* New order pulse animation */}
      {isNew && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-blue-400/60 pointer-events-none"
          animate={{ 
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="font-semibold text-accent">
              Order #{order.id.slice(-6)}
            </span>
            <button
              onClick={handleCopyOrderId}
              className="absolute -right-5 top-0 p-1 rounded hover:bg-white/10 transition-colors"
              title="Copy order ID"
            >
              <svg className="w-3 h-3 text-text-dim hover:text-text-main" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          
          <span className={cn('px-2 py-1 rounded-full text-xs font-medium border', getStatusStyle(order.status))}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          
          {(order.priority === 'urgent' || order.priority === 'high') && (
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold border', getPriorityStyle(order.priority))}>
              {order.priority === 'urgent' ? '🔥 URGENT' : `${order.priority.toUpperCase()}`}
            </span>
          )}
          
          {isNew && (
            <motion.span 
              className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-400/40"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              NEW
            </motion.span>
          )}
        </div>
        
        <div className="text-right">
          <div className="font-bold text-success text-lg">
            {formatCurrency(order.reward)}
          </div>
          <div className="text-xs text-text-dim">
            {order.rewardToken}
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
        <div>
          <span className="text-text-dim block text-xs">Task Type</span>
          <span className="font-medium">{order.taskType}</span>
        </div>
        
        <div>
          <span className="text-text-dim block text-xs">Time Left</span>
          <span className={cn('font-medium', getTimeUrgencyColor(timeLeft))}>
            {timeLeft > 0 ? formatDuration(timeLeft) : 'Expired'}
          </span>
        </div>
        
        <div>
          <span className="text-text-dim block text-xs">Network</span>
          <span className="font-medium flex items-center gap-1">
            {order.networkId === 8453 ? '🔵 Base' : 
             order.networkId === 1 ? '🔷 Ethereum' : 
             `⚡ Chain ${order.networkId}`}
          </span>
        </div>
        
        <div>
          <span className="text-text-dim block text-xs">Difficulty</span>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  i < order.difficulty ? 'bg-accent' : 'bg-gray-600'
                )}
              />
            ))}
            <span className="ml-1 text-xs text-text-dim">
              {order.difficulty}/5
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {order.status === 'pending' && timeLeft > 0 && (
        <div className="mb-3">
          <div className="bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className={cn(
                'h-full rounded-full',
                timeLeft < 300 ? 'bg-danger' :
                timeLeft < 900 ? 'bg-warning' : 'bg-success'
              )}
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, (timeLeft / 3600) * 100)}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      )}

      {/* Copy Success Notification */}
      <AnimatePresence>
        {showCopySuccess && (
          <motion.div
            className="absolute top-2 right-2 bg-success text-white px-3 py-1 rounded-lg text-sm font-medium z-10"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
          >
            Order ID copied!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="mt-4 pt-4 border-t border-white/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-text-main mb-2">Order Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-dim">Full Order ID:</span>
                    <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono">
                      {order.id}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Created:</span>
                    <span className="font-medium">{formatTimeAgo(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Deadline:</span>
                    <span className="font-medium">{new Date(order.deadline).toLocaleString()}</span>
                  </div>
                  {order.proverAddress && (
                    <div className="flex justify-between">
                      <span className="text-text-dim">Assigned Prover:</span>
                      <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono">
                        {order.proverAddress.slice(0, 6)}...{order.proverAddress.slice(-4)}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-main mb-2">Technical Info</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-text-dim">Gas Limit:</span>
                    <span className="font-medium">{order.gasLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-dim">Contract:</span>
                    <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono">
                      {order.contractAddress.slice(0, 6)}...{order.contractAddress.slice(-4)}
                    </code>
                  </div>
                  {order.taskDescription && (
                    <div>
                      <span className="text-text-dim block mb-1">Description:</span>
                      <p className="text-xs text-text-main bg-gray-800/50 p-2 rounded">
                        {order.taskDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {showActions && order.status === 'pending' && (
              <div className="mt-4 pt-4 border-t border-white/10 flex gap-3">
                <button className="btn-primary text-sm py-2 px-4">
                  🚀 Accept Order
                </button>
                <button className="btn-secondary text-sm py-2 px-4">
                  📊 View Details
                </button>
                <button className="btn-ghost text-sm py-2 px-4">
                  🔗 View on Explorer
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveOrderCard;
