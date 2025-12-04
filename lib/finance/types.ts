// lib/finance/types.ts
export type Provider = "finnhub" | "alphaVantage" | "custom";

export type FinanceEndpoint = "quote" | "timeSeries" | "search" | "gainers" | "custom";

export interface FinanceRequestPayload {
    provider: Provider;
    endpoint: FinanceEndpoint;
    symbol?: string;
    symbols?: string[];
    interval?: "1D" | "1W" | "1M";
    customUrl?: string;
    extraParams?: Record<string, any>;
}

export interface UnifiedQuote {
    symbol: string;
    name?: string;
    price: number;
    change: number;
    changePercent: number;
    high?: number;
    low?: number;
    open?: number;
    prevClose?: number;
    volume?: number;
    currency?: string;
}

export interface UnifiedCandlePoint {
    timestamp: number; // ms
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface UnifiedTimeSeries {
    symbol: string;
    points: UnifiedCandlePoint[];
}

export interface UnifiedSearchResult {
    symbol: string;
    name: string;
    type?: string;
    exchange?: string;
}
