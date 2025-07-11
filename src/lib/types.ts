// Core types for Boundless Prover Dashboard

export interface ProverData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
  hashRate: number;
  earnings: number;
  uptime: number;
  location: string;
  lastUpdate: string;
  timeLeft?: number;
}

export interface OrderData {
  id: string;
  type: 'proof' | 'verification';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reward: number;
  difficulty: number;
  submittedAt: string;
  completedAt?: string;
  proverId?: string;
}

export interface NetworkInfo {
  isConnected: boolean;
  latency?: number;
  lastUpdate: string;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface EarningsData {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  currency: string;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastPing: string;
  reconnectAttempts: number;
}

export interface StoreState {
  provers: ProverData[];
  orders: OrderData[];
  earnings: EarningsData;
  networkInfo: NetworkInfo;
  isLoading: boolean;
  error: string | null;
}
export interface MarketStats {
  totalValueLocked: number;
  activeProvers: number;
  totalProvers: number;
  activeOrders: number;
  successRate: number;
  averageReward: number;
  avgResponseTime: number;
}

export interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  isRead: boolean;
}
