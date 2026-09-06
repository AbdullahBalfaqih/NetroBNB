# NetroBNB: Autonomous AI Asset Intelligence & Trading Agent

> **Binance Agent OS Hackathon — Track A: Build an AI Agent with Agent OS**

NetroBNB is a production-grade Autonomous Asset Intelligence and Quantitative Execution Agent built natively on the **Binance Agent OS Model Context Protocol (MCP)** specification. It bridges institutional-grade market telemetry from Binance Spot infrastructure with on-chain decentralized execution on the BNB Smart Chain (BSC).

---

## Architecture Overview

NetroBNB implements a multi-tier agentic architecture designed for high-concurrency real-time market data evaluation and execution safety:

```
+-------------------------------------------------------------------------+
|                           User / Web3 Client                            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                  NetroBNB Unified Dashboard (Next.js 16)                |
|       - Real-time Asset Intelligence Telemetry Canvas                   |
|       - NetroAI Multi-turn Natural Language Conversational Interface    |
|       - Web3 Decentralized Swap Widget (Wagmi / Reown AppKit)           |
+-------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+               +-------------------------------+
|  OpenRouter LLM Core  |               |    FastAPI Agent Engine       |
|  - Reasoning Models   |               |    - Master Orchestrator      |
|  - Financial Analysis |               |    - Multi-Step Task Planner  |
|  - Natural Language   |               |    - Memory & Security Filter |
+-----------------------+               +-------------------------------+
            |                                               |
            +-----------------------+-----------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                    Binance Agent OS MCP Layer                           |
|       Endpoint: https://agent.binance.com/mcp/agentic                   |
|       - get_price             (Live Spot Ticker Execution)              |
|       - get_24hr_ticker       (Rolling 24H Statistical Telemetry)       |
|       - get_orderbook         (L2 Liquidity & Bid/Ask Depth)            |
|       - get_klines            (Multi-timeframe Structural OHLCV)        |
|       - get_book_ticker       (Best Bid/Offer Volumetric Depth)         |
|       - Automatic Circuit Breaker & High-Availability Fallback          |
+-------------------------------------------------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+               +-------------------------------+
|  Binance Spot Engine  |               |   BNB Smart Chain (BSC)       |
|  - Real-time Orderbook|               |   - Decentralized Routing     |
|  - Whale Flow Tracking|               |   - Low-latency Settlement    |
+-----------------------+               +-------------------------------+
```

---

## Core Capabilities

### 1. Binance Agent OS MCP Integration
- **Direct Protocol Compliance:** Native JSON-RPC 2.0 client communicating directly with the official Binance Agent OS endpoint (`https://agent.binance.com/mcp/agentic`).
- **Telemetry Observability:** Every analytical tool call records unique run IDs, execution latency, and source provenance indicators (`BINANCE_AGENT_OS_MCP` vs local fallback).
- **Graceful Fault Tolerance:** Built-in circuit breakers ensure 100% uptime with deterministic failover to Binance REST endpoints if remote MCP relays experience upstream congestion.

### 2. NetroAI Autonomous Agent
- **Grounded Market Intelligence:** Combines raw Binance ticker feeds, order book imbalance, and whale positioning metrics into actionable synthesis.
- **Conversational Awareness:** Distinguishes casual user dialogue from explicit asset queries, maintaining stateful context across conversations.
- **Strict Formatting Guardrails:** Produces clean, professional financial outputs without ungrounded hallucinations or unnecessary decoration.

### 3. Quantitative Risk & Asset Health Engine
- **Behavioral Telemetry Scoring:** Evaluates assets across 9 weighted parameters including accumulation acceleration, taker order flow aggression, and VWAP stability.
- **Liquidity Stress Diagnostics:** Measures order book bid depth within 2% of mid-market price to prevent execution slippage.

### 4. Non-Custodial Web3 Execution
- Fully non-custodial DEX swap interface integrated on BNB Smart Chain.
- Seamless connection via Reown AppKit and Wagmi v3.
- Parameterized slippage tolerance, gas estimation, and automated route discovery.

---

## Repository Structure

```
dashboard3/
├── app/                              # Next.js 16 App Router
│   ├── api/v1/chat/route.ts          # Agent conversational gateway & OpenRouter bridge
│   ├── api/v1/assets/[symbol]/       # Real-time asset telemetry endpoints
│   ├── globals.css                   # Refined styles & smooth momentum scrolling
│   ├── layout.tsx                    # Root providers (Wagmi, QueryClient, CryptoContext)
│   └── page.tsx                      # Main dashboard canvas with Framer Motion transitions
├── components/
│   ├── Header.tsx                    # Global navigation, asset search & wallet status
│   └── dashboard/
│       ├── AnalyticsCard.tsx         # Digital asset behavioral telemetry
│       ├── AskCoreAICard.tsx         # NetroAI conversational agent interface
│       ├── CalendarCard.tsx          # BSC decentralized asset swap module
│       ├── CryptoMarketCard.tsx      # Real-time market strip & dynamic ticker
│       ├── ExpensesCard.tsx          # Portfolio insights & risk telemetry
│       ├── LeaveLeftCard.tsx         # Risk & Safety gauge monitor
│       ├── PayslipCard.tsx           # Net asset allocation & structural breakdown
│       └── ProfileCard.tsx           # User identity, wallet state & security level
├── context/
│   └── CryptoContext.tsx             # Global asset selection & live Binance sync
├── backend/                          # High-performance Python Agent Core
│   ├── app/
│   │   ├── agent/
│   │   │   ├── binance_os/           # Binance Agent OS MCP client & orchestrator
│   │   │   ├── planner.py            # Multi-step task planner & intent classifier
│   │   │   └── orchestrator.py       # Central agent execution loop
│   │   ├── providers/                # Market data providers & Binance adapter
│   │   ├── trading/                  # Smart trade router & safety checks
│   │   └── main.py                   # FastAPI application entry point
│   ├── run.py                        # Backend launcher script
│   └── requirements.txt              # Python runtime dependencies
├── public/                           # Optimized graphics & brand assets
├── package.json                      # Next.js dependencies & scripts
└── tsconfig.json                     # Strict TypeScript configuration
```

---

## Getting Started

### Prerequisites
- Node.js 20+ and npm
- Python 3.11+ (for backend agent services)
- Git

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AbdullahBalfaqih/NetroBNB.git
cd NetroBNB

# Install frontend dependencies
npm install --legacy-peer-deps
```

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```env
# Web3 / Reown AppKit
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
NEXT_PUBLIC_REOWN_ORG_ID=your_reown_org_id

# AI Agent Configuration
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=minimax/minimax-m3:free

# Binance Agent OS Configuration (Optional, falls back to public API)
BINANCE_AGENT_OS_API_KEY=your_binance_agent_os_key
```

### 3. Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Hackathon Submission Details

- **Event:** Binance Agent OS Mini Hackathon
- **Track:** Track A — Build an AI Agent with Agent OS
- **Prize Pool Category:** 20,000 USDC
- **Core Technology Stack:**
  - Binance Agent OS (Model Context Protocol / JSON-RPC 2.0)
  - BNB Smart Chain (BSC) Decentralized Infrastructure
  - Next.js 16, TypeScript, Tailwind CSS, Framer Motion
  - FastAPI, Python 3.11, OpenRouter AI Models

---

## License

MIT License. Designed and developed for the Binance Agent OS Mini Hackathon.
