import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import NvCarousel from './NvCarousel.vue'

// Three empty slides — count is read from the track's child element count.
const THREE = '<div></div><div></div><div></div>'

beforeEach(() => {
  // jsdom has no layout: give the viewport a width, and stub ResizeObserver +
  // make requestAnimationFrame synchronous so the `items` watch resolves in-test.
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 300 })
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
})
afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

// Fake all timers incl. requestAnimationFrame — the `items` watch defers its
// re-measure to the next frame, which the tests advance explicitly.
const fakeIntervals = () => vi.useFakeTimers()

describe('NvCarousel', () => {
  it.each(['pointerup', 'pointercancel'] as const)(
    'keeps hover paused after %s and resumes only on leave',
    async (release) => {
      fakeIntervals()
      const wrapper = mount(NvCarousel, {
        props: { autoplay: 1000, loop: true },
        slots: { default: THREE },
      })
      const viewport = wrapper.find('.nv-carousel-viewport')
      const track = wrapper.find('.nv-carousel-track')
      await viewport.trigger('pointerenter')
      track.element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 150 }))
      await nextTick()
      await track.trigger(release)
      await vi.advanceTimersByTimeAsync(3000)
      expect(wrapper.emitted('change')).toBeUndefined()
      expect(track.attributes('style')).toContain('translate3d(0px')

      await viewport.trigger('pointerleave')
      await vi.advanceTimersByTimeAsync(1000)
      expect(wrapper.emitted('change')).toEqual([[1]])
      wrapper.unmount()
    },
  )

  it.each(['interval', 'items'] as const)(
    'keeps hover paused after an %s update',
    async (update) => {
      fakeIntervals()
      const wrapper = mount(NvCarousel, { props: { items: [1, 2, 3], autoplay: 1000 } })
      const viewport = wrapper.find('.nv-carousel-viewport')
      await viewport.trigger('pointerenter')
      if (update === 'interval') await wrapper.setProps({ autoplay: 500 })
      else await wrapper.setProps({ items: [4, 5, 6] })
      await vi.advanceTimersByTimeAsync(3020)
      expect(wrapper.emitted('change')).toBeUndefined()
      await viewport.trigger('pointerleave')
      await vi.advanceTimersByTimeAsync(update === 'interval' ? 500 : 1000)
      expect(wrapper.emitted('change')).toEqual([[1]])
      wrapper.unmount()
    },
  )

  it('keeps drag release hovered until leave', async () => {
    fakeIntervals()
    const wrapper = mount(NvCarousel, { props: { items: [1, 2, 3], autoplay: 1000 } })
    const viewport = wrapper.find('.nv-carousel-viewport')
    const track = wrapper.find('.nv-carousel-track')
    await viewport.trigger('pointerenter')
    track.element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 150 }))
    await nextTick()
    track.element.dispatchEvent(
      new MouseEvent('pointermove', { bubbles: true, clientX: 60, buttons: 1 }),
    )
    await nextTick()
    await track.trigger('pointerup')
    expect(wrapper.emitted('change')).toEqual([[1]])
    await vi.advanceTimersByTimeAsync(3000)
    expect(wrapper.emitted('change')).toEqual([[1]])
    expect(track.attributes('style')).toContain('-300px')
    await viewport.trigger('pointerleave')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.emitted('change')).toEqual([[1], [2]])
    wrapper.unmount()
  })

  it('waits for release after leaving during a press and clears playback on unmount', async () => {
    fakeIntervals()
    const onChange = vi.fn()
    const wrapper = mount(NvCarousel, {
      props: { autoplay: 1000, loop: true, onChange },
      slots: { default: THREE },
    })
    const viewport = wrapper.find('.nv-carousel-viewport')
    const track = wrapper.find('.nv-carousel-track')
    await viewport.trigger('pointerenter')
    track.element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 150 }))
    await nextTick()
    await viewport.trigger('pointerleave')
    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.emitted('change')).toBeUndefined()
    await track.trigger('pointerup')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.emitted('change')).toEqual([[1]])
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(3000)
    expect(onChange.mock.calls).toEqual([[1]])
  })

  it('moves the track when index is driven externally (v-model:index)', async () => {
    const wrapper = mount(NvCarousel, { props: { index: 0 }, slots: { default: THREE } })
    await nextTick()
    await wrapper.setProps({ index: 2 })
    await nextTick()
    // offset = -index * width = -2 * 300
    expect(wrapper.find('.nv-carousel-track').attributes('style')).toContain('-600px')
  })

  it('clamps a mount-time out-of-range index to the last slide', async () => {
    const wrapper = mount(NvCarousel, { props: { index: 9 }, slots: { default: THREE } })
    await nextTick()
    expect(wrapper.emitted('update:index')?.flat()).toContain(2)
  })

  it('non-loop autoplay stops at the last slide (does not wrap)', async () => {
    fakeIntervals()
    const wrapper = mount(NvCarousel, {
      props: { autoplay: 1000, loop: false },
      slots: { default: THREE },
    })
    await nextTick()
    vi.advanceTimersByTime(3000) // ticks: 0→1, 1→2, then would-wrap (must stop)
    await nextTick()
    expect(wrapper.emitted('change')?.flat()).toEqual([1, 2]) // reached last, never emitted 0
  })

  it('loop autoplay wraps back to the first slide', async () => {
    fakeIntervals()
    const wrapper = mount(NvCarousel, {
      props: { autoplay: 1000, loop: true },
      slots: { default: THREE },
    })
    await nextTick()
    vi.advanceTimersByTime(3000) // 0→1→2→0
    await nextTick()
    expect(wrapper.emitted('change')?.flat()).toContain(0)
  })

  it('starts autoplay after items load asynchronously ([] → many)', async () => {
    fakeIntervals()
    const wrapper = mount(NvCarousel, { props: { items: [], autoplay: 1000 } })
    await nextTick()
    vi.advanceTimersByTime(1000)
    expect(wrapper.emitted('change')).toBeUndefined() // empty: nothing plays

    await wrapper.setProps({ items: [1, 2, 3] }) // DOM now has 3 slides
    vi.advanceTimersByTime(20) // flush the deferred rAF → sync() sees count=3, autoplay starts
    await nextTick()
    vi.advanceTimersByTime(1000) // interval tick → goTo(1) → change
    await nextTick()
    expect(wrapper.emitted('change')?.flat()).toContain(1) // autoplay now running
  })
})
