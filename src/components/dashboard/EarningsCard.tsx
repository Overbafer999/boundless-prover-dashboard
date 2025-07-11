'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface EarningsData {
  today?: number
  yesterday?: number
  thisWeek?: number
  thisMonth?: number
  change24h?: number
  changeWeek?: number
  changeMonth?: number
}

interface EarningsCardProps {
  earnings: EarningsData
}

// Безопасная функция
const safe = (n: number | undefined) => typeof n === 'number' ? n : 0

export default function EarningsCard({ earnings }: EarningsCardProps) {
  const getTrendIcon = (change: number | undefined) => {
    return safe(change) >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-500" />
    )
  }

  const getTrendColor = (change: number | undefined) => {
    return safe(change) >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const formatChange = (change: number | undefined) => {
    const c = safe(change)
    const sign = c >= 0 ? '+' : ''
    return `${sign}${c.toFixed(1)}%`
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Earnings Overview</h2>
        <div className="p-2 bg-green-100 rounded-lg">
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Today</span>
            {getTrendIcon(earnings.change24h)}
          </div>
          <div className="text-2xl font-bold text-blue-900 mb-1">
            {formatCurrency(safe(earnings.today))}
          </div>
          <div className={`text-sm ${getTrendColor(earnings.change24h)}`}>
            {formatChange(earnings.change24h)} vs yesterday
          </div>
        </motion.div>

        {/* This Week */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">This Week</span>
            {getTrendIcon(earnings.changeWeek)}
          </div>
          <div className="text-2xl font-bold text-purple-900 mb-1">
            {formatCurrency(safe(earnings.thisWeek))}
          </div>
          <div className={`text-sm ${getTrendColor(earnings.changeWeek)}`}>
            {formatChange(earnings.changeWeek)} vs last week
          </div>
        </motion.div>

        {/* This Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">This Month</span>
            {getTrendIcon(earnings.changeMonth)}
          </div>
          <div className="text-2xl font-bold text-green-900 mb-1">
            {formatCurrency(safe(earnings.thisMonth))}
          </div>
          <div className={`text-sm ${getTrendColor(earnings.changeMonth)}`}>
            {formatChange(earnings.changeMonth)} vs last month
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Yesterday:</span>
            <span className="font-semibold">{formatCurrency(safe(earnings.yesterday))}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Avg. Daily:</span>
            <span className="font-semibold">{formatCurrency(safe(earnings.thisWeek) / 7)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

