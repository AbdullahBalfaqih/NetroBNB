const sharp = require('sharp');

async function generateArchitectureDiagram() {
  const width = 1200;
  const height = 690;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgYellow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F9DE38" />
        <stop offset="45%" stop-color="#F4D014" />
        <stop offset="100%" stop-color="#D4AC0D" />
      </linearGradient>
      <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.14" />
      </filter>
    </defs>

    <!-- Canvas Background: Pure Saturated Netro Yellow -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF9C4" stroke-width="2" stroke-opacity="0.8" />

    <!-- Subtle warm radial illumination -->
    <circle cx="980" cy="180" r="280" fill="#FFF176" opacity="0.35" />
    <circle cx="200" cy="520" r="220" fill="#E6BE0A" opacity="0.2" />

    <!-- Section Header (Clean Dark Typography) -->
    <g transform="translate(70, 52)">
      <rect x="0" y="0" width="165" height="26" rx="13" fill="#1C1C1C" fill-opacity="0.09" />
      <text x="14" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1C1C1C" letter-spacing="1">System Architecture</text>
      <text x="0" y="54" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#1C1C1C" letter-spacing="-1">End-to-End Agentic Execution Pipeline</text>
    </g>

    <!-- Layer 1: Client & Frontend (Top Card) -->
    <g transform="translate(70, 130)" filter="url(#cardShadow)">
      <rect width="1060" height="74" rx="16" fill="#181818" />
      <rect x="18" y="18" width="6" height="38" rx="3" fill="#F4D014" />
      <text x="38" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16.5" font-weight="800" fill="#FFFFFF">User Interface &amp; Telemetry Canvas</text>
      <text x="38" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#B3B3B3">Next.js 16 &#8226; NetroAI Natural Language Chat &#8226; Wagmi &amp; Reown Web3 Wallet &#8226; Framer Motion</text>
    </g>

    <!-- Connector 1: Layer 1 to Layer 2 (1 to 2 Tree Bus) -->
    <path d="M 600 204 L 600 228 M 328 228 L 872 228 M 328 228 L 328 248 M 872 228 L 872 248" 
          stroke="#1C1C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <polygon points="328,255 322,243 334,243" fill="#1C1C1C" />
    <polygon points="872,255 866,243 878,243" fill="#1C1C1C" />

    <!-- Layer 2: Core Intelligence (Split Middle) -->
    <!-- Left: Cognitive Core -->
    <g transform="translate(70, 256)" filter="url(#cardShadow)">
      <rect width="515" height="96" rx="16" fill="#181818" />
      <circle cx="28" cy="30" r="4.5" fill="#F4D014" />
      <text x="44" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15.5" font-weight="800" fill="#FFFFFF">Cognitive Core (OpenRouter)</text>
      <text x="28" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="400" fill="#B3B3B3">Multi-turn reasoning &#8226; Financial synthesis</text>
      <text x="28" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="400" fill="#B3B3B3">Intent classification &#8226; Prompt injection defense</text>
    </g>

    <!-- Right: Agent Engine -->
    <g transform="translate(615, 256)" filter="url(#cardShadow)">
      <rect width="515" height="96" rx="16" fill="#181818" />
      <circle cx="28" cy="30" r="4.5" fill="#F4D014" />
      <text x="44" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15.5" font-weight="800" fill="#FFFFFF">Agent Engine &amp; Planner (FastAPI)</text>
      <text x="28" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="400" fill="#B3B3B3">Multi-step execution planner &#8226; Memory service</text>
      <text x="28" y="78" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="400" fill="#B3B3B3">9-factor behavioral engine &#8226; Tool router</text>
    </g>

    <!-- Connector 2: Layer 2 to Layer 3 (2 to 1 Merge Bus) -->
    <path d="M 328 352 L 328 376 M 872 352 L 872 376 M 328 376 L 872 376 M 600 376 L 600 398" 
          stroke="#1C1C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <polygon points="600,405 594,393 606,393" fill="#1C1C1C" />

    <!-- Layer 3: Binance Agent OS MCP Layer (Center Feature Card) -->
    <g transform="translate(70, 406)" filter="url(#cardShadow)">
      <rect width="1060" height="90" rx="16" fill="#111111" stroke="#F4D014" stroke-width="1.5" stroke-opacity="0.6" />
      <rect x="18" y="20" width="6" height="50" rx="3" fill="#F4D014" />
      <text x="38" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17.5" font-weight="900" fill="#F4D014">Binance Agent OS MCP Layer (Model Context Protocol)</text>
      <text x="38" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#D1D5DB">agent.binance.com/mcp/agentic &#8226; get_price &#8226; get_24hr_ticker &#8226; get_orderbook &#8226; get_klines &#8226; Circuit Breaker</text>
    </g>

    <!-- Connector 3: Layer 3 to Layer 4 (1 to 2 Tree Bus) -->
    <path d="M 600 496 L 600 520 M 328 520 L 872 520 M 328 520 L 328 540 M 872 520 L 872 540" 
          stroke="#1C1C1C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <polygon points="328,547 322,535 334,535" fill="#1C1C1C" />
    <polygon points="872,547 866,535 878,535" fill="#1C1C1C" />

    <!-- Layer 4: Infrastructure & Settlement (Split Bottom) -->
    <!-- Left: Binance Spot Engine -->
    <g transform="translate(70, 548)" filter="url(#cardShadow)">
      <rect width="515" height="74" rx="14" fill="#181818" />
      <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#FFFFFF">Binance Spot Market Infrastructure</text>
      <text x="24" y="54" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="400" fill="#999999">Orderbook depth &#8226; Taker orderflow &#8226; 300+ pairs live telemetry</text>
    </g>

    <!-- Right: BNB Smart Chain -->
    <g transform="translate(615, 548)" filter="url(#cardShadow)">
      <rect width="515" height="74" rx="14" fill="#181818" />
      <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#FFFFFF">BNB Smart Chain (BSC) Settlement</text>
      <text x="24" y="54" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="400" fill="#999999">Non-custodial swaps &#8226; Smart route discovery &#8226; Instant settlement</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile('public/architecture-diagram-v2.png');

  console.log('Created public/architecture-diagram-v2.png with structured bus connectors');
}

generateArchitectureDiagram().catch(console.error);
