import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import InfiniteList from './InfiniteList.vue'

const observers: MockIntersectionObserver[] = []

class MockIntersectionObserver {
  readonly observe = vi.fn()
  readonly disconnect = vi.fn()

  constructor(private readonly callback: IntersectionObserverCallback) {
    observers.push(this)
  }

  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as never)
  }
}

afterEach(() => {
  observers.splice(0)
  vi.unstubAllGlobals()
})

describe('InfiniteList', () => {
  it('在父滚动区模式以底部哨兵触发加载且不创建第二个滚动容器', async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    const wrapper = mount(InfiniteList, {
      props: {
        parentScroll: true,
        modelValue: false,
      },
      slots: { default: '<div>任务</div>' },
    })

    expect(wrapper.classes()).not.toContain('overflow-y-auto')
    expect(observers).toHaveLength(1)

    observers[0]?.trigger(true)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('load')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([true])
  })

  it('父滚动区模式在终页或加载中不重复触发', async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    const wrapper = mount(InfiniteList, {
      props: {
        parentScroll: true,
        finished: true,
        modelValue: false,
      },
    })

    observers[0]?.trigger(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('load')).toBeUndefined()
  })

  it('暂停时不触发观察器加载，也不把可重试状态渲染为终页或加载提示', async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    const wrapper = mount(InfiniteList, {
      props: {
        parentScroll: true,
        paused: true,
        modelValue: false,
      },
    })

    observers[0]?.trigger(true)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('load')).toBeUndefined()
    expect(wrapper.text()).not.toContain('没有更多了')
    expect(wrapper.text()).not.toContain('上拉加载更多')
    expect(wrapper.text()).not.toContain('加载中')

    await wrapper.setProps({ paused: false })
    observers[0]?.trigger(true)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('load')).toHaveLength(1)
  })
})

it('loads at the configured scroll boundary once and respects loading, pause and finished states', async () => {
  const wrapper = mount(InfiniteList, {
    props: { offset: 80, finishedText: '已读完' },
    slots: { default: '<p>来信</p>' },
  })
  const scroller = wrapper.element as HTMLElement
  Object.defineProperties(scroller, { scrollHeight: { value: 1000 }, clientHeight: { value: 240 } })
  scroller.scrollTop = 679
  await wrapper.trigger('scroll')
  expect(wrapper.emitted('load')).toBeUndefined()
  scroller.scrollTop = 680
  await wrapper.trigger('scroll')
  await wrapper.trigger('scroll')
  expect(wrapper.emitted('load')).toEqual([[]])
  await wrapper.setProps({ modelValue: true })
  expect(wrapper.text()).toContain('加载中')
  await wrapper.setProps({ modelValue: false, paused: true })
  await wrapper.trigger('scroll')
  expect(wrapper.emitted('load')).toHaveLength(1)
  expect(wrapper.text()).not.toContain('已读完')
  await wrapper.setProps({ paused: false, finished: true })
  await wrapper.trigger('scroll')
  expect(wrapper.text()).toContain('已读完')
  expect(wrapper.emitted('load')).toHaveLength(1)
  wrapper.unmount()
})

it('disconnects the parent scroll observer when removed', () => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
  const wrapper = mount(InfiniteList, { props: { parentScroll: true } })
  expect(observers[0]?.observe).toHaveBeenCalledOnce()
  wrapper.unmount()
  expect(observers[0]?.disconnect).toHaveBeenCalledOnce()
})
