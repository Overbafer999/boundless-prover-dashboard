// src/app/page.tsx — ПОЛНАЯ ВЕРСИЯ С УЛУЧШЕННЫМ ДИЗАЙНОМ BY OveR | Sci-Fi Neon Glassmorphism Dashboard 2025
'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, TrendingUp, Zap, RefreshCw, Eye, EyeOff, BarChart3, Users,
  Clock, DollarSign, Search, X, ExternalLink, Copy, CheckCircle, Shield
} from 'lucide-react'

// ===== Интерфейсы =====
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

interface DashboardStats {
  totalEarnings: string
  activeProvers: number
  verifiedOnChain: number
  totalOrdersCompleted: number
  totalHashRate: number
  avgProofTime?: number
  successRate?: number
  timeframe?: string
  period?: string
  dataSource?: string
  blockRange?: number
}

const debugDashboardAPI = async () => {
  console.log('🔍 === API DEBUGGING START ===')
  
  const endpoints = [
    '/api/provers?dashboard=true&timeframe=1d',
    '/api/provers?timeframe=1d&dashboard=true', 
    '/api/boundless-proxy'
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testing: ${endpoint}`)
      const response = await fetch(endpoint)
      console.log(`📡 Status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`📊 Response structure:`, {
          hasSuccess: 'success' in data,
          hasData: 'data' in data,
          keys: Object.keys(data),
          sample: data
        })
      } else {
        const errorText = await response.text()
        console.log(`❌ Error: ${errorText}`)
      }
    } catch (error) {
      console.log(`🚫 Failed: ${error}`)
    }
  }
  
  console.log('🔍 === API DEBUGGING END ===')
}

// ===== "By OveR" Signature =====
const OverSignature = () => (
  <div className="fixed top-5 right-8 z-50 select-none pointer-events-none">
    <span
      className="font-orbitron text-xs md:text-sm font-bold uppercase bg-gradient-to-r from-[#38fff6] via-[#5e5cfc] to-[#b840f4] bg-clip-text text-transparent drop-shadow-[0_0_12px_#38fff6bb] tracking-wider opacity-90"
      style={{
        textShadow: '0 0 8px #38fff6cc, 0 0 24px #b840f488'
      }}
    >
      By OveR
    </span>
  </div>
)

// ===== StatusBadge =====
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/25' }
      case 'busy': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-blue-500/25' }
      case 'offline': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50', glow: 'shadow-red-500/25' }
      case 'maintenance': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/25' }
      case 'processing': return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-blue-500/25' }
      case 'pending': return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', glow: 'shadow-yellow-500/25' }
      case 'completed': return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/50', glow: 'shadow-emerald-500/25' }
      case 'failed': return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50', glow: 'shadow-red-500/25' }
      default: return { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/50', glow: 'shadow-gray-500/25' }
    }
  }
  const config = getStatusConfig()
  return (
    <motion.span
      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border} ${config.glow} shadow-lg backdrop-blur-sm`}
      whileHover={{ scale: 1.07 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ boxShadow: '0 0 10px 1px #38fff6bb, 0 0 2px 0px #b840f455' }}
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

// ===== LoadingSpinner =====
const LoadingSpinner = () => (
  <motion.div className="flex items-center justify-center p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="rounded-full h-8 w-8 border-2 border-[#38fff6] border-t-transparent shadow-[0_0_16px_2px_#38fff6bb]"
    />
    <span className="ml-3 text-gray-400 font-medium">Loading real-time blockchain data...</span>
  </motion.div>
)

// ===== StatCard =====
const StatCard = ({
  title, value, subtitle, icon: Icon, gradient, delay = 0, isLoading = false
}: {
  title: string
  value: string
  subtitle: string
  icon: any
  gradient: string
  delay?: number
  isLoading?: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.55 }}
    whileHover={{ scale: 1.028, y: -8 }}
    className={`
      ${gradient}
      rounded-2xl p-6 border border-white/15
      shadow-[0_2px_24px_0px_#38fff6aa,0_0px_64px_8px_#b840f444]
      backdrop-blur-xl
      relative overflow-hidden group
      after:content-[''] after:absolute after:inset-0 after:rounded-2xl
      after:border after:border-[#38fff6]/30 after:pointer-events-none
      after:opacity-0 group-hover:after:opacity-100
      transition-all duration-300
    `}
    style={{ background: 'linear-gradient(135deg, rgba(56,255,246,0.08) 0%, rgba(90,60,255,0.13) 100%)' }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
          <Icon className="w-8 h-8 text-white/80 drop-shadow-[0_2px_12px_#38fff6bb]" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 2.7, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-white/60"
        />
      </div>
      <h3 className="text-lg font-orbitron font-bold text-white/90 mb-2">{title}</h3>
      <motion.p
        className="text-3xl font-black text-white mb-1"
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-white border-t-transparent rounded-full inline-block"
          />
        ) : value}
      </motion.p>
      <p className="text-sm text-white/70">{subtitle}</p>
    </div>
  </motion.div>
)

// ===== ProverCard с улучшенным дизайном =====
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
      transition={{ delay: index * 0.09, duration: 0.54 }}
      whileHover={{ scale: 1.045, y: -9 }}
      className={`
        bg-gradient-to-br from-[#151828d0] via-[#1e2233cf] to-[#191e2ebf]
        rounded-2xl p-6 border border-[#38fff6]/20 hover:border-[#38fff6]/80
        shadow-[0_2px_32px_2px_rgba(56,255,246,0.10)]
        hover:shadow-[0_0_32px_8px_rgba(56,255,246,0.23),0_8px_48px_12px_rgba(84,67,255,0.08)]
        backdrop-blur-2xl
        transition-all duration-300 relative overflow-hidden group
        after:content-[''] after:absolute after:inset-0 after:rounded-2xl
        after:pointer-events-none after:border after:border-[#38fff6]/30 after:opacity-0
        group-hover:after:opacity-100
      `}
      style={{ background: 'linear-gradient(135deg, rgba(56,255,246,0.10) 0%, rgba(184,64,244,0.10) 100%)' }}
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
                  `${earnings.toFixed(2)}`
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

// ===== OrderCard с улучшенным дизайном =====
const OrderCard = ({ order, index }: { order: OrderData; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.09, duration: 0.54 }}
    whileHover={{ scale: 1.03, y: -7 }}
    className={`
      bg-gradient-to-br from-[#21223bb6] to-[#3b225ab8]
      rounded-2xl p-6 border border-[#38fff6]/15 hover:border-[#38fff6]/80
      shadow-[0_2px_32px_2px_rgba(56,255,246,0.07)]
      hover:shadow-[0_0_32px_8px_rgba(56,255,246,0.16),0_8px_48px_12px_rgba(184,64,244,0.11)]
      backdrop-blur-xl
      transition-all duration-300 relative overflow-hidden group
      after:content-[''] after:absolute after:inset-0 after:rounded-2xl
      after:pointer-events-none after:border after:border-[#38fff6]/20 after:opacity-0
      group-hover:after:opacity-100
    `}
    style={{ background: 'linear-gradient(135deg, rgba(56,255,246,0.07) 0%, rgba(184,64,244,0.08) 100%)' }}
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

// ===== MAIN DASHBOARD =====
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
  
  // Временные диапазоны с правильными типами
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '3d' | '1w'>('1d')
  const [proverTimeframe, setProverTimeframe] = useState<'1d' | '3d' | '1w'>('1d')
  
  // состояние для dashboard статистики
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEarnings: "0.00",
    activeProvers: 0,
    verifiedOnChain: 0,
    totalOrdersCompleted: 0,
    totalHashRate: 0
  })
  const [statsLoading, setStatsLoading] = useState(false)

  // загрузка dashboard статистики С ПРАВИЛЬНЫМ API
  const loadDashboardStats = async (timeframe = selectedTimeframe) => {
    try {
      setStatsLoading(true)
      console.log(`📊 Loading dashboard stats for timeframe: ${timeframe}`)
      
      const cacheBuster = Date.now()
      const response = await fetch(`/api/provers?timeframe=${timeframe}&dashboard=true&cache=false&_=${cacheBuster}`)
      
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('📈 Dashboard API response:', result)
      
      if (result && result.success === true && result.data) {
        const stats = result.data
        
        const freshStats = {
          totalEarnings: String(stats.totalEarnings || "0.00"),
          activeProvers: Number(stats.activeProvers) || 0,
          verifiedOnChain: Number(stats.verifiedOnChain) || 0,
          totalOrdersCompleted: Number(stats.totalOrdersCompleted) || 0,
          totalHashRate: Number(stats.totalHashRate) || 0,
          avgProofTime: Number(stats.avgProofTime) || 45,
          successRate: Number(stats.successRate) || 99.2,
          timeframe: stats.timeframe || timeframe,
          period: stats.period,
          dataSource: stats.dataSource || result.source,
          blockRange: stats.blockRange
        }
        
        console.log(`🔥 Setting dashboard stats for ${timeframe}:`, freshStats)
        setDashboardStats(freshStats)
        console.log('✅ Dashboard stats updated from API!')
        
      } else {
        console.warn('⚠️ API response invalid, will retry...')
        throw new Error('Invalid API response format')
      }
      
    } catch (err: unknown) {
      const error = err as Error
      console.error('❌ Failed to load dashboard stats:', error)
      
      // Fallback с учетом timeframe
      const multiplier = timeframe === '1w' ? 3 : timeframe === '3d' ? 2 : 1;
      setDashboardStats({
        totalEarnings: (28175.00 * multiplier).toFixed(2),
        activeProvers: Math.floor(45 * Math.min(multiplier, 1.5)),
        verifiedOnChain: Math.floor(38 * Math.min(multiplier, 1.5)),
        totalOrdersCompleted: 1700 * multiplier,
        totalHashRate: Math.floor(12000 * Math.min(multiplier, 1.2)),
        timeframe,
        period: timeframe === '1w' ? '1 Week' : timeframe === '3d' ? '3 Days' : '1 Day',
        dataSource: 'fallback'
      })
      
    } finally {
      setStatsLoading(false)
    }
  }

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
      console.error('❌ Failed to fetch live data:', error instanceof Error ? error.message : 'Unknown error')
      // Используем минимальный fallback при полном отказе API
      setProvers([])
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ОБНОВЛЕННАЯ функция поиска с proverTimeframe
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    console.log(`🔍 Performing blockchain search for: ${searchQuery} (timeframe: ${proverTimeframe})`)
    setIsSearching(true)

    try {
      const params = new URLSearchParams()
      params.append('q', searchQuery)
      params.append('blockchain', 'true')
      params.append('realdata', 'true')
      params.append('timeframe', proverTimeframe) // Используем proverTimeframe
      params.append('limit', '10')

      const response = await fetch(`/api/provers?${params}`)
      const result = await response.json()
      
      console.log(`🔍 Live search result for ${proverTimeframe}:`, result)

      if (result.success || result.data) {
        const foundProvers = Array.isArray(result.data) ? result.data : []
        setSearchResults(foundProvers)
        console.log(`✅ Found ${foundProvers.length} live provers via blockchain for ${proverTimeframe}`)
      }
    } catch (error) {
      console.error('❌ Live search failed:', error instanceof Error ? error.message : 'Unknown search error')
    } finally {
      setIsSearching(false)
    }
  }

  // ОБНОВЛЕННЫЙ useEffect с зависимостью от proverTimeframe
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, proverTimeframe])

  // ГЛАВНЫЙ USEEFFECT С ПОДДЕРЖКОЙ TIMEFRAME
  useEffect(() => {
    console.log(`🚀 INITIALIZING with LIVE blockchain data for ${selectedTimeframe}...`)
    debugDashboardAPI()
    const loadFreshData = async () => {
      const timestamp = Date.now()
      console.log('⏰ Loading with timestamp:', timestamp)
      
      await Promise.all([
        fetchData(),
        loadDashboardStats(selectedTimeframe)
      ])
    }
    
    loadFreshData().then(() => {
      console.log('✅ Initial fresh data load complete!')
    })
    
    // Автообновление каждые 30 секунд
    const interval = setInterval(() => {
      console.log(`🔄 Auto-refreshing live blockchain data every 30 seconds for ${selectedTimeframe}...`)
      loadDashboardStats(selectedTimeframe) // Обновляем только stats, не всех проверов
    }, 30000)
    
    return () => clearInterval(interval)
  }, [selectedTimeframe])

  // Combine regular provers with search results
  const displayProvers = searchTerm ? searchResults : provers
  const activeProvers = displayProvers.filter(p => p?.status === 'online' || p?.status === 'busy' || p?.is_active_onchain)
  
  // ИСПОЛЬЗУЕМ LIVE СТАТИСТИКУ ИЗ ОБНОВЛЕННОГО API
  const totalEarnings = parseFloat(dashboardStats.totalEarnings)
  const activeProversCount = dashboardStats.activeProvers || activeProvers.length
  const completedOrders = dashboardStats.totalOrdersCompleted || orders.filter(o => o?.status === 'completed').length
  const totalHashRate = dashboardStats.totalHashRate || provers.reduce((sum, p) => sum + (p?.hashRate || 0), 0)
  const blockchainVerifiedCount = dashboardStats.verifiedOnChain || provers.filter(p => p?.blockchain_verified).length

  // Функция обновления всех live данных
  const refreshAllData = async () => {
    console.log(`🔄 Manual refresh of all live data for ${selectedTimeframe}...`)
    setRefreshing(true)
    await Promise.all([
      fetchData(),
      loadDashboardStats(selectedTimeframe)
    ])
    setRefreshing(false)
    console.log('✅ Manual refresh complete!')
  }

  // Функция очистки кеша
  const clearCache = async () => {
    try {
      const response = await fetch('/api/provers', { method: 'DELETE' })
      if (response.ok) {
        console.log('✅ Cache cleared successfully')
        await refreshAllData()
      }
    } catch (error) {
      console.error('❌ Failed to clear cache:', error)
    }
  }

  return (
    <>
      <OverSignature />
      <div className="min-h-screen bg-[#0a1120] pt-2 pb-12 px-4 space-y-8 overflow-x-hidden">
        
        {/* Hero Section */}
        <motion.div 
          className="text-center py-12 relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div 
            className="absolute inset-0 rounded-3xl -z-10 border border-[#38fff6]/10"
            style={{ 
              background: 'linear-gradient(135deg, rgba(56,255,246,0.05) 0%, rgba(184,64,244,0.08) 100%)',
              boxShadow: '0 0 64px 16px rgba(56,255,246,0.04)'
            }}
          />
          
          <motion.h1 
            className="text-6xl font-orbitron font-extrabold text-white mb-4"
            whileHover={{ scale: 1.05 }}
            style={{ 
              textShadow: '0 0 32px #38fff6aa, 0 0 64px #b840f455',
              filter: 'drop-shadow(0 0 12px #38fff6bb)'
            }}
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-[#38fff6] to-[#b840f4] bg-clip-text text-transparent">
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
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                  {dashboardStats.dataSource?.toUpperCase() || 'LIVE BLOCKCHAIN'}
                </span>
              </motion.p>
            )}
            
            <motion.button
              onClick={refreshAllData}
              disabled={refreshing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-[#38fff6]/20 text-[#38fff6] border border-[#38fff6]/50 rounded-lg hover:bg-[#38fff6]/30 transition-colors text-sm disabled:opacity-50 shadow-[0_0_16px_2px_#38fff6aa]"
            >
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
              {refreshing ? 'Refreshing Live Data...' : 'Refresh Live Data'}
            </motion.button>

            <motion.button
              onClick={clearCache}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Clear Cache
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

        {/* Timeframe Selection */}
        <motion.div 
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div 
            className="flex items-center gap-2 p-2 rounded-xl border border-[#38fff6]/20"
            style={{ 
              background: 'linear-gradient(135deg, rgba(56,255,246,0.05) 0%, rgba(184,64,244,0.08) 100%)',
              backdropFilter: 'blur(16px)'
            }}
          >
            <span className="text-sm text-gray-400 px-3">Time period:</span>
            
            {(['1d', '3d', '1w'] as const).map((timeframe) => {
              const labels = { '1d': '1 Day', '3d': '3 Days', '1w': '1 Week' };
              const isSelected = selectedTimeframe === timeframe;
              
              return (
                <motion.button
                  key={timeframe}
                  onClick={() => {
                    console.log(`📅 Switching to ${timeframe} timeframe`);
                    setSelectedTimeframe(timeframe);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#38fff6] text-black shadow-[0_0_16px_4px_#38fff6aa]'
                      : 'text-gray-400 hover:text-white hover:bg-[#38fff6]/20'
                  }`}
                >
                  {labels[timeframe]}
                </motion.button>
              );
            })}
            
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-600/30">
              <span className="text-xs text-green-400">● LIVE</span>
              {statsLoading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 border border-[#38fff6] border-t-transparent rounded-full"
                />
              )}
              {dashboardStats.period && (
                <span className="text-xs text-gray-500">({dashboardStats.period})</span>
              )}
              {dashboardStats.blockRange && (
                <span className="text-xs text-blue-400">
                  {dashboardStats.blockRange.toLocaleString()} blocks
                </span>
              )}
            </div>
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
                value={`${totalEarnings.toLocaleString()}`}
                subtitle={`💰 ${dashboardStats.period || selectedTimeframe} • ${dashboardStats.dataSource || 'live'}`}
                icon={DollarSign}
                gradient="bg-gradient-to-br from-[#38fff6]/20 to-[#b840f4]/20"
                delay={0}
                isLoading={statsLoading}
              />
              
              <StatCard
                title="Active Provers"
                value={activeProversCount.toString()}
                subtitle={`⚡ ${blockchainVerifiedCount} verified on-chain`}
                icon={Users}
                gradient="bg-gradient-to-br from-[#b840f4]/20 to-[#38fff6]/20"
                delay={0.1}
                isLoading={statsLoading}
              />
              
              <StatCard
                title="Orders Completed"
                value={completedOrders.toLocaleString()}
                subtitle={`✅ ${dashboardStats.period || selectedTimeframe} counting`}
                icon={BarChart3}
                gradient="bg-gradient-to-br from-emerald-500/20 to-[#38fff6]/20"
                delay={0.2}
                isLoading={statsLoading}
              />
              
              <StatCard
                title="Total Hash Rate"
                value={`${totalHashRate.toLocaleString()} H/s`}
                subtitle={`🔥 Live combined • ${dashboardStats.avgProofTime || 45}s avg`}
                icon={TrendingUp}
                gradient="bg-gradient-to-br from-purple-500/20 to-pink-500/20"
                delay={0.3}
                isLoading={statsLoading}
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
              {/* Live Active Provers with Search */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <motion.h2 
                    className="text-3xl font-orbitron font-bold text-white flex items-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    style={{ textShadow: '0 0 16px #38fff6aa' }}
                  >
                    <Zap className="w-8 h-8 text-[#38fff6]" />
                    Live Provers ({activeProvers.length})
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                      {dashboardStats.dataSource?.toUpperCase() || 'BLOCKCHAIN'}
                    </span>
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
                    placeholder="Search blockchain: Enter Ethereum address (0x...), nickname, GPU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-[#38fff6]/30 rounded-xl leading-5 bg-[#151828]/40 backdrop-blur-sm placeholder-gray-500 text-white focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-[#38fff6]/50 focus:border-[#38fff6] transition-all duration-200"
                    style={{ boxShadow: '0 0 16px 2px rgba(56,255,246,0.1)' }}
                  />
                  {(searchTerm || isSearching) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                      {isSearching && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-[#38fff6] border-t-transparent rounded-full"
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

                {/* Prover Analysis Timeframe */}
                <div 
                  className="flex items-center gap-2 p-2 rounded-lg border border-[#38fff6]/10"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(56,255,246,0.03) 0%, rgba(184,64,244,0.05) 100%)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <span className="text-sm text-gray-400 px-2">Analyze prover for:</span>
                  
                  {(['1d', '3d', '1w'] as const).map((timeframe) => {
                    const labels = { '1d': '1 Day', '3d': '3 Days', '1w': '7 Days' };
                    const isSelected = proverTimeframe === timeframe;
                    
                    return (
                      <motion.button
                        key={timeframe}
                        onClick={() => setProverTimeframe(timeframe)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isSelected
                            ? 'bg-[#38fff6] text-black shadow-[0_0_8px_2px_#38fff6aa]'
                            : 'text-gray-400 hover:text-white hover:bg-[#38fff6]/20'
                        }`}
                      >
                        {labels[timeframe]}
                      </motion.button>
                    );
                  })}
                </div>

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
                        Found {searchResults.length} live result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}" ({proverTimeframe})
                        {searchResults.some(p => p.source === 'direct_address_lookup') && (
                          <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                            LIVE BLOCKCHAIN DATA
                          </span>
                        )}
                      </span>
                    ) : isSearching ? (
                      <span>Searching live blockchain for "{searchTerm}" ({proverTimeframe})...</span>
                    ) : (
                      <span className="text-yellow-400">
                        No live results found for "{searchTerm}" ({proverTimeframe}). Try entering a valid Ethereum address (0x...)
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
                        <p className="text-lg mb-2">No live provers found for "{searchTerm}" ({proverTimeframe})</p>
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
                        <p className="text-lg">Loading live blockchain provers...</p>
                        <p className="text-sm mt-2">Enter a prover address in the search box for instant lookup</p>
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
                  className="text-3xl font-orbitron font-bold text-white flex items-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  style={{ textShadow: '0 0 16px #b840f4aa' }}
                >
                  <BarChart3 className="w-8 h-8 text-[#b840f4]" />
                  Recent Orders
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                    LIVE
                  </span>
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
          <p className="text-sm mb-2">
            💡 <strong>Live Blockchain Integration:</strong> Select time periods above and enter Ethereum addresses (0x...) for real-time Base network data
          </p>
          {statsLoading && (
            <p className="text-xs text-blue-400">
              🔄 Updating live dashboard statistics from {dashboardStats.dataSource || 'blockchain'} for {dashboardStats.period || selectedTimeframe}...
            </p>
          )}
          <p className="text-xs text-green-400 mt-2">
            ✅ Data source: {dashboardStats.dataSource || 'boundless-api'} • Period: {dashboardStats.period || selectedTimeframe}
            {dashboardStats.successRate && (
              <span className="ml-2">• Success rate: {dashboardStats.successRate.toFixed(1)}%</span>
            )}
          </p>
          <p className="text-xs text-purple-400 mt-1">
            🔍 Search timeframe: {proverTimeframe === '1d' ? '1 Day' : proverTimeframe === '3d' ? '3 Days' : '1 Week'} 
            • Dashboard timeframe: {selectedTimeframe === '1d' ? '1 Day' : selectedTimeframe === '3d' ? '3 Days' : '1 Week'}
          </p>
        </motion.div>
      </div>
    </>
  )
}
