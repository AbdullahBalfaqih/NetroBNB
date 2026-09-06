import asyncio
from typing import Dict, Any, List
from app.providers.base import MarketDataProvider, OnchainDataProvider
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
from app.analytics.behavioral_score import BehavioralScoreModule
from app.analytics.confidence import ConfidenceEngine
from app.schemas.analysis import AssetAnalysisResult, RiskAssessment


class AssetAnalysisEngine:
    """Master analytical orchestrator unifying all 10 deterministic sub-modules."""

    def __init__(self, market_provider: MarketDataProvider, onchain_provider: OnchainDataProvider):
        self.market_provider = market_provider
        self.onchain_provider = onchain_provider

        # Sub-modules
        self.acquisition_mod = AcquisitionVelocityModule()
        self.holding_time_mod = HoldingTimeModule()
        self.cost_basis_mod = CostBasisModule()
        self.holder_mod = HolderConcentrationModule()
        self.accumulation_mod = AccumulationDistributionModule()
        self.dormancy_mod = DormancyReactivationModule()
        self.realized_pnl_mod = RealizedPnLModule()
        self.liquidity_mod = LiquidityModule()
        self.divergence_mod = DivergenceModule()
        self.anomalies_mod = AnomalyDetectionModule()
        self.score_mod = BehavioralScoreModule()
        self.confidence_engine = ConfidenceEngine()

    async def analyze_asset(self, asset: str, timeframe: str = "24h") -> AssetAnalysisResult:
        sym = asset.upper().strip().replace("USDT", "")

        # 1. Concurrently fetch market and on-chain telemetry
        ticker_task = self.market_provider.get_ticker_24h(sym)
        depth_task = self.market_provider.get_order_book(sym, limit=100)
        klines_task = self.market_provider.get_klines(sym, interval="1h", limit=48)
        transfers_task = self.onchain_provider.get_transfers(sym, timeframe=timeframe)
        holders_task = self.onchain_provider.get_holders(sym)
        activity_task = self.onchain_provider.get_holder_activity(sym, timeframe=timeframe)
        metrics_task = self.onchain_provider.get_token_metrics(sym)

        (
            ticker,
            depth,
            klines,
            transfers_data,
            holders_data,
            activity_data,
            token_metrics,
        ) = await asyncio.gather(
            ticker_task,
            depth_task,
            klines_task,
            transfers_task,
            holders_task,
            activity_task,
            metrics_task,
        )

        current_price = ticker.last_price
        price_change_pct = ticker.price_change_percent

        # 2. Execute deterministic analytical modules
        acquisition = self.acquisition_mod.compute(sym, current_price, transfers_data, klines)
        holding_time = self.holding_time_mod.compute(token_metrics)
        cost_basis = self.cost_basis_mod.compute(current_price, klines)
        holder_conc = self.holder_mod.compute(current_price, holders_data, transfers_data)
        accum_dist = self.accumulation_mod.compute(current_price, price_change_pct, klines, holders_data, transfers_data)
        dormancy = self.dormancy_mod.compute(current_price, activity_data)
        realized_pnl = self.realized_pnl_mod.compute(current_price, price_change_pct, transfers_data)
        liquidity = self.liquidity_mod.compute(current_price, depth)
        divergence = self.divergence_mod.compute(
            price_momentum_24h=price_change_pct,
            accumulation_score=accum_dist.accumulation_score,
            distribution_score=accum_dist.distribution_score,
            volume_acceleration=acquisition.acceleration_percent
        )

        # Baseline volume estimate (30-day average)
        vol_current = ticker.volume_quote
        vol_baseline = vol_current / max(1.1, acquisition.baseline_multiple)
        whale_flow_usd = holder_conc.whale_net_flow_24h

        anomalies = self.anomalies_mod.compute(
            volume_current=vol_current,
            volume_baseline=vol_baseline,
            acquisition_multiple=acquisition.baseline_multiple,
            whale_flow_usd=whale_flow_usd,
            spread_bps=depth.spread_bps,
            holding_time_shift_pct=holding_time.holding_time_shift_percent
        )

        # 3. Calculate Explainable Behavioral Score Components
        # Holder stability: lower top-10 concentration = higher stability
        holder_stability_raw = max(20.0, 100.0 - holder_conc.top_10_percent * 1.5)

        # Cost basis health: positive unrealized PnL is healthy
        cost_basis_health = min(95.0, max(15.0, 50.0 + cost_basis.unrealized_pnl_percent * 5.0))

        # Whale score: alignment with accumulation
        whale_score = 88.0 if holder_conc.large_holder_behavior == "ACCUMULATION" else (35.0 if holder_conc.large_holder_behavior == "DISTRIBUTION" else 55.0)

        # Dormancy health: low reactivation ratio = higher stability
        dormancy_score = max(30.0, 90.0 - dormancy.reactivation_velocity_change_percent * 0.4)

        # Realized P/L score: healthy profit/loss ratio
        realized_pnl_score = min(90.0, max(25.0, realized_pnl.profit_loss_ratio * 25.0))

        # Liquidity score: inverse of execution stress
        liquidity_score = max(10.0, 100.0 - liquidity.execution_stress_score)

        # Momentum score: positive 24h change
        momentum_score = min(95.0, max(10.0, 50.0 + price_change_pct * 6.0))

        # Anomaly score: severe anomalies penalize the score
        anomaly_score = max(20.0, 100.0 - (anomalies.anomalies_detected_count * 15.0))

        behavioral_score_obj = self.score_mod.compute(
            accumulation_score=accum_dist.accumulation_score,
            holder_stability_raw=holder_stability_raw,
            cost_basis_health=cost_basis_health,
            whale_score=whale_score,
            dormancy_score=dormancy_score,
            realized_pnl_score=realized_pnl_score,
            liquidity_score=liquidity_score,
            momentum_score=momentum_score,
            anomaly_score=anomaly_score
        )

        overall_score = behavioral_score_obj.overall_score

        # 4. Compute Confidence
        all_provenances = [
            acquisition.provenance,
            holding_time.provenance,
            cost_basis.provenance,
            holder_conc.provenance,
            accum_dist.provenance,
            dormancy.provenance,
            realized_pnl.provenance,
            liquidity.provenance,
            divergence.provenance,
            anomalies.provenance
        ]
        confidence = self.confidence_engine.compute_overall_confidence(
            klines_count=len(klines),
            has_depth=len(depth.bids) > 0,
            has_onchain=True,
            has_anomalies=anomalies.anomalies_detected_count > 0,
            divergence_detected=divergence.divergence_detected,
            provenances=all_provenances
        )

        # 5. Synthesize Risk Assessment
        risk_level = "MODERATE"
        if divergence.divergence_detected and divergence.severity == "STRONG":
            risk_level = "ELEVATED"
        elif overall_score >= 80 and not divergence.divergence_detected:
            risk_level = "LOW"
        elif overall_score <= 40:
            risk_level = "HIGH"

        primary_risk = "Short-term positioning acceleration reduces follow-through certainty."
        if divergence.divergence_detected:
            primary_risk = f"{divergence.divergence_type.replace('_', ' ').title()}: Price momentum contradicts flow absorption."
        elif liquidity.execution_stress_score > 60:
            primary_risk = "Thin order book depth increases slippage risk for large tickets."

        risk = RiskAssessment(
            overall_risk_level=risk_level,
            short_term_positioning_risk="HIGH" if holding_time.short_term_holder_percent > 60 else "LOW",
            liquidity_impact_risk="ELEVATED" if liquidity.execution_stress_score > 50 else "MINIMAL",
            whale_dependency_risk="HIGH" if holder_conc.top_10_percent > 30 else "MODERATE",
            divergence_risk=divergence.severity,
            primary_risk_factor=primary_risk
        )

        # 6. Concise Structured Narrative (Grounded in calculated metrics)
        narrative = (
            f"{sym} currently exhibits a behavioral score of {overall_score}/100 with {int(confidence*100)}% analytical confidence. "
            f"Net accumulation score is {accum_dist.accumulation_score:.0f}/100 with acquisition velocity at "
            f"{acquisition.baseline_multiple:.1f}x baseline. However, median holding duration contracted by "
            f"{abs(holding_time.holding_time_shift_percent):.0f}%, reflecting increased short-term speculative positioning. "
            f"{'A divergence was flagged between momentum and net flow.' if divergence.divergence_detected else 'Price action and orderbook flow remain aligned.'}"
        )

        market_dict = {
            "symbol": sym,
            "last_price": current_price,
            "price_change_percent": price_change_pct,
            "high_price": ticker.high_price,
            "low_price": ticker.low_price,
            "volume_usd": ticker.volume_quote,
            "trades_count": ticker.trades_count
        }

        momentum_dict = {
            "price_change_percent_24h": price_change_pct,
            "volume_surge_multiple": acquisition.baseline_multiple,
            "velocity_acceleration_pct": acquisition.acceleration_percent,
            "trend_strength": "BULLISH" if price_change_pct > 0 else "BEARISH"
        }

        return AssetAnalysisResult(
            asset=sym,
            timeframe=timeframe,
            market=market_dict,
            acquisition=acquisition,
            holding_time=holding_time,
            cost_basis=cost_basis,
            holder_concentration=holder_conc,
            accumulation_distribution=accum_dist,
            dormancy=dormancy,
            realized_pnl=realized_pnl,
            liquidity=liquidity,
            momentum=momentum_dict,
            divergence=divergence,
            anomalies=anomalies,
            risk=risk,
            overall_score=overall_score,
            confidence=confidence,
            behavioral_score_breakdown=behavioral_score_obj,
            narrative=narrative
        )
