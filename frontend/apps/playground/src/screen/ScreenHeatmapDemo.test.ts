import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import ScreenHeatmapDemo from './ScreenHeatmapDemo.vue'

it('keeps two neutral host meanings visible and controls data grids empty unknown and scale replacement', async () => {
  const page = mount(ScreenHeatmapDemo)
  const button = (text: string) => page.findAll('button').find((el) => el.text() === text)!
  expect(page.findAll('[data-slot="nv-screen-heatmap"]')).toHaveLength(2)
  expect(page.text()).toContain('阅读时段占用')
  expect(page.text()).toContain('展厅温度')
  expect(page.text()).toContain('从容：低于 4 小时')
  expect(page.text()).toContain('偏凉：低于 18°C')
  expect(page.findAll('[data-heatmap-cell]')).toHaveLength(36)
  await page.find('[data-heatmap-cell]').trigger('focus')
  expect(page.get('[role="tooltip"]').text()).toContain('0小时')
  await button('替换记录').trigger('click')
  expect(page.get('[role="tooltip"]').text()).toContain('2.5小时')
  await button('改为四列').trigger('click')
  expect(page.get('.nv-scr-heatmap-grid').attributes('style')).toContain('repeat(4,')
  await button('调整阅读分档').trigger('click')
  expect(page.text()).toContain('从容：低于 2 小时')
  await button('标为未知').trigger('click')
  expect(page.get('[role="tooltip"]').text()).toContain('未确认')
  await button('清空记录').trigger('click')
  expect(page.find('[role="tooltip"]').exists()).toBe(false)
  expect(page.text()).toContain('当前没有阅读记录')
  expect(page.findAll('[data-heatmap-cell]')).toHaveLength(12)
  await button('恢复记录').trigger('click')
  expect(page.findAll('[data-heatmap-cell]')).toHaveLength(36)
  page.unmount()
})
