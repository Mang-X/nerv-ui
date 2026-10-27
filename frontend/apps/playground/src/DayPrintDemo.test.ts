import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import DayPrintDemo from './DayPrintDemo.vue'

it('library and studio day pages expose local source, date group and readonly controls', async () => {
  const page = mount(DayPrintDemo, { props: { venue: 'library' } })
  expect(page.text()).toContain('读书会日安排')
  expect(page.text()).toContain('本页内存安排')
  expect(page.text()).toContain('未连接实际排程计算或保存')
  expect(page.get('[data-day-sheet]').text()).toContain('夜读')
  await page.get('[data-fixture="next-day"]').trigger('click')
  expect(page.get('[data-day-sheet]').text()).not.toContain('闭馆整理')
  await page.get('[data-fixture="empty-day"]').trigger('click')
  expect(page.get('[data-day-sheet]').text()).toContain('该日与所选分组没有安排')
  await page.get('[data-fixture="readonly"]').trigger('click')
  expect(page.get('[data-action="print-day"]').attributes('disabled')).toBeDefined()
  expect(page.text()).toContain('当前安排仅供查看，打印由场地方确认')
  page.unmount()

  const studio = mount(DayPrintDemo, { props: { venue: 'studio' } })
  expect(studio.text()).toContain('工作坊日安排')
  expect(studio.get('[data-day-sheet]').text()).toContain('夜间创作')
  studio.unmount()
})
