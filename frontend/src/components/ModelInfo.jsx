import React from 'react';

/**
 * ModelInfo displays the details and performance metrics of the ML model.
 * @param {object} props
 * @param {number|string} props.rmse - Root Mean Squared Error
 * @param {number|string} props.r2 - R² Score
 * @param {number|string} props.directionAccuracy - Directional Accuracy
 * @param {number|string} props.confidence - Confidence score
 * @param {boolean} props.isLoading - Loading state
 */
export default function ModelInfo({ rmse, r2, directionAccuracy, confidence, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card inner-glow rounded-xl p-6 border border-white/10 h-full animate-pulse">
        <div className="h-5 bg-white/10 rounded w-1/2 mb-4"></div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex justify-between items-center pb-2 border-b border-white/5">
              <div className="h-4 bg-white/10 rounded w-1/3"></div>
              <div className="h-6 bg-white/10 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatMetric = (val, type) => {
    if (val === undefined || val === null || val === '--') return '--';
    const num = Number(val);
    if (isNaN(num)) return String(val);

    switch (type) {
      case 'rmse':
        return num.toFixed(3);
      case 'r2':
        return num.toFixed(4);
      case 'accuracy':
        return `${(num * 100).toFixed(0)}%`;
      case 'confidence':
        return `${num.toFixed(2)}%`;
      default:
        return num.toString();
    }
  };

  const hasData = rmse !== undefined && rmse !== null && rmse !== '--';

  return (
    <div className="glass-card inner-glow rounded-xl p-6 border border-white/10 transition-all duration-300 hover:scale-[1.02] h-full flex flex-col justify-between">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">architecture</span> Model Architecture
        </h2>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Core Engine</span>
            <span className="font-mono-data text-mono-data text-on-surface bg-surface-bright px-2 py-1 rounded">MLP Regressor</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Key Features</span>
            <span className="font-mono-data text-mono-data text-on-surface bg-surface-bright px-2 py-1 rounded">SMA, RSI, MACD</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Data Pipeline</span>
            <span className="font-mono-data text-mono-data text-on-surface bg-surface-bright px-2 py-1 rounded">NSE Real-time</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">RMSE</span>
            <span className="font-mono-data text-mono-data text-on-surface bg-surface-bright px-2 py-1 rounded">
              {formatMetric(rmse, 'rmse')}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="font-body-sm text-body-sm text-on-surface-variant">R² Score</span>
            <span className="font-mono-data text-mono-data text-on-surface bg-surface-bright px-2 py-1 rounded">
              {formatMetric(r2, 'r2')}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-body-sm text-body-sm text-on-surface-variant">Direction Accuracy</span>
            <span className="font-mono-data text-mono-data text-on-surface bg-surface-bright px-2 py-1 rounded">
              {formatMetric(directionAccuracy, 'accuracy')}
            </span>
          </div>
        </div>
      </div>
      
      {hasData && (
        <div className="text-[10px] text-on-surface-variant/40 font-mono mt-4 text-right">
          Layer sizes: [256, 128, 64, 32, 16]
        </div>
      )}
    </div>
  );
}
