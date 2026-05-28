import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  selectComposition,
  openBrowser,
} from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const id = process.argv[2] || "main";
const outputName =
  process.argv[3] ||
  ({
    main: "ai-performance-pulse-launch-1080p.mp4",
    square: "ai-performance-pulse-launch-square.mp4",
    vertical: "ai-performance-pulse-launch-vertical.mp4",
  }[id] ?? `ai-performance-pulse-${id}.mp4`);

console.log(`[render] bundling…`);
const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

console.log(`[render] launching browser…`);
const browser = await openBrowser("chrome", {
  browserExecutable:
    process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

console.log(`[render] selecting composition "${id}"…`);
const composition = await selectComposition({
  serveUrl: bundled,
  id,
  puppeteerInstance: browser,
});

const outputLocation = `/mnt/documents/${outputName}`;
console.log(`[render] rendering ${composition.durationInFrames} frames → ${outputLocation}`);
await renderMedia({
  composition,
  serveUrl: bundled,
  codec: "h264",
  outputLocation,
  puppeteerInstance: browser,
  muted: true,
  concurrency: 1,
});

await browser.close({ silent: false });
console.log(`[render] done: ${outputLocation}`);
