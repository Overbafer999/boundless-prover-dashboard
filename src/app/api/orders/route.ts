import { NextResponse } from 'next/server'

export async function GET() {
  const orders = [
    {
      id: '1',
      status: 'active',
      reward: 125.50,
      prover: 'Prover Alpha',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      status: 'pending',
      reward: 89.25,
      createdAt: new Date().toISOString(),
    }
  ]
  
  return NextResponse.json(orders)
}
