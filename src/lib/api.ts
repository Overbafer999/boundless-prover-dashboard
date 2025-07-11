import type { NetworkInfo } from "./types";
import type { ProverData, OrderData } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.boundless.fi'

export const boundlessAPI = {
  async getProvers(): Promise<ProverData[]> {
    // Mock data for now
    return [
      {
        id: '1',
        name: 'Prover Alpha',
        status: 'online',
        hashRate: 1250,
        earnings: 1250.50,
        uptime: 98.5,
        location: 'US-East',
        lastUpdate: new Date().toISOString()
      },
      {
        id: '2', 
        name: 'Prover Beta',
        status: 'busy',
        hashRate: 890,
        earnings: 890.25,
        uptime: 94.2,
        location: 'EU-West',
        lastUpdate: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Prover Gamma',
        status: 'offline',
        hashRate: 0,
        earnings: 654.75,
        uptime: 87.3,
        location: 'Asia-Pacific',
        lastUpdate: new Date().toISOString()
      }
    ]
  },

  async getOrders(): Promise<OrderData[]> {
    return [
      {
        id: '1',
        type: 'proof',
        status: 'processing',
        reward: 125.50,
        difficulty: 8,
        submittedAt: new Date().toISOString(),
        proverId: 'Prover Alpha',
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
        proverId: 'Prover Beta',
      }
    ]
  }
}
export const getCurrentNetwork = (): NetworkInfo => ({
  isConnected: true,
  lastUpdate: new Date().toISOString()
})
