"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  X,
  Check,
  Coins,
  Clock,
  Gauge,
  Boxes,
} from "lucide-react";
import { CryptoTickerCard } from "./CryptoTickerCard";
import { useCrypto, CryptoConfig, ALL_CRYPTO_CATALOG } from "@/context/CryptoContext";

// Official High-Precision Vector Icons
const renderOfficialCoinIcon = (symbol: string) => {
  switch (symbol.toUpperCase()) {
    case "BTC":
      return (
        <svg className="w-8 h-8 shrink-0 select-none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            d="M22.5 13.7c.3-2.1-1.3-3.2-3.5-3.9l.7-2.9-1.8-.4-.7 2.8c-.5-.1-1-.2-1.5-.3l.7-2.8-1.8-.4-.7 2.9c-.4-.1-.8-.2-1.1-.3l-2.4-.6-.5 2s1.3.3 1.3.3c.7.2.9.7.8 1.1l-.8 3.3c.1 0 .1 0 .2.1l-.2-.1-1.2 4.7c-.1.2-.3.6-.9.4 0 0-1.3-.3-1.3-.3l-.9 2.1 2.3.6c.4.1.9.2 1.3.3l-.7 2.9 1.8.4.7-2.8c.5.1 1 .2 1.5.3l-.7 2.8 1.8.4.7-2.9c3.1.6 5.4.3 6.4-2.4.8-2.2 0-3.5-1.6-4.3 1.1-.3 2-1 2.2-2.4zm-4 5.3c-.6 2.3-4.5 1.1-5.8.7l1-4.2c1.3.3 5.3 1 4.8 3.5zm.6-5.4c-.5 2.1-3.8 1-4.9.7l1-3.8c1.1.3 4.4.8 3.9 3.1z"
            fill="#FFF"
          />
        </svg>
      );
    case "ETH":
      return (
        <svg className="w-8 h-8 shrink-0 select-none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <path d="M16 4l-.2.8v15l.2.2 7-4.1L16 4z" fill="#FFF" fillOpacity="0.6" />
          <path d="M16 4L9 15.9l7 4.1V4z" fill="#FFF" />
          <path d="M16 21.2l-.1.1v6.5l.1.3 7-9.8-7 2.9z" fill="#FFF" fillOpacity="0.6" />
          <path d="M16 28.1v-6.9L9 18.3l7 9.8z" fill="#FFF" />
          <path d="M16 20l7-4.1-7-3.2v7.3z" fill="#FFF" fillOpacity="0.2" />
          <path d="M9 15.9l7 4.1v-7.3L9 15.9z" fill="#FFF" fillOpacity="0.6" />
        </svg>
      );
    case "SOL":
      return (
        <svg className="w-8 h-8 shrink-0 select-none" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00FFA3" />
              <stop offset="100%" stopColor="#DC1FFF" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="16" fill="#000000" />
          <g transform="translate(6.5, 8.5) scale(0.62)">
            <path
              d="M4.6 23.3c.3-.3.7-.5 1.1-.5h22.8c.8 0 1.2 1 .7 1.5l-4.1 4.1c-.3.3-.7.5-1.1.5H1.2c-.8 0-1.2-1-.7-1.5l4.1-4.1z"
              fill="url(#solGrad)"
            />
            <path
              d="M4.6 1.4c.3-.3.7-.5 1.1-.5h22.8c.8 0 1.2 1 .7 1.5l-4.1 4.1c-.3.3-.7.5-1.1.5H1.2c-.8 0-1.2-1-.7-1.5L4.6 1.4z"
              fill="url(#solGrad)"
            />
            <path
              d="M26.2 12.3c-.3-.3-.7-.5-1.1-.5H2.3c-.8 0-1.2 1-.7 1.5l4.1 4.1c.3.3.7.5 1.1.5h22.8c.8 0 1.2-1 .7-1.5l-4.1-4.1z"
              fill="url(#solGrad)"
            />
          </g>
        </svg>
      );
    case "AVAX":
      return (
        <svg className="w-8 h-8 shrink-0 select-none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#E84142" />
          <path
            d="M17.5 7.8c-.7-1.1-2.3-1.1-3 0L7.1 20.3c-.7 1.2.1 2.7 1.5 2.7h3.6c.8 0 1.5-.4 1.9-1.1l4.9-8.5 1.8 3.1-2.2 3.8c-.4.7-.4 1.5 0 2.2.4.7 1.1 1.1 1.9 1.1h4.4c1.4 0 2.2-1.5 1.5-2.7L17.5 7.8z"
            fill="#FFF"
          />
        </svg>
      );
    case "TON":
      return (
        <svg className="w-8 h-8 shrink-0 select-none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#0088CC" />
          <path
            d="M8.5 10.5l7.5-3.5 7.5 3.5v7l-7.5 6.5-7.5-6.5v-7zm2.5 2.2l5 4.5 5-4.5-5-2.3-5 2.3z"
            fill="#FFF"
          />
        </svg>
      );
    case "BNB":
      return (
        <svg className="w-8 h-8 shrink-0 select-none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
          <path
            fill="#FFF"
            d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z"
          />
        </svg>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-white/20 select-none shadow-xs">
          {symbol.slice(0, 3)}
        </div>
      );
  }
};

export const CryptoMarketCard: React.FC = () => {
  const {
    selectedCoin,
    setSelectedCoin,
    setSelectedCoinBySymbol,
    pinnedSymbols,
    allCoins,
    liveMarket,
    fetchLiveMarket,
  } = useCrypto();

  // Search dialog state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const tvContainerRef = useRef<HTMLDivElement | null>(null);

  // Filter full catalog based on search query
  const filteredCoins = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCoins;
    return allCoins.filter(
      (c) =>
        c.symbol.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [allCoins, searchQuery]);

  // Handle selecting any coin from the search list
  const handleSelectCoin = (coin: CryptoConfig) => {
    setSelectedCoin(coin);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // TradingView Embed Loader (Always Active - Sole Charting Engine)
  useEffect(() => {
    if (tvContainerRef.current) {
      tvContainerRef.current.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: selectedCoin.tradingViewSymbol,
        interval: "15",
        timezone: "Etc/UTC",
        theme: "light",
        style: "1",
        locale: "en",
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_legend: false,
        save_image: false,
        calendar: false,
        hide_volume: false,
        support_host: "https://www.tradingview.com",
      });
      tvContainerRef.current.appendChild(script);
    }
  }, [selectedCoin.tradingViewSymbol]);

  const handleManualRefresh = async () => {
    setIsFetching(true);
    await fetchLiveMarket(selectedCoin.symbol);
    setTimeout(() => setIsFetching(false), 500);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-figma-md border-0 flex flex-col justify-between overflow-hidden select-none transition-all relative">
      {/* Top Pure Black Header Strip (No right or outer borders) */}
      <div className="bg-[#0A0A0A] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-[#FFFFFF] border-0">
        {/* Left: Official Coin Icon, Name & Symbol + Coin Switcher & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            {renderOfficialCoinIcon(selectedCoin.symbol)}
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-sans text-[18px] font-bold text-[#FFFFFF] leading-none">
                  {selectedCoin.name}
                </h3>
                <span className="font-sans text-[12.5px] font-semibold text-white/70 uppercase">
                  {selectedCoin.symbol}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Coin Switcher Tabs (No shape or border) */}
          <div className="flex items-center gap-1.5 ml-2">
            {pinnedSymbols.map((sym) => {
              const isActive = selectedCoin.symbol === sym;
              return (
                <button
                  key={sym}
                  onClick={() => setSelectedCoinBySymbol(sym)}
                  className={`px-1.5 py-1 text-xs transition-all cursor-pointer outline-none focus:outline-none focus-visible:outline-none border-0 ring-0 focus:ring-0 ${
                    isActive
                      ? "text-[#FFFFFF] font-bold"
                      : "text-white/70 hover:text-[#FFFFFF] font-medium"
                  }`}
                >
                  {sym}
                </button>
              );
            })}
          </div>

          {/* Live Search Trigger Button for All Cryptocurrencies (No shape or border) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-1.5 px-1.5 py-1 text-xs font-medium text-white/80 hover:text-[#FFFFFF] transition-colors cursor-pointer ml-1 outline-none focus:outline-none focus-visible:outline-none border-0"
            title="Search across all cryptocurrencies"
          >
            <Search size={13} className="text-[#FFFFFF]" />
            <span>All Coins...</span>
          </button>
        </div>

        {/* Right: Live Refresh Button (No shape or border) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            className="p-1.5 text-white/75 hover:text-[#FFFFFF] transition-colors cursor-pointer outline-none focus:outline-none border-0"
            title="Refresh Live Market Data"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin text-white" : ""} />
          </button>
        </div>
      </div>

      {/* Card White Body */}
      <div className="p-5 flex flex-col justify-between flex-1">
        {/* Main Info Bar: 100% Synced Live Price, Percentage & High/Low */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          {/* Live Market Price & Change (Always Synced with TradingView & Binance) */}
          <div className="flex items-baseline gap-2.5">
            <span
              className={`font-sans text-[30px] font-bold tracking-tight leading-none transition-colors duration-300 ${
                liveMarket.lastTickDirection === "up"
                  ? "text-emerald-600"
                  : liveMarket.lastTickDirection === "down"
                  ? "text-red-600"
                  : "text-[#121214]"
              }`}
            >
              {liveMarket.price >= 1000
                ? `$${liveMarket.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : liveMarket.price < 1
                ? `$${liveMarket.price.toFixed(6)}`
                : `$${liveMarket.price.toFixed(2)}`}
            </span>

            <span
              className={`font-sans text-[15px] font-semibold flex items-center gap-0.5 ${
                liveMarket.isPositive ? "text-[#06C167]" : "text-[#F63649]"
              }`}
            >
              {liveMarket.isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {liveMarket.priceChange}
            </span>
          </div>

          {/* 24h Low & High Indicators (Live Synced) */}
          <div className="flex items-center gap-4 text-xs font-sans">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F63649]"></span>
              <span className="text-gray-400 font-medium">Low:</span>
              <span className="font-semibold text-[#1C1C1C]">{liveMarket.low24h}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#06C167]"></span>
              <span className="text-gray-400 font-medium">High:</span>
              <span className="font-semibold text-[#1C1C1C]">{liveMarket.high24h}</span>
            </div>
          </div>
        </div>

        {/* Real TradingView Live Market Terminal (Direct Binance Feed) - Completely Borderless */}
        <div className="relative w-full h-[330px] rounded-xl overflow-hidden my-2">
          {/* NetroBNB Brand Watermark (Placed Exactly at Dead Center) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none z-10 flex items-center justify-center">
            <div className="flex items-center gap-3.5 opacity-[0.11] whitespace-nowrap">
              <img
                src="/logo.png"
                alt="NetroBNB Watermark"
                className="h-16 w-auto object-contain shrink-0"
              />
              <span className="text-[44px] font-black tracking-tight text-[#1C1C1C] font-sans whitespace-nowrap select-none">
                NetroBNB
              </span>
            </div>
          </div>

          <div ref={tvContainerRef} className="tradingview-widget-container h-full w-full relative z-0" />
        </div>

        {/* Bottom Row: Price Statistics */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 w-full">
            {/* Stat 1: Market Cap */}
            <div className="flex items-center gap-2.5">
              <Coins
                size={26}
                className="text-[#1C1C1C] shrink-0"
                strokeWidth={1.7}
              />
              <div className="flex flex-col justify-center">
                <span className="font-sans text-xs text-gray-500 font-medium leading-tight">
                  Market Cap
                </span>
                <span className="font-sans text-[16px] font-bold text-[#1C1C1C] mt-0.5 tracking-tight leading-tight">
                  ${selectedCoin.marketCapEst}
                </span>
              </div>
            </div>

            {/* Stat 2: 24h Volume */}
            <div className="flex items-center gap-2.5">
              <Clock
                size={26}
                className="text-[#1C1C1C] shrink-0"
                strokeWidth={1.7}
              />
              <div className="flex flex-col justify-center">
                <span className="font-sans text-xs text-gray-500 font-medium leading-tight">
                  24H Volume
                </span>
                <span className="font-sans text-[16px] font-bold text-[#1C1C1C] mt-0.5 tracking-tight leading-tight">
                  {liveMarket.volume24h}
                </span>
              </div>
            </div>

            {/* Stat 3: All-Time High */}
            <div className="flex items-center gap-2.5">
              <Gauge
                size={26}
                className="text-[#1C1C1C] shrink-0"
                strokeWidth={1.7}
              />
              <div className="flex flex-col justify-center">
                <span className="font-sans text-xs text-gray-500 font-medium leading-tight">
                  All-Time High
                </span>
                <span className="font-sans text-[16px] font-bold text-[#1C1C1C] mt-0.5 tracking-tight leading-tight">
                  {selectedCoin.allTimeHigh}
                </span>
              </div>
            </div>

            {/* Stat 4: Circulating Supply (Flush to the end on the right) */}
            <div className="flex items-center gap-2.5">
              <Boxes
                size={26}
                className="text-[#1C1C1C] shrink-0"
                strokeWidth={1.7}
              />
              <div className="flex flex-col justify-center">
                <span className="font-sans text-xs text-gray-500 font-medium leading-tight">
                  Circulating Supply
                </span>
                <span className="font-sans text-[16px] font-bold text-[#1C1C1C] mt-0.5 tracking-tight leading-tight">
                  {selectedCoin.circulatingSupply} {selectedCoin.symbol}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Seamless Black Crypto Coins Ticker Strip */}
      <CryptoTickerCard flush={true} />

      {/* Global Cryptocurrency Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 border-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header - NO BORDERS */}
            <div className="bg-[#1C1C1C] px-6 py-4 text-white flex items-center justify-between border-0">
              <div className="flex items-center gap-2.5">
                <Search size={18} className="text-[#F4D014]" />
                <h3 className="font-bold text-[16px]">
                  All Binance Cryptocurrencies ({allCoins.length})
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer border-0"
              >
                <X size={15} />
              </button>
            </div>

            {/* Search Input Box */}
            <div className="p-4 bg-[#F5F6F8] border-0">
              <div className="relative">
                <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (filteredCoins.length > 0) {
                        handleSelectCoin(filteredCoins[0]);
                      } else if (searchQuery.trim()) {
                        setSelectedCoinBySymbol(searchQuery);
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }
                    }
                  }}
                  placeholder="Search 480+ Binance coins (e.g. XRP, DOGE, ADA, TON, AVAX)..."
                  className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-sm font-sans focus:outline-none shadow-xs border-0 ring-0 focus:ring-0 text-[#1C1C1C]"
                />
              </div>
            </div>

            {/* Popular / Filtered Crypto List */}
            <div className="overflow-y-auto p-3 flex-1 max-h-[400px] space-y-1 border-0 no-scrollbar">
              {filteredCoins.map((coin) => {
                const isCurrent = selectedCoin.symbol === coin.symbol;
                return (
                  <button
                    key={coin.id || coin.symbol}
                    onClick={() => handleSelectCoin(coin)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left cursor-pointer border-0 ${
                      isCurrent ? "bg-gray-100 font-semibold" : "hover:bg-[#F5F6F8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {renderOfficialCoinIcon(coin.symbol)}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-[#1C1C1C]">{coin.symbol}</span>
                          <span className="text-xs text-gray-400">{coin.name}</span>
                        </div>
                        <span className="text-[11px] text-gray-400 block">Binance: {coin.symbol}/USDT</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrent ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <Check size={13} /> Active
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 hover:bg-black hover:text-white transition-all">
                          Select
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}

              {/* Any arbitrary symbol fallback (allows searching literally ANY Binance coin in the world) */}
              {searchQuery.trim().length > 0 &&
                !filteredCoins.some(
                  (c) => c.symbol.toLowerCase() === searchQuery.trim().toLowerCase()
                ) && (
                  <button
                    onClick={() => {
                      setSelectedCoinBySymbol(searchQuery);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-amber-50/60 transition-all text-left cursor-pointer mt-1 border-0 bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1C1C1C] text-[#F4D014] font-bold text-xs flex items-center justify-center shrink-0">
                        +
                      </div>
                      <div>
                        <span className="font-bold text-sm text-[#1C1C1C]">
                          Load &quot;{searchQuery.trim().toUpperCase()}&quot; from Binance
                        </span>
                        <p className="text-xs text-gray-500">
                          Connect live chart for {searchQuery.trim().toUpperCase()}/USDT
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-black text-white">
                      Open
                    </span>
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

