import { NextResponse } from "next/server";

export async function GET() {
  let bnbPrice = 648.5;
  let btcPrice = 79934.0;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const [bnbRes, btcRes] = await Promise.all([
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT", {
        signal: controller.signal,
        cache: "no-store",
      }).catch(() => null),
      fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT", {
        signal: controller.signal,
        cache: "no-store",
      }).catch(() => null),
    ]);

    clearTimeout(timeoutId);

    if (bnbRes && bnbRes.ok) {
      const data = await bnbRes.json();
      const p = parseFloat(data.price);
      if (p > 0) bnbPrice = p;
    }

    if (btcRes && btcRes.ok) {
      const data = await btcRes.json();
      const p = parseFloat(data.price);
      if (p > 0) btcPrice = p;
    }
  } catch {
    // Return reliable baseline
  }

  return NextResponse.json({
    BNB: bnbPrice,
    BTC: btcPrice,
  });
}
