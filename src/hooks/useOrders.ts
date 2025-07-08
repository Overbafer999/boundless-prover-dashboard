'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '@/store';
import { boundlessAPI } from '@/lib/api';
import type { OrderData, OrdersQuery, APIResponse } from '@/lib/types';

interface UseOrdersReturn {
  orders: OrderData[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  fetchOrders: (query?: OrdersQuery) => Promise<APIResponse<OrderData[]>>;
  refreshOrders: () => Promise<void>;
  getOrderById: (id: string) => OrderData | undefined;
  getOrdersByStatus: (status: string) => OrderData[];
  isRefreshing: boolean;
  activeOrders: OrderData[];
  pendingOrders: OrderData[];
}

export const useOrders = (): UseOrdersReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    orders, 
    setOrders, 
    autoRefresh, 
    refreshInterval,
    setError: setGlobalError,
    clearError: clearGlobalError
  } = useStore();
  
  const lastQueryRef = useRef<OrdersQuery>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch orders data
  const fetchOrders = useCallback(async (
    query: OrdersQuery = {}
  ): Promise<APIResponse<OrderData[]>> => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      clearGlobalError('orders');
      
      console.log('[useOrders] Fetching orders with query:', query);
      
      // Store the query for refresh purposes
      lastQueryRef.current = query;
      
      const response = await boundlessAPI.getOrders(query);
      
      if (response.success && response.data) {
        console.log(`[useOrders] ✅ Fetched ${response.data.length} orders`);
        
        // Update store
        setOrders(response.data);
        setLastUpdated(new Date().toISOString());
        
        // Log order distribution for debugging
        const statusCount = response.data.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        console.log('[useOrders] Order status distribution:', statusCount);
        
      } else {
        const errorMsg = response.error || 'Failed to fetch orders data';
        console.error('[useOrders] ❌ Error:', errorMsg);
        setError(errorMsg);
        setGlobalError('orders', errorMsg);
      }
      
      return response;
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[useOrders] Request was aborted');
        return { success: false, data: [], error: 'Request aborted', timestamp: new Date().toISOString() };
      }
      
      const errorMsg = error.message || 'Unknown error occurred';
      console.error('[useOrders] ❌ Exception:', error);
      setError(errorMsg);
      setGlobalError('orders', errorMsg);
      
      return { success: false, data: [], error: errorMsg, timestamp: new Date().toISOString() };
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [setOrders, setGlobalError, clearGlobalError]);

  // Refresh orders with the last used query
  const refreshOrders = useCallback(async (): Promise<void> => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchOrders(lastQueryRef.current);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchOrders, isRefreshing]);

  // Get order by ID
  const getOrderById = useCallback((id: string): OrderData | undefined => {
    return orders.find(order => order.id === id);
  }, [orders]);

  // Get orders by status
  const getOrdersByStatus = useCallback((status: string): OrderData[] => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  // Computed values
  const activeOrders = orders.filter(order => 
    order.status === 'active' || order.status === 'locked' || order.status === 'proving'
  );
  
  const pendingOrders = orders.filter(order => order.status === 'pending');

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

    // Set up new interval (orders refresh more frequently than provers)
    const orderRefreshInterval = Math.min(refreshInterval, 15000); // Max 15 seconds for orders
    
    intervalRef.current = setInterval(() => {
      if (!loading && !isRefreshing) {
        console.log(`[useOrders] Auto-refreshing (interval: ${orderRefreshInterval}ms)`);
        refreshOrders();
      }
    }, orderRefreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, loading, isRefreshing, refreshOrders]);

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
    if (error && orders.length === 0) {
      const retryTimer = setTimeout(() => {
        console.log('[useOrders] Attempting error recovery...');
        refreshOrders();
      }, 5000); // Retry after 5 seconds for orders (faster than provers)

      return () => clearTimeout(retryTimer);
    }
  }, [error, orders.length, refreshOrders]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('[useOrders] State updated:', {
      ordersCount: orders.length,
      activeCount: activeOrders.length,
      pendingCount: pendingOrders.length,
      loading,
      error,
      lastUpdated,
      isRefreshing
    });
  }, [orders.length, activeOrders.length, pendingOrders.length, loading, error, lastUpdated, isRefreshing]);

  return {
    orders,
    loading,
    error,
    lastUpdated,
    fetchOrders,
    refreshOrders,
    getOrderById,
    getOrdersByStatus,
    isRefreshing,
    activeOrders,
    pendingOrders
  };
};

// Extended hook with additional utilities
export const useOrdersExtended = () => {
  const baseHook = useOrders();
  const { orders } = baseHook;

  // Computed values
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => o.status === 'active').length,
    completed: orders.filter(o => o.status === 'completed').length,
    failed: orders.filter(o => o.status === 'failed').length,
    expired: orders.filter(o => o.status === 'expired').length,
    averageReward: orders.length > 0 
      ? orders.reduce((sum, o) => sum + o.reward, 0) / orders.length 
      : 0,
    totalReward: orders.reduce((sum, o) => sum + o.reward, 0),
    highestReward: Math.max(...orders.map(o => o.reward), 0),
    urgentOrders: orders.filter(o => o.priority === 'urgent' || o.priority === 'high').length
  };

  // Filters
  const filters = {
    byStatus: (status: string) => orders.filter(o => o.status === status),
    byPriority: (priority: string) => orders.filter(o => o.priority === priority),
    byNetwork: (networkId: number) => orders.filter(o => o.networkId === networkId),
    byRewardRange: (min: number, max: number) => 
      orders.filter(o => o.reward >= min && o.reward <= max),
    byTimeLeft: (maxSeconds: number) => orders.filter(o => o.timeLeft <= maxSeconds),
    byTaskType: (taskType: string) => orders.filter(o => o.taskType === taskType),
    search: (query: string) => orders.filter(o => 
      o.id.toLowerCase().includes(query.toLowerCase()) ||
      o.taskType.toLowerCase().includes(query.toLowerCase()) ||
      (o.taskDescription && o.taskDescription.toLowerCase().includes(query.toLowerCase()))
    )
  };

  // Sorters
  const sorters = {
    byReward: (desc = true) => [...orders].sort((a, b) => 
      desc ? b.reward - a.reward : a.reward - b.reward
    ),
    byTimeLeft: (desc = false) => [...orders].sort((a, b) => 
      desc ? b.timeLeft - a.timeLeft : a.timeLeft - b.timeLeft
    ),
    byPriority: () => [...orders].sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    }),
    byCreatedAt: (desc = true) => [...orders].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return desc ? bTime - aTime : aTime - bTime;
    }),
    byStatus: () => [...orders].sort((a, b) => {
      const statusOrder = { pending: 5, active: 4, proving: 3, completed: 2, failed: 1, expired: 0 };
      return (statusOrder[b.status as keyof typeof statusOrder] || 0) - 
             (statusOrder[a.status as keyof typeof statusOrder] || 0);
    })
  };

  // Utilities
  const utils = {
    getUrgentOrders: () => orders.filter(o => 
      o.priority === 'urgent' || o.timeLeft < 300 // Less than 5 minutes
    ),
    getHighValueOrders: (threshold = 100) => orders.filter(o => o.reward >= threshold),
    getRecentOrders: (hours = 1) => {
      const cutoff = Date.now() - (hours * 60 * 60 * 1000);
      return orders.filter(o => new Date(o.createdAt).getTime() > cutoff);
    },
    getOrdersForProver: (proverAddress: string) => 
      orders.filter(o => o.proverAddress === proverAddress),
    calculateEstimatedEarnings: () => {
      const pendingRewards = orders
        .filter(o => o.status === 'pending')
        .reduce((sum, o) => sum + o.reward, 0);
      return pendingRewards;
    }
  };

  return {
    ...baseHook,
    stats,
    filters,
    sorters,
    utils
  };
};

export default useOrders;
