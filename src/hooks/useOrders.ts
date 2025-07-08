'use client'

import { useState, useEffect } from 'react'
import { boundlessAPI } from '@/lib/api'
import type { Order } from '@/lib/types'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await boundlessAPI.getOrders()
      setOrders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000) // Update every 10s

    return () => clearInterval(interval)
  }, [])

  return { orders, loading, error, refetch: fetchOrders }
}
