'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Zap, DollarSign, Clock, TrendingUp, Calendar } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface CalculatorInputs {
  hashRate: number
  powerConsumption: number
  electricityCost: number
  hoursPerDay: number
  currentReward: number
}

interface ProfitResults {
  dailyProfit: number
  weeklyProfit: number
  monthlyProfit: number
  yearlyProfit: number
  roi: number
  breakEven: number
}

export default function ProfitCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    hashRate: 100,
    powerConsumption: 300,
    electricityCost: 0.12,
    hoursPerDay: 24,
    currentReward: 0.5
  })

  const [results, setResults] = useState<ProfitResults>({
    dailyProfit: 0,
    weeklyProfit: 0,
    monthlyProfit: 0,
    yearlyProfit: 0,
    roi: 0,
    breakEven: 0
  })

  const calculateProfit = () => {
    const dailyPowerCost = (inputs.powerConsumption / 1000) * inputs.hoursPerDay * inputs.electricityCost
    const dailyRevenue = inputs.currentReward * (inputs.hoursPerDay / 24)
    const dailyProfit = dailyRevenue - dailyPowerCost

    const weeklyProfit = dailyProfit * 7
    const monthlyProfit = dailyProfit * 30
    const yearlyProfit = dailyProfit * 365

    // Assuming hardware cost of $2000 for ROI calculation
    const hardwareCost = 2000
    const roi = yearlyProfit > 0 ? (yearlyProfit / hardwareCost) * 100 : 0
    const breakEven = dailyProfit > 0 ? hardwareCost / dailyProfit : 0

    setResults({
      dailyProfit,
      weeklyProfit,
      monthlyProfit,
      yearlyProfit,
      roi,
      breakEven
    })
  }

  useEffect(() => {
    calculateProfit()
  }, [inputs])

  const handleInputChange = (field: keyof CalculatorInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profit Calculator</h2>
        <div className="p-2 bg-blue-100 rounded-lg">
          <Calculator className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hash Rate (TH/s)
            </label>
            <input
              type="number"
              value={inputs.hashRate}
              onChange={(e) => handleInputChange('hashRate', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Power Consumption (W)
            </label>
            <input
              type="number"
              value={inputs.powerConsumption}
              onChange={(e) => handleInputChange('powerConsumption', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Electricity Cost ($/kWh)
            </label>
            <input
              type="number"
              step="0.01"
              value={inputs.electricityCost}
              onChange={(e) => handleInputChange('electricityCost', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours per Day
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={inputs.hoursPerDay}
              onChange={(e) => handleInputChange('hoursPerDay', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Reward ($/day)
            </label>
            <input
              type="number"
              step="0.01"
              value={inputs.currentReward}
              onChange={(e) => handleInputChange('currentReward', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profit Projection</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Daily Profit</span>
              </div>
              <div className={`text-2xl font-bold ${getProfitColor(results.dailyProfit)}`}>
                {formatCurrency(results.dailyProfit)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Monthly Profit</span>
              </div>
              <div className={`text-2xl font-bold ${getProfitColor(results.monthlyProfit)}`}>
                {formatCurrency(results.monthlyProfit)}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-800">Yearly ROI</span>
              </div>
              <div className={`text-2xl font-bold ${getProfitColor(results.roi)}`}>
                {results.roi.toFixed(1)}%
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-800">Break Even</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {results.breakEven > 0 ? `${Math.ceil(results.breakEven)} days` : 'Never'}
              </div>
            </motion.div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <span>Weekly:</span>
                <span className={`font-semibold ${getProfitColor(results.weeklyProfit)}`}>
                  {formatCurrency(results.weeklyProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Yearly:</span>
                <span className={`font-semibold ${getProfitColor(results.yearlyProfit)}`}>
                  {formatCurrency(results.yearlyProfit)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
