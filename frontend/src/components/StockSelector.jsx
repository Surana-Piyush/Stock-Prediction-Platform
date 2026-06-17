import React, { useState, useEffect, useRef } from 'react';

/**
 * StockSelector renders the select asset section with a searchable dropdown trigger and submission button.
 * @param {object} props
 * @param {string[]} props.stocks - List of stocks
 * @param {string} props.selectedStock - Selected stock symbol
 * @param {function} props.onSelectStock - Selection callback
 * @param {function} props.onRunPrediction - Submit callback
 * @param {boolean} props.isPredicting - Prediction load state
 * @param {boolean} props.isLoadingStocks - Stocks load state
 */
export default function StockSelector({
  stocks = [],
  selectedStock,
  onSelectStock,
  onRunPrediction,
  isPredicting,
  isLoadingStocks,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanSymbol = (sym) => {
    if (!sym) return '';
    return sym.replace('.NS', '');
  };

  const filteredStocks = stocks.filter((stock) =>
    stock.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (stock) => {
    onSelectStock(stock);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`glass-card inner-glow rounded-xl p-6 border border-white/10 flex flex-col justify-between h-full min-h-[160px] relative ${isOpen ? 'z-20' : 'z-10'}`}>
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">target</span> Select Asset
        </h2>

        <div className="flex flex-col md:flex-row gap-4 relative" ref={dropdownRef}>
          {/* Custom Searchable Dropdown */}
          <div className="relative flex-grow">
            <button
              id="stock-selector-trigger"
              type="button"
              disabled={isLoadingStocks || isPredicting}
              onClick={() => setIsOpen(!isOpen)}
              className="w-full bg-[#1e293b] text-on-surface border border-outline-variant rounded-lg p-3 text-left font-body-sm text-body-sm flex justify-between items-center custom-input focus:ring-0 disabled:opacity-50 select-none relative"
            >
              <span>
                {isLoadingStocks
                  ? 'Loading assets...'
                  : selectedStock
                  ? `${cleanSymbol(selectedStock)} (${selectedStock})`
                  : 'Select a stock'}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant pointer-events-none text-base">
                arrow_drop_down
              </span>
            </button>

            {/* Dropdown Options */}
            {isOpen && (
              <div className="absolute z-30 mt-2 w-full bg-[#172237] border border-outline-variant rounded-lg shadow-xl overflow-hidden backdrop-blur-md">
                <div className="p-2 border-b border-white/5 flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm ml-2">search</span>
                  <input
                    id="stock-search-input"
                    type="text"
                    placeholder="Search stock symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-on-surface placeholder-on-surface-variant text-sm py-1.5 focus:outline-none focus:ring-0 border-0"
                    autoFocus
                  />
                </div>
                <ul className="max-h-60 overflow-y-auto py-1">
                  {filteredStocks.length > 0 ? (
                    filteredStocks.map((stock) => (
                      <li key={stock}>
                        <button
                          id={`stock-option-${stock.replace('.', '-')}`}
                          type="button"
                          onClick={() => handleSelect(stock)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-primary/10 flex justify-between items-center ${
                            selectedStock === stock ? 'text-primary bg-primary/5 font-semibold' : 'text-on-surface'
                          }`}
                        >
                          <span className="font-body-sm text-body-sm">{cleanSymbol(stock)}</span>
                          <span className="font-mono-data text-mono-data text-on-surface-variant text-xs">{stock}</span>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-on-surface-variant text-center">
                      No stocks found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Action Prediction Button */}
          <button
            id="btn-run-prediction"
            type="button"
            disabled={isPredicting || isLoadingStocks || !selectedStock}
            onClick={onRunPrediction}
            className="md:w-auto px-8 bg-primary text-on-primary py-3 rounded-lg font-label-md text-label-md tracking-wide hover:bg-primary-container transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 select-none"
          >
            {isPredicting ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                <span>Running Prediction...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">auto_graph</span>
                <span>Run Prediction</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
