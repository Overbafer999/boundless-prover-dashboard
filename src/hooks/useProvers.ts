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
      setError(null) // Сброс ошибки при новом запросе
      
      const data = await boundlessAPI.getProvers()
      
      // Безопасная проверка данных
      if (Array.isArray(data)) {
        // Валидация каждого провера
        const validProvers = data.filter(prover => 
          prover && 
          typeof prover === 'object' && 
          prover.id && 
          prover.nickname
        ).map(prover => ({
          ...prover,
          // Добавляем fallback значения для обязательных полей
          nickname: prover.nickname || 'Unknown Prover',
          gpu_model: prover.gpu_model || 'Unknown GPU',
          location: prover.location || 'Unknown Location',
          status: prover.status || 'offline',
          reputation_score: typeof prover.reputation_score === 'number' ? prover.reputation_score : 0,
          total_orders: typeof prover.total_orders === 'number' ? prover.total_orders : 0,
          successful_orders: typeof prover.successful_orders === 'number' ? prover.successful_orders : 0,
          earnings_usd: typeof prover.earnings_usd === 'number' ? prover.earnings_usd : 0,
        }))
        
        setProvers(validProvers)
      } else {
        console.warn('API returned non-array data:', data)
        setProvers([])
      }
    } catch (err) {
      console.error('Error fetching provers:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch provers')
      // Не очищаем существующие данные при ошибке
      // setProvers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProvers()
    const interval = setInterval(fetchProvers, 10000) // Update every 10s
    return () => clearInterval(interval)
  }, [])

  return { 
    provers, 
    loading, 
    error, 
    refetch: fetchProvers,
    // Дополнительные утилиты
    hasData: provers.length > 0,
    isEmpty: !loading && provers.length === 0
  }
}
