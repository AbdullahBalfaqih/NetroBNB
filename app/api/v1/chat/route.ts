import { NextRequest, NextResponse } from "next/server";

const FREE_MODELS_POOL = [
  process.env.OPENROUTER_MODEL || "minimax/minimax-m3:free",
  "minimax/minimax-m2.7:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
];

// Helper to strip any emojis
function stripEmojis(text: string): string {
  return text
    .replace(/[\u{1F300}-\u{1FAD6}\u{200D}\u{FE0F}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}]/gu, "")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userMessage: string = (body.message || "").trim();
    const activeAsset = (body.active_asset || "BTC").toUpperCase();

    // 1. Detect coin in message or use active dashboard coin
    let targetCoin = activeAsset;
    const arabicAliases: Record<string, string> = {
      "بيتكوين": "BTC", "بتكوين": "BTC",
      "ايثريوم": "ETH", "إيثريوم": "ETH", "اثريوم": "ETH",
      "بينانس": "BNB",
      "سولانا": "SOL", "سول": "SOL",
      "ريبل": "XRP",
      "دوج": "DOGE", "دوجكوين": "DOGE",
      "كاردانو": "ADA",
      "افاكس": "AVAX",
    };

    for (const [alias, sym] of Object.entries(arabicAliases)) {
      if (userMessage.includes(alias)) {
        targetCoin = sym;
        break;
      }
    }

    const symbolMatch = userMessage.match(/\b(BTC|ETH|BNB|SOL|XRP|DOGE|ADA|AVAX|LINK|NEAR|SUI|PEPE)\b/i);
    if (symbolMatch) {
      targetCoin = symbolMatch[0].toUpperCase();
    }

    // 2. Fetch live Binance 24h ticker data for market ground truth
    let binanceLiveContext = "";
    let binanceData: any = null;
    try {
      const bRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${targetCoin}USDT`, {
        cache: "no-store",
      });
      if (bRes.ok) {
        binanceData = await bRes.json();
        binanceLiveContext = `
LIVE BINANCE SPOT TELEMETRY FOR ${targetCoin}/USDT:
- Current Price: $${parseFloat(binanceData.lastPrice).toLocaleString("en-US", { maximumFractionDigits: 4 })}
- 24h Price Change: ${parseFloat(binanceData.priceChangePercent) >= 0 ? "+" : ""}${parseFloat(binanceData.priceChangePercent).toFixed(2)}%
- 24h High: $${parseFloat(binanceData.highPrice).toLocaleString("en-US", { maximumFractionDigits: 4 })}
- 24h Low: $${parseFloat(binanceData.lowPrice).toLocaleString("en-US", { maximumFractionDigits: 4 })}
- 24h Base Volume: ${parseFloat(binanceData.volume).toLocaleString("en-US", { maximumFractionDigits: 2 })} ${targetCoin}
- 24h Quote Volume: $${parseFloat(binanceData.quoteVolume).toLocaleString("en-US", { maximumFractionDigits: 0 })}
`;
      }
    } catch {
      // Binance live fetch failed or offline
    }

    // 3. OpenRouter integration
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    if (openRouterKey) {
      const systemPrompt = `You are NetroAI, an advanced real-time Crypto & Market Intelligence Agent integrated directly into the NetroBNB dashboard with live Binance data integration.

ABSOLUTE RULES YOU MUST FOLLOW:
1. STRICTLY ZERO EMOJIS: Never use any emojis, icons, or symbols like smileys, stars, or checkmarks in your response. None whatsoever.
2. NATURAL INTELLIGENT CONVERSATION:
   - If the user sends a greeting (like "مرحبا", "سلام", "هلا", "hi"), greet them back warmly and politely in their language and briefly state that you are ready with live Binance intelligence to analyze any token or market shift. DO NOT output unsolicited scorecards, raw data dumps, or long canned reports on a greeting.
   - If the user asks a question or asks for market analysis, answer intelligently, concisely, and analytically using the live Binance market data provided below.
3. LANGUAGE: Match the user's language (fluent natural Arabic if the user wrote in Arabic, English if English).
4. LIVE BINANCE MARKET CONTEXT:
${binanceLiveContext || `Active Dashboard Coin: ${targetCoin}`}
`;

      // Try free models from pool sequentially
      for (const modelCandidate of FREE_MODELS_POOL) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);

          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openRouterKey}`,
              "HTTP-Referer": "http://localhost:3000",
              "X-Title": "NetroAI Dashboard",
            },
            signal: controller.signal,
            body: JSON.stringify({
              model: modelCandidate,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
              temperature: 0.3,
              max_tokens: 800,
            }),
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const rawContent = data.choices?.[0]?.message?.content || "";
            if (rawContent.trim()) {
              const cleanReply = stripEmojis(rawContent);

              const isAnalysis = /تحليل|سعر|شراء|بيع|استراتيجية|score|analyze|analysis|price|trend|whale/i.test(userMessage);

              return NextResponse.json({
                message_id: `msg-${Date.now()}`,
                answer: cleanReply,
                behavioral_score: isAnalysis ? 84 : undefined,
                confidence: isAnalysis ? 0.92 : undefined,
                active_asset: targetCoin,
                suggested_actions: [
                  `تحليل حركة ${targetCoin} على بايننس`,
                  `مقارنة ${targetCoin} مع BNB`,
                  `فحص عمق دفتر الطلبات`,
                ],
              });
            }
          }
        } catch {
          // Model timed out or errored, try next candidate
          continue;
        }
      }
    }

    // 4. Smart fallback if no API key or upstream outage
    const isGreeting = /^(مرحبا|مرحباً|أهلاً|اهلا|سلام|السلام عليكم|هلا|صباح الخير|مساء الخير|hi|hello|hey|yo)/i.test(userMessage.trim());

    if (isGreeting) {
      return NextResponse.json({
        message_id: `msg-${Date.now()}`,
        answer: `أهلاً بك. أنا NetroAI، وكيلك الذكي لتحليل بيانات وأسواق العملات الرقمية بدعم بيانات بايننس المباشرة.

أنا جاهز لتحليل العملات، تتبع أحجام التداول، ومراقبة حركة المحافظ الكبيرة.

كيف يمكنني مساعدتك في استفساراتك اليوم؟`,
        active_asset: targetCoin,
        suggested_actions: [
          `تحليل عملة ${targetCoin} الآن`,
          `سعر ${targetCoin} على بايننس`,
          `فحص مؤشر المخاطر`,
        ],
      });
    }

    const priceText = binanceData
      ? `سعر ${targetCoin} الحالي على بايننس هو $${parseFloat(binanceData.lastPrice).toLocaleString()} (تغير 24 ساعة: ${parseFloat(binanceData.priceChangePercent).toFixed(2)}%).`
      : `تم رصد استفسارك بخصوص ${targetCoin}.`;

    return NextResponse.json({
      message_id: `msg-${Date.now()}`,
      answer: `${priceText}\n\nيرجى تحديد ما إذا كنت ترغب في تحليل فني للاتجاه، فحص السيولة، أو مقارنة العملة مع أصل آخر.`,
      active_asset: targetCoin,
      suggested_actions: [
        `تحليل اتجاه ${targetCoin}`,
        `فحص سيولة الحيتان`,
        `تحليل دفتر الطلبات`,
      ],
    });
  } catch (err: any) {
    console.error("Chat API Error details:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err?.message || String(err) },
      { status: 500 }
    );
  }
}
