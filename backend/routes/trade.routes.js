import express from "express";
import protect from "../middleware/auth.middleware.js";
import { buyStock, sellStock, getTrades } from "../controllers/trade.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getTrades);
router.post("/buy", buyStock);
router.post("/sell", sellStock);

export default router;
