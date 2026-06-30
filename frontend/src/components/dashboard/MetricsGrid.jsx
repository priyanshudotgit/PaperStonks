export default function MetricsGrid({ stock, candle }) {
  if (!stock) return null;

  const data = candle || stock;

  const metrics = [
    {
      label: "Open",
      value: data.open ? `₹${Number(data.open).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-",
    },
    {
      label: "High",
      value: data.high ? `₹${Number(data.high).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-",
    },
    {
      label: "Low",
      value: data.low ? `₹${Number(data.low).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-",
    },
  ];

  return (
    <div id="metrics-grid" className="flex w-full gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-surface-container-lowest border border-outline-variant rounded-[12px] p-sm flex-1"
        >
          <div className="text-label-sm text-on-surface-variant mb-xs">
            {metric.label}
          </div>
          <div className="text-label-md text-primary">{metric.value}</div>
        </div>
      ))}
    </div>
  );
}
