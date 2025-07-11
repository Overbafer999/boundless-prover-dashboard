'use client'
import { useState, useEffect } from 'react'
import { Clock, User, DollarSign } from 'lucide-react'
import { OrderData } from '@/lib/types'
import Badge from '@/components/ui/Badge'

interface LiveOrderCardProps {
  order: OrderData
}

export default function LiveOrderCard({ order }: LiveOrderCardProps) {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Рассчитываем время на основе submittedAt
    const submitted = new Date(order.submittedAt).getTime()
    const now = Date.now()
    const elapsed = (now - submitted) / 1000
    return Math.max(0, 3600 - elapsed) // 1 час минус прошедшее время
  })

  // Update countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'processing': return 'bg-blue-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">{order.type}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant="secondary">
            {order.status}
          </Badge>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span>${order.reward}</span>
        </div>
        
        {order.proverId && (
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span className="truncate">{order.proverId}</span>
          </div>
        )}
        
        {timeLeft > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        )}
        
        <div className="col-span-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Difficulty</span>
            <span>{order.difficulty}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        Created: {new Date(order.submittedAt).toLocaleString()}
      </div>
    </div>
  )
}
