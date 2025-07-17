// src/app/page.tsx — ИСПРАВЛЕННАЯ ВЕРСИЯ С КНОПКАМИ РЯДОМ С ПОИСКОМ
'use client'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, TrendingUp, Zap, RefreshCw, Eye, EyeOff, BarChart3, Users,
  Clock, DollarSign, Search, X, ExternalLink, Copy, CheckCircle, Timer
} from 'lucide-react'

// ===== Интерфейсы =====
interface ProverData {
  id: string
  nickname?: string
  status: string
  blockchain_address?: string
  orders_taken?: number
  order_earnings_eth?: number
  order_earnings_usd?: number
  peak_mhz?: number
  success_rate?: number
  source?: string
  raw_parsed_data?: any
  extractedValues?: any
}

interface DashboardStats {
  totalEarnings: string
  activeProvers: number
  totalOrdersCompleted: number
  totalHashRate: string
}

// ===== "By OveR" Signature =====
const OverSignature = () => (
  <div className="fixed top-5 right-8 z-50 select-none pointer-events-none">
    <span className="font-orbitron text-sm font-bold uppercase bg-gradient-to-r from-[#38fff6] via-[#5e5cfc] to-[#b840f4] bg-clip-text text-transparent tracking-wider opacity-90">
      By OveR
    </span>
  </div>
)

// ===== StatusBadge =====
const StatusBadge = ({ status }: { status: string }) => {
  const isActive = status === 'online' || status === 'active' || status === 'json_parsing_success'
  const bgColor = isActive ? 'bg-emerald-500/20' : 'bg-red-500/20'
  const textColor = isActive ? 'text-emerald-400' : 'text-red-400'
  const borderColor = isActive ? 'border-emerald-500/50' : 'border-red-500/50'
  
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${bgColor} ${textColor} ${borderColor} backdrop-blur-sm`}>
      <span className="flex items-center gap-1">
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`} />
        {isActive ? 'LIVE' : 'OFFLINE'}
      </span>
    </span>
  )
}

// ===== StatCard =====
const StatCard = ({ title, value, subtitle, icon: Icon, delay = 0, isLoading = false }: {
  title: string
  value: string
  subtitle: string
  icon: any
  delay?: number
  isLoading?: boolean
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -4 }}
    className="bg-gradient-to-br from-[#151828]/80 to-[#1e2233]/80 rounded-2xl p-6 border border-[#38fff6]/20 hover:border-[#38fff6]/40 shadow-lg backdrop-blur-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <Icon className="w-8 h-8 text-[#38fff6]" />
      <div className="w-2 h-2 rounded-full bg-[#38fff6]/60" />
    </div>
    <h3 className="text-lg font-orbitron font-bold text-white/90 mb-2">{title}</h3>
    <p className="text-3xl font-black text-white mb-1">
      {isLoading ? (
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
      ) : value}
    </p>
    <p className="text-sm text-white/70">{subtitle}</p>
  </motion.div>
)

// ===== ProverCard =====
const ProverCard = ({ prover, index }: { prover: ProverData; index: number }) => {
  const [copiedAddress, setCopiedAddress] = useState('')
  
  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(''), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  // Извлекаем данные из raw_parsed_data или extractedValues
  const rawData = prover.raw_parsed_data || prover.extractedValues || prover
  const orders = rawData.orders_taken || prover.orders_taken || 0
  const ethEarnings = rawData.order_earnings_eth || prover.order_earnings_eth || 0
  const usdEarnings = rawData.order_earnings_usd || prover.order_earnings_usd || 0
  const peakMhz = rawData.peak_mhz || prover.peak_mhz || 0
  const successRate = rawData.success_rate || prover.success_rate || 0
  const source = prover.source || 'unknown'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-gradient-to-br from-[#151828]/80 to-[#1e2233]/80 rounded-2xl p-6 border border-[#38fff6]/20 hover:border-[#38fff6]/40 shadow-lg backdrop-blur-xl transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-orbitron font-bold text-white mb-1">
            {prover.nickname || 'Prover'}
          </h3>
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {source.replace('_', ' ').toUpperCase()}
          </span>
          
          {prover.blockchain_address && (
            <div className="flex items-center gap-2 mt-2">
              <code className="text-xs text-gray-500">
                {prover.blockchain_address.slice(0, 10)}...{prover.blockchain_address.slice(-4)}
              </code>
              <button
                onClick={() => copyAddress(prover.blockchain_address!)}
                className="text-gray-500 hover:text-[#38fff6] transition-colors"
              >
                {copiedAddress === prover.blockchain_address ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              <a
                href={`https://basescan.org/address/${prover.blockchain_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-[#38fff6] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
        <StatusBadge status={source} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Orders:</span>
            <span className="font-bold text-[#38fff6]">{orders}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">ETH Earned:</span>
            <span className="font-bold text-[#b840f4]">{ethEarnings.toFixed(6)}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">USD Earned:</span>
            <span className="font-bold text-white">${usdEarnings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Success Rate:</span>
            <span className="font-bold text-emerald-400">{successRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
      
      <div className="pt-3 border-t border-gray-600/30">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Peak MHz: {peakMhz.toFixed(2)}</span>
          <div className={`w-3 h-3 rounded-full ${source === 'json_parsing_success' ? 'bg-emerald-400' : 'bg-red-400'}`} />
        </div>
      </div>
    </motion.div>
  )
}

// ===== MAIN DASHBOARD =====
export default function Dashboard() {
  const [provers, setProvers] = useState<ProverData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isDataVisible, setIsDataVisible] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ProverData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '3d' | '1w'>('1d')
  
  // Автообновление состояние
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Dashboard статистика - БУДЕТ ВЫЧИСЛЯТЬСЯ ИЗ РЕАЛЬНЫХ ДАННЫХ
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEarnings: "0",
    activeProvers: 0,
    totalOrdersCompleted: 0,
    totalHashRate: "0"
  })

  // Форматирование времени
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  // Вычисление статистики из реальных данных
  const calculateStats = (proversList: ProverData[]) => {
    if (proversList.length === 0) {
      setDashboardStats({
        totalEarnings: "0",
        activeProvers: 0,
        totalOrdersCompleted: 0,
        totalHashRate: "0"
      })
      return
    }

    let totalEarnings = 0
    let activeProvers = 0
    let totalOrders = 0
    let totalHashRate = 0

    proversList.forEach(prover => {
      const rawData = prover.raw_parsed_data || prover.extractedValues || prover
      const usdEarnings = rawData.order_earnings_usd || prover.order_earnings_usd || 0
      const orders = rawData.orders_taken || prover.orders_taken || 0
      const mhz = rawData.peak_mhz || prover.peak_mhz || 0
      const source = prover.source || 'unknown'

      totalEarnings += usdEarnings
      totalOrders += orders
      totalHashRate += mhz

      if (source === 'json_parsing_success' || source === 'online' || source === 'active') {
        activeProvers++
      }
    })

    setDashboardStats({
      totalEarnings: totalEarnings.toFixed(2),
      activeProvers,
      totalOrdersCompleted: totalOrders,
      totalHashRate: totalHashRate.toFixed(0)
    })
  }

  // Загрузка основных данных
  const fetchData = async () => {
    try {
      console.log(`🚀 Fetching provers data for ${selectedTimeframe}...`)
      const response = await fetch(`/api/provers?blockchain=true&realdata=true&limit=50&timeframe=${selectedTimeframe}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 API response:', data)
        
        if (data.data && Array.isArray(data.data)) {
          setProvers(data.data)
          calculateStats(data.data) // Вычисляем статистику из реальных данных
          console.log(`✅ Loaded ${data.data.length} provers`)
        }
      } else {
        console.warn('⚠️ API failed, using fallback')
        setProvers([])
        calculateStats([])
      }
      
      setLastUpdated(formatTime(new Date()))
    } catch (error) {
      console.error('❌ Failed to fetch data:', error)
      setProvers([])
      calculateStats([])
    } finally {
      setLoading(false)
    }
  }

  // Поиск по адресу
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    console.log(`🔍 Searching for: ${searchQuery} (${selectedTimeframe})`)
    setIsSearching(true)

    try {
      const response = await fetch(`/api/provers?q=${encodeURIComponent(searchQuery)}&timeframe=${selectedTimeframe}&blockchain=true&realdata=true`)
      const result = await response.json()
      
      console.log('🔍 Search result:', result)

      if (result.success && result.data && Array.isArray(result.data)) {
        setSearchResults(result.data)
        calculateStats(result.data) // Вычисляем статистику из результатов поиска
        console.log(`✅ Found ${result.data.length} results`)
      } else {
        setSearchResults([])
        calculateStats([])
      }
    } catch (error) {
      console.error('❌ Search failed:', error)
      setSearchResults([])
      calculateStats([])
    } finally {
      setIsSearching(false)
    }
  }

  // Обновление всех данных
  const refreshData = async () => {
    if (loading) return
    
    setRefreshing(true)
    try {
      console.log('🔄 Refreshing all data...')
      
      // Очищаем кеш
      await fetch('/api/provers?action=clear-cache')
      
      // Обновляем основной список
      await fetchData()

      // Если есть поиск, обновляем результаты поиска
      if (searchTerm.trim()) {
        await performSearch(searchTerm)
      }

      console.log('✅ Data refresh completed')
    } catch (error) {
      console.error('❌ Error refreshing data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Очистка кеша
  const clearCache = async () => {
    try {
      await fetch('/api/provers?action=clear-cache')
      console.log('✅ Cache cleared')
      await refreshData()
    } catch (error) {
      console.error('❌ Failed to clear cache:', error)
    }
  }

  // Скрытие данных
  const hideData = () => {
    setIsDataVisible(!isDataVisible)
  }

  // Переключение автообновления
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled)
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm)
      } else {
        setSearchResults([])
        // Если нет поиска, показываем статистику основных данных
        if (provers.length > 0) {
          calculateStats(provers)
        }
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedTimeframe])

  // Автообновление
  useEffect(() => {
    setLastUpdated(formatTime(new Date()))
    
    const setupAutoRefresh = () => {
      if (autoRefreshEnabled) {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
        
        // Автообновление каждые 15 минут
        refreshIntervalRef.current = setInterval(() => {
          console.log('⏰ Auto-refresh triggered (15 minutes)')
          refreshData()
        }, 15 * 60 * 1000)
        
        console.log('✅ Auto-refresh enabled (every 15 minutes)')
      } else {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
          refreshIntervalRef.current = null
        }
        console.log('⏹️ Auto-refresh disabled')
      }
    }

    setupAutoRefresh()

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [autoRefreshEnabled])

  // Загрузка данных при изменении timeframe
  useEffect(() => {
    console.log(`🚀 Loading data for ${selectedTimeframe}...`)
    fetchData()
  }, [selectedTimeframe])

  // Обработка данных для отображения
  const displayProvers = searchTerm ? searchResults : provers
  const source = displayProvers.length > 0 && displayProvers[0].source ? 
    displayProvers[0].source : 'supabase_fallback'

  return (
    <>
      <OverSignature />
      <div className="min-h-screen bg-[#0a1120] pt-2 pb-12 px-4 space-y-8">
        
        {/* Hero Section */}
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1 
            className="text-6xl font-orbitron font-extrabold text-white mb-4"
            style={{ textShadow: '0 0 32px #38fff6aa' }}
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-[#38fff6] to-[#b840f4] bg-clip-text text-transparent">
              Boundless
            </span>
          </motion.h1>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Monitor provers with real-time blockchain integration on Base network
          </p>
          
          {/* Секция с кнопками управления */}
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-400">
                Last updated: <span className="text-cyan-400">{lastUpdated}</span>
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                source === 'supabase_fallback' 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {source === 'supabase_fallback' ? 'SUPABASE_FALLBACK' : 'LIVE_DATA'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Live Data
              </button>
              
              <button
                onClick={toggleAutoRefresh}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 ${
                  autoRefreshEnabled 
                    ? 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400'
                    : 'bg-gray-500/20 hover:bg-gray-500/30 border-gray-500/30 text-gray-400'
                }`}
              >
                <Timer className="w-4 h-4" />
                Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
                <span className="text-xs">(15min)</span>
              </button>
              
              <button
                onClick={clearCache}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg transition-all duration-300"
              >
                <X className="w-4 h-4" />
                Clear Cache
              </button>
              
              <button
                onClick={hideData}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 rounded-lg transition-all duration-300"
              >
                {isDataVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Hide Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview - ОБНОВЛЕННАЯ СТАТИСТИКА */}
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
                value={`$${dashboardStats.totalEarnings}`}
                subtitle={`💰 ${selectedTimeframe} period`}
                icon={DollarSign}
                delay={0}
                isLoading={loading}
              />
              
              <StatCard
                title="Active Provers"
                value={dashboardStats.activeProvers.toString()}
                subtitle="⚡ verified on-chain"
                icon={Users}
                delay={0.1}
                isLoading={loading}
              />
              
              <StatCard
                title="Orders Completed"
                value={dashboardStats.totalOrdersCompleted.toString()}
                subtitle={`✅ ${selectedTimeframe} counting`}
                icon={BarChart3}
                delay={0.2}
                isLoading={loading}
              />
              
              <StatCard
                title="Total Hash Rate"
                value={`${dashboardStats.totalHashRate} MHz`}
                subtitle="🔥 Live combined"
                icon={TrendingUp}
                delay={0.3}
                isLoading={loading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence>
          {isDataVisible && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Search Bar + Timeframe Buttons */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  {/* Search Bar */}
                  <div className="flex-1 w-full lg:w-auto">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by Ethereum address (0x...), nickname..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-10 py-3 border border-[#38fff6]/30 rounded-xl bg-[#151828]/40 backdrop-blur-sm placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#38fff6]/50 focus:border-[#38fff6] transition-all duration-200"
                      />
                      {(searchTerm || isSearching) && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                          {isSearching && (
                            <div className="w-4 h-4 border-2 border-[#38fff6] border-t-transparent rounded-full animate-spin" />
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
                    </div>
                  </div>

                  {/* Timeframe Buttons */}
                  <div className="flex items-center gap-2 p-2 rounded-xl border border-[#38fff6]/20 bg-[#151828]/40 backdrop-blur-sm">
                    <span className="text-sm text-gray-400 px-2">Period:</span>
                    
                    {(['1d', '3d', '1w'] as const).map((timeframe) => {
                      const labels = { '1d': '1 Day', '3d': '3 Days', '1w': '1 Week' }
                      const isSelected = selectedTimeframe === timeframe
                      
                      return (
                        <button
                          key={timeframe}
                          onClick={() => setSelectedTimeframe(timeframe)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#38fff6] text-black'
                              : 'text-gray-400 hover:text-white hover:bg-[#38fff6]/20'
                          }`}
                        >
                          {labels[timeframe]}
                        </button>
                      )
                    })}
                    
                    <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-600/30">
                      <span className="text-xs text-green-400">● LIVE</span>
                    </div>
                  </div>
                </div>

                {/* Search Results Info */}
                {searchTerm && (
                  <div className="mt-4 text-sm text-gray-400 text-center">
                    {searchResults.length > 0 ? (
                      <span className="text-green-400">
                        Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchTerm}" ({selectedTimeframe})
                      </span>
                    ) : isSearching ? (
                      <span>Searching for "{searchTerm}" ({selectedTimeframe})...</span>
                    ) : (
                      <span className="text-yellow-400">
                        No results found for "{searchTerm}" ({selectedTimeframe})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Provers List */}
              <div>
                <motion.h2 
                  className="text-3xl font-orbitron font-bold text-white flex items-center gap-3 mb-6 justify-center"
                  style={{ textShadow: '0 0 16px #38fff6aa' }}
                >
                  <Zap className="w-8 h-8 text-[#38fff6]" />
                  {searchTerm ? 'Search Results' : 'Live Provers'} ({displayProvers.length})
                </motion.h2>
                
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="rounded-full h-8 w-8 border-2 border-[#38fff6] border-t-transparent animate-spin" />
                    <span className="ml-3 text-gray-400">Loading real-time blockchain data...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {displayProvers.length > 0 ? (
                      displayProvers.map((prover, index) => (
                        <ProverCard key={prover.id || index} prover={prover} index={index} />
                      ))
                    ) : searchTerm ? (
                      <div className="col-span-full text-center py-12 text-gray-400">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg mb-2">No provers found for "{searchTerm}" ({selectedTimeframe})</p>
                        <p className="text-sm">Try entering a valid Ethereum address (0x...)</p>
                      </div>
                    ) : (
                      <div className="col-span-full text-center py-12 text-gray-400">
                        <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No provers available</p>
                        <p className="text-sm mt-2">Enter a prover address in the search box for instant lookup</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div 
          className="text-center py-8 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p className="text-sm mb-2">
            💡 <strong>Live Blockchain Integration:</strong> Enter Ethereum addresses (0x...) for real-time Base network data
          </p>
          <p className="text-xs text-green-400 mt-2">
            ✅ Data source: {source.replace('_', ' ').toUpperCase()} • Period: {selectedTimeframe === '1d' ? '1 Day' : selectedTimeframe === '3d' ? '3 Days' : '1 Week'}
            • Auto-refresh: {autoRefreshEnabled ? 'ON (15min)' : 'OFF'}
          </p>
        </motion.div>
      </div>
    </>
  )
}
