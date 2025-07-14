'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react'
import Link from 'next/link'

const Header = () => {
  const [isConnected, setIsConnected] = useState(true)

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly change connection status for demo
      if (Math.random() > 0.95) {
        setIsConnected(prev => !prev)
        setTimeout(() => setIsConnected(true), 3000)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
              >
                <Zap className="w-5 h-5 text-white" />
              </motion.div>
              <motion.span 
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
              >
                Boundless
              </motion.span>
            </Link>
          </div>

          {/* Right side - Only Connection Status */}
          <div className="flex items-center">
            {/* Connection Status */}
            <motion.div 
              className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-100/60 backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{
                  scale: isConnected ? 1 : [1, 1.2, 1],
                  rotate: isConnected ? 0 : [0, 180, 360]
                }}
                transition={{
                  duration: isConnected ? 0 : 2,
                  repeat: isConnected ? 0 : Infinity,
                }}
              >
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
              </motion.div>
              <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                {isConnected ? 'Connected' : 'Reconnecting...'}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
