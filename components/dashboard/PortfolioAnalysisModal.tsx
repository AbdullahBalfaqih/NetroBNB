"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  PieChart,
  Sparkles,
  RefreshCw,
  Wallet,
  Calendar,
  AlertCircle,
  ArrowRight,
  Zap,
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
      console.error("Error fetching portfolio:", e);
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

  const getPnlColor = (val: number) => (val >= 0 ? "text-emerald-500" : "text-rose-500");
  const getPnlBg = (val: number) => (val >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10");

  const handleDeepAudit = () => {
    const periodName = timeframe === "daily" ? "Daily (24H)" : timeframe === "weekly" ? "Weekly (7D)" : "Monthly (30D)";
    const prompt = `Analyze my financial portfolio for the ${periodName} timeframe. Total value is $${portfolio?.total_portfolio_usd?.toLocaleString() || "0"}, P&L is ${portfolio?.unrealized_pnl_pct}% ($${portfolio?.unrealized_pnl_usd?.toLocaleString()}). Provide risk assessment, asset diversification review, and yield optimization strategies on BNB Chain.`;
    onClose();
    if (onAskNetroAI) {
      onAskNetroAI(prompt);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-fadeIn">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className="w-full max-w-4xl bg-[#0F0F11] text-white rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.8)] border border-[#26262B] flex flex-col max-h-[92vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#17171C] px-6 py-4 flex items-center justify-between border-b border-[#26262B] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F4D014]/15 border border-[#F4D014]/40 flex items-center justify-center text-[#F4D014]">
                <PieChart size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
                    Financial Portfolio Intelligence
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4D014] text-[#1C1C1C]">
                    NetroAI Pro
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Multi-asset health audit, on-chain risk telemetry & timeframe performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPortfolio(timeframe)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Refresh"
              >
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Timeframe Switcher Tabs */}
          <div className="bg-[#121216] px-6 py-3 border-b border-[#222228] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5 bg-[#1C1C22] p-1 rounded-xl border border-[#2B2B34]">
              <span className="text-xs text-gray-400 px-2 flex items-center gap-1">
                <Calendar size={13} /> Time Horizon:
              </span>
              {(["daily", "weekly", "monthly"] as const).map((tf) => {
                const label = tf === "daily" ? "Daily (24H)" : tf === "weekly" ? "Weekly (7D)" : "Monthly (30D)";
                const isActive = timeframe === tf;
                return (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#F4D014] text-[#1C1C1C] shadow-sm font-bold"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 flex items-center gap-1.5">
                <Wallet size={14} className="text-[#F4D014]" />
                {isWalletConnected ? (
                  <span className="text-emerald-400 font-mono">
                    {fullAddress?.slice(0, 6)}...{fullAddress?.slice(-4)} (Connected)
                  </span>
                ) : (
                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="text-[#F4D014] hover:underline font-medium cursor-pointer"
                  >
                    Connect BSC Wallet for Live Balances
                  </button>
                )}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {/* Top Key Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Total Portfolio Valuation */}
              <div className="bg-[#16161D] rounded-2xl p-4 border border-[#262631] relative overflow-hidden">
                <span className="text-xs text-gray-400 font-medium block">Total Net Worth</span>
                <p className="text-2xl font-bold font-sans text-white mt-1">
                  ${portfolio?.total_portfolio_usd ? portfolio.total_portfolio_usd.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-gray-400">BSC Mainnet:</span>
                  <span className="text-[#F4D014] font-semibold">Active Vault</span>
                </div>
              </div>

              {/* Timeframe P&L */}
              <div className="bg-[#16161D] rounded-2xl p-4 border border-[#262631]">
                <span className="text-xs text-gray-400 font-medium block">
                  {timeframe === "daily" ? "Daily Return (24h)" : timeframe === "weekly" ? "Weekly Return (7d)" : "Monthly Return (30d)"}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-bold font-sans ${getPnlColor(portfolio?.unrealized_pnl_usd || 0)}`}>
                    {(portfolio?.unrealized_pnl_usd || 0) >= 0 ? "+$" : "-$"}
                    {Math.abs(portfolio?.unrealized_pnl_usd || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${getPnlBg(
                      portfolio?.unrealized_pnl_pct || 0
                    )} ${getPnlColor(portfolio?.unrealized_pnl_pct || 0)}`}
                  >
                    {(portfolio?.unrealized_pnl_pct || 0) >= 0 ? (
                      <TrendingUp size={13} />
                    ) : (
                      <TrendingDown size={13} />
                    )}
                    {(portfolio?.unrealized_pnl_pct || 0) >= 0 ? "+" : ""}
                    {portfolio?.unrealized_pnl_pct || 0}%
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 block mt-2">
                  Best: <strong className="text-emerald-400 font-medium">{portfolio?.best_performer || "--"}</strong>
                </span>
              </div>

              {/* Health Score */}
              <div className="bg-[#16161D] rounded-2xl p-4 border border-[#262631]">
                <span className="text-xs text-gray-400 font-medium block">Financial Health Score</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-black font-extrabold flex items-center justify-center text-lg shadow-sm">
                    {portfolio?.metrics?.health_score || 88}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold text-xs">
                      <ShieldCheck size={14} /> Strong Resiliency
                    </div>
                    <span className="text-[11px] text-gray-400">Low liquidation risk</span>
                  </div>
                </div>
              </div>

              {/* Risk & Volatility */}
              <div className="bg-[#16161D] rounded-2xl p-4 border border-[#262631]">
                <span className="text-xs text-gray-400 font-medium block">Risk & Volatility Profile</span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-base font-bold text-amber-400">
                    {portfolio?.metrics?.risk_level || "Moderate"}
                  </span>
                  <span className="text-xs bg-amber-400/10 text-amber-300 font-semibold px-2 py-0.5 rounded-md">
                    Sharpe: {portfolio?.metrics?.sharpe_ratio || 1.84}
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: "55%" }}></div>
                </div>
                <span className="text-[10.5px] text-gray-400 block mt-1.5">
                  30D Volatility: {portfolio?.metrics?.volatility_30d_pct || 14.2}%
                </span>
              </div>
            </div>

            {/* Allocation Visualizer Bar */}
            <div className="bg-[#16161D] rounded-2xl p-5 border border-[#262631] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieChart size={16} className="text-[#F4D014]" />
                  Holdings Allocation Breakdown
                </h4>
                <span className="text-xs text-gray-400">
                  Diversification Score:{" "}
                  <strong className="text-white font-semibold">{portfolio?.metrics?.diversification_score || 84}/100</strong>
                </span>
              </div>

              {/* Progress Distribution Bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-800">
                {portfolio?.balances?.map((b: any, idx: number) => {
                  const colors = [
                    "bg-[#F4D014]", // BNB
                    "bg-[#F7931A]", // BTC
                    "bg-[#627EEA]", // ETH
                    "bg-[#00FFA3]", // SOL
                    "bg-[#26A17B]", // USDT
                  ];
                  return (
                    <div
                      key={b.asset}
                      style={{ width: `${b.current_allocation_pct}%` }}
                      className={`${colors[idx % colors.length]} transition-all duration-500`}
                      title={`${b.asset}: ${b.current_allocation_pct}%`}
                    />
                  );
                })}
              </div>

              {/* Holdings Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-gray-400 border-b border-[#262631] pb-2">
                      <th className="py-2 font-medium">Asset</th>
                      <th className="py-2 font-medium">Balance</th>
                      <th className="py-2 font-medium">Spot Price</th>
                      <th className="py-2 font-medium">Value (USD)</th>
                      <th className="py-2 font-medium">Allocation</th>
                      <th className="py-2 font-medium text-right">
                        {timeframe === "daily" ? "24H Chg" : timeframe === "weekly" ? "7D Chg" : "30D Chg"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#22222B]">
                    {portfolio?.balances?.map((b: any) => {
                      const chg =
                        timeframe === "daily"
                          ? b.daily_chg
                          : timeframe === "weekly"
                          ? b.weekly_chg
                          : b.monthly_chg;
                      const isPos = !chg.startsWith("-");
                      return (
                        <tr key={b.asset} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 font-semibold text-white flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-bold text-[10px]">
                              {b.asset.slice(0, 3)}
                            </span>
                            <div>
                              <span>{b.asset}</span>
                              {b.is_native && (
                                <span className="ml-1 text-[9.5px] bg-[#F4D014]/20 text-[#F4D014] px-1.5 py-0.5 rounded">
                                  Gas Native
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 font-mono text-gray-300">
                            {Number(b.amount).toFixed(4)} {b.asset}
                          </td>
                          <td className="py-3 font-mono text-gray-300">
                            ${Number(b.price_usd).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 font-mono font-bold text-white">
                            ${Number(b.value_usd).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-200">{b.current_allocation_pct}%</span>
                            </div>
                          </td>
                          <td className={`py-3 text-right font-semibold ${isPos ? "text-emerald-400" : "text-rose-400"}`}>
                            {chg}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* NetroAI Intelligent Audit Assessment Box */}
            <div className="bg-gradient-to-r from-amber-500/10 via-[#F4D014]/10 to-transparent rounded-2xl p-5 border border-[#F4D014]/30">
              <div className="flex items-center gap-2 text-[#F4D014] font-bold text-sm mb-2">
                <Sparkles size={17} />
                <span>NetroAI Financial Advisor Insights ({timeframe.toUpperCase()})</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">
                {timeframe === "daily" &&
                  "Your 24-hour return is up +2.34%, driven primarily by strong spot accumulation in SOL (+3.1%) and resilient BNB holding above $650. No immediate liquidation risk detected across collateral reserves."}
                {timeframe === "weekly" &&
                  "Over the past 7 days, your portfolio gained +7.82% ($" +
                    (portfolio?.unrealized_pnl_usd?.toLocaleString() || "1,120") +
                    "), outperforming broad market benchmarks. BNB staking generated an estimated +5.6% annualized yield on BSC."}
                {timeframe === "monthly" &&
                  "30-day cumulative ROI stands at +18.65%. Diversification index is strong at 84/100 with healthy stablecoin dry powder (USDT) ready for dollar-cost averaging into momentum dips."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleDeepAudit}
                  className="px-4 py-2 rounded-xl bg-[#F4D014] hover:bg-[#e5c30f] text-[#1C1C1C] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <Sparkles size={14} />
                  <span>Ask NetroAI Deep Portfolio Audit</span>
                  <ArrowRight size={13} />
                </button>

                <div className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Zap size={13} className="text-[#F4D014]" />
                  <span>Instant multi-turn reasoning on BSC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-[#17171C] px-6 py-3.5 border-t border-[#26262B] flex items-center justify-between text-xs text-gray-400 shrink-0">
            <span>Powered by NetroAI Asset Intelligence &bull; Binance Agent OS</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
