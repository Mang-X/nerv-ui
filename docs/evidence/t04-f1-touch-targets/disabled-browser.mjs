// Evidence replay: create an owned TaskSpace and replace taskSpace(17) once for all scripts.
/* global taskSpace */
const fs = await import('node:fs/promises'),
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
const points = (sel) =>
  p.evaluate((sel) => {
    const e = document.querySelector(sel)
    e.scrollIntoView({ block: 'center' })
    const r = e.getBoundingClientRect()
    return [
      [0, 0],
      [21, 0],
      [-21, 0],
      [0, 21],
      [0, -21],
    ].map(([dx, dy]) => ({ x: r.x + r.width / 2 + dx, y: r.y + r.height / 2 + dy }))
  }, sel)
const state = () =>
  p.evaluate(() => ({
    clicks: document.querySelector('[aria-label="按钮事件"]').textContent,
    quantity: document.querySelector('[aria-label="步进值"]').textContent,
    checked: document.querySelector('[aria-label="开关值"]').textContent,
    nav: document.querySelector('[aria-label="导航事件"]').textContent,
  }))
for (const [w, h, dark] of [
  [390, 844, false],
  [390, 844, true],
  [844, 390, false],
  [844, 390, true],
]) {
  const id = `${w}x${h}-${dark ? 'dark' : 'light'}`
  await p.goto('http://127.0.0.1:4186/touch-targets.test.html')
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await p.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), dark)
  await p.click('button[aria-label="保存任务"]')
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  })
  const before = await state(),
    records = []
  for (const sel of [
    'button[aria-label="保存任务"]',
    'button[aria-label="禁用按钮"]',
    'button[aria-label="禁用开关"]',
  ]) {
    const pts = await points(sel)
    for (const pt of pts) {
      await mouse(pt.x, pt.y)
      assert.deepEqual(await state(), before)
    }
    records.push({ sel, points: pts, inert: true })
  }
  await p.focus('a[aria-label="链接按钮"]')
  await p.keyboard.press('Tab')
  assert(
    await p.evaluate(
      () => document.activeElement === document.querySelector('input[aria-label="邻近输入"]'),
    ),
  )
  for (const [n, sel] of [
    ['1', 'button[aria-label="减少"]'],
    ['5', 'button[aria-label="增加"]'],
  ]) {
    await p.fill('[data-slot="stepper"] input', n)
    await p.press('[data-slot="stepper"] input', 'Tab')
    await p.cdp('Emulation.setDeviceMetricsOverride', {
      width: w,
      height: h,
      deviceScaleFactor: 1,
      mobile: false,
    })
    assert(await p.evaluate((sel) => document.querySelector(sel).disabled, sel))
    const current = await state(),
      pts = await points(sel)
    for (const pt of pts) {
      await mouse(pt.x, pt.y)
      assert.deepEqual(await state(), current)
    }
    records.push({ sel, points: pts, inert: true })
  }
  results.push({ id, records, tabSkipsDisabled: true })
  await fs.writeFile(out + '/disabled-edges.json', JSON.stringify(results, null, 2))
  console.log(id, '25 disabled/loading edge clicks inert')
}
