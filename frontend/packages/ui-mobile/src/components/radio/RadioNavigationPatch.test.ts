import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { afterEach, expect, it, vi } from 'vitest'

// ESM is exercised through NvMobileRadioGroup. Check the pinned package's
// shipped CJS hook too; no mock of focusFirst or the DOM focus boundary.
const require = createRequire(import.meta.url)
const { focusFirst } = require(
  join(dirname(require.resolve('reka-ui')), 'RovingFocus/utils.cjs'),
) as {
  focusFirst: (
    nodes: HTMLElement[],
    preventScroll: boolean,
    focused: (node: HTMLElement) => void,
  ) => void
}
afterEach(() => {
  document.body.innerHTML = ''
})
function buttons() {
  const nodes = ['a', 'b', 'c'].map(() => document.createElement('button'))
  document.body.append(...nodes)
  nodes[0].focus()
  return nodes
}
it('CJS provenance reports only the candidate whose focus actually completed', () => {
  const [a, b] = buttons()
  const focused = vi.fn()
  focusFirst([b], false, focused)
  expect(document.activeElement).toBe(b)
  expect(focused).toHaveBeenCalledExactlyOnceWith(b)
  expect(a).not.toBe(document.activeElement)
})
it('CJS provenance is absent when the host already focused the intended candidate', () => {
  const [, b] = buttons()
  b.focus()
  const focused = vi.fn()
  focusFirst([b], false, focused)
  expect(document.activeElement).toBe(b)
  expect(focused).not.toHaveBeenCalled()
})
it('CJS provenance is absent when a focus handler redirects to another element', () => {
  const [, b, c] = buttons()
  b.addEventListener('focus', () => c.focus())
  const focused = vi.fn()
  focusFirst([b], false, focused)
  expect(document.activeElement).toBe(c)
  expect(focused).not.toHaveBeenCalled()
})
it('CJS navigation retains its fallback after a disabled candidate cannot take focus', () => {
  const [, b, c] = buttons()
  b.disabled = true
  const focused = vi.fn()
  focusFirst([b, c], false, focused)
  expect(document.activeElement).toBe(c)
  expect(focused).toHaveBeenCalledExactlyOnceWith(c)
})
