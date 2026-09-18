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
  await page.click('#fStart');
  for (let i = 0; i < 5; i++) { await page.waitForFunction(() => D && D.stage === 'answer', null, { timeout: 5000 }); const n = await page.evaluate(() => FLASH_SETS[D.i]); await page.fill('#dText2', i === 2 ? 'five and one' : String(n)); await page.click('#dTypedBtn'); await page.waitForTimeout(100); }
  await page.waitForSelector('#dDone.on'); console.log('flash:', await page.locator('#fCorrect').innerText(), 'avg', await page.locator('#fRt').innerText());
  await page.click('#dDone button'); await page.waitForSelector('#s-teach.on');
  await page.waitForFunction(() => !document.getElementById('typedBtn').disabled);
  console.log('paper:', (await page.locator('#sumwrap').innerText()).replace(/\s+/g, ' '), '| blocks on:', await page.locator('#blocks.on').count());
  const say = async t => { await page.fill('#typedText', t); await page.click('#typedBtn'); await page.waitForFunction(() => !document.getElementById('bubble').classList.contains('thinking')); await page.waitForTimeout(400); };
  await say("That's wrong.");
  await page.click('#bTrade'); await page.waitForFunction(() => !T.busy); console.log('after trade count:', await page.locator('#bCount').innerText(), '| pip said:', (await page.locator('#bubble').innerText()).slice(0, 40));
  await page.evaluate(() => { const ids = [...document.querySelectorAll('#btray .rod:not(.taken)')].slice(0, 2).map(e => e.dataset.id).concat([...document.querySelectorAll('#btray .cube:not(.taken)')].slice(0, 7).map(e => e.dataset.id)); ids.forEach(id => document.querySelector(`[data-id="${id}"]`).click()); });
  console.log('blocks count:', await page.locator('#bCount').innerText(), '| done:', await page.evaluate(() => B.doneOnce));
  await say('um I think you cant take 7 from 3 I guess');
  console.log('fluency:', await page.locator('#fluChip').innerText());
  if (!(await page.evaluate(() => T.over))) await say('So you trade a ten for ten ones. The ten is still there, its just ten little ones now, and then you have 13 ones and you can take 7 away.');
  else console.log('released on blocks + one verbal criterion');
  console.log('belief:', await page.locator('#beliefChip').innerText());
  await page.waitForSelector('#transfer.on'); console.log('round 3 shown, problem:', await page.locator('#xText').innerText());
  await page.click('#xHintBtn'); console.log('hint 1:', (await page.locator('#xHintText').innerText()).slice(0, 50));
  const ans = await page.evaluate(() => X.correct); await page.fill('#xTypedText', ans); await page.click('#xTyped button');
  await page.waitForSelector('#done.on'); console.log('transfer fb:', await page.locator('#xFb').innerText());
  await page.screenshot({ path: '/tmp/shots/h2.png', fullPage: true });
  await page.click('#done button[data-go="compare"]'); await page.waitForSelector('#s-compare.on'); await page.waitForTimeout(300);
  console.log('score cells:', await page.locator('#score > div').count(), '| plan words:', (await page.locator('#planText').innerText()).split(/\s+/).length);
  await page.screenshot({ path: '/tmp/shots/h4.png', fullPage: true });
  await page.click('nav .tab[data-go="brief"]'); await page.waitForSelector('#s-brief.on');
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
