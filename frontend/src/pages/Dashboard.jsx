import React, { useState, useEffect } from 'react';
import { getStocks, predictStock } from '../services/api';
import MetricCard from '../components/MetricCard';
import StockSelector from '../components/StockSelector';
import SignalCard from '../components/SignalCard';
import ForecastChart from '../components/ForecastChart';
import AnalysisCard from '../components/AnalysisCard';
import screenImage from '../assets/screen.png';

export default function Dashboard() {
  // States
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [predictionData, setPredictionData] = useState(null);
  const [isLoadingStocks, setIsLoadingStocks] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(!localStorage.getItem('nifty_disclaimer_agreed'));

  const handleAgreeDisclaimer = () => {
    localStorage.setItem('nifty_disclaimer_agreed', 'true');
    setShowDisclaimer(false);
  };

  // Load stock list on mount
  useEffect(() => {
    async function loadStocks() {
      try {
        setIsLoadingStocks(true);
        const stockList = await getStocks();
        setStocks(stockList);
        
        // Default selection: RELIANCE.NS
        if (stockList && stockList.length > 0) {
          const defaultStock = stockList.includes('RELIANCE.NS') 
            ? 'RELIANCE.NS' 
            : stockList[0];
          setSelectedStock(defaultStock);
        }
      } catch (err) {
        console.error('Failed to load stock list:', err);
        showToast('Failed to load stock list. Please refresh the page.');
      } finally {
        setIsLoadingStocks(false);
      }
    }
    loadStocks();
  }, []);

  // Show Toast notification helper
  const showToast = (message) => {
    setToastMessage(message);
    // Auto-hide toast after 4 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Run prediction action
  const handleRunPrediction = async () => {
    if (!selectedStock || isPredicting) return;

    try {
      setIsPredicting(true);
      const data = await predictStock(selectedStock);
      
      // Standardize the response data object to handle any key spacing inconsistencies.
      // E.g., the python script outputs "ExpectedReturn " (with a trailing space).
      const cleanedData = {
        ...data,
        ExpectedReturn: data.ExpectedReturn !== undefined 
          ? data.ExpectedReturn 
          : (data['ExpectedReturn '] !== undefined ? data['ExpectedReturn '] : null)
      };

      setPredictionData(cleanedData);
    } catch (err) {
      console.error('Prediction request failed:', err);
      showToast('Prediction failed. Please try again.');
    } finally {
      setIsPredicting(false);
    }
  };

  // Extract values for easy binding
  const currentPrice = predictionData ? predictionData.CurrentPrice : '--';
  const predictedPrice = predictionData ? predictionData.PredictedPrice : '--';
  const expectedReturn = predictionData ? predictionData.ExpectedReturn : undefined;
  const confidence = predictionData ? predictionData.Confidence : '--';
  const signal = predictionData ? predictionData.Signal : '--';
  const rmse = predictionData ? predictionData.rmse : '--';
  const r2 = predictionData ? predictionData.r2 : '--';
  const directionAccuracy = predictionData ? predictionData.DirectionAccuracy : '--';
  const analysis = predictionData ? predictionData.Analysis : '--';

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-sm relative bg-[#0b1326] text-[#dae2fd]">
      
      {/* Disclaimer Pop Up */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 bg-[#060e20]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-xl border border-white/10 p-6 md:p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-300 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="font-headline-md text-on-surface mb-4 flex items-center justify-center gap-2">
              <span>⚠️</span> Disclaimer
            </h2>
            <p className="font-body-sm text-on-surface-variant leading-relaxed mb-6 text-left whitespace-pre-line">
              NIFTY.AI provides AI-generated stock predictions for educational and informational purposes only. These predictions should not be considered financial or investment advice. Stock market investments are subject to risk, and users should conduct their own research before making any investment decisions.
            </p>
            <button
              id="btn-agree-disclaimer"
              onClick={handleAgreeDisclaimer}
              className="w-full py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md tracking-wider uppercase hover:bg-[#8eb0ff] active:scale-95 transition-all select-none font-semibold cursor-pointer"
            >
              I Agree
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-bounce max-w-sm w-full bg-[#1e1b29] border border-red-500/40 rounded-xl p-4 flex items-start gap-3 shadow-[0_0_25px_rgba(239,68,68,0.15)] backdrop-blur-md">
          <span className="material-symbols-outlined text-red-500 mt-0.5 text-xl">warning</span>
          <div className="flex-grow">
            <p className="font-headline-sm text-xs font-semibold text-white">Prediction Error</p>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">{toastMessage}</p>
          </div>
          <button 
            id="btn-close-toast"
            onClick={() => setToastMessage(null)}
            className="text-on-surface-variant hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-surface-container/50 dark:bg-surface-container-high/50 backdrop-blur-xl shadow-sm border-b border-white/10 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 select-none">
        <div className="flex items-center gap-2 cursor-pointer active:scale-95 transition-all hover:brightness-125">
          <span className="material-symbols-outlined text-primary font-bold">monitoring</span>
          <span className="font-headline-sm text-headline-sm md:font-headline-md md:text-headline-md tracking-tighter text-primary dark:text-primary font-bold">NIFTY.AI</span>
        </div>
        <div className="flex items-center"></div>
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-24 pb-20 px-margin-mobile md:px-margin-desktop flex flex-col gap-stack-lg max-w-container-max mx-auto w-full relative z-10">
        
        {/* Hero Section */}
        <section className="relative rounded-xl overflow-hidden glass-card p-6 md:p-10 min-h-[300px] flex flex-col justify-center border border-white/10">
          <div className="grid md:grid-cols-2 gap-gutter items-center">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-label-md text-label-md mb-4 uppercase tracking-wider">
                Predictive Intelligence
              </span>
              <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-4 tracking-tight">
                AI-Powered Nifty 50 Stock Prediction
              </h1>
              <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg text-on-surface-variant mb-8 max-w-xl leading-relaxed">
                Machine Learning based next-day stock price forecasts utilizing advanced neural networks and real-time NSE data streams.
              </p>
              <div className="flex flex-wrap gap-4">
                <button 
                  id="btn-predict-now"
                  onClick={handleRunPrediction}
                  disabled={isPredicting || isLoadingStocks}
                  className="bg-primary text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md tracking-wide hover:bg-primary-container transition-colors active:scale-95 disabled:opacity-50"
                >
                  Predict Now
                </button>
                <a 
                  id="btn-learn-more"
                  href="#trajectory"
                  className="bg-transparent border border-outline-variant text-on-surface px-6 py-3 rounded-lg font-label-md text-label-md tracking-wide hover:bg-surface-bright transition-colors active:scale-95 inline-flex items-center justify-center select-none"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="relative h-full min-h-[300px] rounded-xl overflow-hidden shadow-xl">
              <img 
                alt="AI Predictions Illustration" 
                className="w-full h-full object-cover" 
                src={screenImage}
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/20 to-background/60"></div>
            </div>
          </div>
        </section>

        {/* Main Dashboard Layout Grid */}
        <div className="grid grid-cols-4 md:grid-cols-12 gap-gutter">
          
          {/* Metrics Row */}
          <div className="col-span-4 md:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-gutter mb-4">
            <MetricCard 
              title="Current Price" 
              value={currentPrice} 
              isLoading={isPredicting} 
            />
            <MetricCard 
              title="Predicted (Tomorrow)" 
              value={predictedPrice} 
              isLoading={isPredicting}
            />
            <MetricCard 
              title="Expected Change" 
              value={expectedReturn !== undefined ? expectedReturn : '--'} 
              expectedChange={expectedReturn}
              isLoading={isPredicting}
            />
            <MetricCard 
              title="Confidence" 
              value={confidence} 
              isLoading={isPredicting}
            />
          </div>

          {/* Controls & Signal Row */}
          <div className="col-span-4 md:col-span-12 grid md:grid-cols-2 gap-gutter">
            <StockSelector
              stocks={stocks}
              selectedStock={selectedStock}
              onSelectStock={setSelectedStock}
              onRunPrediction={handleRunPrediction}
              isPredicting={isPredicting}
              isLoadingStocks={isLoadingStocks}
            />
            <SignalCard
              signal={signal}
              confidence={confidence}
              isLoading={isPredicting}
            />
          </div>

          {/* Visualization & Sidebar Row */}
          <div id="trajectory" className="col-span-4 md:col-span-8">
            <ForecastChart
              currentPrice={predictionData ? predictionData.CurrentPrice : null}
              predictedPrice={predictionData ? predictionData.PredictedPrice : null}
              isLoading={isPredicting}
            />
          </div>

          <div className="col-span-4 md:col-span-4">
            <AnalysisCard
              analysis={analysis}
              signal={signal}
              expectedChange={expectedReturn}
              symbol={selectedStock}
              isLoading={isPredicting}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-stack-md px-margin-mobile md:px-margin-desktop py-stack-lg relative z-10 select-none">
        <div className="flex flex-col gap-1 font-label-md text-label-md text-on-surface-variant items-start">
          <div>© {new Date().getFullYear()} NIFTY.AI. Powered by MLP Regression &amp; Real-time NSE Data.</div>
          <div className="text-primary font-semibold text-xs mt-0.5">Made By Piyush Surana</div>
        </div>
      </footer>

    </div>
  );
}
