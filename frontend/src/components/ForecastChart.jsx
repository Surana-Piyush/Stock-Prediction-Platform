import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * Custom Tooltip for the chart
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#172237] border border-outline-variant rounded-lg p-3 shadow-xl backdrop-blur-md">
        <p className="text-[12px] font-semibold text-on-surface-variant mb-1 font-sans">
          {payload[0].payload.label || 'Forecast point'}
        </p>
        <p className="text-sm font-semibold text-primary font-mono">
          ₹{payload[0].value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * ForecastChart component rendering a smooth line/area chart matching the Stitch theme.
 * @param {object} props
 * @param {number} props.currentPrice - Today's stock price
 * @param {number} props.predictedPrice - Tomorrow's predicted price
 * @param {boolean} props.isLoading - Loading state
 */
export default function ForecastChart({ currentPrice, predictedPrice, isLoading }) {
  const hasData = currentPrice && predictedPrice && currentPrice !== '--' && predictedPrice !== '--';

  // Generate smooth intermediate points using Bezier interpolation
  const getChartData = () => {
    if (!hasData) return [];
    
    const steps = 8;
    const data = [];
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Hermite/Bezier ease-in-out S-curve interpolation
      const easeT = t * t * (3 - 2 * t);
      const interpolatedPrice = currentPrice + (predictedPrice - currentPrice) * easeT;
      
      let label = '';
      if (i === 0) label = 'Today';
      if (i === steps) label = 'Tomorrow';
      
      data.push({
        label,
        price: Number(interpolatedPrice.toFixed(2)),
      });
    }
    return data;
  };

  const chartData = getChartData();
  const isUpward = predictedPrice >= currentPrice;

  // Determine Y-axis padding
  const prices = chartData.map(d => d.price);
  const minPrice = Math.min(...(prices.length ? prices : [0])) * 0.995;
  const maxPrice = Math.max(...(prices.length ? prices : [0])) * 1.005;

  return (
    <div className="glass-card inner-glow rounded-xl p-6 flex flex-col min-h-[350px] h-full transition-all duration-300 hover:scale-[1.01] border border-white/10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">insights</span> Trajectory Forecast
        </h2>
        {hasData && (
          <div className="flex gap-2 select-none">
            <span className="flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
              <div className="w-2 h-2 rounded-full bg-outline"></div> Historical
            </span>
            <span className="flex items-center gap-1 font-label-md text-label-md text-primary">
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#adc6ff]"></div> Predicted
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex-grow flex items-center justify-center min-h-[220px]">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl animate-spin">sync</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Calculating trajectory forecast...</span>
          </div>
        </div>
      ) : !hasData ? (
        <div className="flex-grow chart-grid rounded-lg border border-white/5 flex flex-col items-center justify-center text-center p-6 relative overflow-hidden min-h-[220px]">
          <div className="absolute inset-0 bg-[#0f172a]/20 pointer-events-none"></div>
          <span className="material-symbols-outlined text-outline/30 text-3xl mb-2">analytics</span>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">No Prediction Active</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[280px]">
            Select an asset and run a prediction to render the price trajectory.
          </p>
        </div>
      ) : (
        <div className="flex-grow w-full h-[220px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTrajectory" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={isUpward ? '#4edea3' : '#f43f5e'}
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor={isUpward ? '#4edea3' : '#f43f5e'}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255, 255, 255, 0.05)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#c2c6d6', fontSize: 11 }}
                dy={10}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#c2c6d6', fontSize: 11, fontFamily: 'monospace' }}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.06)' }} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isUpward ? '#4edea3' : '#f43f5e'}
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTrajectory)"
                activeDot={{
                  r: 6,
                  stroke: '#0b1326',
                  strokeWidth: 2,
                  fill: isUpward ? '#4edea3' : '#f43f5e',
                }}
                isAnimationActive={true}
                animationDuration={850}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
