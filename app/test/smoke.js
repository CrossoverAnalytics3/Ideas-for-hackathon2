// End-to-end smoke test in headless Chromium against a MOCK=1 server.
// Also renders public/sample-worksheet.png from sample-worksheet.html.
// Run: node test/smoke.js   (starts its own server on :3456)
'use strict';
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const PORT = 3456, BASE = `http://localhost:${PORT}`;
const OUT = process.env.SHOTS || '/tmp/shots'; fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const server = spawn('node', ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, MOCK: '1', PORT }, stdio: ['ignore', 'ignore', 'inherit'] });
  await new Promise(r => setTimeout(r, 900));
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || (require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
  let failed = false;
  try {
    // 1. Render the sample worksheet to PNG.
    const ws = await browser.newPage({ viewport: { width: 800, height: 720 }, deviceScaleFactor: 2 });
    await ws.goto(`${BASE}/sample-worksheet.html`); await ws.waitForTimeout(200);
    await ws.locator('.sheet').screenshot({ path: path.join(__dirname, '..', 'public', 'sample-worksheet.png') });
    console.log('rendered public/sample-worksheet.png');

    // 2. Walk the product with speech recognition removed, so the typed fallback appears.
    const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
    await ctx.addInitScript(() => { delete window.webkitSpeechRecognition; delete window.SpeechRecognition; window.speechSynthesis = undefined; });
    const page = await ctx.newPage();
    page.on('pageerror', e => { console.error('PAGE ERROR', e.message); failed = true; });
    page.on('console', m => { if (m.type() === 'error') console.error('console.error:', m.text()); });

    await page.goto(BASE);
    await page.click('#sample');
    await page.waitForSelector('#results:not([hidden])');
    const rows = await page.locator('.result').count();
    console.log('intake rows:', rows);
    if (rows !== 4) throw new Error('expected 4 rows');
    await page.screenshot({ path: `${OUT}/1-intake.png`, fullPage: true });

    // 3. Drill.
    const teachHref = await page.locator('a:has-text("Teach Pip")').first().getAttribute('href');
    const drillHref = teachHref.replace('teach.html', 'drill.html');
    await page.goto(BASE + drillHref);
    await page.waitForSelector('#ptext:not(:empty)');
    for (let i = 0; i < 3; i++) {
      const t = await page.locator('#ptext').innerText();
      await page.fill('#fbText', 'five over six');
      await page.click('#fallback button');
      await page.waitForSelector('#fb .chip');
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: `${OUT}/2-drill.png`, fullPage: true });
    console.log('drill done');

    // 4. Teach.
    await page.goto(BASE + teachHref);
    await page.waitForSelector('#fallback[style*="flex"]');
    const say = async (text) => { await page.fill('#fbText', text); await page.click('#fallback button'); await page.waitForFunction(() => !document.getElementById('bubble').classList.contains('thinking')); await page.waitForTimeout(300); };
    await say("That's wrong.");
    await say('um I think you cant just add the bottoms? the bottom is like how big the pieces are I guess');
    let chip = await page.locator('#fluChip').innerText(); console.log('fluency after hesitant turn:', chip);
    if (!/hesitant/i.test(chip)) throw new Error('expected hesitant');
    await page.screenshot({ path: `${OUT}/3-teach-mid.png`, fullPage: true });
    await say('Half a pizza plus a third of a pizza is more than half. But your answer is smaller than a half. So it cant be right.');
    const belief = await page.locator('#beliefChip').innerText(); console.log('belief:', belief);
    if (!/released/i.test(belief)) throw new Error('expected release');
    await page.waitForSelector('#done[style*="flex"]');
    await page.screenshot({ path: `${OUT}/4-teach-released.png`, fullPage: true });

    // 5. Brief.
    await page.click('#briefLink');
    await page.waitForSelector('.quote');
    await page.screenshot({ path: `${OUT}/5-brief.png`, fullPage: true });
    console.log('brief ok');

    // 6. Phone width sanity.
    const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 800 });
    await m.goto(BASE + teachHref); await m.waitForSelector('#fallback[style*="flex"]');
    const sw = await m.evaluate(() => document.documentElement.scrollWidth); console.log('mobile scrollWidth', sw);
    if (sw > 392) throw new Error('horizontal overflow on mobile');
    await m.screenshot({ path: `${OUT}/6-mobile.png`, fullPage: true });
  } catch (e) { console.error('SMOKE FAILED:', e.message); failed = true; }
  await browser.close(); server.kill();
  process.exit(failed ? 1 : 0);
})();
