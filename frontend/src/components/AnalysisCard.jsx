import React, { useState } from 'react';

/**
 * AnalysisCard displays the AI-generated prediction analysis and model specs in a tabbed card interface.
 * @param {object} props
 * @param {string} props.analysis - AI-generated analysis text
 * @param {number|string} props.rmse - Root Mean Squared Error
 * @param {number|string} props.r2 - R² Score
 * @param {number|string} props.directionAccuracy - Directional Accuracy
 * @param {boolean} props.isLoading - Loading state
 */
export default function AnalysisCard({ analysis, rmse, r2, directionAccuracy, isLoading }) {
  const [activeTab, setActiveTab] = useState('analysis');

  if (isLoading) {
    return (
      <div className="glass-card inner-glow rounded-xl p-6 border border-white/10 h-full min-h-[295px] flex flex-col justify-between animate-pulse">
        <div>
          {/* Tab skeleton */}
          <div className="flex gap-4 border-b border-white/10 pb-2 mb-4">
            <div className="h-5 bg-white/10 rounded w-24"></div>
            <div className="h-5 bg-white/10 rounded w-24"></div>
          </div>
          {/* Content skeleton */}
          <div className="flex flex-col gap-3">
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
            <div className="h-4 bg-white/10 rounded w-4/6"></div>
          </div>
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
      default:
        return num.toString();
    }
  };

  const hasData = analysis && analysis !== '--';

  return (
    <div className="glass-card inner-glow rounded-xl p-6 border border-white/10 transition-all duration-300 hover:scale-[1.02] h-full min-h-[295px] flex flex-col justify-between">
      <div>
        {/* Tabs Bar */}
        <div className="flex gap-4 border-b border-white/10 mb-5 select-none">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex items-center gap-1.5 pb-2.5 px-1 font-headline-sm text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'analysis'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">psychology</span> AI Analysis
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-1.5 pb-2.5 px-1 font-headline-sm text-sm font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-base">insights</span> Model Specs
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'analysis' ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
            {!hasData ? (
              <div className="flex flex-col items-center justify-center text-center py-6 text-on-surface-variant/50">
                <span className="material-symbols-outlined text-4xl mb-2">auto_awesome</span>
                <p className="font-body-sm text-body-sm max-w-[240px]">
                  Select an asset and run a prediction to see AI analysis.
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5 animate-pulse">
                  auto_awesome
                </span>
                <div className="flex flex-col">
                  <span className="font-label-md text-[11px] text-primary tracking-wider uppercase mb-1">
                    AI Forecast Narrative
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed text-justify">
                    {analysis}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Core Engine</span>
              <span className="font-mono-data text-mono-data text-on-surface bg-surface-bright px-2 py-1 rounded">MLP Regressor</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="font-body-sm text-body-sm text-on-surface-variant">Key Features</span>
              <span className="font-mono-data text-mono-data text-on-surface bg-surface-bright px-2 py-1 rounded">SMA, RSI, MACD</span>
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
        )}
      </div>

      {activeTab === 'specs' && (
        <div className="text-[10px] text-on-surface-variant/40 font-mono mt-4 text-right">
          Layer sizes: [256, 128, 64, 32, 16]
        </div>
      )}
    </div>
  );
}
