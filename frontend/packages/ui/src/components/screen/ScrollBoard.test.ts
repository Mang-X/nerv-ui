import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import ScrollBoard from './ScrollBoard.vue'

const wrappers: ReturnType<typeof mount>[] = []
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'scrollIntoView',
)
let frameTime = 0
let nextFrame = 0
let frames: Map<number, FrameRequestCallback>
let reduced = false
let motionListeners: Set<(event: MediaQueryListEvent) => void>
let resizeCallbacks: ResizeObserverCallback[]
let contentHeight = 600
let viewportHeight = 200
async function frame(delta = 1000) {
  frameTime += delta
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((callback) => callback(frameTime))
  await nextTick()
}
function board() {
  const wrapper = mount(ScrollBoard, {
    props: { items: ['河岸', '书房', '展厅'], speed: 100 },
    slots: { row: ({ item }: { item: unknown }) => h('button', { type: 'button' }, String(item)) },
    attachTo: document.body,
  })
  wrappers.push(wrapper)
  return wrapper
}
beforeEach(() => {
  frames = new Map()
  motionListeners = new Set()
  resizeCallbacks = []
  reduced = false
  contentHeight = 600
  viewportHeight = 200
  frameTime = 0
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback)
    return nextFrame
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
  vi.stubGlobal('matchMedia', () => ({
    get matches() {
      return reduced
    },
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      motionListeners.add(listener),
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) =>
      motionListeners.delete(listener),
  }))
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallbacks.push(callback)
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains('scroll-board') ? viewportHeight : contentHeight
    },
  )
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(
    function (this: HTMLElement) {
      return this.classList.contains('scroll-board__track') ? contentHeight * 2 : contentHeight
    },
  )
})
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  if (originalScrollIntoView)
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScrollIntoView)
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('reduced motion stops JS translation and leaves the original list manually reachable', async () => {
  reduced = true
  const wrapper = board()
  await nextTick()
  await frame()
  await frame()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(0px)')
  expect(wrapper.get('.scroll-board').classes()).toContain('scroll-board--manual')
  expect(wrapper.get('.scroll-board').attributes('tabindex')).toBe('0')
  expect(wrapper.findAll('.scroll-board__row:not([aria-hidden]) button')).toHaveLength(3)
})

it('duplicate rows are inert while original slot actions remain usable and focus pauses motion', async () => {
  const wrapper = board()
  await nextTick()
  await frame()
  await frame()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(-100px)')
  const copies = wrapper.findAll('[aria-hidden="true"]')
  expect(copies.length).toBeGreaterThan(0)
  expect(copies.every((copy) => copy.attributes('inert') !== undefined)).toBe(true)
  const first = wrapper.get('button')
  ;(first.element as HTMLButtonElement).focus()
  await nextTick()
  await frame()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(0px)')
  expect(first.attributes('disabled')).toBeUndefined()
  expect(document.activeElement).toBe(first.element)
  expect(wrapper.get('.scroll-board').classes()).toContain('scroll-board--manual')
})

it('normalizes appended and shrunken content while hovered and keeps short empty and restored lists still or looping', async () => {
  const wrapper = board()
  await nextTick()
  await frame()
  await frame(5000)
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(-500px)')
  await wrapper.trigger('mouseenter')
  contentHeight = 300
  await wrapper.setProps({ items: ['河岸', '书房'] })
  resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
  await nextTick()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(-200px)')
  await frame()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(-200px)')
  contentHeight = 900
  await wrapper.setProps({ items: ['河岸', '书房', '展厅', '夜读'] })
  resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
  await nextTick()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(-200px)')
  contentHeight = 100
  await wrapper.setProps({ items: ['河岸'] })
  resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
  await nextTick()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(0px)')
  expect(wrapper.findAll('[aria-hidden="true"]')).toHaveLength(0)
  contentHeight = 0
  await wrapper.setProps({ items: [] })
  expect(wrapper.findAll('button')).toHaveLength(0)
  contentHeight = 600
  await wrapper.setProps({ items: ['恢复', '书房', '展厅'] })
  resizeCallbacks.forEach((callback) => callback([], {} as ResizeObserver))
  await wrapper.trigger('mouseleave')
  await frame()
  await frame()
  expect(wrapper.get('.scroll-board__track').attributes('style')).not.toContain('translateY(0px)')
})

it('hover pauses and leaving resumes with bidirectional wheel wrap and disposes RAF and media listeners', async () => {
  const wrapper = board()
  await nextTick()
  await frame()
  await frame()
  await wrapper.trigger('mouseenter')
  const position = wrapper.get('.scroll-board__track').attributes('style')
  await frame()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toBe(position)
  await wrapper.trigger('wheel', { deltaY: 550 })
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(-50px)')
  await wrapper.trigger('wheel', { deltaY: -100 })
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(-550px)')
  await wrapper.trigger('mouseleave')
  await frame()
  await frame()
  expect(wrapper.get('.scroll-board__track').attributes('style')).not.toContain(
    'translateY(-550px)',
  )
  reduced = true
  motionListeners.forEach((listener) => listener({ matches: reduced } as MediaQueryListEvent))
  await nextTick()
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(0px)')
  expect(frames.size).toBe(0)
  reduced = false
  motionListeners.forEach((listener) => listener({ matches: reduced } as MediaQueryListEvent))
  await nextTick()
  expect(frames.size).toBe(1)
  wrapper.unmount()
  wrappers.pop()
  expect(frames.size).toBe(0)
  expect(motionListeners.size).toBe(0)
})

it('entering focus on an original tail row reveals that action after switching to manual mode', async () => {
  // Native scrollIntoView is a system layout boundary; the real reverse Tab lane is browser evidence.
  const scrollIntoView = vi.fn(function (this: HTMLElement) {
    this.closest('.scroll-board')!.scrollTop = 400
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: scrollIntoView,
    configurable: true,
  })
  const wrapper = board()
  await nextTick()
  await frame()
  await frame()
  const originals = wrapper.findAll('.scroll-board__track > div:first-child button')
  ;(originals.at(-1)!.element as HTMLButtonElement).focus()
  await nextTick()
  await nextTick()
  expect(document.activeElement).toBe(originals.at(-1)!.element)
  expect(wrapper.get('.scroll-board').element.scrollTop).toBe(400)
  expect(wrapper.get('.scroll-board__track').attributes('style')).toContain('translateY(0px)')
})
