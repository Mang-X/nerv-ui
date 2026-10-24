import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import {
  NvNoticeBar,
  NvMobileEmpty,
  NvMobileBadge,
  NvMobileToast,
  NvMobileAvatar,
  NvMobileTag,
  NvMobileSkeleton,
  NvMobileProgress,
  NvMobileImage,
} from '../index'
import { MOBILE_OVERLAY_TARGET } from '../lib/overlay-target'
afterEach(() => {
  document.body.innerHTML = ''
  vi.useRealTimers()
})
it('renders notice action content and empty icon and action slots through their public DOM', async () => {
  const action = vi.fn()
  const notice = mount(NvNoticeBar, {
    props: { tone: 'warning' },
    slots: { default: () => h('button', { onClick: action }, '查看安排') },
  })
  await notice.get('button').trigger('click')
  expect(action).toHaveBeenCalledOnce()
  expect(notice.text()).toBe('查看安排')
  const empty = mount(NvMobileEmpty, {
    props: { description: '没有回响' },
    slots: { icon: '<span>信</span>', default: '<button>开始</button>' },
  })
  expect(empty.text()).toContain('信没有回响开始')
  notice.unmount()
  empty.unmount()
})
import { h } from 'vue'
it('updates badge value, maximum, zero visibility and dot without retaining stale count text', async () => {
  const w = mount(NvMobileBadge, { props: { count: 7, max: 9 }, slots: { default: '<b>信箱</b>' } })
  expect(w.text()).toBe('信箱7')
  await w.setProps({ count: 12 })
  expect(w.text()).toBe('信箱9+')
  await w.setProps({ max: 20 })
  expect(w.text()).toBe('信箱12')
  await w.setProps({ count: 0 })
  expect(w.find('span > span').exists()).toBe(false)
  await w.setProps({ dot: true })
  expect(w.find('span > span').exists()).toBe(true)
  expect(w.text()).toBe('信箱')
  w.unmount()
})
it('emits tag close without removing controlled slot content and renders skeleton shapes', async () => {
  const w = mount(NvMobileTag, {
    props: { closable: true, variant: 'danger' },
    slots: { default: '<b>周末</b>' },
  })
  await w.get('button').trigger('click')
  expect(w.emitted('close')).toEqual([[]])
  expect(w.text()).toBe('周末')
  await w.setProps({ closable: false })
  expect(w.find('button').exists()).toBe(false)
  const skeleton = mount(NvMobileSkeleton, { props: { variant: 'circle' } })
  expect(skeleton.attributes('aria-hidden')).toBe('true')
  expect(skeleton.classes()).toContain('rounded-full')
  await skeleton.setProps({ variant: 'rect' })
  expect(skeleton.classes()).toContain('h-20')
  w.unmount()
  skeleton.unmount()
})
it('clamps finite progress values and updates accessible value and optional label', async () => {
  const w = mount(NvMobileProgress, { props: { value: -20, showLabel: true } })
  expect(w.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0')
  expect(w.text()).toBe('0%')
  await w.setProps({ value: 42.4 })
  expect(w.text()).toBe('42%')
  expect(w.get('.nv-m-progress-fill').attributes('style')).toContain('42.4%')
  await w.setProps({ value: 120, tone: 'success' })
  expect(w.text()).toBe('100%')
  await w.setProps({ showLabel: false })
  expect(w.text()).toBe('')
  w.unmount()
})
it('recovers image loading after src changes and keeps load and error states distinct', async () => {
  const w = mount(NvMobileImage, {
    props: { src: '/first.svg', alt: '湖畔', ratio: '4/3', fit: 'contain' },
  })
  expect(w.get('img').attributes('alt')).toBe('湖畔')
  expect(w.get('img').classes()).toContain('opacity-0')
  await w.get('img').trigger('load')
  expect(w.get('img').classes()).toContain('opacity-100')
  await w.setProps({ src: '/missing.png' })
  expect(w.get('img').classes()).toContain('opacity-0')
  await w.get('img').trigger('error')
  expect(w.text()).toBe('加载失败')
  expect(w.get('img').isVisible()).toBe(false)
  await w.setProps({ src: '/second.svg' })
  expect(w.text()).toBe('')
  expect(w.get('img').attributes('style') ?? '').not.toContain('display: none')
  await w.get('img').trigger('load')
  expect(w.get('img').classes()).toContain('opacity-100')
  w.unmount()
})
it('recovers avatar after failed src, updates initials and preserves fallback slot precedence', async () => {
  const w = mount(NvMobileAvatar, { props: { src: '/bad.png', name: 'Alex River' } })
  await w.get('img').trigger('error')
  expect(w.text()).toBe('AR')
  await w.setProps({ name: '林悦' })
  expect(w.text()).toBe('林悦')
  await w.setProps({ src: '/good.svg', alt: '头像' })
  expect(w.get('img').attributes('alt')).toBe('头像')
  await w.setProps({ src: undefined, name: '' })
  expect(w.find('svg').exists()).toBe(true)
  const slot = mount(NvMobileAvatar, { props: { name: 'Alex River' }, slots: { default: '旅' } })
  expect(slot.text()).toBe('旅')
  w.unmount()
  slot.unmount()
})
it('automatically requests toast close once without mutating the controlled show prop', async () => {
  vi.useFakeTimers()
  const w = mount(NvMobileToast, { props: { show: true, message: '记住了', duration: 1000 } })
  await vi.advanceTimersByTimeAsync(999)
  expect(w.emitted('update:show')).toBeUndefined()
  await vi.advanceTimersByTimeAsync(1)
  expect(w.emitted('update:show')).toEqual([[false]])
  expect(document.body.textContent).toContain('记住了')
  await w.setProps({ show: false })
  expect(document.body.querySelector('[role="status"]')).toBeNull()
  w.unmount()
})
it('replaces toast deadlines on duration and type changes and cancels them on external hide and unmount', async () => {
  vi.useFakeTimers()
  const w = mount(NvMobileToast, { props: { show: true, duration: 1000 } })
  await vi.advanceTimersByTimeAsync(500)
  await w.setProps({ duration: 2000 })
  await vi.advanceTimersByTimeAsync(600)
  expect(w.emitted('update:show')).toBeUndefined()
  await w.setProps({ type: 'loading' })
  await vi.advanceTimersByTimeAsync(5000)
  expect(w.emitted('update:show')).toBeUndefined()
  await w.setProps({ type: 'success', message: '已完成' })
  expect(document.body.textContent).toContain('已完成')
  await vi.advanceTimersByTimeAsync(1999)
  expect(w.emitted('update:show')).toBeUndefined()
  await w.setProps({ show: false })
  await vi.advanceTimersByTimeAsync(10)
  expect(w.emitted('update:show')).toBeUndefined()
  await w.setProps({ show: true, duration: 0 })
  expect(vi.getTimerCount()).toBe(0)
  await w.setProps({ duration: 1000 })
  w.unmount()
  expect(vi.getTimerCount()).toBe(0)
  await vi.advanceTimersByTimeAsync(2000)
  expect(w.emitted('update:show')).toBeUndefined()
})
it('keeps message-only toast updates on the original deadline and honors overlay target', async () => {
  vi.useFakeTimers()
  const target = document.createElement('section')
  document.body.append(target)
  const w = mount(NvMobileToast, {
    props: { show: true, message: '开始', overlay: true, duration: 1000 },
    global: { provide: { [MOBILE_OVERLAY_TARGET as symbol]: target } },
  })
  expect(target.querySelector('.nv-m-toast-blocking')).not.toBeNull()
  await vi.advanceTimersByTimeAsync(600)
  await w.setProps({ message: '更新中' })
  expect(target.textContent).toBe('更新中')
  await vi.advanceTimersByTimeAsync(400)
  expect(w.emitted('update:show')).toEqual([[false]])
  w.unmount()
  expect(target.children).toHaveLength(0)
})
