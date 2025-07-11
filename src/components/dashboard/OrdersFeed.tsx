'use client'

import { useState } from 'react'
import { Filter, Search } from 'lucide-react'
import { OrderData } from '@/lib/types'
import LiveOrderCard from './LiveOrderCard'

interface OrdersFeedProps {
  orders: OrderData[]
}

export default function OrdersFeed({ orders }: OrdersFeedProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.proverId && order.proverId.toLowerCase().includes(searchTerm.toLowerCase()))

    if (!matchesSearch) return false

    switch (filter) {
      case 'all':
        return true
      case 'pending':
        return order.status === 'pending'
      case 'processing':
        return order.status === 'processing'
      case 'completed':
        return order.status === 'completed'
      case 'failed':
        return order.status === 'failed'
      default:
        return true
    }
  })

  const getFilterCount = (filterType: typeof filter) => {
    switch (filterType) {
      case 'all':
        return orders.length
      case 'pending':
        return orders.filter(o => o.status === 'pending').length
      case 'processing':
        return orders.filter(o => o.status === 'processing').length
      case 'completed':
        return orders.filter(o => o.status === 'completed').length
      case 'failed':
        return orders.filter(o => o.status === 'failed').length
      default:
        return 0
    }
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Live Orders Feed</h2>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">{filteredOrders.length} orders</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              <span className="ml-1 text-xs opacity-75">
                ({getFilterCount(filterOption)})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders found matching your criteria.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredOrders.map((order) => (
              <div key={order.id} className="transition-all duration-300 hover:scale-[1.02]">
                <LiveOrderCard order={order} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
