// src/app/api/provers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Инициализация Supabase клиента
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fallback данные (если БД недоступна)
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
  },
  {
    id: 'prover-002',
    nickname: 'ZK_Beast_2024',
    gpu_model: 'RTX 3080',
    location: 'EU-West',
    status: 'online',
    reputation_score: 4.9,
    total_orders: 203,
    successful_orders: 199,
    earnings_usd: 3921.75,
    last_seen: new Date().toISOString(),
  },
  {
    id: 'prover-003',
    nickname: 'ProofMaster',
    gpu_model: 'RTX 4080',
    location: 'Asia-Pacific',
    status: 'offline',
    reputation_score: 4.7,
    total_orders: 89,
    successful_orders: 85,
    earnings_usd: 1654.25,
    last_seen: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'prover-004',
    nickname: 'TurboProver',
    gpu_model: 'RTX 3090',
    location: 'US-West',
    status: 'online',
    reputation_score: 4.6,
    total_orders: 67,
    successful_orders: 63,
    earnings_usd: 1289.80,
    last_seen: new Date().toISOString(),
  },
  {
    id: 'prover-005',
    nickname: 'ZeroKnowledge_X',
    gpu_model: 'RTX 4070',
    location: 'EU-Central',
    status: 'maintenance',
    reputation_score: 4.5,
    total_orders: 134,
    successful_orders: 128,
    earnings_usd: 2341.90,
    last_seen: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'prover-006',
    nickname: 'CryptoGuru_2024',
    gpu_model: 'RTX 3070',
    location: 'Canada-East',
    status: 'online',
    reputation_score: 4.4,
    total_orders: 45,
    successful_orders: 42,
    earnings_usd: 892.15,
    last_seen: new Date().toISOString(),
  },
  {
    id: 'prover-007',
    nickname: 'ProofWizard',
    gpu_model: 'RTX 4060',
    location: 'Australia',
    status: 'offline',
    reputation_score: 4.3,
    total_orders: 78,
    successful_orders: 73,
    earnings_usd: 1456.70,
    last_seen: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'prover-008',
    nickname: 'zkSNARK_King',
    gpu_model: 'RTX 3060',
    location: 'Japan',
    status: 'online',
    reputation_score: 4.2,
    total_orders: 91,
    successful_orders: 87,
    earnings_usd: 1734.35,
    last_seen: new Date().toISOString(),
  },
];

// Функция поиска в fallback данных
function searchFallbackProvers(query: string, filters: any = {}) {
  let results = fallbackProvers;

  if (query) {
    const searchQuery = query.toLowerCase();
    results = results.filter(prover =>
      prover.nickname.toLowerCase().includes(searchQuery) ||
      prover.id.toLowerCase().includes(searchQuery) ||
      prover.gpu_model.toLowerCase().includes(searchQuery) ||
      prover.location.toLowerCase().includes(searchQuery)
    );
  }

  // Применение фильтров
  if (filters.status && filters.status !== 'all') {
    results = results.filter(prover => prover.status === filters.status);
  }

  if (filters.gpu && filters.gpu !== 'all') {
    results = results.filter(prover => 
      prover.gpu_model.toLowerCase().includes(filters.gpu.toLowerCase())
    );
  }

  if (filters.location && filters.location !== 'all') {
    results = results.filter(prover => 
      prover.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  return results;
}

// GET - Получение проверов с поиском и фильтрами
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const status = searchParams.get('status') || 'all';
  const gpu = searchParams.get('gpu') || 'all';
  const location = searchParams.get('location') || 'all';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    // Построение запроса с фильтрами
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

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      source: 'supabase',
    });

  } catch (error) {
    console.error('Supabase error:', error);
    
    // Fallback на тестовые данные
    const fallbackResults = searchFallbackProvers(query, { status, gpu, location });
    const total = fallbackResults.length;
    const paginatedResults = fallbackResults.slice(offset, offset + limit);

    return NextResponse.json({
      success: false,
      error: 'Database connection failed, using fallback data',
      data: paginatedResults,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      source: 'fallback-data',
    });
  }
}

// POST - Регистрация нового провера
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname, gpu_model, location } = body;

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
