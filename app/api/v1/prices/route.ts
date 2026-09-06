import { NextResponse } from "next/server";

export async function GET() {
  let bnbPrice = 751.5;
  let btcPrice = 77420.0;

  async function fetchPrice(symbol: string): Promise<number | null> {
    const pair = `${symbol}USDT`;
    // 1. Binance Spot
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 2000);
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`, {
        signal: c.signal,
        cache: "no-store",
      });
      clearTimeout(t);
      if (res.ok) {
        const d = await res.json();
        const p = parseFloat(d.price);
        if (p > 0) return p;
      }
    } catch {}

    // 2. Bybit Spot
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 2000);
      const res = await fetch(`https://api.bybit.com/v5/market/tickers?category=spot&symbol=${pair}`, {
        signal: c.signal,
        cache: "no-store",
      });
      clearTimeout(t);
      if (res.ok) {
        const d = await res.json();
        const p = parseFloat(d?.result?.list?.[0]?.lastPrice);
        if (p > 0) return p;
      }
    } catch {}

    // 3. Binance Vision
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 2000);
      const res = await fetch(`https://data-api.binance.vision/api/v3/ticker/price?symbol=${pair}`, {
        signal: c.signal,
        cache: "no-store",
      });
      clearTimeout(t);
      if (res.ok) {
        const d = await res.json();
        const p = parseFloat(d.price);
        if (p > 0) return p;
      }
    } catch {}

    return null;
  }

  try {
    const [liveBnb, liveBtc] = await Promise.all([fetchPrice("BNB"), fetchPrice("BTC")]);
    if (liveBnb) bnbPrice = liveBnb;
    if (liveBtc) btcPrice = liveBtc;
  } catch {}

  return NextResponse.json({
    BNB: bnbPrice,
    BTC: btcPrice,
  });
}
