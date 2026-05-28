import { bundle } from "@remotion/bundler";
import {
  renderStill,
  selectComposition,
  openBrowser,
} from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const id = process.argv[2] || "main";
const frames = (process.argv[3] || "60,200,320,480,660,900,1200,1500,1800,2050,2250")
  .split(",")
  .map((s) => parseInt(s, 10));

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (c) => c,
});

const browser = await openBrowser("chrome", {
  browserExecutable: "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id,
  puppeteerInstance: browser,
});

for (const frame of frames) {
  const out = `/tmp/stills/${id}-${frame}.png`;
  console.log(`[still] ${out}`);
  await renderStill({
    composition,
    serveUrl: bundled,
    output: out,
    frame,
    puppeteerInstance: browser,
  });
}

await browser.close({ silent: false });
console.log("[still] done");
