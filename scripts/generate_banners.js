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

  // Pure clean matte dark background - NO glowing haze, NO colored/yellow border, NO all-caps, NO track, NO prize
  const svg = `
  <svg width="${hWidth}" height="${hHeight}" viewBox="0 0 ${hWidth} ${hHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroBgClean" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0E0E0E" />
        <stop offset="50%" stop-color="#0A0A0A" />
        <stop offset="100%" stop-color="#060606" />
      </linearGradient>
    </defs>
    
    <!-- Background: Pure matte dark -->
    <rect width="${hWidth}" height="${hHeight}" rx="24" fill="url(#heroBgClean)" />
    <!-- Sleek subtle dark border (NO colored/yellow border) -->
    <rect width="${hWidth - 2}" height="${hHeight - 2}" x="1" y="1" rx="23" fill="none" stroke="#222222" stroke-width="1.5" />
    
    <!-- Badges Top (NO Track, NO Prize, NO all-caps) -->
    <g transform="translate(600, 72)">
      <rect x="-120" y="-14" width="240" height="28" rx="14" fill="#181818" stroke="#2A2A2A" stroke-width="1" />
      <circle cx="-95" cy="0" r="3.5" fill="#F4D014" />
      <text x="5" y="4.5" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#E5E7EB" letter-spacing="0.5">Binance Agent OS Ecosystem</text>
    </g>
    
    <!-- Main Title: Crisp clean white -->
    <text x="600" y="165" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="62" font-weight="900" fill="#FFFFFF" letter-spacing="-1.5">NetroBNB</text>
    
    <!-- Subtitle (Natural casing) -->
    <text x="600" y="214" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="21" font-weight="600" fill="#E5E7EB" letter-spacing="-0.3">
      Autonomous AI Asset Intelligence &amp; Trading Agent
    </text>
    
    <!-- Description (Natural casing) -->
    <text x="600" y="254" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15.5" font-weight="400" fill="#888888" letter-spacing="-0.2">
      Bridging institutional Binance Spot orderflow with non-custodial execution on BNB Smart Chain via MCP
    </text>
    
    <!-- Mini Pills / Tags at Bottom (Natural casing) -->
    <g transform="translate(600, 302)">
      <text x="-210" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#999999">Model Context Protocol</text>
      <circle cx="-120" cy="-4" r="2.5" fill="#555555" />
      <text x="-40" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#999999">BNB Smart Chain</text>
      <circle cx="45" cy="-4" r="2.5" fill="#555555" />
      <text x="125" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#999999">OpenRouter AI</text>
      <circle cx="205" cy="-4" r="2.5" fill="#555555" />
      <text x="270" y="0" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#999999">Next.js 16</text>
    </g>
  </svg>
  `;

  let logoOverlay = [];
  try {
    const logoResized = await sharp('public/logo.png')
      .resize({ height: 52, fit: 'inside' })
      .toBuffer();
    logoOverlay = [{
      input: logoResized,
      top: 42,
      left: 55,
    }];
  } catch {
    // optional
  }

  await sharp(Buffer.from(svg))
    .composite(logoOverlay)
    .png({ quality: 95 })
    .toFile('public/banner-hero-v3.png');

  console.log('Created public/banner-hero-v3.png');
}

async function run() {
  await generateHeroHeader();
  console.log('Hero header v3 created with clean matte black, no glow, no colored border, no all-caps, no track/prize.');
}

run().catch(console.error);
