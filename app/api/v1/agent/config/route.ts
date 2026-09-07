import { NextRequest, NextResponse } from "next/server";

// Agent Governance & Risk Control Config (In-Memory Engine)
export interface AgentRiskConfig {
  agent_id: string;
  agent_name: string;
  model_name: string;
  auto_execution_enabled: boolean;
  require_user_confirmation: boolean;
  max_daily_trade_usd: number;
  max_single_trade_usd: number;
  daily_used_usd: number;
  stop_loss_pct: number;
  take_profit_pct: number;
  allowed_assets: string[];
  allowed_skills: string[];
}

const DEFAULT_AGENT_CONFIG: AgentRiskConfig = {
  agent_id: "netro_agent_01",
  agent_name: "NetroAI Market Agent",
  model_name: "minimax/minimax-m3:free",
  auto_execution_enabled: true,
  require_user_confirmation: true,
  max_daily_trade_usd: 1000,
  max_single_trade_usd: 250,
  daily_used_usd: 150,
  stop_loss_pct: 3.5,
  take_profit_pct: 7.5,
  allowed_assets: ["BNB", "BTC", "ETH", "SOL", "USDT", "AVAX", "TON"],
  allowed_skills: ["whale_telemetry_tracker", "yield_optimizer_bsc", "dca_automator", "arbitrage_finder", "x402_agent_payments"],
};

let currentConfig = { ...DEFAULT_AGENT_CONFIG };

export async function GET() {
  return NextResponse.json({
    status: "success",
    config: currentConfig,
    risk_assessment: {
      is_within_daily_limit: currentConfig.daily_used_usd < currentConfig.max_daily_trade_usd,
      remaining_daily_allowance_usd: currentConfig.max_daily_trade_usd - currentConfig.daily_used_usd,
      governance_status: "ACTIVE_PROTECTED",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    currentConfig = {
      ...currentConfig,
      ...body,
      // Ensure daily_used doesn't get wiped accidentally unless explicitly reset
      daily_used_usd: body.daily_used_usd !== undefined ? body.daily_used_usd : currentConfig.daily_used_usd,
    };

    return NextResponse.json({
      status: "success",
      message: "Agent Governance & Risk Settings updated successfully.",
      config: currentConfig,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to update Agent Governance Config", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
