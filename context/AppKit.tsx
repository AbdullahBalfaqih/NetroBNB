"use client";

import React, { ReactNode } from "react";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { mainnet, bsc, arbitrum, polygon, avalanche, type AppKitNetwork } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

// 1. Get Project ID from user's Reown Dashboard: https://dashboard.reown.com/b762c05d-58c3-4d9d-8ca1-ada2c8d06d25/d65e42c2-1921-4ec9-bed0-d3f4d557e32e
export const projectId =
  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "d65e42c2-1921-4ec9-bed0-d3f4d557e32e";

// 2. Set up React Query client with no noisy retries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Suppress non-critical third-party Web3Modal telemetry/quota warnings
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const msg = event.reason?.message || String(event.reason || "");
    if (
      msg.includes("Failed to fetch") ||
      msg.includes("project-limits") ||
      msg.includes("web3modal") ||
      msg.includes("403")
    ) {
      event.preventDefault();
    }
  });
}

import { http } from "wagmi";

// 3. Define supported networks as non-empty tuple
export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [bsc, mainnet, arbitrum, polygon, avalanche];

// 4. Set up Wagmi Adapter with reliable public RPC transports
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
  ssr: true,
  transports: {
    [bsc.id]: http("https://binance.llamarpc.com"),
    [mainnet.id]: http("https://eth.llamarpc.com"),
    [arbitrum.id]: http("https://arb1.arbitrum.io/rpc"),
    [polygon.id]: http("https://polygon-rpc.com"),
    [avalanche.id]: http("https://api.avax.network/ext/bc/C/rpc"),
  },
});

// 5. Metadata for Reown
const metadata = {
  name: "NetroBNB Dashboard",
  description: "AI-Powered Real-Time Asset Intelligence & Behavioral Telemetry Dashboard",
  url: "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 6. Initialize official Reown AppKit Modal (Company's Real Modal)
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  defaultNetwork: bsc,
  metadata,
  themeMode: "dark",
  features: {
    analytics: false, // Prevents adblocker/firewall pulse Failed to fetch errors
    email: true,
    socials: ["google", "x", "github", "discord", "apple"],
    emailShowWallets: true,
  },
  themeVariables: {
    "--w3m-accent": "#F4D014",
    "--w3m-border-radius-master": "16px",
    "--w3m-z-index": 999999,
  },
});

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
