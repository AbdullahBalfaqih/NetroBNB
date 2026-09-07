"use client";

import React, { useState, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState<"Chart" | "Reports" | "Table">("Chart");
  const [searchQuery, setSearchQuery] = useState("");
  const [portfolio, setPortfolio] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("weekly");

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
  const displayNetWorth = totalNetWorth > 0
    ? `$${totalNetWorth.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "$0.00";

  const formattedAddr = fullAddress
    ? `${fullAddress.slice(0, 6)}...${fullAddress.slice(-4)}`
    : "No wallet connected";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1680px] rounded-[24px] overflow-hidden shadow-2xl border border-gray-400/40 my-auto"
        style={{
          background: "linear-gradient(120deg, #DADCDC 0%, #CFD2D2 100%), #FFF",
          fontFamily: "'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 sm:p-5 flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch">
          {/* ================= LEFT ASIDE (405px) ================= */}
          <aside className="w-full lg:w-[390px] xl:w-[405px] flex flex-col gap-2.5 shrink-0">
            {/* Card 1: Portfolio Insights & Search Asset */}
            <div className="rounded-[12px] bg-[#000] p-6 sm:p-7 flex flex-col justify-between text-white min-h-[170px]">
              <div>
                <h1 className="text-[28px] sm:text-[34px] font-normal leading-tight text-white tracking-tight">
                  Portfolio Insights
                </h1>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#BBB] mt-6">
                <input
                  type="text"
                  placeholder="Search Asset"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[#777] placeholder:text-[#777] text-[16px] w-full font-normal"
                />
                <div className="w-[18px] h-[18px] relative shrink-0 opacity-75">
                  <div className="w-3 h-3 rounded-full border border-[#777]" />
                  <div className="w-[6px] h-[2px] bg-[#777] absolute -bottom-0.5 -right-0.5 rotate-45" />
                </div>
              </div>
            </div>

            {/* Card 2: Asset (Holdings list) */}
            <div className="rounded-[12px] bg-[#0B0B0B] p-6 sm:p-7 flex flex-col gap-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#777] text-[13px]">▼</span>
                  <span className="text-white text-[17px] font-medium">Asset</span>
                </div>
                <span className="text-white text-[20px] font-medium">
                  {portfolio?.balances?.length || 2}
                </span>
              </div>

              {/* Asset 1: Real Native BNB Vault */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-[#777] text-[12px]">▶</span>
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/a980541b8ea56fc33fc03f4417b24fb5a47f1296?width=94"
                  alt="BNB Native Vault"
                  className="w-[47px] h-[47px] rounded-[12px] object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-white text-[16px] font-medium leading-tight">
                    {isWalletConnected ? "BNB Smart Chain Vault" : "Forest Lake Centre"}
                  </span>
                  <span className="text-[#777] text-[13px] font-normal leading-tight mt-0.5">
                    {isWalletConnected
                      ? `${bnbBal.toFixed(4)} BNB • Native Gas Asset`
                      : "141X 3P | BPK OOC | S7K Leased"}
                  </span>
                </div>
              </div>

              {/* Asset 2: Clayton Plaza / BEP-20 */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[#777] text-[12px]">▶</span>
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/23759f0bd16f427fe6a1f15fc7fd795f9f63fd97?width=94"
                  alt="Clayton Plaza"
                  className="w-[47px] h-[47px] rounded-[12px] object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-white text-[16px] font-medium leading-tight">
                    Clayton Plaza
                  </span>
                  <span className="text-[#777] text-[13px] font-normal leading-tight mt-0.5">
                    {isWalletConnected
                      ? `Verified BEP-20 • Chain ID: 56`
                      : "225X 5P | 8TK OOC | B7K Leased"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Vaults & Tasks (12 items) */}
            <div className="rounded-[12px] bg-[#0B0B0B] p-6 sm:p-7 flex flex-col gap-3 text-white flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#777] text-[13px]">▼</span>
                  <span className="text-white text-[20px] font-medium">Vaults</span>
                </div>
                <span className="text-white text-[20px] font-medium">12</span>
              </div>

              {/* Vault items */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-[#777] text-[12px]">▶</span>
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/cccb7a8f23ab10c75ed47dbe746c892803d8aa01?width=94"
                  alt="Forest Lake"
                  className="w-[47px] h-[47px] rounded-[12px] object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-white text-[16px] font-medium leading-tight">
                    Forest Lake Centre
                  </span>
                  <span className="text-[#777] text-[13px] leading-tight mt-0.5">
                    147X SF | 89% OOC | S7K Leased
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-[#777] text-[12px]">▶</span>
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/b8066326a5ce04c3bbe1edb5c2929855e63cc96b?width=94"
                  alt="Clayton Plaza"
                  className="w-[47px] h-[47px] rounded-[12px] object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-white text-[16px] font-medium leading-tight">
                    Clayton Plaza
                  </span>
                  <span className="text-[#777] text-[13px] leading-tight mt-0.5">
                    2255 SF | 61% OOC | 57K Leased
                  </span>
                </div>
              </div>

              {/* Sub items: Folder, Task Templates, Casa Analytics */}
              <div className="flex items-center gap-3 py-1.5 pl-4">
                <div className="w-[17px] h-[12px] rounded-[2px] bg-[#AAA] shrink-0" />
                <span className="text-[#777] text-[15px]">Folder</span>
              </div>

              <div className="flex items-center gap-3 py-1.5 pl-4">
                <div className="w-[16px] h-[17px] rounded-[3px] bg-[#999] flex items-center justify-center text-[9px] text-[#EEE] shrink-0">
                  ▦
                </div>
                <span className="text-[#777] text-[15px]">Task Templates</span>
              </div>

              <div className="flex items-center gap-3 py-1.5 pl-4">
                <span className="text-[#111] text-[16px] shrink-0 bg-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                  ♟
                </span>
                <span className="text-[#6D6E6E] text-[15px] font-medium">Casa Analytics</span>
              </div>

              <div className="flex items-center gap-3 py-1.5 pl-4">
                <span className="text-[#777] text-[16px] shrink-0">♟</span>
                <span className="text-[#777] text-[15px]">Adiers</span>
              </div>

              {/* Maplewood Plaza */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[#777] text-[12px]">▶</span>
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/15ee1d6e1fd92013a5aa6f220a9f18524f16eb2c?width=94"
                  alt="Maplewood Plaza"
                  className="w-[47px] h-[47px] rounded-[12px] object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-white text-[16px] font-medium leading-tight">
                    Maplewood Plaza
                  </span>
                  <span className="text-[#777] text-[13px] leading-tight mt-0.5">
                    5325 SF | T9S OOC | B9% Leased
                  </span>
                </div>
              </div>

              {/* Ualtrdge Business Park */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[#777] text-[12px]">▶</span>
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/296a3115663ec028acaa6d23f704fd13dacead2b?width=94"
                  alt="Ualtrdge"
                  className="w-[47px] h-[47px] rounded-[12px] object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-white text-[16px] font-medium leading-tight">
                    Ualtrdge Business Park
                  </span>
                  <span className="text-[#777] text-[13px] leading-tight mt-0.5">
                    376N SF | 89S OOC | B1% Leased
                  </span>
                </div>
              </div>

              {/* Birchwood Estate */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[#777] text-[12px]">▶</span>
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/6bd9273453cf85cd0751da917121c105614dabe9?width=94"
                  alt="Birchwood Estate"
                  className="w-[47px] h-[47px] rounded-[12px] object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-white text-[16px] font-medium leading-tight">
                    Birchwood Estate
                  </span>
                  <span className="text-[#777] text-[13px] leading-tight mt-0.5">
                    376N SF | 695 OOC | 99% Leased
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* ================= RIGHT MAIN (FLEX-1) ================= */}
          <main className="flex-1 flex flex-col gap-2.5 min-w-0">
            {/* 1. TOP YELLOW HERO SECTION (#FFD920) */}
            <div className="relative rounded-[12px] bg-[#FFD920] p-6 sm:p-9 overflow-hidden flex flex-col justify-between min-h-[380px]">
              {/* Top Controls / Close */}
              <div className="absolute top-6 right-6 flex items-center gap-3 z-20 text-[#171717]">
                <button
                  onClick={onClose}
                  className="text-[28px] leading-none hover:opacity-75 transition-opacity cursor-pointer"
                  title="Close"
                >
                  ×
                </button>
                <span className="text-[19px] cursor-pointer hover:opacity-75">◒</span>
                <span className="text-[20px] cursor-pointer hover:opacity-75">➜</span>
                <span className="text-[24px] cursor-pointer hover:opacity-75 leading-none">⋮</span>
              </div>

              {/* Hero Title & Subtitle */}
              <div className="max-w-[720px] z-10">
                <h2 className="text-[44px] sm:text-[62px] md:text-[66px] font-light text-[#171717] leading-[1.05] tracking-[-2.5px]">
                  NetroBNB History
                </h2>
                <p className="text-[#171717] text-[14px] leading-relaxed mt-2 font-normal">
                  2556 SP 1225 Avol, St. Carlex, TS6&apos;022 &bull; 1-320-CDT1 Teriting Info›
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-[#171717]/90 font-medium">
                  <span className="bg-black/15 px-2.5 py-0.5 rounded-full">
                    BSC Mainnet &bull; Chain ID: 56
                  </span>
                  <span className="bg-black/15 px-2.5 py-0.5 rounded-full font-mono">
                    {formattedAddr}
                  </span>
                </div>
              </div>

              {/* Rotated 3D Artwork Image exactly from Figma */}
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/09c4d3814be6295118a9973bdf3095448d0b63b2?width=636"
                alt="Clayton Plaza Architecture"
                className="absolute right-[-40px] sm:right-0 top-[-20px] sm:top-[-40px] w-[320px] sm:w-[420px] md:w-[480px] h-auto object-contain pointer-events-none select-none z-0 opacity-95"
              />

              {/* Latest Transactions Avatars Row */}
              <div className="mt-8 z-10 flex flex-col gap-2">
                <span className="text-[#171717] text-[14px] font-normal">
                  Latest Transactions
                </span>
                <div className="flex items-center gap-4">
                  <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/d5ac2d16b667ee8a3a376326c6ac4e226ec81b54?width=280"
                    alt="Transaction parties"
                    className="h-[52px] w-auto object-contain rounded-[8px]"
                  />
                  <button
                    onClick={() => {
                      if (onAskNetroAI) {
                        onClose();
                        onAskNetroAI("Show all latest transactions and audit on-chain history for my wallet.");
                      }
                    }}
                    className="text-[#171717] text-[14px] font-medium hover:underline cursor-pointer"
                  >
                    See All
                  </button>
                </div>
              </div>
            </div>

            {/* 2. MIDDLE STATS SECTION (rgba(250, 250, 250, 0.95)) */}
            <div className="rounded-[12px] bg-[#FAFAFAF0] p-6 sm:p-8 flex flex-col xl:flex-row items-stretch justify-between gap-6 border border-white/60 shadow-sm">
              {/* Left Occupancy / Net Worth Index */}
              <div className="flex-1 flex flex-col justify-between min-w-[280px]">
                <h3 className="text-[#171717] text-[21px] font-normal">
                  Occupancy Index
                </h3>

                <div className="my-3 text-center">
                  <span className="text-[#888] text-[16px] block">Iniov</span>
                  <span className="text-[#111] text-[58px] sm:text-[67px] font-light leading-none">
                    132
                  </span>
                </div>

                {/* Horizontal Gradient Comparison Bars matching Figma */}
                <div className="flex items-center justify-center gap-8 py-3 border-b border-[#AAA]">
                  <div
                    className="w-[105px] h-[39px] flex items-end justify-center pb-1.5"
                    style={{
                      background: "linear-gradient(0deg, #EEE 0%, rgba(238, 238, 238, 0.00) 100%)",
                    }}
                  >
                    <span className="text-[#171717] text-[16px] font-normal">-2.6%</span>
                  </div>

                  <div
                    className="w-[105px] h-[64px] flex items-end justify-center pb-1.5"
                    style={{
                      background: "linear-gradient(0deg, #EC1313 0%, #F6D4C9 100%)",
                    }}
                  >
                    <span className="text-[#171717] text-[16px] font-normal">-7.3%</span>
                  </div>
                </div>

                {/* MoM & YoY Changes */}
                <div className="flex items-center justify-around pt-3 text-center">
                  <div>
                    <span className="text-[#777] text-[15px] block">MoM Change</span>
                    <span className="text-[#229776] text-[18px] font-medium block mt-0.5">
                      +7.3 ⌃
                    </span>
                    <span className="text-[#777] text-[14px]">⌄</span>
                  </div>
                  <div>
                    <span className="text-[#777] text-[15px] block">YoY Change</span>
                    <span className="text-[#777] text-[18px] font-medium block mt-0.5">
                      --
                    </span>
                    <span className="text-[#777] text-[14px]">⌄</span>
                  </div>
                </div>
              </div>

              {/* Divider on XL */}
              <div className="hidden xl:block w-[1px] bg-gray-200 self-stretch" />

              {/* Right Sub-metrics: Residential Rental Units & Commercial Rental Space */}
              <div className="flex-1 flex flex-col justify-between gap-6">
                <div>
                  <h3 className="text-[#171717] text-[20px] font-normal">
                    Residential Rental Units
                  </h3>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-[#171717] text-[56px] sm:text-[66px] font-light leading-none">
                      56
                    </span>
                    <span className="text-[#229776] text-[17px] font-light">
                      +12.2 ◆
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-[#171717] text-[20px] font-normal">
                    Commeial Rental Space
                  </h3>
                  <div className="flex items-baseline gap-3 mt-2">
                    <span className="text-[#171717] text-[56px] sm:text-[66px] font-light leading-none">
                      44
                    </span>
                    <span className="text-[#FF0E0E] text-[17px] font-light">
                      -2.6 ◆
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. BOTTOM YELLOW PROPERTY REVENUE SECTION (#FFD920) */}
            <div className="rounded-[12px] bg-[#FFD920] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
              {/* Header with Tabs & Filter */}
              <div className="flex flex-wrap items-center justify-between gap-4 z-10">
                <h3 className="text-[#171717] text-[21px] font-normal">
                  Property revenue
                </h3>

                {/* Tabs: Chart | Reports | Table */}
                <div className="flex items-center gap-8 sm:gap-12">
                  {(["Chart", "Reports", "Table"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-[16px] transition-colors cursor-pointer ${
                        activeTab === tab
                          ? "text-[#111] font-bold border-b-2 border-[#111] pb-0.5"
                          : "text-[#777] font-normal hover:text-[#111]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Filtered by 2025-2026 */}
                <div className="flex items-center gap-1.5 text-[15px] text-[#111]">
                  <span className="font-normal text-[#777]">Filtered by</span>
                  <span className="font-semibold">2025-2026</span>
                  <span className="text-[12px]">▼</span>
                </div>
              </div>

              {/* SVG Wave Line Chart & Gradient Histogram Bars matching Figma 1:1 */}
              <div className="relative w-full my-6 pt-4">
                {/* Green Highlight Badge with Live Net Worth (like $1.5 m in Figma) */}
                <div className="flex justify-center sm:justify-end pr-8 sm:pr-24 mb-1">
                  <div className="bg-[#39A47E] text-white text-[15px] font-medium px-4 py-1.5 rounded-[3px] shadow-sm">
                    {displayNetWorth}
                  </div>
                </div>

                {/* SVG Curve Line */}
                <div className="relative w-full h-[120px] overflow-hidden">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 760 120"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 100L55 45L112 65L220 25L280 50L386 85L445 28L500 76L560 100L670 44V120"
                      stroke="#269B79"
                      strokeWidth="2.5"
                    />
                    <circle cx="55" cy="45" r="5" fill="#269B79" stroke="#111" strokeWidth="2" />
                    <circle cx="112" cy="65" r="5" fill="#269B79" stroke="#111" strokeWidth="2" />
                    <circle cx="220" cy="25" r="5" fill="#269B79" stroke="#111" strokeWidth="2" />
                    <circle cx="386" cy="85" r="5" fill="#269B79" stroke="#111" strokeWidth="2" />
                    <circle cx="445" cy="28" r="5" fill="#269B79" stroke="#111" strokeWidth="2" />
                    <circle cx="560" cy="100" r="5" fill="#269B79" stroke="#111" strokeWidth="2" />
                    <circle cx="670" cy="44" r="5" fill="#269B79" stroke="#111" strokeWidth="2" />
                  </svg>
                </div>

                {/* Histogram Bars underneath the wave */}
                <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-[50px] opacity-20 mt-1">
                  {[55, 55, 85, 55, 55, 85, 55, 55, 85, 55, 55, 85].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="bg-[#000] rounded-t-sm w-full"
                    />
                  ))}
                </div>
              </div>

              {/* Timeline Months exactly from Figma */}
              <div className="flex items-center justify-between text-[14px] text-[#666] pt-2 overflow-x-auto no-scrollbar font-normal">
                <span>Jan 23</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Cet</span>
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan 24</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
