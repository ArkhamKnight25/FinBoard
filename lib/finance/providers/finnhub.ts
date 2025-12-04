import {
  FinanceRequestPayload,
  UnifiedQuote,
  UnifiedTimeSeries,
  UnifiedCandlePoint,
} from "../types";

const BASE_URL = "https://finnhub.io/api/v1";

export async function finnhubAdapter(
  payload: FinanceRequestPayload,
  apiKey: string
): Promise<any> {
  const { endpoint, symbol, symbols, interval } = payload;

  switch (endpoint) {
    case "quote":
      if (!symbol) throw new Error("symbol is required for quote");
      return fetchQuote(symbol, apiKey);
    case "timeSeries":
      if (!symbol) throw new Error("symbol is required for timeSeries");
      return fetchTimeSeries(symbol, interval ?? "1D", apiKey);
    case "gainers":
      return fetchGainers(symbols || [], apiKey);
    case "search":
      if (!symbol) throw new Error("query is required for search");
      return fetchSearch(symbol, apiKey);
    default:
      throw new Error(`Unsupported Finnhub endpoint: ${endpoint}`);
  }
}

async function fetchQuote(symbol: string, apiKey: string): Promise<UnifiedQuote> {
  const [quoteRes, profileRes] = await Promise.all([
    fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`),
    fetch(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${apiKey}`),
  ]);

  if (!quoteRes.ok) {
    throw new Error(`Finnhub API error: ${quoteRes.status}`);
  }

  const quote = await quoteRes.json();
  const profile = await profileRes.json();

  return {
    symbol,
    name: profile.name || symbol,
    price: quote.c,
    change: quote.d,
    changePercent: quote.dp,
    high: quote.h,
    low: quote.l,
    open: quote.o,
    prevClose: quote.pc,
    currency: profile.currency || "USD",
  };
}

async function fetchTimeSeries(
  symbol: string,
  interval: "1D" | "1W" | "1M",
  apiKey: string
): Promise<UnifiedTimeSeries> {
  const resolution = interval === "1D" ? "D" : interval === "1W" ? "W" : "M";
  const to = Math.floor(Date.now() / 1000);
  const days = interval === "1D" ? 30 : interval === "1W" ? 90 : 365;
  const from = to - days * 24 * 60 * 60;

  const res = await fetch(
    `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`
  );

  if (!res.ok) {
    throw new Error(`Finnhub API error: ${res.status}`);
  }

  const data = await res.json();

  if (data.s === "no_data") {
    return { symbol, points: [] };
  }

  const points: UnifiedCandlePoint[] = data.t.map((timestamp: number, index: number) => ({
    timestamp: timestamp * 1000,
    date: new Date(timestamp * 1000).toLocaleDateString(),
    open: data.o[index],
    high: data.h[index],
    low: data.l[index],
    close: data.c[index],
    volume: data.v[index],
  }));

  return { symbol, points };
}

async function fetchGainers(symbols: string[], apiKey: string): Promise<UnifiedQuote[]> {
  if (symbols.length === 0) {
    symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "NFLX"];
  }

  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        return await fetchQuote(symbol, apiKey);
      } catch {
        return null;
      }
    })
  );

  return quotes
    .filter((q): q is UnifiedQuote => q !== null && q.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);
}

async function fetchSearch(query: string, apiKey: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/search?q=${query}&token=${apiKey}`);

  if (!res.ok) {
    throw new Error(`Finnhub API error: ${res.status}`);
  }

  const data = await res.json();

  return data.result.slice(0, 10).map((item: any) => ({
    symbol: item.symbol,
    name: item.description,
    type: item.type,
    exchange: item.displaySymbol,
  }));
}
