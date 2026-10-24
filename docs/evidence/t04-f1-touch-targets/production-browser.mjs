// Evidence replay: create an owned TaskSpace and replace taskSpace(17) once for all scripts.
/* global taskSpace */
const fs = await import('node:fs/promises'),
  crypto = await import('node:crypto'),
  assert = (await import('node:assert/strict')).default,
  t = await taskSpace(17),
  p = t.page('p1'),
  out = '/tmp/nerv-ui-t04-touch-targets/browser',
  results = []
const mouse = async (x, y) => {
  await p.cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await p.cdp('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button: 'left',
    clickCount: 1,
  })
  await p.cdp('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button: 'left',
    clickCount: 1,
  })
}
const sample = async (sel) =>
  p.evaluate((sel) => {
    const e = document.querySelector(sel)
    e.scrollIntoView({ block: 'center', inline: 'nearest' })
    const r = e.getBoundingClientRect(),
      cx = r.x + r.width / 2,
      cy = r.y + r.height / 2
    return {
      selector: sel,
      viewport: [innerWidth, innerHeight],
      rect: r.toJSON(),
      points: [
        [0, 0],
        [21, 0],
        [-21, 0],
        [0, 21],
        [0, -21],
      ].map(([dx, dy]) => ({
        x: cx + dx,
        y: cy + dy,
        dx,
        dy,
        hit: e.contains(document.elementFromPoint(cx + dx, cy + dy)),
      })),
      surface: {
        beforeHeight: getComputedStyle(e, '::before').height,
        trackHeight: e.querySelector('.nv-m-mswitch-track')?.getBoundingClientRect().height,
      },
    }
  }, sel)
const click = async (sel) => {
  const g = await sample(sel)
  await mouse(g.points[0].x, g.points[0].y)
}
const shot = async (name) => {
  const r = await p.cdp('Page.captureScreenshot', { format: 'png' })
  await fs.writeFile(out + '/' + name + '.png', Buffer.from(r.data, 'base64'))
}
for (const [w, h, dark] of [
  [390, 844, false],
  [390, 844, true],
  [844, 390, false],
  [844, 390, true],
]) {
  const id = `${w}x${h}-${dark ? 'dark' : 'light'}`
  await fs.appendFile(out + '/production-progress.log', id + ' start\n')
  await p.goto('http://127.0.0.1:4187/?green=' + id + '#mobile')
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  })
  if ((await p.evaluate(() => document.documentElement.classList.contains('dark'))) !== dark)
    await click('button[aria-label="切换明暗"]')
  const nav = await sample('button[aria-label="返回"]')
  assert(nav.rect.width >= 44 && nav.rect.height >= 44 && nav.points.every((x) => x.hit))
  nav.actions = []
  for (let i = 0; i < 5; i++) {
    await click('[data-slot="tab-bar"] button:last-child')
    assert.equal(
      await p.evaluate(() => document.querySelector('[aria-label="当前页面"]').textContent.trim()),
      '我的收藏',
    )
    const g = await sample('button[aria-label="返回"]')
    await mouse(g.points[i].x, g.points[i].y)
    const after = await p.evaluate(() =>
      document.querySelector('[aria-label="当前页面"]').textContent.trim(),
    )
    assert.equal(after, '附近好去处')
    nav.actions.push({ point: g.points[i], after })
  }
  const title = await p.evaluate(() => {
    const title = document.querySelector('[data-slot="nav-bar"] .truncate'),
      r = title.getBoundingClientRect(),
      hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    return {
      titleHit: title.contains(hit),
      right: document
        .querySelector('button[aria-label="切换明暗"]')
        .getBoundingClientRect()
        .toJSON(),
    }
  })
  assert(title.titleHit)
  await shot(id + '-green-nav')
  await p.evaluate(() => (location.hash = 'mobile-input'))
  await p.waitForSelector('button[aria-label="持续接收扫码"]')
  await p.waitForFunction(
    () => document.querySelector('[aria-label="扫码状态"]').textContent === '扫码接收中',
  )
  await p.click('button[aria-label="持续接收扫码"]')
  await p.waitForFunction(
    () => document.querySelector('[aria-label="扫码状态"]').textContent === '扫码已暂停',
  )
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await p.evaluate(() =>
    [...document.querySelectorAll('button')]
      .find((b) => b.textContent.trim() === '清空标题')
      .setAttribute('data-sm-probe', ''),
  )
  const targets = []
  for (const [sel, kind] of [
    ['[data-sm-probe]', 'sm'],
    ['button[aria-label="清空数值"]', 'md'],
    ['button[aria-label="保存记录"]', 'lg'],
    ['button[aria-label="减少"]', 'dec'],
    ['button[aria-label="增加"]', 'inc'],
    ['button[aria-label="灵感提醒"]', 'switch'],
  ]) {
    await fs.appendFile(out + '/production-progress.log', id + ' ' + kind + '\n')
    const geometry = await sample(sel)
    assert.deepEqual(geometry.viewport, [w, h])
    assert(
      geometry.rect.width >= 44 &&
        geometry.rect.height >= 44 &&
        geometry.points.every((x) => x.hit),
    )
    const actions = []
    for (let i = 0; i < 5; i++) {
      if (kind === 'sm') await p.fill('#note-title', '边缘记录')
      if (kind === 'dec' || kind === 'inc') await p.fill('[data-slot="stepper"] input', '2')
      if (kind === 'md') {
        await p.click('#note-number')
        await p.waitForSelector('[data-slot="number-keyboard"]')
        await p.evaluate(() => {
          const root = document.querySelector('[data-slot="number-keyboard"]')
          for (const [text, id] of [
            ['1', 'one'],
            ['收下数值', 'confirm'],
          ])
            root.querySelectorAll('button').forEach((b) => {
              if (b.textContent.trim() === text) b.setAttribute('data-key-probe', id)
            })
        })
        await p.click('[data-key-probe="one"]')
        await p.click('[data-key-probe="confirm"]')
        await p.waitForFunction(() => !document.querySelector('[data-slot="number-keyboard"]'))
        assert.notEqual(await p.evaluate(() => document.querySelector('#note-number').value), '')
      }
      await p.cdp('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: h,
        deviceScaleFactor: 1,
        mobile: false,
      })
      const before = await p.evaluate(() => ({
        checked: document
          .querySelector('button[aria-label="灵感提醒"]')
          .getAttribute('aria-checked'),
        action: document.querySelector('[aria-label="操作回显"]').textContent,
      }))
      const g = await sample(sel),
        point = g.points[i]
      assert(point.hit)
      await mouse(point.x, point.y)
      const after = await p.evaluate(() => ({
        title: document.querySelector('#note-title').value,
        number: document.querySelector('#note-number').value,
        copies: document.querySelector('[aria-label="份数回显"]').textContent.trim(),
        checked: document
          .querySelector('button[aria-label="灵感提醒"]')
          .getAttribute('aria-checked'),
        action: document.querySelector('[aria-label="操作回显"]').textContent,
      }))
      if (kind === 'sm') assert.equal(after.title, '')
      if (kind === 'md') assert.equal(after.number, '')
      if (kind === 'lg') assert.notEqual(after.action, before.action)
      if (kind === 'inc') assert.equal(after.copies, '3 份')
      if (kind === 'dec') assert.equal(after.copies, '1 份')
      if (kind === 'switch') assert.notEqual(after.checked, before.checked)
      actions.push({ point, before, after })
    }
    targets.push({ geometry, actions })
    await fs.writeFile(
      out + '/production-partial.json',
      JSON.stringify({ id, nav, targets }, null, 2),
    )
    if (kind === 'inc') await shot(id + '-green-details')
    if (kind === 'switch') await shot(id + '-green-switch')
  }
  const geometry = await p.evaluate(() => ({
    viewport: [innerWidth, innerHeight],
    dark: document.documentElement.classList.contains('dark'),
    docWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    mainOverflow: getComputedStyle(document.querySelector('main[data-shell]')).overflowY,
  }))
  assert.deepEqual(geometry.viewport, [w, h])
  assert.equal(geometry.dark, dark)
  assert.equal(geometry.docWidth, w)
  assert.equal(geometry.bodyWidth, w)
  await p.evaluate(() => (document.querySelector('main[data-shell]').scrollTop = 0))
  await p.cdp('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: w / 2,
    y: h / 2,
    deltaX: 0,
    deltaY: 500,
  })
  await p.waitForFunction(() => document.querySelector('main[data-shell]').scrollTop > 0)
  const scroll = await p.evaluate(() => document.querySelector('main[data-shell]').scrollTop)
  // Fetch exact resources through this browser and compare each response with local dist bytes.
  const urls = await p.evaluate(() => [
    '/',
    ...new Set([
      ...Array.from(document.querySelectorAll('script[src],link[rel="stylesheet"]')).map(
        (e) => new URL(e.src || e.href).pathname,
      ),
      ...performance
        .getEntriesByType('resource')
        .filter(
          (e) =>
            new URL(e.name).origin === location.origin &&
            new URL(e.name).pathname.startsWith('/assets/'),
        )
        .map((e) => new URL(e.name).pathname),
    ]),
  ])
  const resources = []
  for (const url of urls) {
    const file = out + '/' + id + '-' + url.split('/').pop()
    const response = await p.fetch(url, { saveAs: file })
    const actual = await fs.readFile(file),
      dist = await fs.readFile(
        '/Users/mang/Project/nerv-ui-worktrees/t04-touch-targets/frontend/apps/playground/dist/' +
          (url === '/' ? 'index.html' : url.slice(1)),
      )
    assert.equal(response.status, 200)
    assert(actual.equals(dist))
    resources.push({
      url,
      status: response.status,
      headers: response.headers,
      bytes: actual.length,
      sha256: crypto.createHash('sha256').update(actual).digest('hex'),
      byteEqual: true,
    })
  }
  results.push({ id, nav, title, targets, geometry, scroll, resources })
  await fs.writeFile(out + '/production-green.json', JSON.stringify(results, null, 2))
  console.log(id, 'production GREEN', targets.length * 5 + 5, 'actual center/edge actions')
}
