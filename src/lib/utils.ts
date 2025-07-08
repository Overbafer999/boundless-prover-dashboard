// Utility functions for Boundless Prover Dashboard

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind CSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency values
export function formatCurrency(
  amount: number, 
  currency: string = 'USD',
  options: Intl.NumberFormatOptions = {}
): string {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };

  try {
    return new Intl.NumberFormat('en-US', defaultOptions).format(amount);
  } catch (error) {
    // Fallback for invalid currency codes
    return `$${amount.toFixed(2)}`;
  }
}

// Format large numbers with suffixes (K, M, B)
export function formatNumber(
  num: number, 
  precision: number = 1
): string {
  if (num === 0) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  if (absNum >= 1e9) {
    return `${sign}${(absNum / 1e9).toFixed(precision)}B`;
  }
  if (absNum >= 1e6) {
    return `${sign}${(absNum / 1e6).toFixed(precision)}M`;
  }
  if (absNum >= 1e3) {
    return `${sign}${(absNum / 1e3).toFixed(precision)}K`;
  }
  
  return `${sign}${absNum.toFixed(precision)}`;
}

// Format percentage values
export function formatPercent(
  value: number, 
  precision: number = 1
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value / 100);
}

// Format time ago (relative time)
export function formatTimeAgo(timestamp: string | Date): string {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = Math.floor((now - time) / 1000);

  if (diff < 0) return 'in the future';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
}

// Format duration (seconds to human readable)
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h`;
}

// Format hash/address for display
export function formatAddress(
  address: string, 
  startLength: number = 6, 
  endLength: number = 4
): string {
  if (!address || address.length <= startLength + endLength) {
    return address;
  }
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

// Format file size
export function formatFileSize(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Generate random ID
export function generateId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T;
  if (typeof obj === 'object') {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// Check if value is empty
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

// Clamp number between min and max
export function clamp(num: number, min: number, max: number): number {
  return Math.min(Math.max(num, min), max);
}

// Calculate percentage change
export function calculatePercentChange(
  current: number, 
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Get status color based on value
export function getStatusColor(
  value: number, 
  type: 'percentage' | 'number' = 'percentage'
): string {
  if (type === 'percentage') {
    if (value > 5) return 'text-success';
    if (value > 0) return 'text-warning';
    return 'text-danger';
  }
  
  // For number type, assume positive is good
  if (value > 0) return 'text-success';
  if (value === 0) return 'text-text-dim';
  return 'text-danger';
}

// Generate avatar URL
export function generateAvatar(
  address: string, 
  size: number = 40
): string {
  // Using DiceBear API for consistent avatars
  const seed = address.toLowerCase();
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&size=${size}&backgroundColor=6366f1,8b5cf6,a855f7`;
}

// Validate Ethereum address
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Parse number safely
export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

// Format blockchain network name
export function formatNetworkName(chainId: number): string {
  const networks: Record<number, string> = {
    1: 'Ethereum Mainnet',
    8453: 'Base Mainnet',
    84532: 'Base Sepolia',
    11155111: 'Ethereum Sepolia',
    137: 'Polygon Mainnet',
    10: 'Optimism Mainnet',
    42161: 'Arbitrum One',
  };
  
  return networks[chainId] || `Chain ${chainId}`;
}

// Get network icon
export function getNetworkIcon(chainId: number): string {
  const icons: Record<number, string> = {
    1: '🔷', // Ethereum
    8453: '🔵', // Base
    84532: '🔵', // Base Sepolia
    11155111: '🔷', // Ethereum Sepolia
    137: '🟣', // Polygon
    10: '🔴', // Optimism
    42161: '🔵', // Arbitrum
  };
  
  return icons[chainId] || '⚡';
}

// Convert wei to ether
export function weiToEther(wei: string | number): number {
  const weiValue = typeof wei === 'string' ? parseFloat(wei) : wei;
  return weiValue / 1e18;
}

// Convert ether to wei
export function etherToWei(ether: string | number): string {
  const etherValue = typeof ether === 'string' ? parseFloat(ether) : ether;
  return (etherValue * 1e18).toString();
}

// Sleep function for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
}

// Local storage helpers with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  },
  
  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }
};

// URL helpers
export const url = {
  // Add query params to URL
  addParams: (baseUrl: string, params: Record<string, string | number>): string => {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });
    return url.toString();
  },
  
  // Get query param from current URL
  getParam: (param: string): string | null => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },
  
  // Update URL without page reload
  updateParam: (param: string, value: string): void => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url.toString());
  }
};

// Type guards
export const is = {
  string: (value: any): value is string => typeof value === 'string',
  number: (value: any): value is number => typeof value === 'number' && !isNaN(value),
  boolean: (value: any): value is boolean => typeof value === 'boolean',
  object: (value: any): value is object => typeof value === 'object' && value !== null,
  array: (value: any): value is any[] => Array.isArray(value),
  function: (value: any): value is Function => typeof value === 'function',
  undefined: (value: any): value is undefined => typeof value === 'undefined',
  null: (value: any): value is null => value === null,
  promise: (value: any): value is Promise<any> => value instanceof Promise
};
