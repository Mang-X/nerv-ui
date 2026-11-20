import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { h, nextTick, shallowRef } from 'vue'
import { NvScreenStatusHero } from '@nerv-ui/ui'

it('exports a large status hero with independent host label, tone, and rhythm updates', async () => {
  const tone = shallowRef<'green' | 'amber' | 'red' | 'cyan' | 'neutral'>('green')
  const rhythm = shallowRef<'still' | 'steady' | 'slow' | 'fast'>('steady')
  const label = shallowRef('开放中')
  const host = mount({
    setup: () => () =>
      h(NvScreenStatusHero, { tone: tone.value, rhythm: rhythm.value, label: label.value }),
  })
  const hero = () => host.get('[data-status-hero]')
  expect(hero().attributes('role')).toBe('status')
  expect(hero().text()).toBe('开放中')
  expect(hero().classes()).toContain('nv-scr-sh-green')
  expect(hero().classes()).toContain('nv-scr-sh-steady')
  tone.value = 'neutral'
  rhythm.value = 'still'
  label.value = '状态待确认'
  await nextTick()
  expect(hero().text()).toBe('状态待确认')
  expect(hero().classes()).toContain('nv-scr-sh-neutral')
  expect(hero().classes()).toContain('nv-scr-sh-still')
  expect(hero().classes()).not.toContain('nv-scr-sh-green')
  host.unmount()
})

it('preserves every neutral palette tone and independent rhythm without deriving one from the other', async () => {
  const hero = mount(NvScreenStatusHero, { props: { label: '读数待确认' } })
  expect(hero.classes()).toContain('nv-scr-sh-neutral')
  expect(hero.classes()).toContain('nv-scr-sh-still')
  for (const tone of ['cyan', 'green', 'amber', 'red', 'neutral'] as const) {
    await hero.setProps({ tone, rhythm: 'fast' })
    expect(hero.classes()).toContain(`nv-scr-sh-${tone}`)
    expect(hero.classes()).toContain('nv-scr-sh-fast')
  }
  await hero.setProps({ rhythm: 'slow' })
  expect(hero.classes()).toContain('nv-scr-sh-neutral')
  expect(hero.classes()).toContain('nv-scr-sh-slow')
  hero.unmount()
})

it('keeps auxiliary actions interactive and forwards public root attributes', async () => {
  const clicked = shallowRef(0)
  const hero = mount(NvScreenStatusHero, {
    props: { label: '等待说明', tone: 'amber' },
    attrs: { id: 'public-status', 'aria-describedby': 'host-description', class: 'host-class' },
    slots: {
      auxiliary: () => h('button', { type: 'button', onClick: () => clicked.value++ }, '查看说明'),
    },
  })
  expect(hero.attributes('id')).toBe('public-status')
  expect(hero.attributes('aria-describedby')).toBe('host-description')
  expect(hero.classes()).toContain('host-class')
  await hero.get('button').trigger('click')
  expect(clicked.value).toBe(1)
  hero.unmount()
})

it('updates one instance and replaces it without changing another instance', async () => {
  const firstLabel = shallowRef('第一处')
  const mounted = shallowRef(true)
  const host = mount({
    setup: () => () =>
      h('div', [
        mounted.value
          ? h(NvScreenStatusHero, { key: 'first', label: firstLabel.value, tone: 'green' })
          : h(NvScreenStatusHero, { key: 'replacement', label: '新的一处', tone: 'amber' }),
        h(NvScreenStatusHero, { label: '第二处', tone: 'red' }),
      ]),
  })
  const heroes = () => host.findAll('[data-status-hero]')
  firstLabel.value = '第一处更新'
  await nextTick()
  expect(heroes().map((hero) => hero.text())).toEqual(['第一处更新', '第二处'])
  mounted.value = false
  await nextTick()
  expect(heroes().map((hero) => hero.text())).toEqual(['新的一处', '第二处'])
  expect(heroes()[1]!.classes()).toContain('nv-scr-sh-red')
  host.unmount()
})
