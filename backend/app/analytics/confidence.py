from typing import List, Dict, Any


class ConfidenceEngine:
    """Calculates grounded confidence values (0.0 to 1.0) with explicit empirical penalties."""

    def compute_overall_confidence(
        self,
        klines_count: int,
        has_depth: bool,
        has_onchain: bool,
        has_anomalies: bool,
        divergence_detected: bool,
        provenances: List[Any]
    ) -> float:
        # Base maximum confidence
        base_confidence = 1.0

        penalties = 0.0

        # Penalty 1: Sample size insufficiency (less than 24 hours of hourly bars)
        if klines_count < 24:
            penalties += 0.15
        elif klines_count < 48:
            penalties += 0.05

        # Penalty 2: Order book depth missing or simulated
        if not has_depth:
            penalties += 0.12

        # Penalty 3: On-chain data availability
        if not has_onchain:
            penalties += 0.20

        # Penalty 4: Directional disagreement (divergence)
        if divergence_detected:
            penalties += 0.08  # Conflicting signals reduce certainty of continuation

        # Penalty 5: Low confidence in sub-module provenances
        sub_confidences = [getattr(p, "confidence", 1.0) for p in provenances if p]
        if sub_confidences:
            avg_sub = sum(sub_confidences) / len(sub_confidences)
            if avg_sub < 0.90:
                penalties += (0.90 - avg_sub) * 0.5

        final_conf = max(0.40, min(0.98, base_confidence - penalties))
        return round(final_conf, 2)
