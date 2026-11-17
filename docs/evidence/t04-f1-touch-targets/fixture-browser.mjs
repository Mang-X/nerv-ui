// Evidence replay: create an owned TaskSpace and replace taskSpace(17) once for all scripts.
/* global taskSpace */
const fs = await import('node:fs/promises'),
  assert = (await import('node:assert/strict')).default,
  t = await taskSpace(17),
  p = t.page('p1'),
  out = '/tmp/nerv-ui-t04-touch-targets/browser',
  results = []
const frame = () => p.evaluate(() => true)
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
  await frame()
}
const sample = async (sel) => {
  await p.evaluate(
    (sel) => document.querySelector(sel).scrollIntoView({ block: 'center', inline: 'nearest' }),
    sel,
  )
  await frame()
  return p.evaluate((sel) => {
    const e = document.querySelector(sel),
      r = e.getBoundingClientRect(),
      cx = r.x + r.width / 2,
      cy = r.y + r.height / 2
    return {
      selector: sel,
      rect: r.toJSON(),
      viewport: [innerWidth, innerHeight],
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
      focus: document.activeElement === e,
    }
  }, sel)
}
const state = () =>
  p.evaluate(() => ({
    nav: document.querySelector('[aria-label="导航事件"]').textContent.trim(),
    clicks: Number(document.querySelector('[aria-label="按钮事件"]').textContent),
    quantity: Number(document.querySelector('[aria-label="步进值"]').textContent),
    checked: document.querySelector('[aria-label="开关值"]').textContent.trim() === 'true',
    form: new FormData(document.querySelector('form')).get('reminder'),
    input: document.querySelector('input[aria-label="邻近输入"]').value,
  }))
const click = async (sel) => {
  const s = await sample(sel)
  await mouse(s.points[0].x, s.points[0].y)
}
for (const [w, h, dark] of [
  [390, 844, false],
  [390, 844, true],
  [844, 390, false],
  [844, 390, true],
]) {
  const id = `${w}x${h}-${dark ? 'dark' : 'light'}`
  await fs.appendFile(out + '/fixture-progress.log', id + ' start\n')
  await p.goto('http://127.0.0.1:4186/touch-targets.test.html')
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await p.evaluate((dark) => {
    document.documentElement.classList.toggle('dark', dark)
    window.__trusted = []
    document.addEventListener('click', (e) =>
      window.__trusted.push({
        label: e.target.closest('button,a')?.getAttribute('aria-label'),
        trusted: e.isTrusted,
      }),
    )
  }, dark)
  await frame()
  await p.evaluate(() =>
    document
      .querySelectorAll('.nv-m-mswitch-track,.nv-m-mswitch-thumb')
      .forEach((e) => (e.style.transition = 'none')),
  )
  await p.fill('input[aria-label="邻近输入"]', '独立输入')
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  })
  const records = []
  for (const [sel, kind] of [
    ['button[aria-label="返回"]', 'back'],
    ['button[aria-label="按钮 sm"]', 'button'],
    ['button[aria-label="按钮 md"]', 'button'],
    ['button[aria-label="按钮 lg"]', 'button'],
    ['button[aria-label="短文字"]', 'button'],
    ['button[aria-label="描边按钮"]', 'button'],
    ['a[aria-label="链接按钮"]', 'button'],
    ['button[aria-label="减少"]', 'dec'],
    ['button[aria-label="增加"]', 'inc'],
    ['button[aria-label="受控开关"]', 'switch'],
  ]) {
    await fs.appendFile(out + '/fixture-progress.log', id + ' ' + sel + ' start\n')
    const geometry = await sample(sel)
    assert.deepEqual(geometry.viewport, [w, h])
    assert(geometry.rect.width >= 44 && geometry.rect.height >= 44)
    assert(geometry.points.every((pt) => pt.hit))
    const actions = []
    for (let i = 0; i < 5; i++) {
      await click('button[aria-label="外部复位"]')
      const g = await sample(sel),
        before = await state(),
        point = g.points[i]
      await mouse(point.x, point.y)
      const after = await state()
      if (kind === 'back')
        assert.equal(Number(after.nav.split('/')[0]), Number(before.nav.split('/')[0]) + 1)
      else if (kind === 'button') assert.equal(after.clicks, before.clicks + 1)
      else if (kind === 'inc') assert.equal(after.quantity, 3)
      else if (kind === 'dec') assert.equal(after.quantity, 1)
      else {
        assert.equal(after.checked, true)
        assert.equal(after.form, 'yes')
        const style = await p.evaluate(
          () =>
            getComputedStyle(
              document.querySelector('button[aria-label="受控开关"] .nv-m-mswitch-track'),
            ).backgroundColor,
        )
        assert(!style.includes('/ 0.35'))
      }
      assert.equal(after.input, '独立输入')
      actions.push({ point, before, after })
    }
    records.push({ geometry, actions })
    await fs.writeFile(out + '/fixture-partial.json', JSON.stringify({ id, records }, null, 2))
  }
  // Disabled and loading: real input sends no public action.
  await click('button[aria-label="保存任务"]')
  const loading = await state()
  for (const sel of [
    'button[aria-label="保存任务"]',
    'button[aria-label="禁用按钮"]',
    'button[aria-label="禁用开关"]',
  ]) {
    const g = await sample(sel)
    await mouse(g.points[0].x, g.points[0].y)
    assert.deepEqual(await state(), loading)
  }
  await click('button[aria-label="外部复位"]')
  await click('button[aria-label="减少"]')
  const minimum = await state()
  await click('button[aria-label="减少"]')
  assert.deepEqual(await state(), minimum)
  await click('button[aria-label="外部复位"]')
  for (let i = 0; i < 3; i++) await click('button[aria-label="增加"]')
  const maximum = await state()
  await click('button[aria-label="增加"]')
  assert.deepEqual(await state(), maximum)
  const independence = await p.evaluate(() => {
    const rect = (e) => e.getBoundingClientRect().toJSON(),
      s = document.querySelector('[data-slot="stepper"]')
    const dec = s.querySelector('button[aria-label="减少"]'),
      inc = s.querySelector('button[aria-label="增加"]'),
      input = s.querySelector('input')
    return { dec: rect(dec), input: rect(input), inc: rect(inc) }
  })
  assert(
    independence.dec.right <= independence.input.left &&
      independence.input.right <= independence.inc.left,
  )
  // Native keyboard activation and focus remain on each action root.
  const keys = []
  await click('button[aria-label="外部复位"]')
  for (const [sel, key, kind] of [
    ['button[aria-label="返回"]', 'Enter', 'nav'],
    ['button[aria-label="按钮 sm"]', 'Space', 'button'],
    ['a[aria-label="链接按钮"]', 'Enter', 'button'],
    ['button[aria-label="增加"]', 'Enter', 'inc'],
    ['button[aria-label="受控开关"]', 'Space', 'switch'],
  ]) {
    await p.focus(sel)
    const before = await state()
    await p.keyboard.press(key)
    await frame()
    const after = await state()
    if (kind === 'button') assert.equal(after.clicks, before.clicks + 1)
    else if (kind === 'inc') assert.equal(after.quantity, before.quantity + 1)
    else if (kind === 'switch') assert.equal(after.checked, !before.checked)
    else assert.notEqual(after.nav, before.nav)
    assert(await p.evaluate((sel) => document.activeElement === document.querySelector(sel), sel))
    keys.push({ sel, key, before, after })
  }
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await p.evaluate(() => window.scrollTo(0, 0))
  await frame()
  const shot = await p.cdp('Page.captureScreenshot', { format: 'png' })
  await fs.writeFile(out + '/' + id + '-fixture.png', Buffer.from(shot.data, 'base64'))
  const trusted = await p.evaluate(() => ({
    all: window.__trusted.every((x) => x.trusted),
    count: window.__trusted.length,
    viewport: [innerWidth, innerHeight],
    docWidth: document.documentElement.scrollWidth,
  }))
  assert(trusted.all)
  assert.deepEqual(trusted.viewport, [w, h])
  assert(trusted.docWidth <= w)
  const layout = await p.evaluate(() => {
    const elements = [...document.querySelectorAll('button,a,input:not([type="checkbox"])')]
    const overlaps = []
    for (let i = 0; i < elements.length; i++)
      for (let j = i + 1; j < elements.length; j++) {
        const a = elements[i].getBoundingClientRect(),
          b = elements[j].getBoundingClientRect()
        if (
          Math.min(a.right, b.right) > Math.max(a.left, b.left) &&
          Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top)
        )
          overlaps.push([elements[i].outerHTML.slice(0, 160), elements[j].outerHTML.slice(0, 160)])
      }
    const title = document.querySelector('[data-slot="nav-bar"] .truncate'),
      r = title.getBoundingClientRect()
    return {
      overlaps,
      titleHit: title.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)),
    }
  })
  assert.deepEqual(layout.overlaps, [])
  assert(layout.titleHit)
  await p.cdp('Input.dispatchMouseEvent', {
    type: 'mouseWheel',
    x: w / 2,
    y: h / 2,
    deltaX: 0,
    deltaY: 450,
  })
  await p.waitForFunction(() => window.scrollY > 0)
  const scroll = await p.evaluate(() => window.scrollY)
  results.push({
    id,
    records,
    loading,
    minimum,
    maximum,
    independence,
    keys,
    trusted,
    layout,
    scroll,
  })
  await fs.writeFile(out + '/fixture-green.json', JSON.stringify(results, null, 2))
  console.log(id, 'fixture GREEN', records.length * 5, 'edge/center actions')
}
