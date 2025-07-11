'use client'
import React from 'react'

interface ProverData {
  name: string
  earnings: number
  hashRate: number
  status: 'online' | 'busy' | 'offline'
}

interface OrderData {
  id: string
  reward: number
  prover?: string
  status: 'processing' | 'pending' | 'completed'
}

const provers: ProverData[] = [
  { name: 'Prover Alpha', earnings: 1250.5, hashRate: 1250, status: 'online' },
  { name: 'Prover Beta', earnings: 890.25, hashRate: 890, status: 'busy' },
  { name: 'Prover Gamma', earnings: 654.75, hashRate: 0, status: 'offline' },
]

const orders: OrderData[] = [
  { id: '#1', reward: 125.5, prover: 'Prover Alpha', status: 'processing' },
  { id: '#2', reward: 89.25, status: 'pending' },
  { id: '#3', reward: 234.75, prover: 'Prover Beta', status: 'completed' },
]

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'online':
        return 'bg-boundless-success/20 text-boundless-success border-boundless-success/50'
      case 'busy':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'offline':
        return 'bg-boundless-danger/20 text-boundless-danger border-boundless-danger/50'
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'pending':
        return 'bg-boundless-warning/20 text-boundless-warning border-boundless-warning/50'
      case 'completed':
        return 'bg-boundless-success/20 text-boundless-success border-boundless-success/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyles()}`}>
      {status}
    </span>
  )
}

const ProverCard = ({ prover }: { prover: ProverData }) => (
  <div className="bg-boundless-card/40 backdrop-blur-sm rounded-2xl p-6 border border-boundless-accent/20 
    hover:border-boundless-accent/40 transition-all duration-300 
    hover:shadow-lg hover:shadow-boundless-accent/10
    relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-boundless-accent/5 to-boundless-neon/5 
      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-orbitron font-bold text-white">{prover.name}</h3>
        <StatusBadge status={prover.status} />
      </div>
      
      <div className="space-y-2 text-gray-300">
        <p className="flex justify-between">
          <span>Earnings:</span>
          <span className="font-bold text-boundless-accent">${prover.earnings.toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span>Hash Rate:</span>
          <span className="font-bold text-boundless-neon">{prover.hashRate} H/s</span>
        </p>
      </div>
    </div>
  </div>
)

const OrderCard = ({ order }: { order: OrderData }) => (
  <div className="bg-boundless-card/40 backdrop-blur-sm rounded-2xl p-6 border border-boundless-accent/20 
    hover:border-boundless-accent/40 transition-all duration-300 
    hover:shadow-lg hover:shadow-boundless-accent/10
    relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-boundless-accent/5 to-boundless-neon/5 
      opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-orbitron font-bold text-white">Order {order.id}</h3>
        <StatusBadge status={order.status} />
      </div>
      
      <div className="space-y-2 text-gray-300">
        <p className="flex justify-between">
          <span>Reward:</span>
          <span className="font-bold text-boundless-accent">${order.reward.toFixed(2)}</span>
        </p>
        {order.prover && (
          <p className="flex justify-between">
            <span>Prover:</span>
            <span className="font-bold text-boundless-neon">{order.prover}</span>
          </p>
        )}
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-5xl font-orbitron font-extrabold text-white mb-4 drop-shadow-neon">
          Welcome to Boundless
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Monitor your provers, track earnings, and manage orders in real-time
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-boundless-accent/20 to-boundless-neon/20 
          rounded-2xl p-6 border border-boundless-accent/30">
          <h3 className="text-lg font-orbitron font-bold text-boundless-accent mb-2">Total Earnings</h3>
          <p className="text-3xl font-bold text-white">${provers.reduce((sum, p) => sum + p.earnings, 0).toFixed(2)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-boundless-neon/20 to-boundless-accent/20 
          rounded-2xl p-6 border border-boundless-neon/30">
          <h3 className="text-lg font-orbitron font-bold text-boundless-neon mb-2">Active Provers</h3>
          <p className="text-3xl font-bold text-white">{provers.filter(p => p.status !== 'offline').length}</p>
        </div>
        
        <div className="bg-gradient-to-br from-boundless-success/20 to-boundless-accent/20 
          rounded-2xl p-6 border border-boundless-success/30">
          <h3 className="text-lg font-orbitron font-bold text-boundless-success mb-2">Orders Completed</h3>
          <p className="text-3xl font-bold text-white">{orders.filter(o => o.status === 'completed').length}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Provers */}
        <div className="space-y-6">
          <h2 className="text-3xl font-orbitron font-bold text-white drop-shadow-neon">
            Active Provers
          </h2>
          <div className="space-y-4">
            {provers.map((prover, index) => (
              <ProverCard key={index} prover={prover} />
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="space-y-6">
          <h2 className="text-3xl font-orbitron font-bold text-white drop-shadow-neon">
            Recent Orders
          </h2>
          <div className="space-y-4">
            {orders.map((order, index) => (
              <OrderCard key={index} order={order} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
