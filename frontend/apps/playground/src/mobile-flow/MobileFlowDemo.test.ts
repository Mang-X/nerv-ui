import { afterEach, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import Demo from './MobileFlowDemo.vue'
let w: VueWrapper
afterEach(() => w?.unmount())
it('host declares memory boundary and external clear removes candidates', async () => {
  w = mount(Demo)
  expect(w.text()).toContain('仅保存在本页内存')
  expect(w.get('[aria-label="当前编码"]').text()).toBe('WEEKEND')
  await w
    .findAll('button')
    .find((b) => b.text() === '清空安排')!
    .trigger('click')
  expect(w.get('[aria-label="当前编码"]').text()).toBe('尚未选择编码')
  expect(
    w
      .findAll('button')
      .find((b) => b.text() === '切换安排')!
      .attributes('disabled'),
  ).toBeDefined()
  expect(w.get('a[href="#mobile"]').text()).toContain('返回')
})
