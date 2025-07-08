'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore, storeHelpers } from '@/store';
import { BoundlessWebSocket } from '@/lib/websocket';
import type { NetworkInfo, WebSocketMessage, OrderData, ProverData } from '@/lib/types';

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionAttempts: number;
  lastMessage: WebSocketMessage | null;
  connect: () => void;
  disconnect: () => void;
  subscribe: (filters?: any) => void;
  sendMessage: (message: WebSocketMessage) => void;
}

export const useWebSocket = (network: NetworkInfo): UseWebSocketReturn => {
  const wsRef = useRef<BoundlessWebSocket | null>(null);
  const [isManuallyDisconnected, setIsManuallyDisconnected] = useState(false);
  
  const {
    isWebSocketConnected,
    connectionAttempts,
    lastWebSocketMessage,
    setWebSocketStatus,
    setWebSocketMessage,
    incrementConnectionAttempts,
    resetConnectionAttempts,
    addNotification,
    soundEnabled
  } = useStore();

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    
    try {
      // Create audio context for better browser support
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a simple beep sound
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('[WebSocket] Could not play notification sound:', error);
    }
  }, [soundEnabled]);

  // Handle WebSocket messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log(`[WebSocket] Received message: ${message.type}`);
    setWebSocketMessage(message);

    switch (message.type) {
      case 'order_new':
        storeHelpers.handleNewOrder(message.data as OrderData);
        playNotificationSound();
        break;
        
      case 'order_update':
        storeHelpers.handleOrderUpdate(message.data as OrderData);
        break;
        
      case 'prover_update':
        storeHelpers.handleProverUpdate(message.data as ProverData);
        break;
        
      case 'market_stats':
        // Handle market stats update
        console.log('[WebSocket] Market stats updated:', message.data);
        break;
        
      case 'error':
        console.error('[WebSocket] Server error:', message.data);
        addNotification({
          type: 'system_alert',
          title: 'WebSocket Error',
          message: message.data.message || 'Unknown server error',
          priority: 'high'
        });
        break;
        
      default:
        console.log('[WebSocket] Unknown message type:', message.type);
    }
  }, [setWebSocketMessage, playNotificationSound, addNotification]);

  // Handle connection status changes
  const handleConnectionChange = useCallback((connected: boolean) => {
    console.log(`[WebSocket] Connection status: ${connected ? 'Connected' : 'Disconnected'}`);
    
    if (connected) {
      resetConnectionAttempts();
      storeHelpers.handleConnectionChange(true);
    } else {
      if (!isManuallyDisconnected) {
        incrementConnectionAttempts();
        storeHelpers.handleConnectionChange(false);
      }
    }
  }, [resetConnectionAttempts, incrementConnectionAttempts, isManuallyDisconnected]);

  // Handle WebSocket errors
  const handleError = useCallback((error: string) => {
    console.error('[WebSocket] Error:', error);
    storeHelpers.handleError('websocket', error, false); // Don't show notification for every error
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.getConnectionStatus().connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log(`[WebSocket] Connecting to ${network.orderStreamUrl}`);
    setIsManuallyDisconnected(false);

    try {
      wsRef.current = new BoundlessWebSocket(network);
      
      // Set up event handlers
      wsRef.current.on('onMessage', handleMessage);
      wsRef.current.on('onConnectionChange', handleConnectionChange);
      wsRef.current.on('onError', handleError);
      
      // Connect
      wsRef.current.connect().catch((error) => {
        console.error('[WebSocket] Connection failed:', error);
        handleError(error.message);
      });
      
    } catch (error: any) {
      console.error('[WebSocket] Setup failed:', error);
      handleError(error.message);
    }
  }, [network, handleMessage, handleConnectionChange, handleError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('[WebSocket] Manually disconnecting');
    setIsManuallyDisconnected(true);
    
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    
    setWebSocketStatus(false);
  }, [setWebSocketStatus]);

  // Subscribe to specific data streams
  const subscribe = useCallback((filters: any = {}) => {
    if (!wsRef.current?.getConnectionStatus().connected) {
      console.warn('[WebSocket] Not connected, cannot subscribe');
      return;
    }

    console.log('[WebSocket] Subscribing with filters:', filters);
    
    // Subscribe to orders
    wsRef.current.subscribeToOrders({
      minReward: filters.minReward || 0,
      taskType: filters.taskType,
      ...filters
    });

    // Subscribe to prover updates if specified
    if (filters.proverAddress) {
      wsRef.current.subscribeToProver(filters.proverAddress);
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (!wsRef.current?.getConnectionStatus().connected) {
      console.warn('[WebSocket] Not connected, cannot send message');
      return;
    }

    console.log('[WebSocket] Sending message:', message.type);
    // Note: BoundlessWebSocket.send is private, so we'd need to expose it or use specific methods
    // For now, this is a placeholder for future functionality
  }, []);

  // Auto-connect on mount and network change
  useEffect(() => {
    if (!BoundlessWebSocket.isSupported()) {
      console.warn('[WebSocket] WebSockets not supported in this browser');
      return;
    }

    // Auto-connect after a short delay to allow other hooks to initialize
    const connectTimer = setTimeout(() => {
      if (!isManuallyDisconnected) {
        connect();
      }
    }, 1000);

    return () => clearTimeout(connectTimer);
  }, [network.orderStreamUrl, connect, isManuallyDisconnected]);

  // Auto-reconnect logic
  useEffect(() => {
    if (isManuallyDisconnected || isWebSocketConnected) return;

    // Progressive backoff: 1s, 2s, 4s, 8s, max 30s
    const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
    
    if (connectionAttempts > 0 && connectionAttempts < 10) {
      console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${connectionAttempts + 1})`);
      
      const reconnectTimer = setTimeout(() => {
        if (!isManuallyDisconnected) {
          connect();
        }
      }, delay);

      return () => clearTimeout(reconnectTimer);
    } else if (connectionAttempts >= 10) {
      console.warn('[WebSocket] Max reconnection attempts reached');
      addNotification({
        type: 'system_alert',
        title: 'Connection Failed',
        message: 'Unable to establish WebSocket connection. Please check your internet connection.',
        priority: 'high'
      });
    }
  }, [connectionAttempts, isWebSocketConnected, isManuallyDisconnected, connect, addNotification]);

  // Subscribe to default streams on connection
  useEffect(() => {
    if (isWebSocketConnected && wsRef.current) {
      // Default subscription - listen to all new orders
      subscribe({
        minReward: 1, // Only orders with at least $1 reward
      });
    }
  }, [isWebSocketConnected, subscribe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, []);

  // Monitor connection health
  useEffect(() => {
    if (!isWebSocketConnected) return;

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.getConnectionStatus().connected) {
        // Connection is healthy
        console.log('[WebSocket] Connection health check passed');
      } else {
        console.warn('[WebSocket] Connection health check failed');
        handleConnectionChange(false);
      }
    }, 30000);

    return () => clearInterval(pingInterval);
  }, [isWebSocketConnected, handleConnectionChange]);

  // Debug logging
  useEffect(() => {
    console.log('[useWebSocket] State updated:', {
      connected: isWebSocketConnected,
      attempts: connectionAttempts,
      manualDisconnect: isManuallyDisconnected,
      network: network.name
    });
  }, [isWebSocketConnected, connectionAttempts, isManuallyDisconnected, network.name]);

  return {
    isConnected: isWebSocketConnected,
    connectionAttempts,
    lastMessage: lastWebSocketMessage,
    connect,
    disconnect,
    subscribe,
    sendMessage
  };
};

// Specialized hook for order subscriptions
export const useWebSocketOrders = (filters: {
  minReward?: number;
  maxReward?: number;
  taskType?: string;
} = {}) => {
  const network = useStore((state) => state.currentNetwork);
  const webSocket = useWebSocket(network);
  
  useEffect(() => {
    if (webSocket.isConnected) {
      webSocket.subscribe(filters);
    }
  }, [webSocket.isConnected, webSocket.subscribe, filters]);

  return webSocket;
};

// Specialized hook for prover subscriptions
export const useWebSocketProver = (proverAddress?: string) => {
  const network = useStore((state) => state.currentNetwork);
  const webSocket = useWebSocket(network);
  
  useEffect(() => {
    if (webSocket.isConnected && proverAddress) {
      webSocket.subscribe({ proverAddress });
    }
  }, [webSocket.isConnected, webSocket.subscribe, proverAddress]);

  return webSocket;
};

export default useWebSocket;
