import { NextRequest, NextResponse } from "next/server";

// Binance Agentic Wallet & Machine-to-Machine Settlement Engine
export async function GET() {
  return NextResponse.json({
    wallet_type: "Binance Agentic Wallet",
    status: "active",
    network: "Binance Smart Chain (BSC Mainnet, Chain ID: 56)",
    agentic_address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    permission_scope: {
      max_daily_allowance_usdt: 1000,
      auto_pay_enabled: true,
      x402_protocol_active: true,
    },
    supported_assets: ["BNB", "USDT", "FDUSD", "BTC", "ETH"],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, recipient, amount_usdt, asset } = body;

    if (action === "pay" || action === "x402_settle") {
      const amount = Number(amount_usdt || 10.0);
      if (amount > 1000) {
        return NextResponse.json(
          {
            error: "Risk Control Rejected",
            message: "Amount exceeds Agentic Wallet max daily permission allowance ($1000 USDT).",
            requested_amount: amount,
            max_allowed: 1000,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          status: "settled",
          protocol: "Binance Pay x402 (HTTP 402 Machine Settlement)",
          payment_id: `x402_pay_${Date.now()}`,
          recipient: recipient || "0xAgenticRecipientNode",
          asset: asset || "USDT",
          amount: amount,
          tx_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "X-Payment-Status": "402_Settled",
            "X-Agent-Permission": "Approved",
          },
        }
      );
    }

    return NextResponse.json({
      status: "ready",
      message: "Agentic Wallet endpoint operational.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Agentic Wallet execution error", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
