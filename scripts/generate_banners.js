const sharp = require('sharp');
const fs = require('fs');

const width = 1200;
const height = 480;

// Shared Yellow Palette
const yellowDefs = `
  <defs>
    <linearGradient id="bgYellow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7D828" />
      <stop offset="55%" stop-color="#F4D014" />
      <stop offset="100%" stop-color="#D4AC0D" />
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.18" />
    </filter>
  </defs>
`;

async function generateHeroHeader() {
  const hWidth = 1200;
  const hHeight = 360;

  const svg = `
  <svg width="${hWidth}" height="${hHeight}" viewBox="0 0 ${hWidth} ${hHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0A0A0A" />
        <stop offset="50%" stop-color="#050505" />
        <stop offset="100%" stop-color="#000000" />
      </linearGradient>
      <radialGradient id="heroGoldGlow" cx="50%" cy="35%" r="55%">
        <stop offset="0%" stop-color="#F4D014" stop-opacity="0.25" />
        <stop offset="60%" stop-color="#F4D014" stop-opacity="0.05" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="60%" stop-color="#FFF089" />
        <stop offset="100%" stop-color="#F4D014" />
      </linearGradient>
    </defs>
    
    <rect width="${hWidth}" height="${hHeight}" rx="28" fill="url(#heroBg)" />
    <rect width="${hWidth}" height="${hHeight}" rx="28" fill="url(#heroGoldGlow)" />
    <rect width="${hWidth - 4}" height="${hHeight - 4}" x="2" y="2" rx="26" fill="none" stroke="#F4D014" stroke-width="1.5" stroke-opacity="0.3" />
    
    <!-- Badges Top -->
    <g transform="translate(600, 70)">
      <rect x="-140" y="-14" width="280" height="28" rx="14" fill="#1C1C1C" stroke="#F4D014" stroke-width="1" stroke-opacity="0.4" />
      <text x="0" y="5" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#F4D014" letter-spacing="1.5">BINANCE AGENT OS &#8226; TRACK A</text>
    </g>
    
    <!-- Main Title -->
    <text x="600" y="170" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="900" fill="url(#goldTextGrad)" letter-spacing="-1.5">NetroBNB</text>
    
    <!-- Subtitle -->
    <text x="600" y="220" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="600" fill="#FFFFFF" letter-spacing="-0.3">
      Autonomous AI Asset Intelligence &amp; Trading Agent
    </text>
    
    <!-- Description -->
    <text x="600" y="260" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#9CA3AF" letter-spacing="-0.2">
      Bridging institutional Binance Spot orderflow with non-custodial execution on BNB Smart Chain via MCP
    </text>
    
    <!-- Mini Pills / Tags at Bottom -->
    <g transform="translate(600, 305)">
      <text x="-210" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#E5E7EB">Model Context Protocol</text>
      <circle cx="-120" cy="-4" r="2.5" fill="#F4D014" />
      <text x="-40" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#E5E7EB">BNB Smart Chain</text>
      <circle cx="45" cy="-4" r="2.5" fill="#F4D014" />
      <text x="125" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#E5E7EB">OpenRouter AI</text>
      <circle cx="205" cy="-4" r="2.5" fill="#F4D014" />
      <text x="270" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#E5E7EB">Next.js 16</text>
    </g>
  </svg>
  `;

  // Overlay logo if exists
  let logoOverlay = [];
  try {
    const logoResized = await sharp('public/logo.png')
      .resize({ height: 60, fit: 'inside' })
      .toBuffer();
    logoOverlay = [{
      input: logoResized,
      top: 38,
      left: 60,
    }];
  } catch {
    // optional
  }

  await sharp(Buffer.from(svg))
    .composite(logoOverlay)
    .png({ quality: 95 })
    .toFile('public/banner-hero.png');

  console.log('Created public/banner-hero.png');
}

async function generateCard1() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${yellowDefs}
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.7" />
    <circle cx="950" cy="240" r="220" fill="#FFE552" opacity="0.45" filter="blur(40px)" />
    
    <rect x="76" y="76" width="180" height="32" rx="16" fill="#1C1C1C" fill-opacity="0.08" />
    <text x="94" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#1C1C1C" letter-spacing="1">Binance Agent OS</text>
    
    <text x="76" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#1C1C1C" letter-spacing="-1.5">
      <tspan x="76" dy="0">Autonomous</tspan>
      <tspan x="76" dy="62">transaction tracking</tspan>
    </text>
    
    <text x="76" y="324" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#1C1C1C" fill-opacity="0.84" letter-spacing="-0.2">
      <tspan x="76" dy="0">Forget hand-tagging transactions! AI wizards automatically track and</tspan>
      <tspan x="76" dy="30">categorize your Binance Spot orderflow, giving you instant insights</tspan>
      <tspan x="76" dy="30">and saving you endless sorting.</tspan>
    </text>
  </svg>
  `;

  const i4Resized = await sharp('public/i4.png')
    .resize({ height: 420, fit: 'inside' })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([{ input: i4Resized, top: 30, left: 780 }])
    .png({ quality: 95 })
    .toFile('public/card-orderflow-v2.png');

  console.log('Created public/card-orderflow-v2.png');
}

async function generateCard2() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${yellowDefs}
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.7" />
    <circle cx="260" cy="240" r="220" fill="#FFE552" opacity="0.45" filter="blur(40px)" />
    
    <rect x="520" y="76" width="165" height="32" rx="16" fill="#1C1C1C" fill-opacity="0.08" />
    <text x="538" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#1C1C1C" letter-spacing="1">Categorization</text>
    
    <text x="520" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#1C1C1C" letter-spacing="-1.5">
      <tspan x="520" dy="0">Personalized</tspan>
      <tspan x="520" dy="62">budget creation</tspan>
    </text>
    
    <text x="520" y="324" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#1C1C1C" fill-opacity="0.84" letter-spacing="-0.2">
      <tspan x="520" dy="0">Ditch generic budgets! We craft personalized plans based on</tspan>
      <tspan x="520" dy="30">your portfolio income, goals, and holding patterns, so you can</tspan>
      <tspan x="520" dy="30">stay on track without feeling restricted.</tspan>
    </text>
  </svg>
  `;

  const i3Resized = await sharp('public/i3.png')
    .resize({ height: 400, fit: 'inside' })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([{ input: i3Resized, top: 40, left: 60 }])
    .png({ quality: 95 })
    .toFile('public/card-scoring-v2.png');

  console.log('Created public/card-scoring-v2.png');
}

async function generateCard3() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${yellowDefs}
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.7" />
    <circle cx="950" cy="240" r="220" fill="#FFE552" opacity="0.45" filter="blur(40px)" />
    
    <circle cx="86" cy="92" r="5.5" fill="#1C1C1C" />
    <text x="104" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#1C1C1C" letter-spacing="1">Smart predictions</text>
    
    <text x="76" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#1C1C1C" letter-spacing="-1.5">
      <tspan x="76" dy="0">Data-driven</tspan>
      <tspan x="76" dy="62">insights</tspan>
    </text>
    
    <text x="76" y="324" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#1C1C1C" fill-opacity="0.84" letter-spacing="-0.2">
      <tspan x="76" dy="0">Don't just react, anticipate. Powerful insights reveal your</tspan>
      <tspan x="76" dy="30">financial future, orderbook liquidity shifts, and on-chain movements,</tspan>
      <tspan x="76" dy="30">keeping you one step ahead.</tspan>
    </text>
  </svg>
  `;

  const i5Resized = await sharp('public/i5.png')
    .resize({ height: 410, fit: 'inside' })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([{ input: i5Resized, top: 35, left: 760 }])
    .png({ quality: 95 })
    .toFile('public/card-insights-v2.png');

  console.log('Created public/card-insights-v2.png');
}

async function generateCard4() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${yellowDefs}
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.7" />
    <circle cx="600" cy="200" r="280" fill="#FFE552" opacity="0.45" filter="blur(50px)" />
    
    <text x="1120" y="70" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="600" fill="#1C1C1C" fill-opacity="0.75" letter-spacing="0.5">*Boost for financial freedom</text>
    
    <text x="600" y="215" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="142" font-weight="900" fill="#1C1C1C" letter-spacing="-4">100%</text>
    
    <text x="600" y="288" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#1C1C1C" letter-spacing="-0.3">
      100% confidence, 0% guesswork: NetroAI empowers you
    </text>
    <text x="600" y="320" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18.5" font-weight="500" fill="#1C1C1C" fill-opacity="0.82" letter-spacing="-0.2">
      to unlock financial freedom with AI-powered insights and personalized tools.
    </text>
    
    <g transform="translate(515, 368)">
      <rect width="170" height="48" rx="24" fill="#1C1C1C" />
      <text x="85" y="30" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F4D014" letter-spacing="0.5">Get started</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile('public/card-confidence-v2.png');

  console.log('Created public/card-confidence-v2.png');
}

async function run() {
  await generateHeroHeader();
  await generateCard1();
  await generateCard2();
  await generateCard3();
  await generateCard4();
  console.log('All banners generated with v2 filenames!');
}

run().catch(console.error);
