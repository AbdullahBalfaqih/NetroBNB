import pytest
from app.analytics.behavioral_score import BehavioralScoreModule
from app.analytics.confidence import ConfidenceEngine
from app.schemas.common import Provenance


def test_behavioral_score_weights_and_bounds():
    mod = BehavioralScoreModule()
    # Test perfect conditions
    res_high = mod.compute(
        accumulation_score=95.0,
        holder_stability_raw=90.0,
        cost_basis_health=85.0,
        whale_score=90.0,
        dormancy_score=85.0,
        realized_pnl_score=80.0,
        liquidity_score=90.0,
        momentum_score=90.0,
        anomaly_score=95.0
    )
    assert 85 <= res_high.overall_score <= 100
    assert len(res_high.components) == 9
    assert sum(c.weight for c in res_high.components) == pytest.approx(1.0, 0.001)

    # Test severely distressed conditions
    res_low = mod.compute(
        accumulation_score=15.0,
        holder_stability_raw=20.0,
        cost_basis_health=20.0,
        whale_score=15.0,
        dormancy_score=25.0,
        realized_pnl_score=20.0,
        liquidity_score=15.0,
        momentum_score=10.0,
        anomaly_score=10.0
    )
    assert 0 <= res_low.overall_score <= 25


def test_confidence_engine_penalties():
    engine = ConfidenceEngine()
    prov = Provenance(source="test", methodology="test", provider="test", confidence=0.95)

    # Perfect data completeness
    conf_ideal = engine.compute_overall_confidence(
        klines_count=48,
        has_depth=True,
        has_onchain=True,
        has_anomalies=False,
        divergence_detected=False,
        provenances=[prov]
    )
    assert conf_ideal >= 0.95

    # Missing depth, divergence, and low klines sample
    conf_penalized = engine.compute_overall_confidence(
        klines_count=10,
        has_depth=False,
        has_onchain=True,
        has_anomalies=True,
        divergence_detected=True,
        provenances=[prov]
    )
    assert conf_penalized < conf_ideal
    assert conf_penalized >= 0.40
