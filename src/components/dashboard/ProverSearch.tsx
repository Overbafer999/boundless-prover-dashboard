'use client'

import React, { useState, useEffect } from 'react'
import { Search, Loader2, ExternalLink, Copy, CheckCircle } from 'lucide-react'

interface ProverData {
  id?: string
  nickname?: string
  gpu_model?: string
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
  successRate?: string
  reputation_score?: number
  status?: string
  isActive?: boolean
  is_active_onchain?: boolean
  blockchain_verified?: boolean
  lastUpdated?: string
  last_seen?: string
  earnings_usd?: number
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
      return
    }

    setIsSearching(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.append('q', searchQuery)
      params.append('limit', '10')
      
      // Включаем blockchain данные
      if (useBlockchain) {
        params.append('blockchain', 'true')
        params.append('realdata', 'true')
      }

      const response = await fetch(`/api/provers?${params}`)
      const result = await response.json()

      if (result.success || result.data) {
        const provers = Array.isArray(result.data) ? result.data : []
        setSearchResults(provers)
        setDataSource(result.source)
        
        if (provers.length === 0) {
          setError('No provers found matching your search')
        }
      } else {
        setError(result.error || 'Failed to search provers')
      }
    } catch (err) {
      setError('Error connecting to prover network')
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchProvers(query)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query, useBlockchain])

  const handleProverSelect = (prover: ProverData) => {
    setSelectedProver(prover)
    onProverSelect?.(prover)
  }

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      setTimeout(() => setCopiedAddress(''), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
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
    if (prover.status === 'maintenance') return 'MAINTENANCE'
    return 'OFFLINE'
  }

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by prover nickname, ID, or blockchain address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background/50 py-3 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
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
                className="rounded"
              />
              Include blockchain data
            </label>
          </div>
          
          {/* Data Source Indicator */}
          {dataSource && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`h-2 w-2 rounded-full ${
                dataSource.includes('blockchain') ? 'bg-green-500' : 
                dataSource.includes('supabase') ? 'bg-blue-500' : 'bg-yellow-500'
              }`} />
              {dataSource.includes('blockchain') ? 'Live blockchain data' :
               dataSource.includes('supabase') ? 'Database data' : 'Cached data'}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">
            Found {searchResults.length} prover{searchResults.length !== 1 ? 's' : ''}
          </h3>
          
          <div className="space-y-2">
            {searchResults.map((prover, index) => (
              <div
                key={prover.id || index}
                onClick={() => handleProverSelect(prover)}
                className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:bg-card/80"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      {prover.nickname && (
                        <h4 className="font-medium text-foreground">{prover.nickname}</h4>
                      )}
                      <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(prover)}`}>
                        {getStatusText(prover)}
                      </span>
                      {prover.blockchain_verified && (
                        <span className="rounded-full border border-green-500/30 bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                          ✓ VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Address */}
                    {prover.blockchain_address && (
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-muted-foreground">{prover.blockchain_address}</code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyAddress(prover.blockchain_address!)
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copiedAddress === prover.blockchain_address ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        
                          <a href={`https://basescan.org/address/${prover.blockchain_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          {prover.eth_balance || prover.stake_balance ? 'Blockchain Balance:' : 'Earnings:'}
                        </span>
                        <div className="font-medium text-green-400">
                          {prover.eth_balance ? 
                            formatBalance(prover.eth_balance, 'ETH') :
                            prover.stake_balance ?
                            formatBalance(prover.stake_balance, 'HP') :
                            formatEarnings(prover.earnings_usd)
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Orders:</span>
                        <div className="font-medium text-foreground">
                          {prover.total_orders || prover.completedOrders || 0}
                          {prover.reputation_score && (
                            <span className="text-xs text-muted-foreground ml-1">
                              (⭐ {prover.reputation_score.toFixed(1)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {(prover.gpu_model || prover.location) && (
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {prover.gpu_model && <span>🎮 {prover.gpu_model}</span>}
                        {prover.location && <span>📍 {prover.location}</span>}
                      </div>
                    )}

                    {/* Last Updated */}
                    <div className="text-xs text-muted-foreground">
                      Last seen: {new Date(prover.last_seen || prover.lastUpdated || Date.now()).toLocaleString()}
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
        <div className="rounded-lg border border-primary/50 bg-primary/5 p-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Selected Prover</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Address:</span>
                <div className="font-mono text-sm">{selectedProver.blockchain_address || selectedProver.id}</div>
              </div>
              {selectedProver.nickname && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Nickname:</span>
                  <div>{selectedProver.nickname}</div>
                </div>
              )}
              {selectedProver.stake_balance && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Stake Balance:</span>
                  <div>{formatBalance(selectedProver.stake_balance, 'HP')}</div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Status:</span>
                <div className={selectedProver.blockchain_verified ? 'text-green-400' : 'text-yellow-400'}>
                  {selectedProver.blockchain_verified ? 'Blockchain Verified' : 'Database Only'}
                </div>
              </div>
              {selectedProver.reputation_score && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Reputation:</span>
                  <div>⭐ {selectedProver.reputation_score.toFixed(1)}/5.0</div>
                </div>
              )}
              {selectedProver.is_active_onchain !== undefined && (
                <div className="text-sm">
                  <span className="text-muted-foreground">On-Chain Status:</span>
                  <div className={selectedProver.is_active_onchain ? 'text-green-400' : 'text-red-400'}>
                    {selectedProver.is_active_onchain ? 'Active' : 'Inactive'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-muted-foreground">
        💡 <strong>Tip:</strong> Enter a prover nickname, ID, or Ethereum address for search.
        Enable "Include blockchain data" for real-time verification from Base network.
      </div>
    </div>
  )
}
