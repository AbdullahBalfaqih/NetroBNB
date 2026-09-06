import { NextResponse } from "next/server";

export async function GET() {
  let bnbPrice = 752.8;
  let btcPrice = 80180.0;

  // 1. DefiLlama (100% Open Source - no geoblocking on Vercel/AWS)
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 2000);
    const res = await fetch("https://coins.llama.fi/prices/current/coingecko:binancecoin,coingecko:bitcoin", {
      signal: c.signal,
      cache: "no-store",
    });
    clearTimeout(t);
    if (res.ok) {
      const d = await res.json();
      const bnb = d?.coins?.["coingecko:binancecoin"]?.price;
      const btc = d?.coins?.["coingecko:bitcoin"]?.price;
      if (bnb && bnb > 0) bnbPrice = bnb;
      if (btc && btc > 0) btcPrice = btc;
      return NextResponse.json({
        BNB: bnbPrice,
        BTC: btcPrice,
      });
    }
  } catch {}

  // 2. Binance Spot (fallback)
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 2000);
    const [bnbRes, btcRes] = await Promise.all([
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT", { signal: c.signal, cache: "no-store" }),
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", { signal: c.signal, cache: "no-store" }),
    ]);
    clearTimeout(t);

    if (bnbRes.ok) {
      const d = await bnbRes.json();
      if (parseFloat(d.price) > 0) bnbPrice = parseFloat(d.price);
    }
    if (btcRes.ok) {
      const d = await btcRes.json();
      if (parseFloat(d.price) > 0) btcPrice = parseFloat(d.price);
    }
  } catch {}

  return NextResponse.json({
    BNB: bnbPrice,
    BTC: btcPrice,
  });
}
