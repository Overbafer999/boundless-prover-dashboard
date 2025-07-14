// Core types for Boundless Prover Dashboard
// === Типы статусов для унификации по всему проекту ===

/** Prover Status */
export type ProverStatus =
  | 'online'
  | 'offline'
  | 'busy'
  | 'maintenance'

/** Order Status (полный список для Supabase и всех API!) */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'in_progress'
  | 'cancelled'

// === Основные типы ===

export interface ProverData {
  id: string;
  nickname: string;  // Основное поле для имени провера
  name?: string;     // Fallback для совместимости
  status: ProverStatus;
  hashRate?: number;
  earnings?: number;
  earnings_usd?: number;  // API поле для доходов
  uptime?: number;
  location?: string;
  lastUpdate?: string;
  last_seen?: string;     // API поле для последней активности
  lastActive?: string;    // Fallback поле
  last_active?: string;   // НОВОЕ: дополнительное поле для активности
  timeLeft?: number;
  gpu_model?: string;     // API поле для GPU
  gpu?: string;           // Fallback поле
  reputation_score?: number;
  total_orders?: number;
  successful_orders?: number;
  created_at?: string;
  updated_at?: string;
  
  // Blockchain поля
  blockchain_address?: string;
  blockchain_verified?: boolean;
  eth_balance?: string;
  stake_balance?: string;
  is_active_onchain?: boolean;
  success_rate?: string | number;
  slashes?: number;
  onchain_activity?: boolean;
  source?: string;
  last_blockchain_check?: string;
}

export interface OrderData {
  id: string;
  type?: 'proof' | 'verification' | 'ZK_PROOF' | 'COMPUTATION' | 'VERIFICATION';
  status: OrderStatus;
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

// НОВЫЙ: Интерфейс для dashboard статистики
export interface DashboardStats {
  totalEarnings: string;
  activeProvers: number;
  verifiedOnChain: number;
  totalOrdersCompleted: number;
  totalHashRate: number;
}

// ОБНОВЛЕННЫЙ: NetworkInfo с дополнительными полями
export interface NetworkInfo {
  isConnected: boolean;
  latency?: number;
  lastUpdate: string;
  blockchainEnabled?: boolean;  // НОВОЕ
  realDataEnabled?: boolean;    // НОВОЕ
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

// ОБНОВЛЕННЫЙ: StoreState с dashboard статистикой
export interface StoreState {
  provers: ProverData[];
  orders: OrderData[];
  earnings: EarningsData;
  networkInfo: NetworkInfo;
  dashboardStats?: DashboardStats;  // НОВОЕ
  isLoading: boolean;
  error: string | null;
}

// ОБНОВЛЕННЫЙ: MarketStats с blockchain данными
export interface MarketStats {
  totalValueLocked: number;
  activeProvers: number;
  totalProvers: number;
  activeOrders: number;
  successRate: number;
  averageReward: number;
  avgResponseTime: number;
  blockchainVerified?: number;      // НОВОЕ
  totalStaked?: string;             // НОВОЕ
  networkHashRate?: number;         // НОВОЕ
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

// ОБНОВЛЕННЫЙ: API Response типы с новыми источниками данных
export interface APIResponse<T> {
  success: boolean;
  data: T[];
  error?: string;
  source: 'supabase' | 'fallback-data' | 'boundless-order-api' | 'supabase+blockchain' | 'supabase+blockchain+realdata' | 'fallback+blockchain+realdata' | 'blockchain_analysis';  // ОБНОВЛЕНО
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  blockchain_enabled?: boolean;     // НОВОЕ
  real_data_enabled?: boolean;      // НОВОЕ
}

// НОВЫЙ: Специальный тип для API статистики
export interface StatsAPIResponse {
  success: boolean;
  data: DashboardStats;
  error?: string;
  source: 'blockchain_analysis' | 'fallback';
}

// НОВЫЙ: Тип для параметров поиска проверов
export interface ProverSearchOptions {
  query?: string;
  status?: string;
  gpu?: string;
  location?: string;
  page?: number;
  limit?: number;
  includeBlockchain?: boolean;
  includeRealData?: boolean;
}

// НОВЫЙ: Тип для blockchain утилит
export interface BlockchainUtils {
  formatAddress: (address: string) => string;
  formatBalance: (balance: string | number, symbol?: string) => string;
  getExplorerUrl: (address: string) => string;
  isValidAddress: (address: string) => boolean;
  formatEarnings: (earnings: number) => string;
  formatHashRate: (hashRate: number) => string;
  getStatusColor: (status: string) => string;
  calculateSuccessRate: (successful: number, total: number) => number;
}

// Утилитарные типы для безопасной работы с данными
export interface SafeProverData extends Required<Pick<ProverData, 'id' | 'nickname'>> {
  status: ProverData['status'];
  earnings: number;
  gpu_model: string;
  location: string;
  last_seen: string;
  blockchain_verified: boolean;     // НОВОЕ: всегда присутствует
  eth_balance: string;              // НОВОЕ: всегда присутствует  
  stake_balance: string;            // НОВОЕ: всегда присутствует
}

// НОВЫЙ: Тип для расширенной информации о провере
export interface EnhancedProverData extends ProverData {
  // Гарантированные поля после обработки API
  displayName: string;              // nickname || name || id
  formattedEarnings: string;        // отформатированные доходы
  formattedBalance: string;         // отформатированный баланс
  statusColor: string;              // CSS класс для статуса
  isActiveOnChain: boolean;         // простое boolean значение
  successRatePercent: number;       // success_rate как число
  uptimePercent: number;            // uptime как число
  lastSeenFormatted: string;        // отформатированная дата
}

// НОВЫЙ: Конфигурация для компонентов
export interface ComponentConfig {
  enableBlockchainData: boolean;
  enableRealTimeUpdates: boolean;
  refreshInterval: number;
  maxSearchResults: number;
  defaultFilters: ProverSearchOptions;
}

// НОВЫЙ: События для отслеживания активности
export interface ActivityEvent {
  id: string;
  type: 'search' | 'select' | 'refresh' | 'error';
  timestamp: string;
  data: any;
  source: string;
}
