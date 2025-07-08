'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useStore } from '@/store';
import ConnectionStatus from '@/components/ui/ConnectionStatus';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { notifications, marketStats, isWebSocketConnected } = useStore();
  
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  const navItems = [
    { href: '#leaderboard', label: 'Leaderboard', icon: '🏆' },
    { href: '#orders', label: 'Orders', icon: '⚡' },
    { href: '#analytics', label: 'Analytics', icon: '📊' },
    { href: '#calculator', label: 'Calculator', icon: '🧮' },
  ];

  const externalLinks = [
    { href: 'https://docs.beboundless.xyz', label: 'Docs', icon: '📚' },
    { href: 'https://discord.gg/boundless', label: 'Discord', icon: '💬' },
    { href: 'https://x.com/boundless_xyz', label: 'Twitter', icon: '🐦' },
  ];

  return (
    <motion.header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-bg-main/90 backdrop-blur-md border-b border-white/10 shadow-lg' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-alt rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gradient">Boundless</h1>
                <p className="text-xs text-text-dim -mt-1">Analytics Dashboard</p>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => (
              <motion.a
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 text-sm font-medium text-text-dim hover:text-text-main transition-colors duration-200 group"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </span>
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Market Stats (Desktop) */}
            {marketStats && (
              <div className="hidden xl:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-text-dim">TVL:</span>
                  <span className="font-semibold text-success">
                    ${marketStats.totalValueLocked.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-dim">Active Provers:</span>
                  <span className="font-semibold text-accent">
                    {marketStats.activeProvers}
                  </span>
                </div>
              </div>
            )}

            {/* Notifications */}
            <motion.button 
              className="relative p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {/* TODO: Open notifications panel */}}
            >
              <svg className="w-6 h-6 text-text-dim hover:text-text-main transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </motion.span>
              )}
            </motion.button>

            {/* Connection Status */}
            <ConnectionStatus 
              isConnected={isWebSocketConnected}
              className="hidden sm:block"
            />

            {/* External Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              {externalLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-dim hover:text-text-main hover:bg-white/5 rounded-lg transition-all duration-200"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <span>{link.icon}</span>
                  <span className="hidden xl:block">{link.label}</span>
                </motion.a>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden menu-button p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.svg
                    key="close"
                    className="w-6 h-6 text-text-main"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="menu"
                    className="w-6 h-6 text-text-main"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden mobile-menu absolute top-full left-0 right-0 bg-bg-card/95 backdrop-blur-lg border border-white/10 rounded-b-2xl shadow-2xl"
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="p-6 space-y-6">
                {/* Market Stats (Mobile) */}
                {marketStats && (
                  <motion.div 
                    className="grid grid-cols-2 gap-4 p-4 bg-white/5 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-center">
                      <p className="text-xs text-text-dim">Total Value Locked</p>
                      <p className="font-bold text-success">${marketStats.totalValueLocked.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-text-dim">Active Provers</p>
                      <p className="font-bold text-accent">{marketStats.activeProvers}</p>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </motion.a>
                  ))}
                </nav>

                {/* External Links */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-text-dim mb-3 font-medium uppercase tracking-wider">External Links</p>
                  <div className="grid grid-cols-3 gap-2">
                    {externalLinks.map((link, index) => (
                      <motion.a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-colors duration-200 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span className="text-xs font-medium">{link.label}</span>
                      </motion.a>
                    ))}
                  </div>
                </div>

                {/* Connection Status (Mobile) */}
                <motion.div 
                  className="pt-4 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <ConnectionStatus 
                    isConnected={isWebSocketConnected}
                    showLabel={true}
                    className="w-full justify-center"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
