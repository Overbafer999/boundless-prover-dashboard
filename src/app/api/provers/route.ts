import { NextResponse } from 'next/server'

export async function GET() {
  const provers = [
    {
      id: '1',
      name: 'Prover Alpha',
      status: 'online',
      earnings: 1250.50,
      uptime: 98.5,
      gpu: 'RTX 4090',
      location: 'US-East'
    },
    {
      id: '2',
      name: 'Prover Beta', 
      status: 'proving',
      earnings: 890.25,
      uptime: 94.2,
      gpu: 'RTX 3080',
      location: 'EU-West'
    }
  ]
  
  return NextResponse.json(provers)
}
