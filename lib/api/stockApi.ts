import axios from 'axios';
import { StockData, ChartDataPoint } from '@/types';

// API Configuration
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || 'demo';
const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';

// Cache for API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60000; // 1 minute

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Finnhub API
export async function getStockQuote(symbol: string): Promise<StockData | null> {
  const cacheKey = `quote-${symbol}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    
    const profileResponse = await axios.get(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    const data: StockData = {
      symbol,
      name: profileResponse.data.name || symbol,
      price: response.data.c,
      change: response.data.d,
      changePercent: response.data.dp,
      high: response.data.h,
      low: response.data.l,
      open: response.data.o,
      previousClose: response.data.pc,
    };

    setCachedData(cacheKey, data);
    return data;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

export async function getMarketGainers(): Promise<StockData[]> {
  const cacheKey = 'market-gainers';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  // Popular tech stocks for demo
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];
  
  try {
    const quotes = await Promise.all(symbols.map(getStockQuote));
    const validQuotes = quotes.filter((q): q is StockData => q !== null);
    const gainers = validQuotes
      .filter(q => q.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);

    setCachedData(cacheKey, gainers);
    return gainers;
  } catch (error) {
    console.error('Error fetching market gainers:', error);
    return [];
  }
}

export async function getWatchlist(symbols: string[]): Promise<StockData[]> {
  try {
    const quotes = await Promise.all(symbols.map(getStockQuote));
    return quotes.filter((q): q is StockData => q !== null);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
}

export async function getChartData(
  symbol: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily'
): Promise<ChartDataPoint[]> {
  const cacheKey = `chart-${symbol}-${interval}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const resolution = interval === 'daily' ? 'D' : interval === 'weekly' ? 'W' : 'M';
    const to = Math.floor(Date.now() / 1000);
    const from = to - (interval === 'daily' ? 30 : interval === 'weekly' ? 90 : 365) * 24 * 60 * 60;

    const response = await axios.get(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );

    if (response.data.s === 'no_data') {
      return [];
    }

    const chartData: ChartDataPoint[] = response.data.t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toLocaleDateString(),
      open: response.data.o[index],
      high: response.data.h[index],
      low: response.data.l[index],
      close: response.data.c[index],
      volume: response.data.v[index],
    }));

    setCachedData(cacheKey, chartData);
    return chartData;
  } catch (error) {
    console.error(`Error fetching chart data for ${symbol}:`, error);
    return [];
  }
}

export async function searchStocks(query: string): Promise<Array<{ symbol: string; name: string }>> {
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_API_KEY}`
    );
    
    return response.data.result.slice(0, 10).map((item: any) => ({
      symbol: item.symbol,
      name: item.description,
    }));
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}
