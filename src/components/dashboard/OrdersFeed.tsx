import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Filter, Clock, DollarSign, Users, Activity } from 'lucide-react'
import LiveOrderCard from './LiveOrderCard'

interface OrderData {
  id: string
  reward: number
  prover?: string
  proverId?: string
  status: 'processing' | 'pending' | 'completed' | 'failed' | 'in_progress' | 'cancelled'
  submittedAt?: string
  createdAt?: string
  priority?: 'high' | 'medium' | 'low'
  type?: 'proof' | 'verification' | 'ZK_PROOF' | 'COMPUTATION' | 'VERIFICATION'
  timeLeft?: number
}

interface OrdersFeedProps {
  orders: OrderData[]
  loading?: boolean
  error?: string | null
}

const LoadingSpinner = () => (
  <motion.div 
    className="flex items-center justify-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="rounded-full h-8 w-8 border-2 border-boundless-accent border-t-transparent"
    />
    <span className="ml-3 text-gray-400 font-medium">Loading orders...</span>
  </motion.div>
)

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
  <motion.div 
    className="text-center py-12 text-gray-400"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
    {searchTerm ? (
      <>
        <p className="text-lg mb-2">No orders found matching "{searchTerm}"</p>
        <p className="text-sm">Try adjusting your search terms</p>
      </>
    ) : (
      <>
        <p className="text-lg">No orders available</p>
        <p className="text-sm mt-2">Orders will appear here when they are created</p>
      </>
    )}
  </motion.div>
)

// Безопасная функция для поиска в строках
function safeStringIncludes(str: string | undefined | null, searchTerm: string): boolean {
  if (!str || typeof str !== 'string') return false
  return str.toLowerCase().includes(searchTerm.toLowerCase())
}

// Безопасная функция для фильтрации заказов
function filterOrders(orders: OrderData[], searchTerm: string, statusFilter: string): OrderData[] {
  if (!Array.isArray(orders)) return []
  
  return orders.filter(order => {
    if (!order || typeof order !== 'object') return false
    
    // Безопасный поиск по полям
    const searchQuery = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || (
      safeStringIncludes(order.id, searchQuery) ||
      safeStringIncludes(order.type, searchQuery) ||
      safeStringIncludes(order.prover, searchQuery) ||
      safeStringIncludes(order.proverId, searchQuery) ||
      safeStringIncludes(order.status, searchQuery) ||
      safeStringIncludes(order.priority, searchQuery)
    )

    if (!matchesSearch) return false

    // Фильтр по статусу
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false
    }

    return true
  })
}

export default function OrdersFeed({ orders, loading = false, error = null }: OrdersFeedProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Безопасная фильтрация заказов
  const filteredOrders = filterOrders(orders, searchTerm, statusFilter)

  // Получение уникальных статусов для фильтра
  const availableStatuses = Array.from(
    new Set(
      orders
        .filter(order => order && order.status)
        .map(order => order.status)
    )
  ).sort()

  const handleClearSearch = () => {
    setSearchTerm('')
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <motion.div 
        className="text-center py-12 text-red-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-lg mb-2">Error loading orders</p>
        <p className="text-sm">{error}</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.h2 
          className="text-3xl font-orbitron font-bold text-white drop-shadow-neon flex items-center gap-3"
          whileHover={{ scale: 1.02 }}
        >
          <Activity className="w-8 h-8 text-boundless-neon" />
          Live Orders ({filteredOrders.length})
        </motion.h2>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders by ID, type, prover, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-3 border border-boundless-accent/30 rounded-xl leading-5 bg-boundless-card/40 backdrop-blur-sm placeholder-gray-500 text-white focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-boundless-accent/50 focus:border-boundless-accent transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          )}
        </motion.div>

        {/* Status Filter */}
        <motion.div 
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-sm text-gray-400 flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4" />
            Filter by status:
          </span>
          
          <button
            onClick={() => handleStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
              statusFilter === 'all'
                ? 'bg-boundless-accent/30 text-boundless-accent border border-boundless-accent/50'
                : 'bg-gray-600/20 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30'
            }`}
          >
            All ({orders.length})
          </button>
          
          {availableStatuses.map(status => {
            const count = orders.filter(order => order.status === status).length
            return (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                  statusFilter === status
                    ? 'bg-boundless-accent/30 text-boundless-accent border border-boundless-accent/50'
                    : 'bg-gray-600/20 text-gray-400 border border-gray-600/50 hover:bg-gray-600/30'
                }`}
              >
                {status} ({count})
              </button>
            )
          })}
        </motion.div>

        {/* Search Results Info */}
        {(searchTerm || statusFilter !== 'all') && (
          <motion.p 
            className="text-sm text-gray-400 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Search className="w-4 h-4" />
            {filteredOrders.length > 0 
              ? `Found ${filteredOrders.length} order${filteredOrders.length !== 1 ? 's' : ''}`
              : 'No orders match your criteria'
            }
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
          </motion.p>
        )}
      </div>

      {/* Orders List */}
      <AnimatePresence mode="wait">
        {filteredOrders.length > 0 ? (
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredOrders.map((order, index) => (
              <LiveOrderCard 
                key={order.id} 
                order={order} 
                index={index} 
              />
            ))}
          </motion.div>
        ) : (
          <EmptyState searchTerm={searchTerm} />
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      {orders.length > 0 && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-600/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-boundless-card/40 rounded-lg p-4 border border-boundless-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-boundless-accent" />
              <span className="text-sm text-gray-300">Total Rewards</span>
            </div>
            <p className="text-xl font-bold text-white">
              ${orders.reduce((sum, order) => sum + (order.reward || 0), 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-boundless-card/40 rounded-lg p-4 border border-boundless-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-boundless-neon" />
              <span className="text-sm text-gray-300">Active Orders</span>
            </div>
            <p className="text-xl font-bold text-white">
              {orders.filter(order => 
                order.status === 'processing' || 
                order.status === 'pending' || 
                order.status === 'in_progress'
              ).length}
            </p>
          </div>

          <div className="bg-boundless-card/40 rounded-lg p-4 border border-boundless-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-boundless-success" />
              <span className="text-sm text-gray-300">Completion Rate</span>
            </div>
            <p className="text-xl font-bold text-white">
              {orders.length > 0 
                ? Math.round((orders.filter(order => order.status === 'completed').length / orders.length) * 100)
                : 0
              }%
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
