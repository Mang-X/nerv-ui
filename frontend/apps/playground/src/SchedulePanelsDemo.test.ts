import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import SchedulePanelsDemo from './SchedulePanelsDemo.vue'
let w: ReturnType<typeof mount> | undefined
afterEach(() => {
  w?.unmount()
  localStorage.clear()
  vi.unstubAllGlobals()
})
function open(venue: 'library' | 'studio') {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  w = mount(SchedulePanelsDemo, { props: { venue } })
  return w
}
async function click(text: string) {
  await w!
    .findAll('button')
    .find((b) => b.text() === text)!
    .trigger('click')
}
it('panel host selection lock and external replacements remain visibly tied to activity identity', async () => {
  const page = open('library')
  expect(page.get('[data-detail]').text()).toContain('尚未选择活动')
  await page.get('[data-conflict-id="notice-a"]').trigger('click')
  expect(page.get('[data-detail]').text()).toContain('晨间共读')
  await click('锁定活动')
  expect(page.get('[data-detail]').text()).toContain('已锁定')
  await click('更新活动内容')
  expect(page.get('[data-detail]').text()).toContain('晨间共读 · 更新')
  await click('倒序显示清单')
  await page.get('[data-conflict-id="notice-a"]').trigger('click')
  expect(page.get('[data-selection]').text()).toContain('晨间共读 · 更新')
  await click('替换全部活动')
  expect(page.get('[data-detail]').text()).toContain('尚未选择活动')
  expect(page.get('[data-records]').text()).toContain('晨间共读')
  expect(page.text()).not.toMatch(/operationId|taskId|internal-|宿主|缓存|验收|rawJSON/)
})
it('panel host search no hit next previous clear and accepted category visibility change visible content', async () => {
  const page = open('studio')
  const input = page.get('input[aria-label="搜索工序"]')
  await input.setValue('不存在')
  expect(page.get('[data-toolbar]').text()).toContain('无匹配')
  expect(page.get('button[aria-label="下一个匹配"]').attributes('disabled')).toBeDefined()
  await input.setValue('创作')
  await input.trigger('keydown', { key: 'Enter' })
  expect(page.get('[data-selection]').text()).toContain('晨间创作')
  await input.trigger('keydown', { key: 'Enter' })
  expect(page.get('[data-selection]').text()).toContain('午间创作')
  await input.trigger('keydown', { key: 'Enter', shiftKey: true })
  expect(page.get('[data-selection]').text()).toContain('晨间创作')
  await input.trigger('keydown', { key: 'Escape' })
  expect((input.element as HTMLInputElement).value).toBe('')
  await click('隐藏活动')
  expect(page.get('[data-visible-count]').text()).toContain('0 项活动')
  expect(page.get('[data-detail]').text()).toContain('尚未选择活动')
  await click('显示活动')
  expect(page.get('[data-visible-count]').text()).toContain('2 项活动')
})
