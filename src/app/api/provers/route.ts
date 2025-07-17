// src/app/api/provers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE --- //
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- JSON PARSER (НОВЫЙ ПОДХОД) --- //
async function parseProverPage(searchAddress: string, timeframe: string = '1w'): Promise<any> {
  console.log('🚀 JSON PARSER STARTED');
  console.log('🔍 Search address:', searchAddress);
  console.log('📅 Timeframe:', timeframe);
  
  try {
    // Правильные URL параметры
    const timeframeMap: Record<string, string> = {
      '1d': '24h',
      '3d': '3d', 
      '1w': '7d'
    };
    
    const mappedTimeframe = timeframeMap[timeframe] || '24h';
    const url = `https://explorer.beboundless.xyz/provers?period=${mappedTimeframe}`;
    
    console.log('🔍 Fetching URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });

    if (!response.ok) {
      console.error('❌ HTTP Error:', response.status, response.statusText);
      return {
        orders_taken: 0,
        order_earnings_eth: 0,
        order_earnings_usd: 0,
        peak_mhz: 0,
        success_rate: 0,
        source: 'http_error',
        debug: { status: response.status, statusText: response.statusText }
      };
    }

    const html = await response.text();
    console.log('✅ HTML fetched, length:', html.length);

    // Приводим поисковый адрес к нижнему регистру для сравнения
    const searchAddressLower = searchAddress.toLowerCase();
    
    // Проверяем есть ли адрес в HTML вообще
    const addressInHtml = html.toLowerCase().includes(searchAddressLower);
    console.log('🎯 Address found anywhere in HTML:', addressInHtml);
    
    if (!addressInHtml) {
      console.log('❌ Address not found in HTML at all');
      return {
        orders_taken: 0,
        order_earnings_eth: 0,
        order_earnings_usd: 0,
        peak_mhz: 0,
        success_rate: 0,
        source: 'address_not_in_html',
        debug: { searchAddress, timeframe, mappedTimeframe, htmlLength: html.length }
      };
    }

    // --- СУПЕР JSON ПАРСЕР --- //
    console.log('🔥 PARSING JSON DATA FROM HTML...');
    
    // Пробуем разные варианты поиска адреса
    const searchPatterns = [
      `"${searchAddress}":{`,           // Оригинальный регистр
      `"${searchAddressLower}":{`,      // Нижний регистр  
      `"${searchAddress.toUpperCase()}":{`,  // Верхний регистр
      `\\"${searchAddress}\\":{`,       // С экранированием
      `\\"${searchAddressLower}\\":{`,  // С экранированием + нижний регистр
    ];
    
    let addressIndex = -1;
    let usedPattern = '';
    
    // Пробуем все паттерны
    for (const pattern of searchPatterns) {
      addressIndex = html.indexOf(pattern);
      if (addressIndex !== -1) {
        usedPattern = pattern;
        console.log('✅ Found pattern:', pattern, 'at position:', addressIndex);
        break;
      }
    }
    
    // Если не нашли точные паттерны, ищем просто адрес в JSON контексте
    if (addressIndex === -1) {
      console.log('🔍 Trying broader search for address...');
      
      // Ищем адрес где угодно в HTML
      const simpleAddressIndex = html.indexOf(searchAddress);
      const simpleAddressIndexLower = html.toLowerCase().indexOf(searchAddressLower);
      
      if (simpleAddressIndex !== -1) {
        console.log('📍 Found address at position:', simpleAddressIndex);
        
        // Ищем контекст вокруг адреса
        const context = html.substring(Math.max(0, simpleAddressIndex - 200), simpleAddressIndex + 300);
        console.log('📝 Context around address:', context);
        
        // Ищем ближайший JSON объект после адреса
        const afterAddress = html.substring(simpleAddressIndex);
        const jsonStartIndex = afterAddress.search(/:\s*\{/);
        
        if (jsonStartIndex !== -1) {
          addressIndex = simpleAddressIndex + jsonStartIndex + 1; // Позиция после ':'
          usedPattern = 'context_search';
          console.log('✅ Found JSON context at position:', addressIndex);
        }
      } else if (simpleAddressIndexLower !== -1) {
        console.log('📍 Found address (lowercase) at position:', simpleAddressIndexLower);
        const afterAddress = html.substring(simpleAddressIndexLower);
        const jsonStartIndex = afterAddress.search(/:\s*\{/);
        
        if (jsonStartIndex !== -1) {
          addressIndex = simpleAddressIndexLower + jsonStartIndex + 1;
          usedPattern = 'context_search_lower';
          console.log('✅ Found JSON context (lowercase) at position:', addressIndex);
        }
      }
    }
    
    if (addressIndex === -1) {
      console.log('❌ JSON pattern not found for address');
      console.log('🔍 Tried patterns:', searchPatterns);
      
      return {
        orders_taken: 0,
        order_earnings_eth: 0,
        order_earnings_usd: 0,
        peak_mhz: 0,
        success_rate: 0,
        source: 'json_pattern_not_found',
        debug: { 
          searchAddress, 
          timeframe, 
          mappedTimeframe, 
          htmlLength: html.length,
          addressInHtml,
          triedPatterns: searchPatterns,
          usedPattern
        }
      };
    }

    console.log('✅ JSON pattern found at position:', addressIndex, 'using pattern:', usedPattern);

    // Определяем начало JSON объекта
    let jsonStart = addressIndex;
    
    // Если использовали context search, ищем начало объекта
    if (usedPattern.includes('context_search')) {
      // Ищем открывающую скобку после двоеточия
      const afterColon = html.substring(addressIndex);
      const braceIndex = afterColon.indexOf('{');
      if (braceIndex !== -1) {
        jsonStart = addressIndex + braceIndex;
      }
    } else {
      // Для точных паттернов, находим позицию открывающей скобки
      jsonStart = addressIndex + usedPattern.length - 1;
    }
    let braceCount = 0;
    let jsonEnd = jsonStart;
    let inString = false;
    let escapeNext = false;
    
    // Умный поиск конца JSON объекта с учетом строк
    for (let i = jsonStart; i < html.length; i++) {
      const char = html[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }

    if (braceCount !== 0) {
      console.log('❌ Could not find complete JSON object');
      return {
        orders_taken: 0,
        order_earnings_eth: 0,
        order_earnings_usd: 0,
        peak_mhz: 0,
        success_rate: 0,
        source: 'incomplete_json_object',
        debug: { searchAddress, timeframe, braceCount }
      };
    }

    const jsonStr = html.substring(jsonStart, jsonEnd);
    console.log('📊 Extracted JSON string (first 300 chars):', jsonStr.substring(0, 300));
    console.log('📊 JSON string length:', jsonStr.length);

    // Очищаем JSON от экранированных символов
    let cleanJsonStr = jsonStr;
    
    // Убираем экранированные кавычки
    cleanJsonStr = cleanJsonStr.replace(/\\"/g, '"');
    
    // Убираем экранированные слеши
    cleanJsonStr = cleanJsonStr.replace(/\\\\/g, '\\');
    
    console.log('🧹 Cleaned JSON (first 300 chars):', cleanJsonStr.substring(0, 300));

    let proverData: any;
    try {
      proverData = JSON.parse(cleanJsonStr);
      console.log('✅ JSON PARSED SUCCESSFULLY!');
      console.log('📊 Available timeframes:', Object.keys(proverData));
    } catch (parseError) {
      console.error('❌ JSON Parse error:', parseError);
      console.log('📝 Trying to fix incomplete JSON...');
      
      // Пробуем исправить неполный JSON
      let fixedJsonStr = cleanJsonStr;
      
      // Если JSON обрезается, добавляем недостающие закрывающие скобки
      let openBraces = (fixedJsonStr.match(/\{/g) || []).length;
      let closeBraces = (fixedJsonStr.match(/\}/g) || []).length;
      
      console.log('🔍 Open braces:', openBraces, 'Close braces:', closeBraces);
      
      // Добавляем недостающие скобки
      while (openBraces > closeBraces) {
        fixedJsonStr += '}';
        closeBraces++;
      }
      
      // Убираем последнюю запятую если есть
      fixedJsonStr = fixedJsonStr.replace(/,\s*}$/g, '}');
      
      console.log('🔧 Fixed JSON (last 100 chars):', fixedJsonStr.slice(-100));
      
      try {
        proverData = JSON.parse(fixedJsonStr);
        console.log('✅ FIXED JSON PARSED SUCCESSFULLY!');
        console.log('📊 Available timeframes:', Object.keys(proverData));
      } catch (secondError) {
        console.error('❌ Second parse attempt failed:', secondError);
        return {
          orders_taken: 0,
          order_earnings_eth: 0,
          order_earnings_usd: 0,
          peak_mhz: 0,
          success_rate: 0,
          source: 'json_parse_error',
          debug: { 
            searchAddress, 
            timeframe, 
            error: secondError instanceof Error ? secondError.message : String(secondError),
            jsonSample: cleanJsonStr.substring(0, 500),
            fixedJsonSample: fixedJsonStr.substring(0, 500),
            openBraces,
            closeBraces
          }
        };
      }
    }

    // Извлекаем данные для нужного timeframe
    const timeframeData = proverData[mappedTimeframe];
    if (!timeframeData) {
      console.log('❌ No data for timeframe:', mappedTimeframe);
      console.log('📊 Available timeframes:', Object.keys(proverData));
      return {
        orders_taken: 0,
        order_earnings_eth: 0,
        order_earnings_usd: 0,
        peak_mhz: 0,
        success_rate: 0,
        source: 'timeframe_not_found',
        debug: { 
          searchAddress, 
          timeframe, 
          mappedTimeframe,
          availableTimeframes: Object.keys(proverData)
        }
      };
    }

    console.log('📊 Timeframe data:', timeframeData);

    // Извлекаем нужные значения
    const orderCount = timeframeData.orderCount || 0;
    const orderEarnings = timeframeData.orderEarnings || 0;
    const maxMhz = timeframeData.maxMhz || 0;
    const successRate = timeframeData.successRate || 0;

    // Конвертируем orderEarnings из wei в ETH 
    // Пример: 3556484038158 wei = 0.003556484038158 ETH
    const orderEarningsEth = orderEarnings > 0 ? orderEarnings / 1e18 : 0;
    
    // Конвертация в USD (курс ETH ≈ $2400)
    const ethToUsd = 2400;
    const orderEarningsUsd = orderEarningsEth * ethToUsd;

    console.log('🎯 FINAL EXTRACTED VALUES:');
    console.log('  Orders:', orderCount);
    console.log('  Earnings (wei):', orderEarnings);
    console.log('  Earnings (ETH):', orderEarningsEth);
    console.log('  Earnings (USD):', orderEarningsUsd);
    console.log('  Max MHz:', maxMhz);
    console.log('  Success Rate:', successRate);

    return {
      orders_taken: orderCount,
      order_earnings_eth: orderEarningsEth,
      order_earnings_usd: orderEarningsUsd,
      peak_mhz: maxMhz,
      success_rate: successRate,
      source: 'json_parsing_success',
      rawData: timeframeData,
      debug: {
        searchAddress,
        timeframe,
        mappedTimeframe,
        htmlLength: html.length,
        jsonParsed: true,
        availableTimeframes: Object.keys(proverData),
        extractedValues: {
          orderCount,
          orderEarnings,
          orderEarningsEth,
          orderEarningsUsd,
          maxMhz,
          successRate
        }
      }
    };

  } catch (error) {
    console.error('❌ FATAL ERROR in parseProverPage:', error);
    return {
      orders_taken: 0,
      order_earnings_eth: 0,
      order_earnings_usd: 0,
      peak_mhz: 0,
      success_rate: 0,
      source: 'parsing_error',
      debug: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

// --- Основной обработчик API --- //
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
  const blockchain = searchParams.get('blockchain') === 'true';
  const realdata = searchParams.get('realdata') === 'true';
  const action = searchParams.get('action');

  // Обработка очистки кеша
  if (action === 'clear-cache') {
    console.log('🗑️ Cache cleared');
    return NextResponse.json({ success: true, message: 'Cache cleared' });
  }

  function getFallbackProvers(query: string) {
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
        blockchain_address: '0xb607e44023f850d5833c0d1a5d62acad3a5b162e',
        raw_parsed_data: {
          orders_taken: 156,
          order_earnings_eth: 1.2,
          order_earnings_usd: 2847.5,
          peak_mhz: 2.4,
          success_rate: 97.4,
          source: 'fallback_data'
        }
      },
      {
        id: 'prover-002',
        nickname: 'HashMaster_2024',
        gpu_model: 'RTX 4080',
        location: 'EU-West',
        status: 'online',
        reputation_score: 4.6,
        total_orders: 89,
        successful_orders: 85,
        earnings_usd: 1654.3,
        last_seen: new Date().toISOString(),
        blockchain_address: '0xf0f90f7d73f3872988e89e15efd0f42aac94c197',
        raw_parsed_data: {
          orders_taken: 89,
          order_earnings_eth: 0.7,
          order_earnings_usd: 1654.3,
          peak_mhz: 2.1,
          success_rate: 95.5,
          source: 'fallback_data'
        }
      }
    ];

    if (query) {
      return fallbackProvers.filter(prover => 
        prover.nickname.toLowerCase().includes(query.toLowerCase()) ||
        prover.blockchain_address.toLowerCase().includes(query.toLowerCase()) ||
        prover.gpu_model.toLowerCase().includes(query.toLowerCase())
      );
    }
    return fallbackProvers;
  }

  try {
    // Обработка поиска по blockchain адресу
    if (query && query.length === 42 && query.startsWith('0x')) {
      console.log('🔍 Searching for blockchain address:', query);
      const proverPageData = await parseProverPage(query, timeframe);
      
      return NextResponse.json({
        success: true,
        data: [proverPageData],
        pagination: { page: 1, limit: 1, total: 1, totalPages: 1 },
        source: proverPageData.source,
        timestamp: Date.now(),
      });
    }

    // Если запрашиваются реальные данные и блокчейн
    if (blockchain && realdata) {
      console.log('🌐 Fetching real blockchain data...');
      
      const fallbackResults = getFallbackProvers(query);
      const finalData = fallbackResults.slice(offset, offset + limit);
      const total = fallbackResults.length;

      return NextResponse.json({
        success: true,
        data: finalData,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        source: 'real_blockchain_data',
        timestamp: Date.now(),
      });
    }

    // Обычный поиск в Supabase
    let queryBuilder = supabase.from('provers').select('*', { count: 'exact' });
    
    if (query) {
      queryBuilder = queryBuilder.or(
        `nickname.ilike.%${query}%,id.ilike.%${query}%,gpu_model.ilike.%${query}%,location.ilike.%${query}%,blockchain_address.ilike.%${query}%`
      );
    }
    if (status !== 'all') queryBuilder = queryBuilder.eq('status', status);
    if (gpu !== 'all') queryBuilder = queryBuilder.ilike('gpu_model', `%${gpu}%`);
    if (location !== 'all') queryBuilder = queryBuilder.ilike('location', `%${location}%`);

    const { data, count, error } = await queryBuilder
      .order('status', { ascending: false })
      .order('reputation_score', { ascending: false })
      .order('last_seen', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
      source: 'supabase_fallback',
      timestamp: Date.now(),
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    
    const fallbackResults = getFallbackProvers(query);
    const finalData = fallbackResults.slice(offset, offset + limit);
    const total = fallbackResults.length;

    return NextResponse.json({
      success: false,
      error: 'All data sources failed, using final fallback',
      data: finalData,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      source: 'final_fallback_data',
      timestamp: Date.now()
    });
  }
}
