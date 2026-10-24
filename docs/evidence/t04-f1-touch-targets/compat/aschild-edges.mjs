/* global taskSpace */
const fs = await import('node:fs/promises'),
  assert = (await import('node:assert/strict')).default
const out = '/tmp/nerv-ui-t04-touch-targets-compat/handoff/raw',
  t = await taskSpace(20),
  p = t.page('p1'),
  records = []
const mouse = async (x, y) => {
  for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased'])
    await p.cdp('Input.dispatchMouseEvent', {
      type,
      x,
      y,
      ...(type === 'mouseMoved' ? {} : { button: 'left', clickCount: 1 }),
    })
  await p.evaluate(() => true)
}
const sample = () =>
  p.evaluate(() => {
    const e = document.querySelector('[data-probe="aschild"]')
    e.scrollIntoView({ block: 'center' })
    const r = e.getBoundingClientRect()
    return {
      rect: r.toJSON(),
      points: [
        [0, 0],
        [21, 0],
        [-21, 0],
        [0, 21],
        [0, -21],
      ].map(([dx, dy]) => ({
        x: r.x + r.width / 2 + dx,
        y: r.y + r.height / 2 + dy,
        hit: e.contains(document.elementFromPoint(r.x + r.width / 2 + dx, r.y + r.height / 2 + dy)),
      })),
    }
  })
const state = () =>
  p.evaluate(() => ({
    checked: document.querySelector('[data-probe="aschild"]').getAttribute('aria-checked'),
    value: new FormData(document.querySelector('form')).get('reminder'),
    updates: Number(document.querySelector('#updates').textContent),
    neighbor: document.querySelector('input[name="neighbor"]').value,
  }))
for (const [width, height, dark] of [
  [390, 844, false],
  [390, 844, true],
  [844, 390, false],
  [844, 390, true],
]) {
  const id = width + 'x' + height + '-' + (dark ? 'dark' : 'light')
  await p.goto('http://127.0.0.1:4186/public-compatibility.test.html')
  await p.waitForSelector('[data-probe="aschild"]')
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await p.evaluate((d) => {
    document.documentElement.classList.toggle('dark', d)
    window.__compatClicks = []
    document.addEventListener('click', (e) =>
      window.__compatClicks.push({
        trusted: e.isTrusted,
        probe: e.target.closest('[data-probe]')?.dataset.probe,
      }),
    )
  }, dark)
  const actions = []
  for (let i = 0; i < 5; i++) {
    await p.click('#reset')
    const g = await sample()
    assert.equal(g.rect.width, 51)
    assert.equal(g.rect.height, 44)
    assert(g.points.every((x) => x.hit))
    const before = await state()
    await mouse(g.points[i].x, g.points[i].y)
    const after = await state()
    assert.deepEqual(after, {
      checked: 'true',
      value: 'yes',
      updates: before.updates + 1,
      neighbor: 'independent',
    })
    actions.push({ geometry: g, point: g.points[i], before, after })
  }
  const disabled = []
  for (const [dx, dy] of [
    [0, 0],
    [21, 0],
    [-21, 0],
    [0, 21],
    [0, -21],
  ]) {
    const point = await p.evaluate(
      ([dx, dy]) => {
        const e = document.querySelector('[data-probe="aschild-disabled"]')
        e.scrollIntoView({ block: 'center' })
        const r = e.getBoundingClientRect()
        return { x: r.x + r.width / 2 + dx, y: r.y + r.height / 2 + dy }
      },
      [dx, dy],
    )
    const before = await state()
    await mouse(point.x, point.y)
    assert.deepEqual(await state(), before)
    disabled.push(point)
  }
  await p.fill('input[name="neighbor"]', '仍可编辑')
  assert.equal((await state()).neighbor, '仍可编辑')
  const layout = await p.evaluate(() => {
    const s = document.querySelector('[data-probe="aschild"]'),
      input = document.querySelector('input[name="neighbor"]')
    const a = s.getBoundingClientRect(),
      b = input.getBoundingClientRect()
    return {
      width: innerWidth,
      docWidth: document.documentElement.scrollWidth,
      overlap:
        Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
        Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top),
      trusted: window.__compatClicks.every((e) => e.trusted),
      rootClickCount: window.__compatClicks.filter((e) => e.probe === 'aschild').length,
    }
  })
  assert.equal(layout.width, width)
  assert(layout.docWidth <= width)
  assert.equal(layout.overlap, false)
  assert(layout.trusted)
  assert.equal(layout.rootClickCount, 5)
  records.push({ id, actions, disabled, layout })
  await fs.writeFile(out + '/aschild-edges.json', JSON.stringify(records, null, 2))
  console.log(id, 'asChild actual edge clicks5/disabled5 PASS')
}
