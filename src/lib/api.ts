import type { Prover, Order, MarketStats } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.boundless.fi'

export const boundlessAPI = {
  async getProvers(): Promise<Prover[]> {
    // Mock data for now
    return [
      {
        id: '1',
        name: 'Prover Alpha',
        status: 'online',
        earnings: 1250.50,
        uptime: 98.5,
        gpu: 'RTX 4090',
        location: 'US-East'
      },
      {
        id: '2', 
        name: 'Prover Beta',
        status: 'proving',
        earnings: 890.25,
        uptime: 94.2,
        gpu: 'RTX 3080',
        location: 'EU-West'
      }
    ]
  },

  async getOrders(): Promise<Order[]> {
    return [
      {
        id: '1',
        status: 'active',
        reward: 125.50,
        prover: 'Prover Alpha',
        createdAt: new Date(),
      },
      {
        id: '2',
        status: 'pending', 
        reward: 89.25,
        createdAt: new Date(),
      }
    ]
  },

  async getMarketStats(): Promise<MarketStats> {
    return {
      totalValueLocked: 12750000,
      activeProvers: 247,
      totalProvers: 315,
      activeOrders: 18,
      successRate: 97.3,
      averageReward: 145.75,
      avgResponseTime: 2300
    }
  }
}
