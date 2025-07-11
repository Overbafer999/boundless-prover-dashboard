'use client'

import { useProvers } from '@/hooks/useProvers'
import { useOrders } from '@/hooks/useOrders'

export default function Home() {
  const { provers, loading: proversLoading } = useProvers()
  const { orders, loading: ordersLoading } = useOrders()

  if (proversLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Boundless Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          🚀 Boundless Prover Dashboard
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Provers Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Active Provers</h2>
            <div className="space-y-4">
              {provers.map(prover => (
                <div key={prover.id} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{prover.name}</span>
                    <span className={`px-2 py-1 rounded text-sm text-white ${
                      prover.status === 'online' ? 'bg-green-600' : 
                      prover.status === 'busy' ? 'bg-blue-600' : 'bg-red-600'
                    }`}>
                      {prover.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    Earnings: ${prover.earnings} • Hash Rate: {prover.hashRate} H/s
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Recent Orders</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-gray-700 p-4 rounded">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Order #{order.id}</span>
                    <span className={`px-2 py-1 rounded text-sm text-white ${
                      order.status === 'processing' ? 'bg-blue-600' : 
                      order.status === 'completed' ? 'bg-green-600' : 
                      order.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300 mt-2">
                    Reward: ${order.reward}
                    {order.proverId && ` • Prover: ${order.proverId}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
