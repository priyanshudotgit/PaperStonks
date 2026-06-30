import { useState, useMemo } from "react";

export default function TradePanel({
  stock,
  cashBalance = 0,
  isMarketOpen = false,
  onBuy,
  onSell,
}) {
  const [side, setSide] = useState("BUY");
  const [quantity, setQuantity] = useState(1);

  const requiredAmount = useMemo(() => {
    if (!stock) return 0;
    return parseFloat((stock.price * quantity).toFixed(2));
  }, [stock, quantity]);

  const balance = Number(cashBalance);
  const insufficientBalance = side === "BUY" && requiredAmount > balance;
  const isDisabled = !isMarketOpen || insufficientBalance;

  const handleSubmit = () => {
    if (!stock || isDisabled) return;
    if (side === "BUY") {
      onBuy?.(stock.ticker, quantity, stock.price, stock.instrumentKey);
    } else {
      onSell?.(stock.ticker, quantity, stock.price, stock.instrumentKey);
    }
    setQuantity(1);
  };

  if (!stock) return null;

  return (
    <div className="w-full lg:w-[25%] flex flex-col gap-md h-full">
      <div
        id="trade-panel"
        className="bg-surface-container-lowest border border-outline-variant rounded-[12px] p-lg flex flex-col gap-lg flex-grow"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-headline-sm text-primary">Trade</h2>
          {!isMarketOpen && (
            <span className="text-label-sm text-loss flex items-center gap-xs px-sm py-xs bg-loss-bg rounded-full border border-loss-border">
              <span className="material-symbols-outlined text-[14px]">block</span>
              Market Closed
            </span>
          )}
        </div>

        {/* BUY / SELL Toggle */}
        <div className="flex p-xs bg-surface-container rounded-lg">
          <button
            onClick={() => setSide("BUY")}
            className={`flex-1 py-sm rounded-md text-label-md font-medium transition-colors ${
              side === "BUY"
                ? "text-white shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
            style={
              side === "BUY"
                ? { backgroundColor: "var(--color-buy-btn)" }
                : undefined
            }
          >
            BUY
          </button>
          <button
            onClick={() => setSide("SELL")}
            className={`flex-1 py-sm rounded-md text-label-md font-medium transition-colors ${
              side === "SELL"
                ? "text-white shadow-sm"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
            style={
              side === "SELL"
                ? { backgroundColor: "var(--color-loss)" }
                : undefined
            }
          >
            SELL
          </button>
        </div>

        {/* Order Type — Market only */}
        <div className="flex gap-md">
          <label className="flex items-center gap-xs">
            <input
              type="radio"
              checked={true}
              readOnly
              className="text-primary focus:ring-primary h-4 w-4 accent-black"
            />
            <span className="text-label-md text-on-surface">Market</span>
          </label>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-md">
          <div>
            <label className="block text-label-sm text-on-surface-variant mb-xs">
              Quantity
            </label>
            <div className="relative">
              <input
                id="trade-quantity"
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value))))}
                className="w-full px-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all text-right text-mono-data"
              />
              <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-label-md">
                Shares
              </span>
            </div>
          </div>

          <div>
            <label className="block text-label-sm text-on-surface-variant mb-xs">
              Price (Market)
            </label>
            <div className="relative">
              <input
                id="trade-price"
                type="number"
                value={stock.price.toFixed(2)}
                disabled
                className="w-full px-sm py-sm border border-outline-variant rounded-lg text-body-lg text-right text-mono-data bg-surface-container text-on-surface-variant"
              />
              <span className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-label-md">
                ₹
              </span>
            </div>
          </div>
        </div>

        {/* Required Amount & Balance */}
        <div className="flex flex-col gap-sm pt-md border-t border-outline-variant mt-auto">
          <div className="flex justify-between items-center">
            <span className="text-label-sm text-on-surface-variant">
              Available Balance
            </span>
            <span className="text-label-md text-primary text-mono-data">
              ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-body-lg font-semibold text-on-surface">
              Required Amount
            </span>
            <span
              className="text-headline-md text-mono-data"
              style={{
                color: insufficientBalance ? "var(--color-loss)" : "var(--color-primary)",
              }}
            >
              ₹{requiredAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
          {insufficientBalance && (
            <div className="text-label-sm text-loss flex items-center gap-xs">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              Insufficient balance
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          id="trade-submit-btn"
          disabled={isDisabled}
          onClick={handleSubmit}
          className="w-full py-md text-white rounded-lg text-body-lg font-semibold transition-colors shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor:
              side === "BUY"
                ? "var(--color-buy-btn)"
                : "var(--color-loss)",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled) {
              e.currentTarget.style.backgroundColor =
                side === "BUY"
                  ? "var(--color-buy-btn-hover)"
                  : "#991b1b";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              side === "BUY"
                ? "var(--color-buy-btn)"
                : "var(--color-loss)";
          }}
        >
          {!isMarketOpen
            ? "Market Closed"
            : `${side === "BUY" ? "Buy" : "Sell"} ${stock.name}`}
        </button>
      </div>
    </div>
  );
}
