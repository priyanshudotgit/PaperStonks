export default function StockHeader({ stock, isMarketOpen }) {
  if (!stock) return null;

  const isGain = stock.changePercent >= 0;

  return (
    <div
      id="stock-header"
      className="bg-surface-container-lowest border border-outline-variant rounded-[12px] p-lg flex flex-col md:flex-row justify-between items-start md:items-center"
    >
      <div>
        <div className="flex items-center gap-sm mb-xs">
          <h1 className="text-headline-md text-primary m-0">{stock.name}</h1>
          <span className="text-label-md text-on-surface-variant px-sm py-[2px] bg-surface-container rounded">
            {stock.ticker}
          </span>
          {/* Market Status Indicator */}
          <span
            className="text-label-sm px-sm py-[2px] rounded-full flex items-center gap-xs"
            style={{
              backgroundColor: isMarketOpen ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
              color: isMarketOpen ? "var(--color-gain)" : "var(--color-loss)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                backgroundColor: isMarketOpen ? "var(--color-gain)" : "var(--color-loss)",
                display: "inline-block",
              }}
            />
            {isMarketOpen ? "Live" : "Closed"}
          </span>
        </div>
        <div className="flex items-baseline gap-sm">
          <span className="text-display-lg text-primary">
            ₹
            {stock.price.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
          <span
            className="text-headline-sm flex items-center"
            style={{ color: isGain ? "var(--color-gain)" : "var(--color-loss)" }}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isGain ? "arrow_upward" : "arrow_downward"}
            </span>{" "}
            {typeof stock.changePercent === 'number' ? Math.abs(stock.changePercent).toFixed(2) : Math.abs(stock.changePercent)}%
          </span>
        </div>
      </div>
    </div>
  );
}
