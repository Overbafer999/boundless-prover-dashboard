'use client'

import { useState, useEffect } from 'react'
import { boundlessAPI } from '@/lib/api'
import type { ProverData } from '@/lib/types'

export function useProvers() {
  const [provers, setProvers] = useState<ProverData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProvers = async () => {
    try {
      setLoading(true)
      const data = await boundlessAPI.getProvers()
      setProvers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch provers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProvers()
    const interval = setInterval(fetchProvers, 10000) // Update every 10s
    return () => clearInterval(interval)
  }, [])

  return { provers, loading, error, refetch: fetchProvers }
}
