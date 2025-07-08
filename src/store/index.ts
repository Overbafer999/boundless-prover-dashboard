// Zustand Store for Boundless Prover Dashboard
// Global state management with persistence

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  ProverData, 
  OrderData, 
  MarketStats, 
  NotificationData, 
  NetworkInfo,
  WebSocketMessage 
} from '@/lib/types';
import { getCurrentNetwork } from '@/lib/api';

// Main app store interface
interface AppStore {
  // Network & Connection
  currentNetwork: NetworkInfo;
  isWebSocketConnected: boolean;
  lastWebSocketMessage: WebSocketMessage | null;
  connectionAttempts: number;
  
  // Data
  provers: ProverData[];
  orders: OrderData[];
  marketStats: MarketStats | null;
  
  // UI State
  notifications: NotificationData[];
  isLoading: boolean;
  errors: Record<string, string>;
  
  // Settings
  theme: 'light' | 'dark';
  refreshInterval: number;
  autoRefresh: boolean;
  soundEnabled: boolean;
  
  // Actions
  setNetwork: (network: NetworkInfo) => void;
  setWebSocketStatus: (connected: boolean) => void;
  setWebSocketMessage: (message: WebSocketMessage) => void;
  incrementConnectionAttempts: () => void;
  resetConnectionAttempts: () => void;
  
  // Data actions
  setProvers: (provers: ProverData[]) => void;
  updateProver: (id: string, data: Partial<ProverData>) => void;
  setOrders: (orders: OrderData[]) => void;
  addOrder: (order: OrderData) => void;
  updateOrder: (id: string, data: Partial<OrderData>) => void;
  removeOrder: (id: string) => void;
  setMarketStats: (stats: MarketStats) => void;
  
  // Notifications
  addNotification: (notification: Omit<NotificationData, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // UI actions
  setLoading: (isLoading: boolean) => void;
  setError: (key: string, error: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  
  // Settings actions
  setTheme: (theme: 'light' | 'dark') => void;
  setRefreshInterval: (interval: number) => void;
  setAutoRefresh: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  
  // Computed values
  activeOrders: () => OrderData[];
  onlineProvers: () => ProverData[];
  topProvers: (limit?: number) => ProverData[];
  unreadNotifications: () => NotificationData[];
}

// Create the main store
export const useStore = create<AppStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        currentNetwork: getCurrentNetwork(),
        isWebSocketConnected: false,
        lastWebSocketMessage: null,
        connectionAttempts: 0,
        
        provers: [],
        orders: [],
        marketStats: null,
        
        notifications: [],
        isLoading: false,
        errors: {},
        
        theme: 'dark',
        refreshInterval: 30000,
        autoRefresh: true,
        soundEnabled: true,
        
        // Network & Connection actions
        setNetwork: (network) => set({ currentNetwork: network }),
        
        setWebSocketStatus: (connected) => set({ 
          isWebSocketConnected: connected,
          connectionAttempts: connected ? 0 : get().connectionAttempts
        }),
        
        setWebSocketMessage: (message) => set({ lastWebSocketMessage: message }),
        
        incrementConnectionAttempts: () => set((state) => ({ 
          connectionAttempts: state.connectionAttempts + 1 
        })),
        
        resetConnectionAttempts: () => set({ connectionAttempts: 0 }),
        
        // Data actions
        setProvers: (provers) => set({ provers }),
        
        updateProver: (id, data) => set((state) => ({
          provers: state.provers.map(prover => 
            prover.id === id ? { ...prover, ...data } : prover
          )
        })),
        
        setOrders: (orders) => set({ orders }),
        
        addOrder: (order) => set((state) => ({
          orders: [order, ...state.orders]
        })),
        
        updateOrder: (id, data) => set((state) => ({
          orders: state.orders.map(order => 
            order.id === id ? { ...order, ...data } : order
          )
        })),
        
        removeOrder: (id) => set((state) => ({
          orders: state.orders.filter(order => order.id !== id)
        })),
        
        setMarketStats: (stats) => set({ marketStats: stats }),
        
        // Notification actions
        addNotification: (notification) => {
          const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const newNotification: NotificationData = {
            ...notification,
            id,
            createdAt: new Date().toISOString(),
            isRead: false
          };
          
          set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50) // Limit to 50 notifications
          }));
          
          // Auto-remove notification after 10 seconds for non-critical ones
          if (notification.priority !== 'high') {
            setTimeout(() => {
              set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
              }));
            }, 10000);
          }
        },
        
        markNotificationAsRead: (id) => set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
          )
        })),
        
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter(notification => notification.id !== id)
        })),
        
        clearNotifications: () => set({ notifications: [] }),
        
        // UI actions
        setLoading: (isLoading) => set({ isLoading }),
        
        setError: (key, error) => set((state) => ({
          errors: { ...state.errors, [key]: error }
        })),
        
        clearError: (key) => set((state) => {
          const newErrors = { ...state.errors };
          delete newErrors[key];
          return { errors: newErrors };
        }),
        
        clearAllErrors: () => set({ errors: {} }),
        
        // Settings actions
        setTheme: (theme) => set({ theme }),
        setRefreshInterval: (interval) => set({ refreshInterval: interval }),
        setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
        setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
        
        // Computed values
        activeOrders: () => {
          return get().orders.filter(order => 
            order.status === 'pending' || order.status === 'active'
          );
        },
        
        onlineProvers: () => {
          return get().provers.filter(prover => prover.isOnline);
        },
        
        topProvers: (limit = 10) => {
          return get().provers
            .sort((a, b) => b.earnings - a.earnings)
            .slice(0, limit);
        },
        
        unreadNotifications: () => {
          return get().notifications.filter(notification => !notification.isRead);
        }
      }),
      {
        name: 'boundless-dashboard-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist certain parts of the state
          currentNetwork: state.currentNetwork,
          theme: state.theme,
          refreshInterval: state.refreshInterval,
          autoRefresh: state.autoRefresh,
          soundEnabled: state.soundEnabled,
          notifications: state.notifications.filter(n => n.priority === 'high'), // Only persist high priority notifications
        }),
        onRehydrateStorage: () => (state) => {
          // Reset non-persistent state on hydration
          if (state) {
            state.isWebSocketConnected = false;
            state.lastWebSocketMessage = null;
            state.connectionAttempts = 0;
            state.isLoading = false;
            state.errors = {};
          }
        },
      }
    )
  )
);

// Selectors for better performance
export const useProvers = () => useStore((state) => state.provers);
export const useOrders = () => useStore((state) => state.orders);
export const useMarketStats = () => useStore((state) => state.marketStats);
export const useNotifications = () => useStore((state) => state.notifications);
export const useUnreadNotifications = () => useStore((state) => state.unreadNotifications());
export const useWebSocketStatus = () => useStore((state) => ({
  isConnected: state.isWebSocketConnected,
  lastMessage: state.lastWebSocketMessage,
  attempts: state.connectionAttempts
}));
export const useTheme = () => useStore((state) => state.theme);
export const useSettings = () => useStore((state) => ({
  theme: state.theme,
  refreshInterval: state.refreshInterval,
  autoRefresh: state.autoRefresh,
  soundEnabled: state.soundEnabled
}));

// Store subscriptions for side effects
export const subscribeToWebSocket = (callback: (connected: boolean) => void) => {
  return useStore.subscribe(
    (state) => state.isWebSocketConnected,
    callback
  );
};

export const subscribeToNotifications = (callback: (notifications: NotificationData[]) => void) => {
  return useStore.subscribe(
    (state) => state.notifications,
    callback
  );
};

export const subscribeToErrors = (callback: (errors: Record<string, string>) => void) => {
  return useStore.subscribe(
    (state) => state.errors,
    callback
  );
};

// Helper functions for common operations
export const storeHelpers = {
  // Add a prover update from WebSocket
  handleProverUpdate: (proverData: Partial<ProverData> & { address: string }) => {
    const { updateProver, provers } = useStore.getState();
    const existingProver = provers.find(p => p.address === proverData.address);
    
    if (existingProver) {
      updateProver(existingProver.id, proverData);
    }
  },
  
  // Add an order update from WebSocket
  handleOrder
