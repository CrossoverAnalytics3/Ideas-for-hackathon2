// Headless walk of hosted.html (the single-file version). Serve app/ on :3499 first:
//   python3 -m http.server 3499   then   node test/walk-hosted.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript(() => { delete window.webkitSpeechRecognition; delete window.SpeechRecognition; window.speechSynthesis = undefined; });
  const page = await ctx.newPage(); let bad = 0;
  page.on('pageerror', e => { console.error('PAGE ERROR', e.stack || e.message); bad++; });
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|fonts/.test(m.text())) console.error('console.error:', m.text()); });
  await page.goto('http://localhost:3499/hosted.html');
  await page.click('#sampleBtn'); await page.waitForSelector('#results:not([hidden])');
  console.log('rows', await page.locator('.result').count(), '| mode chip:', await page.locator('#modeChip').innerText());
  await page.screenshot({ path: '/tmp/shots/h1.png', fullPage: true });
  await page.click('.result button[data-go2="drill"]'); await page.waitForSelector('#s-drill.on');
  for (let i = 0; i < 3; i++) { await page.fill('#dText2', 'five over six'); await page.click('#dTyped button'); await page.waitForTimeout(1600); }
  console.log('drill done:', await page.locator('#dDone').evaluate(e => e.classList.contains('on')));
  await page.click('#dDone button'); await page.waitForSelector('#s-teach.on');
  await page.waitForFunction(() => !document.getElementById('typedBtn').disabled);
  const say = async t => { await page.fill('#typedText', t); await page.click('#typedBtn'); await page.waitForFunction(() => !document.getElementById('bubble').classList.contains('thinking')); await page.waitForTimeout(400); };
  await say("That's wrong."); await say('um I think the bottom is like how big the pieces are I guess');
  console.log('fluency:', await page.locator('#fluChip').innerText());
  await say('Half a pizza plus a third is more than half but your answer is smaller than a half so it cant be right');
  console.log('belief:', await page.locator('#beliefChip').innerText());
  await page.screenshot({ path: '/tmp/shots/h2.png', fullPage: true });
  await page.click('#done button[data-go="brief"]'); await page.waitForSelector('#s-brief.on');
  console.log('brief quote:', (await page.locator('.quote').innerText()).slice(0, 60));
  await page.screenshot({ path: '/tmp/shots/h3.png', fullPage: true });
  // nav back to Photo and re-run sample to ensure state resets
  await page.click('nav .tab[data-go="intake"]'); await page.click('#sampleBtn'); await page.waitForSelector('#results:not([hidden])');
  await page.click('.result button[data-go2="teach"]'); await page.waitForFunction(() => !document.getElementById('typedBtn').disabled);
  console.log('re-teach ok, transcript turns:', await page.locator('.turn').count());
  const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 800 }); await m.goto('http://localhost:3499/hosted.html'); await m.click('#sampleBtn'); await m.waitForSelector('#results:not([hidden])');
  console.log('mobile scrollWidth', await m.evaluate(() => document.documentElement.scrollWidth));
  await b.close(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('WALK FAILED', e.message); process.exit(1); });
