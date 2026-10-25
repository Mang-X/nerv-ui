export async function runLane(url, lane) {
  const fs = await import('node:fs/promises');
  const task = await taskSpace(31), page = task.page('p1');
  const records = [];
  const assert = (value, label) => { if (!value) throw Error(label) };
  const click = name => page.click(`button:text-is("${name}")`);
  const picker = '[data-slot="file-upload"] input[type=file]';
  const capture = async label => {
    const data = await page.evaluate(() => ({
      fixture: window.__nervUploadFixture?.readback(),
      rows: [...document.querySelectorAll('[data-slot="file-upload-row"]')].map(e => ({ status: e.dataset.status, text: e.textContent.trim() })),
      receipts: document.querySelector('[aria-label="成功回执"]')?.textContent,
      audit: window.__f02Audit, hash: location.hash,
    }));
    records.push({ label, ...data });
    await fs.writeFile(`/tmp/nerv-ui-t06-f02/browser-${lane}.json`, JSON.stringify(records, null, 2));
    return data;
  };
  async function fresh() {
    await page.goto(`${url}/#files`);
    await page.reload();
    await page.waitForFunction(() => !!window.__nervUploadFixture);
    await page.evaluate(() => {
      window.__f02Audit = { writes: [], errors: [] };
      const native = fetch.bind(window);
      window.fetch = (input, init) => { const method = init?.method || input?.method || 'GET'; if (!['GET','HEAD'].includes(method.toUpperCase())) window.__f02Audit.writes.push({ method, url: String(input) }); return native(input, init) };
      const open = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...rest) { if (!['GET','HEAD'].includes(method.toUpperCase())) window.__f02Audit.writes.push({ method, url: String(url) }); return open.call(this, method, url, ...rest) };
      addEventListener('error', e => { if (e.target === window) window.__f02Audit.errors.push(e.message) });
      addEventListener('unhandledrejection', e => window.__f02Audit.errors.push(String(e.reason)));
    });
  }
  async function choose() {
    await page.setInputFiles(picker, ['/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle/frontend/apps/playground/public/files/notes.txt']);
  }
  async function advance() { for (let i = 0; i < 3; i++) await click('推进传输') }
  for (const stage of ['create','transport','complete']) for (const action of ['pause','remove','clear','unmount','replace']) {
    await fresh();
    if (action === 'replace') await page.selectOption('select[aria-label="上传排列方式"]', 'avatar');
    if (stage === 'create') await page.click('label:has-text("等待创建会话")');
    if (stage === 'complete') await page.click('label:has-text("等待完成回执")');
    if (stage === 'transport') await page.click('label:has-text("模拟传输忽略取消")');
    await choose();
    const initial = await capture(`${stage}/${action} selected before explicit upload`);
    assert(initial.fixture.counts.create === 0 && initial.fixture.counts.transport === 0 && initial.fixture.counts.complete === 0, 'manual selection zero writes');
    await click('开始上传');
    await page.waitForFunction(s => { const r=window.__nervUploadFixture.readback(); return s==='create' ? r.gates.some(g=>g.stage==='create') : r.pending===1 }, stage);
    if (stage === 'complete') { await advance(); await page.waitForFunction(() => window.__nervUploadFixture.readback().gates.some(g=>g.stage==='complete')) }
    await capture(`${stage}/${action} entered await`);
    if (action === 'pause') await click('暂停全部');
    if (action === 'remove') await page.click('button[aria-label="移除 notes.txt"]');
    if (action === 'clear') await click('清空文件');
    if (action === 'unmount') { await page.click('a[href="#desktop"]'); await page.waitForFunction(() => location.hash === '#desktop' && !document.querySelector('[data-slot="file-upload"]')) }
    if (action === 'replace') await choose();
    const cancelled = await capture(`${stage}/${action} cancelled before late release`);
    if (stage !== 'create') assert(cancelled.fixture.attempts[0].aborted, 'cancel signals retained even after route disposal');
    // Fixture boundary intentionally survives the route; this releases old
    // already-issued host promises while the library stays disposed/cancelled.
    await page.evaluate(s => { const f=window.__nervUploadFixture; if(s==='transport'){f.advance();f.advance();f.advance()} else f.release(s) }, stage);
    await page.waitForFunction(() => { const r=window.__nervUploadFixture.readback(); return r.gates.length===0 && r.pending===0 });
    const late = await capture(`${stage}/${action} after late success`);
    assert(late.fixture.counts.transport === (stage === 'create' ? 0 : 1), 'late create cannot start transport');
    assert(late.fixture.counts.complete === (stage === 'complete' ? 1 : 0), 'late transfer cannot start complete');
    assert(late.fixture.receipts.length===0 && !late.fixture.events.some(e=>e.startsWith('receipt ')||e.startsWith('failed ')), 'invalid receipt or failure leaked');
    assert(late.audit.errors.length===0 && late.audit.writes.length===0, 'runtime error or network write');
    if(action === 'replace') assert(late.fixture.counts.create===1, 'replacement stays queued');
  }
  // Two complete requests overlap. Release the current one first.
  await fresh(); await page.click('label:has-text("等待完成回执")'); await choose(); await click('开始上传'); await advance();
  await page.waitForFunction(() => window.__nervUploadFixture.readback().gates.length===1);
  await click('暂停全部'); await click('继续全部'); await advance();
  await page.waitForFunction(() => window.__nervUploadFixture.readback().gates.length===2);
  await capture('resume has two issued complete gates');
  await page.evaluate(() => { const f=window.__nervUploadFixture; f.release('complete',false,f.readback().gates[1].id) });
  await page.waitForFunction(() => document.querySelector('[data-slot="file-upload-row"]')?.dataset.status==='completed');
  await page.evaluate(() => window.__nervUploadFixture.release('complete',true));
  const current = await capture('current receipt survives old complete failure');
  assert(current.fixture.receipts.length===1 && current.fixture.events.filter(e=>e.startsWith('receipt ')).length===1 && !current.fixture.events.some(e=>e.startsWith('failed ')), 'old completion changed current result');
  await page.click('button[aria-label="移除 notes.txt"]');
  await page.waitForFunction(() => window.__nervUploadFixture.readback().receipts.length===0);
  await capture('remove completed emits current empty snapshot');
  // Real host failures retain their stage; retry creates/uses valid sessions.
  await fresh(); await page.click('label:has-text("等待创建会话")'); await choose(); await click('开始上传'); await click('创建失败');
  await page.waitForSelector('[data-status=failed]'); await capture('create failure preserves reason');
  await page.click('button[aria-label="重试 notes.txt"]'); await click('释放创建');
  await page.waitForFunction(() => window.__nervUploadFixture.readback().pending===1);
  await click('本次传输失败'); await page.waitForSelector('[data-status=failed]'); await capture('transport failure preserves reason');
  await page.click('button[aria-label="重试 notes.txt"]'); await advance();
  await page.waitForSelector('[data-status=completed]'); await capture('retry succeeds after explicit failures');
  // Keep all seven layouts and actual image decoding available.
  for(const variant of ['default','queue','compact','avatar','gallery','table','image']) {
    await page.selectOption('select[aria-label="上传排列方式"]',variant);
    await page.setInputFiles(picker,['/Users/mang/Project/nerv-ui-worktrees/t06-f02-upload-lifecycle/frontend/apps/playground/public/files/garden.png']);
    await page.waitForFunction(() => [...document.querySelectorAll('[data-slot="file-upload-thumbnail"]')].some(i=>i.naturalWidth===640));
    await capture(`variant ${variant} real local thumbnail`); await click('清空文件');
  }
  await page.selectOption('select[aria-label="上传排列方式"]','queue');
  await page.screenshot({ path: `/tmp/nerv-ui-t06-f02/${lane}-files.png` });
  console.log({ lane, records: records.length }); console.log(await page.snapshot());
}
