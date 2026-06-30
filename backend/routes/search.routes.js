import express from "express";
import protect from "../middleware/auth.middleware.js";
import { searchStocks } from "../controllers/search.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", searchStocks);

export default router;
