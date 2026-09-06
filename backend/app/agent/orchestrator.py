import uuid
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.agent.planner import planner, ExecutionPlan, BINANCE_OS_ROUTE_KEY
from app.agent.tools.registry import tool_registry
from app.agent.llm import llm_synthesizer
from app.agent.binance_os.orchestrator import binance_os_orchestrator
from app.memory.service import memory_service
from app.schemas.chat import ChatResponse, ChatToolExecution
from app.schemas.common import Citation, ActionProposal
from app.schemas.analysis import AssetAnalysisResult
from app.trading.executor import trading_executor
from app.core.security import PromptInjectionDefense
from app.utils.logging import logger


class AgentOrchestrator:
    """Master AI Agent Orchestrator executing the multi-step intelligence loop."""

    async def process_message(
        self,
        user_message: str,
        conversation_id: Optional[str] = None,
        user_id: str = "default_user",
        active_asset: Optional[str] = None,
        timeframe: Optional[str] = "24h"
    ) -> ChatResponse:
        start_time = time.time()
        conv_id = conversation_id or f"conv_{uuid.uuid4().hex[:12]}"
        message_id = f"msg_{uuid.uuid4().hex[:12]}"
        # Shared Binance Agent OS run ID for correlated tracing across this turn
        aos_run_id = f"bos_{uuid.uuid4().hex[:12]}"

        # Security Guardrail: Analyze and sanitize user prompt against adversarial injections
        is_malicious, reason = PromptInjectionDefense.analyze_prompt(user_message)
        if is_malicious:
            logger.warning(f"Intercepted prompt injection attempt from user {user_id}: {reason}")
            return ChatResponse(
                conversation_id=conv_id,
                message_id=message_id,
                answer="🛡️ **Security Alert**: The submitted request violated system security guardrails (adversarial prompt injection pattern detected). This incident has been logged and the execution loop safely neutralized.",
                structured_analysis=None,
                behavioral_score=None,
                confidence=1.0,
                tool_calls=[],
                citations=[],
                suggested_actions=["Analyze BTC market flow", "Analyze BNB behavioral score", "Review portfolio health"],
                proposed_actions=[],
                active_asset="BNB",
                active_timeframe="24h"
            )

        sanitized_message = PromptInjectionDefense.sanitize_text(user_message)

        # 1. Retrieve Short-term & Session Memory
        short_term = await memory_service.get_short_term(conv_id)
        session = await memory_service.get_session(user_id)
        effective_asset = active_asset or short_term.get("active_asset") or session.get("last_analyzed_asset", "SOL")

        # 2. Retrieve Relevant Semantic Memory (supports multi-turn context)
        semantic_memories = await memory_service.search_semantic_memory(user_message, user_id=user_id, limit=3)

        # 3. Intent Classification & Task Planning
        plan: ExecutionPlan = planner.plan(user_message, active_asset=effective_asset)
        logger.info(f"Agent formulated plan for intent '{plan.intent}' on asset '{plan.primary_asset}' ({len(plan.steps)} steps)")

        # 4. Tool Execution Loop
        tool_executions: List[ChatToolExecution] = []
        execution_results: Dict[str, Any] = {}
        full_analysis_obj: Optional[AssetAnalysisResult] = None

        for step in plan.steps:
            t_start = time.time()

            # Strip internal Binance OS routing markers before passing args to tool functions
            clean_args = {
                k: v for k, v in step.arguments.items()
                if k != BINANCE_OS_ROUTE_KEY
            }

            exec_res = await tool_registry.execute(step.tool_name, **clean_args)
            t_dur = round((time.time() - t_start) * 1000, 2)

            # Capture data source provenance from BOS _meta injected by market_tools
            result_data = exec_res.get("result", {})
            bos_meta = {}
            if isinstance(result_data, dict) and "_meta" in result_data:
                bos_meta = result_data.pop("_meta", {})
            data_source = bos_meta.get("source") or exec_res.get("provider", "CUSTOM_ANALYTICS")
            provider = exec_res.get("provider", "CUSTOM_ANALYTICS")

            if exec_res.get("status") == "SUCCESS":
                execution_results[step.tool_name] = result_data
                asset_suffix = clean_args.get("asset")
                if asset_suffix:
                    execution_results[f"{step.tool_name}_{asset_suffix}"] = result_data
                summary = f"Executed {step.tool_name} successfully."
                if step.tool_name == "run_full_asset_analysis":
                    try:
                        parsed_res = AssetAnalysisResult(**result_data)
                        if full_analysis_obj is None or asset_suffix == plan.primary_asset:
                            full_analysis_obj = parsed_res
                        summary = f"Computed 10 analytical modules for {result_data.get('asset', '')}. Score: {parsed_res.overall_score}/100, Confidence: {int(parsed_res.confidence*100)}%."
                    except Exception:
                        pass
                tool_executions.append(ChatToolExecution(
                    tool_name=step.tool_name,
                    parameters=clean_args,
                    result_summary=summary,
                    duration_ms=t_dur,
                    data_source=data_source,
                    provider=provider,
                ))
            else:
                tool_executions.append(ChatToolExecution(
                    tool_name=step.tool_name,
                    parameters=clean_args,
                    result_summary=f"Failed: {exec_res.get('error')}",
                    duration_ms=t_dur,
                    data_source="ERROR",
                    provider=provider,
                ))

        # 5. Reasoning & Response Generation via LLM/Synthesizer
        answer = await llm_synthesizer.synthesize_response(
            intent=plan.intent,
            user_message=user_message,
            execution_results=execution_results,
            memory_context=semantic_memories
        )

        # 6. Generate Citations / Data Provenance
        citations: List[Citation] = []
        if full_analysis_obj:
            citations.append(Citation(
                id="cit_1",
                title="Binance Spot Orderflow",
                source=full_analysis_obj.acquisition.provenance.source,
                detail=f"Taker Buy Volume aggregated over 24h ({full_analysis_obj.acquisition.baseline_multiple:.1f}x baseline)."
            ))
            citations.append(Citation(
                id="cit_2",
                title="On-chain Age Distribution",
                source=full_analysis_obj.holding_time.provenance.source,
                detail=f"Median holding duration {full_analysis_obj.holding_time.median_holding_duration_days:.1f} days ({full_analysis_obj.holding_time.holding_time_shift_percent:+.0f}% shift)."
            ))
            citations.append(Citation(
                id="cit_3",
                title="Whale Ledger Delta",
                source=full_analysis_obj.holder_concentration.provenance.source,
                detail=f"Top 100 concentration: {full_analysis_obj.holder_concentration.top_100_percent}%, Institutional state: {full_analysis_obj.holder_concentration.large_holder_behavior}."
            ))

        # 7. Formulate Suggested Next Actions & Proposed Financial Actions
        suggested_actions = [
            f"Analyze {plan.primary_asset} 7-day trend",
            f"Compare {plan.primary_asset} with ETH",
            "Generate trading strategy",
            "Review portfolio risk"
        ]

        proposed_actions: List[ActionProposal] = []
        if plan.intent in ("STRATEGY_PROPOSAL", "ASSET_ANALYSIS"):
            # Prepare an order preview action token requiring confirmation
            try:
                preview = await trading_executor.preview_order(
                    asset=plan.primary_asset,
                    side="BUY" if (full_analysis_obj and full_analysis_obj.overall_score >= 60) else "SELL",
                    amount=5.0 if plan.primary_asset == "SOL" else 0.1,
                    rationale=f"Automated strategy preview based on {plan.primary_asset} score."
                )
                proposed_actions.append(ActionProposal(
                    action_type="TRADE",
                    title=f"Execute {preview.side} Order for {preview.amount} {preview.asset}",
                    description=f"Estimated Total: ${preview.estimated_total_usd:,.2f} (~${preview.estimated_price_usd:,.2f}/unit) with {preview.estimated_slippage_bps:.1f} bps slippage.",
                    requires_confirmation=True,
                    preview_token=preview.preview_token,
                    payload=preview.model_dump()
                ))
            except Exception as e:
                logger.warning(f"Could not prepare order preview action: {str(e)}")
        elif plan.intent == "EXECUTE_SWAP":
            swap_res = execution_results.get("execute_swap_order", {})
            if swap_res and swap_res.get("status") == "COMPLETED":
                proposed_actions.append(ActionProposal(
                    action_type="SWAP",
                    title=f"Swap {swap_res.get('amount_in')} {swap_res.get('from_asset')} → {swap_res.get('amount_out')} {swap_res.get('to_asset')}",
                    description=f"Transaction confirmed on BSC. TxHash: {swap_res.get('tx_hash', '')[:12]}...",
                    requires_confirmation=False,
                    preview_token=swap_res.get("order_id", ""),
                    payload=swap_res
                ))

        # 8. Update Persistent Memory (supports follow-up queries)
        await memory_service.update_short_term(conv_id, {
            "active_asset": plan.primary_asset,
            "active_timeframe": plan.timeframe,
            "last_analysis_summary": answer[:200],
            "recent_queries": (short_term.get("recent_queries", []) + [user_message])[-5:]
        })
        await memory_service.update_session(user_id, "last_analyzed_asset", plan.primary_asset)

        # Store long-term semantic fact if user expressed interest in strategy or asset
        if "strategy" in user_message.lower() or "prefer" in user_message.lower():
            await memory_service.add_semantic_memory(
                user_id=user_id,
                key=f"interest_{plan.primary_asset.lower()}",
                content=f"User requested tactical strategies for {plan.primary_asset} on {datetime.now(timezone.utc).strftime('%Y-%m-%d')}."
            )

        logger.info(f"Completed agent turn in {round((time.time() - start_time)*1000, 1)} ms (bos_run_id={aos_run_id})")

        return ChatResponse(
            conversation_id=conv_id,
            message_id=message_id,
            answer=answer,
            structured_analysis=full_analysis_obj,
            behavioral_score=full_analysis_obj.overall_score if full_analysis_obj else None,
            confidence=full_analysis_obj.confidence if full_analysis_obj else 0.90,
            tool_calls=tool_executions,
            citations=citations,
            suggested_actions=suggested_actions,
            proposed_actions=proposed_actions,
            active_asset=plan.primary_asset,
            active_timeframe=plan.timeframe
        )


orchestrator = AgentOrchestrator()
