import { NextResponse } from 'next/server'

export async function GET() {
  const orders = [
    {
      id: '#1',  // Добавил # для соответствия фронтенду
      status: 'processing',  // Изменил с 'active' на 'processing'
      reward: 125.50,
      prover: 'Prover Alpha',
      createdAt: new Date().toISOString(),
      priority: 'high'  // Добавил priority
    },
    {
      id: '#2',
      status: 'pending',  // Оставил как есть
      reward: 89.25,
      createdAt: new Date().toISOString(),
      priority: 'medium'
    },
    {
      id: '#3',
      status: 'completed',  // Добавил completed заказ
      reward: 234.75,
      prover: 'Prover Beta',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 час назад
      priority: 'low'
    }
  ]
  
  return NextResponse.json(orders)
}
