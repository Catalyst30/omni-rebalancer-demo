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
  ExternalLink
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
    // Drift relative to target weight (for active risk assets)
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

    const totalVal = currentAssetsList.reduce((sum, a) => sum + a.balance * a.price, 0);
    const source = breachAsset;
    const sourceUsd = source.balance * source.price;

    if (sourceUsd < 5) {
      pipelineLockRef.current = false;
      addLog('GUARDRAIL', 'Trade Skipped (Dust Threshold)', `${source.symbol} balance ($${sourceUsd.toFixed(2)}) below minimum execution floor.`);
      return;
    }

    // Determine target asset based on selected strategy
    let target;
    if (hedgeStrategy === 'usdc') {
      target = currentAssetsList.find((a) => a.id === 'usdc');
    } else {
      // Find top performing risk asset
      const candidates = currentAssetsList.filter((a) => a.id !== source.id && a.id !== 'usdc');
      target = candidates.reduce((best, curr) => {
        const bestPerf = (best.price - best.initialPrice) / best.initialPrice;
        const currPerf = (curr.price - curr.initialPrice) / curr.initialPrice;
        return currPerf > bestPerf ? curr : best;
      }, candidates[0]);
    }

    // Enforce Session Key Guardrail: Max Single Trade Cap
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

    // Competing Off-Chain Solvers
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

    // STEP 1: AI Strategy Engine Analysis
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

    // STEP 2: Intent Broadcast to NEAR Verifier
    setTimeout(() => {
      setPipelineState((prev) => ({ ...prev, step: 2 }));
      addLog(
        'INTENT',
        'Outcome Intent Signed & Broadcast',
        `Signed via Session Key & v1.signer MPC | ${tradeTokens.toFixed(4)} ${source.symbol} → ${target.symbol}`,
        intentHash
      );
    }, 850);

    // STEP 3: Off-Chain Solver Competition
    setTimeout(() => {
      setPipelineState((prev) => ({ ...prev, step: 3 }));
    }, 1750);

    // STEP 4: Verifier Atomic Settlement & Portfolio Update
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

      // Estimate downside protection saved
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

  // Market Simulation Handlers
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
        // Re-deploy USDC back into SOL/target
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

  const handleForceRebalance = () => {
    if (pipelineLockRef.current) return;
    // Pick the asset with largest negative price change or lowest weight
    const riskAssets = enrichedAssets.filter((a) => a.id !== 'usdc' && a.usdValue > 5);
    if (!riskAssets.length) return;
    const worstAsset = riskAssets.reduce((prev, curr) =>
      curr.priceChangePct < prev.priceChangePct ? curr : prev
    );
    triggerRebalancePipeline(
      assets,
      worstAsset,
      `Manual presenter override: Rebalancing ${worstAsset.symbol} via NEAR Intents Solver Network.`
    );
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
    <div className="min-h-screen bg-[#070B12] text-slate-100 font-sans selection:bg-[#00EC97]/30 selection:text-[#00EC97]">
      {/* Subtle Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#00EC97]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* TOP NAVIGATION / HEADER */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#0B111E]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Brand Title */}
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
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous Cross-Chain Portfolio Hedge &amp; Intent Execution Agent • Unified Account:{' '}
                <code className="text-cyan-300 font-mono">omniagent.near</code>
              </p>
            </div>
          </div>

          {/* Live Status Pills & Mode Switcher */}
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

            {/* View Toggle */}
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
        {/* SECTION 1: UNIFIED CHAIN-ABSTRACTED PORTFOLIO OVERVIEW */}
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

            {/* Unified Allocation Progress Bar */}
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

          {/* 5 Asset Cards Grid */}
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

        {/* CONDITIONAL VIEW: LIVE SIMULATION VS SDK INSPECTOR */}
        {viewMode === 'simulation' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT PANEL: MARKET EVENT SIMULATOR & SESSION KEY GUARDRAILS (5 COLS) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Interactive Presentation Controls */}
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
                    className="p-3 rounded-xl bg-[#00EC97]/10 hover:bg-[#00EC97]/20 border border-[#00EC97]/30 text-left transition disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between text-[#00EC97] font-bold text-xs">
                      <span>Market Rally</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#00EC97]/20 text-[11px]">+12% All</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Rotates safe-haven USDC reserve back into growth assets.
                    </p>
                  </button>

                  <button
                    onClick={handleForceRebalance}
                    disabled={pipelineState.active}
                    className="p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-left transition disabled:opacity-50"
                  >
                    <div className="flex items-center justify-between text-cyan-300 font-bold text-xs">
                      <span>Force Rebalance</span>
                      <Play className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Manually invoke NEAR Intent solver auction now.
                    </p>
                  </button>
                </div>
              </div>

              {/* Session Key Guardrails & Strategy Configuration */}
              <div className="rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      Session Key Guardrails &amp; Policy
                    </h2>
                  </div>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <span className="text-slate-400">Auto-Pilot</span>
                    <input
                      type="checkbox"
                      checked={autoRebalance}
                      onChange={(e) => setAutoRebalance(e.target.checked)}
                      className="accent-[#00EC97] w-4 h-4 rounded"
                    />
                  </label>
                </div>

                {/* Hedge Mode Toggle */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">
                    Autonomous Hedging Strategy Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
                    <button
                      onClick={() => setHedgeStrategy('usdc')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition ${
                        hedgeStrategy === 'usdc'
                          ? 'bg-[#00EC97] text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Safe-Haven (USDC)
                    </button>
                    <button
                      onClick={() => setHedgeStrategy('momentum')}
                      className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition ${
                        hedgeStrategy === 'momentum'
                          ? 'bg-cyan-400 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Top Performer Swap
                    </button>
                  </div>
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Volatility / Drift Trigger Threshold</span>
                      <span className="font-mono font-bold text-[#00EC97]">{driftThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      step="1"
                      value={driftThreshold}
                      onChange={(e) => setDriftThreshold(Number(e.target.value))}
                      className="w-full accent-[#00EC97] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Max Single Trade Cap (On-Chain Limit)</span>
                      <span className="font-mono font-bold text-cyan-300">{maxTradeCap}% of Asset</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={maxTradeCap}
                      onChange={(e) => setMaxTradeCap(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Verifier Max Slippage Enforcement</span>
                      <span className="font-mono font-bold text-slate-200">{maxSlippage}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={maxSlippage}
                      onChange={(e) => setMaxSlippage(Number(e.target.value))}
                      className="w-full accent-[#00EC97] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
                  <Lock className="w-4 h-4 text-[#00EC97] shrink-0 mt-0.5" />
                  <span>
                    AI Agent signs only with a scoped <strong className="text-slate-200">NEAR Session Key</strong>. Master keys remain isolated inside NEAR&#39;s decentralized MPC (<code className="text-cyan-300">v1.signer</code>) network.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL: REAL-TIME NEAR INTENTS PIPELINE & SOLVER AUCTION (7 COLS) */}
            <div className="lg:col-span-7 rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00EC97]" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                      NEAR Intents Execution &amp; Solver Auction Pipeline
                    </h2>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-cyan-300">
                    @defuse-protocol/intents-sdk
                  </span>
                </div>

                {/* 4-Step Stepper */}
                <div className="grid grid-cols-4 gap-2 my-5">
                  {[
                    { num: 1, label: 'AI Drift Signal' },
                    { num: 2, label: 'Intent Broadcast' },
                    { num: 3, label: 'Solver Auction' },
                    { num: 4, label: 'MPC Settlement' },
                  ].map((s) => {
                    const isCompleted = pipelineState.step > s.num || (pipelineState.step === 4 && s.num === 4);
                    const isCurrent = pipelineState.step === s.num && pipelineState.active;
                    return (
                      <div
                        key={s.num}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isCurrent
                            ? 'bg-[#00EC97]/15 border-[#00EC97] text-white shadow-md shadow-[#00EC97]/10'
                            : isCompleted
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-[#00EC97]'
                            : 'bg-slate-900/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="text-[11px] font-mono font-bold">STEP 0{s.num}</div>
                        <div className="text-xs font-semibold mt-0.5 truncate">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Pipeline Dynamic Body */}
                {pipelineState.step === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-700/90 bg-slate-900/40 p-8 text-center my-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800/90 flex items-center justify-center mx-auto mb-3 text-[#00EC97]">
                      <RefreshCw className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      Monitoring Multi-Chain Liquidity &amp; Drift
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5 leading-relaxed">
                      OmniAgent is continuously watching SOL, ETH, BTC, and AVAX balances on <code className="text-cyan-300">omniagent.near</code>. Trigger a <strong className="text-rose-400">SOL Flash Crash (-18%)</strong> on the left to observe autonomous intent routing.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Trade Summary Banner */}
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 font-mono text-xs font-bold border border-rose-500/30">
                          -{pipelineState.tradeTokenAmount.toFixed(4)} {pipelineState.sourceAsset?.symbol}
                        </span>
                        <ArrowRight className="w-4 h-4 text-[#00EC97]" />
                        <span className="px-2.5 py-1 rounded-lg bg-[#00EC97]/15 text-[#00EC97] font-mono text-xs font-bold border border-[#00EC97]/30">
                          +{pipelineState.winningSolver?.outAmount.toFixed(4)} {pipelineState.targetAsset?.symbol}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300">
                        Trade Size: <strong className="text-white">${pipelineState.tradeUsdValue.toFixed(2)}</strong> • Gas Fee:{' '}
                        <strong className="text-[#00EC97]">$0.00 (Relayed)</strong>
                      </div>
                    </div>

                    {/* Off-Chain Solver Competition Table */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="font-semibold uppercase tracking-wider">
                          Off-Chain Solver Network Competition (1Click API)
                        </span>
                        <span className="text-[#00EC97] font-mono">
                          {pipelineState.step >= 3 ? 'Winner Selected (Atomic Fill)' : 'Requesting Quotes...'}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {pipelineState.solvers.map((solver, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 transition-all ${
                              solver.winner && pipelineState.step >= 3
                                ? 'bg-[#00EC97]/10 border-[#00EC97]/50'
                                : 'bg-slate-900/70 border-slate-800 opacity-75'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {solver.winner && pipelineState.step >= 3 ? (
                                <CheckCircle2 className="w-4 h-4 text-[#00EC97]" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-slate-600" />
                              )}
                              <div>
                                <div className="text-xs font-bold text-white flex items-center gap-2">
                                  {solver.name}
                                  {solver.winner && pipelineState.step >= 3 && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#00EC97] text-slate-950 font-extrabold">
                                      {solver.tag}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Destination Gas Covered: {solver.feeCovered} • Settlement: {solver.latency}
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-mono">
                              <div className="text-xs font-bold text-white">
                                {solver.outAmount.toFixed(4)} {pipelineState.targetAsset?.symbol}
                              </div>
                              <div className="text-[11px] text-slate-400">${solver.outUsd.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Live Outcome Intent JSON Snippet */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                        <span>Signed Outcome Intent Payload (Verifier Contract)</span>
                        <button
                          onClick={() =>
                            copyToClipboard(JSON.stringify(pipelineState.intentPayload, null, 2), setCopiedPayload)
                          }
                          className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1"
                        >
                          {copiedPayload ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedPayload ? 'Copied JSON' : 'Copy Payload'}
                        </button>
                      </div>
                      <pre className="p-3 rounded-xl bg-[#070B12] border border-slate-800 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-40">
                        {JSON.stringify(pipelineState.intentPayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Architecture Footnote */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <span>Settlement Finality: NEAR Verifier Smart Contract (Atomic)</span>
                <span className="text-slate-300 font-mono">Zero Bridge Lockups • Zero MEV Slippage</span>
              </div>
            </div>
          </div>
        ) : (
          /* SDK & PAYLOAD INSPECTOR VIEW */
          <section className="rounded-2xl bg-[#0D1424]/95 border border-slate-800 p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  Production Integration: <code className="text-[#00EC97]">@defuse-protocol/intents-sdk</code>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Reference implementation showing how OmniAgent constructs outcome-based intents and signs across chains via NEAR MPC (<code className="text-cyan-300">v1.signer</code>).
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(SDK_INTEGRATION_SNIPPET, setCopiedCode)}
                className="px-4 py-2 rounded-xl bg-[#00EC97] hover:bg-[#00d689] text-slate-950 font-bold text-xs flex items-center gap-2 self-start sm:self-auto transition"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied TypeScript Code' : 'Copy SDK Code'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <pre className="p-4 rounded-xl bg-[#060911] border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                  {SDK_INTEGRATION_SNIPPET}
                </pre>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#00EC97]">
                    Why NEAR Intents Wins Here
                  </h3>
                  <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                    <li>
                      <strong>No Multi-Chain Gas Management:</strong> Solvers pay SOL, ETH, and AVAX gas natively and deduct micro-fees from the quote.
                    </li>
                    <li>
                      <strong>Single MPC Identity:</strong> <code className="text-cyan-300">v1.signer</code> derives deterministic addresses across Ed25519 and Secp256k1 curves from <code className="text-cyan-300">omniagent.near</code>.
                    </li>
                    <li>
                      <strong>Atomic Verifier Guarantee:</strong> Either the exact minimum output settles on-chain or the intent reverts cleanly.
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    OMFT Multi-Chain Asset Registry
                  </h3>
                  <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      SOL → nep141:sol.omft.near
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      ETH → nep141:eth.omft.near
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      BTC → nep141:btc.omft.near
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      AVAX → nep141:avax.omft.near
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      USDC → nep141:usdc.omft.near
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* BOTTOM PANEL: LIVE EXECUTION AUDIT LOG */}
        <section className="rounded-2xl bg-[#0D1424]/90 border border-slate-800 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#00EC97]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Verifiable On-Chain Execution &amp; Guardrail Audit Log
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{logs.length} Events Recorded</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {logs.map((entry) => {
              const badgeStyles = {
                SETTLED: 'bg-[#00EC97]/15 text-[#00EC97] border-[#00EC97]/30',
                INTENT: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
                AI_SIGNAL: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
                MARKET: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                GUARDRAIL: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                SYSTEM: 'bg-slate-800 text-slate-300 border-slate-700',
              }[entry.type] || 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-[#080C16] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-start sm:items-center gap-2.5">
                    <span className="font-mono text-[11px] text-slate-500 shrink-0">{entry.time}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${badgeStyles}`}
                    >
                      {entry.type}
                    </span>
                    <div>
                      <span className="font-bold text-slate-100 mr-2">{entry.title}:</span>
                      <span className="text-slate-400">{entry.detail}</span>
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 shrink-0 self-end sm:self-center">
                    tx: <span className="text-cyan-400/80">{entry.hash}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
