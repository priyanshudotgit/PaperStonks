import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getHoldings,
  resetBalance as apiResetBalance,
  getMarketStatus,
  sellStock as apiSellStock,
} from "../lib/api.js";
import { useSocket } from "../context/SocketContext.jsx";
import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";
import ToastContainer, { useToast } from "../components/Toast.jsx";
import SellModal from "../components/dashboard/SellModal.jsx";

export default function HoldingsPage() {
  const { user, updateBalance, isMarketOpen } = useAuth();
  const { toasts, addToast } = useToast();

  const [holdings, setHoldings] = useState([]);
  const [cashBalance, setCashBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [sellModalStock, setSellModalStock] = useState(null);
  const { livePrices } = useSocket();

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await getHoldings();
        if (ignore) return;
        setHoldings(data.holdings || []);
        setCashBalance(Number(data.cashBalance || 0));
      } catch (err) {
        console.error("Failed to load holdings:", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  const balance = Number(user?.cashBalance ?? cashBalance);
  const canReset = balance < 500;

  const handleReset = useCallback(async () => {
    if (resetting) return;
    setResetting(true);
    try {
      const data = await apiResetBalance();
      updateBalance(data.cashBalance);
      setCashBalance(Number(data.cashBalance));
      addToast("Balance reset to ₹1,00,000!", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setResetting(false);
    }
  }, [resetting, updateBalance, addToast]);

  const handleSellClick = useCallback((holding) => {
    if (!isMarketOpen) {
      addToast("Market is closed", "error");
      return;
    }
    setSellModalStock(holding);
  }, [isMarketOpen, addToast]);

  const handleSellConfirm = useCallback(async (qty) => {
    const holding = sellModalStock;
    if (!holding) return;

    if (isNaN(qty) || qty <= 0 || qty > holding.quantity) {
      addToast("Invalid quantity", "error");
      return;
    }
    
    try {
      const feed = livePrices[holding.instrumentKey];
      const currentPrice = feed ? (feed.price ?? feed) : holding.avgPrice; // Fallback
      const data = await apiSellStock(holding.symbol, qty, currentPrice, holding.instrumentKey);
      updateBalance(data.cashBalance);
      setCashBalance(Number(data.cashBalance));
      setHoldings(prev => prev.map(h => h.id === holding.id ? { ...h, quantity: h.quantity - qty } : h).filter(h => h.quantity > 0));
      addToast(`Sold ${qty} share${qty > 1 ? "s" : ""} of ${holding.symbol}`, "success");
      setSellModalStock(null);
    } catch (err) {
      addToast(err.message, "error");
    }
  }, [sellModalStock, livePrices, updateBalance, addToast]);

  const holdingsWithPnL = holdings.map((h) => {
    const avgPrice = Number(h.averagePrice);
    let currentPrice = avgPrice;
    
    if (h.instrumentKey && livePrices[h.instrumentKey]) {
      const feed = livePrices[h.instrumentKey];
      currentPrice = feed.price ?? feed;
    } else {
      for (const [key, feed] of Object.entries(livePrices || {})) {
        if (key.includes(h.symbol) || key.toUpperCase().includes(h.symbol)) {
          currentPrice = feed.price ?? feed;
          break;
        }
      }
    }

    const investedValue = avgPrice * h.quantity;
    const currentValue = currentPrice * h.quantity;
    const pnl = currentValue - investedValue;
    const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return { ...h, avgPrice, currentPrice, investedValue, currentValue, pnl, pnlPercent };
  });

  const totalInvested = holdingsWithPnL.reduce((sum, h) => sum + h.investedValue, 0);
  const totalCurrent = holdingsWithPnL.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

  return (
    <DashboardLayout activeTab="Holdings" isMarketOpen={isMarketOpen}>
      <div className="w-full flex flex-col gap-md h-full">
        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <SummaryCard
            label="Total Invested"
            value={`₹${totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          />
          <SummaryCard
            label="Current Value"
            value={`₹${totalCurrent.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          />
          <SummaryCard
            label="Total P&L"
            value={`${totalPnL >= 0 ? "+" : ""}₹${totalPnL.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            subtext={`${totalPnLPercent >= 0 ? "+" : ""}${totalPnLPercent.toFixed(2)}%`}
            isGain={totalPnL >= 0}
          />
          <div className="bg-surface-container-lowest border border-outline-variant rounded-[12px] p-md flex flex-col justify-between">
            <div className="text-label-sm text-on-surface-variant mb-xs">Cash Balance</div>
            <div className="text-headline-sm text-primary text-mono-data">
              ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            {canReset && (
              <button
                onClick={handleReset}
                disabled={resetting}
                className="mt-sm px-sm py-xs text-label-sm font-medium rounded-lg text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: "var(--color-buy-btn)" }}
              >
                {resetting ? "Resetting..." : "Reset to ₹1,00,000"}
              </button>
            )}
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-[12px] flex-grow flex flex-col overflow-hidden">
          <div className="p-md border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <h2 className="text-headline-sm text-primary">Your Holdings</h2>
            <span className="text-label-sm text-on-surface-variant">
              {holdings.length} stock{holdings.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : holdings.length === 0 ? (
            <div className="flex-grow flex items-center justify-center flex-col gap-sm">
              <span className="material-symbols-outlined text-[48px] text-outline-variant">
                inventory_2
              </span>
              <span className="text-on-surface-variant text-body-md">
                No holdings yet. Start trading!
              </span>
            </div>
          ) : (
            <div className="overflow-y-auto flex-grow">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant">
                  <tr>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium">Symbol</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Qty</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Avg. Price</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Current</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Invested</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Current Val.</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">P&L</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsWithPnL.map((h) => (
                    <tr
                      key={h.id}
                      className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-md py-sm">
                        <span className="text-label-md font-medium text-primary">{h.symbol}</span>
                      </td>
                      <td className="px-md py-sm text-right text-mono-data">{h.quantity}</td>
                      <td className="px-md py-sm text-right text-mono-data">
                        ₹{h.avgPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-md py-sm text-right text-mono-data">
                        ₹{h.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-md py-sm text-right text-mono-data">
                        ₹{h.investedValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-md py-sm text-right text-mono-data">
                        ₹{h.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-md py-sm text-right">
                        <div
                          className="text-mono-data font-medium"
                          style={{ color: h.pnl >= 0 ? "var(--color-gain)" : "var(--color-loss)" }}
                        >
                          {h.pnl >= 0 ? "+" : ""}₹{h.pnl.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                        <div
                          className="text-label-sm"
                          style={{ color: h.pnl >= 0 ? "var(--color-gain)" : "var(--color-loss)" }}
                        >
                          {h.pnlPercent >= 0 ? "+" : ""}{h.pnlPercent.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-md py-sm text-right">
                        <button
                          onClick={() => handleSellClick(h)}
                          className="px-sm py-xs bg-surface-container-high hover:bg-surface-container-highest text-loss text-label-sm font-medium rounded transition-colors"
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {sellModalStock && (
        <SellModal
          holding={sellModalStock}
          onClose={() => setSellModalStock(null)}
          onConfirm={handleSellConfirm}
        />
      )}

      <ToastContainer toasts={toasts} />
    </DashboardLayout>
  );
}

function SummaryCard({ label, value, subtext, isGain }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-[12px] p-md">
      <div className="text-label-sm text-on-surface-variant mb-xs">{label}</div>
      <div
        className="text-headline-sm text-mono-data"
        style={isGain !== undefined ? { color: isGain ? "var(--color-gain)" : "var(--color-loss)" } : {}}
      >
        {value}
      </div>
      {subtext && (
        <div
          className="text-label-sm mt-xs"
          style={{ color: isGain ? "var(--color-gain)" : "var(--color-loss)" }}
        >
          {subtext}
        </div>
      )}
    </div>
  );
}
