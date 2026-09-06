from app.agent.tools.registry import tool_registry
from app.providers import portfolio_provider


@tool_registry.register(
    name="get_portfolio_health",
    description="Retrieve user portfolio balances, allocations, and open position P/L.",
    permission_level="READ_ONLY"
)
async def get_portfolio_health(user_id: str = "default_user") -> dict:
    balances = await portfolio_provider.get_balances(user_id)
    positions = await portfolio_provider.get_positions(user_id)
    return {
        "balances": balances,
        "positions": positions
    }


@tool_registry.register(
    name="get_largest_risk",
    description="Diagnose portfolio concentration, downside exposure, and largest risk factor.",
    permission_level="ANALYTICAL"
)
async def get_largest_risk(user_id: str = "default_user") -> dict:
    positions = await portfolio_provider.get_positions(user_id)
    balances = await portfolio_provider.get_balances(user_id)
    max_alloc = max(balances, key=lambda b: b.get("current_allocation_pct", 0)) if balances else None
    return {
        "largest_allocation": max_alloc,
        "primary_risk": f"Portfolio is heavily weighted toward {max_alloc['asset']} ({max_alloc['current_allocation_pct']}%)" if max_alloc else "No exposure",
        "recommendation": "Consider dynamic rebalancing if asset behavioral score weakens."
    }
