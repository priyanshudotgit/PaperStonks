export default function WatchlistRow({ stock, isActive, onClick, onRemove, canRemove }) {
  const isGain = stock.changePercent >= 0;

  return (
    <tr
      onClick={() => onClick(stock)}
      className={`hover:bg-surface-container-low transition-colors group cursor-pointer border-b border-outline-variant last:border-0 ${
        isActive
          ? "bg-surface-container-high border-l-2 border-l-primary"
          : ""
      }`}
    >
      {/* Stock Name & Ticker */}
      <td className="py-sm px-sm">
        <div className="text-label-md font-medium text-primary">
          {stock.name}
        </div>
        <div className="text-label-sm text-on-surface-variant">
          {stock.ticker}
        </div>
      </td>

      {/* Price & Change */}
      <td className="py-sm px-sm text-right">
        <div className="text-mono-data text-primary">
          {stock.price.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <div
          className="text-label-sm"
          style={{ color: isGain ? "var(--color-gain)" : "var(--color-loss)" }}
        >
          {isGain ? "+" : ""}
          {typeof stock.changePercent === 'number' ? stock.changePercent.toFixed(2) : stock.changePercent}%
        </div>
      </td>

      {/* Remove Button */}
      <td
        className={`py-sm px-sm text-right w-[40px] transition-opacity ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {canRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(stock);
            }}
            className="text-on-surface-variant hover:text-loss transition-colors p-xs rounded hover:bg-loss-bg"
            title="Remove from watchlist"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </td>
    </tr>
  );
}
