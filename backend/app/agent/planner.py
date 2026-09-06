import re
from typing import List, Dict, Any, Tuple
from pydantic import BaseModel

# Marker key injected into PlannedStep.arguments to flag Binance OS routing
BINANCE_OS_ROUTE_KEY = "_binance_os_route"


class PlannedStep(BaseModel):
    step_number: int
    tool_name: str
    arguments: Dict[str, Any]
    purpose: str


class ExecutionPlan(BaseModel):
    intent: str
    primary_asset: str
    timeframe: str
    target_comparison_asset: str = ""
    rationale: str
    steps: List[PlannedStep]


class AgentPlanner:
    """Classifies user intent and formulates multi-step analytical tool execution plans."""

    SUPPORTED_ASSETS = ["SOL", "BTC", "ETH", "BNB", "XRP", "DOGE", "ADA", "AVAX", "SUI", "TON", "LINK", "PEPE", "NEAR"]

    ASSET_ALIASES = {
        "BITCOIN": "BTC", "BTC": "BTC", "بيتكوين": "BTC", "بتكوين": "BTC",
        "ETHEREUM": "ETH", "ETH": "ETH", "ايثريوم": "ETH", "إيثريوم": "ETH", "اثريوم": "ETH",
        "SOLANA": "SOL", "SOL": "SOL", "سولانا": "SOL", "سول": "SOL",
        "BINANCE": "BNB", "BNB": "BNB", "بينانس": "BNB",
        "AVALANCHE": "AVAX", "AVAX": "AVAX", "افاكس": "AVAX", "أفاكس": "AVAX",
        "TONCOIN": "TON", "TON": "TON", "تون": "TON", "تون كوين": "TON",
        "RIPPLE": "XRP", "XRP": "XRP", "ريبل": "XRP",
        "DOGECOIN": "DOGE", "DOGE": "DOGE", "دوج": "DOGE", "دوجكوين": "DOGE",
        "CARDANO": "ADA", "ADA": "ADA", "كاردانو": "ADA",
        "SUI": "SUI", "سوي": "SUI",
        "CHAINLINK": "LINK", "LINK": "LINK", "لينك": "LINK",
        "NEAR": "NEAR", "نير": "NEAR",
        "PEPE": "PEPE", "بيبي": "PEPE",
    }

    def extract_asset(self, text: str, default_asset: str = "SOL") -> Tuple[str, str, str]:
        upper_text = text.upper()
        found_positions = []

        # Check aliases and collect start indices
        for alias, symbol in self.ASSET_ALIASES.items():
            pos = upper_text.find(alias)
            if pos == -1:
                pos = text.find(alias)
            if pos != -1:
                found_positions.append((pos, symbol))

        # Sort strictly by the order they appear in the user prompt
        found_positions.sort(key=lambda x: x[0])
        seen = set()
        found_assets = []
        for _, sym in found_positions:
            if sym not in seen:
                seen.add(sym)
                found_assets.append(sym)

        # Word boundary check for standard symbols if none found
        if not found_assets:
            for asset in self.SUPPORTED_ASSETS:
                m = re.search(r'\b' + asset + r'\b', upper_text)
                if m and asset not in found_assets:
                    found_assets.append(asset)

        timeframe = "24h"
        if "7D" in upper_text or "7 DAYS" in upper_text or "WEEK" in upper_text:
            timeframe = "7d"
        elif "1H" in upper_text or "1 HOUR" in upper_text:
            timeframe = "1h"
        elif "30D" in upper_text or "MONTH" in upper_text:
            timeframe = "30d"

        primary = found_assets[0] if found_assets else default_asset
        secondary = found_assets[1] if len(found_assets) > 1 else ""
        return primary, secondary, timeframe

    def plan(self, message: str, active_asset: str = "SOL") -> ExecutionPlan:
        msg_clean = message.strip()
        msg_lower = msg_clean.lower()
        primary_asset, secondary_asset, timeframe = self.extract_asset(msg_clean, active_asset)

        # Intent 0: Web3 Token Swap Execution (e.g. "بدل 0.5 BNB إلى BTC" or "swap 1 bnb to btc")
        if any(w in msg_lower for w in ["swap", "سواب", "بدل", "تبديل", "exchange", "حول"]):
            amount_match = re.search(r'(\d+(\.\d+)?)', msg_clean)
            amount = float(amount_match.group(1)) if amount_match else 0.5
            from_token = primary_asset or "BNB"
            to_token = secondary_asset or ("BTC" if from_token != "BTC" else "BNB")

            steps = [
                PlannedStep(
                    step_number=1,
                    tool_name="execute_swap_order",
                    arguments={
                        "from_asset": from_token,
                        "to_asset": to_token,
                        "amount": amount,
                        "slippage_tolerance": 0.5
                    },
                    purpose=f"Execute decentralized swap order from {amount} {from_token} to {to_token} with safety parameters"
                )
            ]
            return ExecutionPlan(
                intent="EXECUTE_SWAP",
                primary_asset=from_token,
                target_comparison_asset=to_token,
                timeframe="realtime",
                rationale=f"Execute Web3 swap order exchanging {amount} {from_token} for {to_token}.",
                steps=steps
            )

        # Intent 1: Comparison between two assets
        if "compare" in msg_lower or (secondary_asset and ("vs" in msg_lower or "and" in msg_lower)):
            target_comp = secondary_asset or ("ETH" if primary_asset != "ETH" else "BTC")
            steps = [
                PlannedStep(
                    step_number=1,
                    tool_name="run_full_asset_analysis",
                    arguments={"asset": primary_asset, "timeframe": timeframe},
                    purpose=f"Execute full 10-module intelligence analysis for primary asset {primary_asset}"
                ),
                PlannedStep(
                    step_number=2,
                    tool_name="run_full_asset_analysis",
                    arguments={"asset": target_comp, "timeframe": timeframe},
                    purpose=f"Execute full 10-module intelligence analysis for comparison asset {target_comp}"
                )
            ]
            return ExecutionPlan(
                intent="COMPARATIVE_ANALYSIS",
                primary_asset=primary_asset,
                target_comparison_asset=target_comp,
                timeframe=timeframe,
                rationale=f"Perform comparative behavioral and market intelligence analysis between {primary_asset} and {target_comp}.",
                steps=steps
            )

        # Intent 2: "Why did you give SOL a 78?" or Explain score
        if "why did you give" in msg_lower or "score" in msg_lower or "explain" in msg_lower:
            steps = [
                PlannedStep(
                    step_number=1,
                    tool_name="run_full_asset_analysis",
                    arguments={"asset": primary_asset, "timeframe": timeframe},
                    purpose=f"Retrieve computed behavioral breakdown and component contributions for {primary_asset}"
                )
            ]
            return ExecutionPlan(
                intent="EXPLAIN_SCORE",
                primary_asset=primary_asset,
                timeframe=timeframe,
                rationale=f"Break down the 9 weighted components contributing to {primary_asset}'s Behavioral Score.",
                steps=steps
            )

        # Intent 3: "Why is SOL moving?" (Deep Investigation)
        if "why is" in msg_lower or "moving" in msg_lower or "cause" in msg_lower or "what caused" in msg_lower:
            steps = [
                PlannedStep(
                    step_number=1,
                    tool_name="get_market_overview",
                    arguments={"asset": primary_asset, BINANCE_OS_ROUTE_KEY: True},
                    purpose=f"[BinanceOS] Fetch live 24h ticker and price via get_24hr_ticker for {primary_asset}"
                ),
                PlannedStep(
                    step_number=2,
                    tool_name="get_order_book_depth",
                    arguments={"asset": primary_asset, "limit": 100, BINANCE_OS_ROUTE_KEY: True},
                    purpose=f"[BinanceOS] Inspect orderbook depth, liquidity withdrawal, and spread via get_orderbook"
                ),
                PlannedStep(
                    step_number=3,
                    tool_name="get_holder_behavior",
                    arguments={"asset": primary_asset},
                    purpose=f"Inspect whale movements and large-holder inflows/outflows"
                ),
                PlannedStep(
                    step_number=4,
                    tool_name="run_full_asset_analysis",
                    arguments={"asset": primary_asset, "timeframe": timeframe},
                    purpose=f"Synthesize momentum-flow divergence and statistical anomaly context"
                )
            ]
            return ExecutionPlan(
                intent="DEEP_INVESTIGATION",
                primary_asset=primary_asset,
                timeframe=timeframe,
                rationale=f"Investigate driving catalysts for {primary_asset} across orderflow, liquidity, and on-chain whale activity.",
                steps=steps
            )

        # Intent 4: Anomaly Detection ("Find unusual activity in SOL", "anomalies", "divergences")
        if "anomaly" in msg_lower or "unusual" in msg_lower or "divergence" in msg_lower:
            steps = [
                PlannedStep(
                    step_number=1,
                    tool_name="detect_asset_anomalies",
                    arguments={"asset": primary_asset},
                    purpose=f"Scan {primary_asset} metrics against 30-day statistical baselines"
                ),
                PlannedStep(
                    step_number=2,
                    tool_name="run_full_asset_analysis",
                    arguments={"asset": primary_asset, "timeframe": timeframe},
                    purpose=f"Ground anomalies in overarching behavioral context"
                )
            ]
            return ExecutionPlan(
                intent="ANOMALY_DETECTION",
                primary_asset=primary_asset,
                timeframe=timeframe,
                rationale=f"Isolate statistical anomalies and momentum/flow divergences for {primary_asset}.",
                steps=steps
            )

        # Intent 5: Portfolio Analysis ("Analyze my portfolio", "largest risk")
        if "portfolio" in msg_lower or "holdings" in msg_lower or "balance" in msg_lower or "risk" in msg_lower:
            steps = [
                PlannedStep(
                    step_number=1,
                    tool_name="get_portfolio_health",
                    arguments={"user_id": "default_user"},
                    purpose="Retrieve current token balances, allocations, and open position P/L"
                ),
                PlannedStep(
                    step_number=2,
                    tool_name="get_largest_risk",
                    arguments={"user_id": "default_user"},
                    purpose="Diagnose largest exposure risks and portfolio concentration"
                )
            ]
            return ExecutionPlan(
                intent="PORTFOLIO_REVIEW",
                primary_asset=primary_asset,
                timeframe=timeframe,
                rationale="Perform portfolio health check, risk assessment, and allocation review.",
                steps=steps
            )

        # Intent 6: Trading Strategy / Action ("Create a trading strategy", "execute", "strategy")
        if "strategy" in msg_lower or "trade" in msg_lower or "buy" in msg_lower or "sell" in msg_lower or "action" in msg_lower:
            steps = [
                PlannedStep(
                    step_number=1,
                    tool_name="run_full_asset_analysis",
                    arguments={"asset": primary_asset, "timeframe": timeframe},
                    purpose=f"Evaluate behavioral accumulation and risk levels for {primary_asset}"
                ),
                PlannedStep(
                    step_number=2,
                    tool_name="propose_trading_strategy",
                    arguments={"asset": primary_asset},
                    purpose=f"Formulate risk-managed strategy with entry, take-profit, and stop-loss"
                )
            ]
            return ExecutionPlan(
                intent="STRATEGY_PROPOSAL",
                primary_asset=primary_asset,
                timeframe=timeframe,
                rationale=f"Formulate actionable trading strategy for {primary_asset} with strict safety confirmation.",
                steps=steps
            )

        # Default Intent: Full Asset Intelligence Analysis ("Analyze SOL over the last 24 hours")
        # Pre-fetch live market data via Binance Agent OS before running full analytics
        steps = [
            PlannedStep(
                step_number=1,
                tool_name="get_market_overview",
                arguments={"asset": primary_asset, BINANCE_OS_ROUTE_KEY: True},
                purpose=f"[BinanceOS] Fetch live 24h price and volume via get_24hr_ticker for {primary_asset}"
            ),
            PlannedStep(
                step_number=2,
                tool_name="get_order_book_depth",
                arguments={"asset": primary_asset, "limit": 20, BINANCE_OS_ROUTE_KEY: True},
                purpose=f"[BinanceOS] Fetch live orderbook snapshot via get_orderbook for {primary_asset}"
            ),
            PlannedStep(
                step_number=3,
                tool_name="run_full_asset_analysis",
                arguments={"asset": primary_asset, "timeframe": timeframe},
                purpose=f"Run full 10-module asset behavioral analysis for {primary_asset} using live BOS data"
            )
        ]
        return ExecutionPlan(
            intent="ASSET_ANALYSIS",
            primary_asset=primary_asset,
            timeframe=timeframe,
            rationale=f"Execute comprehensive behavioral intelligence analysis on {primary_asset} over {timeframe} powered by Binance Agent OS live data.",
            steps=steps
        )


planner = AgentPlanner()
