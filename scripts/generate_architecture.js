const sharp = require('sharp');

async function generateArchitectureDiagram() {
  const width = 1200;
  const height = 640;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#161616" />
        <stop offset="100%" stop-color="#101010" />
      </linearGradient>
      <linearGradient id="activeCardBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#242110" />
        <stop offset="100%" stop-color="#141308" />
      </linearGradient>
      <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#F4D014" />
      </marker>
      <marker id="arrowMuted" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#666666" />
      </marker>
    </defs>

    <!-- Canvas Background -->
    <rect width="${width}" height="${height}" rx="24" fill="#0A0A0A" />
    <rect width="${width - 2}" height="${height - 2}" x="1" y="1" rx="23" fill="none" stroke="#222222" stroke-width="1.5" />

    <!-- Section Header Inside Canvas -->
    <g transform="translate(60, 48)">
      <circle cx="0" cy="0" r="4" fill="#F4D014" />
      <text x="14" y="4" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#F4D014" letter-spacing="1">System Architecture Flow</text>
      <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">End-to-End Agentic Execution Pipeline</text>
    </g>

    <!-- Layer 1: Client & Frontend (Top) -->
    <g transform="translate(60, 115)">
      <rect width="1080" height="76" rx="16" fill="url(#cardBg)" stroke="#262626" stroke-width="1" />
      <rect x="20" y="18" width="8" height="40" rx="4" fill="#F4D014" />
      <text x="44" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="800" fill="#FFFFFF">User Interface &amp; Telemetry Canvas</text>
      <text x="44" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="400" fill="#999999">Next.js 16 &#8226; NetroAI Natural Language Chat &#8226; Wagmi &amp; Reown Web3 Wallet &#8226; Framer Motion</text>
    </g>

    <!-- Arrows Down to Middle Layer -->
    <path d="M 330 191 L 330 235" stroke="#F4D014" stroke-width="2" marker-end="url(#arrow)" />
    <path d="M 870 191 L 870 235" stroke="#F4D014" stroke-width="2" marker-end="url(#arrow)" />

    <!-- Layer 2: Core Intelligence & Orchestration (Middle Split) -->
    <!-- Left: Cognitive LLM Core -->
    <g transform="translate(60, 240)">
      <rect width="525" height="104" rx="16" fill="url(#cardBg)" stroke="#262626" stroke-width="1" />
      <circle cx="32" cy="34" r="5" fill="#F4D014" />
      <text x="48" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">Cognitive Core (OpenRouter)</text>
      <text x="32" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#999999">Multi-turn reasoning &#8226; Financial synthesis</text>
      <text x="32" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#999999">Intent extraction &#8226; Prompt injection defense</text>
    </g>

    <!-- Right: Agent Orchestrator -->
    <g transform="translate(615, 240)">
      <rect width="525" height="104" rx="16" fill="url(#cardBg)" stroke="#262626" stroke-width="1" />
      <circle cx="32" cy="34" r="5" fill="#F4D014" />
      <text x="48" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#FFFFFF">Agent Engine &amp; Planner (FastAPI)</text>
      <text x="32" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#999999">Multi-step execution planner &#8226; Memory service</text>
      <text x="32" y="88" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="400" fill="#999999">9-factor behavioral engine &#8226; Tool router</text>
    </g>

    <!-- Arrows Converging Down to MCP Layer -->
    <path d="M 330 344 L 540 385" stroke="#F4D014" stroke-width="2" marker-end="url(#arrow)" />
    <path d="M 870 344 L 660 385" stroke="#F4D014" stroke-width="2" marker-end="url(#arrow)" />

    <!-- Layer 3: Binance Agent OS MCP Layer (Highlighted) -->
    <g transform="translate(60, 390)">
      <rect width="1080" height="92" rx="16" fill="url(#activeCardBg)" stroke="#F4D014" stroke-width="1.5" stroke-opacity="0.4" />
      <rect x="20" y="24" width="8" height="44" rx="4" fill="#F4D014" />
      <text x="44" y="46" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#F4D014">Binance Agent OS MCP Layer (Model Context Protocol)</text>
      <text x="44" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="500" fill="#D1D5DB">agent.binance.com/mcp/agentic &#8226; get_price &#8226; get_24hr_ticker &#8226; get_orderbook &#8226; get_klines &#8226; Circuit Breaker</text>
    </g>

    <!-- Arrows Down to Final Execution Layer -->
    <path d="M 330 482 L 330 520" stroke="#F4D014" stroke-width="2" marker-end="url(#arrow)" />
    <path d="M 870 482 L 870 520" stroke="#F4D014" stroke-width="2" marker-end="url(#arrow)" />

    <!-- Layer 4: Physical Infrastructure (Bottom Split) -->
    <!-- Left: Binance Spot Engine -->
    <g transform="translate(60, 525)">
      <rect width="525" height="74" rx="14" fill="url(#cardBg)" stroke="#262626" stroke-width="1" />
      <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15.5" font-weight="800" fill="#FFFFFF">Binance Spot Market Infrastructure</text>
      <text x="24" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="400" fill="#888888">Orderbook depth &#8226; Taker orderflow &#8226; 300+ pairs live telemetry</text>
    </g>

    <!-- Right: BNB Smart Chain -->
    <g transform="translate(615, 525)">
      <rect width="525" height="74" rx="14" fill="url(#cardBg)" stroke="#262626" stroke-width="1" />
      <text x="24" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15.5" font-weight="800" fill="#FFFFFF">BNB Smart Chain (BSC) Settlement</text>
      <text x="24" y="56" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="400" fill="#888888">Non-custodial swaps &#8226; Smart route discovery &#8226; Instant settlement</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile('public/architecture-diagram.png');

  console.log('Created public/architecture-diagram.png');
}

generateArchitectureDiagram().catch(console.error);
