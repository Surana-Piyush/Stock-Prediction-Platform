import React from 'react';

/**
 * SignalCard displays the ML prediction recommendation signal in a styled badge with shadow glows.
 * @param {object} props
 * @param {string} props.signal - 'BUY', 'STRONG BUY', 'SELL', 'STRONG SELL', 'HOLD'
 * @param {number} props.confidence - Model confidence
 * @param {boolean} props.isLoading - Loading state
 */
export default function SignalCard({ signal, confidence, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-card inner-glow rounded-xl p-6 border border-white/10 flex flex-col items-center justify-center text-center animate-pulse h-full min-h-[160px]">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-white/10 rounded-full w-1/2 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    );
  }

  const hasData = signal && signal !== '--';

  // Config mapping for signals matching standard tailwind parameters
  const configs = {
    'STRONG BUY': {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-[#10b981]',
      shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      desc: 'Strong upward momentum predicted based on model output.'
    },
    'BUY': {
      bg: 'bg-secondary/10 border border-secondary/20 text-secondary',
      shadow: 'shadow-[0_0_20px_rgba(78,222,163,0.1)]',
      desc: 'Upward momentum predicted based on model output.'
    },
    'HOLD': {
      bg: 'bg-amber-500/10 border border-amber-500/20 text-[#f59e0b]',
      shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
      desc: 'Neutral consolidated sideways price action predicted.'
    },
    'SELL': {
      bg: 'bg-red-500/10 border border-red-500/20 text-[#f43f5e]',
      shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]',
      desc: 'Downward momentum predicted based on model output.'
    },
    'STRONG SELL': {
      bg: 'bg-rose-950/20 border border-rose-500/30 text-[#e11d48]',
      shadow: 'shadow-[0_0_20px_rgba(225,29,72,0.15)]',
      desc: 'Strong downward momentum predicted based on model output.'
    },
  };

  const current = hasData ? configs[signal.toUpperCase()] || {
    bg: 'bg-white/5 border border-white/10 text-on-surface-variant',
    shadow: 'shadow-none',
    desc: 'Select a stock and run a prediction to generate a recommendation signal.'
  } : {
    bg: 'bg-white/5 border border-white/10 text-on-surface-variant',
    shadow: 'shadow-none',
    desc: 'Select a stock and run a prediction to generate a recommendation signal.'
  };

  return (
    <div className="glass-card inner-glow rounded-xl p-6 border border-white/10 flex flex-col items-center justify-center text-center h-full min-h-[160px] transition-all duration-300 hover:scale-[1.02]">
      <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-2">
        Algorithm Signal
      </h3>

      {!hasData ? (
        <>
          <div className="bg-white/5 border border-white/10 text-on-surface-variant px-8 py-3 rounded-full font-display-lg-mobile text-display-lg-mobile mb-3 select-none">
            --
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {current.desc}
          </p>
        </>
      ) : (
        <>
          <div className={`px-8 py-3 rounded-full font-display-lg-mobile text-display-lg-mobile mb-3 border uppercase select-none transition-all duration-500 ${current.bg} ${current.shadow}`}>
            {signal}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {current.desc}
          </p>
          {confidence !== undefined && confidence !== '--' && (
            <span className="text-xs text-primary font-mono mt-1 opacity-70">
              Confidence: {confidence}%
            </span>
          )}
        </>
      )}
    </div>
  );
}
