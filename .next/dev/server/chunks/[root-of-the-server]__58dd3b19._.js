module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/finance/providers/finnhub.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "finnhubAdapter",
    ()=>finnhubAdapter
]);
const BASE_URL = "https://finnhub.io/api/v1";
async function finnhubAdapter(payload, apiKey) {
    const { endpoint, symbol, symbols, interval } = payload;
    switch(endpoint){
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
async function fetchQuote(symbol, apiKey) {
    const [quoteRes, profileRes] = await Promise.all([
        fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`),
        fetch(`${BASE_URL}/stock/profile2?symbol=${symbol}&token=${apiKey}`)
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
        currency: profile.currency || "USD"
    };
}
async function fetchTimeSeries(symbol, interval, apiKey) {
    const resolution = interval === "1D" ? "D" : interval === "1W" ? "W" : "M";
    const to = Math.floor(Date.now() / 1000);
    const days = interval === "1D" ? 30 : interval === "1W" ? 90 : 365;
    const from = to - days * 24 * 60 * 60;
    const res = await fetch(`${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`);
    if (!res.ok) {
        throw new Error(`Finnhub API error: ${res.status}`);
    }
    const data = await res.json();
    if (data.s === "no_data") {
        return {
            symbol,
            points: []
        };
    }
    const points = data.t.map((timestamp, index)=>({
            timestamp: timestamp * 1000,
            date: new Date(timestamp * 1000).toLocaleDateString(),
            open: data.o[index],
            high: data.h[index],
            low: data.l[index],
            close: data.c[index],
            volume: data.v[index]
        }));
    return {
        symbol,
        points
    };
}
async function fetchGainers(symbols, apiKey) {
    if (symbols.length === 0) {
        symbols = [
            "AAPL",
            "MSFT",
            "GOOGL",
            "AMZN",
            "TSLA",
            "NVDA",
            "META",
            "NFLX"
        ];
    }
    const quotes = await Promise.all(symbols.map(async (symbol)=>{
        try {
            return await fetchQuote(symbol, apiKey);
        } catch  {
            return null;
        }
    }));
    return quotes.filter((q)=>q !== null && q.changePercent > 0).sort((a, b)=>b.changePercent - a.changePercent).slice(0, 5);
}
async function fetchSearch(query, apiKey) {
    const res = await fetch(`${BASE_URL}/search?q=${query}&token=${apiKey}`);
    if (!res.ok) {
        throw new Error(`Finnhub API error: ${res.status}`);
    }
    const data = await res.json();
    return data.result.slice(0, 10).map((item)=>({
            symbol: item.symbol,
            name: item.description,
            type: item.type,
            exchange: item.displaySymbol
        }));
}
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[project]/lib/finance/fetchFromProvider.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchFromProvider",
    ()=>fetchFromProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$finance$2f$providers$2f$finnhub$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/finance/providers/finnhub.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-route] (ecmascript)");
;
;
// In-memory cache
const cache = new Map();
const CACHE_TTL_MS = 60_000; // 60 seconds
function buildCacheKey(payload) {
    return JSON.stringify(payload);
}
async function fetchFromProvider(payload) {
    const cacheKey = buildCacheKey(payload);
    const now = Date.now();
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
        return cached.data;
    }
    let data;
    try {
        switch(payload.provider){
            case "finnhub":
                {
                    const apiKey = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY || "demo";
                    data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$finance$2f$providers$2f$finnhub$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["finnhubAdapter"])(payload, apiKey);
                    break;
                }
            case "custom":
                {
                    if (!payload.customUrl) {
                        throw new Error("customUrl is required for custom provider");
                    }
                    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].get(payload.customUrl, {
                        timeout: 10000
                    });
                    data = response.data;
                    break;
                }
            default:
                throw new Error(`Unsupported provider: ${payload.provider}`);
        }
    } catch (err) {
        // Handle rate limiting
        if (err.response?.status === 429) {
            throw new Error("API rate limit exceeded. Please try again later.");
        }
        throw err;
    }
    // Cache the result
    cache.set(cacheKey, {
        data,
        timestamp: now
    });
    return data;
}
// Clear old cache entries periodically
setInterval(()=>{
    const now = Date.now();
    for (const [key, entry] of cache.entries()){
        if (now - entry.timestamp > CACHE_TTL_MS * 2) {
            cache.delete(key);
        }
    }
}, CACHE_TTL_MS);
}),
"[project]/app/api/finance/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$finance$2f$fetchFromProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/finance/fetchFromProvider.ts [app-route] (ecmascript)");
;
;
async function POST(req) {
    try {
        const body = await req.json();
        // Validate request
        if (!body.provider || !body.endpoint) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: true,
                message: "provider and endpoint are required"
            }, {
                status: 400
            });
        }
        // Fetch data from provider (API keys are secure on server)
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$finance$2f$fetchFromProvider$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchFromProvider"])(body);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data
        }, {
            status: 200
        });
    } catch (err) {
        console.error("Finance API error:", err);
        const statusCode = err.response?.status || 500;
        const message = err.message || "Something went wrong";
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: true,
            message
        }, {
            status: statusCode
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__58dd3b19._.js.map