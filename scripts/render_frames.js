// Capture an HTML animation frame by frame via window.seek(t), for ffmpeg to encode.
//
// Usage: node render_frames.js <index.html> <out_dir> [seconds=60] [fps=30]
// Requires: puppeteer-core, and Google Chrome installed (path via CHROME_PATH).

const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer-core");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function main() {
  const [html, outDir, secArg = "60", fpsArg = "30"] = process.argv.slice(2);
  const seconds = Number(secArg);
  const fps = Number(fpsArg);
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--window-size=1920,1080", "--hide-scrollbars"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.goto("file://" + path.resolve(html), { waitUntil: "load" });

  if (!(await page.evaluate(() => typeof window.seek === "function"))) {
    throw new Error("page does not expose window.seek(t)");
  }

  const total = Math.round(seconds * fps);
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.seek(t), i / fps);
    // Let layout and CSS settle for the seeked state.
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    const file = path.join(outDir, `f${String(i).padStart(5, "0")}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  }
  await browser.close();
  console.log(`captured ${total} frames to ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
