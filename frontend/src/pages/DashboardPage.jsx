import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getWatchlists,
  addStockToWatchlist as apiAddStock,
  removeStockFromWatchlist as apiRemoveStock,
  buyStock as apiBuyStock,
  sellStock as apiSellStock, getMarketStatus, getQuote } from "../lib/api.js";
import { useSocket } from "../context/SocketContext.jsx";

import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";
import WatchlistPanel from "../components/dashboard/WatchlistPanel.jsx";
import StockHeader from "../components/dashboard/StockHeader.jsx";
import ChartPanel from "../components/dashboard/ChartPanel.jsx";
import MetricsGrid from "../components/dashboard/MetricsGrid.jsx";
import TradePanel from "../components/dashboard/TradePanel.jsx";
import ToastContainer, { useToast } from "../components/Toast.jsx";


export default function DashboardPage() {
  const { user, updateBalance, isMarketOpen } = useAuth();
  const { toasts, addToast } = useToast();

  const [stocks, setStocks] = useState([]);
  const [watchlistId, setWatchlistId] = useState(null);
  const [watchlistLoaded, setWatchlistLoaded] = useState(false);
  const [activeStockId, setActiveStockId] = useState(null);
  const { livePrices } = useSocket();

  useEffect(() => {
    let ignore = false;
    async function fetchWatchlist() {
      try {
        const data = await getWatchlists();
        if (ignore) return;

        if (data.watchlists && data.watchlists.length > 0) {
          const wl = data.watchlists[0];
          setWatchlistId(wl.id);
          const mappedStocks = wl.items.map(item => {
            return {
              id: item.symbol,
              name: item.symbol,
              ticker: item.symbol,
              instrumentKey: item.instrumentKey,
              price: 0,
              changePercent: 0,
              open: 0,
              high: 0,
              low: 0,
              volume: "-",
              marketCap: "-",
              peRatio: "-"
            };
          });

          if (mappedStocks.length > 0) {
            setStocks(mappedStocks);
            setActiveStockId(mappedStocks[0].id);
            if (mappedStocks[0].instrumentKey) {
              try {
                const quote = await getQuote(mappedStocks[0].instrumentKey);

                if (quote?.ltp != null) {
                  mappedStocks[0] = {
                    ...mappedStocks[0],
                    price: quote.ltp,
                  };

                  setStocks([...mappedStocks]);
                }
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      } catch (err) {
        if (ignore) return;
        console.error("Failed to load watchlists:", err);
      } finally {
        if (!ignore) setWatchlistLoaded(true);
      }
    }
    fetchWatchlist();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    if (!watchlistLoaded || !livePrices) return;

    setStocks(prevStocks => prevStocks.map(stock => {
      if (!stock.instrumentKey) return stock;

      const feedData = livePrices[stock.instrumentKey];
      if (feedData && feedData.price) {
        return {
          ...stock,
          price: feedData.price,
          changePercent: feedData.changePercent ?? stock.changePercent,
          open: feedData.open ?? stock.open,
          high: feedData.high ?? stock.high,
          low: feedData.low ?? stock.low,
          volume: feedData.volume ?? stock.volume
        };
      }
      return stock;
    }));
  }, [livePrices, watchlistLoaded]);

  const activeStock = activeStockId ? stocks.find((s) => s.id === activeStockId) : null;

  const handleSelectStock = useCallback((stock) => {
    setActiveStockId(stock.id);
  }, []);

  const handleAddStock = useCallback(async (searchResult) => {
    if (!watchlistId) return;
    try {
      await apiAddStock(watchlistId, searchResult.symbol, searchResult.instrumentKey);
      const newStock = {
        id: searchResult.symbol,
        name: searchResult.symbol,
        ticker: searchResult.symbol,
        instrumentKey: searchResult.instrumentKey,
        price: 0,
        changePercent: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: "-",
        marketCap: "-",
        peRatio: "-",
      };
      setStocks((prev) => [...prev, newStock]);
      addToast(`${searchResult.symbol} added to watchlist`, "success");

      if (searchResult.instrumentKey) {
        try {
          const quoteData = await getQuote(searchResult.instrumentKey);
          if (quoteData.ltp) {
            setStocks((prev) =>
              prev.map((s) =>
                s.id === searchResult.symbol
                  ? { ...s, price: quoteData.ltp }
                  : s
              )
            );
          }
        } catch {
          console.log("Dashboard");
        }
      }
    } catch (err) {
      addToast(err.message, "error");
    }
  }, [watchlistId, addToast]);

  const handleRemoveStock = useCallback(async (stock) => {
    if (!watchlistId) return;
    try {
      await apiRemoveStock(watchlistId, stock.ticker);
      setStocks((prev) => prev.filter((s) => s.id !== stock.id));
      if (activeStockId === stock.id) {
        setActiveStockId((prevId) => {
          const remaining = stocks.filter((s) => s.id !== stock.id);
          return remaining.length > 0 ? remaining[0].id : null;
        });
      }
      addToast(`${stock.ticker} removed from watchlist`, "info");
    } catch (err) {
      addToast(err.message, "error");
    }
  }, [watchlistId, activeStockId, stocks, addToast]);

  const handleBuy = useCallback(async (symbol, quantity, price, instrumentKey) => {
    try {
      const data = await apiBuyStock(symbol, quantity, price, instrumentKey);
      updateBalance(data.cashBalance);
      addToast(`Bought ${quantity} share${quantity > 1 ? "s" : ""} of ${symbol}`, "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  }, [updateBalance, addToast]);

  const handleSell = useCallback(async (symbol, quantity, price, instrumentKey) => {
    try {
      const data = await apiSellStock(symbol, quantity, price, instrumentKey);
      updateBalance(data.cashBalance);
      addToast(`Sold ${quantity} share${quantity > 1 ? "s" : ""} of ${symbol}`, "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  }, [updateBalance, addToast]);

  return (
    <DashboardLayout activeTab="Watchlist" isMarketOpen={isMarketOpen}>
      {/* Left Panel — Watchlist */}
      <WatchlistPanel
        stocks={stocks}
        activeStockId={activeStockId}
        onSelectStock={handleSelectStock}
        onAddStock={handleAddStock}
        onRemoveStock={handleRemoveStock}
      />

      {/* Center Panel — Stock Detail */}
      <div className="w-full lg:w-[50%] flex flex-col gap-md h-full">
        <StockHeader stock={activeStock} isMarketOpen={isMarketOpen} />
        {activeStock && (<ChartPanel key={activeStock?.instrumentKey} stock={activeStock} />)}
      </div>

      {/* Right Panel — Trade */}
      <TradePanel
        stock={activeStock}
        cashBalance={user?.cashBalance || 0}
        isMarketOpen={isMarketOpen}
        onBuy={handleBuy}
        onSell={handleSell}
      />

      <ToastContainer toasts={toasts} />
    </DashboardLayout>
  );
}
