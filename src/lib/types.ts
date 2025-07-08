export interface Prover {
  id: string
  name: string
  status: 'online' | 'offline' | 'proving'
  earnings: number
  uptime: number
  gpu: string
  location: string
}

export interface Order {
  id: string
  status: 'pending' | 'active' | 'completed'
  reward: number
  prover?: string
  createdAt: Date
  completedAt?: Date
}

export interface MarketStats {
  totalValueLocked: number
  activeProvers: number
  totalProvers: number
  activeOrders: number
  successRate: number
  averageReward: number
  avgResponseTime: number
}
