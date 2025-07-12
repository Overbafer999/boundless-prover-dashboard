import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, getContract, formatEther, parseAbiItem } from 'viem';
import { base } from 'viem/chains';

// Инициализация Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Boundless Protocol конфигурация
const BOUNDLESS_CONTRACT_ADDRESS = '0x26759dbB201aFbA361Bec78E097Aa3942B0b4AB8' as `0x${string}`
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

// ABI для Boundless Market Contract
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
  // События для парсинга
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'requestId', type: 'bytes32' },
      { indexed: true, name: 'prover', type: 'address' },
      { indexed: false, name: 'request', type: 'tuple', components: [] },
      { indexed: false, name: 'clientSignature', type: 'bytes' }
    ],
    name: 'RequestLocked',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'requestId', type: 'bytes32' },
      { indexed: true, name: 'prover', type: 'address' },
      { indexed: false, name: 'fulfillment', type: 'tuple', components: [] }
    ],
    name: 'RequestFulfilled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'requestId', type: 'bytes32' },
      { indexed: false, name: 'stakeBurned', type: 'uint256' },
      { indexed: false, name: 'stakeTransferred', type: 'uint256' },
      { indexed: false, name: 'stakeRecipient', type: 'address' }
    ],
    name: 'ProverSlashed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'account', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' }
    ],
    name: 'StakeDeposit',
    type: 'event'
  }
] as const

// НОВАЯ функция: парсинг реальных событий из Boundless Protocol
async function parseBlockchainEvents() {
  try {
    console.log('🔍 Parsing Boundless Protocol events...')
    
    // Получаем последние 10000 блоков (примерно 1-2 дня на Base)
    const latestBlock = await publicClient.getBlockNumber()
    const fromBlock = latestBlock > BigInt(10000) ? latestBlock - BigInt(10000) : BigInt(0)
    
    // Парсим события RequestFulfilled для активных проверов
    const requestFulfilledLogs = await publicClient.getLogs({
      address: BOUNDLESS_CONTRACT_ADDRESS,
      event: parseAbiItem('event RequestFulfilled(bytes32 indexed requestId, address indexed prover, tuple fulfillment)'),
      fromBlock,
      toBlock: 'latest'
    })
    
    // Парсим события RequestLocked
    const requestLockedLogs = await publicClient.getLogs({
      address: BOUNDLESS_CONTRACT_ADDRESS,
      event: parseAbiItem('event RequestLocked(bytes32 indexed requestId, address indexed prover, tuple request, bytes clientSignature)'),
      fromBlock,
      toBlock: 'latest'
    })
    
    // Парсим события StakeDeposit для определения активных стейкеров
    const stakeDepositLogs = await publicClient.getLogs({
      address: BOUNDLESS_CONTRACT_ADDRESS,
      event: parseAbiItem('event StakeDeposit(address indexed account, uint256 value)'),
      fromBlock,
      toBlock: 'latest'
    })
    
    // Парсим события ProverSlashed
    const slashedLogs = await publicClient.getLogs({
      address: BOUNDLESS_CONTRACT_ADDRESS,
      event: parseAbiItem('event ProverSlashed(bytes32 indexed requestId, uint256 stakeBurned, uint256 stakeTransferred, address stakeRecipient)'),
      fromBlock,
      toBlock: 'latest'
    })
    
    console.log(`📊 Found events:`, {
      fulfilled: requestFulfilledLogs.length,
      locked: requestLockedLogs.length,
      stakeDeposits: stakeDepositLogs.length,
      slashed: slashedLogs.length
    })
    
    // Собираем уникальные адреса проверов
    const proverAddresses = new Set<string>()
    
    // Добавляем проверов из выполненных заказов
    requestFulfilledLogs.forEach(log => {
      if (log.args?.prover) {
        proverAddresses.add(log.args.prover.toLowerCase())
      }
    })
    
    // Добавляем проверов из заблокированных заказов
    requestLockedLogs.forEach(log => {
      if (log.args?.prover) {
        proverAddresses.add(log.args.prover.toLowerCase())
      }
    })
    
    // Добавляем стейкеров
    stakeDepositLogs.forEach(log => {
      if (log.args?.account) {
        proverAddresses.add(log.args.account.toLowerCase())
      }
    })
    
    console.log(`👥 Found ${proverAddresses.size} unique prover addresses`)
    
    // Создаем статистику по каждому проверу
    const proverStats = new Map()
    
    Array.from(proverAddresses).forEach(address => {
      const fulfilled = requestFulfilledLogs.filter(log => 
        log.args?.prover?.toLowerCase() === address
      ).length
      
      const locked = requestLockedLogs.filter(log => 
        log.args?.prover?.toLowerCase() === address
      ).length
      
      const slashes = slashedLogs.filter(log => {
        // Проверяем если этот провер был наказан
        const requestId = log.args?.requestId
        const relatedRequest = requestLockedLogs.find(reqLog => 
          reqLog.args?.requestId === requestId && 
          reqLog.args?.prover?.toLowerCase() === address
        )
        return !!relatedRequest
      }).length
      
      const lastActivity = Math.max(
        ...requestFulfilledLogs
          .filter(log => log.args?.prover?.toLowerCase() === address)
          .map(log => Number(log.blockNumber)),
        ...requestLockedLogs
          .filter(log => log.args?.prover?.toLowerCase() === address)
          .map(log => Number(log.blockNumber)),
        0
      )
      
      proverStats.set(address, {
        address,
        total_orders: locked,
        successful_orders: fulfilled,
        slashes,
        last_activity_block: lastActivity,
        reputation_score: locked > 0 ? ((fulfilled - slashes) / locked * 5).toFixed(1) : 0,
        success_rate: locked > 0 ? ((fulfilled / locked) * 100).toFixed(1) : 0
      })
    })
    
    return proverStats
    
  } catch (error) {
    console.error('❌ Error parsing blockchain events:', error)
    return new Map()
  }
}

// ОБНОВЛЕННАЯ функция обогащения blockchain данными
async function enrichWithBlockchainData(provers: any[], includeRealData = false, searchQuery = '') {
  let realProverStats = new Map()
  
  // Если запрошены реальные данные - парсим события
  if (includeRealData) {
    realProverStats = await parseBlockchainEvents()
  }
  
  const contract = getContract({
    address: BOUNDLESS_CONTRACT_ADDRESS,
    abi: BOUNDLESS_MARKET_ABI,
    client: publicClient
  })
  
  const enrichedProvers = await Promise.all(
    provers.map(async (prover) => {
      if (prover.blockchain_address) {
        try {
          const address = prover.blockchain_address.toLowerCase()
          
          // Получаем балансы
          const ethBalance = await contract.read.balanceOf([prover.blockchain_address as `0x${string}`])
          const stakeBalance = await contract.read.balanceOfStake([prover.blockchain_address as `0x${string}`])
          
          // Обогащаем реальными данными из блокчейна
          const realStats = realProverStats.get(address)
          
          return {
            ...prover,
            // Blockchain данные
            blockchain_verified: true,
            eth_balance: formatEther(ethBalance),
            stake_balance: formatEther(stakeBalance),
            is_active_onchain: Number(stakeBalance) > 0,
            
            // Реальная статистика (если доступна)
            ...(realStats && {
              total_orders: realStats.total_orders,
              successful_orders: realStats.successful_orders,
              reputation_score: parseFloat(realStats.reputation_score),
              success_rate: parseFloat(realStats.success_rate),
              slashes: realStats.slashes,
              onchain_activity: true,
              status: Number(stakeBalance) > 0 ? 'online' : 'offline'
            }),
            
            last_blockchain_check: new Date().toISOString()
          }
        } catch (error) {
          console.error(`❌ Blockchain check failed for ${prover.id}:`, error)
          return {
            ...prover,
            blockchain_verified: false,
            blockchain_error: 'Unable to verify on chain'
          }
        }
      }
      
      return prover
    })
  )
  
  // Если включены реальные данные, добавляем найденных проверов из блокчейна
  if (includeRealData && realProverStats.size > 0) {
    console.log(`🔗 Adding ${realProverStats.size} real blockchain provers`)
    
    const existingAddresses = new Set(
      enrichedProvers
        .filter(p => p.blockchain_address)
        .map(p => p.blockchain_address.toLowerCase())
    )
    
    // Добавляем новых проверов найденных в блокчейне
    realProverStats.forEach((stats, address) => {
      if (!existingAddresses.has(address)) {
        enrichedProvers.push({
          id: `blockchain-${address.slice(2, 8)}`,
          nickname: `Prover_${address.slice(2, 8)}`,
          blockchain_address: address,
          blockchain_verified: true,
          onchain_activity: true,
          gpu_model: 'Unknown GPU',
          location: 'Unknown',
          earnings_usd: 0,
          ...stats,
          status: 'online',
          last_seen: new Date().toISOString(),
          source: 'blockchain_discovery'
        })
      }
    })
  }
  
  // НОВЫЙ КОД: Прямой поиск по адресу
  if (searchQuery && searchQuery.match(/^0x[a-fA-F0-9]{40}$/)) {
    console.log('🔍 Direct address search:', searchQuery)
    
    const address = searchQuery.toLowerCase()
    
    // Проверяем не добавили ли уже этот адрес
    const alreadyExists = enrichedProvers.some(p => 
      p.blockchain_address?.toLowerCase() === address
    )
    
    if (!alreadyExists) {
      try {
        // Получаем балансы для введенного адреса
        const ethBalance = await contract.read.balanceOf([searchQuery as `0x${string}`])
        const stakeBalance = await contract.read.balanceOfStake([searchQuery as `0x${string}`])
        
        // Добавляем найденного провера
        enrichedProvers.push({
          id: `direct-${address.slice(2, 8)}`,
          nickname: `Prover_${address.slice(2, 8)}`,
          blockchain_address: address,
          blockchain_verified: true,
          eth_balance: formatEther(ethBalance),
          stake_balance: formatEther(stakeBalance),
          is_active_onchain: Number(stakeBalance) > 0,
          status: Number(stakeBalance) > 0 ? 'online' : 'offline',
          gpu_model: 'Unknown GPU',
          location: 'Unknown',
          earnings_usd: 0,
          total_orders: 0,
          successful_orders: 0,
          reputation_score: 0,
          last_seen: new Date().toISOString(),
          source: 'direct_address_lookup'
        })
        
        console.log('✅ Direct address found and added!')
      } catch (error) {
        console.error('❌ Direct address lookup failed:', error)
      }
    }
  }
  
  return enrichedProvers
}

// Твоя существующая функция поиска (сохраняем как есть)
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
      earnings_usd: 1654.25,
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
      last_seen: new Date(Date.now() - 1800000).toISOString()
    }
  ]
  
  if (!query && Object.keys(filters).length === 0) {
    return fallbackProvers
  }
  
  return fallbackProvers.filter(prover => {
    const matchesQuery = !query || 
      prover.nickname.toLowerCase().includes(query.toLowerCase()) ||
      prover.gpu_model.toLowerCase().includes(query.toLowerCase()) ||
      prover.location.toLowerCase().includes(query.toLowerCase()) ||
      (prover.blockchain_address && prover.blockchain_address.toLowerCase().includes(query.toLowerCase()))
    
    const matchesStatus = !filters.status || filters.status === 'all' || prover.status === filters.status
    const matchesGpu = !filters.gpu || filters.gpu === 'all' || prover.gpu_model.toLowerCase().includes(filters.gpu.toLowerCase())
    const matchesLocation = !filters.location || filters.location === 'all' || prover.location.toLowerCase().includes(filters.location.toLowerCase())
    
    return matchesQuery && matchesStatus && matchesGpu && matchesLocation
  })
}

// ОБНОВЛЕННАЯ GET функция
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const status = searchParams.get('status') || 'all';
  const gpu = searchParams.get('gpu') || 'all';
  const location = searchParams.get('location') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  
  // НОВЫЕ параметры
  const includeBlockchain = searchParams.get('blockchain') === 'true';
  const includeRealData = searchParams.get('realdata') === 'true';
  
  try {
    console.log(`🚀 API Request: blockchain=${includeBlockchain}, realdata=${includeRealData}, query="${query}"`)
    
    // Суpabase запрос (твой существующий код)
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

    if (error) {
      throw error;
    }

    let finalData = data || [];

    // Обогащаем blockchain данными
    if (includeBlockchain) {
      try {
        finalData = await enrichWithBlockchainData(finalData, includeRealData, query);
      } catch (blockchainError) {
        console.error('❌ Blockchain enrichment failed:', blockchainError);
      }
    }

    return NextResponse.json({
      success: true,
      data: finalData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      source: includeBlockchain ? 
        (includeRealData ? 'supabase+blockchain+realdata' : 'supabase+blockchain') : 
        'supabase',
      blockchain_enabled: includeBlockchain,
      real_data_enabled: includeRealData
    });

  } catch (error) {
    console.error('❌ Supabase error:', error);
    
    // Fallback на тестовые данные
    const fallbackResults = searchFallbackProvers(query, { status, gpu, location });
    let finalData = fallbackResults.slice(offset, offset + limit);

    // Обогащаем blockchain данными даже в fallback
    if (includeBlockchain) {
      try {
        finalData = await enrichWithBlockchainData(finalData, includeRealData, query);
      } catch (blockchainError) {
        console.error('❌ Blockchain enrichment failed in fallback:', blockchainError);
      }
    }

    const total = fallbackResults.length;

    return NextResponse.json({
      success: false,
      error: 'Database connection failed, using fallback data',
      data: finalData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      source: includeBlockchain ? 
        (includeRealData ? 'fallback+blockchain+realdata' : 'fallback+blockchain') : 
        'fallback-data',
      blockchain_enabled: includeBlockchain,
      real_data_enabled: includeRealData
    });
  }
}

// Твоя POST функция остается без изменений
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, gpu_model, location, blockchain_address } = body;

    if (!nickname || !gpu_model || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: nickname, gpu_model, location' },
        { status: 400 }
      );
    }

    const id = `prover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      const { data: existingProvers } = await supabase
        .from('provers')
        .select('id')
        .eq('nickname', nickname)
        .limit(1);

      if (existingProvers && existingProvers.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Nickname already exists' },
          { status: 409 }
        );
      }

      const { data, error } = await supabase
        .from('provers')
        .insert([{
          id,
          nickname,
          gpu_model,
          location,
          blockchain_address,
          status: 'offline',
          reputation_score: 0.00,
          total_orders: 0,
          successful_orders: 0,
          earnings_usd: 0.00,
          last_seen: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        data,
        source: 'supabase',
      });

    } catch (dbError) {
      console.error('❌ Supabase error during registration:', dbError);
      
      return NextResponse.json(
        { success: false, error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('❌ POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
