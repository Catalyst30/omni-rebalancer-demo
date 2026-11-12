import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  ShieldCheck,
  Zap,
  RefreshCw,
  Terminal,
  Code2,
  TrendingDown,
  TrendingUp,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Sliders,
  Wallet,
  Network,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  HelpCircle,
  X
} from 'lucide-react';

// Initial asset configuration for the unified omniagent.near Chain-Abstracted Portfolio
const INITIAL_ASSETS = [
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    chain: 'Solana Mainnet',
    chainBadge: 'SOL',
    color: '#14F195',
    bgAccent: 'rgba(20, 241, 149, 0.12)',
    price: 150.00,
    initialPrice: 150.00,
    balance: 0.6667, // ~$100.00
    targetWeight: 25,
    omftId: 'nep141:sol.omft.near',
    derivedAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    curve: 'Ed25519 (MPC)'
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    chain: 'Ethereum L1',
    chainBadge: 'EVM',
    color: '#627EEA',
    bgAccent: 'rgba(98, 126, 234, 0.14)',
    price: 2500.00,
    initialPrice: 2500.00,
    balance: 0.0400, // ~$100.00
    targetWeight: 25,
    omftId: 'nep141:eth.omft.near',
    derivedAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    curve: 'Secp256k1 (MPC)'
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    chain: 'Bitcoin Native',
    chainBadge: 'BTC',
    color: '#F7931A',
    bgAccent: 'rgba(247, 147, 26, 0.14)',
    price: 65000.00,
    initialPrice: 65000.00,
    balance: 0.001538, // ~$100.00
    targetWeight: 25,
    omftId: 'nep141:btc.omft.near',
    derivedAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    curve: 'Secp256k1 (MPC)'
  },
  {
    id: 'avax',
    symbol: 'AVAX',
    name: 'Avalanche',
    chain: 'Avalanche C-Chain',
    chainBadge: 'AVAX',
    color: '#E84142',
    bgAccent: 'rgba(232, 65, 66, 0.14)',
    price: 28.00,
    initialPrice: 28.00,
    balance: 3.5714, // ~$100.00
    targetWeight: 25,
    omftId: 'nep141:avax.omft.near',
    derivedAddress: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    curve: 'Secp256k1 (MPC)'
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'Safe-Haven Reserve',
    chain: 'NEAR / Multi-Chain Intent',
    chainBadge: 'USDC',
    color: '#2775CA',
    bgAccent: 'rgba(39, 117, 202, 0.15)',
    price: 1.00,
    initialPrice: 1.00,
    balance: 0.00, // $0.00 initially
    targetWeight: 0,
    omftId: 'nep141:usdc.omft.near',
    derivedAddress: 'omniagent.near (Verifier Vault)',
    curve: 'Native NEAR Ed25519'
  }
];

const SDK_INTEGRATION_SNIPPET = `import {
  IntentsSDK,
  createIntentSignerNearKeyPair,
} from '@defuse-protocol/intents-sdk';
import { KeyPair } from 'near-api-js';

/**
 * OmniRebalance AI — Autonomous Cross-Chain Rebalancer
 * Uses NEAR Intents SDK + NEAR Chain Signatures (v1.signer)
 */
export async function executeAutonomousRebalance({
  sourceAssetOmft, // e.g., "nep141:sol.omft.near"
  targetAssetOmft, // e.g., "nep141:usdc.omft.near"
  amountInAtomic,  // e.g., "333300000" (0.3333 SOL)
  minAmountOut,    // Enforced by Session Key 0.3% slippage guardrail
  destinationAddr, // Derived via v1.signer MPC contract
  destinationChain // e.g., "solana" | "ethereum" | "bitcoin"
}) {
  // 1. Initialize Scoped Session Key Signer (No Master Key Exposure)
  const sessionKeyPair = KeyPair.fromString(process.env.AGENT_SESSION_KEY!);
  const intentSigner = createIntentSignerNearKeyPair({
    signer: sessionKeyPair,
    accountId: 'omniagent.near',
  });

  // 2. Connect to NEAR Intents Verifier & Solver Network
  const sdk = new IntentsSDK({
    referral: 'omnirebalance-ai',
    intentSigner,
  });

  // 3. Broadcast Outcome-Based Intent (Off-chain Solvers compete for best fill)
  const { intentHash } = await sdk.signAndSendIntent({
    intents: [
      {
        intent: 'token_diff',
        diff: {
          [sourceAssetOmft]: \`-\${amountInAtomic}\`,
          [targetAssetOmft]: minAmountOut,
        },
      },
    ],
  });

  // 4. Atomic Settlement & Chain Signature Withdrawal (Gasless for User)
  const settlement = await sdk.waitForIntentSettlement({ intentHash });
  return {
    status: 'SETTLED_ATOMICALLY',
    intentHash,
    solver: settlement.winningSolver,
    settlementMs: settlement.latencyMs,
    chainSignatureSigner: 'v1.signer',
  };
}`;

export default function App() {
  // Portfolio & Simulation States
  const [assets, setAssets] = useState(INITIAL_ASSETS);
  const [viewMode, setViewMode] = useState('simulation'); // 'simulation' | 'sdk'
  const [autoRebalance, setAutoRebalance] = useState(true);

  // Onboarding Modal State
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);

  const onboardingSteps = [
    {
      title: "Welcome to OmniRebalance AI",
      subtitle: "Autonomous Cross-Chain Portfolio Guardian",
      description: "Managing crypto across Solana, Ethereum, Bitcoin, and Avalanche is fragmented. OmniRebalance AI acts as your 24/7 safety shield—protecting your capital against sudden crashes using NEAR Intents and Chain Signatures.",
      icon: <ShieldCheck className="w-8 h-8 text-[#00EC97]" />,
      badge: "Step 1 of 3"
    },
    {
      title: "Session-Key Guardrails",
      subtitle: "Full Control, Zero Custodial Risk",
      description: "Your master keys stay secure in MPC. The AI operates under strict user-defined rules (Drift Trigger %, Max Trade Cap %, Max Slippage) to automatically de-risk portfolios into USDC.",
      icon: <Sliders className="w-8 h-8 text-cyan-400" />,
      badge: "Step 2 of 3"
    },
    {
      title: "Test the Live Simulation",
      subtitle: "Simulate Market Crashes Instantly",
      description: "Use the Presentation Triggers on the dashboard to simulate a Solana Flash Crash or Ethereum Drop. Watch off-chain solvers compete and settle atomically in ~2 seconds with zero user gas fees.",
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      badge: "Step 3 of 3"
    }
  ];

  // Session Key Guardrails Configuration
  const [driftThreshold, setDriftThreshold] = useState(10); // % drift trigger
  const [maxTradeCap, setMaxTradeCap] = useState(50); // % of asset max trade
  const [maxSlippage, setMaxSlippage] = useState(0.3); // % max slippage
  const [hedgeStrategy, setHedgeStrategy] = useState('usdc'); // 'usdc' | 'momentum'

  // Execution Pipeline States
  const [pipelineState, setPipelineState] = useState({
    active: false,
    step: 0, // 0: idle, 1: AI Strategy, 2: Intent Broadcast, 3: Solver Bidding, 4: Settled
    sourceAsset: null,
    targetAsset: null,
    tradeUsdValue: 0,
    tradeTokenAmount: 0,
    reason: '',
    intentPayload: null,
    solvers: [],
    winningSolver: null,
    settlementTime: '2.1s',
  });

  // Audit Logs & Metrics
  const [logs, setLogs] = useState([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      title: 'OmniRebalance Agent Initialized',
      detail: 'Connected to omniagent.near | MPC Signer v1.signer Active | 14 Solvers Online',
      hash: '0x9f8e...3a1b',
    },
    {
      id: 'init-2',
      time: new Date().toLocaleTimeString(),
      type: 'GUARDRAIL',
      title: 'Session Key Guardrails Enforced',
      detail: 'Max Trade: 50% | Drift Trigger: 10.0% | Max Slippage: 0.30% | Gasless Relayer: ON',
      hash: '0x4c2d...8e90',
    }
  ]);

  const [capitalProtected, setCapitalProtected] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const pipelineLockRef = useRef(false);

  // Compute live portfolio metrics
  const totalPortfolioValue = assets.reduce((sum, a) => sum + a.balance * a.price, 0);

  const enrichedAssets = assets.map((asset) => {
    const usdValue = asset.balance * asset.price;
    const currentWeight = totalPortfolioValue > 0 ? (usdValue / totalPortfolioValue) * 100 : 0;
    const priceChangePct = ((asset.price - asset.initialPrice) / asset.initialPrice) * 100;
    const weightDrift = asset.targetWeight > 0 ? currentWeight - asset.targetWeight : 0;
    return {
      ...asset,
      usdValue,
      currentWeight,
      priceChangePct,
      weightDrift,
    };
  });

  // Helper to append to audit log
  const addLog = (type, title, detail, hash = null) => {
    setLogs((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        time: new Date().toLocaleTimeString(),
        type,
        title,
        detail,
        hash: hash || `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      },
      ...prev,
    ]);
  };

  // Core NEAR Intent Rebalance Execution Pipeline
  const triggerRebalancePipeline = (currentAssetsList, breachAsset, customReason = null) => {
    if (pipelineLockRef.current) return;
    pipelineLockRef.current = true;

    const source = breachAsset;
    const sourceUsd = source.balance * source.price;

    if (sourceUsd < 5) {
      pipelineLockRef.current = false;
      addLog('GUARDRAIL', 'Trade Skipped (Dust Threshold)', `${source.symbol} balance ($${sourceUsd.toFixed(2)}) below minimum execution floor.`);
      return;
    }

    let target;
    if (hedgeStrategy === 'usdc') {
      target = currentAssetsList.find((a) => a.id === 'usdc');
    } else {
      const candidates = currentAssetsList.filter((a) => a.id !== source.id && a.id !== 'usdc');
      target = candidates.reduce((best, curr) => {
        const bestPerf = (best.price - best.initialPrice) / best.initialPrice;
        const currPerf = (curr.price - curr.initialPrice) / curr.initialPrice;
        return currPerf > bestPerf ? curr : best;
      }, candidates[0]);
    }

    const tradeFraction = Math.min(maxTradeCap / 100, 0.5);
    const tradeUsd = sourceUsd * tradeFraction;
    const tradeTokens = tradeUsd / source.price;
    const expectedOutTokens = (tradeUsd * (1 - maxSlippage / 100)) / target.price;

    const intentHash = `0x${Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

    const payload = {
      signer_id: 'omniagent.near',
      mpc_contract: 'v1.signer',
      intent_type: 'token_diff',
      deadline: new Date(Date.now() + 60000).toISOString(),
      guardrails: {
        session_key_verified: true,
        max_trade_cap_pct: `${maxTradeCap}%`,
        max_slippage_pct: `${maxSlippage}%`,
        gas_sponsorship: 'RELAYER_COVERED ($0.00)',
      },
      diff: {
        [source.omftId]: `-${tradeTokens.toFixed(6)} (${source.symbol})`,
        [target.omftId]: `+${expectedOutTokens.toFixed(6)} (${target.symbol})`,
      },
      destination: {
        chain: target.chain,
        derived_address: target.derivedAddress,
        curve: target.curve,
      },
    };

    const solverQuotes = [
      {
        name: 'Wintermute Intent Solver',
        tag: 'BEST FILL',
        outAmount: (tradeUsd * 0.9992) / target.price,
        outUsd: tradeUsd * 0.9992,
        feeCovered: '$0.00',
        latency: '1.8s',
        winner: true,
      },
      {
        name: 'Defuse Liquidity MM #1',
        tag: 'RUNNER UP',
        outAmount: (tradeUsd * 0.9984) / target.price,
        outUsd: tradeUsd * 0.9984,
        feeCovered: '$0.00',
        latency: '2.1s',
        winner: false,
      },
      {
        name: 'NEAR Chain-Sig Solver Node',
        tag: 'BACKUP',
        outAmount: (tradeUsd * 0.9979) / target.price,
        outUsd: tradeUsd * 0.9979,
        feeCovered: '$0.00',
        latency: '2.4s',
        winner: false,
      },
    ];

    const reasonText =
      customReason ||
      `${source.symbol} dropped ${Math.abs(((source.price - source.initialPrice) / source.initialPrice) * 100).toFixed(1)}%, breaching ${driftThreshold}% volatility/drift guardrail.`;

    setPipelineState({
      active: true,
      step: 1,
      sourceAsset: source,
      targetAsset: target,
      tradeUsdValue: tradeUsd,
      tradeTokenAmount: tradeTokens,
      reason: reasonText,
      intentPayload: payload,
      solvers: solverQuotes,
      winningSolver: solverQuotes[0],
      settlementTime: '1.8s',
    });

    addLog(
      'AI_SIGNAL',
      `Drift Alert: ${source.symbol} → ${target.symbol}`,
      `${reasonText} Preparing $${tradeUsd.toFixed(2)} rebalance intent.`,
      intentHash
    );

    setTimeout(() => {
      setPipelineState((prev) => ({ ...prev, step: 2 }));
      addLog(
        'INTENT',
        'Outcome Intent Signed & Broadcast',
        `Signed via Session Key & v1.signer MPC | ${tradeTokens.toFixed(4)} ${source.symbol} → ${target.symbol}`,
        intentHash
      );
    }, 850);

    setTimeout(() => {
      setPipelineState((prev) => ({ ...prev, step: 3 }));
    }, 1750);

    setTimeout(() => {
      const winning = solverQuotes[0];
      setAssets((prevAssets) =>
        prevAssets.map((item) => {
          if (item.id === source.id) {
            return { ...item, balance: Math.max(0, item.balance - tradeTokens) };
          }
          if (item.id === target.id) {
            return { ...item, balance: item.balance + winning.outAmount };
          }
          return item;
        })
      );

      const savedEstimate = tradeUsd * 0.14;
      setCapitalProtected((prev) => prev + savedEstimate);

      setPipelineState((prev) => ({ ...prev, step: 4, active: false }));

      addLog(
        'SETTLED',
        `Atomic Settlement Confirmed (${winning.latency})`,
        `Filled by ${winning.name}: +${winning.outAmount.toFixed(4)} ${target.symbol} ($${winning.outUsd.toFixed(2)}) | User Gas: $0.00`,
        intentHash
      );

      pipelineLockRef.current = false;
    }, 2800);
  };

  const simulateSolCrash = () => {
    if (pipelineLockRef.current) return;
    addLog('MARKET', 'Market Event: SOL Flash Crash (-18.0%)', 'Solana spot price plunging across DEX/CEX feeds...');

    const updated = assets.map((a) =>
      a.id === 'sol' ? { ...a, price: Number((a.price * 0.82).toFixed(2)) } : a
    );
    setAssets(updated);

    const solAsset = updated.find((a) => a.id === 'sol');
    const dropPct = Math.abs(((solAsset.price - solAsset.initialPrice) / solAsset.initialPrice) * 100);

    if (autoRebalance && dropPct >= driftThreshold) {
      setTimeout(() => {
        triggerRebalancePipeline(
          updated,
          solAsset,
          `SOL flash crash (-${dropPct.toFixed(1)}%) exceeded ${driftThreshold}% guardrail threshold.`
        );
      }, 450);
    }
  };

  const simulateEthDrop = () => {
    if (pipelineLockRef.current) return;
    addLog('MARKET', 'Market Event: ETH Volatility Spike (-15.0%)', 'Ethereum L1 experiencing sudden drawdown...');

    const updated = assets.map((a) =>
      a.id === 'eth' ? { ...a, price: Number((a.price * 0.85).toFixed(2)) } : a
    );
    setAssets(updated);

    const ethAsset = updated.find((a) => a.id === 'eth');
    const dropPct = Math.abs(((ethAsset.price - ethAsset.initialPrice) / ethAsset.initialPrice) * 100);

    if (autoRebalance && dropPct >= driftThreshold) {
      setTimeout(() => {
        triggerRebalancePipeline(
          updated,
          ethAsset,
          `ETH volatility spike (-${dropPct.toFixed(1)}%) exceeded ${driftThreshold}% guardrail threshold.`
        );
      }, 450);
    }
  };

  const simulateMarketRally = () => {
    if (pipelineLockRef.current) return;
    addLog('MARKET', 'Market Event: Broad Crypto Rally (+12.0%)', 'Bullish momentum detected across SOL, ETH, BTC, AVAX.');

    const updated = assets.map((a) =>
      a.id !== 'usdc' ? { ...a, price: Number((a.price * 1.12).toFixed(2)) } : a
    );
    setAssets(updated);

    const usdcAsset = updated.find((a) => a.id === 'usdc');
    if (autoRebalance && usdcAsset && usdcAsset.balance > 5) {
      setTimeout(() => {
        const solTarget = updated.find((a) => a.id === 'sol');
        const deployUsd = usdcAsset.balance * 0.8;
        const boughtSol = (deployUsd * 0.999) / solTarget.price;

        setAssets((prev) =>
          prev.map((item) => {
            if (item.id === 'usdc') return { ...item, balance: item.balance - deployUsd };
            if (item.id === 'sol') return { ...item, balance: item.balance + boughtSol };
            return item;
          })
        );

        addLog(
          'SETTLED',
          'Safe-Haven Capital Re-Deployed',
          `AI rotated $${deployUsd.toFixed(2)} USDC back into SOL (+${boughtSol.toFixed(4)} SOL) via NEAR Intents.`
        );
      }, 700);
    }
  };

  const resetPortfolio = () => {
    pipelineLockRef.current = false;
    setAssets(INITIAL_ASSETS);
    setCapitalProtected(0);
    setPipelineState({
      active: false,
      step: 0,
      sourceAsset: null,
      targetAsset: null,
      tradeUsdValue: 0,
      tradeTokenAmount: 0,
      reason: '',
      intentPayload: null,
      solvers: [],
      winningSolver: null,
      settlementTime: '2.1s',
    });
    addLog('SYSTEM', 'Portfolio Reset to Baseline ($400.00)', 'Restored $100.00 equal weight across SOL, ETH, BTC, and AVAX.');
  };

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070B12] text-slate-100 font-sans selection:bg-[#00EC97]/30 selection:text-[#00EC97] relative">
      
      {/* ONBOARDING MODAL */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#00EC97] bg-[#00EC97]/10 px-3 py-1 rounded-full border border-[#00EC97]/20">
                {onboardingSteps[onboardingStep].badge}
              </span>
              <button 
                onClick={() => setShowOnboarding(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
                aria-label="Close onboarding"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 pt-2">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-inner">
                {onboardingSteps[onboardingStep].icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {onboardingSteps[onboardingStep].title}
                </h3>
                <p className="text-xs font-medium text-emerald-400 mt-0.5">
                  {onboardingSteps[onboardingStep].subtitle}
                </p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">
                {onboardingSteps[onboardingStep].description}
              </p>
            </div>

            {/* Step Dots */}
            <div className="flex justify-center gap-2">
              {onboardingSteps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setOnboardingStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === onboardingStep ? 'w-6 bg-[#00EC97]' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              {onboardingStep > 0 ? (
                <button
                  onClick={() => setOnboardingStep(s => s - 1)}
                  className="text-sm text-slate-400 hover:text-white px-3 py-2 transition"
                >
                  Back
                </button>
              ) : (
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="text-sm text-slate-400 hover:text-white px-3 py-2 transition"
                >
                  Skip Tour
                </button>
              )}

              {onboardingStep < onboardingSteps.length - 1 ? (
                <button
                  onClick={() => setOnboardingStep(s => s + 1)}
                  className="bg-[#00EC97] hover:bg-[#00d688] text-slate-950 text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-[#00EC97]/20"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowOnboarding(false)}
                  className="bg-[#00EC97] hover:bg-[#00d688] text-slate-950 text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-lg shadow-[#00EC97]/20"
                >
                  Get Started <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtle Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#00EC97]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* TOP NAVIGATION / HEADER */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#0B111E]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00EC97] to-cyan-400 p-[1px] shadow-lg shadow-[#00EC97]/20">
              <div className="w-full h-full bg-[#090F1A] rounded-xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-[#00EC97]" />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  OmniRebalance <span className="text-[#00EC97]">AI</span>
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00EC97]/10 text-[#00EC97] border border-[#00EC97]/30">
                  <Sparkles className="w-3 h-3" />
                  Powered by NEAR Intents &amp; Chain Signatures
                </span>
                <button
                  onClick={() => {
                    setOnboardingStep(0);
                    setShowOnboarding(true);
                  }}
                  className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1 transition ml-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Quick Tour
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous Cross-Chain Portfolio Hedge &amp; Intent Execution Agent • Unified Account:{' '}
                <code className="text-cyan-300 font-mono">omniagent.near</code>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#00EC97] animate-pulse" />
              <span className="text-slate-400">MPC Signer:</span>
              <span className="font-mono text-slate-200 font-medium">v1.signer</span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
              <Network className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-300 font-medium">14 Solvers Online</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00EC97]" />
              <span>Session Guardrails Active</span>
            </div>

            <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('simulation')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'simulation'
                    ? 'bg-[#00EC97] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Live Simulation
              </button>
              <button
                onClick={() => setViewMode('sdk')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === 'sdk'
                    ? 'bg-cyan-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                SDK / Payload Inspector
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <section className="rounded-2xl bg-[#0D1424]/90 border border-slate-800/90 p-5 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Wallet className="w-4 h-4 text-[#00EC97]" />
                Chain-Abstracted Multi-Chain Vault (<span className="text-cyan-300 font-mono lowercase">omniagent.near</span>)
              </div>
              <div className="flex flex-wrap items-baseline gap-4 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  ${totalPortfolioValue.toFixed(2)}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700">
                  Baseline: $400.00
                </span>
                {capitalProtected > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-md bg-[#00EC97]/15 text-[#00EC97] border border-[#00EC97]/30 font-semibold">
                    + Downside Hedged via Intents
                  </span>
                )}
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Live Cross-Chain Weight Distribution</span>
                <span>Target: 25% SOL / 25% ETH / 25% BTC / 25% AVAX</span>
              </div>
              <div className="h-3.5 w-full rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800 gap-0.5">
                {enrichedAssets.map((asset) =>
                  asset.currentWeight > 0.5 ? (
                    <div
                      key={asset.id}
                      style={{
                        width: `${asset.currentWeight}%`,
                        backgroundColor: asset.color,
                      }}
                      title={`${asset.symbol}: ${asset.currentWeight.toFixed(1)}%`}
                      className="h-full rounded-sm transition-all duration-500"
                    />
                  ) : null
                )}
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                {enrichedAssets.map((a) => (
                  <span key={a.id} className="flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: a.color }}
                    />
                    {a.symbol}: <strong className="text-slate-200">{a.currentWeight.toFixed(1)}%</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mt-4">
            {enrichedAssets.map((asset) => {
              const isDropping = asset.priceChangePct < -1;
              const isPumping = asset.priceChangePct > 1;
              return (
                <div
                  key={asset.id}
                  className={`rounded-xl p-4 border transition-all duration-300 ${
                    asset.id === 'usdc'
                      ? 'bg-gradient-to-b from-blue-950/30 to-slate-900/80 border-blue-500/30'
                      : 'bg-slate-900/75 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: asset.bgAccent, color: asset.color }}
                      >
                        {asset.symbol}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-white leading-none">{asset.symbol}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{asset.chain}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {asset.chainBadge}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="text-xl font-bold text-white">${asset.usdValue.toFixed(2)}</div>
                    <div
                      className={`text-xs font-semibold flex items-center gap-0.5 ${
                        isDropping
                          ? 'text-rose-400'
                          : isPumping
                          ? 'text-[#00EC97]'
                          : 'text-slate-400'
                      }`}
                    >
                      {isDropping && <TrendingDown className="w-3 h-3" />}
                      {isPumping && <TrendingUp className="w-3 h-3" />}
                      {asset.priceChangePct >= 0 ? '+' : ''}
                      {asset.priceChangePct.toFixed(1)}%
                    </div>
                  </div>

                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>
                      {asset.balance.toFixed(asset.id === 'btc' ? 5 : 3)} {asset.symbol}
                    </span>
                    <span>@ ${asset.price.toLocaleString()}</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Weight / Target:</span>
                      <span className="font-mono text-slate-200">
                        {asset.currentWeight.toFixed(1)}% / {asset.targetWeight}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span>MPC Addr:</span>
                      <span className="font-mono text-[10px] text-cyan-300/90">
                        {asset.derivedAddress.slice(0, 6)}...{asset.derivedAddress.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {viewMode === 'simulation' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-5 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#00EC97]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      Live Presentation Scenario Triggers
                    </h2>
                  </div>
                  <button
                    onClick={resetPortfolio}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-800 transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset ($100 ea)
                  </button>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Simulate live market volatility across chains to watch OmniAgent detect drift and settle a cross-chain hedge via NEAR Intents in ~2 seconds.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={simulateSolCrash}
                    disabled={pipelineState.active}
                    className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between text-rose-400 font-bold text-xs">
                      <span>SOL Flash Crash</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-[11px]">-18%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Triggers automatic hedge from Solana into USDC reserve.
                    </p>
                  </button>

                  <button
                    onClick={simulateEthDrop}
                    disabled={pipelineState.active}
                    className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between text-amber-400 font-bold text-xs">
                      <span>ETH Volatility Spike</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[11px]">-15%</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      De-risks Ethereum L1 exposure via Chain Signatures.
                    </p>
                  </button>

                  <button
                    onClick={simulateMarketRally}
                    disabled={pipelineState.active}
                    className="p-3 rounded-xl bg-[#00EC97]/10 hover:bg-[#00EC97]/20 border border-[#00EC97]/30 text-left transition disabled:opacity-50 sm:col-span-2"
                  >
                    <div className="flex items-center justify-between text-[#00EC97] font-bold text-xs">
                      <span>Market Recovery / Rally (+12%)</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#00EC97]/20 text-[11px]">Re-Deploy</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Rotates USDC safe-haven reserves back into risk assets via intents.
                    </p>
                  </button>
                </div>
              </div>

              {/* Guardrails Configuration */}
              <div className="rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      Session Key Guardrails
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Scoped Access Key
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Drift Trigger Threshold:</span>
                      <span className="font-mono text-white font-semibold">{driftThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      step="1"
                      value={driftThreshold}
                      onChange={(e) => setDriftThreshold(Number(e.target.value))}
                      className="w-full accent-[#00EC97] bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Max Single Trade Cap:</span>
                      <span className="font-mono text-white font-semibold">{maxTradeCap}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="10"
                      value={maxTradeCap}
                      onChange={(e) => setMaxTradeCap(Number(e.target.value))}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400">Automatic Rebalancer:</span>
                    <button
                      onClick={() => setAutoRebalance(!autoRebalance)}
                      className={`px-3 py-1 rounded-md font-semibold transition ${
                        autoRebalance
                          ? 'bg-[#00EC97]/20 text-[#00EC97] border border-[#00EC97]/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {autoRebalance ? 'ENABLED (24/7)' : 'MANUAL ONLY'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: EXECUTION PIPELINE & AUDIT LOGS (7 COLS) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Execution Pipeline Status */}
              <div className="rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className={`w-4 h-4 ${pipelineState.active ? 'text-[#00EC97] animate-spin' : 'text-slate-400'}`} />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      NEAR Intent Execution Pipeline
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${pipelineState.active ? 'bg-[#00EC97] animate-ping' : 'bg-slate-600'}`} />
                    <span className="text-xs font-mono text-slate-300">
                      {pipelineState.active ? `Step ${pipelineState.step}/4 Active` : 'Idle / Monitoring'}
                    </span>
                  </div>
                </div>

                {/* 4 Steps Progress Bar */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {[
                    { step: 1, label: '1. AI Signal' },
                    { step: 2, label: '2. Intent Sign' },
                    { step: 3, label: '3. Solver Match' },
                    { step: 4, label: '4. MPC Settlement' }
                  ].map((s) => {
                    const isDone = pipelineState.step > s.step || (!pipelineState.active && pipelineState.step === 4);
                    const isCurrent = pipelineState.active && pipelineState.step === s.step;
                    return (
                      <div
                        key={s.step}
                        className={`rounded-xl p-2.5 border text-center transition-all ${
                          isDone
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : isCurrent
                            ? 'bg-[#00EC97]/15 border-[#00EC97] text-[#00EC97] animate-pulse shadow-lg shadow-[#00EC97]/10'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Active Execution Details */}
                {pipelineState.active || pipelineState.step === 4 ? (
                  <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-slate-400">Trigger Reason:</div>
                        <div className="text-sm font-semibold text-white mt-0.5">{pipelineState.reason}</div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#00EC97]/10 text-[#00EC97] border border-[#00EC97]/30">
                        Gasless for User ($0.00)
                      </span>
                    </div>

                    {pipelineState.solvers.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-900">
                        <div className="text-xs font-semibold text-slate-300">Competing Solver Auction Quotes:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {pipelineState.solvers.map((sol, idx) => (
                            <div
                              key={idx}
                              className={`rounded-lg p-2.5 border text-xs ${
                                sol.winner
                                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                                  : 'bg-slate-900/50 border-slate-800 text-slate-400'
                              }`}
                            >
                              <div className="flex justify-between font-bold">
                                <span>{sol.name.split(' ')[0]}</span>
                                <span className={sol.winner ? 'text-[#00EC97]' : 'text-slate-500'}>{sol.tag}</span>
                              </div>
                              <div className="mt-1 font-mono text-[11px]">
                                Out: ${sol.outUsd.toFixed(2)} ({sol.latency})
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl bg-slate-950/50 border border-slate-800/80 p-8 text-center text-slate-400 text-xs">
                    System stable. AI agent continuously monitoring multi-chain price feeds &amp; drift thresholds.
                  </div>
                )}
              </div>

              {/* Live Audit Log Stream */}
              <div className="rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      Agent Audit Log &amp; Transaction Stream
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">Real-time Events</span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                              log.type === 'AI_SIGNAL'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : log.type === 'INTENT'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : log.type === 'SETTLED'
                                ? 'bg-[#00EC97]/20 text-[#00EC97] border border-[#00EC97]/30'
                                : log.type === 'MARKET'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {log.type}
                          </span>
                          <span className="font-bold text-slate-200">{log.title}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{log.time}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] pl-1">{log.detail}</p>
                      {log.hash && (
                        <div className="text-[10px] font-mono text-cyan-400/80 pl-1">
                          Hash: {log.hash}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SDK / PAYLOAD INSPECTOR VIEW */
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h2 className="text-base font-bold text-white">NEAR Intents SDK Integration Snippet</h2>
                    <p className="text-xs text-slate-400">TypeScript implementation used by OmniRebalance AI for gasless cross-chain intent settlement.</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(SDK_INTEGRATION_SNIPPET, setCopiedCode)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#00EC97]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied Snippet!' : 'Copy Code'}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 font-mono text-xs overflow-x-auto border border-slate-800/80 leading-relaxed">
                {SDK_INTEGRATION_SNIPPET}
              </pre>
            </div>

            {pipelineState.intentPayload && (
              <div className="rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-5 h-5 text-[#00EC97]" />
                    <div>
                      <h2 className="text-base font-bold text-white">Last Executed Intent JSON Payload</h2>
                      <p className="text-xs text-slate-400">Inspect the exact data structure signed by the session key and verified on NEAR.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(pipelineState.intentPayload, null, 2), setCopiedPayload)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copiedPayload ? <Check className="w-3.5 h-3.5 text-[#00EC97]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedPayload ? 'Copied Payload!' : 'Copy JSON'}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-950 text-[#00EC97] font-mono text-xs overflow-x-auto border border-slate-800/80 leading-relaxed">
                  {JSON.stringify(pipelineState.intentPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
