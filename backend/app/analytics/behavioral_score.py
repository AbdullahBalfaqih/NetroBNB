from typing import List
from app.schemas.analysis import BehavioralScore, BehavioralScoreComponent


class BehavioralScoreModule:
    """Calculates a transparent, explainable 0-100 composite behavioral intelligence score.

    Component Weights:
    1. Accumulation (15%): Direct aggressive spot and whale accumulation pressure
    2. Holder Stability (15%): Low concentration risk and balanced long-term holder base
    3. Cost Basis (10%): Health of recent buyer unrealized P/L and break-even positioning
    4. Whale Alignment (10%): Large-holder institutional net inflow and positioning
    5. Dormancy (10%): Controlled dormancy without sudden disruptive reactivation spikes
    6. Realized P/L (10%): Organic profit-taking absorption without capitulatory selling
    7. Liquidity (10%): Deep 2% book depth and low execution slippage
    8. Momentum (10%): Consistent 24h positive price trend and volume support
    9. Anomaly Health (10%): Orderly market mechanics without severe dislocation
    Total: 100%
    """

    WEIGHTS = {
        "Accumulation": 0.15,
        "Holder Stability": 0.15,
        "Cost Basis": 0.10,
        "Whale Activity": 0.10,
        "Dormancy": 0.10,
        "Realized P/L": 0.10,
        "Liquidity": 0.10,
        "Momentum": 0.10,
        "Anomaly": 0.10,
    }

    def compute(
        self,
        accumulation_score: float,
        holder_stability_raw: float,
        cost_basis_health: float,
        whale_score: float,
        dormancy_score: float,
        realized_pnl_score: float,
        liquidity_score: float,
        momentum_score: float,
        anomaly_score: float
    ) -> BehavioralScore:
        raw_components = [
            ("Accumulation", min(100.0, max(0.0, accumulation_score))),
            ("Holder Stability", min(100.0, max(0.0, holder_stability_raw))),
            ("Cost Basis", min(100.0, max(0.0, cost_basis_health))),
            ("Whale Activity", min(100.0, max(0.0, whale_score))),
            ("Dormancy", min(100.0, max(0.0, dormancy_score))),
            ("Realized P/L", min(100.0, max(0.0, realized_pnl_score))),
            ("Liquidity", min(100.0, max(0.0, liquidity_score))),
            ("Momentum", min(100.0, max(0.0, momentum_score))),
            ("Anomaly", min(100.0, max(0.0, anomaly_score))),
        ]

        components: List[BehavioralScoreComponent] = []
        total_weighted = 0.0

        for name, score in raw_components:
            weight = self.WEIGHTS.get(name, 0.10)
            contribution = round(score * weight, 2)
            total_weighted += contribution
            components.append(BehavioralScoreComponent(
                name=name,
                score=round(score, 1),
                weight=weight,
                contribution=contribution
            ))

        final_score = int(round(total_weighted))
        final_score = min(100, max(0, final_score))

        if final_score >= 80:
            interpretation = "Aggressive Bullish Behavioral Setup: Strong accumulation and deep liquidity align with low distribution friction."
        elif final_score >= 65:
            interpretation = "Positive Constructive Accumulation: Solid spot demand, though moderate short-term positioning warrants monitoring."
        elif final_score >= 45:
            interpretation = "Neutral / Rotational Equilibrium: Inflows and outflows are balanced with no definitive directional breakout bias."
        elif final_score >= 30:
            interpretation = "Defensive / Mild Distribution: Heightened selling into rallies and thinning book depth increase downside sensitivity."
        else:
            interpretation = "Severe Distribution / High Fragility: Outflows, whale selling, or extreme anomalies dominate the current structure."

        formula_text = (
            "Composite Score = 0.15*(Accumulation) + 0.15*(HolderStability) + 0.10*(CostBasis) + "
            "0.10*(WhaleActivity) + 0.10*(Dormancy) + 0.10*(RealizedPnL) + 0.10*(Liquidity) + "
            "0.10*(Momentum) + 0.10*(Anomaly)"
        )

        return BehavioralScore(
            overall_score=final_score,
            interpretation=interpretation,
            components=components,
            formula_explanation=formula_text
        )
