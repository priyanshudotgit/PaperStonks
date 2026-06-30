import { prisma } from "../db/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { defaultWatchlist } from "../constants/defaultWatchlist.js";

function generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m",
    });
}

function generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
}

function setRefreshCookie(res, token) {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

// POST /api/auth/register
export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const userAlreadyExist = await prisma.user.findUnique({
            where: { email },
        });

        if (userAlreadyExist) {
            return res.status(409).json({
                success: false,
                message: "User already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                },
            });

            const watchlist = await tx.watchlist.create({
                data: {
                    userId: newUser.id,
                    name: "My Watchlist",
                    isDefault: true
                }
            });

            await tx.watchlistItem.createMany({
                data: defaultWatchlist.map(item => ({
                    watchlistId: watchlist.id,
                    symbol: item.symbol,
                    instrumentKey: item.instrumentKey
                }))
            });

            return newUser;
        })

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        setRefreshCookie(res, refreshToken);

        const { upstoxService } = await import("../services/upstox.service.js");
        const keysToSubscribe = defaultWatchlist.map(item => item.instrumentKey).filter(Boolean);
        if (keysToSubscribe.length > 0) {
            upstoxService.subscribe(keysToSubscribe);
        }

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                cashBalance: user.cashBalance,
            },
            accessToken,
        });
    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

// POST /api/auth/login
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        setRefreshCookie(res, refreshToken);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                cashBalance: user.cashBalance,
            },
            accessToken,
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

// GET /api/auth/me
export async function getMe(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                cashBalance: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        console.error("GetMe error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

// POST /api/auth/refresh-token
export async function refreshToken(req, res) {
    try {
        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized, refresh token not found",
            });
        }

        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        // Verify the user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        const accessToken = generateAccessToken(user.id);
        const newRefreshToken = generateRefreshToken(user.id);

        setRefreshCookie(res, newRefreshToken);

        return res.status(200).json({
            success: true,
            message: "Access token refreshed successfully",
            accessToken,
        });
    } catch (error) {
        console.error("RefreshToken error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
        });
    }
}

// POST /api/auth/logout
export async function logout(req, res) {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}