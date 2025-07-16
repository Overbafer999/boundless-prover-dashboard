// src/app/api/provers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, getContract, formatEther, parseAbiItem } from 'viem';
import { base } from 'viem/chains';

// Supabase и блокчейн setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BOUNDLESS_CONTRACT_ADDRESS = '0x26759dbB201aFbA361Bec78E097Aa3942B0b4AB8' as `0x${string}`;
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
});

const BOUNDLESS_MARKET_ABI = [
  {
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'addr', type: 'address' }],
    name: 'balanceOfStake',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
] as const;

const TIMEFRAME_BLOCKS = {
  '1d': 43200,
  '3d': 129600,
  '1w': 302400
};

const CACHE_DURATION = 30000;

interface CacheData {
  data: any;
  timestamp: number;
}

interface BlockchainCache {
  lastUpdate: number;
  data: any;
  dashboardStats: { [key: string]: CacheData };
}

const blockchainCache: BlockchainCache = {
  lastUpdate: 0,
  data: null,
  dashboardStats: {}
};

// --- Функция-парсер с Fallback + логами ---
import cheerio from 'cheerio';
async function parseProverPage(address: string, timeframe: string = '1w') {
  try {
   const timeframeMap = {
  '1d': '24h',
  '3d': '3d', 
  '1w': '7d'
} as const;

const mappedTimeframe = timeframeMap[timeframe as keyof typeof timeframeMap] || '24h';
const url = `https://explorer.beboundless.xyz/provers?period=${mappedTimeframe}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    const searchAddress = address.toLowerCase();
    const shortAddress = `${searchAddress.slice(0, 6)}…${searchAddress.slice(-4)}`;

    const html = await response.text();

    // --- DEBUG LOGS ---
    console.log('=== HTML DEBUG START ===');
    console.log('HTML length:', html.length);
    console.log('Search address:', searchAddress);
    console.log('Short address:', shortAddress);
    console.log('Address found in HTML:', html.toLowerCase().includes(searchAddress));
    console.log('HTML sample (first 2000 chars):');
    console.log(html.substring(0, 2000));
    console.log('=== HTML DEBUG END ===');
    if (html.includes('<table')) {
      const tableStart = html.indexOf('<table');
      const tableEnd = html.indexOf('</table>') + 8;
      const tableHtml = html.substring(tableStart, tableEnd);
      console.log('TABLE FOUND, length:', tableHtml.length);
      console.log('Table sample:', tableHtml.substring(0, 1000));
    } else {
      console.log('NO TABLE TAG FOUND');
    }

    // --- Поиск строки: Cheerio + ручной + regex ---
    let rowHtml: string | null = null;

    // Метод 1: Cheerio
    try {
      const $ = cheerio.load(html);
      $('tr').each((_, el) => {
        const row = $(el).html() || '';
        if (row.includes(searchAddress) || row.includes(shortAddress)) {
          rowHtml = $(el).prop('outerHTML');
          return false; // break
        }
      });
    } catch (cheerioError) {
      console.log('❌ Cheerio failed, trying manual parsing', cheerioError);
    }

    // Метод 2: Ручной поиск
    if (!rowHtml) {
      const addressIndex = html.toLowerCase().indexOf(searchAddress);
      if (addressIndex !== -1) {
        const beforeAddress = html.substring(0, addressIndex);
        const afterAddress = html.substring(addressIndex);

        const trStart = beforeAddress.lastIndexOf('<tr');
        const trEnd = afterAddress.indexOf('</tr>');

        if (trStart !== -1 && trEnd !== -1) {
          rowHtml = html.substring(trStart, addressIndex + trEnd + 5);
          console.log('✅ Manual parsing worked, got rowHtml!');
        }
      }
    }

    // Метод 3: Regex
    if (!rowHtml) {
      const rowRegex = new RegExp(`<tr[^>]*>([\\s\\S]*?)${searchAddress.slice(0, 12)}([\\s\\S]*?)</tr>`, 'i');
      const match = html.match(rowRegex);
      if (match) {
        rowHtml = match[0];
        console.log('✅ Regex parsing worked, got rowHtml!');
      }
    }

    if (!rowHtml) {
      console.log('❌ Не нашли rowHtml ни одним методом. HTML-отрывок:', html.substring(0, 2000));
      return {
        orders_taken: 0,
        order_earnings_eth: 0,
        order_earnings_usd: 0,
        peak_mhz: 0,
        success_rate: 0,
        source: 'row_extraction_failed',
        rawData: {}
      };
    }

    // Парсим данные из ячеек строки
    const $ = cheerio.load(rowHtml);
    const cells = $('td');
    const getText = (idx: number) => cells.eq(idx).text().trim();

    let orders = 0;
    let ordersText = getText(2);
    if (/([0-9.]+)K/i.test(ordersText)) {
      orders = Math.round(parseFloat(ordersText) * 1000);
    } else if (/([0-9.]+)M/i.test(ordersText)) {
      orders = Math.round(parseFloat(ordersText) * 1_000_000);
    } else {
      orders = parseInt(ordersText.replace(/\D/g, ''), 10) || 0;
    }

    const ethEarnings = parseFloat((getText(4).match(/([\d.]+)/)?.[1] || '0')) || 0;
    const usdcEarnings = parseFloat((getText(5).match(/([\d.]+)/)?.[1] || '0')) || 0;
    const peakMHz = parseFloat(getText(7).replace('MHz', '').replace(/,/g, '').trim()) || 0;
    const successRate = parseFloat(getText(8).replace('%', '').replace(/,/g, '').trim()) || 0;

    const result = {
      orders_taken: orders,
      order_earnings_eth: ethEarnings,
      order_earnings_usd: usdcEarnings,
      peak_mhz: peakMHz,
      success_rate: successRate,
      source: 'real_prover_table_parsing',
      rawData: {
        ordersText,
        ethEarnings,
        usdcEarnings,
        peakMHz,
        successRate,
        rowHtml
      }
    };
    return result;
  } catch (error) {
    console.error('❌ parseProverPage error:', error);
    return {
      orders_taken: 0,
      order_earnings_eth: 0,
      order_earnings_usd: 0,
      peak_mhz: 0,
      success_rate: 0,
      source: 'parsing_error',
      rawData: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

// --- Остальной код: суть не менялась (супабейз и fallback) ---

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const status = searchParams.get('status') || 'all';
  const gpu = searchParams.get('gpu') || 'all';
  const location = searchParams.get('location') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  const timeframe = searchParams.get('timeframe') || '1w';

  // Fallback data
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
        earnings_usd: 2847.5,
        last_seen: new Date().toISOString(),
        blockchain_address: '0xb607e44023f850d5833c0d1a5d62acad3a5b162e'
      },
    ];
    return fallbackProvers;
  }

  try {
    // Ethereum адрес - парсим с explorer
    if (query && query.length === 42 && query.startsWith('0x')) {
      const proverPageData = await parseProverPage(query, timeframe);
      return NextResponse.json({
        success: true,
        data: [proverPageData],
        pagination: {
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
        },
        source: proverPageData.source,
        timestamp: Date.now(),
      });
    }

    // Супабейз fallback
    let queryBuilder = supabase
      .from('provers')
      .select('*', { count: 'exact' });

    if (query) {
      queryBuilder = queryBuilder.or(
        `nickname.ilike.%${query}%,id.ilike.%${query}%,gpu_model.ilike.%${query}%,location.ilike.%${query}%,blockchain_address.ilike.%${query}%`
      );
    }
    if (status !== 'all') {
      queryBuilder = queryBuilder.eq('status', status);
    }
    if (gpu !== 'all') {
      queryBuilder = queryBuilder.ilike('gpu_model', `%${gpu}%`);
    }
    if (location !== 'all') {
      queryBuilder = queryBuilder.ilike('location', `%${location}%`);
    }

    const { data, count, error } = await queryBuilder
      .order('status', { ascending: false })
      .order('reputation_score', { ascending: false })
      .order('last_seen', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    let finalData = data || [];

    return NextResponse.json({
      success: true,
      data: finalData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      source: 'supabase_fallback',
      timestamp: Date.now(),
    });

  } catch (error) {
    // fallback на фиктивные данные
    const fallbackResults = searchFallbackProvers(query, { status, gpu, location });
    const finalData = fallbackResults.slice(offset, offset + limit);
    const total = fallbackResults.length;

    return NextResponse.json({
      success: false,
      error: 'All data sources failed, using final fallback',
      data: finalData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      source: 'final_fallback_data',
      timestamp: Date.now()
    });
  }
}
