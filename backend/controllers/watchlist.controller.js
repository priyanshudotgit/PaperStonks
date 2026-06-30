import { prisma } from "../db/db.js";

// GET /api/watchlist
export async function getWatchlists(req, res) {
    try {
        const watchlists = await prisma.watchlist.findMany({
            where: { userId: req.user.id },
            include: {
                items: true
            }
        });

        return res.status(200).json({
            success: true,
            watchlists
        });
    } catch (error) {
        console.error("Get watchlists error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// POST /api/watchlist/:watchlistId/items
export async function addStockToWatchlist(req, res) {
    try {
        const { watchlistId } = req.params;
        const { symbol, instrumentKey } = req.body;

        if (!symbol) {
            return res.status(400).json({ success: false, message: "Symbol is required" });
        }

        const watchlist = await prisma.watchlist.findFirst({
            where: { id: watchlistId, userId: req.user.id }
        });

        if (!watchlist) {
            return res.status(404).json({ success: false, message: "Watchlist not found" });
        }

        const item = await prisma.watchlistItem.create({
            data: {
                watchlistId,
                symbol,
                instrumentKey: instrumentKey || null
            }
        });

        if (item.instrumentKey) {
            const { upstoxService } = await import("../services/upstox.service.js");
            upstoxService.subscribe([item.instrumentKey]);
        }

        return res.status(201).json({
            success: true,
            item
        });
    } catch (error) {
        if (error.code === 'P2002') {
             return res.status(400).json({ success: false, message: "Stock already in watchlist" });
        }
        console.error("Add stock error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

// DELETE /api/watchlist/:watchlistId/items/:symbol
export async function removeStockFromWatchlist(req, res) {
    try {
        const { watchlistId, symbol } = req.params;

        const watchlist = await prisma.watchlist.findFirst({
            where: { id: watchlistId, userId: req.user.id },
            include: { _count: { select: { items: true } } }
        });

        if (!watchlist) {
            return res.status(404).json({ success: false, message: "Watchlist not found" });
        }

        if (watchlist._count.items <= 1) {
            return res.status(400).json({ success: false, message: "Cannot remove the last stock from your watchlist" });
        }

        await prisma.watchlistItem.deleteMany({
            where: {
                watchlistId,
                symbol
            }
        });

        return res.status(200).json({
            success: true,
            message: "Stock removed from watchlist"
        });
    } catch (error) {
        console.error("Remove stock error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}
