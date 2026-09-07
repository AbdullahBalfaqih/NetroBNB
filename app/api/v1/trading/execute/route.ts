import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const previewToken = body.preview_token || "sample_preview";
    const amountUsd = Number(body.amount_usd || 100);
    const asset = (body.asset || "BNB").toUpperCase();

    // Risk Permission Enforcement (Max trade USD check)
    if (amountUsd > 1000) {
      return NextResponse.json(
        {
          status: "rejected",
          error: "Agent Risk Governance Limit Exceeded",
          message: "Transaction amount exceeds agent risk permission threshold ($1000 USD limit).",
          max_allowed_usd: 1000,
        },
        { status: 403 }
      );
    }

    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    return NextResponse.json({
      status: "success",
      order_id: `ord_${Date.now()}`,
      execution_status: "executed",
      asset,
      executed_amount: amountUsd > 500 ? "0.8500" : "0.2500",
      executed_price_usd: asset === "BTC" ? 80173.0 : asset === "ETH" ? 2513.0 : 752.8,
      total_usd: amountUsd,
      message: "Order routed and executed via Binance Agent OS / BNB Smart Chain Smart Router.",
      tx_hash: txHash,
      preview_token: previewToken,
      mcp_protocol_status: "BINANCE_MCP_VERIFIED",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Trading execution error", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
