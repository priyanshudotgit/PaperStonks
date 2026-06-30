import { useState, useRef, useEffect, useCallback } from "react";
import { searchStocks } from "../../lib/api.js";
import WatchlistRow from "./WatchlistRow.jsx";

export default function WatchlistPanel({
  stocks,
  activeStockId,
  onSelectStock,
  onAddStock,
  onRemoveStock,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debouncing for search
  const handleSearch = useCallback((value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await searchStocks(value.trim());
        // console.log("Search response:", data);
        // console.log("Results:", data.results);
        setResults(data.results || []);
        // console.log("Setting results:", data.results);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = (result) => {
    onAddStock?.(result);
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  };

  const isInWatchlist = (symbol) => stocks.some((s) => s.ticker === symbol);

  return (
    <div className="w-full lg:w-[25%] flex flex-col gap-md h-full">
      {/* Search */}
      <div className="relative" ref={dropdownRef}>
        <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          id="watchlist-search"
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder="Search stocks, ETFs, indices..."
          className="w-full pl-[40px] pr-sm py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-secondary focus:ring-2 focus:ring-surface-variant transition-all"
        />

        {/* Search Results Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-xs bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg z-50 max-h-[280px] overflow-y-auto">
            {searching && (
              <div className="p-md text-center text-on-surface-variant text-label-sm">
                Searching...
              </div>
            )}
            {!searching && results.length === 0 && query.trim() && (
              <div className="p-md text-center text-on-surface-variant text-label-sm">
                No results found
              </div>
            )}
            {results.map((result) => {
              const alreadyAdded = isInWatchlist(result.symbol);
              return (
                <div
                  key={result.instrumentKey || result.symbol}
                  className="flex items-center justify-between px-md py-sm hover:bg-surface-container-low transition-colors cursor-pointer border-b border-outline-variant last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-label-md text-primary font-medium truncate">
                      {result.symbol}
                    </div>
                    <div className="text-label-sm text-on-surface-variant truncate">
                      {result.name} · {result.exchange}
                    </div>
                  </div>
                  <button
                    onClick={() => !alreadyAdded && handleAdd(result)}
                    disabled={alreadyAdded}
                    className={`ml-sm flex-shrink-0 px-sm py-xs rounded text-label-sm font-medium transition-colors ${
                      alreadyAdded
                        ? "bg-surface-container text-on-surface-variant cursor-not-allowed"
                        : "bg-gain-bg text-gain border border-gain-border hover:bg-gain-hover"
                    }`}
                  >
                    {alreadyAdded ? "Added" : "+ Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Watchlist Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-[12px] flex flex-col flex-grow overflow-hidden">
        <div className="p-md border-b border-outline-variant flex justify-between items-center bg-surface-bright">
          <h2 className="text-headline-sm text-primary">Watchlist</h2>
          <span className="text-label-sm text-on-surface-variant">
            {stocks.length} stocks
          </span>
        </div>

        <div className="overflow-y-auto flex-grow p-xs">
          <table className="w-full text-left border-collapse">
            <tbody>
              {stocks.map((stock) => (
                <WatchlistRow
                  key={stock.id}
                  stock={stock}
                  isActive={stock.id === activeStockId}
                  onClick={onSelectStock}
                  onRemove={onRemoveStock}
                  canRemove={stocks.length > 1}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
