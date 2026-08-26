#!/usr/bin/env node
/**
 * scripts/dev.js — QuantuSecure interactive dev launcher
 *
 * 1. Checks which renderer ports are free
 * 2. Prompts user to pick one (or press Enter for default)
 * 3. Starts Vite on that port
 * 4. Polls until Vite is ready, then launches Electron
 * 5. Electron exits → Vite is killed automatically
 */

'use strict';
const net      = require('net');
const http     = require('http');
const readline = require('readline');
const { spawn } = require('child_process');
const path     = require('path');

// ── ANSI colors ────────────────────────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  green:  '\x1b[32m',
  bGreen: '\x1b[92m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  cyan:   '\x1b[36m',
  gray:   '\x1b[90m',
  white:  '\x1b[97m',
};

const g  = (s) => `${c.green}${s}${c.reset}`;
const bg = (s) => `${c.bGreen}${c.bold}${s}${c.reset}`;
const y  = (s) => `${c.yellow}${s}${c.reset}`;
const gr = (s) => `${c.gray}${s}${c.reset}`;
const b  = (s) => `${c.bold}${s}${c.reset}`;

// ── Candidate renderer ports ───────────────────────────────────────────────────
const CANDIDATES = [5173, 5174, 5175, 5176, 5177, 5178, 5179];

// ── Helpers ────────────────────────────────────────────────────────────────────
async function isPortFree(port) {
  return new Promise(resolve => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', () => resolve(false));
    srv.listen(port, '127.0.0.1', () => srv.close(() => resolve(true)));
  });
}

async function waitForVite(port, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise(resolve => {
      const req = http.get(`http://localhost:${port}`, (res) => { resolve(res.statusCode < 500); res.destroy(); });
      req.on('error', () => resolve(false));
      req.setTimeout(500, () => { req.destroy(); resolve(false); });
    });
    if (ok) return;
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error(`Vite did not start on port ${port} within ${timeoutMs / 1000}s`);
}

// ── Banner ─────────────────────────────────────────────────────────────────────
function printBanner() {
  console.log('');
  console.log(`  ${bg('  QuantuSecure  ')}  ${gr('PQC-Secured LAN Chat')}`);
  console.log(`  ${gr('──────────────────────────────────────')}`);
  console.log(`  ${gr('ML-KEM-768 · AES-256-GCM · HKDF-SHA256')}`);
  console.log('');
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  printBanner();

  // 1. Find available ports
  process.stdout.write(`  ${gr('Scanning ports...')} `);
  const free = [];
  for (const p of CANDIDATES) {
    if (await isPortFree(p)) free.push(p);
  }
  process.stdout.write(`${g('done')}\n\n`);

  if (free.length === 0) {
    console.log(`  ${c.red}✗ No free ports found in [${CANDIDATES.join(', ')}]${c.reset}`);
    console.log(`  ${gr('Close other dev servers and try again.')}\n`);
    process.exit(1);
  }

  // 2. Display menu
  console.log(`  ${b('Select renderer port:')}\n`);
  free.forEach((port, i) => {
    const label = i === 0
      ? `${bg(` ${i + 1} `)} ${g(port)}  ${gr('← default')}`
      : `${c.gray}[${c.reset}${c.cyan}${i + 1}${c.reset}${c.gray}]${c.reset} ${c.white}${port}${c.reset}`;
    console.log(`    ${label}`);
  });
  console.log('');

  // 3. Prompt
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(resolve => {
    rl.question(`  ${gr('Enter 1–' + free.length + ' (or Enter for default):')} `, resolve);
    rl.once('close', () => resolve(''));
  });
  rl.close();

  const idx  = answer.trim() === '' ? 0 : parseInt(answer.trim(), 10) - 1;
  const port = free[Math.max(0, Math.min(idx, free.length - 1))] ?? free[0];

  console.log('');
  console.log(`  ${g('▶')} Renderer  ${bg(` http://localhost:${port} `)}`);
  console.log(`  ${g('▶')} Electron  ${gr('launching after Vite is ready...')}`);
  console.log(`  ${gr('──────────────────────────────────────')}\n`);

  // 4. Start Vite
  const vite = spawn('npx', ['vite', '--port', String(port)], {
    cwd:   path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env:   { ...process.env },
  });
  vite.on('error', err => { console.error('  Vite failed to start:', err.message); process.exit(1); });

  // 5. Wait for Vite, then launch Electron
  try {
    await waitForVite(port);
  } catch (err) {
    console.error(`\n  ${c.red}✗ ${err.message}${c.reset}\n`);
    vite.kill();
    process.exit(1);
  }

  console.log(`\n  ${g('✓')} Vite ready — launching Electron\n`);

  const electron = spawn('npx', ['electron', '.'], {
    cwd:   path.resolve(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV:  'development',
      VITE_PORT: String(port),
    },
  });

  electron.on('error', err => console.error('  Electron error:', err.message));
  electron.on('close', (code) => {
    console.log(`\n  ${gr('Electron exited — shutting down Vite...')}`);
    try { vite.kill(); } catch {}
    setTimeout(() => process.exit(code ?? 0), 500);
  });

  // If Vite dies first, kill Electron too
  vite.on('close', (code) => {
    if (code !== null && code !== 0) {
      console.log(`\n  ${y('Vite exited — shutting down Electron...')}`);
      electron.kill();
    }
  });

  // Ctrl+C → clean shutdown
  process.on('SIGINT', () => {
    console.log(`\n  ${gr('Shutting down...')}`);
    try { electron.kill(); } catch {}
    try { vite.kill(); } catch {}
    setTimeout(() => process.exit(0), 500);
  });
}

main().catch(err => {
  console.error(`\n  ${c.red}✗ Unexpected error: ${err.message}${c.reset}\n`);
  process.exit(1);
});
