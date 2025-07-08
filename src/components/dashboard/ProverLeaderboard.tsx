'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProverCard from './ProverCard';
import { cn } from '@/lib/utils';
import type { ProverData } from '@/lib/types';

interface ProverLeaderboardProps {
  provers: ProverData[];
  loading?: boolean;
  error?: string | null;
  maxItems?: number;
  showFilters?: boolean;
  compact?: boolean;
  className?: string;
}

type SortOption = 'earnings' | 'rank' | 'orders' | 'success_rate' | 'gpu_score' | 'last_active';
type FilterOption = 'all' | 'online' | 'offline' | 'top10' | 'top50';

const ProverLeaderboard: React.FC<ProverLeaderboardProps> = ({
  provers,
  loading = false,
  error = null,
  maxItems = 10,
  showFilters = true,
  compact = false,
  className = ''
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('rank');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMore, setShowMore] = useState(false);

  // Sort and filter provers
  const filteredAndSortedProvers = useMemo(() => {
    let filtered = [...provers];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prover => 
        prover.address.toLowerCase().includes(query) ||
        (prover.name && prover.name.toLowerCase().includes(query))
      );
    }

    // Apply status filter
    switch (filterBy) {
      case 'online':
        filtered = filtered.filter(p => p.isOnline);
        break;
      case 'offline':
        filtered = filtered.filter(p => !p.isOnline);
        break;
      case 'top10':
        filtered = filtered.filter(p => p.rank <= 10);
        break;
      case 'top50':
        filtered = filtered.filter(p => p.rank <= 50);
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'earnings':
          return b.earnings - a.earnings;
        case 'rank':
          return a.rank - b.rank;
        case 'orders':
          return b.totalOrders - a.totalOrders;
        case 'success_rate':
          return b.successRate - a.successRate;
        case 'gpu_score':
          return b.gpuScore - a.gpuScore;
        case 'last_active':
          return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        default:
          return a.rank - b.rank;
      }
    });

    return filtered;
  }, [provers, sortBy, filterBy, searchQuery]);

  // Limit items display
  const displayedProvers = useMemo(() => {
    const limit = showMore ? filteredAndSortedProvers.length : maxItems;
    return filteredAndSortedProvers.slice(0, limit);
  }, [filteredAndSortedProvers, showMore, maxItems]);

  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
            <div className="flex gap-2">
              <div className="w-24 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="w-32 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-bg-card border border-white/10 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-700 rounded"></div>
                  <div className="w-48 h-3 bg-gray-700 rounded"></div>
                </div>
                <div className="w-20 h-6 bg-gray-700 rounded"></div>
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
        <h3 className="text-lg font-semibold text-danger mb-2">Failed to load provers</h3>
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
  if (!loading && filteredAndSortedProvers.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h3 className="text-lg font-semibold text-text-main mb-2">No provers found</h3>
        <p className="text-text-dim mb-4">
          {searchQuery ? `No provers match "${searchQuery}"` : 'No provers available'}
        </p>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="btn-secondary"
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  const sortOptions = [
    { value: 'rank', label: 'Rank' },
    { value: 'earnings', label: 'Earnings' },
    { value: 'orders', label: 'Orders' },
    { value: 'success_rate', label: 'Success Rate' },
    { value: 'gpu_score', label: 'GPU Score' },
    { value: 'last_active', label: 'Last Active' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All', count: provers.length },
    { value: 'online', label: 'Online', count: provers.filter(p => p.isOnline).length },
    { value: 'offline', label: 'Offline', count: provers.filter(p => !p.isOnline).length },
    { value: 'top10', label: 'Top 10', count: provers.filter(p => p.rank <= 10).length },
    { value: 'top50', label: 'Top 50', count: provers.filter(p => p.rank <= 50).length },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters and Search */}
      {showFilters && (
        <motion.div 
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search provers by address or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-bg-card border border-white/20 rounded-lg text-text-main placeholder-text-dim focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-200"
            />
          </div>

          {/* Sort and Filter */}
          <div className="flex gap-2">
            {/* Filter Dropdown */}
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="bg-bg-card border border-white/20 rounded-lg px-3 py-2 text-text-main focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-200"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-bg-card border border-white/20 rounded-lg px-3 py-2 text-text-main focus:border-accent/50 focus:ring-2 focus:ring-accent/20 outline-none transition-all duration-200"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      )}

      {/* Results Summary */}
      <motion.div 
        className="flex items-center justify-between text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-text-dim">
          Showing {displayedProvers.length} of {filteredAndSortedProvers.length} provers
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        
        {filteredAndSortedProvers.length > maxItems && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-accent hover:text-accent-alt transition-colors duration-200 font-medium"
          >
            {showMore ? 'Show Less' : `Show All (${filteredAndSortedProvers.length})`}
          </button>
        )}
      </motion.div>

      {/* Provers List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayedProvers.map((prover, index) => (
            <motion.div
              key={prover.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.05,
                ease: 'easeOut'
              }}
              layout
            >
              <ProverCard 
                prover={prover} 
                rank={prover.rank}
                compact={compact}
                className="hover:scale-[1.01] transition-transform duration-200"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {!showMore && filteredAndSortedProvers.length > maxItems && (
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
            Load More Provers
            <span className="ml-2 text-text-dim">
              ({filteredAndSortedProvers.length - maxItems} remaining)
            </span>
          </button>
        </motion.div>
      )}

      {/* Quick Stats */}
      {!compact && displayedProvers.length > 0 && (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {displayedProvers.filter(p => p.isOnline).length}
            </div>
            <div className="text-xs text-text-dim">Online Now</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {Math.round(displayedProvers.reduce((sum, p) => sum + p.successRate, 0) / displayedProvers.length)}%
            </div>
            <div className="text-xs text-text-dim">Avg Success</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              {displayedProvers.reduce((sum, p) => sum + p.totalOrders, 0).toLocaleString()}
            </div>
            <div className="text-xs text-text-dim">Total Orders</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Math.round(displayedProvers.reduce((sum, p) => sum + p.gpuScore, 0) / displayedProvers.length)}%
            </div>
            <div className="text-xs text-text-dim">Avg GPU Score</div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProverLeaderboard;
