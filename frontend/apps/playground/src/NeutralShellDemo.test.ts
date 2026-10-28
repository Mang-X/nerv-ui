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

for (const space of ['library', 'studio'] as const) {
  it(`${space} switches domain-local pages only when the host accepts and remembers each page`, async () => {
    const w = mount(NeutralShellDemo, { props: { space }, attachTo: document.body })
    const button = (label: string) => w.findAll('button').find((b) => b.text() === label)!
    const choose = async (key: string) => {
      if (space === 'library') await w.get(`[data-host-domain=${key}]`).trigger('click')
      else {
        await w.get('[data-overflow]').trigger('keydown', { key: 'Enter' })
        await new Promise((resolve) => setTimeout(resolve, 0))
        const label = key === 'quiet' ? '静享时光' : '相聚时光'
        ;(
          Array.from(document.querySelectorAll('[role=menuitem]')).find(
            (el) => el.textContent?.trim() === label,
          ) as HTMLElement
        ).click()
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }
    await button('留在此页').trigger('click')
    await choose('together')
    expect(w.find('[data-nav=gather]').exists()).toBe(false)
    await button('自由切换').trigger('click')
    await choose('together')
    expect(w.find('[data-nav=welcome]').exists()).toBe(false)
    await w.get('[data-nav=garden]').trigger('click')
    expect(w.get('h1').text()).toBe('花园小聚')
    await choose('quiet')
    expect(w.get('[data-nav=welcome]').attributes('aria-current')).toBe('page')
    await choose('together')
    expect(w.get('[data-nav=garden]').attributes('aria-current')).toBe('page')
    w.unmount()
  })
}
