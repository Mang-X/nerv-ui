import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import ScreenDemo from '../ScreenDemo.vue'

it('hosts 0 1 and 6 cards across both sources with replacement variants actions and existing navigation', async () => {
  const page = mount(ScreenDemo, { props: { section: '#screen/summary-cards' } })
  const click = async (text: string) => {
    await page
      .findAll('button')
      .find((v) => v.text() === text)!
      .trigger('click')
  }
  expect(page.get('a[href="#screen/summary-cards"]').attributes('aria-current')).toBe('page')
  expect(page.get('a[href="#screen/stage"]').attributes('aria-current')).toBeUndefined()
  expect(page.findAll('.nv-scr-summary')).toHaveLength(6)
  await page.get('select').setValue('fit')
  const count = page.findAll('select').find((v) => v.text().replace(/\s/g, '') === '016')!
  await count.setValue('0')
  expect(page.findAll('.nv-scr-summary')).toHaveLength(0)
  await count.setValue('1')
  expect(page.findAll('.nv-scr-summary')).toHaveLength(1)
  await click('共享花园')
  expect(page.text()).toContain('预约席位')
  await click('更新记录')
  expect(page.findAll('[data-summary-value]').map((v) => v.text())).toEqual(['0', '-1.235 %', '—'])
  await page.get('.nv-scr-summary-action').trigger('click')
  expect(page.text()).toContain('已选择 共享花园 · 1')
  const variant = page.findAll('select').find((v) => v.text().includes('入口'))!
  await variant.setValue('health')
  expect(page.get('[data-summary-primary]').text()).toContain('123.457 %')
  await variant.setValue('line')
  expect(page.find('.nv-scr-sl-line').exists()).toBe(false)
  await click('更新记录')
  expect(page.find('.nv-scr-sl-line').exists()).toBe(true)
  await click('完整说明')
  expect(page.text()).toContain('周末阅读、展览与公共交流安排')
  await count.setValue('6')
  expect(page.findAll('.nv-scr-summary')).toHaveLength(6)
  await page.setProps({ section: '#screen/stage' })
  expect(page.find('.summary-cards-demo').exists()).toBe(false)
  page.unmount()
})
