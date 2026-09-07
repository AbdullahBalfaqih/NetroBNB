import { NextRequest, NextResponse } from "next/server";

// Binance Agent OS Skill Hub Library
export interface AgentSkill {
  id: string;
  name: string;
  name_ar: string;
  category: "analytics" | "trading" | "yield" | "payments";
  description: string;
  is_enabled: boolean;
  mcp_tool_ref: string;
}

const AGENT_SKILLS_HUB: AgentSkill[] = [
  {
    id: "whale_telemetry_tracker",
    name: "Whale Telemetry Tracker",
    name_ar: "مُتتبع حركة الحيتان",
    category: "analytics",
    description: "Monitors on-chain whale wallets and alerts when transactions exceed $100k USD.",
    is_enabled: true,
    mcp_tool_ref: "binance_read_market",
  },
  {
    id: "yield_optimizer_bsc",
    name: "BSC Yield Optimizer",
    name_ar: "محسّن عوائد السلسلة",
    category: "yield",
    description: "Scans PancakeSwap, Venus, and Binance Staking for maximum yield APYs on BSC.",
    is_enabled: true,
    mcp_tool_ref: "binance_onchain_web3",
  },
  {
    id: "dca_automator",
    name: "DCA Strategy Automator",
    name_ar: "مُحرك الاستثمار التراكمي",
    category: "trading",
    description: "Executes automated dollar-cost averaging trades based on time interval triggers.",
    is_enabled: true,
    mcp_tool_ref: "binance_agentic_trade",
  },
  {
    id: "arbitrage_finder",
    name: "Cross-DEX Arbitrage Finder",
    name_ar: "مكتشف الفروق السعرية (الأربتراج)",
    category: "trading",
    description: "Identifies instant price discrepancies between Binance Spot and BSC DEX liquidity pools.",
    is_enabled: true,
    mcp_tool_ref: "binance_read_market",
  },
  {
    id: "x402_agent_payments",
    name: "Binance Pay x402 Micropayments",
    name_ar: "مدفوعات الآلات الفورية (x402)",
    category: "payments",
    description: "Enables machine-to-machine HTTP 402 micro-settlements between autonomous agents.",
    is_enabled: true,
    mcp_tool_ref: "binance_pay_x402",
  },
];

export async function GET() {
  return NextResponse.json({
    status: "success",
    hub_name: "Binance Agent OS Skill Hub",
    total_skills: AGENT_SKILLS_HUB.length,
    skills: AGENT_SKILLS_HUB,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { skill_id, action } = body;

    const skill = AGENT_SKILLS_HUB.find((s) => s.id === skill_id);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found", requested_skill: skill_id }, { status: 404 });
    }

    if (action === "toggle") {
      skill.is_enabled = !skill.is_enabled;
    } else if (action === "enable") {
      skill.is_enabled = true;
    } else if (action === "disable") {
      skill.is_enabled = false;
    }

    return NextResponse.json({
      status: "success",
      message: `Skill '${skill.name}' updated successfully.`,
      skill,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Skill Hub error", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
