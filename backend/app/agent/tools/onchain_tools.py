from app.agent.tools.registry import tool_registry
from app.providers import onchain_provider


@tool_registry.register(
    name="get_holder_behavior",
    description="Retrieve on-chain holder distribution, top-holder concentration, and whale wallet movements.",
    permission_level="READ_ONLY"
)
async def get_holder_behavior(asset: str) -> dict:
    holders = await onchain_provider.get_holders(asset)
    return holders


@tool_registry.register(
    name="get_dormant_movement",
    description="Retrieve dormant supply (>90 days inactive) status and reactivation velocity.",
    permission_level="READ_ONLY"
)
async def get_dormant_movement(asset: str) -> dict:
    activity = await onchain_provider.get_holder_activity(asset)
    return activity
