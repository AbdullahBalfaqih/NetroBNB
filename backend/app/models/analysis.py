from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base, TimestampMixin


class AnalysisRun(Base, TimestampMixin):
    __tablename__ = "analysis_runs"

    asset: Mapped[str] = mapped_column(String(32), index=True)
    timeframe: Mapped[str] = mapped_column(String(16), default="24h")
    overall_score: Mapped[int] = mapped_column(Integer)
    confidence: Mapped[float] = mapped_column(Float)
    narrative: Mapped[str] = mapped_column(Text)
    full_report_json: Mapped[dict] = mapped_column(JSON)

    metrics: Mapped[List["MetricRecord"]] = relationship(
        "MetricRecord",
        back_populates="analysis_run",
        cascade="all, delete-orphan"
    )

    signals: Mapped[List["SignalRecord"]] = relationship(
        "SignalRecord",
        back_populates="analysis_run",
        cascade="all, delete-orphan"
    )


class MetricRecord(Base, TimestampMixin):
    __tablename__ = "metrics"

    analysis_run_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), index=True
    )
    category: Mapped[str] = mapped_column(String(64))  # 'acquisition', 'holding_time', 'cost_basis', etc.
    metric_name: Mapped[str] = mapped_column(String(64), index=True)
    numeric_value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    string_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=1.0)
    provenance_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    analysis_run: Mapped["AnalysisRun"] = relationship("AnalysisRun", back_populates="metrics")


class SignalRecord(Base, TimestampMixin):
    __tablename__ = "signals"

    analysis_run_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analysis_runs.id", ondelete="CASCADE"), index=True
    )
    signal_type: Mapped[str] = mapped_column(String(64))  # 'ACCUMULATION', 'DIVERGENCE', 'ANOMALY', 'WHALE'
    severity: Mapped[str] = mapped_column(String(20), default="MEDIUM")  # 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    confidence: Mapped[float] = mapped_column(Float, default=0.8)
    supporting_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    analysis_run: Mapped["AnalysisRun"] = relationship("AnalysisRun", back_populates="signals")
