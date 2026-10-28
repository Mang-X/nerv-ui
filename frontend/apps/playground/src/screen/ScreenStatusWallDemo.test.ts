import { mount, flushPromises } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { NvScreenStatusWall } from '@nerv-iip/ui'
import Demo from './ScreenStatusWallDemo.vue'

it('shows two neutral sources and only commits the current delayed preview after replacement mode scroll and unmount', async () => {
  vi.useFakeTimers()
  const page = mount(Demo)
  const wall = page.getComponent(NvScreenStatusWall)
  const item = wall.props('items')[0]!
  wall.vm.$emit('preview', item)
  await nextTick()
  expect(page.get('[data-preview]').text()).toContain('正在读取')
  await page.get('[data-replace]').trigger('click')
  await vi.runAllTimersAsync()
  expect(page.get('[data-preview]').text()).not.toContain(item.identity)
  const current = wall.props('items')[0]!
  wall.vm.$emit('preview', current)
  await vi.runAllTimersAsync()
  await flushPromises()
  expect(page.get('[data-preview]').text()).toContain(current.identity)
  wall.vm.$emit('preview', current)
  wall.vm.$emit('preview', null)
  await vi.runAllTimersAsync()
  expect(page.get('[data-preview]').text()).not.toContain('可供使用')
  wall.vm.$emit('preview', current)
  await page.get('select').setValue('group-chip')
  await vi.runAllTimersAsync()
  expect(page.get('[data-preview]').text()).toContain('悬停')
  await page.get('[data-source]').trigger('click')
  expect(page.text()).toContain('共享花园')
  wall.vm.$emit('preview', wall.props('items')[0]!)
  page.unmount()
  await vi.runAllTimersAsync()
  vi.useRealTimers()
})

it('rejects stale success and failure even when the loader ignores cancellation', async () => {
  const pending: { resolve: (s: string) => void; reject: (e: Error) => void }[] = []
  const page = mount(Demo, {
    props: {
      loadPreview: () =>
        new Promise<string>((resolve, reject) => pending.push({ resolve, reject })),
    },
  })
  const wall = page.getComponent(NvScreenStatusWall)
  wall.vm.$emit('preview', wall.props('items')[0]!)
  await page.get('[data-replace]').trigger('click')
  wall.vm.$emit('preview', wall.props('items')[0]!)
  pending[1]!.resolve('当前概况')
  await flushPromises()
  pending[0]!.resolve('过期成功')
  await flushPromises()
  expect(page.get('[data-preview]').text()).toBe('当前概况')
  wall.vm.$emit('preview', wall.props('items')[0]!)
  await page.get('[data-source]').trigger('click')
  wall.vm.$emit('preview', wall.props('items')[0]!)
  pending[3]!.resolve('花园概况')
  await flushPromises()
  pending[2]!.reject(new Error('过期失败'))
  await flushPromises()
  expect(page.get('[data-preview]').text()).toBe('花园概况')
  wall.vm.$emit('preview', wall.props('items')[0]!)
  pending[4]!.reject(new Error('当前失败'))
  await flushPromises()
  expect(page.get('[data-preview]').text()).toContain('暂时无法读取')
  page.unmount()
})

it('commits current flat hover success and failure but rejects replaced late receipts', async () => {
  const pending: { resolve: (s: string) => void; reject: (e: Error) => void }[] = []
  const page = mount(Demo, {
    props: {
      loadPreview: () =>
        new Promise<string>((resolve, reject) => pending.push({ resolve, reject })),
    },
  })
  await nextTick()
  const wall = page.getComponent(NvScreenStatusWall)
  await wall.get('button').trigger('mouseenter')
  pending[0]!.resolve('当前概况')
  await flushPromises()
  expect(page.get('[data-preview]').text()).toBe('当前概况')
  await wall.get('button').trigger('mouseenter')
  pending[1]!.reject(new Error('PRIVATE'))
  await flushPromises()
  expect(page.get('[data-preview]').text()).toContain('暂时无法读取')
  await wall.get('button').trigger('mouseenter')
  await page.get('[data-replace]').trigger('click')
  await wall.get('button').trigger('mouseenter')
  pending[2]!.resolve('旧概况')
  await flushPromises()
  expect(page.get('[data-preview]').text()).toContain('正在读取')
  pending[3]!.resolve('新版本概况')
  await flushPromises()
  expect(page.get('[data-preview]').text()).toBe('新版本概况')
  page.unmount()
})
