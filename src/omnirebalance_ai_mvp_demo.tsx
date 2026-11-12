import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingDown, 
  RefreshCw, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Globe, 
  Layers, 
  ArrowRight,
  Info,
  HelpCircle
} from 'lucide-react';

export default function OmniRebalanceMVP() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'guide'>('dashboard');
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [rebalanceStatus, setRebalanceStatus] = useState<string | null>(null);
  const [riskTolerance, setRiskTolerance] = useState<number>(15); // 15% drop threshold

  // Portfolio State ($400 total across 4 chains)
  const [portfolio, setPortfolio] = useState([
    { chain: 'Solana', token: 'SOL', value: 100, change: '+2.4%', status: 'Normal', icon: '🟣' },
    { chain: 'Ethereum', token: 'ETH', value: 100, change: '-1.2%', status: 'Normal', icon: '🔵' },
    { chain: 'Bitcoin', token: 'BTC', value: 100, change: '+0.5%', status: 'Normal', icon: '🟠' },
    { chain: 'Avalanche', token: 'AVAX', value: 100, change: '-0.8%', status: 'Normal', icon: '🔴' }
  ]);

  const [usdcBalance, UsdcBalance] = useState(0);

  // Trigger Market Crash Simulation
  const simulateMarketEvent = (targetToken: string, dropPercent: number) => {
    setIsRebalancing(true);
    setRebalanceStatus(`⚠️ Market Alert: ${targetToken} dropped by ${dropPercent}%. Safety shield activated!`);

    setTimeout(() => {
      setPortfolio(prev => prev.map(item => {
        if (item.token === targetToken) {
          const lossValue = item.value * (dropPercent / 100);
          const remaining = item.value - lossValue;
          // Move crashing funds into safe USDC
          UsdcBalance(u => u + remaining);
          return { ...item, value: 0, change: `-${dropPercent}%`, status: 'Secured in USDC' };
        }
        return item;
      }));
      setRebalanceStatus(`✅ Success! Your ${targetToken} was safely converted into stable USDC to protect you from further loss.`);
      setIsRebalancing(false);
    }, 2000);
  };

  const resetPortfolio = () => {
    setPortfolio([
      { chain: 'Solana', token: 'SOL', value: 100, change: '+2.4%', status: 'Normal', icon: '🟣' },
      { chain: 'Ethereum', token: 'ETH', value: 100, change: '-1.2%', status: 'Normal', icon: 'Normal' },
      { chain: 'Bitcoin', token: 'BTC', value: 100, change: '+0.5%', status: 'Normal', icon: '🟠' },
      { chain: 'Avalanche', token: 'AVAX', value: 100, change: '-0.8%', status: 'Normal', icon: '🔴' }
    ]);
    UsdcBalance(0);
    setRebalanceStatus(null);
  };

  const totalPortfolioValue = portfolio.reduce((acc, curr) => acc + curr.value, 0) + usdcBalance;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
              🛡️ Non-Custodial Safety Active
            </span>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/20">
              Zero Gas Fees for You
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2 text-white flex items-center gap-2">
            OmniRebalance AI <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">Consumer Edition</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your automated financial assistant that protects your crypto across multiple blockchains.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            My Portfolio
          </button>
          <button 
            onClick={() => setActiveTab('simulator')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'simulator' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            Live Market Test
          </button>
          <button 
            onClick={() => setActiveTab('guide')} 
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'guide' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
          >
            How It Works
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto space-y-8">

        {/* Status Notification */}
        {rebalanceStatus && (
          <div className="bg-indigo-950/60 border border-indigo-500/40 p-4 rounded-xl flex items-start gap-3 shadow-lg animate-fade-in">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-indigo-200">{rebalanceStatus}</div>
            {isRebalancing && <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />}
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                <span className="text-sm text-slate-400">Total Portfolio Value</span>
                <div className="text-3xl font-bold text-white mt-1">${totalPortfolioValue.toFixed(2)}</div>
                <span className="text-xs text-emerald-400 flex items-center gap-1 mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All chains monitored 24/7
                </span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                <span className="text-sm text-slate-400">Safe Cash Storage (USDC)</span>
                <div className="text-3xl font-bold text-emerald-400 mt-1">${usdcBalance.toFixed(2)}</div>
                <span className="text-xs text-slate-400 mt-2 block">Protected from market drops</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
                <span className="text-sm text-slate-400">AI Protection Setting</span>
                <div className="text-2xl font-bold text-indigo-400 mt-1">-{riskTolerance}% Drop Limit</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-400">Sensitivity:</span>
                  <input 
                    type="range" 
                    min="5" 
                    max="30" 
                    value={riskTolerance} 
                    onChange={(e) => setRiskTolerance(Number(e.target.value))}
                    className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-300">{riskTolerance}%</span>
                </div>
              </div>
            </div>

            {/* Assets Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">Connected Chain Assets</h2>
                <button 
                  onClick={resetPortfolio}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset Demo
                </button>
              </div>

              <div className="space-y-3">
                {portfolio.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-semibold text-white">{item.chain} ({item.token})</div>
                        <div className="text-xs text-slate-400">Status: <span className={item.status === 'Secured in USDC' ? 'text-amber-400 font-medium' : 'text-emerald-400'}>{item.status}</span></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white">${item.value.toFixed(2)}</div>
                      <div className="text-xs text-slate-400">{item.change} past 24h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Test the AI Market Crash Protection</h2>
              <p className="text-slate-400 text-sm mt-1">
                Click any emergency button below to simulate a sudden market crash. Watch how the AI automatically detects the danger and moves your money into safe digital cash (USDC) instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                disabled={isRebalancing}
                onClick={() => simulateMarketEvent('SOL', 18)}
                className="p-5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 rounded-xl text-left transition flex justify-between items-center group"
              >
                <div>
                  <div className="font-semibold text-purple-200">Simulate Solana Flash Crash</div>
                  <div className="text-xs text-purple-400/80 mt-1">SOL drops by -18% unexpectedly</div>
                </div>
                <TrendingDown className="w-6 h-6 text-purple-400 group-hover:scale-110 transition" />
              </button>

              <button 
                disabled={isRebalancing}
                onClick={() => simulateMarketEvent('ETH', 15)}
                className="p-5 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 rounded-xl text-left transition flex justify-between items-center group"
              >
                <div>
                  <div className="font-semibold text-blue-200">Simulate Ethereum Volatility</div>
                  <div className="text-xs text-blue-400/80 mt-1">ETH drops by -15% unexpectedly</div>
                </div>
                <TrendingDown className="w-6 h-6 text-blue-400 group-hover:scale-110 transition" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-300">Non-Custodial Guarantee:</span> Your funds are never held by us. The AI only has permission to secure your assets when your chosen drop limit is breached, keeping you in complete control.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GUIDE FOR NON-CRYPTO USERS */}
        {activeTab === 'guide' && (
          <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold text-white">How OmniRebalance AI Works (Plain English)</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">1</div>
                <h3 className="font-semibold text-white">24/7 Monitoring</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The AI watches your holdings across Solana, Ethereum, Bitcoin, and Avalanche around the clock so you don't have to watch charts all day.
                </p>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">2</div>
                <h3 className="font-semibold text-white">Automatic Safety Shield</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If a token drops past your safety threshold (e.g., -15%), the AI instantly trades it into stable digital cash (USDC) to preserve your capital.
                </p>
              </div>

              <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">3</div>
                <h3 className="font-semibold text-white">Zero Gas Fees</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Competitors in the background pay to execute your trade in an open auction, meaning you never have to pay transaction fees out of pocket.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}