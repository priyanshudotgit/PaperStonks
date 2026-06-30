import express from "express";
import protect from "../middleware/auth.middleware.js";
import { getWatchlists, addStockToWatchlist, removeStockFromWatchlist } from "../controllers/watchlist.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getWatchlists);
router.post("/:watchlistId/items", addStockToWatchlist);
router.delete("/:watchlistId/items/:symbol", removeStockFromWatchlist);

export default router;
