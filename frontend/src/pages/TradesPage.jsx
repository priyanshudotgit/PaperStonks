import { useState, useEffect } from "react";
import { getTrades } from "../lib/api.js";
import DashboardLayout from "../components/dashboard/DashboardLayout.jsx";
import ToastContainer, { useToast } from "../components/Toast.jsx";

import { useAuth } from "../context/AuthContext.jsx";

export default function TradesPage() {
  const { isMarketOpen } = useAuth();
  const { toasts, addToast } = useToast();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadTrades() {
      try {
        const data = await getTrades();
        if (!ignore) {
          setTrades(data.trades || []);
        }
      } catch (err) {
        if (!ignore) addToast(err.message, "error");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadTrades();
    return () => { ignore = true; };
  }, [addToast]);

  return (
    <DashboardLayout activeTab="Trades" isMarketOpen={isMarketOpen}>
      <div className="w-full flex flex-col gap-md h-full">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-[12px] flex-grow flex flex-col overflow-hidden">
          <div className="p-md border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <h2 className="text-headline-sm text-primary">Your Trades</h2>
            <span className="text-label-sm text-on-surface-variant">
              {trades.length} trade{trades.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="spinner" />
            </div>
          ) : trades.length === 0 ? (
            <div className="flex-grow flex items-center justify-center flex-col gap-sm">
              <span className="material-symbols-outlined text-[48px] text-outline-variant">
                history
              </span>
              <span className="text-on-surface-variant text-body-md">
                No trades yet. Start trading to see history!
              </span>
            </div>
          ) : (
            <div className="overflow-y-auto flex-grow">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant">
                  <tr>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium">Date</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium">Symbol</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium">Type</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Qty</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Price</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Avg Buy Price</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">Total Amount</th>
                    <th className="px-md py-sm text-label-sm text-on-surface-variant font-medium text-right">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-md py-sm">
                        <span className="text-label-md text-on-surface-variant">
                          {new Date(t.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </td>
                      <td className="px-md py-sm">
                        <span className="text-label-md font-medium text-primary">{t.symbol}</span>
                      </td>
                      <td className="px-md py-sm">
                        <span
                          className={`text-label-sm px-sm py-[2px] rounded-full font-medium ${
                            t.tradeType === "BUY" ? "bg-gain-bg text-gain" : "bg-loss-bg text-loss"
                          }`}
                        >
                          {t.tradeType}
                        </span>
                      </td>
                      <td className="px-md py-sm text-right text-mono-data">{t.quantity}</td>
                      <td className="px-md py-sm text-right text-mono-data">
                        ₹{Number(t.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-md py-sm text-right text-mono-data">
                        {t.buyPrice ? `₹${Number(t.buyPrice).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                      </td>
                      <td className="px-md py-sm text-right text-mono-data">
                        ₹{Number(t.totalAmount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-md py-sm text-right text-mono-data font-medium ${Number(t.realizedProfit) > 0 ? "text-gain" : Number(t.realizedProfit) < 0 ? "text-loss" : ""}`}>
                        {t.realizedProfit != null ? `₹${Number(t.realizedProfit).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </DashboardLayout>
  );
}
