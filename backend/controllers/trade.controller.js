import { prisma } from "../db/db.js";

// POST /api/trade/buy
export async function buyStock(req, res) {
    try {
        const { symbol, quantity, price, instrumentKey } = req.body;
        const userId = req.user.id;

        if (!symbol || !quantity || !price) {
            return res.status(400).json({ success: false, message: "symbol, quantity, and price are required" });
        }

        if (quantity < 1 || !Number.isInteger(quantity)) {
            return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
        }

        if (price <= 0) {
            return res.status(400).json({ success: false, message: "Price must be positive" });
        }

        const totalAmount = parseFloat((price * quantity).toFixed(2));

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: userId } });
            if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });

            if (Number(user.cashBalance) < totalAmount) {
                throw Object.assign(new Error("Insufficient balance"), { statusCode: 400 });
            }

            const newBalance = Number(user.cashBalance) - totalAmount;
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { cashBalance: newBalance },
                select: { cashBalance: true }
            });

            const existing = await tx.holding.findUnique({
                where: { userId_symbol: { userId, symbol } }
            });

            let holding;
            if (existing) {
                const oldTotal = Number(existing.averagePrice) * existing.quantity;
                const newTotal = oldTotal + totalAmount;
                const newQty = existing.quantity + quantity;
                const newAvg = parseFloat((newTotal / newQty).toFixed(2));

                holding = await tx.holding.update({
                    where: { id: existing.id },
                    data: { quantity: newQty, averagePrice: newAvg, instrumentKey: instrumentKey || existing.instrumentKey }
                });
            } else {
                holding = await tx.holding.create({
                    data: { userId, symbol, quantity, averagePrice: price, instrumentKey }
                });
            }

            await tx.trade.create({
                data: {
                    userId,
                    symbol,
                    tradeType: "BUY",
                    quantity,
                    price,
                    totalAmount,
                    instrumentKey
                }
            });

            return { cashBalance: updatedUser.cashBalance, holding };
        });

        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        console.error("Buy error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// POST /api/trade/sell
export async function sellStock(req, res) {
    try {
        const { symbol, quantity, price, instrumentKey } = req.body;
        const userId = req.user.id;

        if (!symbol || !quantity || !price) {
            return res.status(400).json({ success: false, message: "symbol, quantity, and price are required" });
        }

        if (quantity < 1 || !Number.isInteger(quantity)) {
            return res.status(400).json({ success: false, message: "Quantity must be a positive integer" });
        }

        if (price <= 0) {
            return res.status(400).json({ success: false, message: "Price must be positive" });
        }

        const totalAmount = parseFloat((price * quantity).toFixed(2));

        const result = await prisma.$transaction(async (tx) => {
            const holding = await tx.holding.findUnique({
                where: { userId_symbol: { userId, symbol } }
            });

            if (!holding) {
                throw Object.assign(new Error("You don't hold this stock"), { statusCode: 400 });
            }

            if (holding.quantity < quantity) {
                throw Object.assign(new Error(`Insufficient holdings. You only have ${holding.quantity} shares`), { statusCode: 400 });
            }

            const user = await tx.user.findUnique({ where: { id: userId } });
            const newBalance = Number(user.cashBalance) + totalAmount;
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { cashBalance: newBalance },
                select: { cashBalance: true }
            });

            let updatedHolding = null;
            const newQty = holding.quantity - quantity;
            if (newQty === 0) {
                await tx.holding.delete({ where: { id: holding.id } });
            } else {
                updatedHolding = await tx.holding.update({
                    where: { id: holding.id },
                    data: { quantity: newQty }
                });
            }

            const buyPrice = holding.averagePrice;
            const realizedProfit = parseFloat(((price - Number(buyPrice)) * quantity).toFixed(2));

            await tx.trade.create({
                data: {
                    userId,
                    symbol,
                    tradeType: "SELL",
                    quantity,
                    price,
                    totalAmount,
                    instrumentKey,
                    buyPrice,
                    realizedProfit
                }
            });

            return { cashBalance: updatedUser.cashBalance, holding: updatedHolding };
        });

        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        console.error("Sell error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// GET /api/trade
export async function getTrades(req, res) {
    try {
        const userId = req.user.id;
        const trades = await prisma.trade.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ success: true, trades });
    } catch (error) {
        console.error("Get trades error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
