import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, DollarSign, Users } from 'lucide-react'
import type { OrderData, OrderStatus } from '@/lib/types'

interface LiveOrderCardProps {
  order: OrderData
  index?: number
}

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'processing':
      case 'in_progress':
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
      case 'cancelled':
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
            scale: status === 'processing' || status === 'in_progress' ? [1, 1.3, 1] : 1,
            opacity: status === 'failed' || status === 'cancelled' ? [1, 0.3, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {status.toUpperCase()}
      </span>
    </motion.span>
  )
}

// Безопасная функция для расчета оставшегося времени
function safeCalculateTimeLeft(order: OrderData, defaultHours: number = 1): number {
  try {
    // Получаем дату создания заказа с fallback
    const orderDate = order?.submittedAt || order?.createdAt
    
    if (!orderDate) {
      return defaultHours * 3600 // Возвращаем час по умолчанию
    }
    
    const submitted = new Date(orderDate)
    if (isNaN(submitted.getTime())) {
      console.warn('Invalid date format:', orderDate)
      return defaultHours * 3600
    }
    
    const now = Date.now()
    const elapsed = (now - submitted.getTime()) / 1000
    return Math.max(0, defaultHours * 3600 - elapsed)
  } catch (error) {
    console.error('Error calculating time left:', error)
    return defaultHours * 3600
  }
}

// Безопасная функция для форматирования времени
function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Безопасная функция для форматирования даты
function safeFormatDate(dateString?: string): string {
  try {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return date.toLocaleString()
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Unknown'
  }
}

export default function LiveOrderCard({ order, index = 0 }: LiveOrderCardProps) {
  // Безопасный расчет времени с проверками
  const [timeLeft, setTimeLeft] = useState(() => safeCalculateTimeLeft(order))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Безопасное получение данных заказа
  const orderId = order?.id || 'Unknown'
  const reward = typeof order?.reward === 'number' ? order.reward : 0
  const prover = order?.prover || null
  const status = order?.status || 'pending'
  const priority = order?.priority
  const orderDate = order?.submittedAt || order?.createdAt

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
            <h3 className="text-xl font-orbitron font-bold text-white mb-1">
              Order {orderId}
            </h3>
            {priority && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                priority === 'high' ? 'bg-red-500/20 text-red-400' :
                priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {priority.toUpperCase()} PRIORITY
              </span>
            )}
          </div>
          <StatusBadge status={status as OrderStatus} />
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
              ${reward.toFixed(2)}
            </motion.span>
          </div>
          
          {prover && (
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Prover:
              </span>
              <span className="font-bold text-boundless-neon">{prover}</span>
            </div>
          )}

          {timeLeft > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-300 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Left:
              </span>
              <motion.span 
                className="font-bold text-yellow-400"
                animate={{ scale: timeLeft < 300 ? [1, 1.1, 1] : 1 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {formatTime(timeLeft)}
              </motion.span>
            </div>
          )}
        </div>
        
        <div className="pt-3 border-t border-gray-600/30">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Created: {safeFormatDate(orderDate)}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
