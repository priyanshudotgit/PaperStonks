import { prisma } from "../db/db.js";

// GET /api/holdings
export async function getHoldings(req, res) {
    try {
        const holdings = await prisma.holding.findMany({
            where: { userId: req.user.id },
            orderBy: { symbol: "asc" }
        });

        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { cashBalance: true }
        });

        return res.status(200).json({
            success: true,
            holdings,
            cashBalance: user.cashBalance
        });
    } catch (error) {
        console.error("Get holdings error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

// POST /api/holdings/reset-balance
export async function resetBalance(req, res) {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { cashBalance: true }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (Number(user.cashBalance) >= 500) {
            return res.status(400).json({ success: false, message: "Balance must be below ₹500 to reset" });
        }

        const holdingsCount = await prisma.holding.count({ where: { userId } });
        if (holdingsCount > 0) {
            return res.status(400).json({ success: false, message: "Sell all holdings before resetting balance" });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { cashBalance: 100000.00 },
            select: { cashBalance: true }
        });

        return res.status(200).json({
            success: true,
            message: "Balance reset to ₹1,00,000",
            cashBalance: updated.cashBalance
        });
    } catch (error) {
        console.error("Reset balance error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
