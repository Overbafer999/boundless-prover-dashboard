import type { NetworkInfo } from "./types";
import type { ProverData, OrderData, APIResponse } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.boundless.fi'

// Безопасная функция для валидации данных провера
function validateProverData(prover: any): ProverData | null {
  if (!prover || typeof prover !== 'object' || !prover.id) {
    return null;
  }

  return {
    id: prover.id,
    nickname: prover.nickname || prover.name || 'Unknown Prover',
    name: prover.name || prover.nickname,
    status: prover.status || 'offline',
    hashRate: typeof prover.hashRate === 'number' ? prover.hashRate : undefined,
    earnings: typeof prover.earnings_usd === 'number' ? prover.earnings_usd : 
              typeof prover.earnings === 'number' ? prover.earnings : 0,
    earnings_usd: prover.earnings_usd,
    uptime: typeof prover.uptime === 'number' ? prover.uptime : undefined,
    location: prover.location || 'Unknown Location',
    lastUpdate: prover.lastUpdate || prover.last_seen || new Date().toISOString(),
    last_seen: prover.last_seen,
    lastActive: prover.lastActive || prover.last_seen,
    gpu_model: prover.gpu_model || prover.gpu || 'Unknown GPU',
    gpu: prover.gpu || prover.gpu_model,
    reputation_score: prover.reputation_score,
    total_orders: prover.total_orders,
    successful_orders: prover.successful_orders,
    created_at: prover.created_at,
    updated_at: prover.updated_at
  };
}

// Безопасная функция для валидации данных заказа
function validateOrderData(order: any): OrderData | null {
  if (!order || typeof order !== 'object' || !order.id) {
    return null;
  }

  return {
    id: order.id,
    type: order.type || 'proof',
    status: order.status || 'pending',
    reward: typeof order.reward === 'number' ? order.reward : 
            typeof order.price_usd === 'number' ? order.price_usd : 0,
    difficulty: order.difficulty,
    submittedAt: order.submittedAt || order.createdAt || new Date().toISOString(),
    createdAt: order.createdAt || order.submittedAt,
    completedAt: order.completedAt || order.completed_at,
    completed_at: order.completed_at,
    proverId: order.proverId || order.prover || order.prover_id,
    prover: order.prover || order.proverId,
    prover_id: order.prover_id,
    client_id: order.client_id,
    priority: order.priority,
    complexity_level: order.complexity_level,
    estimated_duration: order.estimated_duration,
    actual_duration: order.actual_duration,
    price_usd: order.price_usd
  };
}

export const boundlessAPI = {
  async getProvers(params?: {
    q?: string;
    status?: string;
    gpu?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<ProverData[]> {
    try {
      // Построение URL с параметрами
      const searchParams = new URLSearchParams();
      if (params?.q) searchParams.append('q', params.q);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.gpu) searchParams.append('gpu', params.gpu);
      if (params?.location) searchParams.append('location', params.location);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const url = `/api/provers${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: APIResponse<ProverData> = await response.json();
      
      // Безопасная обработка ответа
      const proversArray = Array.isArray(result.data) ? result.data : 
                          Array.isArray(result) ? result : [];
      
      // Валидация и очистка данных
      const validProvers = proversArray
        .map(validateProverData)
        .filter((prover): prover is ProverData => prover !== null);
      
      return validProvers;
    } catch (error) {
      console.error('Error fetching provers:', error);
      
      // Fallback данные при ошибке
      return [
        {
          id: 'fallback-1',
          nickname: 'Prover Alpha',
          status: 'online',
          hashRate: 1250,
          earnings: 1250.50,
          uptime: 98.5,
          location: 'US-East',
          lastUpdate: new Date().toISOString(),
          gpu_model: 'RTX 4090'
        },
        {
          id: 'fallback-2', 
          nickname: 'Prover Beta',
          status: 'busy',
          hashRate: 890,
          earnings: 890.25,
          uptime: 94.2,
          location: 'EU-West',
          lastUpdate: new Date().toISOString(),
          gpu_model: 'RTX 3080'
        },
        {
          id: 'fallback-3',
          nickname: 'Prover Gamma',
          status: 'offline',
          hashRate: 0,
          earnings: 654.75,
          uptime: 87.3,
          location: 'Asia-Pacific',
          lastUpdate: new Date().toISOString(),
          gpu_model: 'RTX 3070'
        }
      ];
    }
  },

  async getOrders(params?: {
    status?: string;
    prover?: string;
    page?: number;
    limit?: number;
  }): Promise<OrderData[]> {
    try {
      // Построение URL с параметрами
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.prover) searchParams.append('prover', params.prover);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const url = `/api/orders${searchParams.toString() ? `?${searchParams}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: APIResponse<OrderData> = await response.json();
      
      // Безопасная обработка ответа
      const ordersArray = Array.isArray(result.data) ? result.data : 
                         Array.isArray(result) ? result : [];
      
      // Валидация и очистка данных
      const validOrders = ordersArray
        .map(validateOrderData)
        .filter((order): order is OrderData => order !== null);
      
      return validOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Fallback данные при ошибке
      return [
        {
          id: 'fallback-1',
          type: 'proof',
          status: 'processing',
          reward: 125.50,
          difficulty: 8,
          submittedAt: new Date().toISOString(),
          proverId: 'Prover Alpha',
          priority: 'high'
        },
        {
          id: 'fallback-2',
          type: 'verification',
          status: 'pending', 
          reward: 89.25,
          difficulty: 6,
          submittedAt: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: 'fallback-3',
          type: 'proof',
          status: 'completed',
          reward: 234.75,
          difficulty: 10,
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date().toISOString(),
          proverId: 'Prover Beta',
          priority: 'low'
        }
      ];
    }
  },

  // Новый метод для регистрации провера
  async registerProver(proverData: {
    nickname: string;
    gpu_model: string;
    location: string;
  }): Promise<ProverData> {
    try {
      const response = await fetch('/api/provers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proverData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const validatedProver = validateProverData(result.data);
      
      if (!validatedProver) {
        throw new Error('Invalid prover data received from server');
      }

      return validatedProver;
    } catch (error) {
      console.error('Error registering prover:', error);
      throw error;
    }
  }
}

export const getCurrentNetwork = (): NetworkInfo => ({
  isConnected: true,
  lastUpdate: new Date().toISOString()
})
