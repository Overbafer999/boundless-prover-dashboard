'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProverLeaderboard from '@/components/dashboard/ProverLeaderboard';
import OrdersFeed from '@/components/dashboard/OrdersFeed';
import KPICards from '@/components/dashboard/KPICards';
import EarningsChart from '@/components/charts/EarningsChart';
import GPUChart from '@/components/charts/GPUChart';
import ProfitCalculator from '@/components/dashboard/ProfitCalculator';
import { useProvers } from '@/hooks/useProvers';
import { useOrders } from '@/hooks/useOrders';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useStore } from '@/store';
import { getCurrentNetwork } from '@/lib/api';

const BoundlessProverDashboard = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { 
    provers, 
    loading: proversLoading, 
    error: proversError,
    fetchProvers 
  } = useProvers();
  
  const { 
    orders, 
    loading: ordersLoading, 
    error: ordersError,
    fetchOrders 
  } = useOrders();

  const { isConnected, lastMessage } = useWebSocket(getCurrentNetwork());
  const { marketStats, notifications } = useStore();

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Fetch initial data
        await Promise.all([
          fetchProvers({ limit: 10, sortBy: 'earnings', sortOrder: 'desc' }),
          fetchOrders({ limit: 20, status: ['pending', 'active'] })
        ]);
        
        setIsLoaded(true);
      } catch (error) {
        console.error('[Dashboard] Initialization error:', error);
        setIsLoaded(true); // Still show UI even if data fails
      }
    };

    initializeData();
  }, [fetchProvers, fetchOrders]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      fetchProvers({ limit: 10, sortBy: 'earnings', sortOrder: 'desc' });
      fetchOrders({ limit: 20, status: ['pending', 'active'] });
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoaded, fetchProvers, fetchOrders]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <motion.section 
          className="text-center py-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-6xl md:text-7xl font-bold text-gradient mb-6">
              Boundless Analytics
            </h1>
            <p className="text-xl md:text-2xl text-text-dim mb-8 max-w-3xl mx-auto">
              Real-time monitoring and optimization for ZK protocol provers
            </p>
            
            {/* Connection Status */}
            <motion.div 
              className="flex items-center justify-center gap-4 mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                <span className="text-sm font-medium">
                  WebSocket: {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {lastMessage && (
                <div className="text-xs text-text-dim">
                  Last update: {new Date(lastMessage.timestamp).toLocaleTimeString()}
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* KPI Cards */}
          <motion.div variants={itemVariants}>
            <KPICards 
              marketStats={marketStats}
              loading={proversLoading || ordersLoading}
            />
          </motion.div>
        </motion.section>

        {/* Main Dashboard Grid */}
        <motion.section 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Prover Leaderboard */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  🏆 Prover Leaderboard
                  <span className="badge badge-accent">
                    {provers.length} Active
                  </span>
                </h2>
                
                {proversLoading && (
                  <div className="flex items-center gap-2 text-sm text-text-dim">
                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </div>
                )}
              </div>

              <ProverLeaderboard 
                provers={provers}
                loading={proversLoading}
                error={proversError}
              />
            </div>
          </motion.div>

          {/* Orders Feed */}
          <motion.div 
            className="space-y-6"
            variants={itemVariants}
          >
            <div className="card-glass">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  ⚡ Live Orders
                  <span className="badge badge-success animate-pulse">
                    {orders.filter(o => o.status === 'pending').length} New
                  </span>
                </h2>
                
                {ordersLoading && (
                  <div className="flex items-center gap-2 text-sm text-text-dim">
                    <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </div>
                )}
              </div>

              <OrdersFeed 
                orders={orders}
                loading={ordersLoading}
                error={ordersError}
              />
            </div>
          </motion.div>
        </motion.section>

        {/* Analytics Section */}
        <motion.section 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold text-center mb-8">
              📊 Performance Analytics
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Earnings Chart */}
            <motion.div 
              className="card-glass"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                💰 Earnings Trends
                <span className="text-sm text-text-dim">(7 days)</span>
              </h3>
              <EarningsChart />
            </motion.div>

            {/* GPU Performance Chart */}
            <motion.div 
              className="card-glass"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🖥️ GPU Performance
                <span className="text-sm text-text-dim">(Real-time)</span>
              </h3>
              <GPUChart />
            </motion.div>
          </div>
        </motion.section>

        {/* Profit Calculator Section */}
        <motion.section 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="card-glass"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              🧮 Profit Calculator
              <span className="badge badge-warning">Beta</span>
            </h2>
            <ProfitCalculator />
          </motion.div>
        </motion.section>

        {/* Error States */}
        {(proversError || ordersError) && (
          <motion.div 
            className="card border-danger/30 bg-danger/5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-danger/20 rounded-full flex items-center justify-center">
                ⚠️
              </div>
              <h3 className="text-lg font-semibold text-danger">
                Connection Issues
              </h3>
            </div>
            
            <div className="space-y-2 text-sm text-text-dim">
              {proversError && (
                <p>• Provers data: {proversError}</p>
              )}
              {ordersError && (
                <p>• Orders data: {ordersError}</p>
              )}
            </div>
            
            <button 
              onClick={() => {
                fetchProvers({ limit: 10, sortBy: 'earnings', sortOrder: 'desc' });
                fetchOrders({ limit: 20, status: ['pending', 'active'] });
              }}
              className="btn-secondary mt-4"
            >
              🔄 Retry Connection
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {!isLoaded && (
          <motion.div 
            className="fixed inset-0 bg-bg-main/80 backdrop-blur-sm z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Loading Dashboard</h3>
              <p className="text-text-dim">Connecting to Boundless network...</p>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
          {notifications.slice(0, 3).map((notification) => (
            <motion.div
              key={notification.id}
              className={`notification ${
                notification.type === 'order_new' ? 'notification-success' :
                notification.type === 'system_alert' ? 'notification-warning' :
                'notification-error'
              }`}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div className="flex items-start gap-3">
                <div className="text-lg">
                  {notification.type === 'order_new' ? '🎉' :
                   notification.type === 'system_alert' ? '⚠️' : '❌'}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  <p className="text-xs text-text-dim mt-1">{notification.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoundlessProverDashboard;
