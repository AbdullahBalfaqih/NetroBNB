"use client";

import React, { useState, useEffect } from "react";
import { MoreVertical, ArrowUpRight, Sparkles, PieChart } from "lucide-react";
import { useCrypto } from "@/context/CryptoContext";
import { PortfolioAnalysisModal } from "./PortfolioAnalysisModal";

export const ExpensesCard: React.FC = () => {
  const { isWalletConnected, fullAddress, setIsWalletModalOpen } = useCrypto();

  const [portfolioData, setPortfolioData] = useState({
    totalUsd: "$0.00",
    pnlUsd: "+ $0.00",
    topAllocation: "Top Allocation: None (0.0%)",
  });
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLivePortfolio() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const url = fullAddress
          ? `/api/v1/portfolio?address=${encodeURIComponent(fullAddress)}`
          : "/api/v1/portfolio";

        const res = await fetch(url, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok && isMounted) {
          const data = await res.json();
          const totalVal = Number(data.total_portfolio_usd || 0);
          const totalFormatted = "$" + totalVal.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });

          const pnlVal = Number(data.unrealized_pnl_usd || 0);
          const pnlFormatted =
            (pnlVal >= 0 ? "+ $" : "- $") +
            Math.abs(pnlVal).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });

          let topStr = "Top Allocation: None (0.0%)";
          if (data.balances && data.balances.length > 0) {
            const sorted = [...data.balances].sort(
              (a, b) => (b.value_usd || 0) - (a.value_usd || 0)
            );
            const top = sorted[0];
            topStr = `Top Allocation: ${top.asset} (${Number(top.current_allocation_pct || 100).toFixed(1)}%)`;
          } else if (isWalletConnected) {
            topStr = "Top Allocation: None (0.0%)";
          }

          setPortfolioData({
            totalUsd: totalFormatted,
            pnlUsd: pnlFormatted,
            topAllocation: topStr,
          });
        }
      } catch (err) {
        console.warn("Live portfolio fetch error:", err);
      }
    }

    fetchLivePortfolio();
    const interval = setInterval(fetchLivePortfolio, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isWalletConnected, fullAddress]);

  useEffect(() => {
    const handleOpen = () => setIsAnalysisModalOpen(true);
    window.addEventListener("open-portfolio-modal", handleOpen);
    return () => window.removeEventListener("open-portfolio-modal", handleOpen);
  }, []);

  const handleAskNetroAI = (prompt: string) => {
    window.dispatchEvent(new CustomEvent("netroai-send-prompt", { detail: { prompt } }));
  };

  return (
    <>
      <div className="w-full h-full bg-[#0A0A0A] rounded-xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-[#1E1E1E] flex flex-col justify-between overflow-hidden text-white">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-sans text-[20px] text-white font-semibold leading-none">
              Portfolio Insights
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="p-1 text-[#8D8A95] hover:text-[#F4D014] transition-colors cursor-pointer"
              title="Analyse Portfolio"
            >
              <PieChart size={16} />
            </button>
            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="p-1 text-[#8D8A95] hover:text-white transition-colors cursor-pointer"
              title="Expand Portfolio Analysis"
            >
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Main Stats Cards Grid */}
        <div className="grid grid-cols-2 gap-3 my-2">
          {/* Stat Box 1: Live Total Portfolio Value */}
          <div className="bg-[#141414] rounded-lg p-3 border border-[#222222] flex flex-col justify-between">
            <div className="text-[#8D8A95] font-sans text-[13px] whitespace-nowrap">
              <span>Portfolio Value</span>
            </div>
            <p className="font-sans text-[22px] font-medium text-white mt-2">
              {portfolioData.totalUsd}
            </p>
          </div>

          {/* Stat Box 2: Live Unrealized P/L */}
          <div className="bg-[#141414] rounded-lg p-3 border border-[#222222] flex flex-col justify-between">
            <div className="text-[#8D8A95] font-sans text-[13px] whitespace-nowrap">
              <span>Unrealized P/L</span>
            </div>
            <p className="font-sans text-[22px] font-medium text-white mt-2 text-emerald-400">
              {portfolioData.pnlUsd}
            </p>
          </div>
        </div>

        {/* Bottom Section: i7.png stretched across the card above the button */}
        <div className="flex flex-col gap-2 pt-1 mt-auto">
          {/* i7.png stretched from right to left */}
          <div className="w-full flex items-center justify-center select-none pointer-events-none overflow-hidden">
            <img
              src="/i7.png"
              alt="Wolf Characters Banner"
              className="w-full h-auto max-h-[60px] object-contain drop-shadow-sm hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          {/* Analyse Portfolio CTA Button */}
          <div className="w-full flex flex-col gap-1.5">
            <button
              onClick={() => setIsAnalysisModalOpen(true)}
              className="w-full bg-[#F4D014] hover:bg-[#e5c30f] text-[#1C1C1C] font-sans font-bold text-[13px] py-2 px-3 rounded-lg shadow-[0_4px_20px_rgba(244,208,20,0.25)] border border-yellow-400/40 cursor-pointer transition-all active:scale-95 flex items-center justify-center"
            >
              <span>Analyse Portfolio</span>
            </button>

            {isWalletConnected ? (
              <span className="w-full text-center text-[#8D8A95] font-sans font-medium text-[11.5px] truncate">
                {portfolioData.topAllocation}
              </span>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="w-full text-center text-gray-400 hover:text-[#F4D014] font-sans text-[11.5px] py-0.5 cursor-pointer transition-colors"
              >
                Connect Wallet for Live BSC Telemetry
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Analysis Intelligence Modal */}
      <PortfolioAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onAskNetroAI={handleAskNetroAI}
      />
    </>
  );
};
