import pytest
from app.analytics.acquisition import AcquisitionVelocityModule
from app.analytics.holding_time import HoldingTimeModule
from app.analytics.cost_basis import CostBasisModule
from app.analytics.holder import HolderConcentrationModule
from app.analytics.accumulation import AccumulationDistributionModule
from app.analytics.dormancy import DormancyReactivationModule
from app.analytics.realized_pnl import RealizedPnLModule
from app.analytics.liquidity import LiquidityModule
from app.analytics.divergence import DivergenceModule
from app.analytics.anomalies import AnomalyDetectionModule
from app.schemas.market import OrderBookDepth, OrderBookLevel
from app.schemas.common import Provenance


def test_acquisition_velocity():
    mod = AcquisitionVelocityModule()
    dummy_klines = [
        {"taker_buy_base_volume": 1000.0, "trades": 500} for _ in range(30)
    ]
    res = mod.compute("SOL", 180.0, {}, dummy_klines)
    assert res.amount_acquired_24h > 0
    assert res.baseline_multiple >= 1.0
    assert res.frequency_per_hour > 0
    assert res.provenance.source != ""


def test_holding_time_buckets():
    mod = HoldingTimeModule()
    metrics = {
        "holding_time_buckets": {
            "<1h": 10.0, "1h-3h": 15.0, "3h-6h": 15.0, "6h-12h": 10.0,
            "12h-24h": 10.0, "1d-7d": 15.0, "7d-30d": 10.0, "30d-90d": 10.0, "90d+": 5.0
        },
        "average_holding_days": 14.5,
        "median_holding_days": 5.2,
        "short_term_holder_percent": 60.0,
        "long_term_holder_percent": 40.0,
        "holding_time_shift_percent": -20.0
    }
    res = mod.compute(metrics)
    assert res.median_holding_duration_days == 5.2
    assert res.short_term_holder_percent == 60.0
    assert len(res.buckets) == 9


def test_cost_basis_vwap():
    mod = CostBasisModule()
    klines = [
        {"quote_volume": 200.0, "volume": 2.0},  # price = 100
        {"quote_volume": 440.0, "volume": 4.0},  # price = 110
    ]
    res = mod.compute(110.0, klines)
    # Total quote = 640, Total volume = 6 -> VWAP = 106.67
    assert 106.0 < res.weighted_avg_acquisition_price < 107.0
    assert res.break_even_level == res.weighted_avg_acquisition_price
    assert len(res.significant_acquisition_levels) >= 1


def test_holder_concentration_and_whale_threshold():
    mod = HolderConcentrationModule()
    holders_data = {
        "top_10_percent": 32.5,
        "top_50_percent": 50.0,
        "top_100_percent": 61.0,
        "whale_threshold_tokens": 1000.0,
        "whale_holders_count": 50,
        "whale_net_balance_change_24h_tokens": 15000.0,
        "retail_ratio": 0.40
    }
    res = mod.compute(100.0, holders_data, {})
    assert res.whale_threshold_usd == 100_000.0  # 1000 * 100
    assert res.large_holder_behavior == "ACCUMULATION"
    assert res.top_10_percent == 32.5


def test_accumulation_vs_distribution():
    mod = AccumulationDistributionModule()
    klines = [
        {"quote_volume": 1000.0, "taker_buy_quote_volume": 750.0} for _ in range(24)
    ]
    holders_data = {"whale_net_balance_change_24h_tokens": 10000.0}
    res = mod.compute(100.0, 5.0, klines, holders_data, {})
    assert res.accumulation_score > 60.0
    assert res.distribution_score < 40.0
    assert "ACCUMULATION" in res.net_flow_pressure


def test_dormancy_reactivation():
    mod = DormancyReactivationModule()
    activity = {
        "dormant_total_tokens": 1_000_000.0,
        "reactivated_supply_tokens": 10_000.0
    }
    res = mod.compute(100.0, activity)
    assert res.reactivation_ratio == 0.01
    assert "Observed on-chain movement only" in res.inferred_intent_caveat


def test_realized_pnl():
    mod = RealizedPnLModule()
    res_up = mod.compute(100.0, 4.5, {"transfer_volume_tokens": 1000.0})
    assert res_up.behavioral_state in ("PROFIT_TAKING", "ACCUMULATION")
    assert res_up.selling_context == "SELLING_INTO_STRENGTH"

    res_down = mod.compute(100.0, -6.0, {"transfer_volume_tokens": 1000.0})
    assert res_down.behavioral_state in ("CAPITULATION", "REDISTRIBUTION")
    assert res_down.selling_context == "SELLING_INTO_WEAKNESS"


def test_liquidity_depth_and_slippage():
    mod = LiquidityModule()
    bids = [OrderBookLevel(price=100.0 - i, quantity=100.0) for i in range(1, 11)]
    asks = [OrderBookLevel(price=100.0 + i, quantity=100.0) for i in range(1, 11)]
    depth = OrderBookDepth(
        symbol="SOL",
        bids=bids,
        asks=asks,
        bid_depth_usd=50000.0,
        ask_depth_usd=50000.0,
        bid_ask_imbalance=0.0,
        spread_usd=2.0,
        spread_bps=20.0,
        provenance=Provenance(source="test", methodology="test", provider="test")
    )
    res = mod.compute(100.0, depth)
    assert res.slippage_est_10k_usd_bps > 0
    assert 0 <= res.execution_stress_score <= 100


def test_momentum_flow_divergence():
    mod = DivergenceModule()
    # Price rising (+4%), but distribution dominating (accumulation score 30, distribution 70)
    res = mod.compute(
        price_momentum_24h=4.0,
        accumulation_score=30.0,
        distribution_score=70.0,
        volume_acceleration=-5.0
    )
    assert res.divergence_detected is True
    assert res.divergence_type == "BEARISH_DIVERGENCE"

    # Price dropping (-4%), but strong accumulation (score 80)
    res_bull = mod.compute(
        price_momentum_24h=-4.0,
        accumulation_score=80.0,
        distribution_score=20.0,
        volume_acceleration=10.0
    )
    assert res_bull.divergence_detected is True
    assert res_bull.divergence_type == "BULLISH_DIVERGENCE"


def test_anomaly_detection():
    mod = AnomalyDetectionModule()
    res = mod.compute(
        volume_current=350_000_000.0,
        volume_baseline=100_000_000.0,  # 3.5x normal!
        acquisition_multiple=3.4,
        whale_flow_usd=12_000_000.0,
        spread_bps=18.0,
        holding_time_shift_pct=-36.0
    )
    assert res.anomalies_detected_count >= 3
    assert res.highest_severity in ("HIGH", "EXTREME")
