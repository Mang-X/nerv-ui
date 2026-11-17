/* global taskSpace */
// Replay with an owned TaskSpace; public fixture uses the current package barrel.
const fs = await import('node:fs/promises')
const assert = (await import('node:assert/strict')).default
const out = '/tmp/nerv-ui-t04-touch-targets-compat/handoff/raw'
const phase = (await fs.readFile(out + '/phase.txt', 'utf8')).trim()
const t = await taskSpace('nerv-ui PR57 compatibility fix 20261025')
const p = t.page('p1')
const records = []
const failures = []
const test = async (name, run) => {
  try {
    await run()
    console.log('PASS', name)
  } catch (error) {
    failures.push({ name, message: error.message })
    console.log('FAIL', name, error.message)
  }
}
const frame = () => p.evaluate(() => true)
const ax = async (selector) => {
  const { root } = await p.cdp('DOM.getDocument')
  const { nodeId } = await p.cdp('DOM.querySelector', { nodeId: root.nodeId, selector })
  const { node } = await p.cdp('DOM.describeNode', { nodeId })
  const tree = await p.cdp('Accessibility.getPartialAXTree', {
    backendNodeId: node.backendNodeId,
    fetchRelatives: false,
  })
  return tree.nodes.find((n) => n.backendDOMNodeId === node.backendNodeId)
}
for (const dark of [false, true]) {
  await p.goto('http://127.0.0.1:4186/public-compatibility.test.html')
  await p.waitForSelector('[data-probe="aschild"]')
  await p.cdp('Emulation.setDeviceMetricsOverride', {
    width: 900,
    height: 850,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await p.evaluate((dark) => document.documentElement.classList.toggle('dark', dark), dark)
  await frame()
  // Theme changes animate the public root background; sample after the actual paint settles.
  await p.waitForFunction(() =>
    ['destructive', 'anchor'].every(
      (name) =>
        getComputedStyle(document.querySelector('[data-probe="' + name + '"]')).backgroundColor ===
        getComputedStyle(document.querySelector('#color-reference')).backgroundColor,
    ),
  )
  const styles = await p.evaluate(() => {
    const paint = (e) => {
      const s = getComputedStyle(e),
        b = getComputedStyle(e, '::before')
      const track = e.querySelector('.nv-m-mswitch-track')
      return {
        background: s.backgroundColor,
        color: s.color,
        border: s.borderWidth,
        before: { content: b.content, background: b.backgroundColor, border: b.borderWidth },
        track: track && { background: getComputedStyle(track).backgroundColor },
        rect: e.getBoundingClientRect().toJSON(),
        hidden: e.getAttribute('aria-hidden'),
        pointer: s.pointerEvents,
      }
    }
    return {
      reference: paint(document.querySelector('#color-reference')),
      probes: Object.fromEntries(
        [...document.querySelectorAll('[data-probe]')].map((e) => [e.dataset.probe, paint(e)]),
      ),
    }
  })
  const record = { dark, styles, ax: [], actions: [] }
  records.push(record)
  const visiblePaint = (s) => [
    s.background,
    ...(s.before.content !== 'none' ? [s.before.background] : []),
    ...(s.track ? [s.track.background] : []),
  ]
  for (const name of ['transparent', 'stepper'])
    await test(`root class controls ${name} paint (${dark})`, async () => {
      assert(
        visiblePaint(styles.probes[name]).every((bg) => bg === 'rgba(0, 0, 0, 0)'),
        JSON.stringify(styles.probes[name]),
      )
      if (name === 'stepper') {
        assert.equal(styles.probes[name].border, '0px')
        if (styles.probes[name].before.content !== 'none')
          assert.equal(styles.probes[name].before.border, '0px')
      }
    })
  for (const name of ['destructive', 'anchor', 'switch-color'])
    await test(`root class controls ${name} paint (${dark})`, async () => {
      const s = styles.probes[name],
        expected = styles.reference.background
      assert.equal(s.background, expected)
      assert(
        visiblePaint(s).every((bg) => bg === 'rgba(0, 0, 0, 0)' || bg === expected),
        JSON.stringify(s),
      )
      if (name !== 'switch-color') assert.equal(s.color, styles.reference.color)
    })
  const selector = '[data-probe="aschild"]'
  const beforeAX = await ax(selector)
  record.ax.push({ state: 'unfocused', node: beforeAX })
  await test(`asChild exposes unfocused switch and 51x44 root (${dark})`, async () => {
    assert.equal(beforeAX.ignored, false)
    assert.equal(beforeAX.role.value, 'switch')
    assert.equal(beforeAX.name.value, '公开提醒')
    assert(beforeAX.properties.some((p) => p.name === 'focusable' && p.value.value === true))
    assert(beforeAX.properties.some((p) => p.name === 'checked' && p.value.value === 'false'))
    assert.equal(styles.probes.aschild.hidden, null)
    assert.equal(styles.probes.aschild.pointer, 'auto')
    assert.equal(styles.probes.aschild.rect.width, 51)
    assert.equal(styles.probes.aschild.rect.height, 44)
  })
  await p.focus(selector)
  await p.keyboard.press('Enter')
  await frame()
  const afterAX = await ax(selector)
  record.ax.push({ state: 'focused-checked', node: afterAX })
  const state = await p.evaluate(() => ({
    checked: document.querySelector('[data-probe="aschild"]').getAttribute('aria-checked'),
    form: new FormData(document.querySelector('form')).get('reminder'),
    updates: Number(document.querySelector('#updates').textContent),
    focus: document.activeElement === document.querySelector('[data-probe="aschild"]'),
  }))
  record.actions.push(state)
  await test(`asChild keyboard has one update native value and focused AX (${dark})`, async () => {
    assert.deepEqual(state, { checked: 'true', form: 'yes', updates: 1, focus: true })
    assert.equal(afterAX.ignored, false)
    assert.equal(afterAX.role.value, 'switch')
    assert.equal(afterAX.name.value, '公开提醒')
    assert(afterAX.properties.some((p) => p.name === 'checked' && p.value.value === 'true'))
  })
  await p.click('#reset')
  await frame()
  const resetAX = await ax(selector)
  record.ax.push({ state: 'blurred-reset', node: resetAX })
  await test(`asChild external reset and disabled activation stay independent (${dark})`, async () => {
    assert.equal(resetAX.ignored, false)
    assert(resetAX.properties.some((p) => p.name === 'checked' && p.value.value === 'false'))
    assert.equal(
      await p.evaluate(() => new FormData(document.querySelector('form')).has('reminder')),
      false,
    )
    await p.focus('[data-probe="aschild-disabled"]')
    await p.keyboard.press('Enter')
    await frame()
    assert.equal(await p.evaluate(() => Number(document.querySelector('#updates').textContent)), 1)
    assert.equal(
      await p.evaluate(() => document.querySelector('input[name="neighbor"]').value),
      'independent',
    )
  })
  for (const name of ['transparent', 'destructive', 'anchor'])
    await test(`public ${name} click fires once (${dark})`, async () => {
      const before = await p.evaluate(() => Number(document.querySelector('#clicks').textContent))
      await p.click('[data-probe="' + name + '"]')
      await frame()
      assert.equal(
        await p.evaluate(() => Number(document.querySelector('#clicks').textContent)),
        before + 1,
      )
    })
  await p.evaluate(() => document.activeElement?.blur())
  await p.screenshot({ path: out + '/' + phase + '-' + (dark ? 'dark' : 'light') + '.png' })
}
await fs.writeFile(
  out + '/' + phase + '.json',
  JSON.stringify({ phase, records, failures }, null, 2),
)
if (failures.length)
  throw Error(
    failures.length + ' public regressions failed: ' + failures.map((f) => f.name).join('; '),
  )
console.log(phase, 'ALL PUBLIC REGRESSIONS PASS')
