'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    boundless: [
      { name: 'Documentation', href: 'https://docs.beboundless.xyz', external: true },
      { name: 'Explorer', href: 'https://indexer.beboundless.xyz', external: true },
      { name: 'GitHub', href: 'https://github.com/boundless-xyz', external: true },
    ],
    community: [
      { name: 'Discord', href: 'https://discord.gg/boundless', external: true },
      { name: 'Twitter', href: 'https://x.com/boundless_xyz', external: true },
      { name: 'Telegram', href: 'https://t.me/boundless_xyz', external: true },
    ],
    resources: [
      { name: 'RISC Zero', href: 'https://risczero.com', external: true },
      { name: 'Base Network', href: 'https://base.org', external: true },
      { name: 'ZK Resources', href: 'https://zkresear.ch', external: true },
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.footer 
      className="border-t border-white/10 bg-bg-card/50 backdrop-blur-sm mt-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-alt rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gradient">Boundless</h3>
                <p className="text-xs text-text-dim">Analytics Dashboard</p>
              </div>
            </div>
            <p className="text-sm text-text-dim mb-4 max-w-xs">
              Real-time analytics and monitoring for Boundless ZK protocol provers. 
              Maximize your earnings and optimize performance.
            </p>
            <div className="flex gap-3">
              {/* Social Icons */}
              {[
                { icon: '💬', href: 'https://discord.gg/boundless', label: 'Discord' },
                { icon: '🐦', href: 'https://x.com/boundless_xyz', label: 'Twitter' },
                { icon: '📱', href: 'https://t.me/boundless_xyz', label: 'Telegram' },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={social.label}
                >
                  <span className="text-sm">{social.icon}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Sections */}
          {Object.entries(links).map(([category, items]) => (
            <motion.div key={category} variants={itemVariants}>
              <h4 className="font-semibold text-text-main mb-4 capitalize">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.name}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-dim hover:text-accent transition-colors duration-200 flex items-center gap-1"
                      >
                        {item.name}
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <Link 
                        href={item.href}
                        className="text-sm text-text-dim hover:text-accent transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div 
          className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4"
          variants={itemVariants}
        >
          <div className="flex items-center gap-4 text-sm text-text-dim">
            <span>© {currentYear} Boundless Analytics</span>
            <span className="hidden md:block">•</span>
            <span className="flex items-center gap-2">
              🦾 Made by <span className="text-accent font-medium">OveR</span>
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a 
              href="https://beboundless.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-text-dim hover:text-accent transition-colors duration-200"
            >
              Official Site
            </a>
            <a 
              href="https://docs.beboundless.xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-text-dim hover:text-accent transition-colors duration-200"
            >
              Docs
            </a>
            <a 
              href="https://github.com/boundless-xyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-text-dim hover:text-accent transition-colors duration-200"
            >
              GitHub
            </a>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          className="mt-6 text-center"
          variants={itemVariants}
        >
          <p className="text-xs text-text-dim/70 max-w-2xl mx-auto">
            This dashboard is an independent community project. Not officially affiliated with Boundless or RISC Zero. 
            Use at your own risk. Always verify data on official sources.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
