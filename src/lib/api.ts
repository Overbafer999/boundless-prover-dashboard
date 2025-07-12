import type { NetworkInfo } from "./types";
import type { ProverData, OrderData } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.boundless.fi'

export const boundlessAPI = {
  async getProvers(options: {
    query?: string
    status?: string
    gpu?: string
    location?: string
    page?: number
    limit?: number
    includeBlockchain?: boolean
    includeRealData?: boolean
  } = {}): Promise<ProverData[]> {
    try {
      // Формируем параметры запроса
      const params = new URLSearchParams()
      
      if (options.query) params.append('q', options.query)
      if (options.status && options.status !== 'all') params.append('status', options.status)
      if (options.gpu && options.gpu !== 'all') params.append('gpu', options.gpu)
      if (options.location && options.location !== 'all') params.append('location', options.location)
      
      params.append('page', (options.page || 1).toString())
      params.append('limit', (options.limit || 50).toString())
      
      // ВКЛЮЧАЕМ BLOCKCHAIN ДАННЫЕ ПО УМОЛЧАНИЮ
      if (options.includeBlockchain !== false) {
        params.append('blockchain', 'true')
      }
      
      // ВКЛЮЧАЕМ РЕАЛЬНЫЕ ДАННЫЕ ПО УМОЛЧАНИЮ  
      if (options.includeRealData !== false) {
        params.append('realdata', 'true')
      }

      console.log('🚀 Fetching provers with params:', params.toString())
      
      // Запрос к нашему реальному API
      const response = await fetch(`/api/provers?${params}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        console.log('✅ Got real blockchain data from API')
        return result.data.map((prover: any) => ({
          // Маппинг к нашему интерфейсу ProverData
          id: prover.id,
          name: prover.nickname || prover.name || 'Unknown Prover',
          nickname: prover.nickname,
          status: prover.status || 'offline',
          hashRate: prover.hashRate || 0,
          earnings: prover.earnings_usd || prover.earnings || 0,
          uptime: prover.uptime || 0,
          location: prover.location || 'Unknown',
          gpu: prover.gpu_model || prover.gpu,
          lastUpdate: prover.last_seen || prover.lastActive || new Date().toISOString(),
          
          // Blockchain данные
          blockchain_address: prover.blockchain_address,
          blockchain_verified: prover.blockchain_verified,
          eth_balance: prover.eth_balance,
          stake_balance: prover.stake_balance,
          is_active_onchain: prover.is_active_onchain,
          
          // Статистика
          total_orders: prover.total_orders,
          successful_orders: prover.successful_orders,
          reputation_score: prover.reputation_score,
          success_rate: prover.success_rate,
          slashes: prover.slashes,
          onchain_activity: prover.onchain_activity,
          
          // Метаданные
          source: prover.source,
          last_blockchain_check: prover.last_blockchain_check
        }))
      }
      
      console.warn('⚠️ API failed, using fallback data')
      throw new Error('API response invalid')
      
    } catch (error) {
      console.error('❌ Failed to fetch provers:', error)
      
      // Fallback данные только если API полностью не работает
      return [
        {
          id: 'fallback-1',
          name: 'CryptoMiner_Pro',
          nickname: 'CryptoMiner_Pro', 
          status: 'online',
          hashRate: 1250,
          earnings: 2847.50,
          uptime: 98.5,
          location: 'US-East',
          gpu: 'RTX 4090',
          lastUpdate: new Date().toISOString(),
          blockchain_address: '0xb607e44023f850d5833c0d1a5d62acad3a5b162e',
          blockchain_verified: true,
          total_orders: 156,
          successful_orders: 152,
          reputation_score: 4.8,
          source: 'fallback-data'
        },
        {
          id: 'fallback-2',
          name: 'ZK_Validator_Alpha',
          nickname: 'ZK_Validator_Alpha',
          status: 'busy', 
          hashRate: 890,
          earnings: 1654.25,
          uptime: 94.2,
          location: 'EU-West',
          gpu: 'RTX 3080',
          lastUpdate: new Date().toISOString(),
          blockchain_address: '0x9430ad33b47e2e84bad1285c9d9786ac628800e4',
          blockchain_verified: true,
          total_orders: 89,
          successful_orders: 86,
          reputation_score: 4.2,
          source: 'fallback-data'
        },
        {
          id: 'fallback-3',
          name: 'ProofWorker_X',
          nickname: 'ProofWorker_X',
          status: 'offline',
          hashRate: 0,
          earnings: 987.75,
          uptime: 87.3,
          location: 'Asia-Pacific', 
          gpu: 'RTX 3070',
          lastUpdate: new Date(Date.now() - 1800000).toISOString(),
          total_orders: 67,
          successful_orders: 61,
          reputation_score: 3.9,
          source: 'fallback-data'
        }
      ]
    }
  },

  async getOrders(options: {
    page?: number
    limit?: number
    status?: string
  } = {}): Promise<OrderData[]> {
    try {
      const params = new URLSearchParams()
      params.append('page', (options.page || 1).toString())
      params.append('limit', (options.limit || 10).toString())
      
      if (options.status && options.status !== 'all') {
        params.append('status', options.status)
      }

      const response = await fetch(`/api/orders?${params}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        return result.data
      }
      
      throw new Error('Orders API failed')
      
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      
      // Fallback orders data
      return [
        {
          id: '1',
          type: 'proof',
          status: 'processing',
          reward: 125.50,
          difficulty: 8,
          submittedAt: new Date().toISOString(),
          proverId: 'CryptoMiner_Pro',
        },
        {
          id: '2',
          type: 'verification',
          status: 'pending', 
          reward: 89.25,
          difficulty: 6,
          submittedAt: new Date().toISOString(),
        },
        {
          id: '3',
          type: 'proof',
          status: 'completed',
          reward: 234.75,
          difficulty: 10,
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date().toISOString(),
          proverId: 'ZK_Validator_Alpha',
        }
      ]
    }
  },

  // Поиск конкретного провера (для ProverSearch компонента)
  async searchProver(query: string): Promise<ProverData[]> {
    return this.getProvers({
      query,
      includeBlockchain: true,
      includeRealData: true,
      limit: 10
    })
  },

  // Получение статистики сети
  async getNetworkStats(): Promise<{
    totalProvers: number
    activeProvers: number
    totalEarnings: number
    completedOrders: number
    averageUptime: number
    lastUpdated: string
  }> {
    try {
      const provers = await this.getProvers({ limit: 100 })
      const orders = await this.getOrders({ limit: 100, status: 'completed' })
      
      return {
        totalProvers: provers.length,
        activeProvers: provers.filter(p => p.status === 'online' || p.is_active_onchain).length,
        totalEarnings: provers.reduce((sum, p) => sum + (p.earnings || 0), 0),
        completedOrders: orders.length,
        averageUptime: provers.reduce((sum, p) => sum + (p.uptime || 0), 0) / provers.length,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to get network stats:', error)
      return {
        totalProvers: 0,
        activeProvers: 0,
        totalEarnings: 0,
        completedOrders: 0,
        averageUptime: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

export const getCurrentNetwork = (): NetworkInfo => ({
  isConnected: true,
  lastUpdate: new Date().toISOString()
})

// Утилитарные функции для работы с blockchain данными
export const blockchainUtils = {
  formatAddress(address: string): string {
    if (!address) return 'No address'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  },

  formatBalance(balance: string | number, symbol: string = 'ETH'): string {
    if (!balance) return `0.000 ${symbol}`
    const num = typeof balance === 'string' ? parseFloat(balance) : balance
    return `${num.toFixed(6)} ${symbol}`
  },

  getExplorerUrl(address: string): string {
    return `https://basescan.org/address/${address}`
  },

  isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }
}
