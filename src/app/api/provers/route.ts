// src/app/api/provers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, getContract, formatEther, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import * as cheerio from 'cheerio';

// --- SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- BLOCKCHAIN
const BOUNDLESS_CONTRACT_ADDRESS = '0x26759dbB201aFbA361Bec78E097Aa3942B0b4AB8' as `0x${string}`;
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
});
const BOUNDLESS_MARKET_ABI = [
  { inputs: [{ name: 'addr', type: 'address' }], name: 'balanceOf', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
  { inputs: [{ name: 'addr', type: 'address' }], name: 'balanceOfStake', outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' }
] as const;

// --- КЕШ
const CACHE_DURATION = 30000;
const blockchainCache: any = { lastUpdate: 0, data: null, dashboardStats: {}, searchResults: {}, proverPages: {} };

// --- CONSTS
const TIMEFRAME_BLOCKS = { '1d': 43200, '3d': 129600, '1w': 302400 };

// --- FALLBACK DATA
function searchFallbackProvers(query: string, filters: any = {}) {
  const fallbackProvers = [
    {
      id: 'prover-001',
      nickname: 'CryptoMiner_Pro',
      gpu_model: 'RTX 4090',
      location: 'US-East',
      status: 'online',
      reputation_score: 4.8,
      total_orders: 156,
      successful_orders: 152,
      earnings_usd: 2847.50,
      last_seen: new Date().toISOString(),
      blockchain_address: '0xb607e44023f850d5833c0d1a5d62acad3a5b162e'
    },
    {
      id: 'prover-002',
      nickname: 'ZK_Validator_Alpha',
      gpu_model: 'RTX 3080',
      location: 'EU-West',
      status: 'busy',
      reputation_score: 4.2,
      total_orders: 89,
      successful_orders: 86,
      last_seen: new Date().toISOString(),
      blockchain_address: '0x9430ad33b47e2e84bad1285c9d9786ac628800e4'
    },
    {
      id: 'prover-003',
      nickname: 'ProofWorker_X',
      gpu_model: 'RTX 3070',
      location: 'Asia-Pacific',
      status: 'offline',
      reputation_score: 3.9,
      total_orders: 67,
      successful_orders: 61,
      earnings_usd: 987.75,
      last_seen: new Date(Date.now() - 1800000).toISOString(),
      blockchain_address: '0x7f8c8a2d4e1b6c5a3f9e8d7c6b5a4f3e2d1c0b9a'
    }
  ];

  if (!query && Object.keys(filters).length === 0) return fallbackProvers;

  return fallbackProvers.filter(prover => {
    const matchesQuery = !query ||
      prover.nickname.toLowerCase().includes(query.toLowerCase()) ||
      prover.gpu_model.toLowerCase().includes(query.toLowerCase()) ||
      prover.location.toLowerCase().includes(query.toLowerCase()) ||
      (prover.blockchain_address && prover.blockchain_address.toLowerCase().includes(query.toLowerCase()));

    const matchesStatus = !filters.status || filters.status === 'all' || prover.status === filters.status;
    const matchesGpu = !filters.gpu || filters.gpu === 'all' || prover.gpu_model.toLowerCase().includes(filters.gpu.toLowerCase());
    const matchesLocation = !filters.location || filters.location === 'all' || prover.location.toLowerCase().includes(filters.location.toLowerCase());

    return matchesQuery && matchesStatus && matchesGpu && matchesLocation;
  });
}

// --- ПРОВЕР ПАРСЕР
async function parseProverPage(address: string, timeframe: string = '1w') {
  try {
    const timeframeMap: any = { '1d': '24h', '3d': '3d', '7d': '7d', '1w': '7d' };
    const url = `https://explorer.beboundless.xyz/provers?period=${timeframeMap[timeframe] || '24h'}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'text/html',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    if (!response.ok) return emptyResult('http_error', url, response.status, address, timeframe);

    const html = await response.text();
    const searchAddress = address.toLowerCase();
    const shortAddress = `${searchAddress.slice(0, 6)}…${searchAddress.slice(-4)}`;
    let rowHtml: string | null = null;

    // Поиск через Cheerio
    {
      const $ = cheerio.load(html);
      $('tr').each((_, el) => {
        const row = $(el).html() || '';
        if (row.includes(searchAddress) || row.includes(shortAddress)) {
          rowHtml = $(el).prop('outerHTML');
          return false; // break
        }
      });
      // Fallback если Cheerio не нашёл
      if (!rowHtml) {
        const idx = html.toLowerCase().indexOf(searchAddress);
        if (idx !== -1) {
          const before = html.substring(0, idx);
          const after = html.substring(idx);
          const trStart = before.lastIndexOf('<tr');
          const trEnd = after.indexOf('</tr>');
          if (trStart !== -1 && trEnd !== -1) {
            rowHtml = html.substring(trStart, idx + trEnd + 5);
          }
        }
      }
    }

    if (!rowHtml) return emptyResult('row_extraction_failed', url, response.status, address, timeframe);

    // Парсим значения из строки
    const $ = cheerio.load(rowHtml);
    const cells = $('td');

    let ordersText = cells.eq(2).text().trim();
    let orders = 0;
    if (/([0-9.]+)K/i.test(ordersText)) orders = Math.round(parseFloat(ordersText) * 1000);
    else if (/([0-9.]+)M/i.test(ordersText)) orders = Math.round(parseFloat(ordersText) * 1_000_000);
    else orders = parseInt(ordersText.replace(/\D/g, ''), 10) || 0;

    const ethEarnings = parseFloat((cells.eq(4).text().match(/([\d.]+)/)?.[1] || '0')) || 0;
    const usdcEarnings = parseFloat((cells.eq(5).text().match(/([\d.]+)/)?.[1] || '0')) || 0;
    const peakMHz = parseFloat(cells.eq(7).text().replace('MHz', '').replace(/,/g, '').trim()) || 0;
    const successRate = parseFloat(cells.eq(8).text().replace('%', '').replace(/,/g, '').trim()) || 0;

    return {
      orders_taken: orders,
      order_earnings_eth: ethEarnings,
      order_earnings_usd: usdcEarnings,
      peak_mhz: peakMHz,
      success_rate: successRate,
      source: 'real_prover_table_parsing',
      rawData: {
        fetchedUrl: url,
        responseStatus: response.status,
        htmlLength: html.length,
        timeframe,
        searchedAddress: address,
        foundInTable: true,
        extractedValues: {
          ordersTaken: ordersText,
          orderEarningsETH: cells.eq(4).text().trim(),
          orderEarningsUSDC: cells.eq(5).text().trim(),
          peakMHz: cells.eq(7).text().trim(),
          successRate: cells.eq(8).text().trim()
        }
      }
    };
  } catch (error) {
    return emptyResult('parsing_error', '', 0, address, timeframe, error);
  }
}
function emptyResult(source: string, url: string, status: number, address: string, timeframe: string, error?: any) {
  return {
    orders_taken: 0,
    order_earnings_eth: 0,
    order_earnings_usd: 0,
    peak_mhz: 0,
    success_rate: 0,
    source,
    rawData: {
      fetchedUrl: url,
      responseStatus: status,
      timeframe,
      searchedAddress: address,
      foundInTable: false,
      error: error?.message || error || ''
    }
  };
}

// --- MAIN API HANDLER
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const status = searchParams.get('status') || 'all';
  const gpu = searchParams.get('gpu') || 'all';
  const location = searchParams.get('location') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  const includeBlockchain = searchParams.get('blockchain') === 'true';
  const includeRealData = searchParams.get('realdata') === 'true';
  const timeframe = searchParams.get('timeframe') || '1d';

  try {
    // --- 1. Поиск по адресу (explorer)
    if (query && query.length === 42 && query.startsWith('0x')) {
      const proverPageData = await parseProverPage(query, timeframe);

      if (proverPageData && proverPageData.source !== 'parsing_error') {
        const realProver = {
          id: `prover-${query.slice(-8)}`,
          nickname: `ZK_Validator_${query.slice(-4).toUpperCase()}`,
          gpu_model: 'NVIDIA RTX Series',
          location: 'Network Node',
          status: (proverPageData.success_rate || 0) > 50 ? 'online' : 'offline',
          reputation_score: (proverPageData.success_rate || 0) > 90 ? 4.5 : 3.8,

          total_orders: (proverPageData.orders_taken || 0),
          successful_orders: Math.floor((proverPageData.orders_taken || 0) * ((proverPageData.success_rate || 0) / 100)),
          earnings_eth: (proverPageData.order_earnings_eth || 0),
          earnings_usd: (proverPageData.order_earnings_usd || 0),
          earnings_usd_total: ((proverPageData.order_earnings_eth || 0) * 3200) + (proverPageData.order_earnings_usd || 0),

          hash_rate: proverPageData.peak_mhz,
          hashRate: (proverPageData.peak_mhz || 0),
          uptime: proverPageData.success_rate,
          uptime_numeric: (proverPageData.success_rate || 0),
          last_seen: new Date().toISOString(),
          blockchain_address: query.toLowerCase(),
          blockchain_verified: true,
          data_source: 'real_prover_page_parsing',
          regular_balance: proverPageData.order_earnings_usd,
          last_active: new Date().toISOString(),
          raw_parsed_data: proverPageData
        };

        return NextResponse.json({
          success: true,
          data: [realProver],
          pagination: { page: 1, limit: 1, total: 1, totalPages: 1 },
          source: 'real_prover_page_data',
          blockchain_enabled: includeBlockchain,
          real_data_enabled: includeRealData,
          timeframe,
          timestamp: Date.now(),
          prover_page_data: proverPageData
        });
      }

      // --- 2. Fallback на blockchain если не получилось с explorer
      if (includeBlockchain) {
        try {
          const contract = getContract({ address: BOUNDLESS_CONTRACT_ADDRESS, abi: BOUNDLESS_MARKET_ABI, client: publicClient });
          const [stakeBalance, regularBalance] = await Promise.all([
            contract.read.balanceOfStake([query as `0x${string}`]).catch(() => BigInt(0)),
            contract.read.balanceOf([query as `0x${string}`]).catch(() => BigInt(0))
          ]);
          if (Number(stakeBalance) > 0 || Number(regularBalance) > 0) {
            return NextResponse.json({
              success: true,
              data: [{
                id: `prover-${query.slice(-8)}`,
                nickname: `ZK_Validator_${query.slice(-4)}`,
                gpu_model: Number(stakeBalance) > 0 ? 'High-Performance GPU' : 'Standard GPU',
                location: 'Boundless Network',
                status: Number(stakeBalance) > 0 ? 'active' : 'inactive',
                reputation_score: 4.0,
                total_orders: 0,
                successful_orders: 0,
                earnings_usd: 0,
                hash_rate: 0,
                uptime: 'N/A',
                last_seen: new Date().toISOString(),
                blockchain_address: query.toLowerCase(),
                blockchain_verified: true,
                stake_balance: formatEther(stakeBalance),
                regular_balance: formatEther(regularBalance),
                last_activity: 'Unknown'
              }],
              pagination: { page: 1, limit: 1, total: 1, totalPages: 1 },
              source: 'blockchain_verified',
              blockchain_enabled: includeBlockchain,
              real_data_enabled: includeRealData,
              timeframe,
              timestamp: Date.now()
            });
          }
        } catch (blockchainError) {
          // do nothing, fallback to next method
        }
      }
    }

    // --- 3. Supabase (все остальные случаи)
    let queryBuilder = supabase.from('provers').select('*', { count: 'exact' });
    if (query) queryBuilder = queryBuilder.or(
      `nickname.ilike.%${query}%,id.ilike.%${query}%,gpu_model.ilike.%${query}%,location.ilike.%${query}%,blockchain_address.ilike.%${query}%`
    );
    if (status !== 'all') queryBuilder = queryBuilder.eq('status', status);
    if (gpu !== 'all') queryBuilder = queryBuilder.ilike('gpu_model', `%${gpu}%`);
    if (location !== 'all') queryBuilder = queryBuilder.ilike('location', `%${location}%`);
    const { data, count, error } = await queryBuilder
      .order('status', { ascending: false })
      .order('reputation_score', { ascending: false })
      .order('last_seen', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    if (data && data.length > 0) {
      return NextResponse.json({
        success: true,
        data,
        pagination: {
          page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit)
        },
        source: 'supabase_fallback',
        blockchain_enabled: includeBlockchain,
        real_data_enabled: includeRealData,
        timeframe,
        timestamp: Date.now()
      });
    }

    // --- 4. Final fallback (жёстко подделанные примеры)
    const fallbackResults = searchFallbackProvers(query, { status, gpu, location });
    const finalData = fallbackResults.slice(offset, offset + limit);
    const total = fallbackResults.length;
    return NextResponse.json({
      success: false,
      error: 'All data sources failed, using final fallback',
      data: finalData,
      pagination: {
        page, limit, total, totalPages: Math.ceil(total / limit)
      },
      source: `final_fallback_data_${timeframe}`,
      blockchain_enabled: includeBlockchain,
      real_data_enabled: includeRealData,
      timeframe,
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      source: 'api_error',
      blockchain_enabled: includeBlockchain,
      real_data_enabled: includeRealData,
      timeframe,
      timestamp: Date.now()
    });
  }
}
