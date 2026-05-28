/* Playwright-based scripted screen capture against the live preview.
 *
 * Records 6 shots back-to-back, each in its own context with recordVideo.
 * Uses system Chromium (/bin/chromium) since Playwright's bundled browser
 * is not installed in this sandbox.
 *
 * Run: bun remotion/scripts/capture-shots.ts
 */
import { chromium, type BrowserContext, type Page } from 'playwright';
import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { CURSOR_INIT_SCRIPT } from './cursor.inject';

const PREVIEW_URL =
  process.env.PREVIEW_URL ??
  'https://id-preview--da50e202-682f-46c1-9835-d318935fa91d.lovable.app';
const OUT_DIR = resolve(__dirname, '../public/captures');
const TMP_DIR = '/tmp/pulse-captures';

const VIEWPORT = { width: 1920, height: 1080 };

async function ease(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

/** Smoothly move the mouse from current position to (x,y) over `steps` steps. */
async function glide(page: Page, x: number, y: number, steps = 28) {
  await page.mouse.move(x, y, { steps });
}

async function typeHuman(page: Page, text: string, perChar = 55) {
  for (const ch of text) {
    await page.keyboard.type(ch);
    await page.waitForTimeout(perChar + Math.random() * 40);
  }
}

async function newCtx(): Promise<{ ctx: BrowserContext; videoDir: string }> {
  const videoDir = `${TMP_DIR}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  await mkdir(videoDir, { recursive: true });
  const browser = await chromium.launch({
    executablePath: '/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--hide-scrollbars'],
  });
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: videoDir, size: VIEWPORT },
    colorScheme: 'dark',
  });
  await ctx.addInitScript(CURSOR_INIT_SCRIPT);
  // Block analytics so they don't slow things down.
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (/posthog|segment|sentry|hotjar|analytics/i.test(u)) return route.abort();
    return route.continue();
  });
  return { ctx, videoDir };
}

async function finishCtx(
  ctx: BrowserContext,
  videoDir: string,
  outName: string,
) {
  const pages = ctx.pages();
  await Promise.all(pages.map((p) => p.close()));
  const browser = ctx.browser()!;
  await ctx.close();
  await browser.close();
  // Move the webm to OUT_DIR with predictable name, then transcode to mp4.
  const files = await readdir(videoDir);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error(`No video produced for ${outName}`);
  const webmPath = join(videoDir, webm);
  const mp4Path = join(OUT_DIR, `${outName}.mp4`);
  await rm(mp4Path, { force: true });
  execSync(
    // High-quality H.264, yuv420p for compatibility, 30fps.
    `ffmpeg -y -i "${webmPath}" -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -r 30 -movflags +faststart "${mp4Path}"`,
    { stdio: 'inherit' },
  );
  await rm(videoDir, { recursive: true, force: true });
  return mp4Path;
}

// ---------- SHOTS ----------

async function shotLanding(): Promise<string> {
  const { ctx, videoDir } = await newCtx();
  const page = await ctx.newPage();
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  // Skip intro by waiting for landing screen, then idle a bit.
  await page.waitForSelector('input', { timeout: 20_000 });
  await ease(page, 800);
  // Camera-like: cursor enters from off-screen
  await page.mouse.move(960, 1100);
  await glide(page, 960, 620, 40);
  await ease(page, 250);
  // Click the input
  const input = page.locator('input').first();
  const box = await input.boundingBox();
  if (box) {
    await glide(page, box.x + box.width / 2, box.y + box.height / 2, 24);
    await page.mouse.down();
    await page.mouse.up();
  }
  await ease(page, 300);
  await typeHuman(page, 'Lumen Coffee');
  await ease(page, 400);
  await page.keyboard.press('Enter');
  // Let the search animation play
  await ease(page, 5500);
  return finishCtx(ctx, videoDir, '01-landing');
}

async function shotMapExplore(): Promise<string> {
  const { ctx, videoDir } = await newCtx();
  const page = await ctx.newPage();
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('input', { timeout: 20_000 });
  // Fast skip: fill + enter
  await page.locator('input').first().fill('Lumen Coffee');
  await page.keyboard.press('Enter');
  // Wait for map to load
  await page.waitForTimeout(6000);
  // Pan/zoom the map
  await glide(page, 1100, 540, 30);
  await ease(page, 400);
  // Try wheel-zoom into city
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, -240);
    await ease(page, 350);
  }
  // Drift cursor across hex tiles
  await glide(page, 800, 480, 50);
  await ease(page, 500);
  await glide(page, 1200, 620, 50);
  await ease(page, 1200);
  return finishCtx(ctx, videoDir, '02-map');
}

async function shotDetailPanel(): Promise<string> {
  const { ctx, videoDir } = await newCtx();
  const page = await ctx.newPage();
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('input', { timeout: 20_000 });
  await page.locator('input').first().fill('Lumen Coffee');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  // Try clicking a pulse circle (any svg circle in middle of map)
  const circles = page.locator('svg circle');
  const count = await circles.count();
  if (count > 0) {
    const target = circles.nth(Math.floor(count / 2));
    const b = await target.boundingBox();
    if (b) {
      await glide(page, b.x + b.width / 2, b.y + b.height / 2, 35);
      await ease(page, 300);
      await page.mouse.down();
      await page.mouse.up();
    }
  }
  await ease(page, 2500);
  // Scroll the detail panel if it appears
  await page.mouse.wheel(0, 400);
  await ease(page, 1500);
  return finishCtx(ctx, videoDir, '03-detail');
}

async function shotResultsScroll(): Promise<string> {
  const { ctx, videoDir } = await newCtx();
  const page = await ctx.newPage();
  await page.goto(PREVIEW_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('input', { timeout: 20_000 });
  await page.locator('input').first().fill('Lumen Coffee');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5500);
  // Smooth scroll down through the page to show benchmark/results
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, 250);
    await ease(page, 220);
  }
  await ease(page, 1500);
  return finishCtx(ctx, videoDir, '04-results');
}

// ---------- MAIN ----------

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });
  const shots = [
    { name: 'landing', fn: shotLanding },
    { name: 'map', fn: shotMapExplore },
    { name: 'detail', fn: shotDetailPanel },
    { name: 'results', fn: shotResultsScroll },
  ];
  const only = process.env.SHOT;
  const queue = only ? shots.filter((s) => s.name === only) : shots;
  if (queue.length === 0) {
    console.error(`No matching shot. Available: ${shots.map((s) => s.name).join(', ')}`);
    process.exit(1);
  }
  for (const s of queue) {
    console.log(`\n=== Capturing shot: ${s.name} ===`);
    const t0 = Date.now();
    const out = await s.fn();
    console.log(`  -> ${out}  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
  }
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
