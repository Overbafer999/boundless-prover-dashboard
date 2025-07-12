'use client'

import React, { useState, useEffect } from 'react'
import { Search, Loader2, ExternalLink, Copy, CheckCircle, Shield, Activity, Zap } from 'lucide-react'

interface ProverData {
  id?: string
  nickname?: string
  name?: string
  gpu_model?: string
  gpu?: string
  location?: string
  blockchain_address?: string
  ethBalance?: string
  stakeBalance?: string
  eth_balance?: string
  stake_balance?: string
  stakeTokenAddress?: string
  completedOrders?: number
  total_orders?: number
  successful_orders?: number
  totalLockedOrders?: number
  slashedOrders?: number
  slashes?: number
  successRate?: string
  success_rate?: string | number
  reputation_score?: number
  status?: string
  isActive?: boolean
  is_active_onchain?: boolean
  blockchain_verified?: boolean
  lastUpdated?: string
  last_seen?: string
  lastActive?: string
  earnings_usd?: number
  earnings?: number
  uptime?: number
  hashRate?: number
  source?: string
  onchain_activity?: boolean
  last_blockchain_check?: string
  last_active?: string
  proofCapability?: {
    hasProofCapability: boolean | null
    recentVerifications: number
    lastVerificationBlock: bigint | null
  }
  recentActivity?: Array<{
    requestId: string
    type: string
    blockNumber: bigint
    transactionHash: string
    fulfillmentData?: any
  }>
  recentLocks?: Array<{
    requestId: string
    type: string
    blockNumber: bigint
    transactionHash: string
    requestData?: any
  }>
}

interface ProverSearchProps {
  onProverSelect?: (prover: ProverData) => void
}

export default function ProverSearch({ onProverSelect }: ProverSearchProps) {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<ProverData[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProver, setSelectedProver] = useState<ProverData | null>(null)
  const [error, setError] = useState('')
  const [dataSource, setDataSource] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState('')
  const [useBlockchain, setUseBlockchain] = useState(true)

  const searchProvers = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setError('')
      setDataSource(null)
      return
    }

    console.log('🔍 Starting search for:', searchQuery)
    setIsSearching(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.append('q', searchQuery)
      params.append('limit', '10')
      
      // ВСЕГДА включаем blockchain данные для лучшего опыта
      if (useBlockchain) {
        params.append('blockchain', 'true')
        params.append('realdata', 'true')
      }

      const url = `/api/provers?${params}`
      console.log('🌐 API URL:', url)

      const response = await fetch(url)
      const result = await response.json()
      
      console.log('📊 API Response:', result)
      console.log('🔗 Data source:', result.source)
      console.log('👥 Found provers:', result.data)

      if (result.success || result.data) {
        const provers = Array.isArray(result.data) ? result.data : []
        setSearchResults(provers)
        setDataSource(result.source)
        
        console.log('✅ Search successful, found', provers.length, 'provers')
        
        if (provers.length === 0) {
          setError(`No provers found matching "${searchQuery}". Try entering a valid Ethereum address (0x...)`)
          console.log('⚠️ No provers found for query:', searchQuery)
        } else {
          // Log first prover details for debugging
          console.log('🔍 First prover details:', provers[0])
        }
      } else {
        const errorMsg = result.error || 'Failed to search provers'
        setError(errorMsg)
        console.error('❌ API Error:', errorMsg)
      }
    } catch (err) {
      const errorMsg = 'Error connecting to prover network'
      setError(errorMsg)
      console.error('❌ Network Error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        console.log('⏰ Debounced search triggered for:', query)
        searchProvers(query)
      } else {
        setSearchResults([])
        setError('')
        setDataSource(null)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, useBlockchain])

  const handleProverSelect = (prover: ProverData) => {
    console.log('👆 Prover selected:', prover)
    setSelectedProver(prover)
    onProverSelect?.(prover)
  }

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(''), 2000)
      console.log('📋 Address copied:', address)
    } catch (err) {
      console.error('❌ Failed to copy address:', err)
    }
  }

  const formatEarnings = (earnings?: number) => {
    if (!earnings) return '$0.00'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(earnings)
  }

  const formatBalance = (balance?: string, symbol: string = 'ETH') => {
    if (!balance) return '0.000'
    const num = parseFloat(balance)
    if (num === 0) return `0.000 ${symbol}`
    return `${num.toFixed(6)} ${symbol}`
  }

  const getStatusColor = (prover: ProverData) => {
    const isActive = prover.isActive || prover.is_active_onchain || prover.status === 'online'
    return isActive 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const getStatusText = (prover: ProverData) => {
    if (prover.blockchain_verified && prover.is_active_onchain) return 'ACTIVE ON-CHAIN'
    if (prover.status === 'online') return 'ONLINE'
    if (prover.status === 'busy') return 'BUSY'
    if (prover.status === 'maintenance') return 'MAINTENANCE'
    return 'OFFLINE'
  }

  const getDataSourceInfo = (source: string) => {
    if (source.includes('direct_address_lookup')) {
      return { text: 'Live Blockchain Data', color: 'bg-green-500', icon: <Activity className="w-3 h-3" /> }
    }
    if (source.includes('blockchain_discovery')) {
      return { text: 'Blockchain Discovery', color: 'bg-blue-500', icon: <Zap className="w-3 h-3" /> }
    }
    if (source.includes('blockchain')) {
      return { text: 'Blockchain Enhanced', color: 'bg-emerald-500', icon: <Shield className="w-3 h-3" /> }
    }
    if (source.includes('supabase')) {
      return { text: 'Database', color: 'bg-blue-500', icon: null }
    }
    return { text: 'Fallback Data', color: 'bg-yellow-500', icon: null }
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Enter prover address (0x...), nickname, GPU model, or location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background/50 py-3 pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary backdrop-blur-sm"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>
        
        {/* Controls */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={useBlockchain}
                onChange={(e) => setUseBlockchain(e.target.checked)}
                className="rounded border-border bg-background"
              />
              Include real-time blockchain data
            </label>
          </div>
          
          {/* Data Source Indicator */}
          {dataSource && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`h-2 w-2 rounded-full ${getDataSourceInfo(dataSource).color}`} />
              <span className="flex items-center gap-1">
                {getDataSourceInfo(dataSource).icon}
                {getDataSourceInfo(dataSource).text}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <div className="flex items-start gap-2">
            <div className="mt-0.5">⚠️</div>
            <div>
              <div className="font-medium mb-1">No Results Found</div>
              <div>{error}</div>
              <div className="mt-2 text-xs text-red-300">
                <strong>Try searching by:</strong>
                <ul className="mt-1 ml-4 space-y-1">
                  <li>• <strong>Ethereum address:</strong> 0x1234... (gets real-time data)</li>
                  <li>• <strong>Prover nickname:</strong> CryptoMiner_Pro, ZK_Beast_2024</li>
                  <li>• <strong>GPU model:</strong> RTX 4090, RTX 3080</li>
                  <li>• <strong>Location:</strong> US-East, EU-West</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
            </h3>
            {searchResults.some(p => p.source === 'direct_address_lookup') && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/30">
                <Activity className="w-3 h-3" />
                LIVE BLOCKCHAIN DATA
              </span>
            )}
          </div>
          
          <div className="space-y-2">
            {searchResults.map((prover, index) => (
              <div
                key={prover.id || `result-${index}`}
                onClick={() => handleProverSelect(prover)}
                className="cursor-pointer rounded-lg border border-border bg-card/50 backdrop-blur-sm p-4 transition-all hover:border-primary/50 hover:bg-card/80 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-foreground">
                        {prover.nickname || prover.name || `Prover ${prover.id?.slice(0, 8)}`}
                      </h4>
                      
                      <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(prover)}`}>
                        {getStatusText(prover)}
                      </span>
                      
                      {prover.blockchain_verified && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                          <Shield className="w-3 h-3" />
                          VERIFIED
                        </span>
                      )}
                      
                      {prover.source && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                          {getDataSourceInfo(prover.source).icon}
                          {prover.source.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    {prover.blockchain_address && (
                      <div className="flex items-center gap-2 bg-muted/50 rounded p-2">
                        <code className="text-sm text-muted-foreground font-mono flex-1">
                          {prover.blockchain_address}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyAddress(prover.blockchain_address!)
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress === prover.blockchain_address ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <a 
                          href={`https://basescan.org/address/${prover.blockchain_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          title="View on BaseScan"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                      {/* Balance/Earnings */}
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">
                          {prover.eth_balance || prover.stake_balance ? 'Balance:' : 'Earnings:'}
                        </span>
                        <div className="font-medium text-primary">
                          {prover.eth_balance ? 
                            formatBalance(prover.eth_balance, 'ETH') :
                            prover.stake_balance ?
                            formatBalance(prover.stake_balance, 'HP') :
                            formatEarnings(prover.earnings_usd || prover.earnings)
                          }
                        </div>
                      </div>

                      {/* Secondary Balance */}
                      {prover.eth_balance && prover.stake_balance && (
                        <div className="space-y-1">
                          <span className="text-muted-foreground text-xs">HP Stake:</span>
                          <div className="font-medium text-purple-400">
                            {formatBalance(prover.stake_balance, 'HP')}
                          </div>
                        </div>
                      )}

                      {/* Orders */}
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">Orders:</span>
                        <div className="font-medium text-foreground">
                          {prover.total_orders || prover.completedOrders || 0}
                          {prover.successful_orders && prover.total_orders && prover.total_orders > 0 && (
                            <span className="text-xs text-green-400 ml-1">
                              ({Math.round((prover.successful_orders / prover.total_orders) * 100)}%)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Reputation/Uptime */}
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">
                          {prover.reputation_score ? 'Reputation:' : 'Uptime:'}
                        </span>
                        <div className="font-medium text-yellow-400">
                          {prover.reputation_score ? 
                            `⭐ ${prover.reputation_score.toFixed(1)}` :
                            `${prover.uptime || 0}%`
                          }
                        </div>
                      </div>
                    </div>

                    {/* Hardware & Location */}
                    {(prover.gpu_model || prover.gpu || prover.location) && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {(prover.gpu_model || prover.gpu) && (
                          <span className="flex items-center gap-1">
                            🎮 {prover.gpu_model || prover.gpu}
                          </span>
                        )}
                        {prover.location && (
                          <span className="flex items-center gap-1">
                            📍 {prover.location}
                          </span>
                        )}
                        {prover.hashRate && prover.hashRate > 0 && (
                          <span className="flex items-center gap-1">
                            ⚡ {prover.hashRate} H/s
                          </span>
                        )}
                      </div>
                    )}

                    {/* Last Activity */}
                    <div className="text-xs text-muted-foreground">
                      Last active: {new Date(
                        prover.last_seen || 
                        prover.lastActive || 
                        prover.lastUpdated || 
                        Date.now()
                      ).toLocaleString()}
                      {prover.is_active_onchain && (
                        <span className="text-green-400 ml-2">• On-chain verified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Prover Details */}
      {selectedProver && (
        <div className="rounded-lg border border-primary/50 bg-primary/5 backdrop-blur-sm p-6">
          <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Selected Prover Details
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground border-b border-border pb-2">Basic Information</h4>
              
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Address:</span>
                  <div className="font-mono text-sm break-all mt-1 p-2 bg-muted/50 rounded">
                    {selectedProver.blockchain_address || selectedProver.id}
                  </div>
                </div>
                
                {selectedProver.nickname && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Nickname:</span>
                    <div className="font-medium">{selectedProver.nickname}</div>
                  </div>
                )}
                
                <div className="text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <div className={selectedProver.blockchain_verified ? 'text-green-400' : 'text-yellow-400'}>
                    {selectedProver.blockchain_verified ? '✅ Blockchain Verified' : '⚠️ Database Only'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Financial Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-foreground border-b border-border pb-2">Financial Details</h4>
              
              <div className="space-y-2">
                {selectedProver.eth_balance && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">ETH Balance:</span>
                    <div className="font-medium text-blue-400">{formatBalance(selectedProver.eth_balance, 'ETH')}</div>
                  </div>
                )}
                
                {selectedProver.stake_balance && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">HP Stake:</span>
                    <div className="font-medium text-purple-400">{formatBalance(selectedProver.stake_balance, 'HP')}</div>
                  </div>
                )}
                
                {(selectedProver.earnings_usd || selectedProver.earnings) && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total Earnings:</span>
                    <div className="font-medium text-green-400">
                      {formatEarnings(selectedProver.earnings_usd || selectedProver.earnings)}
                    </div>
                  </div>
                )}
                
                {selectedProver.is_active_onchain !== undefined && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">On-Chain Status:</span>
                    <div className={selectedProver.is_active_onchain ? 'text-green-400' : 'text-red-400'}>
                      {selectedProver.is_active_onchain ? '🟢 Active (has stake)' : '🔴 Inactive (no stake)'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          {(selectedProver.reputation_score !== undefined || selectedProver.total_orders || selectedProver.uptime) && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-foreground border-b border-border pb-2">Performance Statistics</h4>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedProver.reputation_score !== undefined && (
                  <div className="text-center p-3 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-yellow-400">⭐ {selectedProver.reputation_score.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">Reputation</div>
                  </div>
                )}
                
                {selectedProver.total_orders && (
                  <div className="text-center p-3 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-foreground">{selectedProver.total_orders}</div>
                    <div className="text-xs text-muted-foreground">Total Orders</div>
                  </div>
                )}
                
                {selectedProver.successful_orders && (
                  <div className="text-center p-3 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-green-400">{selectedProver.successful_orders}</div>
                    <div className="text-xs text-muted-foreground">Successful</div>
                  </div>
                )}
                
                {selectedProver.uptime && (
                  <div className="text-center p-3 bg-muted/30 rounded">
                    <div className="text-lg font-bold text-primary">{selectedProver.uptime}%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
            {selectedProver.source && (
              <span>Data source: {selectedProver.source.replace(/_/g, ' ')}</span>
            )}
            {selectedProver.last_blockchain_check && (
              <span className="ml-4">Last blockchain check: {new Date(selectedProver.last_blockchain_check).toLocaleString()}</span>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
        <div className="font-medium mb-2">💡 <strong>Search Tips:</strong></div>
        <ul className="space-y-1 ml-4">
          <li>• <strong>For real-time data:</strong> Enter an Ethereum address (0x...)</li>
          <li>• <strong>For registered provers:</strong> Search by nickname, GPU model, or location</li>
          <li>• <strong>Enable blockchain data</strong> for live verification from Base network</li>
          <li>• <strong>Results show:</strong> ETH/HP balances, orders, reputation, and verification status</li>
        </ul>
      </div>
    </div>
  )
}
