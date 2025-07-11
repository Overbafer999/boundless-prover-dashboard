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
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    try {
      // Simple notification sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+zosGccBTeS2e/9eSwFJHfJ8N2QQAoUXrTp66hVFApGn+zosGccBDeS2e/9eSwF');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch (error) {
      console.log('[WebSocket] Could not play notification sound:', error);
    }
  }, []);

  // Handle WebSocket messages
  const handleMessage = useCallback((message: WebSocketMessage) => {
    console.log(`[WebSocket] Received message: ${message.type}`);
    setLastMessage(message);

    switch (message.type) {
      case 'order_new':
        storeHelpers.handleOrder(message.data as OrderData);
        playNotificationSound();
        break;
        
      case 'order_update':
        storeHelpers.handleOrder(message.data as OrderData);
        break;
        
      case 'prover_update':
        storeHelpers.handleProverUpdate(message.data as ProverData & { address: string });
        break;
        
      case 'market_stats':
        console.log('[WebSocket] Market stats updated:', message.data);
        break;
        
      case 'error':
        console.error('[WebSocket] Server error:', message.data);
        break;
        
      default:
        console.log('[WebSocket] Unknown message type:', message.type);
    }
  }, [playNotificationSound]);

  // Handle connection status changes
  const handleConnectionChange = useCallback((connected: boolean) => {
    console.log(`[WebSocket] Connection status: ${connected ? 'Connected' : 'Disconnected'}`);
    setIsConnected(connected);
    
    if (connected) {
      setConnectionAttempts(0);
    } else {
      if (!isManuallyDisconnected) {
        setConnectionAttempts(prev => prev + 1);
      }
    }
  }, [isManuallyDisconnected]);

  // Handle WebSocket errors
  const handleError = useCallback((error: string) => {
    console.error('[WebSocket] Error:', error);
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    console.log('[WebSocket] Connecting...');
    setIsManuallyDisconnected(false);

    try {
      wsRef.current = new BoundlessWebSocket('ws://localhost:8080');
      setIsConnected(true);
    } catch (error: any) {
      console.error('[WebSocket] Setup failed:', error);
      handleError(error.message);
    }
  }, [handleError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('[WebSocket] Manually disconnecting');
    setIsManuallyDisconnected(true);
    
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Subscribe to specific data streams
  const subscribe = useCallback((filters: any = {}) => {
    console.log('[WebSocket] Subscribing with filters:', filters);
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: WebSocketMessage) => {
    console.log('[WebSocket] Sending message:', message.type);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    const connectTimer = setTimeout(() => {
      if (!isManuallyDisconnected) {
        connect();
      }
    }, 1000);

    return () => clearTimeout(connectTimer);
  }, [connect, isManuallyDisconnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, []);

  return {
    isConnected,
    connectionAttempts,
    lastMessage,
    connect,
    disconnect,
    subscribe,
    sendMessage
  };
};

export default useWebSocket;
