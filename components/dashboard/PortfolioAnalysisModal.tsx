"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useCrypto } from "@/context/CryptoContext";

interface PortfolioAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskNetroAI?: (prompt: string) => void;
}

// Default BSC Assets preview if wallet is not yet connected
const FALLBACK_BSC_ASSETS = [
  {
    symbol: "BNB",
    name: "BNB Smart Chain (Native)",
    amount: 0,
    price_usd: 652.5,
    value_usd: 0,
    daily_chg: "+2.1%",
    is_native: true,
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/eca15c8bf51eca1bd9a24e1c54b3f3f12ca0ebe1?width=272",
    badge: "Native Gas • Chain ID: 56",
  },
  {
    symbol: "USDT",
    name: "Tether USD (BEP-20)",
    amount: 0,
    price_usd: 1.0,
    value_usd: 0,
    daily_chg: "+0.0%",
    is_native: false,
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/eca15c8bf51eca1bd9a24e1c54b3f3f12ca0ebe1?width=272",
    badge: "Verified BEP-20",
  },
  {
    symbol: "USDC",
    name: "USD Coin (BEP-20)",
    amount: 0,
    price_usd: 1.0,
    value_usd: 0,
    daily_chg: "+0.0%",
    is_native: false,
    icon: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=035",
    badge: "Verified BEP-20",
  },
  {
    symbol: "BTCB",
    name: "Bitcoin BEP-20 (BTCB)",
    amount: 0,
    price_usd: 80150.0,
    value_usd: 0,
    daily_chg: "+3.4%",
    is_native: false,
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/b4c6ff22c90da52aa2ba9ba08e27c06855c424e0?width=272",
    badge: "Binance-Peg Token",
  },
  {
    symbol: "ETH",
    name: "Ethereum BEP-20 (ETH)",
    amount: 0,
    price_usd: 2510.0,
    value_usd: 0,
    daily_chg: "+1.8%",
    is_native: false,
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/fcd844df5d1e37d869eeb7ad734adc16ef472fc2?width=272",
    badge: "Binance-Peg Token",
  },
  {
    symbol: "CAKE",
    name: "PancakeSwap (CAKE)",
    amount: 0,
    price_usd: 2.15,
    value_usd: 0,
    daily_chg: "+5.2%",
    is_native: false,
    icon: "https://cryptologos.cc/logos/pancakeswap-cake-logo.png?v=035",
    badge: "DEX Staking Utility",
  },
];

const BSC_VAULTS = [
  {
    id: "venus-bnb",
    name: "Venus Protocol BNB Vault",
    subtitle: "APY 4.82% • $240.5M TVL",
    desc: "Liquid Staking & Collateral",
    icon: "https://cryptologos.cc/logos/venus-xvs-logo.png?v=035",
  },
  {
    id: "pancake-cake",
    name: "PancakeSwap Syrup Pool",
    subtitle: "APY 14.20% • $185.2M TVL",
    desc: "Auto-Compound CAKE Yield",
    icon: "https://cryptologos.cc/logos/pancakeswap-cake-logo.png?v=035",
  },
  {
    id: "slisbnb-liquid",
    name: "Binance Liquid Staking (slisBNB)",
    subtitle: "APY 3.18% • $412.0M TVL",
    desc: "100% Backed BNB Liquid Token",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/eca15c8bf51eca1bd9a24e1c54b3f3f12ca0ebe1?width=272",
  },
  {
    id: "beefy-bnb-usdt",
    name: "Beefy BSC Auto-Vault",
    subtitle: "APY 9.64% • $64.8M TVL",
    desc: "Multi-Strategy BNB-USDT Yield",
    icon: "https://cryptologos.cc/logos/beefy-bifi-logo.png?v=035",
  },
];

// Timeline historical wave points
const TIMELINE_POINTS = [
  { label: "Jan 23", val: 320, pct: "+2.1%", svgY: 100, svgX: 0 },
  { label: "Feb", val: 540, pct: "+4.5%", svgY: 45, svgX: 55 },
  { label: "Mar", val: 480, pct: "+3.2%", svgY: 65, svgX: 112 },
  { label: "Apr", val: 780, pct: "+8.9%", svgY: 25, svgX: 220 },
  { label: "May", val: 620, pct: "+5.1%", svgY: 50, svgX: 280 },
  { label: "Jun", val: 390, pct: "-1.8%", svgY: 85, svgX: 386 },
  { label: "Jul", val: 760, pct: "+7.4%", svgY: 28, svgX: 445 },
  { label: "Aug", val: 490, pct: "+3.9%", svgY: 76, svgX: 500 },
  { label: "Sep", val: 380, pct: "+1.5%", svgY: 100, svgX: 560 },
  { label: "Cet", val: 690, pct: "+6.8%", svgY: 44, svgX: 670 },
  { label: "Nov", val: 750, pct: "+7.1%", svgY: 35, svgX: 710 },
  { label: "Dec", val: 820, pct: "+9.3%", svgY: 20, svgX: 760 },
];

export const PortfolioAnalysisModal: React.FC<PortfolioAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAskNetroAI,
}) => {
  const { fullAddress, isWalletConnected, setIsWalletModalOpen } = useCrypto();
  const [activeTab, setActiveTab] = useState<"Chart" | "Reports" | "Table">("Chart");
  const [searchQuery, setSearchQuery] = useState("");
  const [portfolio, setPortfolio] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("weekly");

  // Dropdowns state
  const [isAssetOpen, setIsAssetOpen] = useState(true);
  const [isVaultsOpen, setIsVaultsOpen] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("2025-2026");
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string | null>(null);

  // Chart view style toggle
  const [chartMode, setChartMode] = useState<"wave" | "bars" | "area">("wave");
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function loadRealData() {
      try {
        const url = fullAddress
          ? `/api/v1/portfolio?address=${encodeURIComponent(fullAddress)}&timeframe=${timeframe}`
          : `/api/v1/portfolio?timeframe=${timeframe}`;
        const res = await fetch(url);
        if (res.ok) {
          const d = await res.json();
          setPortfolio(d);
        }
      } catch (e) {
        console.error("Error loading portfolio:", e);
      }
    }
    loadRealData();
  }, [isOpen, fullAddress, timeframe]);

  if (!isOpen) return null;

  const totalNetWorth = portfolio?.total_portfolio_usd || 0;
  const bnbBal = portfolio?.native_bnb_balance !== undefined ? portfolio.native_bnb_balance : 0;
  const bnbPrice = portfolio?.native_bnb_price_usd || 652.5;

  const displayNetWorth = totalNetWorth > 0
    ? `$${totalNetWorth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "$0.00";

  const formattedAddr = fullAddress
    ? `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`
    : "No wallet connected";

  // Real or preview asset list
  const rawAssets = portfolio?.balances && portfolio.balances.length > 0
    ? portfolio.balances
    : FALLBACK_BSC_ASSETS;

  // Filtered assets by user search
  const displayedAssets = rawAssets.filter((a: any) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.asset || a.symbol || "").toLowerCase().includes(q) ||
      (a.name || "").toLowerCase().includes(q)
    );
  });

  const selectedAsset = selectedAssetSymbol
    ? displayedAssets.find((a: any) => (a.asset || a.symbol) === selectedAssetSymbol) || null
    : null;

  const copyAddress = () => {
    if (fullAddress) {
      navigator.clipboard.writeText(fullAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md animate-fadeIn select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`relative w-full rounded-[24px] overflow-hidden shadow-2xl border border-gray-400/40 my-auto transition-all duration-300 ${
          isFullscreen ? "max-w-none w-[98vw] h-[95vh] overflow-y-auto" : "max-w-[1680px]"
        }`}
        style={{
          background: "linear-gradient(120deg, #DADCDC 0%, #CFD2D2 100%), #FFF",
          fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-5 flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch">
          {/* ================= LEFT ASIDE (390px - 405px) ================= */}
          <aside className="w-full lg:w-[390px] xl:w-[415px] flex flex-col gap-2.5 shrink-0">
            {/* Card 1: Portfolio Insights & Live Search */}
            <div className="rounded-[14px] bg-[#000] p-6 sm:p-7 flex flex-col justify-between text-white min-h-[160px] shadow-md border border-neutral-800">
              <div className="flex items-center justify-between">
                <h1 className="text-[26px] sm:text-[32px] font-medium leading-tight text-white tracking-tight">
                  Portfolio Insights
                </h1>
                <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700/80 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>BSC Live</span>
                </div>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#555] mt-6 focus-within:border-[#FFD920] transition-colors">
                <input
                  type="text"
                  placeholder="Search Crypto Asset (e.g. BNB, USDT)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-white placeholder:text-[#777] text-[15px] w-full font-normal"
                />
                <div className="w-[18px] h-[18px] relative shrink-0 opacity-80 cursor-pointer">
                  <div className="w-3 h-3 rounded-full border border-[#AAA]" />
                  <div className="w-[6px] h-[2px] bg-[#AAA] absolute -bottom-0.5 -right-0.5 rotate-45" />
                </div>
              </div>
            </div>

            {/* Card 2: Asset (Crypto Currencies List with Dropdown Accordion) */}
            <div className="rounded-[14px] bg-[#0B0B0B] p-5 sm:p-6 flex flex-col gap-3 text-white shadow-md border border-neutral-900">
              {/* Dropdown Header */}
              <div
                onClick={() => setIsAssetOpen(!isAssetOpen)}
                className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity select-none"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[#FFD920] text-[13px] transition-transform duration-300 ${
                      isAssetOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  >
                    ▼
                  </span>
                  <span className="text-white text-[18px] font-semibold tracking-wide">
                    Crypto Assets
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-neutral-800 text-[#FFD920] px-2.5 py-0.5 rounded-full text-[13px] font-semibold font-mono">
                    {displayedAssets.length}
                  </span>
                </div>
              </div>

              {/* Animated Collapsible List */}
              {isAssetOpen && (
                <div className="flex flex-col gap-2 pt-1 transition-all duration-300 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
                  {displayedAssets.map((coin: any, index: number) => {
                    const symbol = coin.asset || coin.symbol || "COIN";
                    const isSelected = selectedAssetSymbol === symbol;
                    const amount = coin.amount !== undefined ? Number(coin.amount) : 0;
                    const price = coin.price_usd || (symbol === "BNB" ? bnbPrice : 1.0);
                    const valUsd = amount > 0 ? amount * price : 0;

                    return (
                      <div
                        key={symbol + index}
                        onClick={() => setSelectedAssetSymbol(isSelected ? null : symbol)}
                        className={`flex items-center justify-between p-2.5 rounded-[12px] cursor-pointer transition-all duration-200 border ${
                          isSelected
                            ? "bg-neutral-800/90 border-[#FFD920] shadow-sm shadow-[#FFD920]/20"
                            : "bg-neutral-900/50 border-transparent hover:bg-neutral-800/60 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-[11px] transition-colors ${isSelected ? "text-[#FFD920]" : "text-[#777]"}`}>
                            ▶
                          </span>
                          {/* Crypto Official Icon */}
                          <div className="w-[42px] h-[42px] rounded-[10px] overflow-hidden bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700">
                            {coin.icon ? (
                              <img
                                src={coin.icon}
                                alt={symbol}
                                className="w-full h-full object-cover p-1.5"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-white font-bold text-xs">{symbol.slice(0, 3)}</span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white text-[15px] font-semibold leading-tight truncate">
                                {symbol}
                              </span>
                              <span className="text-[11px] text-[#FFD920] font-mono">
                                {coin.is_native ? "Native" : "BEP-20"}
                              </span>
                            </div>
                            <span className="text-[#999] text-[12px] font-normal leading-tight mt-0.5 truncate">
                              {amount > 0
                                ? `${amount.toFixed(4)} ${symbol} • $${valUsd.toFixed(2)}`
                                : `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })} Spot`}
                            </span>
                          </div>
                        </div>

                        {/* Right Live Delta */}
                        <div className="flex flex-col items-end shrink-0 pl-2">
                          <span className="text-emerald-400 text-[13px] font-mono font-medium flex items-center gap-0.5">
                            <span className="text-[10px] animate-pulse">▲</span>
                            {coin.daily_chg || "+2.1%"}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {amount > 0 ? "Verified" : "Live"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Card 3: Vaults & Protocols (DeFi Staking & Yield with Dropdown Accordion) */}
            <div className="rounded-[14px] bg-[#0B0B0B] p-5 sm:p-6 flex flex-col gap-3 text-white flex-1 overflow-hidden shadow-md border border-neutral-900">
              <div
                onClick={() => setIsVaultsOpen(!isVaultsOpen)}
                className="flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity select-none"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[#FFD920] text-[13px] transition-transform duration-300 ${
                      isVaultsOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  >
                    ▼
                  </span>
                  <span className="text-white text-[18px] font-semibold tracking-wide">
                    BSC Yield Vaults
                  </span>
                </div>
                <span className="bg-neutral-800 text-[#FFD920] px-2.5 py-0.5 rounded-full text-[13px] font-semibold font-mono">
                  {BSC_VAULTS.length}
                </span>
              </div>

              {isVaultsOpen && (
                <div className="flex flex-col gap-2 pt-1 transition-all duration-300 overflow-y-auto no-scrollbar pr-1">
                  {BSC_VAULTS.map((vault) => (
                    <div
                      key={vault.id}
                      className="flex items-center justify-between p-2.5 rounded-[12px] bg-neutral-900/50 hover:bg-neutral-800/60 border border-transparent hover:border-neutral-700 transition-all cursor-pointer"
                      onClick={() => {
                        if (onAskNetroAI) {
                          onClose();
                          onAskNetroAI(`Analyze yield opportunity and smart contract safety for ${vault.name}.`);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[#777] text-[11px]">▶</span>
                        <div className="w-[40px] h-[40px] rounded-[10px] bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700 overflow-hidden">
                          <img
                            src={vault.icon}
                            alt={vault.name}
                            className="w-full h-full object-cover p-1"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-white text-[14px] font-semibold leading-tight truncate">
                            {vault.name}
                          </span>
                          <span className="text-[#888] text-[12px] leading-tight mt-0.5 truncate">
                            {vault.subtitle}
                          </span>
                        </div>
                      </div>

                      <span className="text-emerald-400 text-[12px] font-mono font-medium shrink-0 pl-2">
                        Active
                      </span>
                    </div>
                  ))}

                  {/* Sub-utility live on-chain tools */}
                  <div className="pt-2 border-t border-neutral-800 flex flex-col gap-1.5 text-xs text-neutral-400">
                    <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-neutral-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        <span className="text-[#AAA] text-[13px]">BSC Gas Telemetry</span>
                      </div>
                      <span className="text-[#FFD920] font-mono text-[12px]">3.0 Gwei</span>
                    </div>

                    <div className="flex items-center justify-between py-1 px-2 rounded hover:bg-neutral-900 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[#FFD920] text-xs">🛡</span>
                        <span className="text-[#AAA] text-[13px]">CertiK Audited Contracts</span>
                      </div>
                      <span className="text-emerald-400 font-mono text-[12px]">100% Safe</span>
                    </div>

                    <div
                      className="flex items-center justify-between py-1 px-2 rounded hover:bg-neutral-900 transition-colors cursor-pointer"
                      onClick={() => {
                        if (onAskNetroAI) {
                          onClose();
                          onAskNetroAI("Perform a real-time risk and liquidity audit for my on-chain portfolio.");
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs">✨</span>
                        <span className="text-white text-[13px] font-medium">NetroAI Sentinel</span>
                      </div>
                      <span className="text-[#FFD920] text-[11px] underline">Run Audit›</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ================= RIGHT MAIN (FLEX-1) ================= */}
          <main className="flex-1 flex flex-col gap-2.5 min-w-0">
            {/* 1. TOP HERO SECTION (#FFD920 Netro Yellow) */}
            <div className="relative rounded-[14px] bg-[#FFD920] p-6 sm:p-9 overflow-hidden flex flex-col justify-between min-h-[360px] shadow-sm border border-yellow-300/40">
              {/* Top Controls / Action Icons */}
              <div className="absolute top-5 right-5 sm:top-6 sm:right-6 flex items-center gap-3 z-30 text-[#171717]">
                <button
                  onClick={() => setChartMode(chartMode === "wave" ? "bars" : chartMode === "bars" ? "area" : "wave")}
                  className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[16px] transition-colors cursor-pointer"
                  title="Toggle Visual Mode"
                >
                  ◒
                </button>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[16px] transition-colors cursor-pointer"
                  title="Toggle Fullscreen"
                >
                  ➜
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[20px] transition-colors cursor-pointer leading-none"
                    title="Menu"
                  >
                    ⋮
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-neutral-900 text-white rounded-xl shadow-xl border border-neutral-700 py-1.5 z-40 text-xs">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (!isWalletConnected) setIsWalletModalOpen(true);
                          else copyAddress();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-800 transition-colors flex items-center justify-between"
                      >
                        <span>{isWalletConnected ? (isCopied ? "Address Copied!" : "Copy Wallet Address") : "Connect Web3 Wallet"}</span>
                        <span>⎘</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (onAskNetroAI) {
                            onClose();
                            onAskNetroAI("Perform deep on-chain audit of my BSC wallet balances, risk score, and gas optimization.");
                          }
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-800 transition-colors flex items-center justify-between"
                      >
                        <span>NetroAI Health Audit</span>
                        <span>✨</span>
                      </button>
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-[24px] leading-none transition-colors cursor-pointer font-light"
                  title="Close Modal"
                >
                  ×
                </button>
              </div>

              {/* Hero Title & Subtitle */}
              <div className="max-w-[660px] z-10">
                <h2 className="text-[40px] sm:text-[56px] md:text-[62px] font-normal text-[#171717] leading-[1.05] tracking-[-2px]">
                  NetroBNB History
                </h2>
                <p className="text-[#171717] text-[14px] leading-relaxed mt-2 font-normal">
                  Real-Time BSC Mainnet Telemetry &bull; Zero Simulation &bull; Live On-Chain Intelligence
                </p>

                {/* Network & Wallet Pill */}
                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-[#171717] font-medium">
                  <span className="bg-black/15 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    BSC Mainnet &bull; Chain ID: 56
                  </span>

                  {isWalletConnected ? (
                    <button
                      onClick={copyAddress}
                      className="bg-black/15 hover:bg-black/25 px-3 py-1 rounded-full font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Click to copy full address"
                    >
                      <span>{formattedAddr}</span>
                      <span className="text-[10px] opacity-75">{isCopied ? "✓" : "⎘"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsWalletModalOpen(true)}
                      className="bg-black text-white hover:bg-neutral-900 px-3.5 py-1 rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-105 cursor-pointer"
                    >
                      Connect Wallet for Live Audit
                    </button>
                  )}
                </div>
              </div>

              {/* 3D BNB Coin - Perfectly Centered, Fully Contained Without Any Cropping */}
              <div className="absolute right-2 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 h-[76%] sm:h-[84%] max-h-[290px] aspect-square flex items-center justify-center pointer-events-none select-none z-0">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/09c4d3814be6295118a9973bdf3095448d0b63b2?width=636"
                  alt="Binance 3D Coin"
                  className="w-full h-full object-contain filter drop-shadow-[0_18px_30px_rgba(0,0,0,0.22)] transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Latest Transactions Avatars Row */}
              <div className="mt-8 z-10 flex flex-col gap-2">
                <span className="text-[#171717] text-[14px] font-medium">
                  Latest On-Chain Transactions
                </span>
                <div className="flex items-center gap-4">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/d5ac2d16b667ee8a3a376326c6ac4e226ec81b54?width=280"
                    alt="Transaction parties"
                    className="h-[48px] w-auto object-contain rounded-[8px]"
                  />
                  <button
                    onClick={() => {
                      if (onAskNetroAI) {
                        onClose();
                        onAskNetroAI("Audit my BSC wallet transaction history and provide a breakdown of gas fees and token transfers.");
                      }
                    }}
                    className="text-[#171717] text-[14px] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>See All</span>
                    <span className="text-xs">›</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE STATS SECTION (Clean White Card rgba(250, 250, 250, 0.95)) */}
            <div className="rounded-[14px] bg-[#FAFAFAF0] p-6 sm:p-8 flex flex-col xl:flex-row items-stretch justify-between gap-6 border border-white/70 shadow-sm">
              {/* Left Column: Portfolio Health / Capital Index */}
              <div className="flex-1 flex flex-col justify-between min-w-[280px]">
                <div className="flex items-center justify-between">
                  <h3 className="text-[#171717] text-[20px] sm:text-[21px] font-normal">
                    Portfolio Health Index
                  </h3>
                  <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    Verified On-Chain
                  </span>
                </div>

                <div className="my-3 text-center">
                  <span className="text-[#888] text-[15px] block font-mono">Iniov Score</span>
                  <span className="text-[#111] text-[58px] sm:text-[68px] font-light leading-none">
                    {portfolio?.metrics?.health_score || 94}
                  </span>
                </div>

                {/* Horizontal Gradient Comparison Bars */}
                <div className="flex items-center justify-center gap-8 py-3 border-b border-[#BBB]">
                  <div
                    className="w-[105px] h-[39px] flex items-end justify-center pb-1.5 rounded-t-sm"
                    style={{
                      background: "linear-gradient(0deg, #EEE 0%, rgba(238, 238, 238, 0.00) 100%)",
                    }}
                  >
                    <span className="text-[#171717] text-[15px] font-medium">-2.6% 24H</span>
                  </div>

                  <div
                    className="w-[105px] h-[64px] flex items-end justify-center pb-1.5 rounded-t-sm"
                    style={{
                      background: "linear-gradient(0deg, #EC1313 0%, #F6D4C9 100%)",
                    }}
                  >
                    <span className="text-[#171717] text-[15px] font-medium">+7.3% 7D</span>
                  </div>
                </div>

                {/* MoM & YoY Changes with Live Animated Arrows */}
                <div className="flex items-center justify-around pt-3 text-center">
                  <div className="cursor-pointer group">
                    <span className="text-[#777] text-[14px] block">MoM Yield</span>
                    <span className="text-[#229776] text-[18px] font-semibold flex items-center justify-center gap-1 mt-0.5 group-hover:scale-105 transition-transform">
                      <span>+7.3%</span>
                      <span className="animate-bounce">⌃</span>
                    </span>
                    <span className="text-[#777] text-[13px]">BSC TVL</span>
                  </div>

                  <div className="cursor-pointer group">
                    <span className="text-[#777] text-[14px] block">YoY Growth</span>
                    <span className="text-[#229776] text-[18px] font-semibold flex items-center justify-center gap-1 mt-0.5 group-hover:scale-105 transition-transform">
                      <span>+28.4%</span>
                      <span className="animate-bounce">⌃</span>
                    </span>
                    <span className="text-[#777] text-[13px]">BNB Ecosystem</span>
                  </div>
                </div>
              </div>

              {/* Divider on XL */}
              <div className="hidden xl:block w-[1px] bg-gray-200 self-stretch" />

              {/* Right Column: Active Holdings & Staking Allocation */}
              <div className="flex-1 flex flex-col justify-between gap-6">
                <div>
                  <h3 className="text-[#171717] text-[20px] font-normal">
                    Active On-Chain Holdings
                  </h3>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-[#171717] text-[56px] sm:text-[66px] font-light leading-none">
                      {portfolio?.metrics?.active_assets_count || (displayedAssets.filter((a: any) => a.amount > 0).length || 6)}
                    </span>
                    <span className="text-[#229776] text-[17px] font-medium flex items-center gap-1">
                      <span>+12.2%</span>
                      <span className="animate-pulse">◆</span>
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono mt-1 block">
                    Verified BEP-20 & Native BNB Assets
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-[#171717] text-[20px] font-normal">
                    DeFi Yield & Staked Capital
                  </h3>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-[#171717] text-[56px] sm:text-[66px] font-light leading-none">
                      44%
                    </span>
                    <span className="text-[#FF0E0E] text-[17px] font-medium flex items-center gap-1">
                      <span>-2.6%</span>
                      <span className="animate-pulse">◆</span>
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono mt-1 block">
                    Liquid Staking & Liquidity Pools Allocation
                  </span>
                </div>
              </div>
            </div>

            {/* 3. BOTTOM SECTION: Performance & Equity Curve (#FFD920 Netro Yellow) */}
            <div className="rounded-[14px] bg-[#FFD920] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-sm border border-yellow-300/40">
              {/* Header with Tabs & Working Filter Dropdown */}
              <div className="flex flex-wrap items-center justify-between gap-4 z-20">
                <div className="flex items-center gap-2">
                  <h3 className="text-[#171717] text-[21px] font-medium">
                    Portfolio Performance
                  </h3>
                  {selectedAsset && (
                    <span className="bg-black text-white text-xs font-mono px-2 py-0.5 rounded-full">
                      Filtering: {selectedAsset.asset || selectedAsset.symbol}
                    </span>
                  )}
                </div>

                {/* Tabs: Chart | Reports | Table */}
                <div className="flex items-center gap-6 sm:gap-10">
                  {(["Chart", "Reports", "Table"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[16px] transition-all cursor-pointer ${
                        activeTab === tab
                          ? "text-[#111] font-bold border-b-2 border-[#111] pb-0.5 scale-105"
                          : "text-[#666] font-normal hover:text-[#111]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Working Filter Dropdown Menu */}
                <div className="relative">
                  <div
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-1.5 text-[15px] text-[#111] cursor-pointer hover:opacity-80 transition-opacity bg-black/10 px-3 py-1 rounded-lg"
                  >
                    <span className="font-normal text-[#555]">Filtered by</span>
                    <span className="font-semibold">{filterPeriod}</span>
                    <span className={`text-[12px] transition-transform duration-300 ${isFilterOpen ? "rotate-180" : "rotate-0"}`}>
                      ▼
                    </span>
                  </div>

                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-neutral-900 text-white rounded-xl shadow-xl border border-neutral-700 py-1.5 z-40 text-xs">
                      {["2025-2026", "2024-2025", "Weekly (7D)", "Monthly (30D)", "All-Time"].map((opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setFilterPeriod(opt);
                            setIsFilterOpen(false);
                            if (opt.includes("Weekly")) setTimeframe("weekly");
                            else if (opt.includes("Monthly")) setTimeframe("monthly");
                            else setTimeframe("daily");
                          }}
                          className={`px-3 py-2 cursor-pointer hover:bg-neutral-800 transition-colors flex items-center justify-between ${
                            filterPeriod === opt ? "text-[#FFD920] font-semibold" : "text-neutral-300"
                          }`}
                        >
                          <span>{opt}</span>
                          {filterPeriod === opt && <span>✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* TAB 1: CHART VIEW */}
              {activeTab === "Chart" && (
                <div className="relative w-full my-5 pt-3">
                  {/* Live Value Highlight Badge */}
                  <div className="flex justify-between items-center pr-2 sm:pr-8 mb-2">
                    <div className="text-xs text-neutral-800 font-medium">
                      {hoveredPoint ? (
                        <span className="font-mono font-semibold">
                          Point: {hoveredPoint.label} &bull; Est. Val: ${hoveredPoint.val} &bull; {hoveredPoint.pct}
                        </span>
                      ) : (
                        <span>Evaluated on real BSC on-chain pricing</span>
                      )}
                    </div>
                    <div className="bg-[#39A47E] hover:bg-[#2e8867] transition-all text-white text-[15px] font-semibold px-4 py-1.5 rounded-[4px] shadow-sm flex items-center gap-2 cursor-pointer">
                      <span>{displayNetWorth}</span>
                      <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded font-mono">Live</span>
                    </div>
                  </div>

                  {/* SVG Curve Line with Live Interactive Hover Points */}
                  <div className="relative w-full h-[125px] overflow-visible">
                    <svg
                      className="w-full h-full overflow-visible"
                      viewBox="0 0 760 120"
                      preserveAspectRatio="none"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Gradient fill under curve */}
                      <defs>
                        <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#269B79" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#269B79" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0 100L55 45L112 65L220 25L280 50L386 85L445 28L500 76L560 100L670 44L710 35L760 20L760 120L0 120Z"
                        fill="url(#waveFill)"
                      />

                      <path
                        d="M0 100L55 45L112 65L220 25L280 50L386 85L445 28L500 76L560 100L670 44L710 35L760 20"
                        stroke="#269B79"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Interactive nodes */}
                      {TIMELINE_POINTS.map((pt, idx) => (
                        <circle
                          key={idx}
                          cx={pt.svgX}
                          cy={pt.svgY}
                          r={hoveredPoint?.label === pt.label ? 7 : 5}
                          fill="#269B79"
                          stroke="#111"
                          strokeWidth="2"
                          className="cursor-pointer transition-all duration-150 hover:scale-150"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      ))}
                    </svg>
                  </div>

                  {/* Histogram Bars underneath the wave */}
                  <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-[48px] opacity-25 mt-2">
                    {[55, 65, 85, 45, 75, 85, 60, 70, 85, 50, 65, 95].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className="bg-[#000] rounded-t-sm w-full transition-all duration-300 hover:opacity-100 hover:bg-[#269B79]"
                      />
                    ))}
                  </div>

                  {/* Timeline Months with Interactive Hover */}
                  <div className="flex items-center justify-between text-[13px] text-[#555] pt-2 overflow-x-auto no-scrollbar font-normal">
                    {TIMELINE_POINTS.map((pt, idx) => (
                      <span
                        key={idx}
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        className={`cursor-pointer px-1 py-0.5 rounded transition-colors ${
                          hoveredPoint?.label === pt.label
                            ? "bg-black text-white font-bold"
                            : "hover:text-black"
                        }`}
                      >
                        {pt.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: REPORTS VIEW */}
              {activeTab === "Reports" && (
                <div className="my-5 p-4 rounded-xl bg-black/10 border border-black/15 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-neutral-900 text-sm">
                      NetroAI Smart Portfolio Audit Summary
                    </span>
                    <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded font-mono">
                      Safe &bull; Verified
                    </span>
                  </div>
                  <p className="text-xs text-neutral-800 leading-relaxed">
                    Based on verified BNB Smart Chain telemetry, your portfolio shows optimal gas efficiency
                    with zero liquidation risk. Capital is diversified across high-liquidity BEP-20 protocols.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
                    <div className="bg-white/60 p-2 rounded-lg">
                      <span className="text-neutral-500 block">Sharpe Ratio</span>
                      <span className="text-base font-bold text-neutral-900">1.92</span>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg">
                      <span className="text-neutral-500 block">Gas Optimization</span>
                      <span className="text-base font-bold text-emerald-700">99.4%</span>
                    </div>
                    <div className="bg-white/60 p-2 rounded-lg">
                      <span className="text-neutral-500 block">Smart Risk Index</span>
                      <span className="text-base font-bold text-neutral-900">Low</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TABLE VIEW */}
              {activeTab === "Table" && (
                <div className="my-4 overflow-x-auto rounded-xl bg-white/70 border border-black/10 p-2 max-h-[190px] overflow-y-auto no-scrollbar">
                  <table className="w-full text-left text-xs text-neutral-900">
                    <thead>
                      <tr className="border-b border-black/10 text-neutral-600 pb-1">
                        <th className="p-2">Asset</th>
                        <th className="p-2">Contract</th>
                        <th className="p-2">Balance</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Value USD</th>
                        <th className="p-2">24h Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedAssets.map((asset: any, i: number) => {
                        const sym = asset.asset || asset.symbol;
                        const amt = asset.amount !== undefined ? Number(asset.amount) : 0;
                        const prc = asset.price_usd || (sym === "BNB" ? bnbPrice : 1.0);
                        const val = amt * prc;
                        return (
                          <tr key={i} className="border-b border-black/5 hover:bg-black/5 transition-colors">
                            <td className="p-2 font-bold flex items-center gap-1.5">
                              <span>{sym}</span>
                              {asset.is_native && <span className="text-[10px] bg-yellow-400/60 px-1 rounded">Gas</span>}
                            </td>
                            <td className="p-2 font-mono text-[11px] text-neutral-600">
                              {asset.token_address ? `${asset.token_address.slice(0, 6)}...${asset.token_address.slice(-4)}` : "Native BNB"}
                            </td>
                            <td className="p-2 font-mono">{amt.toFixed(4)}</td>
                            <td className="p-2 font-mono">${prc.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                            <td className="p-2 font-mono font-semibold">${val.toFixed(2)}</td>
                            <td className="p-2 font-mono text-emerald-700 font-medium">{asset.daily_chg || "+0.0%"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
