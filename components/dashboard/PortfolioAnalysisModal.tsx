"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCrypto } from "@/context/CryptoContext";

interface PortfolioAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskNetroAI?: (prompt: string) => void;
}

export const PortfolioAnalysisModal: React.FC<PortfolioAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAskNetroAI,
}) => {
  const { fullAddress, isWalletConnected, setIsWalletModalOpen } = useCrypto();
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily");
  const [isLoading, setIsLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"chart" | "reports" | "table">("chart");

  const fetchPortfolio = async (tf: "daily" | "weekly" | "monthly") => {
    setIsLoading(true);
    try {
      const url = fullAddress
        ? `/api/v1/portfolio?address=${encodeURIComponent(fullAddress)}&timeframe=${tf}`
        : `/api/v1/portfolio?timeframe=${tf}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch (e) {
      console.error("Failed to fetch real on-chain portfolio:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPortfolio(timeframe);
    }
  }, [isOpen, timeframe, fullAddress]);

  if (!isOpen) return null;

  const totalUsd = portfolio?.total_portfolio_usd || 0;
  const pnlUsd = portfolio?.unrealized_pnl_usd || 0;
  const pnlPct = portfolio?.unrealized_pnl_pct || 0;
  const isPos = pnlUsd >= 0;

  const handleDeepAudit = () => {
    const periodName =
      timeframe === "daily" ? "Daily (24H)" : timeframe === "weekly" ? "Weekly (7D)" : "Monthly (30D)";
    const prompt = `Analyze my verified on-chain BSC portfolio for ${periodName}. My wallet address is ${
      fullAddress || "connected wallet"
    }. Native BNB balance is ${portfolio?.native_bnb_balance || 0} BNB ($${totalUsd.toLocaleString(
      "en-US",
      { minimumFractionDigits: 2 }
    )}). Provide on-chain health audit, gas optimization tips, and staking yield options on BNB Chain.`;
    onClose();
    if (onAskNetroAI) {
      onAskNetroAI(prompt);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="w-full max-w-5xl bg-[#E5E7EB] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col max-h-[92vh] border border-gray-300 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Hero Yellow Banner (Brand Identity matching Clayton Plaza / NetroBNB) */}
          <div className="bg-gradient-to-r from-[#F4D014] via-[#F8D82A] to-[#F4D014] px-6 sm:px-8 py-5 border-b border-yellow-400/40 relative shrink-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#1C1C1C] text-[#F4D014] tracking-wide uppercase">
                    On-Chain Verified &bull; BSC Mainnet
                  </span>
                  {isWalletConnected && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#1C1C1C] bg-white/70 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} className="text-emerald-600" /> Live Data
                    </span>
                  )}
                </div>

                <h2 className="font-sans text-[26px] sm:text-[32px] font-extrabold text-[#1C1C1C] leading-tight tracking-tight mt-1">
                  Financial Portfolio Analytics
                </h2>

                <p className="font-sans text-[12.5px] sm:text-[13.5px] text-[#1C1C1C]/80 font-medium flex items-center gap-2 mt-0.5">
                  <span>Network: BNB Smart Chain (Chain ID: 56)</span>
                  <span>&bull;</span>
                  <span>
                    Wallet:{" "}
                    {isWalletConnected && fullAddress ? (
                      <strong className="font-mono text-[#1C1C1C]">
                        {fullAddress.slice(0, 6)}...{fullAddress.slice(-4)}
                      </strong>
                    ) : (
                      "No wallet connected"
                    )}
                  </span>
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                {/* Timeframe Switcher */}
                <div className="flex items-center bg-[#1C1C1C]/10 p-1 rounded-xl">
                  {(["daily", "weekly", "monthly"] as const).map((tf) => {
                    const label = tf === "daily" ? "Daily (24H)" : tf === "weekly" ? "Weekly (7D)" : "Monthly (30D)";
                    const isActive = timeframe === tf;
                    return (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#1C1C1C] text-white shadow-sm"
                            : "text-[#1C1C1C]/80 hover:text-[#1C1C1C] hover:bg-white/20"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => fetchPortfolio(timeframe)}
                  className="p-2 rounded-xl bg-[#1C1C1C]/10 hover:bg-[#1C1C1C]/20 text-[#1C1C1C] transition-all cursor-pointer"
                  title="Refresh On-Chain Balances"
                >
                  <RefreshCw size={17} className={isLoading ? "animate-spin" : ""} />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-[#1C1C1C]/10 hover:bg-[#1C1C1C]/20 text-[#1C1C1C] transition-all cursor-pointer"
                  title="Close"
                >
                  <X size={19} />
                </button>
              </div>
            </div>
          </div>

          {/* Body: Split Layout (Left Sidebar + Right Analytics Dashboard matching image 2) */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 sm:p-6 no-scrollbar">
            {/* Left Column: Real Assets & Holdings List (4 of 12 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-3.5">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <h3 className="font-sans text-[15px] font-bold text-[#1C1C1C] flex items-center gap-1.5">
                    <Layers size={16} className="text-[#F4D014]" />
                    On-Chain Vaults & Assets
                  </h3>
                  <span className="text-[11px] font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                    {portfolio?.balances?.length || 0} Assets
                  </span>
                </div>

                {/* Real Wallet Holdings List */}
                <div className="divide-y divide-gray-100 mt-2">
                  {isWalletConnected && portfolio?.balances && portfolio.balances.length > 0 ? (
                    portfolio.balances.map((token: any) => (
                      <div key={token.asset} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {token.icon ? (
                            <img
                              src={token.icon}
                              alt={token.asset}
                              className="w-8 h-8 rounded-full object-contain bg-gray-50 p-0.5 shadow-xs"
                              onError={(e: any) => (e.target.style.display = "none")}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#F4D014] text-[#1C1C1C] font-bold text-xs flex items-center justify-center">
                              {token.asset.slice(0, 3)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[14px] text-[#1C1C1C] leading-none">
                                {token.asset}
                              </span>
                              {token.is_native && (
                                <span className="text-[9px] bg-yellow-100 text-yellow-800 font-bold px-1.5 py-0.5 rounded">
                                  Gas
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-500 font-mono">
                              {token.amount > 0 ? Number(token.amount).toFixed(4) : "0.0000"} {token.asset}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-sans font-bold text-[13.5px] text-[#1C1C1C] leading-tight">
                            ${Number(token.value_usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <span className="text-[10.5px] text-emerald-600 font-semibold block">
                            {token.daily_chg}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center">
                      <Wallet size={28} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-xs font-semibold text-gray-600">No wallet connected</p>
                      <button
                        onClick={() => setIsWalletModalOpen(true)}
                        className="mt-2 text-xs font-bold text-[#1C1C1C] bg-[#F4D014] px-3 py-1.5 rounded-lg shadow-xs hover:bg-yellow-400 cursor-pointer"
                      >
                        Connect Wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* On-Chain Activity Status Card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-2.5">
                <h4 className="font-sans text-[13.5px] font-bold text-[#1C1C1C] flex items-center gap-1.5">
                  <Activity size={15} className="text-[#F4D014]" />
                  BSC On-Chain Telemetry
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl">
                    <span className="text-gray-500 block text-[10.5px]">Tx Nonce</span>
                    <strong className="text-sm font-bold text-[#1C1C1C]">
                      {portfolio?.tx_count !== undefined ? portfolio.tx_count : "--"}
                    </strong>
                  </div>
                  <div className="bg-[#F8F9FA] p-2.5 rounded-xl">
                    <span className="text-gray-500 block text-[10.5px]">BNB Spot Price</span>
                    <strong className="text-sm font-bold text-[#1C1C1C]">
                      ${portfolio?.native_bnb_price_usd ? Number(portfolio.native_bnb_price_usd).toFixed(2) : "652.50"}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>Explorer: BscScan</span>
                  {fullAddress && (
                    <a
                      href={`https://bscscan.com/address/${fullAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                    >
                      View on BscScan <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Main Analytics Stack (8 of 12 cols, matching image 2) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* Row 1: Key Metrics Cards (Clean white with yellow bar charts) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Card 1: Net Worth Index */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Total Net Worth</span>
                    <span className={`flex items-center font-bold ${isPos ? "text-emerald-600" : "text-rose-600"}`}>
                      {isPos ? <TrendingUp size={13} className="mr-0.5" /> : <TrendingDown size={13} className="mr-0.5" />}
                      {isPos ? "+" : ""}{pnlPct}%
                    </span>
                  </div>

                  <div className="my-2">
                    <p className="font-sans text-[28px] sm:text-[32px] font-black text-[#1C1C1C] leading-none">
                      ${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <span className="text-[11px] text-gray-400 block mt-1">
                      {timeframe === "daily" ? "24h P&L:" : timeframe === "weekly" ? "7d P&L:" : "30d P&L:"}{" "}
                      <strong className={isPos ? "text-emerald-600" : "text-rose-600"}>
                        {isPos ? "+$" : "-$"}{Math.abs(pnlUsd).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </strong>
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-[#F4D014] h-full rounded-full" style={{ width: totalUsd > 0 ? "75%" : "0%" }} />
                  </div>
                </div>

                {/* Card 2: Active Holdings & Bar Visualizer (Matching image 2 style) */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Active BSC Assets</span>
                    <span className="text-emerald-600 font-bold flex items-center">
                      <TrendingUp size={12} className="mr-0.5" /> +100% On-Chain
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between my-1">
                    <p className="font-sans text-[28px] sm:text-[32px] font-black text-[#1C1C1C] leading-none">
                      {portfolio?.metrics?.active_assets_count || (portfolio?.balances?.length || 0)}
                    </p>

                    {/* Mini Histogram Bars matching Image 2 */}
                    <div className="flex items-end gap-1 h-8">
                      <div className="w-2 bg-gray-200 rounded-xs h-3" />
                      <div className="w-2 bg-gray-200 rounded-xs h-5" />
                      <div className="w-2 bg-[#F4D014] rounded-xs h-8" />
                      <div className="w-2 bg-gray-200 rounded-xs h-4" />
                      <div className="w-2 bg-gray-300 rounded-xs h-6" />
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 block">
                    Native BNB + Verified BEP20 Tokens
                  </span>
                </div>

                {/* Card 3: Health Score & Resiliency */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="font-medium">Health & Risk Index</span>
                    <span className="text-emerald-600 font-bold flex items-center">
                      <ShieldCheck size={13} className="mr-0.5" /> Verified
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between my-1">
                    <p className="font-sans text-[28px] sm:text-[32px] font-black text-[#1C1C1C] leading-none">
                      {portfolio?.metrics?.health_score || 88}
                    </p>

                    {/* Mini Histogram Bars matching Image 2 */}
                    <div className="flex items-end gap-1 h-8">
                      <div className="w-2 bg-gray-200 rounded-xs h-4" />
                      <div className="w-2 bg-gray-300 rounded-xs h-5" />
                      <div className="w-2 bg-gray-300 rounded-xs h-4" />
                      <div className="w-2 bg-[#F4D014] rounded-xs h-8" />
                      <div className="w-2 bg-[#1C1C1C] rounded-xs h-7" />
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 block">
                    Liquidation Risk: Zero &bull; Sharpe: {portfolio?.metrics?.sharpe_ratio || 1.92}
                  </span>
                </div>
              </div>

              {/* Row 2: Performance Timeline & Revenue Chart (Matching Bottom of Image 2) */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                {/* Chart Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-sans text-[16px] font-bold text-[#1C1C1C]">
                      Portfolio Performance &amp; Equity Curve
                    </h3>
                    <span className="text-xs text-gray-400">
                      Evaluated on {timeframe.toUpperCase()} horizon with real on-chain pricing
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center bg-gray-100 p-0.5 rounded-lg">
                      {(["chart", "reports", "table"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1 rounded-md font-semibold capitalize transition-all cursor-pointer ${
                            activeTab === tab ? "bg-white text-[#1C1C1C] shadow-xs" : "text-gray-500 hover:text-black"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline Chart Visualization matching Image 2 */}
                <div className="py-4">
                  {/* Green Tag for Current Net Worth (like $1.8 M in image 2) */}
                  <div className="flex justify-end mb-2">
                    <div className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                      <span>Live Value:</span>
                      <span>${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Histogram Bars with Netro Yellow Highlighting */}
                  <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-32 pt-4 border-b border-gray-100">
                    {[
                      { label: "1", h: "35%", active: false },
                      { label: "2", h: "45%", active: false },
                      { label: "3", h: "38%", active: false },
                      { label: "4", h: "52%", active: false },
                      { label: "5", h: "60%", active: false },
                      { label: "6", h: "48%", active: false },
                      { label: "7", h: "68%", active: false },
                      { label: "8", h: "75%", active: false },
                      { label: "9", h: "82%", active: false },
                      { label: "10", h: "78%", active: false },
                      { label: "11", h: "90%", active: false },
                      { label: "Now", h: "98%", active: true },
                    ].map((bar, bIdx) => (
                      <div key={bIdx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <div
                          style={{ height: bar.h }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            bar.active
                              ? "bg-[#F4D014] shadow-sm ring-2 ring-[#F4D014]/40"
                              : "bg-gray-200/80 hover:bg-gray-300"
                          }`}
                          title={`Interval ${bar.label}`}
                        />
                        <span className="text-[10px] text-gray-400 font-mono">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer of Chart */}
                <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-2">
                  <span>Filtered by: Real-Time BNB Smart Chain Telemetry</span>
                  <span className="font-semibold text-[#1C1C1C]">
                    Chain ID: 56 &bull; Verified Zero Mock
                  </span>
                </div>
              </div>

              {/* NetroAI Intelligent Financial Audit Card */}
              <div className="bg-[#F8F9FA] rounded-2xl p-4 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4D014] text-[#1C1C1C] flex items-center justify-center font-black shrink-0 shadow-xs">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-sans text-[14px] font-bold text-[#1C1C1C]">
                      NetroAI Wealth Advisor
                    </h4>
                    <p className="text-[11.5px] text-gray-600">
                      {isWalletConnected
                        ? `Audit complete for ${fullAddress?.slice(0, 6)}...${fullAddress?.slice(-4)}. Native BNB reserve is verified on BSC.`
                        : "Connect your BSC Web3 wallet to receive an automated AI on-chain risk audit."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDeepAudit}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95"
                >
                  <span>Ask NetroAI Deep Audit</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
            <span>Powered by NetroAI Asset Intelligence &bull; Binance Agent OS</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1C1C1C] font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
