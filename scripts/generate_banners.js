const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const width = 1200;
const height = 480;

async function generateCard1() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F7D828" />
        <stop offset="55%" stop-color="#F4D014" />
        <stop offset="100%" stop-color="#D4AC0D" />
      </linearGradient>
      <filter id="softShadow" x="-10%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.18" />
      </filter>
    </defs>
    
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bg1)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.6" />
    
    <!-- Ambient subtle circles -->
    <circle cx="950" cy="240" r="220" fill="#FFE552" opacity="0.4" filter="blur(40px)" />
    
    <!-- Tag -->
    <rect x="76" y="76" width="220" height="32" rx="16" fill="#1C1C1C" fill-opacity="0.08" />
    <text x="96" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="800" fill="#1C1C1C" letter-spacing="3.5">BINANCE AGENT OS</text>
    
    <!-- Heading -->
    <text x="76" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#1C1C1C" letter-spacing="-1.5">
      <tspan x="76" dy="0">Autonomous</tspan>
      <tspan x="76" dy="62">orderflow tracking</tspan>
    </text>
    
    <!-- Subtitle -->
    <text x="76" y="324" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="500" fill="#1C1C1C" fill-opacity="0.82" letter-spacing="-0.2">
      <tspan x="76" dy="0">Forget manual monitoring! AI agents automatically track and categorize</tspan>
      <tspan x="76" dy="30">Binance Spot taker aggression, liquidity depth, and large-holder inflows,</tspan>
      <tspan x="76" dy="30">giving you instant telemetry and saving you endless sorting.</tspan>
    </text>
  </svg>
  `;

  const i4Resized = await sharp('public/i4.png')
    .resize({ height: 420, fit: 'inside' })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([
      {
        input: i4Resized,
        top: 30,
        left: 780,
      },
    ])
    .png({ quality: 95 })
    .toFile('public/card-orderflow.png');

  console.log('Created public/card-orderflow.png');
}

async function generateCard2() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#141414" />
        <stop offset="50%" stop-color="#0A0A0A" />
        <stop offset="100%" stop-color="#000000" />
      </linearGradient>
      <radialGradient id="goldGlow" cx="20%" cy="50%" r="45%">
        <stop offset="0%" stop-color="#F4D014" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
    </defs>
    
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bg2)" />
    <rect width="${width}" height="${height}" rx="32" fill="url(#goldGlow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#F4D014" stroke-width="1.5" stroke-opacity="0.3" />
    
    <!-- Tag -->
    <rect x="530" y="76" width="220" height="32" rx="16" fill="#F4D014" fill-opacity="0.15" />
    <text x="548" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="800" fill="#F4D014" letter-spacing="3.5">BEHAVIORAL SCORING</text>
    
    <!-- Heading -->
    <text x="530" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1.5">
      <tspan x="530" dy="0">Deterministic</tspan>
      <tspan x="530" dy="62">asset score creation</tspan>
    </text>
    
    <!-- Subtitle -->
    <text x="530" y="324" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="400" fill="#E5E7EB" fill-opacity="0.80" letter-spacing="-0.2">
      <tspan x="530" dy="0">Ditch generic indicators! We synthesize institutional telemetry based</tspan>
      <tspan x="530" dy="30">on 9 weighted factors: momentum divergence, wallet holding periods,</tspan>
      <tspan x="530" dy="30">and execution stress so you stay ahead with 0% emotional bias.</tspan>
    </text>
  </svg>
  `;

  const i3Resized = await sharp('public/i3.png')
    .resize({ height: 400, fit: 'inside' })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([
      {
        input: i3Resized,
        top: 40,
        left: 60,
      },
    ])
    .png({ quality: 95 })
    .toFile('public/card-scoring.png');

  console.log('Created public/card-scoring.png');
}

async function generateCard3() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#18170D" />
        <stop offset="60%" stop-color="#0E0D05" />
        <stop offset="100%" stop-color="#050502" />
      </linearGradient>
      <radialGradient id="discGlow" cx="80%" cy="50%" r="40%">
        <stop offset="0%" stop-color="#F4D014" stop-opacity="0.14" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
    </defs>
    
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bg3)" />
    <rect width="${width}" height="${height}" rx="32" fill="url(#discGlow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#F4D014" stroke-width="1.5" stroke-opacity="0.25" />
    
    <!-- Indicator Dot -->
    <circle cx="86" cy="88" r="6" fill="#F4D014" />
    
    <!-- Tag -->
    <text x="108" y="93" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="800" fill="#F4D014" letter-spacing="3.5">SMART PREDICTIONS</text>
    
    <!-- Heading -->
    <text x="76" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1.5">
      <tspan x="76" dy="0">Data-driven</tspan>
      <tspan x="76" dy="62">market insights</tspan>
    </text>
    
    <!-- Subtitle -->
    <text x="76" y="324" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="400" fill="#E5E7EB" fill-opacity="0.80" letter-spacing="-0.2">
      <tspan x="76" dy="0">Don't just react, anticipate. Real-time predictive insights and</tspan>
      <tspan x="76" dy="30">orderbook depth reveal institutional movements, keeping your Web3</tspan>
      <tspan x="76" dy="30">portfolio and execution strategies one decisive step ahead.</tspan>
    </text>
  </svg>
  `;

  const i5Resized = await sharp('public/i5.png')
    .resize({ height: 410, fit: 'inside' })
    .toBuffer();

  await sharp(Buffer.from(svg))
    .composite([
      {
        input: i5Resized,
        top: 35,
        left: 760,
      },
    ])
    .png({ quality: 95 })
    .toFile('public/card-insights.png');

  console.log('Created public/card-insights.png');
}

async function generateCard4() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1F1A00" />
        <stop offset="45%" stop-color="#121000" />
        <stop offset="100%" stop-color="#080700" />
      </linearGradient>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="65%" stop-color="#FDF099" />
        <stop offset="100%" stop-color="#F4D014" />
      </linearGradient>
      <radialGradient id="centerGlow" cx="50%" cy="40%" r="50%">
        <stop offset="0%" stop-color="#F4D014" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
    </defs>
    
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bg4)" />
    <rect width="${width}" height="${height}" rx="32" fill="url(#centerGlow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#F4D014" stroke-width="1.5" stroke-opacity="0.35" />
    
    <!-- Top Right Tag -->
    <text x="1120" y="70" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#F4D014" fill-opacity="0.75" letter-spacing="1">*Boost for Financial Intelligence</text>
    
    <!-- Massive 100% Headline -->
    <text x="600" y="220" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="140" font-weight="900" fill="url(#textGrad)" letter-spacing="-4">100%</text>
    
    <!-- Subtitle -->
    <text x="600" y="295" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600" fill="#FFFFFF" letter-spacing="-0.3">
      100% confidence, 0% guesswork: NetroAI empowers you
    </text>
    <text x="600" y="326" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="400" fill="#D1D5DB" letter-spacing="-0.2">
      to unlock autonomous financial intelligence with Binance Agent OS live telemetry and personalized tools.
    </text>
    
    <!-- Button -->
    <g transform="translate(510, 375)">
      <rect width="180" height="46" rx="23" fill="#FFFFFF" />
      <text x="90" y="29" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12.5" font-weight="800" fill="#1C1C1C" letter-spacing="2">GET STARTED</text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile('public/card-confidence.png');

  console.log('Created public/card-confidence.png');
}

async function run() {
  await generateCard1();
  await generateCard2();
  await generateCard3();
  await generateCard4();
  console.log('All 4 cards generated successfully!');
}

run().catch(console.error);
