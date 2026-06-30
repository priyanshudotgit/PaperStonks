import express from "express";
import protect from "../middleware/auth.middleware.js";
import { getHoldings, resetBalance } from "../controllers/holdings.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getHoldings);
router.post("/reset-balance", resetBalance);

export default router;
