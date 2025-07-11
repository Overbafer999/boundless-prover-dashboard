'use client'
import React, { useState } from 'react';
import ProverCard from './ProverCard';
import { cn } from '@/lib/utils';
import type { ProverData } from '@/lib/types';

interface ProverLeaderboardProps {
  provers: ProverData[];
}

export default function ProverLeaderboard({ provers }: ProverLeaderboardProps) {
  const [sortBy, setSortBy] = useState<'earnings' | 'uptime' | 'status' | 'hashRate'>('earnings');

  const sortedProvers = [...provers].sort((a, b) => {
    switch (sortBy) {
      case 'earnings':
        return b.earnings - a.earnings;
      case 'uptime':
        return b.uptime - a.uptime;
      case 'hashRate':
        return b.hashRate - a.hashRate;
      case 'status':
        const statusOrder = { 'busy': 3, 'online': 2, 'offline': 1 };
        return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
      default:
        return 0;
    }
  });

  const getSortButtonClass = (sortType: typeof sortBy) => {
    return cn(
      'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
      sortBy === sortType
        ? 'bg-blue-100 text-blue-700 border border-blue-200'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    );
  };

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Prover Leaderboard</h2>
          <span className="text-sm text-gray-600">{provers.length} provers</span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSortBy('earnings')}
            className={getSortButtonClass('earnings')}
          >
            Sort by Earnings
          </button>
          <button
            onClick={() => setSortBy('uptime')}
            className={getSortButtonClass('uptime')}
          >
            Sort by Uptime
          </button>
          <button
            onClick={() => setSortBy('hashRate')}
            className={getSortButtonClass('hashRate')}
          >
            Sort by Hash Rate
          </button>
          <button
            onClick={() => setSortBy('status')}
            className={getSortButtonClass('status')}
          >
            Sort by Status
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {sortedProvers.map((prover, index) => (
            <div
              key={prover.id}
              className="relative transition-all duration-300 hover:scale-[1.01]"
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInLeft 0.5s ease-out forwards'
              }}
            >
              {index < 3 && (
                <div className={cn(
                  'absolute -left-2 -top-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10',
                  index === 0 && 'bg-yellow-500',
                  index === 1 && 'bg-gray-400',
                  index === 2 && 'bg-amber-600'
                )}>
                  {index + 1}
                </div>
              )}
              <ProverCard prover={prover} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
