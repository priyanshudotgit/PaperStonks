import 'dotenv/config';

const UPSTOX_INTERVAL_MAP = {
    "1m": "1minute",
    "5m": "1minute",
    "15m": "1minute",
    "30m": "30minute",
    "1h": "30minute",
};

const LOOKBACK_DAYS = {
    "1m": 5,
    "5m": 5,
    "15m": 5,
    "30m": 15,
    "1h": 30,
};

const AGGREGATION_BUCKET = {
    "1m": null,
    "5m": 5 * 60,
    "15m": 15 * 60,
    "30m": null,
    "1h": 60 * 60,
};

function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function parseCandles(raw) {
    return (raw || []).map((c) => {
        const ts = Math.floor(new Date(c[0]).getTime() / 1000);
        return {
            time: ts,
            open: c[1],
            high: c[2],
            low: c[3],
            close: c[4],
            volume: c[5] || 0,
        };
    });
}

function aggregateCandles(candles, bucketSec) {
    if (!candles.length) return [];

    const buckets = new Map();
    const IST_OFFSET = 19800;

    for (const c of candles) {
        const shiftedTime = c.time + IST_OFFSET;
        const bucketShifted = shiftedTime - (shiftedTime % bucketSec);
        const bucketTime = bucketShifted - IST_OFFSET;

        if (buckets.has(bucketTime)) {
            const b = buckets.get(bucketTime);
            b.high = Math.max(b.high, c.high);
            b.low = Math.min(b.low, c.low);
            b.close = c.close;
            b.volume += c.volume;
        } else {
            buckets.set(bucketTime, {
                time: bucketTime,
                open: c.open,
                high: c.high,
                low: c.low,
                close: c.close,
                volume: c.volume,
            });
        }
    }

    return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

// GET /api/market/history?instrumentKey=...&interval=1m
export async function getHistoricalCandles(req, res) {
    try {
        const { instrumentKey, interval } = req.query;
        if (!instrumentKey || !interval) {
            return res.status(400).json({ success: false, message: "instrumentKey and interval are required" });
        }

        const token = process.env.UPSTOX_ACCESS_TOKEN;
        if (!token) {
            return res.status(503).json({ success: false, message: "Market data service unavailable" });
        }

        const upstoxInterval = UPSTOX_INTERVAL_MAP[interval] || "1minute";
        const encodedKey = encodeURIComponent(instrumentKey);
        const headers = {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
        };

        const toDate = new Date();
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - (LOOKBACK_DAYS[interval] || 5));

        const histUrl = `https://api.upstox.com/v2/historical-candle/${encodedKey}/${upstoxInterval}/${fmtDate(toDate)}/${fmtDate(fromDate)}`;

        const intradayUrl = `https://api.upstox.com/v2/historical-candle/intraday/${encodedKey}/${upstoxInterval}`;

        const [histResp, intradayResp] = await Promise.allSettled([
            fetch(histUrl, { headers }),
            fetch(intradayUrl, { headers }),
        ]);

        let allCandles = [];

        if (histResp.status === "fulfilled" && histResp.value.ok) {
            const data = await histResp.value.json();
            allCandles = parseCandles(data?.data?.candles);
        }

        if (intradayResp.status === "fulfilled" && intradayResp.value.ok) {
            const data = await intradayResp.value.json();
            const intradayCandles = parseCandles(data?.data?.candles);
            if (intradayCandles.length > 0) {
                const existingTimes = new Set(allCandles.map((c) => c.time));
                for (const c of intradayCandles) {
                    if (!existingTimes.has(c.time)) {
                        allCandles.push(c);
                    }
                }
            }
        }

        allCandles.sort((a, b) => a.time - b.time);

        const bucketSec = AGGREGATION_BUCKET[interval];
        if (bucketSec) {
            allCandles = aggregateCandles(allCandles, bucketSec);
        }

        return res.status(200).json({ success: true, candles: allCandles });
    } catch (error) {
        console.error("Historical candles error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// GET /api/market/status
export async function getMarketStatus(req, res) {
    try {
        const token = process.env.UPSTOX_ACCESS_TOKEN;
        if (!token) {
            return res.status(503).json({ success: false, message: "Market data service unavailable" });
        }

        const response = await fetch("https://api.upstox.com/v2/market/status/NSE", {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            return res.status(200).json({
                success: true,
                isOpen: isFallbackMarketOpen(),
                status: isFallbackMarketOpen() ? "NORMAL_OPEN" : "CLOSED",
                source: "fallback"
            });
        }

        const data = await response.json();
        const status = data.data?.status || "CLOSED";
        const isOpen = status === "NORMAL_OPEN";

        return res.status(200).json({
            success: true,
            isOpen,
            status,
            source: "upstox"
        });
    } catch (error) {
        console.error("Market status error:", error);
        return res.status(200).json({
            success: true,
            isOpen: isFallbackMarketOpen(),
            status: isFallbackMarketOpen() ? "NORMAL_OPEN" : "CLOSED",
            source: "fallback"
        });
    }
}

function isFallbackMarketOpen() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const ist = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);

    const day = ist.getDay();
    if (day === 0 || day === 6) return false;

    const hours = ist.getHours();
    const minutes = ist.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    return timeInMinutes >= 555 && timeInMinutes <= 930;
}

// GET /api/market/quote?instrumentKey=...
export async function getQuote(req, res) {
    try {
        const { instrumentKey } = req.query;
        if (!instrumentKey) {
            return res.status(400).json({ success: false, message: "instrumentKey is required" });
        }

        const token = process.env.UPSTOX_ACCESS_TOKEN;
        if (!token) {
            return res.status(503).json({ success: false, message: "Market data service unavailable" });
        }

        const encodedKey = encodeURIComponent(instrumentKey);
        const response = await fetch(`https://api.upstox.com/v2/market-quote/ltp?instrument_key=${encodedKey}`, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            return res.status(502).json({ success: false, message: "Failed to fetch quote" });
        }

        const data = await response.json();
        const quoteData = data?.data?.[instrumentKey];
        const ltp = quoteData?.last_price ?? 0;

        return res.status(200).json({ success: true, ltp });
    } catch (error) {
        console.error("Quote error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}