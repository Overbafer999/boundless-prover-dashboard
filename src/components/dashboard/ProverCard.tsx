'use client'

import React, { useState } from 'react';
import { formatCurrency, formatTimeAgo, cn, copyToClipboard, formatAddress } from '@/lib/utils';
import type { ProverData } from '@/lib/types';

interface ProverCardProps {
  prover: ProverData;
}

export default function ProverCard({ prover }: ProverCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(prover.id);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'busy': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'offline': return 'Offline';
      case 'busy': return 'Busy';
      default: return 'Unknown';
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-4 hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.02]',
        isExpanded && 'shadow-lg scale-[1.02]'
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={cn('w-3 h-3 rounded-full', getStatusColor(prover.status))} />
            <h3 className="font-semibold text-gray-900">{prover.name}</h3>
            <span className="text-sm text-gray-500">{getStatusText(prover.status)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Earnings:</span>
              <p className="font-semibold text-green-600">{formatCurrency(prover.earnings ?? 0)}</p>
            </div>
            <div>
              <span className="text-gray-600">Hash Rate:</span>
              <p className="font-semibold">{prover.hashRate ?? 0} H/s</p>
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy ID'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t transition-all duration-300">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Uptime:</span>
              <p className="font-medium">{prover.uptime ?? 0}h</p>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>
              <p className="font-medium">{prover.location ?? 'Unknown'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Prover ID:</span>
              <p className="font-mono text-xs">{formatAddress(prover.id)}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Last Update:</span>
              <p className="font-medium text-xs">{formatTimeAgo(prover.lastUpdate ?? '')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
