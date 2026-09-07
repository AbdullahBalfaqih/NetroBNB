"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useBalance } from "wagmi";
import { formatUnits } from "viem";
import { bsc } from "@reown/appkit/networks";
import { useCrypto } from "@/context/CryptoContext";

export const CalendarCard: React.FC = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { data: balanceData, isLoading: isBalanceLoading, refetch: refetchBalance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: bsc.id,
  });

  const { liveMarket } = useCrypto();

  const [payAmount, setPayAmount] = useState("0.5");
  const [isSwapped, setIsSwapped] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Slippage & Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [slippage, setSlippage] = useState<number>(0.5);
  const [customSlippage, setCustomSlippage] = useState<string>("");
  const [deadlineMinutes, setDeadlineMinutes] = useState<number>(20);

  // Share Notification State
  const [shareToast, setShareToast] = useState(false);

  // Connect Warning Notification State
  const [connectWarning, setConnectWarning] = useState(false);

  // Synced Height to align with LeaveLeftCard on desktop
  const [syncedHeight, setSyncedHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const updateHeight = () => {
      if (typeof window === "undefined" || window.innerWidth < 1024) {
        setSyncedHeight(undefined);
        return;
      }
      const leaveLeftEl = document.getElementById("leave-left-card");
      const exchangeEl = document.getElementById("exchange-card-wrapper");
      if (leaveLeftEl && exchangeEl) {
        const leaveLeftRect = leaveLeftEl.getBoundingClientRect();
        const exchangeRect = exchangeEl.getBoundingClientRect();
        const exactHeight = Math.round(leaveLeftRect.bottom - exchangeRect.top);
        if (exactHeight > 300) {
          setSyncedHeight(exactHeight);
        }
      }
    };

    updateHeight();
    const timeout = setTimeout(updateHeight, 150);
    const ro = new ResizeObserver(updateHeight);
    const leaveLeftEl = document.getElementById("leave-left-card");
    if (leaveLeftEl) ro.observe(leaveLeftEl);
    window.addEventListener("resize", updateHeight);

    return () => {
      clearTimeout(timeout);
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  // Live Exchange Rates (Fallback to live context / Binance API)
  const [bnbPrice, setBnbPrice] = useState<number>(648.5);
  const [btcPrice, setBtcPrice] = useState<number>(77420.0);

  // Poll live spot prices for BNB & BTC
  useEffect(() => {
    let isMounted = true;
    const fetchLivePrices = async () => {
      try {
        const res = await fetch("/api/v1/prices").catch(() => null);
        if (res && res.ok && isMounted) {
          const data = await res.json();
          if (data.BNB && data.BNB > 0) setBnbPrice(data.BNB);
          if (data.BTC && data.BTC > 0) setBtcPrice(data.BTC);
        }
      } catch {
        // Retain fallback prices
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentPayToken = isSwapped ? "BTC" : "BNB";
  const currentReceiveToken = isSwapped ? "BNB" : "BTC";

  // Balance calculation
  const bnbBalance = balanceData
    ? parseFloat(formatUnits(balanceData.value, balanceData.decimals))
    : 0;
  // Simulated or token balance for BTC
  const btcBalance = isConnected ? 0.0450 : 0;
  const activeBalance = currentPayToken === "BNB" ? bnbBalance : btcBalance;

  const numPay = parseFloat(payAmount) || 0;
  const payPrice = currentPayToken === "BNB" ? bnbPrice : btcPrice;
  const receivePrice = currentReceiveToken === "BNB" ? bnbPrice : btcPrice;

  const payUsd = (numPay * payPrice).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Calculate receive amount with 0.1% liquidity provider fee
  const rawReceive = (numPay * payPrice * 0.999) / receivePrice;
  const numReceive = currentReceiveToken === "BTC"
    ? rawReceive.toFixed(6)
    : rawReceive.toFixed(4);

  const minReceived = (parseFloat(numReceive) * (1 - slippage / 100)).toFixed(
    currentReceiveToken === "BTC" ? 6 : 4
  );

  const receiveUsd = (parseFloat(numReceive) * receivePrice).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Handle Max Balance selection with Gas Reserve buffer for BNB
  const handleMaxAmount = () => {
    if (!isConnected) {
      open();
      return;
    }
    if (currentPayToken === "BNB") {
      // Reserve 0.005 BNB for network gas
      const safeMax = Math.max(0, bnbBalance - 0.005);
      setPayAmount(safeMax > 0 ? safeMax.toFixed(4) : "0");
    } else {
      setPayAmount(btcBalance.toFixed(6));
    }
  };

  const handleSwapDirection = () => {
    setIsSwapped((prev) => !prev);
  };

  const handleExecuteSwap = () => {
    if (!isConnected) {
      open();
      return;
    }

    if (numPay <= 0 || numPay > activeBalance) return;

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      const generatedHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")}`;
      setLastTxHash(generatedHash);
      setSwapSuccess(true);
      if (refetchBalance) refetchBalance();
      setTimeout(() => {
        setSwapSuccess(false);
      }, 5000);
    }, 1500);
  };

  const handleSwapClick = () => {
    if (!isConnected) {
      setConnectWarning(true);
      open();
      setTimeout(() => setConnectWarning(false), 4000);
      return;
    }
    handleExecuteSwap();
  };

  const handleShare = () => {
    const shareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/?swap=${currentPayToken}_${currentReceiveToken}&amount=${payAmount}`
      : "https://bscscan.com";
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }).catch(() => {
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    });
  };

  const isInsufficientBalance = isConnected && numPay > activeBalance;

  const renderCoinIcon = (token: "BNB" | "BTC") => {
    if (token === "BNB") {
      return (
        <svg className="w-8 h-8 shrink-0 select-none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
          <path
            fill="#FFF"
            d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z"
          />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 shrink-0 select-none" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="16" fill="#F7931A" />
        <path
          d="M22.5 13.7c.3-2.1-1.3-3.2-3.5-3.9l.7-2.9-1.8-.4-.7 2.8c-.5-.1-1-.2-1.5-.3l.7-2.8-1.8-.4-.7 2.9c-.4-.1-.8-.2-1.1-.3l-2.4-.6-.5 2s1.3.3 1.3.3c.7.2.9.7.8 1.1l-.8 3.3c.1 0 .1 0 .2.1l-.2-.1-1.2 4.7c-.1.2-.3.6-.9.4 0 0-1.3-.3-1.3-.3l-.9 2.1 2.3.6c.4.1.9.2 1.3.3l-.7 2.9 1.8.4.7-2.8c.5.1 1 .2 1.5.3l-.7 2.8 1.8.4.7-2.9c3.1.6 5.4.3 6.4-2.4.8-2.2 0-3.5-1.6-4.3 1.1-.3 2-1 2.2-2.4zm-4 5.3c-.6 2.3-4.5 1.1-5.8.7l1-4.2c1.3.3 5.3 1 4.8 3.5zm.6-5.4c-.5 2.1-3.8 1-4.9.7l1-3.8c1.1.3 4.4.8 3.9 3.1z"
          fill="#FFF"
        />
      </svg>
    );
  };

  return (
    <div id="exchange-card-wrapper" className="relative w-full select-none">
      {/* 3D Wolf Mascot - Resting paws on the top border */}
      <div className="absolute -top-[88px] left-1/2 -translate-x-1/2 w-[180px] h-[120px] pointer-events-none z-20 drop-shadow-2xl">
        <Image
          src="/images/wolf_mascot.png"
          alt="Wolf Mascot"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Main Exchange Card - Deep Black (#0A0A0A) */}
      <div
        style={syncedHeight ? { height: `${syncedHeight}px` } : undefined}
        className="w-full bg-[#0A0A0A] rounded-xl p-4.5 sm:p-5 border border-[#1E1E1E] shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between gap-3 text-white relative z-10"
      >

        {/* Share Toast Notification */}
        {shareToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-[#1E1E1E] text-[#F3BA2F] text-xs font-semibold px-3 py-1.5 rounded-full border border-[#F3BA2F]/30 shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Swap link copied to clipboard!</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between pt-0.5 pb-0">
          {/* Settings Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`text-[#A9A7B0] hover:text-white active:scale-90 transition-all cursor-pointer p-1 rounded-lg ${
              isSettingsOpen ? "text-[#F3BA2F] bg-white/5" : ""
            }`}
            title="Swap Settings"
          >
            <svg width="22" height="22" viewBox="0 0 42 42" fill="none">
              <path
                d="M18.6812 36.75V26.9062H21.3062V30.5375H36.75V33.1625H21.3062V36.75H18.6812ZM5.25 33.1625V30.5375H16.0562V33.1625H5.25ZM13.4312 25.9V22.3125H5.25V19.6875H13.4312V16.0125H16.0562V25.9H13.4312ZM18.6812 22.3125V19.6875H36.75V22.3125H18.6812ZM25.9437 15.0937V5.25H28.5687V8.8375H36.75V11.4625H28.5687V15.0937H25.9437ZM5.25 11.4625V8.8375H23.3187V11.4625H5.25Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white font-sans">
            Exchange
          </h2>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="text-[#A9A7B0] hover:text-white active:scale-90 transition-all cursor-pointer p-1 rounded-lg"
            title="Share Swap Details"
          >
            <svg width="22" height="22" viewBox="0 0 42 42" fill="none">
              <path
                d="M9.625 38.5C8.925 38.5 8.3125 38.2375 7.7875 37.7125C7.2625 37.1875 7 36.575 7 35.875V15.3562C7 14.6562 7.2625 14.0437 7.7875 13.5187C8.3125 12.9937 8.925 12.7312 9.625 12.7312H17.0187V15.3562H9.625V35.875H32.375V15.3562H24.8937V12.7312H32.375C33.075 12.7312 33.6875 12.9937 34.2125 13.5187C34.7375 14.0437 35 14.6562 35 15.3562V35.875C35 36.575 34.7375 37.1875 34.2125 37.7125C33.6875 38.2375 33.075 38.5 32.375 38.5H9.625ZM19.6437 26.8187V6.825L15.7937 10.675L13.9125 8.79375L20.9562 1.75L28 8.79375L26.1187 10.675L22.2687 6.825V26.8187H19.6437Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Settings Modal Dropdown */}
        {isSettingsOpen && (
          <div className="w-full bg-[#161616] border border-[#2D2D2D] rounded-xl p-3.5 flex flex-col gap-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-[#9E9BA6]">
              <span className="font-medium text-white">Slippage Tolerance</span>
              <span className="text-[#F3BA2F] font-semibold">{slippage}%</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[0.1, 0.5, 1.0].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setSlippage(val);
                    setCustomSlippage("");
                  }}
                  className={`py-1.5 text-xs rounded-lg font-medium transition-all ${
                    slippage === val && customSlippage === ""
                      ? "bg-[#F3BA2F] text-black font-bold"
                      : "bg-[#222222] text-[#A09DA8] hover:text-white"
                  }`}
                >
                  {val}%
                </button>
              ))}
              <div className="relative">
                <input
                  type="number"
                  placeholder="Custom"
                  value={customSlippage}
                  onChange={(e) => {
                    setCustomSlippage(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0 && val <= 50) {
                      setSlippage(val);
                    }
                  }}
                  className="w-full h-full py-1 px-2 text-center text-xs bg-[#222222] text-white rounded-lg border border-transparent focus:border-[#F3BA2F] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8D8A95] pt-1 border-t border-white/[0.05]">
              <span>Transaction Deadline</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={deadlineMinutes}
                  onChange={(e) => setDeadlineMinutes(Number(e.target.value) || 20)}
                  className="w-10 text-right bg-[#222222] text-white rounded px-1 text-xs focus:outline-none"
                />
                <span>mins</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8D8A95]">
              <span>Smart Routing</span>
              <span className="text-[#28C76F] font-medium">PancakeSwap AMM v3</span>
            </div>
          </div>
        )}

        {/* Cards Section - Linked ONLY around the center arrow */}
        <div className="w-full flex flex-col gap-3.5 relative">
          {/* Top Card: You pay */}
          <div className="w-full bg-[#141414] rounded-xl p-3.5 sm:p-4 border border-[#222222] flex flex-col gap-1.5 relative z-0">
            <div className="flex items-center justify-between text-xs text-[#8D8A95] px-0.5">
              <span>You pay</span>
              <div className="flex items-center gap-2">
                <span>~ ${payUsd}</span>
                {isConnected && (
                  <span className="flex items-center gap-1 text-[#F3BA2F]">
                    <span>Bal: {activeBalance.toFixed(4)}</span>
                    <button
                      type="button"
                      onClick={handleMaxAmount}
                      className="px-1.5 py-0.5 text-[10px] font-bold bg-[#F3BA2F]/15 hover:bg-[#F3BA2F]/25 text-[#F3BA2F] rounded cursor-pointer transition-colors"
                    >
                      MAX
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Left: Token Selector */}
              <div
                onClick={handleSwapDirection}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              >
                {renderCoinIcon(currentPayToken)}
                <span className="text-lg sm:text-xl font-semibold text-white">
                  {currentPayToken}
                </span>
                <div className="w-3 h-2 border-t-[6px] border-t-[#8A8792] border-x-[5px] border-x-transparent ml-0.5 mt-0.5" />
              </div>

              {/* Right: Amount Input */}
              <input
                type="number"
                step="any"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.0"
                className="w-32 sm:w-40 bg-transparent text-right text-lg sm:text-xl font-semibold text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Center Connection: Swap Direction Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
            <div className="w-12 h-10 bg-[#141414] flex items-center justify-center rounded-lg">
              <button
                type="button"
                onClick={handleSwapDirection}
                className="text-[#F3BA2F] hover:scale-110 active:scale-95 transition-all cursor-pointer p-1"
                title="Reverse Swap Direction"
              >
                <svg width="20" height="20" viewBox="0 0 66 66" fill="none">
                  <path
                    d="M22 55V11M33 23.375L22 11L11 23.375"
                    stroke="#F3BA2F"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M44 11V55M33 42.625L44 55L55 42.625"
                    stroke="#F3BA2F"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Card: You receive */}
          <div className="w-full bg-[#141414] rounded-xl p-3.5 sm:p-4 border border-[#222222] flex flex-col gap-1.5 relative z-0">
            <div className="flex items-center justify-between text-xs text-[#8D8A95] px-0.5">
              <span>You receive</span>
              <span className="flex items-center gap-1">
                ~ ${receiveUsd} <span className="text-[#28C76F]">(−0.1% LP)</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              {/* Left: Token Selector */}
              <div
                onClick={handleSwapDirection}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              >
                {renderCoinIcon(currentReceiveToken)}
                <span className="text-lg sm:text-xl font-semibold text-white">
                  {currentReceiveToken}
                </span>
                <div className="w-3 h-2 border-t-[6px] border-t-[#8A8792] border-x-[5px] border-x-transparent ml-0.5 mt-0.5" />
              </div>

              {/* Right: Amount Output */}
              <span className="text-lg sm:text-xl font-semibold text-white">
                {numReceive}
              </span>
            </div>
          </div>
        </div>


        {/* Swap Golden CTA Button */}
        {!isConnected ? (
          <button
            type="button"
            onClick={handleSwapClick}
            className="w-full h-12.5 sm:h-13 rounded-xl bg-[#F4D014] hover:bg-[#e5c30f] active:scale-[0.98] transition-all shadow-[0_4px_25px_rgba(244,208,20,0.25)] flex items-center justify-center text-[#1C1C1C] font-sans font-bold text-base sm:text-lg cursor-pointer mt-0.5"
          >
            {connectWarning ? "Connect Wallet First" : "Swap Asset"}
          </button>
        ) : isInsufficientBalance ? (
          <div
            className="w-full h-12.5 sm:h-13 flex items-center justify-center text-[#E05563] font-sans font-medium text-sm sm:text-base select-none mt-0.5"
          >
            Insufficient {currentPayToken} Balance
          </div>
        ) : (
          <button
            type="button"
            onClick={handleExecuteSwap}
            disabled={isSwapping}
            className={`w-full h-12.5 sm:h-13 rounded-xl transition-all font-sans font-bold text-base sm:text-lg cursor-pointer mt-0.5 ${
              swapSuccess
                ? "bg-gradient-to-b from-[#28C76F] to-[#1EA355] text-white shadow-[0_4px_30px_rgba(40,199,111,0.3)]"
                : "bg-[#F4D014] hover:bg-[#e5c30f] active:scale-[0.98] text-[#1C1C1C] shadow-[0_4px_25px_rgba(244,208,20,0.25)]"
            }`}
          >
            {isSwapping
              ? "Executing Swap on BSC..."
              : swapSuccess
              ? "Swap Executed! ✓"
              : "Swap Asset"}
          </button>
        )}

        {/* Transaction Success Alert & BscScan Link */}
        {swapSuccess && lastTxHash && (
          <div className="w-full bg-[#1E2E20] border border-[#28C76F]/40 rounded-xl p-3 flex items-center justify-between text-xs text-white animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#28C76F]" />
              <span>Confirmed on BNB Smart Chain</span>
            </div>
            <a
              href={`https://bscscan.com/tx/${lastTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#28C76F] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View BscScan</span>
              <span>↗</span>
            </a>
          </div>
        )}

        {/* Transaction Cost & Gas Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[#77747E] font-normal">
              Transaction cost
            </span>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white font-medium">→ $0.12</span>
              <span className="text-[#6F6C76]">0.00019 BNB</span>
              <a
                href="https://bscscan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#28C76F] hover:underline font-bold flex items-center gap-0.5"
              >
                <span>↗</span>
                <span className="text-[#6F6C76] hidden sm:inline">BSCScan</span>
              </a>
            </div>
          </div>

          {/* Gas Indicator */}
          <div className="flex items-center gap-1.5 text-white/80" title="BNB Chain Gas Price: 3.0 Gwei">
            <svg width="18" height="20" viewBox="0 0 44 48" fill="none" className="opacity-75">
              <path
                d="M35.4006 35.5195C35.4129 38.1273 35.2956 40.8439 35.2803 43.4607C35.2748 44.4034 35.0128 45.599 34.2791 46.2519C33.7816 46.6922 33.166 46.9771 32.5085 47.0716C31.4951 47.2237 29.6539 47.195 28.5837 47.2025L22.478 47.2457L11.7638 47.2568C9.70978 47.2559 7.68701 47.2753 5.62202 47.2122C3.78209 47.156 3.02252 46.5207 1.78758 45.2107C1.04284 44.4206 0.637882 43.6781 0.506126 42.5805C0.282541 40.7176 0.352859 38.6654 0.355467 36.7798L0.345117 28.3081L0.340311 16.1831C0.336318 13.7037 0.29851 11.2923 0.399221 8.79237C0.442081 6.21095 1.34881 4.72384 3.20414 3.00751C6.65211 -0.182001 10.3073 0.076377 14.6591 0.063014L21.01 0.0652955C23.4563 0.0735251 25.9969 0.0455773 28.4216 0.121355C30.5967 0.21294 32.5156 0.657911 33.9716 2.38956C34.6751 3.22613 34.8911 3.78142 34.9025 4.86219C34.9199 6.52433 35.0183 8.20921 35.016 9.86784C35.0144 10.965 35.1851 12.272 35.1088 13.329L35.1037 13.3934C35.1434 13.802 35.0764 13.7794 35.2964 14.0468C35.7093 14.157 35.8959 14.0795 36.2639 14.1629C44.1114 14.3355 43.9758 18.4923 43.9024 25.0078C43.8667 28.174 44.4118 31.9405 41.8919 34.3046C40.1956 35.896 37.5654 35.5559 35.4006 35.5195ZM35.0314 27.1014C35.0312 28.9508 35.0012 30.3027 35.1549 32.16C36.0901 32.1152 36.9996 31.9686 37.9161 31.873C39.9218 31.6639 40.39 31.0617 40.431 29.1377C40.3593 27.0333 40.4837 24.8617 40.4341 22.7588C40.4136 21.8899 40.579 19.2623 39.9401 18.7333C39.0997 18.0373 36.3792 18.122 35.2682 18.1472C34.9728 20.7561 35.177 24.2937 35.0314 27.1014ZM3.58531 38.9752C3.59036 39.661 3.59468 40.4017 3.60511 41.0841C3.63542 43.0672 3.71047 43.6648 5.83778 43.8432C8.0364 44.0274 10.201 43.9905 12.397 43.9986L24.4869 44.0171C26.0543 44.0178 28.237 43.9221 29.7326 43.9925C29.8911 43.956 31.2364 43.8641 31.5032 43.8385C31.7152 41.488 31.4512 38.5728 31.4581 36.1861C31.2837 34.3637 31.3711 31.2152 31.374 29.2894C31.3854 25.7334 31.3593 22.1774 31.2959 18.6221C30.4667 18.5712 28.9183 18.7533 28.2609 18.3435C28.0704 18.2248 28.0629 17.8781 28.0259 17.6477C28.018 17.1001 27.918 16.7272 27.7994 16.1952C25.7601 16.2005 23.7194 16.1722 21.6805 16.1979C19.9334 16.2199 18.0676 16.3799 16.3293 16.2514C16.0035 15.147 16.0114 13.857 15.9988 12.7107C16.6684 12.6869 17.2915 12.7062 17.9596 12.7254C19.7732 12.7175 21.5869 12.7316 23.4001 12.7678C24.1044 12.7813 25.3527 12.7714 26.001 12.8646C27.7323 12.8522 29.526 13.0111 31.272 13.0369C31.2936 11.4335 31.2956 8.3157 31.1343 6.8043C30.8421 5.89171 29.8979 4.53879 28.9971 4.12234C28.3236 3.81092 24.7749 4.06229 23.9126 4.07671C20.8099 4.12878 17.6876 4.10164 14.5851 4.04705C12.8907 4.01723 11.1826 3.92361 9.48905 3.95327C8.90076 3.96353 8.08064 3.93615 7.53863 4.17392C6.10235 4.80385 4.7487 6.4633 4.20644 7.91425C3.39831 10.0764 3.71674 16.2929 3.66581 18.8579C3.63012 23.0485 3.61766 27.2391 3.62842 31.4297C3.63428 33.4027 3.73817 37.0642 3.58531 38.9752Z"
                fill="#8D898E"
              />
            </svg>
            <span className="text-white text-xs font-semibold">3.0</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export const ExchangeCard = CalendarCard;
