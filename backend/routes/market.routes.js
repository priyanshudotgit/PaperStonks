import express from "express";
import protect from "../middleware/auth.middleware.js";
import { getMarketStatus, getHistoricalCandles, getQuote } from "../controllers/market.controller.js";

const router = express.Router();

router.get("/status", getMarketStatus);
router.get("/history", getHistoricalCandles);
router.get("/quote", getQuote);

export default router;
