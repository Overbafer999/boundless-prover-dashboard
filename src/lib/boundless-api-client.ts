// src/lib/boundless-api-client.ts
interface DbOrder {
  id: number;
  order: {
    request: {
      id: string;
      requirements: any;
      imageUrl: string;
      input: any;
      offer: {
        minPrice: string;
        maxPrice: string;
        biddingStart: number;
        timeout: number;
        rampUpPeriod: number;
        lockStake: string;
        lockTimeout: number;
      };
    };
    request_digest: string;
    signature: any;
  };
  created_at: string;
}

interface BoundlessStats {
  totalOrders: number;
  totalCycles: number;
  totalEarnings: bigint;
  totalProvers: number;
  averageReward: number;
  topPrograms: number;
  avgProofTime: number;
  successRate: number;
  recentOrders: DbOrder[];
  timeframeHours: number;
}

export class BoundlessApiClient {
  private baseUrls = [
    'https://explorer.beboundless.xyz',
    'https://api.beboundless.xyz', 
    'https://order-stream.beboundless.xyz'
  ];

  // Попытка подключения к реальному API
  async testApiConnection(): Promise<{ url: string; working: boolean }[]> {
    const results = [];
    
    for (const baseUrl of this.baseUrls) {
      try {
        const response = await fetch(`${baseUrl}/api/v1/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Boundless-Dashboard/1.0'
          }
        });
        
        results.push({
          url: baseUrl,
          working: response.ok
        });
      } catch (error) {
        results.push({
          url: baseUrl,
          working: false
        });
      }
    }
    
    return results;
  }

  // Получение заказов с правильной пагинацией
  async getOrders(offset: number = 0, limit: number = 1000): Promise<DbOrder[]> {
    const workingApis = await this.testApiConnection();
    const workingUrl = workingApis.find(api => api.working)?.url;
    
    if (!workingUrl) {
      throw new Error('No working Boundless API endpoints found');
    }

    try {
      const response = await fetch(`${workingUrl}/api/v1/orders?offset=${offset}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Boundless-Dashboard/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const orders: DbOrder[] = await response.json();
      return orders;
    } catch (error) {
      console.error('❌ Ошибка получения заказов:', error);
      throw error;
    }
  }

  // Получение статистики за период 
  async getStatsByTimeframe(timeframe: '1d' | '3d' | '1w'): Promise<BoundlessStats> {
    try {
      // Получаем все заказы (максимум 1000 последних)
      const allOrders = await this.getOrders(0, 1000);
      
      // Вычисляем временные рамки
      const hoursMap = { '1d': 24, '3d': 72, '1w': 168 };
      const timeframeHours = hoursMap[timeframe];
      const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
      
      // Фильтруем заказы по времени
      const filteredOrders = allOrders.filter(order => 
        new Date(order.created_at) >= cutoffTime
      );
      
      // Вычисляем статистику
      const totalOrders = filteredOrders.length;
      const totalEarnings = filteredOrders.reduce((sum, order) => {
        const maxPrice = BigInt(order.order.request.offer.maxPrice || '0');
        return sum + maxPrice;
      }, BigInt(0));
      
      const totalCycles = filteredOrders.reduce((sum, order) => {
        // Примерная оценка циклов на основе цены
        const price = BigInt(order.order.request.offer.maxPrice || '0');
        return sum + Number(price / BigInt(1000)); // грубая оценка
      }, 0);
      
      const averageReward = totalOrders > 0 ? Number(totalEarnings / BigInt(totalOrders)) : 0;
      
      // Уникальные программы (по imageUrl)
      const uniqueImages = new Set(filteredOrders.map(order => order.order.request.imageUrl));
      const topPrograms = uniqueImages.size;
      
      // Оценка количества проверов (на основе уникальности заказов)
      const estimatedProvers = Math.max(1, Math.floor(totalOrders / 5)); // ~5 заказов на провера
      
      return {
        totalOrders,
        totalCycles,
        totalEarnings,
        totalProvers: estimatedProvers,
        averageReward,
        topPrograms,
        avgProofTime: 45, // статическое значение
        successRate: 99.2, // статическое значение  
        recentOrders: filteredOrders.slice(-10), // последние 10
        timeframeHours
      };
      
    } catch (error) {
      console.error('❌ Ошибка получения статистики:', error);
      throw error;
    }
  }

  // Получение данных по конкретному request_id
  async getOrdersByRequestId(requestId: string): Promise<DbOrder[]> {
    const workingApis = await this.testApiConnection();
    const workingUrl = workingApis.find(api => api.working)?.url;
    
    if (!workingUrl) {
      throw new Error('No working Boundless API endpoints found');
    }

    try {
      const response = await fetch(`${workingUrl}/api/v1/orders/${requestId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Boundless-Dashboard/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const orders: DbOrder[] = await response.json();
      return orders;
    } catch (error) {
      console.error('❌ Ошибка получения заказов по ID:', error);
      throw error;
    }
  }

  // Проверка здоровья API
  async healthCheck(): Promise<boolean> {
    const results = await this.testApiConnection();
    return results.some(result => result.working);
  }

  // Получение nonce для аутентификации (если нужно)
  async getNonce(address: string): Promise<string> {
    const workingApis = await this.testApiConnection();
    const workingUrl = workingApis.find(api => api.working)?.url;
    
    if (!workingUrl) {
      throw new Error('No working Boundless API endpoints found');
    }

    try {
      const response = await fetch(`${workingUrl}/api/v1/nonce/${address}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Boundless-Dashboard/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.nonce;
    } catch (error) {
      console.error('❌ Ошибка получения nonce:', error);
      throw error;
    }
  }
}

// Фабрика для создания клиента
export const createBoundlessClient = () => new BoundlessApiClient();

// Экспорт типов для использования в других файлах
export type { DbOrder, BoundlessStats };
