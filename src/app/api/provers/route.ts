// src/app/api/provers/route.ts
import { NextResponse } from 'next/server'
import mysql from 'mysql2/promise'

// Конфигурация базы данных
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'boundless_provers',
  port: parseInt(process.env.DB_PORT || '3306')
}

// Создание подключения к базе данных
async function getConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig)
    return connection
  } catch (error) {
    console.error('Database connection failed:', error)
    throw new Error('Failed to connect to database')
  }
}

// Получение проверов из базы данных
async function fetchProversFromDatabase(searchTerm?: string) {
  const connection = await getConnection()
  
  try {
    let query = `
      SELECT 
        id,
        user_nickname as name,
        gpu_model as gpu,
        location,
        status,
        hash_rate as hashRate,
        total_earnings as earnings,
        uptime_percentage as uptime,
        last_active as lastActive,
        user_wallet as wallet
      FROM provers 
      WHERE status IN ('online', 'busy')
    `
    
    const params: any[] = []
    
    // Добавляем поиск если есть параметр
    if (searchTerm) {
      query += ` AND (
        user_nickname LIKE ? OR 
        id LIKE ? OR 
        gpu_model LIKE ? OR 
        location LIKE ? OR
        user_wallet LIKE ?
      )`
      const searchPattern = `%${searchTerm}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
    }
    
    query += ` ORDER BY last_active DESC`
    
    const [rows] = await connection.execute(query, params)
    return rows as any[]
  } finally {
    await connection.end()
  }
}

// Получение статистики
async function getProverStats() {
  const connection = await getConnection()
  
  try {
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('online', 'busy') THEN 1 END) as active,
        SUM(total_earnings) as totalEarnings,
        SUM(CASE WHEN status IN ('online', 'busy') THEN hash_rate ELSE 0 END) as totalHashRate,
        AVG(uptime_percentage) as avgUptime
      FROM provers
    `)
    
    return (stats as any[])[0]
  } finally {
    await connection.end()
  }
}

export async function GET(request: Request) {
  try {
    // Получаем параметры поиска из URL
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    // Получаем данные из базы
    const [provers, stats] = await Promise.all([
      fetchProversFromDatabase(search || undefined),
      getProverStats()
    ])
    
    const response = {
      success: true,
      data: provers.map(prover => ({
        ...prover,
        lastActive: new Date(prover.lastActive).toISOString(),
        earnings: parseFloat(prover.earnings || 0),
        uptime: parseFloat(prover.uptime || 0),
        hashRate: parseInt(prover.hashRate || 0)
      })),
      stats: {
        total: parseInt(stats.total || 0),
        active: parseInt(stats.active || 0), 
        totalEarnings: parseFloat(stats.totalEarnings || 0),
        totalHashRate: parseInt(stats.totalHashRate || 0),
        avgUptime: parseFloat(stats.avgUptime || 0)
      },
      timestamp: new Date().toISOString(),
      source: 'boundless-database-api',
      searchTerm: search || null
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Provers API Error:', error)
    
    // Fallback к статичным данным если БД недоступна
    const fallbackData = [
      {
        id: 'prover-001',
        name: 'CryptoMiner_Pro',
        earnings: 2847.69,
        hashRate: 1650,
        status: 'online',
        lastActive: new Date().toISOString(),
        uptime: 98.5,
        gpu: 'RTX 4090',
        location: 'US-East',
        wallet: '0x742d35Cc6641C0532a99F4b7c3A2d5F7b94e5f3a'
      },
      {
        id: 'prover-002', 
        name: 'ZK_Beast_2024',
        earnings: 1543.22,
        hashRate: 920,
        status: 'busy',
        lastActive: new Date().toISOString(),
        uptime: 94.2,
        gpu: 'RTX 3080',
        location: 'EU-West',
        wallet: '0x8ba1f109551bD432803012645Hac136c52416968'
      }
    ]
    
    return NextResponse.json({
      success: false,
      data: fallbackData,
      error: 'Database connection failed, using fallback data',
      timestamp: new Date().toISOString(),
      source: 'fallback-data'
    }, { status: 500 })
  }
}

// POST endpoint для регистрации нового провера
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nickname, wallet, gpu, location } = body
    
    // Валидация
    if (!nickname || !wallet) {
      return NextResponse.json(
        { success: false, error: 'Nickname and wallet are required' },
        { status: 400 }
      )
    }
    
    const connection = await getConnection()
    
    try {
      // Генерируем уникальный ID
      const proverId = `prover-${Date.now().toString(36)}`
      
      // Вставляем нового провера
      await connection.execute(`
        INSERT INTO provers (id, user_nickname, user_wallet, gpu_model, location, status)
        VALUES (?, ?, ?, ?, ?, 'offline')
      `, [proverId, nickname, wallet, gpu || 'Unknown', location || 'Unknown'])
      
      return NextResponse.json({
        success: true,
        data: {
          id: proverId,
          nickname,
          wallet,
          message: 'Prover registered successfully'
        },
        timestamp: new Date().toISOString()
      })
    } finally {
      await connection.end()
    }
  } catch (error) {
    console.error('POST Provers API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to register prover',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
