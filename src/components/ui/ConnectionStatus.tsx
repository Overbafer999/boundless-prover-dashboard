'use client'
import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Activity } from 'lucide-react'

interface ConnectionStatusType {
  isConnected: boolean
  lastPing: string
  reconnectAttempts: number
}

interface ConnectionStatusProps {
  className?: string
}

export default function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [status, setStatus] = useState<ConnectionStatusType>({
    isConnected: true,
    lastPing: new Date().toISOString(),
    reconnectAttempts: 0
  })

  useEffect(() => {
    // Simulate connection status updates
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        lastPing: new Date().toISOString(),
        isConnected: Math.random() > 0.1 // 90% chance of being connected
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    return status.isConnected ? 'text-green-500' : 'text-red-500'
  }

  const getStatusText = () => {
    return status.isConnected ? 'Connected' : 'Disconnected'
  }

  const getStatusIcon = () => {
    if (status.isConnected) {
      return <Wifi className="w-4 h-4" />
    } else {
      return <WifiOff className="w-4 h-4" />
    }
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border transition-all duration-300 ${className}`}
    >
      {/* Status Indicator */}
      <div className="relative flex items-center">
        <div
          className={`w-2 h-2 rounded-full transition-all duration-500 ${
            status.isConnected 
              ? 'bg-green-500 animate-pulse' 
              : 'bg-red-500'
          }`}
        />
        
        {status.isConnected && (
          <div className="absolute w-2 h-2 rounded-full bg-green-500 opacity-75 animate-ping" />
        )}
      </div>

      {/* Status Icon */}
      <div className={getStatusColor()}>
        {getStatusIcon()}
      </div>

      {/* Status Text */}
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </span>

      {/* Activity Indicator */}
      {status.isConnected && (
        <div className="text-blue-500 animate-spin">
          <Activity className="w-3 h-3" />
        </div>
      )}

      {/* Last Ping Time */}
      {status.lastPing && (
        <span className="text-xs text-gray-500 ml-1">
          {new Date(status.lastPing).toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
