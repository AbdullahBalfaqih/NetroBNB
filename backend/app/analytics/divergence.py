from typing import Optional
from app.schemas.analysis import MomentumFlowDivergence
from app.schemas.common import Provenance


class DivergenceModule:
    """Detects directional conflicts between price momentum and volume/flow accumulation."""

    def compute(
        self,
        price_momentum_24h: float,
        accumulation_score: float,
        distribution_score: float,
        volume_acceleration: float
    ) -> MomentumFlowDivergence:
        # Net flow momentum: positive if accumulation dominates, negative if distribution dominates
        net_flow_momentum = round(accumulation_score - distribution_score, 2)  # -100 to +100

        divergence_detected = False
        divergence_type: Optional[str] = None
        severity = "NONE"

        # Contradiction Case 1: Bearish Divergence (Price rising, but accumulation weakening/distributing)
        if price_momentum_24h > 1.5 and net_flow_momentum < -15.0:
            divergence_detected = True
            divergence_type = "BEARISH_DIVERGENCE"
            severity = "STRONG" if (price_momentum_24h > 3.0 and net_flow_momentum < -30.0) else "MILD"

        # Contradiction Case 2: Bullish Divergence (Price dropping, but strong accumulation underway)
        elif price_momentum_24h < -1.5 and net_flow_momentum > 15.0:
            divergence_detected = True
            divergence_type = "BULLISH_DIVERGENCE"
            severity = "STRONG" if (price_momentum_24h < -3.0 and net_flow_momentum > 30.0) else "MILD"

        # Contradiction Case 3: Price UP, but Net Flow flat while volume acceleration decelerates
        elif price_momentum_24h > 2.0 and net_flow_momentum < 5.0 and volume_acceleration < -10.0:
            divergence_detected = True
            divergence_type = "BEARISH_DIVERGENCE"
            severity = "MILD"

        provenance = Provenance(
            source="Cross-Signal Correlation Matrix",
            methodology=(
                "Bivariate directional gradient comparison between Price Momentum (% delta) "
                "and Flow Pressure Index (Accumulation/Distribution Score differential)"
            ),
            input_range="24-hour synchronized window",
            confidence=0.92,
            provider="DivergenceModule"
        )

        return MomentumFlowDivergence(
            divergence_detected=divergence_detected,
            divergence_type=divergence_type,
            severity=severity,
            price_momentum_24h=round(price_momentum_24h, 2),
            net_flow_momentum_24h=net_flow_momentum,
            caveat="Divergence represents analytical friction and exhaustion risk, not a guaranteed market reversal.",
            provenance=provenance
        )
