// QA agent, program half: seek to checkpoints, compare visible subtitle text with
// timeline.json, capture keyframes, and report console errors.
//
// Usage: node qa_check.js <index.html> <timeline.json> <out_dir>
// Requires: puppeteer-core, Google Chrome (path via CHROME_PATH).
//
// Array-state checks need the page to expose window.__state(t) -> {order:[...]}.
// If absent, they are skipped and reported as such.

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// Expected array after each shot finishes (insertion sort on [5,2,4,6,1,3]).
const EXPECTED_END = {
  4: [5, 2, 4, 6, 1, 3],
  5: [2, 5, 4, 6, 1, 3],
  6: [2, 4, 5, 6, 1, 3],
  7: [2, 4, 5, 6, 1, 3],
  8: [1, 2, 4, 5, 6, 3],
  9: [1, 2, 3, 4, 5, 6],
};

(async () => {
  const [html, timelinePath, outDir] = process.argv.slice(2);
  const { shots, total } = JSON.parse(fs.readFileSync(timelinePath, "utf8"));
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("file://" + path.resolve(html), { waitUntil: "load" });

  const seek = async (t) => {
    await page.evaluate((s) => window.seek(s), t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  };
  const text = () => page.evaluate(() => document.body.innerText.replace(/\s+/g, ""));
  const hasState = await page.evaluate(() => typeof window.__state === "function");

  const fails = [];
  for (const s of shots) {
    const mid = (s.vo_start + s.vo_end) / 2;
    await seek(mid);
    const want = s.line.replace(/\s+/g, "");
    if (!(await text()).includes(want)) fails.push(`shot ${s.shot}: subtitle missing at ${mid.toFixed(2)}s`);
    await page.screenshot({ path: path.join(outDir, `shot${String(s.shot).padStart(2, "0")}-mid.png`) });

    if (EXPECTED_END[s.shot] && hasState) {
      const got = await page.evaluate((t) => window.__state(t).order, s.end - 0.05);
      if (JSON.stringify(got) !== JSON.stringify(EXPECTED_END[s.shot])) {
        fails.push(`shot ${s.shot}: order ${JSON.stringify(got)} != ${JSON.stringify(EXPECTED_END[s.shot])}`);
      }
    }
  }

  // Beat alignment: optional BEATS file next to timeline.json lists
  // [{shot, phrase, after:[...order]}]; the order must already be `after`
  // within 0.5s of the phrase being spoken.
  const beatsPath = path.join(path.dirname(timelinePath), "beats.json");
  if (hasState && fs.existsSync(beatsPath)) {
    const beats = JSON.parse(fs.readFileSync(beatsPath, "utf8"));
    for (const b of beats) {
      const s = shots.find((x) => x.shot === b.shot);
      const ws = s.words || [];
      const joined = ws.map((w) => w.text).join("");
      const owner = [];
      ws.forEach((w, i) => { for (let k = 0; k < w.text.length; k++) owner.push(i); });
      const idx = joined.indexOf(b.phrase);
      if (idx < 0) { fails.push(`beat "${b.phrase}" not spoken in shot ${b.shot}`); continue; }
      const t = ws[owner[idx]].t + 0.5;
      const got = await page.evaluate((x) => window.__state(x).order, t);
      if (JSON.stringify(got) !== JSON.stringify(b.after)) {
        fails.push(`beat "${b.phrase}" (shot ${b.shot}) +0.5s: order ${JSON.stringify(got)} != ${JSON.stringify(b.after)}`);
      }
    }
  }

  // Subtitles must be hidden outside every voice window.
  for (const s of shots) {
    const gap = s.vo_start - 0.15;
    if (gap > s.start) {
      await seek(gap);
      if ((await text()).includes(s.line.replace(/\s+/g, ""))) {
        fails.push(`shot ${s.shot}: subtitle shown before voice starts`);
      }
    }
  }

  await browser.close();
  const report = {
    total,
    array_checks: hasState ? "run" : "skipped (no window.__state)",
    console_errors: errors,
    fails,
  };
  fs.writeFileSync(path.join(outDir, "qa-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(fails.length || errors.length ? 1 : 0);
})();
