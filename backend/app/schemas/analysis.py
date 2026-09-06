from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.schemas.common import Provenance


class AcquisitionVelocity(BaseModel):
    amount_acquired_24h: float
    frequency_per_hour: float
    acceleration_percent: float
    breakdown_1h: float
    breakdown_3h: float
    breakdown_6h: float
    breakdown_12h: float
    breakdown_24h: float
    baseline_multiple: float
    provenance: Provenance


class HoldingTimeIntelligence(BaseModel):
    buckets: Dict[str, float] = Field(
        ...,
        description="Percentage in buckets: <1h, 1h-3h, 3h-6h, 6h-12h, 12h-24h, 1d-7d, 7d-30d, 30d-90d, 90d+"
    )
    average_holding_duration_days: float
    median_holding_duration_days: float
    short_term_holder_percent: float
    long_term_holder_percent: float
    holding_time_shift_percent: float
    provenance: Provenance


class CostBasisIntelligence(BaseModel):
    weighted_avg_acquisition_price: float
    cost_basis_concentration_zone: str
    unrealized_pnl_percent: float
    break_even_level: float
    recent_buyer_cost_basis: float
    significant_acquisition_levels: List[float]
    provenance: Provenance


class HolderConcentration(BaseModel):
    top_10_percent: float
    top_50_percent: float
    top_100_percent: float
    whale_threshold_usd: float = 1_000_000.0
    whale_count: int
    whale_net_flow_24h: float
    large_holder_behavior: str  # 'ACCUMULATION', 'DISTRIBUTION', 'NEUTRAL'
    retail_ratio: float
    provenance: Provenance


class AccumulationDistributionModel(BaseModel):
    accumulation_score: float = Field(..., ge=0.0, le=100.0)
    distribution_score: float = Field(..., ge=0.0, le=100.0)
    net_flow_pressure: str  # 'STRONG_ACCUMULATION', 'MODERATE_ACCUMULATION', 'NEUTRAL', 'MODERATE_DISTRIBUTION', 'STRONG_DISTRIBUTION'
    net_flow_usd: float
    inflow_volume_usd: float
    outflow_volume_usd: float
    confidence: float
    provenance: Provenance


class DormancyReactivation(BaseModel):
    dormant_supply_total: float
    reactivated_supply_24h: float
    reactivation_velocity_change_percent: float
    reactivation_ratio: float
    inferred_intent_caveat: str = "Observed movement only. Does not guarantee exchange dump or sale."
    provenance: Provenance


class RealizedPnL(BaseModel):
    realized_profit_usd: float
    realized_loss_usd: float
    profit_loss_ratio: float
    profitable_transfers_percent: float
    behavioral_state: str  # 'PROFIT_TAKING', 'CAPITULATION', 'ACCUMULATION', 'REDISTRIBUTION'
    selling_context: str   # 'SELLING_INTO_STRENGTH', 'SELLING_INTO_WEAKNESS', 'HOLDING_FIRM'
    provenance: Provenance


class LiquidityIntelligence(BaseModel):
    bid_depth_2pct_usd: float
    ask_depth_2pct_usd: float
    bid_ask_imbalance: float
    spread_bps: float
    slippage_est_10k_usd_bps: float
    slippage_est_100k_usd_bps: float
    slippage_est_1m_usd_bps: float
    execution_stress_score: float = Field(..., ge=0.0, le=100.0, description="0 is low stress, 100 is severe stress")
    provenance: Provenance


class MomentumFlowDivergence(BaseModel):
    divergence_detected: bool
    divergence_type: Optional[str] = None  # 'BEARISH_DIVERGENCE' (Price UP, Flow DOWN), 'BULLISH_DIVERGENCE' (Price DOWN, Flow UP), 'NONE'
    severity: str  # 'NONE', 'MILD', 'STRONG'
    price_momentum_24h: float
    net_flow_momentum_24h: float
    caveat: str = "Divergence represents analytical friction, not a guaranteed market reversal."
    provenance: Provenance


class AnomalyItem(BaseModel):
    metric: str
    observed_value: float
    baseline_value: float
    z_score: float
    description: str
    severity: str  # 'LOW', 'MEDIUM', 'HIGH', 'EXTREME'


class AnomalyDetection(BaseModel):
    anomalies_detected_count: int
    highest_severity: str
    anomaly_list: List[AnomalyItem]
    provenance: Provenance


class RiskAssessment(BaseModel):
    overall_risk_level: str  # 'LOW', 'MODERATE', 'HIGH', 'ELEVATED'
    short_term_positioning_risk: str
    liquidity_impact_risk: str
    whale_dependency_risk: str
    divergence_risk: str
    primary_risk_factor: str


class BehavioralScoreComponent(BaseModel):
    name: str
    score: float
    weight: float
    contribution: float


class BehavioralScore(BaseModel):
    overall_score: int = Field(..., ge=0, le=100)
    interpretation: str
    components: List[BehavioralScoreComponent]
    formula_explanation: str


class AssetAnalysisRequest(BaseModel):
    asset: str
    timeframe: str = "24h"


class AssetAnalysisResult(BaseModel):
    """The structured intelligence object specified in Section 9."""
    asset: str
    timeframe: str
    market: Dict[str, Any]
    acquisition: AcquisitionVelocity
    holding_time: HoldingTimeIntelligence
    cost_basis: CostBasisIntelligence
    holder_concentration: HolderConcentration
    accumulation_distribution: AccumulationDistributionModel
    dormancy: DormancyReactivation
    realized_pnl: RealizedPnL
    liquidity: LiquidityIntelligence
    momentum: Dict[str, Any]
    divergence: MomentumFlowDivergence
    anomalies: AnomalyDetection
    risk: RiskAssessment
    overall_score: int
    confidence: float
    behavioral_score_breakdown: BehavioralScore
    narrative: str
