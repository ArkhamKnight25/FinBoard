import { FinanceRequestPayload } from "./types";
import { finnhubAdapter } from "./providers/finnhub";
import axios from "axios";

type CacheKey = string;

interface CacheEntry {
    timestamp: number;
    data: any;
}

// In-memory cache
const cache = new Map<CacheKey, CacheEntry>();

const CACHE_TTL_MS = 60_000; // 60 seconds

function buildCacheKey(payload: FinanceRequestPayload): CacheKey {
    return JSON.stringify(payload);
}

export async function fetchFromProvider(payload: FinanceRequestPayload) {
    const cacheKey = buildCacheKey(payload);
    const now = Date.now();

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }

    let data: any;

    try {
        switch (payload.provider) {
            case "finnhub": {
                const apiKey = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "demo";
                data = await finnhubAdapter(payload, apiKey);
                break;
            }
            case "custom": {
                if (!payload.customUrl) {
                    throw new Error("customUrl is required for custom provider");
                }
                const response = await axios.get(payload.customUrl, { timeout: 10000 });
                data = response.data;
                break;
            }
            default:
                throw new Error(`Unsupported provider: ${payload.provider}`);
        }
    } catch (err: any) {
        // Handle rate limiting
        if (err.response?.status === 429) {
            throw new Error("API rate limit exceeded. Please try again later.");
        }
        throw err;
    }

    // Cache the result
    cache.set(cacheKey, { data, timestamp: now });
    return data;
}

// Clear old cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (now - entry.timestamp > CACHE_TTL_MS * 2) {
            cache.delete(key);
        }
    }
}, CACHE_TTL_MS);
