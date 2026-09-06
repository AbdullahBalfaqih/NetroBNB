from typing import Optional, List
from sqlalchemy import String, Text, ForeignKey, JSON, Integer, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base, TimestampMixin


class AgentRun(Base, TimestampMixin):
    __tablename__ = "agent_runs"

    conversation_id: Mapped[Optional[str]] = mapped_column(String(36), index=True, nullable=True)
    user_id: Mapped[str] = mapped_column(String(64), default="default_user", index=True)
    asset: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    timeframe: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    intent: Mapped[str] = mapped_column(String(64), default="ANALYSIS")
    status: Mapped[str] = mapped_column(String(32), default="COMPLETED")  # 'PENDING', 'RUNNING', 'COMPLETED', 'FAILED'
    plan_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    tool_calls: Mapped[List["ToolCall"]] = relationship(
        "ToolCall",
        back_populates="agent_run",
        cascade="all, delete-orphan",
        order_by="ToolCall.created_at"
    )


class ToolCall(Base, TimestampMixin):
    __tablename__ = "tool_calls"

    agent_run_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("agent_runs.id", ondelete="CASCADE"), index=True
    )
    tool_name: Mapped[str] = mapped_column(String(64), index=True)
    input_parameters: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    output_result: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="SUCCESS")  # 'SUCCESS', 'ERROR'
    execution_time_ms: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    agent_run: Mapped["AgentRun"] = relationship("AgentRun", back_populates="tool_calls")


class AuditEvent(Base, TimestampMixin):
    __tablename__ = "audit_events"

    user_id: Mapped[str] = mapped_column(String(64), index=True)
    action: Mapped[str] = mapped_column(String(64))  # 'PROPOSE_TRADE', 'CONFIRM_TRADE', 'EXECUTE_TRADE', 'ANALYZE'
    resource: Mapped[str] = mapped_column(String(128))
    details: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
