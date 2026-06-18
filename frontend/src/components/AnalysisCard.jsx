import React from 'react';

/**
 * Helper to generate fallback analysis if backend doesn't provide it
 */
function generateFallbackAnalysis(signal, expectedChange, symbol) {
  const cleanSymbol = symbol ? symbol.replace('.NS', '') : 'Asset';
  const changeText = expectedChange !== undefined && expectedChange !== '--'
    ? ` of ${Number(expectedChange).toFixed(2)}%`
    : '';

  switch (signal?.toUpperCase()) {
    case 'STRONG BUY':
      return `The model identifies strong bullish momentum for ${cleanSymbol} supported by recent market trends and technical indicators. Current conditions suggest a high probability of continued upward movement${changeText}.`;
    case 'BUY':
      return `The model predicts upward movement for ${cleanSymbol} based on recent price action and momentum indicators. Current market conditions suggest positive short-term potential with a bullish outlook${changeText}.`;
    case 'HOLD':
      return `The model indicates neutral market conditions for ${cleanSymbol} with no strong directional bias. Current price action suggests monitoring the stock for clearer trend confirmation before taking action.`;
    case 'SELL':
      return `The model predicts downward movement for ${cleanSymbol} based on recent price action and momentum indicators. Current market conditions suggest weakness and a bearish short-term outlook${changeText}.`;
    case 'STRONG SELL':
      return `The model detects strong bearish momentum for ${cleanSymbol} supported by recent market trends and technical indicators. Current conditions indicate elevated downside risk in the near term.`;
    default:
      return `The model indicates neutral consolidated sideways price action for ${cleanSymbol}. Current conditions suggest monitoring the stock for a clearer trend confirmation.`;
  }
}

/**
 * AnalysisCard displays the AI-generated prediction analysis.
 * @param {object} props
 * @param {string} props.analysis - AI-generated analysis text
 * @param {string} props.signal - Algorithm signal (fallback helper)
 * @param {number|string} props.expectedChange - Expected change return (fallback helper)
 * @param {string} props.symbol - Stock symbol (fallback helper)
 * @param {boolean} props.isLoading - Loading state
 */
export default function AnalysisCard({ analysis, signal, expectedChange, symbol, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card inner-glow rounded-xl p-6 border border-white/10 h-full min-h-[295px] flex flex-col justify-between animate-pulse">
        <div>
          <div className="h-6 bg-white/10 rounded w-1/3 mb-6"></div>
          <div className="flex flex-col gap-3">
            <div className="h-4 bg-white/10 rounded w-full"></div>
            <div className="h-4 bg-white/10 rounded w-5/6"></div>
            <div className="h-4 bg-white/10 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Determine the analysis text to display (preferring backend analysis, falling back to local generator)
  const displayAnalysis = (analysis && analysis !== '--')
    ? analysis
    : (signal && signal !== '--' ? generateFallbackAnalysis(signal, expectedChange, symbol) : null);

  return (
    <div className="glass-card inner-glow rounded-xl p-6 border border-white/10 transition-all duration-300 hover:scale-[1.02] h-full min-h-[295px] flex flex-col justify-between">
      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2 select-none border-b border-white/5 pb-3">
          <span className="material-symbols-outlined text-primary text-xl">psychology</span> AI Analysis
        </h2>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
          {!displayAnalysis ? (
            <div className="flex flex-col items-center justify-center text-center py-10 text-on-surface-variant/50 select-none">
              <span className="material-symbols-outlined text-4xl mb-2 text-primary/40 animate-pulse">auto_awesome</span>
              <p className="font-body-sm text-body-sm max-w-[240px]">
                Select an asset and run a prediction to see AI analysis.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 select-none">
                <span className="material-symbols-outlined text-primary text-lg animate-pulse">
                  auto_awesome
                </span>
                <span className="font-label-md text-label-md text-primary tracking-wider uppercase">
                  AI Forecast Narrative
                </span>
              </div>
              <div className="bg-[#0f172a]/40 border border-white/5 rounded-xl p-5 shadow-inner">
                <p className="font-body-md text-body-md text-on-surface-variant/95 leading-relaxed text-left">
                  {displayAnalysis}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
