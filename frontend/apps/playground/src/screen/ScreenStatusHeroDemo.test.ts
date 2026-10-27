import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { nextTick } from 'vue'
import ScreenStatusHeroDemo from './ScreenStatusHeroDemo.vue'

it('keeps the host source, rhythm, and offline facts independent of the public display', async () => {
  const page = mount(ScreenStatusHeroDemo)
  expect(page.get('[data-primary-hero]').text()).toContain('开放中')
  expect(page.find('[data-primary-hero] .nv-scr-sh-auxiliary').exists()).toBe(false)
  await page.get('button[name="offline-unknown"]').trigger('click')
  expect(page.get('[data-primary-hero]').text()).toContain('失联数量待确认')
  await page.get('button[name="offline-three"]').trigger('click')
  expect(page.get('[data-primary-hero]').text()).toContain('3 处数据失联')
  await page.get('button[name="offline-zero"]').trigger('click')
  expect(page.find('[data-primary-hero] .nv-scr-sh-auxiliary').exists()).toBe(false)

  await page.get('button[name="status-attention"]').trigger('click')
  expect(page.get('[data-primary-hero] .nv-scr-sh').classes()).toContain('nv-scr-sh-slow')
  await page.get('button[name="source-campus"]').trigger('click')
  expect(page.get('[data-primary-hero]').text()).toContain('通行平稳')
  expect(page.get('[data-primary-hero] .nv-scr-sh').classes()).toContain('nv-scr-sh-cyan')
  expect(page.get('[data-secondary-hero]').text()).toContain('等候确认')
  await page.get('button[name="auxiliary-action"]').trigger('click')
  await nextTick()
  expect(page.get('[data-action-feedback]').text()).toContain('已查看')
  page.unmount()
})

it('offers a user-facing control to expand and restore the live status label', async () => {
  const page = mount(ScreenStatusHeroDemo)
  const toggle = page.get('button[name="long-label"]')
  expect(toggle.text()).toBe('显示完整状态')
  expect(page.get('[data-primary-hero]').text()).not.toContain('请留意现场更新')
  await toggle.trigger('click')
  expect(toggle.text()).toBe('收起完整状态')
  expect(page.get('[data-primary-hero]').text()).toContain('请留意现场更新')
  await toggle.trigger('click')
  expect(toggle.text()).toBe('显示完整状态')
  expect(page.get('[data-primary-hero]').text()).not.toContain('请留意现场更新')
  page.unmount()
})
