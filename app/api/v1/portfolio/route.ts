import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({
      total_portfolio_usd: 0,
      unrealized_pnl_usd: 0,
      balances: [],
    });
  }

  try {
    // 1. Fetch real on-chain native balance for the connected address on BSC
    const rpcRes = await fetch("https://binance.llamarpc.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
      cache: "no-store",
    });

    const rpcData = await rpcRes.json();
    const balanceWei = BigInt(rpcData?.result || "0x0");
    const bnbAmount = Number(balanceWei) / 1e18;

    // 2. Fetch live real-time BNB price from Binance API
    let bnbPrice = 650;
    try {
      const pRes = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT", {
        cache: "no-store",
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        bnbPrice = parseFloat(pData.price) || 650;
      }
    } catch {
      // Keep price default if Binance fails
    }

    const totalPortfolioUsd = bnbAmount * bnbPrice;

    return NextResponse.json({
      total_portfolio_usd: totalPortfolioUsd,
      unrealized_pnl_usd: 0,
      balances:
        bnbAmount > 0
          ? [
              {
                asset: "BNB",
                amount: bnbAmount,
                price_usd: bnbPrice,
                value_usd: totalPortfolioUsd,
                current_allocation_pct: 100,
              },
            ]
          : [],
    });
  } catch {
    return NextResponse.json({
      total_portfolio_usd: 0,
      unrealized_pnl_usd: 0,
      balances: [],
    });
  }
}
