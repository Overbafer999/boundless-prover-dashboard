import { NextResponse } from 'next/server'

export async function GET() {
  const provers = [
    {
      id: 'prover-001',
      name: 'Prover Alpha',
      status: 'online',
      earnings: 1250.50,
      hashRate: 1250,  // Добавил hashRate для фронтенда
      uptime: 98.5,
      gpu: 'RTX 4090',
      location: 'US-East',
      lastActive: new Date().toISOString()  // Добавил lastActive
    },
    {
      id: 'prover-002',
      name: 'Prover Beta', 
      status: 'busy',  // Изменил с 'proving' на 'busy' (фронтенд ожидает)
      earnings: 890.25,
      hashRate: 890,
      uptime: 94.2,
      gpu: 'RTX 3080',
      location: 'EU-West',
      lastActive: new Date().toISOString()
    },
    {
      id: 'prover-003',
      name: 'Prover Gamma',
      status: 'offline',  // Добавил offline провер
      earnings: 654.75,
      hashRate: 0,
      uptime: 87.3,
      gpu: 'RTX 3070',
      location: 'Asia-Pacific',
      lastActive: new Date(Date.now() - 1800000).toISOString() // 30 мин назад
    }
  ]
  
  return NextResponse.json(provers)
}
