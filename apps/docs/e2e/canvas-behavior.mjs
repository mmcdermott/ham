// Smoke checks for two canvas fixes:
//  - collapsing a surface (incl. one on the active path) actually compacts it
//  - column-scroll columns don't paint a phantom scrollbar when content fits
// Run with the dev server up:  node apps/docs/e2e/canvas-behavior.mjs
import { chromium } from "@playwright/test";

const BASE = process.env.DOCS_URL ?? "http://localhost:5173/hiermark/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto(`${BASE}#styling`, { waitUntil: "networkidle" });
await page.waitForSelector(".hiermark-canvas", { timeout: 10000 });
await page.waitForTimeout(400);

// 1) Collapse the first column's surface (it's on the active path) → mode changes.
const modeOf = () =>
  page.evaluate(() => {
    const s = document.querySelector(".hiermark-column .hiermark-surface");
    return [...s.classList].find((c) => c.startsWith("hiermark-surface-mode-")) ?? "?";
  });
const beforeMode = await modeOf();
await page
  .locator(".hiermark-column")
  .first()
  .locator(".hiermark-surface-collapse")
  .first()
  .click();
await page.waitForTimeout(400);
const afterMode = await modeOf();
const PASS_collapse = beforeMode !== afterMode && afterMode === "hiermark-surface-mode-rail";

// 2) Turn on column scroll and check no column overflows by a few px (phantom).
await page
  .locator('[role="group"]', { hasText: "Column scroll" })
  .getByRole("button", { name: "On", exact: true })
  .click();
await page.waitForTimeout(500);
const phantom = await page.evaluate(() =>
  [...document.querySelectorAll(".hiermark-column")]
    .map((c) => c.scrollHeight - c.clientHeight)
    .filter((d) => d > 0),
);
const PASS_noPhantom = phantom.length === 0;

await browser.close();
console.log(JSON.stringify({ beforeMode, afterMode, PASS_collapse, phantom, PASS_noPhantom }));
process.exit(PASS_collapse && PASS_noPhantom ? 0 : 1);
