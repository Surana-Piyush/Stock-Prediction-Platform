import React from 'react';

/**
 * MetricCard renders the exact HTML card structure from the Stitch design system.
 * @param {object} props
 * @param {string} props.title - 'CURRENT PRICE', 'PREDICTED (TOMORROW)', 'EXPECTED CHANGE', 'CONFIDENCE'
 * @param {string|number} props.value - Display value
 * @param {boolean} props.isLoading - Whether the card is loading
 * @param {number} [props.expectedChange] - Expected return value
 */
export default function MetricCard({ title, value, isLoading, expectedChange }) {
  const isPredicted = title.toUpperCase() === 'PREDICTED (TOMORROW)';
  const isExpectedChange = title.toUpperCase() === 'EXPECTED CHANGE';
  const hasData = value !== null && value !== undefined && value !== '--';

  // Format currency/percentage
  let displayValue = '--';
  if (hasData) {
    if (typeof value === 'number') {
      if (title.toUpperCase().includes('PRICE') || title.toUpperCase().includes('PREDICTED')) {
        displayValue = `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      } else if (title.toUpperCase().includes('CONFIDENCE')) {
        displayValue = `${value}%`;
      } else {
        displayValue = String(value);
      }
    } else {
      displayValue = String(value);
    }
  }

  // 1. Expected Change Card (positive green bg-secondary/5, negative red bg-error/5)
  if (isExpectedChange) {
    const isPositive = expectedChange >= 0;
    const bgClass = hasData 
      ? (isPositive ? 'bg-secondary/5 border-secondary/20' : 'bg-error/5 border-error/20')
      : 'border-white/10';
    const textClass = isPositive ? 'text-secondary' : 'text-error';
    const iconName = isPositive ? 'trending_up' : 'trending_down';

    return (
      <div className={`glass-card inner-glow rounded-xl p-4 flex flex-col border ${bgClass} transition-all duration-300 hover:scale-[1.02]`}>
        <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">
          {title}
        </span>
        {isLoading ? (
          <div className="h-8 w-24 bg-white/10 rounded animate-pulse mt-1"></div>
        ) : !hasData ? (
          <span className="font-headline-md text-headline-md text-on-surface">--</span>
        ) : (
          <div className={`flex items-center gap-1 ${textClass}`}>
            <span className="material-symbols-outlined text-sm">{iconName}</span>
            <span className="font-headline-md text-headline-md">
              {isPositive ? '+' : ''}{Number(expectedChange).toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. Predicted (Tomorrow) Card (primary blue highlight with top-down gradient overlay)
  if (isPredicted) {
    return (
      <div className="glass-card inner-glow rounded-xl p-4 flex flex-col relative overflow-hidden border border-white/10 transition-all duration-300 hover:scale-[1.02]">
        {hasData && (
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
        )}
        <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-1 relative z-10">
          {title}
        </span>
        {isLoading ? (
          <div className="h-8 w-32 bg-white/10 rounded animate-pulse mt-1 relative z-10"></div>
        ) : (
          <span className="font-headline-md text-headline-md text-primary relative z-10">
            {hasData ? displayValue : '--'}
          </span>
        )}
      </div>
    );
  }

  // 3. Current Price and Confidence Cards
  return (
    <div className="glass-card inner-glow rounded-xl p-4 flex flex-col border border-white/10 transition-all duration-300 hover:scale-[1.02]">
      <span className="font-label-md text-label-md text-on-surface-variant uppercase mb-1">
        {title}
      </span>
      {isLoading ? (
        <div className="h-8 w-28 bg-white/10 rounded animate-pulse mt-1"></div>
      ) : (
        <span className="font-headline-md text-headline-md text-on-surface">
          {hasData ? displayValue : '--'}
        </span>
      )}
    </div>
  );
}
