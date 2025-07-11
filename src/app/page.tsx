'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  TrendingUp, 
  Zap, 
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  BarChart3,
  Users,
  Clock,
  DollarSign
} from 'lucide-react'

interface ProverData {
  id: string
  name: string
  earnings: number
  hashRate: number
  status: 'online' | 'busy' | 'offline'
  lastActive: string
  uptime: number
  gpu?: string
  location?: string
}

interface OrderData {
  id: string
  reward: number
  prover?: string
  status: 'processing' | 'pending' | 'completed' | 'failed'
  createdAt: string
  priority?: 'high' | 'medium' | 'low'
}

interface ApiResponse<T> {
  success?: boolean
  data?: T
  timestamp?: string
  source?: string
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/50',
          glow: 'shadow-emerald-500/25'
        }
      case 'busy':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/50',
          glow: 'shadow-blue-500/25'
        }
      case 'offline':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/50',
          glow: 'shadow-red-500/25'
        }
      case 'processing':
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
            scale: status === 'processing' || status === 'busy' ? [1, 1.3, 1] : 1,
            opacity: status === 'offline' ? [1, 0.3, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {status.toUpperCase()}
      </span>
    </motion.span>
  )
}

const LoadingSpinner = () => (
  <motion.div 
    className="flex items-center justify-center p-8"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="rounded-full h-8 w-8 border-2 border-boundless-accent border-t-transparent"
    />
    <span className="ml-3 text-gray-400 font-medium">Loading real-time data...</span>
  </motion.div>
)

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient,
  delay = 0 
}: {
  title: string
  value: string
  subtitle: string
  icon: any
  gradient: string
  delay?: number
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -5 }}
    className={`${gradient} rounded-2xl p-6 border border-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="w-8 h-8 text-white/80" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-white/60"
        />
      </div>
      
      <h3 className="text-lg font-bold text-white/90 mb-2">{title}</h3>
      <motion.p 
        className="text-3xl font-black text-white mb-1"
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {value}
      </motion.p>
      <p className="text-sm text-white/70">{subtitle}</p>
    </div>
  </motion.div>
)

const ProverCard = ({ prover, index }: { prover: ProverData; index: number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    whileHover={{ scale: 1.02, y: -5 }}
    className="bg-gradient-to-br from-boundless-card/60 to-boundless-card/40 backdrop-blur-sm rounded-2xl p-6 border border-boundless-accent/20 hover:border-boundless-accent/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-boundless-accent/10 relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-boundless-accent/5 to-boundless-neon/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-boundless-neon/20 to-transparent rounded-bl-3xl" />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-orbitron font-bold text-white mb-1">{prover.name}</h3>
          <p className="text-xs text-gray-400">{prover.gpu} • {prover.location}</p>
        </div>
        <StatusBadge status={prover.status} />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300 text-sm">Earnings:</span>
            <motion.span 
              className="font-bold text-boundless-accent"
              whileHover={{ scale: 1.1 }}
