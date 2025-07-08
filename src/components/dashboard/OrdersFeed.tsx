'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency, formatDuration, cn } from '@/lib/utils';
import type { OrderData } from '@/lib/types';

interface OrdersFeedProps {
  orders: OrderData[];
  loading?: boolean;
  error?: string | null;
  maxItems?: number;
  showFilters?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

type OrderFilterType = 'all' | 'pending' | 'active' | 'urgent' | 'high_reward';
type OrderSortType = 'newest' | 'reward' | 'time_left' | 'priority';

const OrdersFeed: React.FC<OrdersFeedProps> = ({
  orders,
  loading = false,
  error = null,
  maxItems = 20,
  showFilters = true,
  autoRefresh = true,
  className = ''
}) => {
  const [filter, setFilter] = useState<OrderFilterType>('all');
  const [sortBy, setSortBy] = useState<OrderSortType>('newest');
  const [showMore, setShowMore] = useState(false);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply filters
    switch (filter) {
      case 'pending':
        filtered = filtered.filter(o => o.status === 'pending');
        break;
      case 'active':
        filtered = filtered.filter(o => o.status === 'active' || o.status === 'proving');
        break;
      case 'urgent':
        filtered = filtered.filter(o => 
          o.priority === 'urgent' || o.priority === 'high' || o.timeLeft < 300
        );
        break;
      case 'high_reward':
        filtered = filtered.filter(o => o.reward >= 50);
        break;
      case 'all':
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'reward':
          return b.reward - a.reward;
        case 'time_left':
          return a.timeLeft - b.timeLeft;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [orders, filter, sortBy]);

  // Display limited orders
  const displayedOrders = useMemo(() => {
    const limit = showMore ? filteredAndSortedOrders.length : maxItems;
    return filteredAndSortedOrders.slice(0, limit);
  }, [filteredAndSortedOrders, showMore, maxItems]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-warning bg-warning/10 border-warning/30';
      case 'active': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'proving': return 'text-accent bg-accent/10 border-accent/30';
      case 'completed': return 'text-success bg-success/10 border-success/30';
      case 'failed': return 'text-danger bg-danger/10 border-danger/30';
      case 'expired': return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
      default: return 'text-text-dim bg-gray-500/10 border-gray-500/30';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-danger bg-danger/20 border-danger/40';
      case 'high': return 'text-warning bg-warning/20 border-warning/40';
      case 'medium': return 'text-blue-400 bg-blue-400/20 border-blue-400/40';
      case 'low': return 'text-gray-400 bg-gray-400/20 border-gray-400/40';
      default: return 'text-text-dim bg-gray-500/20 border-gray-500/40';
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {showFilters && (
          <div className="flex gap-2 mb-4">
            <div className="w-20 h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-24 h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="w-28 h-8 bg-gray-700 rounded animate-pulse"></div>
          </div>
        )}
        
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-bg-card border border-white/10 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between mb-2">
                <div className="w-24 h-4 bg-gray-700 rounded"></div>
                <div className="w-16 h-6 bg-gray-700 rounded"></div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="w-20 h-3 bg-gray-700 rounded"></div>
                <div className="w-16 h-3 bg-gray-700 rounded"></div>
                <div className="w-24 h-3 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-danger mb-2">Failed to load orders</h3>
        <p className="text-text-dim mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!loading && filteredAndSortedOrders.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold text-text-main mb-2">No orders found</h3>
        <p className="text-text-dim mb-4">
          {filter === 'all' ? 'No orders available' : `No ${filter} orders found`}
        </p>
        {filter !== 'all' && (
          <button 
            onClick={() => setFilter('all')}
            className="btn-secondary"
          >
            Show all orders
          </button>
        )}
      </div>
    );
  }

  const filterOptions = [
    { value: 'all', label: 'All', count: orders.length },
    { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { value: 'active', label: 'Active', count: orders.filter(o => o.status === 'active' || o.status === 'proving').length },
    { value: 'urgent', label: 'Urgent', count: orders.filter(o => o.priority === 'urgent' || o.timeLeft < 300).length },
    { value: 'high_reward', label: 'High Value', count: orders.filter(o => o.reward >= 50).length },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'reward', label: 'Highest Reward' },
    { value: 'time_left', label: 'Urgent' },
    { value: 'priority', label: 'Priority' },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      {showFilters && (
        <motion.div 
          className="flex flex-wrap gap-2 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Filter buttons */}
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as OrderFilterType)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                filter === option.value
                  ? 'bg-accent text-white shadow-md'
                  : 'bg-bg-card border border-white/20 text-text-dim hover:text-text-main hover:border-accent/50'
              )}
            >
              {option.label} ({option.count})
            </button>
          ))}
          
          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as OrderSortType)}
            className="bg-bg-card border border-white/20 rounded-lg px-3 py-1.5 text-sm text-text-main focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Results summary */}
      <motion.div 
        className="flex items-center justify-between text-sm mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-text-dim">
          Showing {displayedOrders.length} of {filteredAndSortedOrders.length} orders
        </span>
        
        {autoRefresh && (
          <div className="flex items-center gap-2 text-xs text-success">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            Live updates
          </div>
        )}
      </motion.div>

      {/* Orders list */}
      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {displayedOrders.map((order, index) => (
            <motion.div
              key={order.id}
              className="bg-bg-card border border-white/10 rounded-xl p-4 hover:border-accent/30 transition-all duration-300 cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.02,
                ease: 'easeOut'
              }}
              whileHover={{ scale: 1.01, y: -2 }}
              layout
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-accent">
                    Order #{order.id.slice(-6)}
                  </span>
                  
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium border', getStatusColor(order.status))}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  
                  {(order.priority === 'urgent' || order.priority === 'high') && (
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold border', getPriorityColor(order.priority))}>
                      {order.priority.toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-success">
                    {formatCurrency(order.reward)}
                  </div>
                  <div className="text-xs text-text-dim">
                    {order.rewardToken}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-text-dim block">Task Type</span>
                  <span className="font-medium">{order.taskType}</span>
                </div>
                
                <div>
                  <span className="text-text-dim block">Time Left</span>
                  <span className={cn(
                    'font-medium',
                    order.timeLeft < 300 ? 'text-danger' : 
                    order.timeLeft < 900 ? 'text-warning' : 'text-text-main'
                  )}>
                    {order.timeLeft > 0 ? formatDuration(order.timeLeft) : 'Expired'}
                  </span>
                </div>
                
                <div>
                  <span className="text-text-dim block">Network</span>
                  <span className="font-medium">
                    {order.networkId === 8453 ? 'Base' : 
                     order.networkId === 1 ? 'Ethereum' : 
                     `Chain ${order.networkId}`}
                  </span>
                </div>
                
                <div>
                  <span className="text-text-dim block">Difficulty</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-2 h-2 rounded-full',
                          i < order.difficulty ? 'bg-accent' : 'bg-gray-600'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress bar for time remaining */}
              {order.status === 'pending' && order.timeLeft > 0 && (
                <div className="mt-3">
                  <div className="bg-gray-800 h-1 rounded-full overflow-hidden">
                    <motion.div 
                      className={cn(
                        'h-full rounded-full',
                        order.timeLeft < 300 ? 'bg-danger' :
                        order.timeLeft < 900 ? 'bg-warning' : 'bg-success'
                      )}
                      initial={{ width: '100%' }}
                      animate={{ width: `${Math.max(0, (order.timeLeft / 3600) * 100)}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-accent/20 transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load more */}
      {!showMore && filteredAndSortedOrders.length > maxItems && (
        <motion.div 
          className="text-center pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => setShowMore(true)}
            className="btn-secondary"
          >
            Show More Orders
            <span className="ml-2 text-text-dim">
              ({filteredAndSortedOrders.length - maxItems} remaining)
            </span>
          </button>
        </motion.div>
      )}

      {/* Quick stats */}
      {displayedOrders.length > 0 && (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              {displayedOrders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-xs text-text-dim">Pending</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(displayedOrders.reduce((sum, o) => sum + o.reward, 0))}
            </div>
            <div className="text-xs text-text-dim">Total Rewards</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-danger">
              {displayedOrders.filter(o => o.timeLeft < 300).length}
            </div>
            <div className="text-xs text-text-dim">Urgent</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {formatCurrency(Math.max(...displayedOrders.map(o => o.reward), 0))}
            </div>
            <div className="text-xs text-text-dim">Highest Reward</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OrdersFeed;
