"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAppKit, useAppKitAccount, useDisconnect } from "@reown/appkit/react";

export interface CryptoConfig {
  id: string;
  name: string;
  symbol: string;
  tradingViewSymbol: string;
  fallbackPrice: number;
  marketCapEst: string;
  allTimeHigh: string;
  circulatingSupply: string;
  iconUrl?: string;
}

export const ALL_CRYPTO_CATALOG: CryptoConfig[] = [
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    tradingViewSymbol: "BINANCE:BTCUSDT",
    fallbackPrice: 77420.0,
    marketCapEst: "1.52T",
    allTimeHigh: "$126,080.00",
    circulatingSupply: "19.8M",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/b4c6ff22c90da52aa2ba9ba08e27c06855c424e0?width=272",
  },
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    tradingViewSymbol: "BINANCE:ETHUSDT",
    fallbackPrice: 2396.0,
    marketCapEst: "288.5B",
    allTimeHigh: "$4,878.26",
    circulatingSupply: "120.4M",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/fcd844df5d1e37d869eeb7ad734adc16ef472fc2?width=272",
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    tradingViewSymbol: "BINANCE:SOLUSDT",
    fallbackPrice: 99.85,
    marketCapEst: "47.2B",
    allTimeHigh: "$259.96",
    circulatingSupply: "468.1M",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/68d9bf8476930a9194179d34e6fac357b93e2a9a?width=272",
  },
  {
    id: "avax",
    name: "Avalanche",
    symbol: "AVAX",
    tradingViewSymbol: "BINANCE:AVAXUSDT",
    fallbackPrice: 28.4,
    marketCapEst: "11.2B",
    allTimeHigh: "$146.22",
    circulatingSupply: "405.2M",
  },
  {
    id: "ton",
    name: "Toncoin",
    symbol: "TON",
    tradingViewSymbol: "BINANCE:TONUSDT",
    fallbackPrice: 5.12,
    marketCapEst: "13.1B",
    allTimeHigh: "$8.24",
    circulatingSupply: "2.5B",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/8425bcc14f4b1ae436da7df24d90a2087e73571f?width=272",
  },
  {
    id: "bnb",
    name: "BNB",
    symbol: "BNB",
    tradingViewSymbol: "BINANCE:BNBUSDT",
    fallbackPrice: 752.8,
    marketCapEst: "115.8B",
    allTimeHigh: "$717.48",
    circulatingSupply: "153.8M",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/eca15c8bf51eca1bd9a24e1c54b3f3f12ca0ebe1?width=272",
  },
  {
    id: "xrp",
    name: "XRP (Ripple)",
    symbol: "XRP",
    tradingViewSymbol: "BINANCE:XRPUSDT",
    fallbackPrice: 1.85,
    marketCapEst: "104.2B",
    allTimeHigh: "$3.84",
    circulatingSupply: "56.4B",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/62f9270099ef188c6d6499a45e6880ec72f8e0b0?width=272",
  },
  {
    id: "doge",
    name: "Dogecoin",
    symbol: "DOGE",
    tradingViewSymbol: "BINANCE:DOGEUSDT",
    fallbackPrice: 0.22,
    marketCapEst: "32.1B",
    allTimeHigh: "$0.73",
    circulatingSupply: "146.2B",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/5454ed7f1153d6217a2a92cbb464d1632cab1141?width=272",
  },
  {
    id: "ada",
    name: "Cardano",
    symbol: "ADA",
    tradingViewSymbol: "BINANCE:ADAUSDT",
    fallbackPrice: 0.65,
    marketCapEst: "23.4B",
    allTimeHigh: "$3.10",
    circulatingSupply: "35.7B",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/7f92a04aabb4adaaf21b72cb732673459d392173?width=272",
  },
  {
    id: "sui",
    name: "Sui Network",
    symbol: "SUI",
    tradingViewSymbol: "BINANCE:SUIUSDT",
    fallbackPrice: 2.85,
    marketCapEst: "8.1B",
    allTimeHigh: "$3.92",
    circulatingSupply: "2.8B",
  },
  {
    id: "link",
    name: "Chainlink",
    symbol: "LINK",
    tradingViewSymbol: "BINANCE:LINKUSDT",
    fallbackPrice: 18.3,
    marketCapEst: "11.5B",
    allTimeHigh: "$52.88",
    circulatingSupply: "626.8M",
  },
  {
    id: "trx",
    name: "TRON",
    symbol: "TRX",
    tradingViewSymbol: "BINANCE:TRXUSDT",
    fallbackPrice: 0.21,
    marketCapEst: "18.3B",
    allTimeHigh: "$0.30",
    circulatingSupply: "86.2B",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/61bcb59af07c8617520808adf62ffbfe37c247d0?width=272",
  },
  {
    id: "ltc",
    name: "Litecoin",
    symbol: "LTC",
    tradingViewSymbol: "BINANCE:LTCUSDT",
    fallbackPrice: 84.5,
    marketCapEst: "6.3B",
    allTimeHigh: "$412.96",
    circulatingSupply: "74.8M",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/74fa5e9888336f9b095d6a875806427fa38a42da?width=272",
  },
  {
    id: "pol",
    name: "Polygon",
    symbol: "POL",
    tradingViewSymbol: "BINANCE:POLUSDT",
    fallbackPrice: 0.44,
    marketCapEst: "3.5B",
    allTimeHigh: "$2.92",
    circulatingSupply: "7.9B",
    iconUrl: "https://api.builder.io/api/v1/image/assets/TEMP/678c4524ffde4b9ebc9eb2c79f9d872a129e6dfb?width=272",
  },
  {
    id: "shib",
    name: "Shiba Inu",
    symbol: "SHIB",
    tradingViewSymbol: "BINANCE:SHIBUSDT",
    fallbackPrice: 0.000018,
    marketCapEst: "10.6B",
    allTimeHigh: "$0.000088",
    circulatingSupply: "589.2T",
  },
  {
    id: "pepe",
    name: "Pepe Coin",
    symbol: "PEPE",
    tradingViewSymbol: "BINANCE:PEPEUSDT",
    fallbackPrice: 0.000012,
    marketCapEst: "5.1B",
    allTimeHigh: "$0.000025",
    circulatingSupply: "420.6T",
  },
  {
    id: "near",
    name: "NEAR Protocol",
    symbol: "NEAR",
    tradingViewSymbol: "BINANCE:NEARUSDT",
    fallbackPrice: 5.4,
    marketCapEst: "6.5B",
    allTimeHigh: "$20.42",
    circulatingSupply: "1.2B",
  },
  {
    id: "dot",
    name: "Polkadot",
    symbol: "DOT",
    tradingViewSymbol: "BINANCE:DOTUSDT",
    fallbackPrice: 6.8,
    marketCapEst: "9.8B",
    allTimeHigh: "$55.00",
    circulatingSupply: "1.4B",
  },
  {
    id: "apt",
    name: "Aptos",
    symbol: "APT",
    tradingViewSymbol: "BINANCE:APTUSDT",
    fallbackPrice: 9.8,
    marketCapEst: "4.9B",
    allTimeHigh: "$19.90",
    circulatingSupply: "508.1M",
  },
  {
    id: "tao",
    name: "Bittensor",
    symbol: "TAO",
    tradingViewSymbol: "BINANCE:TAOUSDT",
    fallbackPrice: 462.0,
    marketCapEst: "3.4B",
    allTimeHigh: "$757.60",
    circulatingSupply: "7.3M",
  },
  {
    id: "uni",
    name: "Uniswap",
    symbol: "UNI",
    tradingViewSymbol: "BINANCE:UNIUSDT",
    fallbackPrice: 11.2,
    marketCapEst: "6.7B",
    allTimeHigh: "$44.97",
    circulatingSupply: "600.4M",
  },
];

// Arabic and English Aliases Map for Instant Natural Language & Chat Recognition
const ASSET_ALIASES: Record<string, string> = {
  // Bitcoin
  "BITCOIN": "BTC", "BTC": "BTC", "بيتكوين": "BTC", "بتكوين": "BTC", "البيتكوين": "BTC",
  // Ethereum
  "ETHEREUM": "ETH", "ETH": "ETH", "ايثريوم": "ETH", "إيثريوم": "ETH", "اثريوم": "ETH", "الايثريوم": "ETH", "الإيثريوم": "ETH", "الاثيريوم": "ETH",
  // Solana
  "SOLANA": "SOL", "SOL": "SOL", "سولانا": "SOL", "سول": "SOL", "السولانا": "SOL",
  // Avalanche
  "AVALANCHE": "AVAX", "AVAX": "AVAX", "افاكس": "AVAX", "أفاكس": "AVAX", "افالانتش": "AVAX", "الافاكس": "AVAX",
  // Toncoin
  "TONCOIN": "TON", "TON": "TON", "تون": "TON", "تون كوين": "TON", "تونكوين": "TON", "التون": "TON",
  // BNB
  "BINANCE": "BNB", "BNB": "BNB", "بينانس": "BNB", "بي ان بي": "BNB",
  // Ripple
  "RIPPLE": "XRP", "XRP": "XRP", "ريبل": "XRP", "الريبل": "XRP",
  // Doge
  "DOGECOIN": "DOGE", "DOGE": "DOGE", "دوج": "DOGE", "دوجكوين": "DOGE", "الدوج": "DOGE",
  // Cardano
  "CARDANO": "ADA", "ADA": "ADA", "كاردانو": "ADA", "ادا": "ADA", "أدا": "ADA",
  // Sui
  "SUI": "SUI", "سوي": "SUI", "سوي نتورك": "SUI",
  // Chainlink
  "CHAINLINK": "LINK", "LINK": "LINK", "لينك": "LINK", "تشين لينك": "LINK",
  // Tron
  "TRON": "TRX", "TRX": "TRX", "ترون": "TRX",
  // Litecoin
  "LITECOIN": "LTC", "LTC": "LTC", "لايتكوين": "LTC", "لايت كوين": "LTC",
  // Polygon
  "POLYGON": "POL", "POL": "POL", "MATIC": "POL", "ماتيك": "POL", "بوليجون": "POL",
  // Near
  "NEAR": "NEAR", "نير": "NEAR",
  // Pepe
  "PEPE": "PEPE", "بيبي": "PEPE",
  // Shiba
  "SHIBA": "SHIB", "SHIB": "SHIB", "شيبا": "SHIB",
};

export function detectCoinFromText(text: string): string | null {
  if (!text || typeof text !== "string") return null;
  const upper = text.toUpperCase();
  const lower = text.toLowerCase();

  // 1. Direct alias match
  for (const [alias, symbol] of Object.entries(ASSET_ALIASES)) {
    // For Arabic and multi-char
    if (text.includes(alias) || upper.includes(alias.toUpperCase())) {
      return symbol;
    }
  }

  // 2. Exact word regex match on symbols
  for (const coin of ALL_CRYPTO_CATALOG) {
    const symbolRegex = new RegExp(`(^|\\b|\\s|[^a-zA-Z0-9])${coin.symbol}($|\\b|\\s|[^a-zA-Z0-9])`, "i");
    if (symbolRegex.test(text)) {
      return coin.symbol;
    }
    if (lower.includes(coin.name.toLowerCase())) {
      return coin.symbol;
    }
  }

  return null;
}

export interface LiveMarketData {
  price: number;
  priceChange: string;
  isPositive: boolean;
  low24h: string;
  high24h: string;
  volume24h: string;
  lastTickDirection: "up" | "down" | null;
}

interface CryptoContextType {
  selectedCoin: CryptoConfig;
  setSelectedCoin: (coin: CryptoConfig) => void;
  setSelectedCoinBySymbol: (symbolOrQuery: string) => void;
  pinnedSymbols: string[];
  setPinnedSymbols: React.Dispatch<React.SetStateAction<string[]>>;
  allCoins: CryptoConfig[];
  liveMarket: LiveMarketData;
  fetchLiveMarket: (symbol: string) => Promise<void>;
  detectCoin: (text: string) => string | null;
  isWalletConnected: boolean;
  walletAddress: string;
  fullAddress: string;
  connectWallet: (walletName?: string) => void;
  disconnectWallet: () => void;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: (open: boolean) => void;
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined);

export const CryptoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allCoins, setAllCoins] = useState<CryptoConfig[]>(ALL_CRYPTO_CATALOG);
  const [selectedCoin, setSelectedCoinState] = useState<CryptoConfig>(ALL_CRYPTO_CATALOG[0]); // BTC initially
  const [pinnedSymbols, setPinnedSymbols] = useState<string[]>(["BNB", "BTC", "ETH", "SOL", "AVAX", "TON"]);
  
  // Official Reown AppKit Hooks
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  const formattedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  const connectWallet = () => {
    open();
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const setIsWalletModalOpen = (isOpen: boolean) => {
    if (isOpen) {
      open();
    }
  };
  
  const [liveMarket, setLiveMarket] = useState<LiveMarketData>({
    price: 77420.0,
    priceChange: "+0.05%",
    isPositive: true,
    low24h: "$76,264.00",
    high24h: "$77,792.00",
    volume24h: "$1.03B",
    lastTickDirection: null,
  });

  // Fetch live market data for the current active coin via local proxy route
  const fetchLiveMarket = useCallback(async (symbol: string) => {
    try {
      const res = await fetch(`/api/v1/ticker?symbol=${encodeURIComponent(symbol)}`).catch(() => null);
      if (res && res.ok) {
        const ticker = await res.json();
        const price = parseFloat(ticker.lastPrice);
        const changePct = parseFloat(ticker.priceChangePercent);
        const high = parseFloat(ticker.highPrice);
        const low = parseFloat(ticker.lowPrice);
        const vol = parseFloat(ticker.quoteVolume);

        setLiveMarket((prev) => {
          let dir: "up" | "down" | null = null;
          if (prev.price !== price) {
            dir = price >= prev.price ? "up" : "down";
          }
          return {
            price: price || prev.price,
            priceChange: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(2)}%`,
            isPositive: changePct >= 0,
            high24h: high >= 1000
              ? `$${high.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `$${high.toFixed(4)}`,
            low24h: low >= 1000
              ? `$${low.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `$${low.toFixed(4)}`,
            volume24h: vol >= 1e9 ? `$${(vol / 1e9).toFixed(2)}B` : `$${(vol / 1e6).toFixed(2)}M`,
            lastTickDirection: dir,
          };
        });
      }
    } catch {
      // Keep existing market data seamlessly on network restriction
    }
  }, []);

  // Lightweight periodic polling for live price
  useEffect(() => {
    fetchLiveMarket(selectedCoin.symbol);
    const interval = setInterval(() => {
      fetchLiveMarket(selectedCoin.symbol);
    }, 6000);
    return () => clearInterval(interval);
  }, [selectedCoin.symbol, fetchLiveMarket]);

  const setSelectedCoin = useCallback((coin: CryptoConfig) => {
    setSelectedCoinState(coin);
    setPinnedSymbols((prev) => {
      if (!prev.includes(coin.symbol)) {
        return [...prev, coin.symbol];
      }
      return prev;
    });
  }, []);

  const setSelectedCoinBySymbol = useCallback((symbolOrQuery: string) => {
    const clean = symbolOrQuery.trim().toUpperCase().replace(/USDT$/, "");
    const detected = detectCoinFromText(symbolOrQuery) || clean;

    // Find in allCoins or catalog
    const found = allCoins.find((c) => c.symbol.toUpperCase() === detected) ||
      ALL_CRYPTO_CATALOG.find((c) => c.symbol.toUpperCase() === detected);

    if (found) {
      setSelectedCoin(found);
    } else {
      // Create dynamic fallback config
      const customCoin: CryptoConfig = {
        id: detected.toLowerCase(),
        name: `${detected} Token`,
        symbol: detected,
        tradingViewSymbol: `BINANCE:${detected}USDT`,
        fallbackPrice: 1.0,
        marketCapEst: "Dynamic",
        allTimeHigh: "N/A",
        circulatingSupply: "Live",
      };
      setSelectedCoin(customCoin);
    }
  }, [allCoins, setSelectedCoin]);

  return (
    <CryptoContext.Provider
      value={{
        selectedCoin,
        setSelectedCoin,
        setSelectedCoinBySymbol,
        pinnedSymbols,
        setPinnedSymbols,
        allCoins,
        liveMarket,
        fetchLiveMarket,
        detectCoin: detectCoinFromText,
        isWalletConnected: isConnected,
        walletAddress: formattedAddress,
        fullAddress: address || "",
        connectWallet,
        disconnectWallet,
        isWalletModalOpen: false,
        setIsWalletModalOpen,
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error("useCrypto must be used within a CryptoProvider");
  }
  return context;
};
