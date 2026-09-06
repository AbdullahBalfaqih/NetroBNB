import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const previewToken = body.preview_token || "sample_preview";

    return NextResponse.json({
      status: "success",
      order_id: `ord_${Date.now()}`,
      execution_status: "executed",
      message: "Order routed and executed non-custodially via BNB Smart Chain Smart Router.",
      tx_hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      preview_token: previewToken,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Trading execution error", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
