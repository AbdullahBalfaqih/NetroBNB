"use client";

import React from "react";
import { useCrypto } from "@/context/CryptoContext";

interface CryptoCoinItem {
  name: string;
  symbol: string;
  icon?: string;
  color?: string;
}

// All coins from design and catalog
const ALL_CRYPTO_COINS: CryptoCoinItem[] = [
  {
    name: "Ethereum",
    symbol: "ETH",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/fcd844df5d1e37d869eeb7ad734adc16ef472fc2?width=272",
  },
  {
    name: "Toncoin",
    symbol: "TON",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/8425bcc14f4b1ae436da7df24d90a2087e73571f?width=272",
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    icon: "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=035",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/b4c6ff22c90da52aa2ba9ba08e27c06855c424e0?width=272",
  },
  {
    name: "Solana",
    symbol: "SOL",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/68d9bf8476930a9194179d34e6fac357b93e2a9a?width=272",
  },
  {
    name: "BNB",
    symbol: "BNB",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/eca15c8bf51eca1bd9a24e1c54b3f3f12ca0ebe1?width=272",
  },
  {
    name: "TRON",
    symbol: "TRX",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/61bcb59af07c8617520808adf62ffbfe37c247d0?width=272",
  },
  {
    name: "Litecoin",
    symbol: "LTC",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/74fa5e9888336f9b095d6a875806427fa38a42da?width=272",
  },
  {
    name: "XRP",
    symbol: "XRP",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/62f9270099ef188c6d6499a45e6880ec72f8e0b0?width=272",
  },
  {
    name: "Cardano",
    symbol: "ADA",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/7f92a04aabb4adaaf21b72cb732673459d392173?width=272",
  },
  {
    name: "Dogecoin",
    symbol: "DOGE",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/5454ed7f1153d6217a2a92cbb464d1632cab1141?width=272",
  },
  {
    name: "Polygon",
    symbol: "POL",
    icon: "https://api.builder.io/api/v1/image/assets/TEMP/678c4524ffde4b9ebc9eb2c79f9d872a129e6dfb?width=272",
  },
];

interface CryptoTickerCardProps {
  flush?: boolean;
}

export const CryptoTickerCard: React.FC<CryptoTickerCardProps> = ({ flush = false }) => {
  const { selectedCoin, setSelectedCoinBySymbol } = useCrypto();

  // Duplicating the full sequence twice ensures a mathematically continuous loop without breaks
  const displayCoins = [...ALL_CRYPTO_COINS, ...ALL_CRYPTO_COINS];

  return (
    <div
      className={`w-full bg-white relative overflow-hidden flex items-center select-none group transition-all ${
        flush
          ? "h-[68px]"
          : "h-[78px] rounded-xl shadow-figma-md border border-gray-200"
      }`}
    >
      {/* Deep Left Fade Mask */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-40 sm:w-56 bg-gradient-to-r from-white via-white/95 to-transparent z-10" />

      {/* Deep Right Fade Mask */}
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-40 sm:w-56 bg-gradient-to-l from-white via-white/95 to-transparent z-10" />

      {/* Infinite Seamless Scrolling Track */}
      <div className="animate-marquee-infinite flex items-center gap-[70px] sm:gap-[95px] md:gap-[110px] py-2 px-6">
        {displayCoins.map((coin, index) => {
          const isCurrent =
            selectedCoin.symbol.toUpperCase() === coin.symbol.toUpperCase() ||
            selectedCoin.symbol.toUpperCase() === (coin.symbol === "POL" ? "MATIC" : coin.symbol);

          return (
            <button
              key={`${coin.symbol}-${index}`}
              onClick={() => setSelectedCoinBySymbol(coin.symbol)}
              className="flex items-center justify-center shrink-0 cursor-pointer transform hover:scale-125 transition-transform duration-200 outline-none border-none bg-transparent p-1"
              title={`Switch dashboard to ${coin.name} (${coin.symbol})`}
            >
              {/* Coin Icon */}
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center drop-shadow-sm hover:drop-shadow-[0_0_12px_rgba(0,0,0,0.18)] transition-all">
                {coin.icon ? (
                  <img
                    src={coin.icon}
                    alt={coin.name}
                    className="w-full h-full object-contain rounded-full select-none pointer-events-none"
                    loading="lazy"
                    draggable={false}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black font-bold text-xs flex items-center justify-center shadow-xs">
                    {coin.symbol.slice(0, 3)}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
