'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store';
import { boundlessAPI } from '@/lib/api';
import type { ProverData, ProverLeaderboardQuery, APIResponse } from '@/lib/types';

interface UseProversReturn {
  provers: ProverData[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fetchProvers: (query?: ProverLeaderboardQuery) => Promise<APIResponse<ProverData[]>>;
  refreshProvers: () => Promise<void>;
  getProverById: (id: string) => ProverData | undefined;
  getProverByAddress: (address: string) => ProverData | undefined;
  isRefreshing: boolean;
}

export const useProvers = (): UseProversReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    provers, 
    setProvers, 
    autoRefresh, 
    refreshInterval,
    setError: setGlobalError,
    clearError: clearGlobalError
  } = useStore();
  
  const lastQueryRef = useRef<ProverLeaderboardQuery>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch provers data
  const fetchProvers = useCallback(async (
    query: ProverLeaderboardQuery = {}
  ): Promise<APIResponse<ProverData[]>> => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      clearGlobalError('provers');
      
      console.log('[useProvers] Fetching provers with query:', query);
      
      // Store the query for refresh purposes
      lastQueryRef.current = query;
      
      const response = await boundlessAPI.getProvers(query);
      
      if (response.success && response.data) {
        console.log(`[useProvers] ✅ Fetched ${response.data.length} provers`);
        
        // Update store
        setProvers(response.data);
        setLastUpdated(new Date().toISOString());
        
        // Log top provers for debugging
        const topProvers = response.data.slice(0, 3);
        console.log('[useProvers] Top 3 provers:', topProvers.map(p => ({
          address: p.address,
          earnings: p.earnings,
          rank: p.rank
        })));
        
      } else {
        const errorMsg = response.error || 'Failed to fetch provers data';
        console.error('[useProvers] ❌ Error:', errorMsg);
        setError(errorMsg);
        setGlobalError('provers', errorMsg);
      }
      
      return response;
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[useProvers] Request was aborted');
        return { success: false, data: [], error: 'Request aborted', timestamp: new Date().toISOString() };
      }
      
      const errorMsg = error.message || 'Unknown error occurred';
      console.error('[useProvers] ❌ Exception:', error);
      setError(errorMsg);
      setGlobalError('provers', errorMsg);
      
      return { success: false, data: [], error: errorMsg, timestamp: new Date().toISOString() };
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [setProvers, setGlobalError, clearGlobalError]);

  // Refresh provers with the last used query
  const refreshProvers = useCallback(async (): Promise<void> => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchProvers(lastQueryRef.current);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProvers, isRefreshing]);

  // Get prover by ID
  const getProverById = useCallback((id: string): ProverData | undefined => {
    return provers.find(prover => prover.id === id);
  }, [provers]);

  // Get prover by address
  const getProverByAddress = useCallback((address: string): ProverData | undefined => {
    return provers.find(prover => 
      prover.address.toLowerCase() === address.toLowerCase()
    );
  }, [provers]);

  // Setup auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      if (!loading && !isRefreshing) {
        console.log(`[useProvers] Auto-refreshing (interval: ${refreshInterval}ms)`);
        refreshProvers();
      }
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, loading, isRefreshing, refreshProvers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Error recovery mechanism
  useEffect(() => {
    if (error && provers.length === 0) {
      const retryTimer = setTimeout(() => {
        console.log('[useProvers] Attempting error recovery...');
        refreshProvers();
      }, 10000); // Retry after 10 seconds

      return () => clearTimeout(retryTimer);
    }
  }, [error, provers.length, refreshProvers]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('[useProvers] State updated:', {
      proversCount: provers.length,
      loading,
      error,
      lastUpdated,
      isRefreshing
    });
  }, [provers.length, loading, error, lastUpdated, isRefreshing]);

  return {
    provers,
    loading,
    error,
    lastUpdated,
    fetchProvers,
    refreshProvers,
    getProverById,
    getProverByAddress,
    isRefreshing
  };
};

// Extended hook with additional utilities
export const useProversExtended = () => {
  const baseHook = useProvers();
  const { provers } = baseHook;

  // Computed values
  const stats = {
    total: provers.length,
    online: provers.filter(p => p.isOnline).length,
    offline: provers.filter(p => !p.isOnline).length,
    topEarners: provers.filter(p => p.rank <= 10).length,
    averageEarnings: provers.length > 0 
      ? provers.reduce((sum, p) => sum + p.earnings, 0) / provers.length 
      : 0,
    averageSuccessRate: provers.length > 0
      ? provers.reduce((sum, p) => sum + p.successRate, 0) / provers.length
      : 0,
    totalEarnings: provers.reduce((sum, p) => sum + p.earnings, 0)
  };

  // Filters
  const filters = {
    byTier: (tier: string) => provers.filter(p => p.rank <= getTierMaxRank(tier)),
    byStatus: (online: boolean) => provers.filter(p => p.isOnline === online),
    byEarningsRange: (min: number, max: number) => 
      provers.filter(p => p.earnings >= min && p.earnings <= max),
    bySuccessRate: (minRate: number) => provers.filter(p => p.successRate >= minRate),
    search: (query: string) => provers.filter(p => 
      p.address.toLowerCase().includes(query.toLowerCase()) ||
      (p.name && p.name.toLowerCase().includes(query.toLowerCase()))
    )
  };

  // Sorters
  const sorters = {
    byEarnings: (desc = true) => [...provers].sort((a, b) => 
      desc ? b.earnings - a.earnings : a.earnings - b.earnings
    ),
    byRank: (desc = false) => [...provers].sort((a, b) => 
      desc ? b.rank - a.rank : a.rank - b.rank
    ),
    bySuccessRate: (desc = true) => [...provers].sort((a, b) => 
      desc ? b.successRate - a.successRate : a.successRate - b.successRate
    ),
    byOrders: (desc = true) => [...provers].sort((a, b) => 
      desc ? b.totalOrders - a.totalOrders : a.totalOrders - b.totalOrders
    ),
    byLastActive: (desc = true) => [...provers].sort((a, b) => {
      const aTime = new Date(a.lastActive).getTime();
      const bTime = new Date(b.lastActive).getTime();
      return desc ? bTime - aTime : aTime - bTime;
    })
  };

  return {
    ...baseHook,
    stats,
    filters,
    sorters
  };
};

// Helper function for tier calculations
function getTierMaxRank(tier: string): number {
  switch (tier.toLowerCase()) {
    case 'top': return 10;
    case 'high': return 50;
    case 'medium': return 100;
    case 'emerging': return 500;
    default: return Infinity;
  }
}

export default useProvers;
