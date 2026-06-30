import express from "express";
import 'dotenv/config';
import cors from 'cors';
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import { upstoxService } from "./services/upstox.service.js";

import authRouter from "./routes/auth.routes.js";
import watchlistRouter from "./routes/watchlist.routes.js";
import searchRouter from "./routes/search.routes.js";
import marketRouter from "./routes/market.routes.js";
import tradeRouter from "./routes/trade.routes.js";
import holdingsRouter from "./routes/holdings.routes.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    }
});

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Server is Live');
});

app.use('/api/auth', authRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/search', searchRouter);
app.use('/api/market', marketRouter);
app.use('/api/trade', tradeRouter);
app.use('/api/holdings', holdingsRouter);

const PORT = process.env.PORT || 5000;

async function startServer() {
    upstoxService.connect();

    try {
        const { prisma } = await import("./db/db.js");
        const items = await prisma.watchlistItem.findMany({
            where: { instrumentKey: { not: null } },
            select: { instrumentKey: true },
            distinct: ['instrumentKey']
        });
        const holdings = await prisma.holding.findMany({
            where: { instrumentKey: { not: null } },
            select: { instrumentKey: true },
            distinct: ['instrumentKey']
        });
        const allKeys = [...items.map(item => item.instrumentKey), ...holdings.map(h => h.instrumentKey)].filter(k => k);
        const keys = [...new Set(allKeys)];
        if (keys.length > 0) {
            console.log(`Subscribing to ${keys.length} instrument keys...`);
            upstoxService.subscribe(keys);
        }
    } catch (err) {
        console.error("Failed to load initial instrument keys:", err);
    }

    const latestFeeds = {};

    upstoxService.onMarketData((feeds) => {
        Object.assign(latestFeeds, feeds);
        io.emit('market-data-update', feeds);
    });

    io.on('connection', (socket) => {
        socket.emit('market-data-update', latestFeeds);
    });

    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

startServer();