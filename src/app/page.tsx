'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  Search,
  X
} from 'lucide-react'

// Обновленный интерфейс для совместимости с API
interface ProverData {
  id: string
  nickname: string  // Изменено с 'name' на 'nickname'
  earnings_usd?: number  // Добавлено для совместимости с API
  earnings?: number  // Fallback для старого формата
  hashRate?: number
  status: 'online' | 'busy' | 'offline' | 'maintenance'  // Добавлен 'maintenance'
  lastActive?: string
  last_seen?: string  // Добавлено для совместимости с API
  uptime?: number
  gpu_model?: string  // Изменено с 'gpu' на 'gpu_model'
  gpu?: string  // Fallback для старого формата
  location?: string
  reputation_score?: number
  total_orders?: number
  successful_orders?: number
}

interface OrderData {
  id: string
  reward: number
  prover?: string
  status: 'processing' | 'pending' | 'completed' | 'failed'
  createdAt: string
  priority?: 'high' | 'medium' | 'low'
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/50',
          glow: 'shadow-emerald-500/25'
        }
      case 'busy':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/50',
          glow: 'shadow-blue-500/25'
        }
      case 'offline':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/50',
          glow: 'shadow-red-500/25'
        }
      case 'maintenance':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/50',
          glow: 'shadow-yellow-500/25'
        }
      case 'processing':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/50',
          glow: 'shadow-blue-500/25'
        }
      case 'pending':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/50',
          glow: 'shadow-yellow-500/25'
        }
      case 'completed':
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/50',
          glow: 'shadow-emerald-500/25'
        }
      case 'failed':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/50',
          glow: 'shadow-red-500/25'
        }
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          border: 'border-gray-500/50',
          glow: 'shadow-gray-500/25'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <motion.span 
      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border} ${config.glow} shadow-lg backdrop-blur-sm`}
      whileHover={{ scale: 1.05 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <span className="flex items-center gap-1">
        <motion.div
          className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')}`}
          animate={{ 
            scale: status === 'processing' || status === 'busy' ? [1, 1.3, 1] : 1,
            opacity: status === 'offline' ? [1, 0.3, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {status.toUpperCase()}
      </span>
    </motion.span>
  )
}

const LoadingSpinner = () => {
  return (
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
      <span className="ml-3 text-gray-400 font-medium">Loading real-time data...</span>
    </motion.div>
  )
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient,
  delay = 0 
}: {
  title: string
  value: string
  subtitle: string
  icon: any
  gradient: string
  delay?: number
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`${gradient} rounded-2xl p-6 border border-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-8 h-8 text-white/80" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-white/60"
          />
        </div>
        
        <h3 className="text-lg font-bold text-white/90 mb-2">{title}</h3>
        <motion.p 
          className="text-3xl font-black text-white mb-1"
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {value}
        </motion.p>
        <p className="text-sm text-white/70">{subtitle}</p>
      </div>
    </motion.div>
  )
}

const ProverCard = ({ prover, index }: { prover: ProverData; index: number }) => {
  // Безопасное получение значений с fallback
  const nickname = prover?.nickname || 'Unknown Prover'
  const gpu = prover?.gpu_model || prover?.gpu || 'Unknown GPU'
  const location = prover?.location || 'Unknown Location'
  const earnings = prover?.earnings_usd || prover?.earnings || 0
  const hashRate = prover?.hashRate || 0
  const uptime = prover?.uptime || 0
  const lastActive = prover?.lastActive || prover?.last_seen || new Date().toISOString()
  const status = prover?.status || 'offline'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-gradient-to-br from-boundless-card/60 to-boundless-card/40 backdrop-blur-sm rounded-2xl p-6 border border-boundless-accent/20 hover:border-boundless-accent/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-boundless-accent/10 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-boundless-accent/5 to-boundless-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-boundless-neon/20 to-transparent rounded-bl-3xl" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-1">{nickname}</h3>
            <p className="text-xs text-gray-400">{gpu} • {location}</p>
          </div>
          <StatusBadge status={status} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Earnings:</span>
              <motion.span 
                className="font-bold text-boundless-accent"
                whileHover={{ scale: 1.1 }}
              >
                ${earnings.toFixed(2)}
              </motion.span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Hash Rate:</span>
              <span className="font-bold text-boundless-neon">{hashRate} H/s</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Uptime:</span>
              <span className="font-bold text-boundless-success">{uptime}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Status:</span>
              <motion.div
                animate={{ 
                  scale: status === 'online' ? [1, 1.1, 1] : 1 
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${
                  status === 'online' ? 'bg-emerald-400' :
                  status === 'busy' ? 'bg-blue-400' : 
                  status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'
                }`}
              />
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-600/30">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Last active: {new Date(lastActive).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

const OrderCard = ({ order, index }: { order: OrderData; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-gradient-to-br from-boundless-card/60 to-boundless-card/40 backdrop-blur-sm rounded-2xl p-6 border border-boundless-accent/20 hover:border-boundless-accent/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-boundless-accent/10 relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-boundless-accent/5 to-boundless-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-boundless-accent/20 to-transparent rounded-br-3xl" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-orbitron font-bold text-white mb-1">Order {order.id}</h3>
            {order.priority && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                order.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                order.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {order.priority.toUpperCase()} PRIORITY
              </span>
            )}
          </div>
          <StatusBadge status={order.status} />
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Reward:
            </span>
            <motion.span 
              className="font-bold text-boundless-accent text-lg"
              whileHover={{ scale: 1.1 }}
            >
              ${order.reward.toFixed(2)}
            </motion.span>
          </div>
          
          {order.prover && (
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Prover:
              </span>
              <span className="font-bold text-boundless-neon">{order.prover}</span>
            </div>
          )}
        </div>
        
        <div className="pt-3 border-t border-gray-600/30">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Created: {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const [provers, setProvers] = useState<ProverData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isDataVisible, setIsDataVisible] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    try {
      setRefreshing(true)
      
      // Fetch provers and orders in parallel
      const [proversResponse, ordersResponse] = await Promise.all([
        fetch('/api/provers'),
        fetch('/api/orders')
      ])
      
      if (proversResponse.ok && ordersResponse.ok) {
        const proversData: any = await proversResponse.json()
        const ordersData: any = await ordersResponse.json()
        
        // Handle different API response formats
        const proversArray = proversData.data || proversData
        const ordersArray = ordersData.data || ordersData
        
        // Безопасная обработка данных проверов
        const validProvers = Array.isArray(proversArray) ? proversArray.filter(prover => 
          prover && typeof prover === 'object' && prover.id
        ).map(prover => ({
          ...prover,
          // Добавляем fallback значения
          nickname: prover.nickname || prover.name || 'Unknown Prover',
          earnings: prover.earnings_usd || prover.earnings || 0,
          gpu_model: prover.gpu_model || prover.gpu || 'Unknown GPU',
          location: prover.location || 'Unknown Location',
          status: prover.status || 'offline',
          lastActive: prover.last_seen || prover.lastActive || new Date().toISOString(),
          hashRate: prover.hashRate || Math.floor(Math.random() * 1000) + 500, // Временный fallback
          uptime: prover.uptime || 95 + Math.random() * 5 // Временный fallback
        })) : []
        
        setProvers(validProvers)
        setOrders(Array.isArray(ordersArray) ? ordersArray.slice(0, 5) : [])
        setLastUpdated(new Date().toLocaleTimeString())
      } else {
        // Fallback to static data if API fails
        console.warn('API failed, using fallback data')
        setProvers([
          { id: '1', nickname: 'Prover Alpha', earnings: 1250.5, hashRate: 1250, status: 'online', lastActive: new Date().toISOString(), uptime: 98.5, gpu_model: 'RTX 4090', location: 'US-East' },
          { id: '2', nickname: 'Prover Beta', earnings: 890.25, hashRate: 890, status: 'busy', lastActive: new Date().toISOString(), uptime: 94.2, gpu_model: 'RTX 3080', location: 'EU-West' },
          { id: '3', nickname: 'Prover Gamma', earnings: 654.75, hashRate: 0, status: 'offline', lastActive: new Date().toISOString(), uptime: 87.3, gpu_model: 'RTX 3070', location: 'Asia' }
        ])
        setOrders([
          { id: '#1', reward: 125.5, prover: 'Prover Alpha', status: 'processing', createdAt: new Date().toISOString(), priority: 'high' },
          { id: '#2', reward: 89.25, status: 'pending', createdAt: new Date().toISOString(), priority: 'medium' },
          { id: '#3', reward: 234.75, prover: 'Prover Beta', status: 'completed', createdAt: new Date().toISOString(), priority: 'low' }
        ])
        setLastUpdated(new Date().toLocaleTimeString())
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
      // Use fallback static data on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Безопасная фильтрация проверов
  const activeProvers = provers.filter(p => p?.status === 'online' || p?.status === 'busy')
  
  // Безопасный поиск с проверкой на undefined
  const filteredActiveProvers = activeProvers.filter(prover => {
    if (!prover || !searchTerm) return true
    
    const searchQuery = searchTerm.toLowerCase()
    const nickname = (prover.nickname || '').toLowerCase()
    const gpu = (prover.gpu_model || prover.gpu || '').toLowerCase()
    const location = (prover.location || '').toLowerCase()
    const id = (prover.id || '').toLowerCase()
    
    return nickname.includes(searchQuery) ||
           gpu.includes(searchQuery) ||
           location.includes(searchQuery) ||
           id.includes(searchQuery)
  })

  // Calculate stats with safe fallbacks
  const totalEarnings = provers.reduce((sum, p) => sum + (p?.earnings_usd || p?.earnings || 0), 0)
  const activeProversCount = activeProvers.length
  const completedOrders = orders.filter(o => o?.status === 'completed').length
  const totalHashRate = provers.reduce((sum, p) => sum + (p?.hashRate || 0), 0)

  return (
    <div className="min-h-screen space-y-8 pb-12">
      {/* Hero Section */}
      <motion.div 
        className="text-center py-12 relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-boundless-accent/10 via-boundless-neon/5 to-boundless-accent/10 rounded-3xl -z-10" />
        
        <motion.h1 
          className="text-6xl font-orbitron font-extrabold text-white mb-4 drop-shadow-neon"
          whileHover={{ scale: 1.05 }}
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-boundless-accent to-boundless-neon bg-clip-text text-transparent">
            Boundless
          </span>
        </motion.h1>
        
        <motion.p 
          className="text-xl text-gray-300 max-w-2xl mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Monitor your provers, track earnings, and manage orders in real-time
        </motion.p>
        
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {lastUpdated && (
            <motion.p 
              className="text-sm text-gray-500 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Activity className="w-4 h-4" />
              Last updated: {lastUpdated}
            </motion.p>
          )}
          
          <motion.button
            onClick={fetchData}
            disabled={refreshing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-boundless-accent/20 text-boundless-accent border border-boundless-accent/50 rounded-lg hover:bg-boundless-accent/30 transition-colors text-sm disabled:opacity-50"
          >
            <motion.div
              animate={{ rotate: refreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </motion.button>
          
          <motion.button
            onClick={() => setIsDataVisible(!isDataVisible)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600/20 text-gray-400 border border-gray-600/50 rounded-lg hover:bg-gray-600/30 transition-colors text-sm"
          >
            {isDataVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isDataVisible ? 'Hide Data' : 'Show Data'}
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <AnimatePresence>
        {isDataVisible && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <StatCard
              title="Total Earnings"
              value={`$${totalEarnings.toFixed(2)}`}
              subtitle="💰 Real-time calculation"
              icon={DollarSign}
              gradient="bg-gradient-to-br from-boundless-accent/40 to-boundless-neon/40"
              delay={0}
            />
            
            <StatCard
              title="Active Provers"
              value={activeProversCount.toString()}
              subtitle="⚡ Online + Busy provers"
              icon={Users}
              gradient="bg-gradient-to-br from-boundless-neon/40 to-boundless-accent/40"
              delay={0.1}
            />
            
            <StatCard
              title="Orders Completed"
              value={completedOrders.toString()}
              subtitle="✅ Dynamic counting"
              icon={BarChart3}
              gradient="bg-gradient-to-br from-boundless-success/40 to-boundless-accent/40"
              delay={0.2}
            />
            
            <StatCard
              title="Total Hash Rate"
              value={`${totalHashRate.toLocaleString()} H/s`}
              subtitle="🔥 Combined power"
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-purple-500/40 to-pink-500/40"
              delay={0.3}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {isDataVisible && (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Active Provers with Search */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <motion.h2 
                  className="text-3xl font-orbitron font-bold text-white drop-shadow-neon flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <Zap className="w-8 h-8 text-boundless-accent" />
                  Active Provers ({filteredActiveProvers.length})
                </motion.h2>
              </div>

              {/* Search Bar */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search your prover by name, ID, GPU, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-boundless-accent/30 rounded-xl leading-5 bg-boundless-card/40 backdrop-blur-sm placeholder-gray-500 text-white focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-boundless-accent/50 focus:border-boundless-accent transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                  </button>
                )}
              </motion.div>

              {/* Search Results Info */}
              {searchTerm && (
                <motion.p 
                  className="text-sm text-gray-400 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Search className="w-4 h-4" />
                  {filteredActiveProvers.length > 0 
                    ? `Found ${filteredActiveProvers.length} active prover${filteredActiveProvers.length !== 1 ? 's' : ''} matching "${searchTerm}"`
                    : `No active provers found matching "${searchTerm}"`
                  }
                </motion.p>
              )}
              
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {filteredActiveProvers.length > 0 ? (
                    filteredActiveProvers.map((prover, index) => (
                      <ProverCard key={prover.id} prover={pr
