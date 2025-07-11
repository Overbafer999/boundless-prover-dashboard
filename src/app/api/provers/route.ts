import { NextResponse } from 'next/server'

// Симуляция реальных данных (позже подключите к базе данных)
async function fetchRealProverData() {
  // В реальном приложении здесь будет:
  // - Подключение к базе данных
  // - API calls к Boundless Prover системе
  // - Получение данных из blockchain
  
  return [
    {
      id: 'prover-001',
      name: 'Prover Alpha',
      earnings: Math.round((Math.random() * 2000 + 1000) * 100) / 100, // Случайные заработки
      hashRate: Math.floor(Math.random() * 1000 + 800),
      status: Math.random() > 0.7 ? 'offline' : Math.random() > 0.5 ? 'busy' : 'online',
      lastActive: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 20 + 80), // 80-100%
      gpu: 'RTX 4090',
      location: 'US-East'
    },
    {
      id: 'prover-002', 
      name: 'Prover Beta',
      earnings: Math.round((Math.random() * 1500 + 500) * 100) / 100,
      hashRate: Math.floor(Math.random() * 800 + 600),
      status: Math.random() > 0.7 ? 'offline' : Math.random() > 0.5 ? 'busy' : 'online',
      lastActive: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 20 + 80),
      gpu: 'RTX 3080',
      location: 'EU-West'
    },
    {
      id: 'prover-003',
      name: 'Prover Gamma', 
      earnings: Math.round((Math.random() * 1200 + 300) * 100) / 100,
      hashRate: Math.random() > 0.6 ? Math.floor(Math.random() * 600 + 400) : 0, // Может быть offline
      status: Math.random() > 0.6 ? 'offline' : Math.random() > 0.5 ? 'busy' : 'online',
      lastActive: new Date(Date.now() - Math.random() * 1800000).toISOString(), // До 30 мин назад
      uptime: Math.floor(Math.random() * 30 + 70), // 70-100%
      gpu: 'RTX 3070',
      location: 'Asia-Pacific'
    },
    {
      id: 'prover-004',
      name: 'Prover Delta',
      earnings: Math.round((Math.random() * 800 + 200) * 100) / 100,
      hashRate: Math.floor(Math.random() * 500 + 300),
      status: Math.random() > 0.8 ? 'offline' : Math.random() > 0.4 ? 'busy' : 'online',
      lastActive: new Date().toISOString(),
      uptime: Math.floor(Math.random() * 25 + 75),
      gpu: 'RTX 4070',
      location: 'US-West'
    }
  ]
}

export async function GET() {
  try {
    const provers = await fetchRealProverData()
    
    // Добавляем метаданные для отладки
    const response = {
      success: true,
      data: provers,
      timestamp: new Date().toISOString(),
      source: 'boundless-prover-api',
      total: provers.length,
      active: provers.filter(p => p.status !== 'offline').length,
      totalEarnings: provers.reduce((sum, p) => sum + p.earnings, 0),
      totalHashRate: provers.reduce((sum, p) => sum + p.hashRate, 0)
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Provers API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch prover data',
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
