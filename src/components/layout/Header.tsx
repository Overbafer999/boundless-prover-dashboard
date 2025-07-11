'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Bell, 
  Settings, 
  User, 
  Search, 
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react'
import Link from 'next/link'

interface NotificationProps {
  id: number
  message: string
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(true)

  // Sample notifications
  const notifications: NotificationProps[] = [
    { id: 1, message: 'New prover connected: ProverNode-Delta', time: '2 min ago', type: 'info' },
    { id: 2, message: 'Order #12847 completed successfully', time: '5 min ago', type: 'success' },
    { id: 3, message: 'System maintenance in 1 hour', time: '15 min ago', type: 'warning' },
  ]

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

  const getNotificationIcon = (type: NotificationProps['type']) => {
    switch (type) {
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return 'ℹ️'
    }
  }

  const closeAllDropdowns = () => {
    setIsNotificationsOpen(false)
    setIsProfileOpen(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      closeAllDropdowns()
    }

    if (isNotificationsOpen || isProfileOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isNotificationsOpen, isProfileOpen])

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
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block"
                whileHover={{ scale: 1.05 }}
              >
                Boundless
              </motion.span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Search provers, orders, or transactions..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300/60 rounded-xl leading-5 bg-white/60 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <motion.div 
              className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-gray-100/60 backdrop-blur-sm"
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

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsNotificationsOpen(!isNotificationsOpen)
                  setIsProfileOpen(false)
                }}
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl hover:bg-gray-100/60 transition-all duration-200"
              >
                <Bell className="h-6 w-6" />
                <motion.span 
                  className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-80 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl ring-1 ring-black/5 z-50 border border-gray-200/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Notifications</h3>
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <motion.div 
                            key={notification.id} 
                            className="flex items-start space-x-3 p-3 hover:bg-gray-50/60 rounded-lg transition-colors cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200/60">
                        <button className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
                          View all notifications
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl hover:bg-gray-100/60 transition-all duration-200"
            >
              <Settings className="h-6 w-6" />
            </motion.button>

            {/* Profile */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsProfileOpen(!isProfileOpen)
                  setIsNotificationsOpen(false)
                }}
                className="flex items-center space-x-3 p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl hover:bg-gray-100/60 transition-all duration-200"
              >
                <motion.div 
                  className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <User className="w-5 h-5 text-white" />
                </motion.div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  Admin
                </span>
              </motion.button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-lg rounded-xl shadow-xl ring-1 ring-black/5 z-50 border border-gray-200/50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      {['Your Profile', 'Settings', 'Billing'].map((item) => (
                        <motion.a 
                          key={item}
                          href="#" 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/60 transition-colors"
                          whileHover={{ x: 4 }}
                        >
                          {item}
                        </motion.a>
                      ))}
                      <div className="border-t border-gray-200/60"></div>
                      <motion.a 
                        href="#" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/60 transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        Sign out
                      </motion.a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl hover:bg-gray-100/60 transition-all duration-200"
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-200/50"
          >
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300/60 rounded-xl leading-5 bg-white/60 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Mobile Connection Status */}
              <div className="flex items-center justify-center space-x-2 py-2">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                  {isConnected ? 'Connected' : 'Reconnecting...'}
                </span>
              </div>

              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                {['Dashboard', 'Provers', 'Orders', 'Analytics'].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link 
                      href={item === 'Dashboard' ? '/' : `/${item.toLowerCase()}`} 
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50/60 rounded-lg transition-colors"
                    >
                      {item}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header
