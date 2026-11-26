// Screenshot chosen seconds of an HTML animation via window.seek(t), and print
// visible text plus console errors. QA helper for spot checks.
//
// Usage: node keyframes.js <index.html> <out_prefix> <t1> [t2 ...]
// Requires: puppeteer-core, Google Chrome.
const path = require("path");
const puppeteer = require("puppeteer-core");
const [html, outPrefix, ...times] = process.argv.slice(2);
(async () => {
  const b = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });
  const p = await b.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.setViewport({ width: 1920, height: 1080 });
  await p.goto("file://" + path.resolve(html), { waitUntil: "load" });
  for (const t of times) {
    await p.evaluate((s) => window.seek(s), Number(t));
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await p.screenshot({ path: `${outPrefix}-${t}.png` });
    const txt = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 160));
    console.log(`t=${t}: ${txt}`);
  }
  console.log("errors:", errors.length ? errors : "none");
  await b.close();
})();
