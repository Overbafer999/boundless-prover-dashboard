'use client'

import React from 'react'

interface KPICardsProps {
  className?: string
}

export default function KPICards({ className }: KPICardsProps) {
  const kpiData = [
    {
      title: 'Total Provers',
      value: '1,247',
      change: '+12.5%',
      icon: '👥'
    },
    {
      title: 'Network Hashrate', 
      value: '4.2 TH/s',
      change: '-2.1%',
      icon: '⚡'
    },
    {
      title: 'Total Rewards',
      value: '$127,543',
      change: '+8.3%',
      icon: '💰'
    },
    {
      title: 'Network Activity',
      value: '94.7%',
      change: '+1.2%',
      icon: '📊'
    }
  ]

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:bg-gray-750 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{kpi.icon}</div>
            <span className={`text-sm font-medium ${
              kpi.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
            }`}>
              {kpi.change}
            </span>
          </div>
          
          <h3 className="text-sm font-medium text-gray-400 mb-2">
            {kpi.title}
          </h3>
          
          <p className="text-2xl font-bold text-white">
            {kpi.value}
          </p>
        </div>
      ))}
    </div>
  )
}
