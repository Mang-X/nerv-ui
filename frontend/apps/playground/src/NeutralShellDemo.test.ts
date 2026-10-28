import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import NeutralShellDemo from './NeutralShellDemo.vue'
for (const space of ['library', 'studio'] as const) {
  it(`${space} preserves controlled refusal and accepts replacement without stale labels`, async () => {
    const w = mount(NeutralShellDemo, { props: { space } })
    const button = (label: string) => w.findAll('button').find((b) => b.text() === label)!
    await button('留在此页').trigger('click')
    await w.get('[data-nav=rooms]').trigger('click')
    expect(w.get('h1').text()).toBe(space === 'library' ? '阅读日程' : '创作日程')
    expect(w.get('[data-nav=welcome]').attributes('aria-current')).toBe('page')
    await button('自由切换').trigger('click')
    await w.get('[data-nav=rooms]').trigger('click')
    await button('迎接新朋友').trigger('click')
    await button('换个顺序').trigger('click')
    expect(w.get('h1').text()).toBe('午后相聚')
    expect(w.get('[data-nav=rooms]').attributes('aria-current')).toBe('page')
    expect(w.get('[data-nav=rest]').attributes('disabled')).toBeDefined()
    expect(w.get('[aria-label="周宁的用户菜单"]').text()).toBe('周宁')
    expect(w.get('a[href="#"]').text()).toBe('返回首页')
    w.unmount()
  })
}
