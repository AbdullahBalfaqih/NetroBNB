from app.agent.tools.registry import tool_registry
from app.trading.executor import trading_executor
from app.analytics import analysis_engine
from app.providers import market_provider


@tool_registry.register(
    name="propose_trading_strategy",
    description="Generate a risk-managed trading strategy proposal based on behavioral asset intelligence.",
    permission_level="ANALYTICAL"
)
async def propose_trading_strategy(asset: str) -> dict:
    analysis = await analysis_engine.analyze_asset(asset)
    cur_price = analysis.market["last_price"]
    score = analysis.overall_score

    if score >= 70:
        side = "BUY"
        target_entry = round(cur_price * 0.995, 2)
        take_profit = round(cur_price * 1.085, 2)
        stop_loss = round(cur_price * 0.965, 2)
        rationale = (
            f"Asset shows strong behavioral accumulation ({analysis.accumulation_distribution.accumulation_score:.0f}/100) "
            f"and institutional whale support. Favorable risk/reward profile on pullback."
        )
    elif score <= 40:
        side = "REDUCE / HEDGE"
        target_entry = round(cur_price, 2)
        take_profit = round(cur_price * 0.92, 2)
        stop_loss = round(cur_price * 1.04, 2)
        rationale = "Behavioral distribution and elevated positioning risk warrant defensive hedging or profit-taking."
    else:
        side = "RANGE ACCUMULATE"
        target_entry = round(cur_price * 0.985, 2)
        take_profit = round(cur_price * 1.045, 2)
        stop_loss = round(cur_price * 0.96, 2)
        rationale = "Asset is in consolidation. Scaled limit entries near cost-basis support provide balanced risk."

    return {
        "strategy_name": f"{asset} Behavioral Momentum Strategy",
        "asset": asset,
        "action_side": side,
        "target_entry_price": target_entry,
        "take_profit_price": take_profit,
        "stop_loss_price": stop_loss,
        "risk_reward_ratio": 2.4,
        "time_horizon": "24h - 72h",
        "rationale": rationale,
        "risks": [
            analysis.risk.primary_risk_factor,
            f"Short-term holder cohort ratio: {analysis.holding_time.short_term_holder_percent}%"
        ]
    }


@tool_registry.register(
    name="preview_trade_order",
    description="Create a non-custodial trade preview with estimated slippage and safety token.",
    permission_level="SENSITIVE_ACTION"
)
async def preview_trade_order(asset: str, side: str, amount: float) -> dict:
    preview = await trading_executor.preview_order(asset=asset, side=side, amount=amount)
    return preview.model_dump()


@tool_registry.register(
    name="execute_swap_order",
    description="Execute a decentralized token swap between pairs (e.g. BNB to BTC) with live pricing, fee calculation, and safety limits.",
    permission_level="SENSITIVE_ACTION"
)
async def execute_swap_order(
    from_asset: str,
    to_asset: str,
    amount: float,
    slippage_tolerance: float = 0.5,
    wallet_address: str = "Connected Web3 Wallet"
) -> dict:
    result = await trading_executor.execute_swap(
        from_asset=from_asset,
        to_asset=to_asset,
        amount=amount,
        slippage_tolerance=slippage_tolerance,
        wallet_address=wallet_address
    )
    return result

