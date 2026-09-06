const sharp = require('sharp');
const fs = require('fs');

const width = 1200;
const height = 480;

// Shared Yellow Palette from Card 1
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

async function generateCard1() {
  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    ${yellowDefs}
    
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.7" />
    
    <!-- Ambient subtle circle -->
    <circle cx="950" cy="240" r="220" fill="#FFE552" opacity="0.45" filter="blur(40px)" />
    
    <!-- Tag (Normal capitalization, NO all-caps) -->
    <rect x="76" y="76" width="180" height="32" rx="16" fill="#1C1C1C" fill-opacity="0.08" />
    <text x="94" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#1C1C1C" letter-spacing="1">Binance Agent OS</text>
    
    <!-- Heading -->
    <text x="76" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#1C1C1C" letter-spacing="-1.5">
      <tspan x="76" dy="0">Autonomous</tspan>
      <tspan x="76" dy="62">transaction tracking</tspan>
    </text>
    
    <!-- Subtitle -->
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
    ${yellowDefs}
    
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.7" />
    
    <!-- Ambient subtle circle on left -->
    <circle cx="260" cy="240" r="220" fill="#FFE552" opacity="0.45" filter="blur(40px)" />
    
    <!-- Tag (Normal capitalization, NO all-caps) -->
    <rect x="520" y="76" width="165" height="32" rx="16" fill="#1C1C1C" fill-opacity="0.08" />
    <text x="538" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#1C1C1C" letter-spacing="1">Categorization</text>
    
    <!-- Heading -->
    <text x="520" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#1C1C1C" letter-spacing="-1.5">
      <tspan x="520" dy="0">Personalized</tspan>
      <tspan x="520" dy="62">budget creation</tspan>
    </text>
    
    <!-- Subtitle -->
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
    ${yellowDefs}
    
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.7" />
    
    <!-- Ambient subtle circle -->
    <circle cx="950" cy="240" r="220" fill="#FFE552" opacity="0.45" filter="blur(40px)" />
    
    <!-- Indicator Dot + Tag (Normal capitalization, NO all-caps) -->
    <circle cx="86" cy="92" r="5.5" fill="#1C1C1C" />
    <text x="104" y="97" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#1C1C1C" letter-spacing="1">Smart predictions</text>
    
    <!-- Heading -->
    <text x="76" y="180" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#1C1C1C" letter-spacing="-1.5">
      <tspan x="76" dy="0">Data-driven</tspan>
      <tspan x="76" dy="62">insights</tspan>
    </text>
    
    <!-- Subtitle -->
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
    ${yellowDefs}
    
    <!-- Background Card -->
    <rect width="${width}" height="${height}" rx="32" fill="url(#bgYellow)" />
    <rect width="${width - 4}" height="${height - 4}" x="2" y="2" rx="30" fill="none" stroke="#FFF59D" stroke-width="2" stroke-opacity="0.7" />
    
    <!-- Ambient subtle center glow -->
    <circle cx="600" cy="200" r="280" fill="#FFE552" opacity="0.45" filter="blur(50px)" />
    
    <!-- Top Right Tag (Normal capitalization, NO all-caps) -->
    <text x="1120" y="70" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13.5" font-weight="600" fill="#1C1C1C" fill-opacity="0.75" letter-spacing="0.5">*Boost for financial freedom</text>
    
    <!-- Massive 100% Headline in Dark Charcoal / Black with Subtle Drop Shadow -->
    <text x="600" y="215" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="142" font-weight="900" fill="#1C1C1C" letter-spacing="-4">100%</text>
    
    <!-- Subtitle (Normal capitalization, NO all-caps) -->
    <text x="600" y="288" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#1C1C1C" letter-spacing="-0.3">
      100% confidence, 0% guesswork: NetroAI empowers you
    </text>
    <text x="600" y="320" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18.5" font-weight="500" fill="#1C1C1C" fill-opacity="0.82" letter-spacing="-0.2">
      to unlock financial freedom with AI-powered insights and personalized tools.
    </text>
    
    <!-- Button (Normal capitalization: "Get started") -->
    <g transform="translate(515, 368)">
      <rect width="170" height="48" rx="24" fill="#1C1C1C" />
      <text x="85" y="30" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F4D014" letter-spacing="0.5">Get started</text>
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
  console.log('All 4 yellow cards generated successfully!');
}

run().catch(console.error);
