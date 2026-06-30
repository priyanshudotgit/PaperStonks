import { useState } from "react";

export default function SellModal({ holding, onClose, onConfirm }) {
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(quantity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-md">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-[12px] p-md w-full max-w-[400px] shadow-xl flex flex-col gap-md animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-headline-sm text-primary">Sell {holding.symbol}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <p className="text-body-md text-on-surface-variant">
          You currently hold <span className="font-mono text-primary font-medium">{holding.quantity}</span> shares.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-md mt-xs">
          <div className="flex flex-col gap-xs">
            <label htmlFor="sell-qty" className="text-label-sm text-on-surface-variant">Quantity to Sell</label>
            <input
              id="sell-qty"
              type="number"
              min="1"
              max={holding.quantity}
              value={quantity}
              onKeyDown={(e) => {
                if (['.', ',', 'e', 'E', '+', '-'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val === "" ? "" : parseInt(val, 10));
              }}
              className="w-full bg-surface-container border border-outline-variant rounded-lg px-sm py-xs text-body-md text-primary focus:outline-none focus:border-loss focus:ring-1 focus:ring-loss transition-colors"
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-sm mt-sm">
            <button
              type="button"
              onClick={onClose}
              className="px-md py-sm text-label-md text-on-surface-variant hover:text-primary transition-colors rounded-lg hover:bg-surface-container-low"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-md py-sm bg-loss hover:bg-loss-hover text-white text-label-md rounded-lg transition-colors"
            >
              Confirm Sell
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
