import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { NvScreenScaler } from '@nerv-ui/ui'

let wrapper: ReturnType<typeof mount> | undefined
afterEach(() => {
  wrapper?.unmount()
  vi.unstubAllGlobals()
})

it('rescales visible content on resize, design changes and all three public modes', async () => {
  vi.stubGlobal('innerWidth', 960)
  vi.stubGlobal('innerHeight', 540)
  wrapper = mount(NvScreenScaler, { slots: { default: '<p>城市文化空间</p>' } })
  await nextTick()
  const stage = () => wrapper!.get('p').element.parentElement as HTMLElement
  expect(stage().style.transform).toBe('scale(0.5, 0.5)')
  vi.stubGlobal('innerWidth', 2560)
  vi.stubGlobal('innerHeight', 1080)
  window.dispatchEvent(new Event('resize'))
  await nextTick()
  expect(stage().style.transform).toBe('scale(1, 1)')
  await wrapper.setProps({ designWidth: 1280, designHeight: 720 })
  expect(stage().style.width).toBe('1280px')
  expect(stage().style.height).toBe('720px')
  expect(stage().style.transform).toBe('scale(1.5, 1.5)')
  await wrapper.setProps({ mode: 'width' })
  expect(stage().style.transform).toBe('scale(2, 2)')
  await wrapper.setProps({ mode: 'stretch' })
  expect(stage().style.transform).toBe('scale(2, 1.5)')
  expect(wrapper.get('p').text()).toBe('城市文化空间')
})

it('measures an embedded viewport and disconnects observers across unmount and remount', async () => {
  let notify: ResizeObserverCallback | undefined
  const disconnect = vi.fn()
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: ResizeObserverCallback) {
        notify = callback
      }
      observe() {}
      unobserve() {}
      disconnect = disconnect
    },
  )
  wrapper = mount(NvScreenScaler, { slots: { default: '<p>容器舞台</p>' } })
  await nextTick()
  const stage = wrapper.get('p').element.parentElement as HTMLElement
  const root = wrapper.element as HTMLElement
  Object.defineProperty(root, 'clientWidth', { configurable: true, value: 800 })
  Object.defineProperty(root, 'clientHeight', { configurable: true, value: 600 })
  notify?.(
    [{ target: root, contentRect: { width: 800, height: 600 } } as unknown as ResizeObserverEntry],
    {} as ResizeObserver,
  )
  await nextTick()
  expect(stage.style.transform).toBe('scale(0.4166666666666667, 0.4166666666666667)')
  wrapper.unmount()
  wrapper = undefined
  expect(disconnect).toHaveBeenCalled()
  vi.stubGlobal('innerWidth', 960)
  vi.stubGlobal('innerHeight', 540)
  wrapper = mount(NvScreenScaler, { slots: { default: '<p>重入舞台</p>' } })
  await nextTick()
  expect((wrapper.get('p').element.parentElement as HTMLElement).style.transform).toBe(
    'scale(0.5, 0.5)',
  )
})

it('keeps the public stage finite and its slot usable for invalid design dimensions', async () => {
  vi.stubGlobal('innerWidth', 960)
  vi.stubGlobal('innerHeight', 540)
  wrapper = mount(NvScreenScaler, {
    props: { designWidth: Number.NaN, designHeight: 0 },
    slots: { default: '<button>保留内容</button>' },
  })
  await wrapper.vm.$nextTick()
  const stage = () => wrapper!.get('button').element.parentElement as HTMLElement
  expect(stage().style.width).toBe('1920px')
  expect(stage().style.height).toBe('1080px')
  expect(stage().style.transform).toBe('scale(0.5, 0.5)')
  await wrapper.setProps({ designWidth: Infinity, designHeight: -10 })
  expect(stage().style.width).toBe('1920px')
  expect(stage().style.height).toBe('1080px')
  expect(stage().style.transform).toBe('scale(0.5, 0.5)')
  await wrapper.get('button').trigger('click')
  expect(wrapper.get('button').text()).toBe('保留内容')
})
