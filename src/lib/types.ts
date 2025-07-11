// Core types for Boundless Prover Dashboard
export interface ProverData {
  id: string;
  nickname: string;  // Основное поле для имени провера
  name?: string;     // Fallback для совместимости
  status: 'online' | 'offline' | 'busy' | 'maintenance';
  hashRate?: number;
  earnings?: number;
  earnings_usd?: number;  // API поле для доходов
  uptime?: number;
  location?: string;
  lastUpdate?: string;
  last_seen?: string;     // API поле для последней активности
  lastActive?: string;    // Fallback поле
  timeLeft?: number;
  gpu_model?: string;     // API поле для GPU
  gpu?: string;           // Fallback поле
  reputation_score?: number;
  total_orders?: number;
  successful_orders?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderData {
  id: string;
  type?: 'proof' | 'verification' | 'ZK_PROOF' | 'COMPUTATION' | 'VERIFICATION';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'in_progress' | 'cancelled';
  reward: number;
  difficulty?: number;
  submittedAt?: string;
  createdAt?: string;     // API поле
  completedAt?: string;
  completed_at?: string;  // API поле
  proverId?: string;
  prover?: string;        // API поле
  prover_id?: string;     // API поле
  client_id?: string;
  priority?: 'high' | 'medium' | 'low';
  complexity_level?: 'low' | 'medium' | 'high';
  estimated_duration?: number;
  actual_duration?: number;
  price_usd?: number;
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

// API Response типы
export interface APIResponse<T> {
  success: boolean;
  data: T[];
  error?: string;
  source: 'supabase' | 'fallback-data' | 'boundless-order-api';
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Утилитарные типы для безопасной работы с данными
export interface SafeProverData extends Required<Pick<ProverData, 'id' | 'nickname'>> {
  status: ProverData['status'];
  earnings: number;
  gpu_model: string;
  location: string;
  last_seen: string;
}
