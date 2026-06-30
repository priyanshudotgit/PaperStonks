import 'dotenv/config';

// GET /api/search?q=RELIANCE
export async function searchStocks(req, res) {
    try {
        const query = req.query.q?.trim();

        if (!query || query.length < 1) {
            return res.status(400).json({ success: false, message: "Query is required" });
        }

        const token = process.env.UPSTOX_ACCESS_TOKEN;
        if (!token) {
            return res.status(503).json({ success: false, message: "Market data service unavailable" });
        }

        const url =
                    `https://api.upstox.com/v2/instruments/search?` +
                    `query=${encodeURIComponent(query)}` +
                    `&exchanges=NSE`;

        const response = await fetch(url, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            console.error("Upstox search error:", response.status, errData);
            return res.status(502).json({ success: false, message: "Search service error" });
        }

        const data = await response.json();
        console.log("Status:", response.status);
        console.log(JSON.stringify(data, null, 2));
        const securities = data.data || [];

        const results = securities.map(s => ({
            symbol: s.trading_symbol || s.symbol,
            name: s.name || s.company_name || s.short_name || s.symbol,
            instrumentKey: s.instrument_key,
            exchange: s.exchange
        }));

        console.log("Mapped results:", results);

        return res.status(200).json({ success: true, results });
    } catch (error) {
        console.error("Search error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
