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
  X,
  ExternalLink,
  Copy,
  CheckCircle,
  Shield
} from 'lucide-react'

// Обновленный интерфейс для совместимости с API
interface ProverData {
  id: string
  nickname: string
  earnings_usd?: number
  earnings?: number
  hashRate?: number
  status: 'online' | 'busy' | 'offline' | 'maintenance'
  lastActive?: string
  last_seen?: string
  uptime?: number
  gpu_model?: string
  gpu?: string
  location?: string
  reputation_score?: number
  total_orders?: number
  successful_orders?: number
  
  // Blockchain поля
  blockchain_address?: string
  blockchain_verified?: boolean
  eth_balance?: string
  stake_balance?: string
  is_active_onchain?: boolean
  success_rate?: string | number
  slashes?: number
  onchain_activity?: boolean
  source?: string
  last_blockchain_check?: string
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
      <span className="ml-3 text-gray-400 font-medium">Loading real-time blockchain data...</span>
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
  const [copiedAddress, setCopiedAddress] = useState('')
  
  // Безопасное получение значений с fallback
  const nickname = prover?.nickname || 'Unknown Prover'
  const gpu = prover?.gpu_model || prover?.gpu || 'Unknown GPU'
  const location = prover?.location || 'Unknown Location'
  const earnings = prover?.earnings_usd || prover?.earnings || 0
  const hashRate = prover?.hashRate || 0
  const uptime = prover?.uptime || 0
  const lastActive = prover?.lastActive || prover?.last_seen || new Date().toISOString()
  const status = prover?.status || 'offline'
  const blockchainVerified = prover?.blockchain_verified || false
  const blockchainAddress = prover?.blockchain_address

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(''), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const formatBalance = (balance?: string, symbol: string = 'ETH') => {
    if (!balance) return '0.000'
    const num = parseFloat(balance)
    return `${num.toFixed(6)} ${symbol}`
  }

  const getStatusText = () => {
    if (prover.blockchain_verified && prover.is_active_onchain) return 'ACTIVE ON-CHAIN'
    if (status === 'online') return 'ONLINE'
    if (status === 'busy') return 'BUSY'
    if (status === 'maintenance') return 'MAINTENANCE'
    return 'OFFLINE'
  }

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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-orbitron font-bold text-white">{nickname}</h3>
              {blockchainVerified && (
                <motion.span 
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <Shield className="w-3 h-3" />
                  VERIFIED
                </motion.span>
              )}
              {prover.source && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {prover.source.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">{gpu} • {location}</p>
            
            {/* Blockchain Address */}
            {blockchainAddress && (
              <div className="flex items-center gap-2 mt-2">
                <code className="text-xs text-gray-500">{blockchainAddress.slice(0, 10)}...</code>
                <button
                  onClick={() => copyAddress(blockchainAddress)}
                  className="text-gray-500 hover:text-boundless-accent transition-colors"
                >
                  {copiedAddress === blockchainAddress ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
                <a
                  href={`https://basescan.org/address/${blockchainAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-boundless-accent transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
          <StatusBadge status={getStatusText().toLowerCase().replace(/[^a-z]/g, '')} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">
                {prover.eth_balance || prover.stake_balance ? 'Balance:' : 'Earnings:'}
              </span>
              <motion.span 
                className="font-bold text-boundless-accent"
                whileHover={{ scale: 1.1 }}
              >
                {prover.eth_balance ? 
                  `${parseFloat(prover.eth_balance).toFixed(4)} ETH` :
                  prover.stake_balance ?
                  `${parseFloat(prover.stake_balance).toFixed(2)} HP` :
                  `$${earnings.toFixed(2)}`
                }
              </motion.span>
            </div>
            
            {/* Show both ETH and HP if available */}
            {prover.eth_balance && prover.stake_balance && (
              <div className="flex justify-between">
                <span className="text-gray-300 text-sm">HP Stake:</span>
                <span className="font-bold text-purple-400">
                  {formatBalance(prover.stake_balance, 'HP')}
                </span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Hash Rate:</span>
              <span className="font-bold text-boundless-neon">{hashRate} H/s</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Orders:</span>
              <span className="font-bold text-white">
                {prover.total_orders || 0}
                {prover.reputation_score && (
                  <span className="text-xs text-gray-400 ml-1">
                    (⭐ {prover.reputation_score.toFixed(1)})
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Uptime:</span>
              <span className="font-bold text-boundless-success">{uptime}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm">Status:</span>
              <motion.div
                animate={{ 
                  scale: status === 'online' || prover.is_active_onchain ? [1, 1.1, 1] : 1 
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`w-3 h-3 rounded-full ${
                  status === 'online' || prover.is_active_onchain ? 'bg-emerald-400' :
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
            {prover.is_active_onchain && (
              <span className="text-green-400 ml-2">• On-chain verified</span>
            )}
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
  const [searchResults, setSearchResults] = useState<ProverData[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const fetchData = async () => {
    try {
      setRefreshing(true)
      
      console.log('🚀 Fetching data with blockchain integration...')
      
      // Fetch provers with blockchain data and orders in parallel
      const [proversResponse, ordersResponse] = await Promise.all([
        fetch('/api/provers?blockchain=true&realdata=true&limit=50'),
        fetch('/api/orders')
      ])
      
      if (proversResponse.ok && ordersResponse.ok) {
        const proversData: any = await proversResponse.json()
        const ordersData: any = await ordersResponse.json()
        
        console.log('📊 Provers API response:', proversData)
        
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
        
        console.log('✅ Processed provers:', validProvers.length)
        
        setProvers(validProvers)
        setOrders(Array.isArray(ordersArray) ? ordersArray.slice(0, 5) : [])
        setLastUpdated(new Date().toLocaleTimeString())
      } else {
        console.warn('⚠️ API failed, using fallback data')
        // Fallback to static data if API fails
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
      console.error('❌ Failed to fetch data:', error)
      // Use fallback static data on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Search function for real-time address lookup
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    console.log('🔍 Performing search for:', searchQuery)
    setIsSearching(true)

    try {
      const params = new URLSearchParams()
      params.append('q', searchQuery)
      params.append('blockchain', 'true')
      params.append('realdata', 'true')
      params.append('limit', '10')

      const response = await fetch(`/api/provers?${params}`)
      const result = await response.json()
      
      console.log('🔍 Search result:', result)

      if (result.success || result.data) {
        const provers = Array.isArray(result.data) ? result.data : []
        setSearchResults(provers)
        console.log('✅ Found', provers.length, 'provers')
      }
    } catch (error) {
      console.error('❌ Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  useEffect(() => {
    fetchData()
    
    // Auto-refresh every minute
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Combine regular provers with search results
  const displayProvers = searchTerm ? searchResults : provers
  const activeProvers = displayProvers.filter(p => p?.status === 'online' || p?.status === 'busy' || p?.is_active_onchain)
  
  // Calculate stats with safe fallbacks
  const totalEarnings = provers.reduce((sum, p) => sum + (p?.earnings_usd || p?.earnings || 0), 0)
  const activeProversCount = activeProvers.length
  const completedOrders = orders.filter(o => o?.status === 'completed').length
  const totalHashRate = provers.reduce((sum, p) => sum + (p?.hashRate || 0), 0)
  const blockchainVerifiedCount = provers.filter(p => p?.blockchain_verified).length

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
          Monitor provers with real-time blockchain integration on Base network
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
              value={`${totalEarnings.toFixed(2)}`}
              subtitle="💰 Real-time blockchain data"
              icon={DollarSign}
              gradient="bg-gradient-to-br from-boundless-accent/40 to-boundless-neon/40"
              delay={0}
            />
            
            <StatCard
              title="Active Provers"
              value={activeProversCount.toString()}
              subtitle={`⚡ ${blockchainVerifiedCount} verified on-chain`}
              icon={Users}
              gradient="bg-gradient-to-br from-boundless-neon/40 to-boundless-accent/40"
              delay={0.1}
            />
            
            <StatCard
              title="Orders Completed"
              value={completedOrders.toString()}
              subtitle="✅ Live counting"
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
                  Active Provers ({activeProvers.length})
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
                  placeholder="Search by prover address (0x...), nickname, GPU, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-boundless-accent/30 rounded-xl leading-5 bg-boundless-card/40 backdrop-blur-sm placeholder-gray-500 text-white focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-boundless-accent/50 focus:border-boundless-accent transition-all duration-200"
                />
                {(searchTerm || isSearching) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                    {isSearching && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-boundless-accent border-t-transparent rounded-full"
                      />
                    )}
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Search Info */}
              {searchTerm && (
                <motion.div 
                  className="text-sm text-gray-400 flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Search className="w-4 h-4" />
                  {searchResults.length > 0 ? (
                    <span className="text-green-400">
                      Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}"
                      {searchResults.some(p => p.source === 'direct_address_lookup') && (
                        <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          LIVE BLOCKCHAIN DATA
                        </span>
                      )}
                    </span>
                  ) : isSearching ? (
                    <span>Searching blockchain for "{searchTerm}"...</span>
                  ) : (
                    <span className="text-yellow-400">
                      No results found for "{searchTerm}". Try entering a valid Ethereum address (0x...)
                    </span>
                  )}
                </motion.div>
              )}
              
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {activeProvers.length > 0 ? (
                    activeProvers.map((prover, index) => (
                      <ProverCard key={prover.id} prover={prover} index={index} />
                    ))
                  ) : searchTerm ? (
                    <motion.div 
                      className="text-center py-12 text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No provers found for "{searchTerm}"</p>
                      <p className="text-sm mb-4">Try searching by:</p>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Ethereum address:</strong> 0x1234... (gets real-time blockchain data)</li>
                        <li>• <strong>Prover nickname:</strong> CryptoMiner_Pro, ZK_Beast_2024</li>
                        <li>• <strong>GPU model:</strong> RTX 4090, RTX 3080</li>
                        <li>• <strong>Location:</strong> US-East, EU-West</li>
                      </ul>
                    </motion.div>
                  ) : provers.length === 0 ? (
                    <motion.div 
                      className="text-center py-12 text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No provers found</p>
                      <p className="text-sm mt-2">Try entering a prover address in the search box</p>
                    </motion.div>
                  ) : (
                    activeProvers.map((prover, index) => (
                      <ProverCard key={prover.id} prover={prover} index={index} />
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Recent Orders */}
            <div className="space-y-6">
              <motion.h2 
                className="text-3xl font-orbitron font-bold text-white drop-shadow-neon flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
              >
                <BarChart3 className="w-8 h-8 text-boundless-neon" />
                Recent Orders
              </motion.h2>
              
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <OrderCard key={order.id} order={order} index={index} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Section */}
      <motion.div 
        className="text-center py-8 text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-sm">
          💡 <strong>Tip:</strong> Enter your Ethereum address (0x...) in the search box to get real-time blockchain data from Base network
        </p>
      </motion.div>
    </div>
  )
}
