import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createPublicClient, http, getContract, formatEther } from 'viem';
import { base } from 'viem/chains';

// Инициализация Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Boundless blockchain клиент
const BOUNDLESS_CONTRACT_ADDRESS = '0x26759dbB201aFbA361Bec78E097Aa3942B0b4AB8'
const publicClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
})

// Твои существующие fallback данные (оставляем как есть)
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
    // Добавляем blockchain данные
    blockchain_address: '0xb607e44023f850d5833c0d1a5d62acad3a5b162e'
  },
  // ... остальные твои данные
];

// Твоя существующая функция поиска (оставляем)
function searchFallbackProvers(query: string, filters: any = {}) {
  // ... твой код остается как есть
}

// НОВАЯ функция для получения blockchain данных
async function enrichWithBlockchainData(provers: any[]) {
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
    }
  ] as const

  const enrichedProvers = await Promise.all(
    provers.map(async (prover) => {
      // Если есть blockchain адрес - обогащаем данными
      if (prover.blockchain_address) {
        try {
          const contract = getContract({
            address: BOUNDLESS_CONTRACT_ADDRESS,
            abi: BOUNDLESS_MARKET_ABI,
            client: publicClient
          })

          const ethBalance = await contract.read.balanceOf([prover.blockchain_address as `0x${string}`])
          const stakeBalance = await contract.read.balanceOfStake([prover.blockchain_address as `0x${string}`])

          return {
            ...prover,
            // Добавляем blockchain данные к существующим
            blockchain_verified: true,
            eth_balance: formatEther(ethBalance),
            stake_balance: formatEther(stakeBalance),
            is_active_onchain: Number(stakeBalance) > 0,
            last_blockchain_check: new Date().toISOString()
          }
        } catch (error) {
          console.error(`Blockchain check failed for ${prover.id}:`, error)
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

  return enrichedProvers
}

// Твоя существующая GET функция (обновляем немного)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const status = searchParams.get('status') || 'all';
  const gpu = searchParams.get('gpu') || 'all';
  const location = searchParams.get('location') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  
  // НОВЫЙ параметр для blockchain проверки
  const includeBlockchain = searchParams.get('blockchain') === 'true';

  try {
    // Твой существующий Supabase код (оставляем как есть)
    let queryBuilder = supabase
      .from('provers')
      .select('*', { count: 'exact' });

    // Поиск по тексту
    if (query) {
      queryBuilder = queryBuilder.or(
        `nickname.ilike.%${query}%,id.ilike.%${query}%,gpu_model.ilike.%${query}%,location.ilike.%${query}%`
      );
    }

    // Фильтры
    if (status !== 'all') {
      queryBuilder = queryBuilder.eq('status', status);
    }

    if (gpu !== 'all') {
      queryBuilder = queryBuilder.ilike('gpu_model', `%${gpu}%`);
    }

    if (location !== 'all') {
      queryBuilder = queryBuilder.ilike('location', `%${location}%`);
    }

    // Сортировка и пагинация
    const { data, count, error } = await queryBuilder
      .order('status', { ascending: false })
      .order('reputation_score', { ascending: false })
      .order('last_seen', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    let finalData = data || [];

    // НОВОЕ: обогащаем blockchain данными если запрошено
    if (includeBlockchain && finalData.length > 0) {
      try {
        finalData = await enrichWithBlockchainData(finalData);
      } catch (blockchainError) {
        console.error('Blockchain enrichment failed:', blockchainError);
        // Продолжаем без blockchain данных
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
      source: includeBlockchain ? 'supabase+blockchain' : 'supabase',
      blockchain_enabled: includeBlockchain
    });

  } catch (error) {
    console.error('Supabase error:', error);
    
    // Fallback на тестовые данные
    const fallbackResults = searchFallbackProvers(query, { status, gpu, location });
    let finalData = fallbackResults.slice(offset, offset + limit);

    // Обогащаем blockchain данными даже в fallback
    if (includeBlockchain) {
      try {
        finalData = await enrichWithBlockchainData(finalData);
      } catch (blockchainError) {
        console.error('Blockchain enrichment failed in fallback:', blockchainError);
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
      source: includeBlockchain ? 'fallback+blockchain' : 'fallback-data',
      blockchain_enabled: includeBlockchain
    });
  }
}

// Твоя существующая POST функция (оставляем как есть)
export async function POST(request: NextRequest) {
  // ... весь твой существующий код остается без изменений
  try {
    const body = await request.json();
    const { nickname, gpu_model, location, blockchain_address } = body; // Добавляем blockchain_address

    // Валидация данных
    if (!nickname || !gpu_model || !location) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: nickname, gpu_model, location' },
        { status: 400 }
      );
    }

    // Генерация уникального ID
    const id = `prover-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Проверка на дубликаты nickname
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

      // Вставка нового провера
      const { data, error } = await supabase
        .from('provers')
        .insert([{
          id,
          nickname,
          gpu_model,
          location,
          blockchain_address, // НОВОЕ поле
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
      console.error('Supabase error during registration:', dbError);
      
      return NextResponse.json(
        { success: false, error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request format' },
      { status: 400 }
    );
  }
}
