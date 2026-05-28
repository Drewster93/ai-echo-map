/* Single continuous capture of the full Pulse user journey.
 * ~35 seconds of real app interaction. Remotion adds overlays + music.
 *
 * Run: PREVIEW_URL=https://ai-echo-map.lovable.app bun remotion/scripts/capture-full.ts
 */
import { chromium, type Page } from 'playwright';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { CURSOR_INIT_SCRIPT } from './cursor.inject';

const PREVIEW_URL =
  process.env.PREVIEW_URL ?? 'https://ai-echo-map.lovable.app';
const OUT_DIR = resolve(__dirname, '../public/captures');
const TMP_DIR = '/tmp/pulse-captures';
const VIEWPORT = { width: 1920, height: 1080 };

async function glide(page: Page, x: number, y: number, steps = 30) {
  await page.mouse.move(x, y, { steps });
}
async function typeHuman(page: Page, text: string, perChar = 75) {
  for (const ch of text) {
    await page.keyboard.type(ch);
    await page.waitForTimeout(perChar + Math.random() * 35);
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(TMP_DIR, { recursive: true });
  const videoDir = `${TMP_DIR}/full-${Date.now()}`;
  await mkdir(videoDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: '/bin/chromium',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
    ],
  });
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    recordVideo: { dir: videoDir, size: VIEWPORT },
    colorScheme: 'dark',
  });
  await ctx.addInitScript(CURSOR_INIT_SCRIPT);
  await ctx.route('**/*', (route) => {
    const u = route.request().url();
    if (/posthog|segment|sentry|hotjar|analytics|gtag|googletag/i.test(u))
      return route.abort();
    return route.continue();
  });

  const page = await ctx.newPage();
  console.log('navigate');
  await page.goto(PREVIEW_URL, { waitUntil: 'domcontentloaded' });

  // ---- ACT 1: Intro plays itself (~6s) ----
  // The IntroSequence component plays its own animation; we wait it out.
  await page.waitForSelector('input', { timeout: 25_000 });
  console.log('landing visible');
  await page.waitForTimeout(800);

  // ---- ACT 2: Type the brand ----
  // Bring cursor in from bottom-right diagonally
  await page.mouse.move(1600, 1050);
  await page.waitForTimeout(150);
  const input = page.locator('input').first();
  const box = await input.boundingBox();
  const ix = box ? box.x + 80 : 960;
  const iy = box ? box.y + box.height / 2 : 770;
  await glide(page, ix, iy, 45);
  await page.waitForTimeout(300);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForTimeout(350);
  await typeHuman(page, 'Lumen Coffee');
  await page.waitForTimeout(500);

  // Glide to REVEAL button & click
  const btn = page.getByRole('button', { name: /reveal/i }).first();
  const bbox = await btn.boundingBox();
  if (bbox) {
    await glide(page, bbox.x + bbox.width / 2, bbox.y + bbox.height / 2, 30);
    await page.waitForTimeout(250);
    await page.mouse.down();
    await page.mouse.up();
  } else {
    await page.keyboard.press('Enter');
  }

  // ---- ACT 3: Map reveals + explore ----
  console.log('waiting for map reveal');
  // The reveal animation takes a few seconds before MapApp settles
  await page.waitForTimeout(5500);

  // Pan + zoom across the map
  await glide(page, 1100, 540, 35);
  await page.waitForTimeout(400);
  // Zoom via wheel
  for (let i = 0; i < 2; i++) {
    await page.mouse.wheel(0, -260);
    await page.waitForTimeout(400);
  }
  await glide(page, 880, 460, 40);
  await page.waitForTimeout(500);

  // ---- ACT 4: Click a pulse circle for detail ----
  const circles = page.locator('svg circle');
  const ccount = await circles.count();
  console.log(`circles: ${ccount}`);
  if (ccount > 0) {
    const target = circles.nth(Math.min(2, ccount - 1));
    const b = await target.boundingBox();
    if (b) {
      await glide(page, b.x + b.width / 2, b.y + b.height / 2, 30);
      await page.waitForTimeout(300);
      await page.mouse.down();
      await page.mouse.up();
    }
  }
  await page.waitForTimeout(2200);

  // Scroll within the detail panel
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1500);

  // ---- ACT 5: Cursor drift to anchor a sign-off frame ----
  await glide(page, 960, 540, 60);
  await page.waitForTimeout(900);

  console.log('done, closing');
  await ctx.close();
  await browser.close();

  const files = await readdir(videoDir);
  const webm = files.find((f) => f.endsWith('.webm'));
  if (!webm) throw new Error('no video produced');
  const out = join(OUT_DIR, 'full-flow.mp4');
  await rm(out, { force: true });
  execSync(
    `ffmpeg -y -i "${join(videoDir, webm)}" -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -r 30 -movflags +faststart "${out}"`,
    { stdio: 'inherit' },
  );
  await rm(videoDir, { recursive: true, force: true });
  console.log(`\nOutput: ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
