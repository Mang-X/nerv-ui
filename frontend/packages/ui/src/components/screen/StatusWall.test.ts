import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick, markRaw } from 'vue'
import * as ui from '../../index'

const items = (n = 13) =>
  Array.from({ length: n }, (_, i) => ({
    key: String(i),
    label: '同名',
    identity: `位置 ${i}`,
    status: { label: '待确认', tone: 'amber' as const },
    summary: i === 0 ? '0 人' : '—',
    group: { key: i < 6 ? '0' : 'b', label: '同组名' },
  }))
afterEach(() => vi.restoreAllMocks())
it('bounds flat DOM with real virtual rows and reaches both ends at the rendered stride', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(268)
  const wall = mount(ui.NvScreenStatusWall, { props: { items: items(6000), label: '空间状态' } })
  await nextTick()
  const viewport = wall.get('[data-wall-viewport]')
  expect(wall.findAll('button').length).toBeGreaterThan(0)
  expect(wall.findAll('button').length).toBeLessThanOrEqual(42)
  expect(wall.get('[data-wall-row]').attributes('style')).toContain('height: 122px')
  expect(wall.get('[data-wall-row]').attributes('style')).toContain('margin-bottom: 12px')
  expect(wall.text()).toContain('位置 0')
  ;(viewport.element as HTMLElement).scrollTop = 134 * 998
  await viewport.trigger('scroll')
  expect(wall.text()).toContain('位置 5999')
  expect(wall.findAll('button').length).toBeLessThanOrEqual(42)
  expect(wall.emitted('visible')!.at(-1)![0] as string[]).toContain('5999')
  wall.unmount()
})
it('preserves identity selection zero unknown groups and closes preview for scroll replacement mode and disabled hover', async () => {
  const data = items()
  const wall = mount(ui.NvScreenStatusWall, {
    props: { items: data, label: '空间状态', mode: 'group-grid' },
  })
  expect(wall.get('[role="region"]').attributes('aria-label')).toBe('空间状态')
  expect(wall.findAll('section')).toHaveLength(2)
  expect(wall.text()).toContain('0 人')
  expect(wall.text()).toContain('—')
  const first = wall.get('button')
  expect(first.attributes('aria-label')).toContain('位置 0')
  await first.trigger('mouseenter')
  expect(wall.emitted('preview')!.at(-1)![0]).toEqual(data[0])
  await wall.get('[data-wall-viewport]').trigger('scroll')
  expect(wall.emitted('preview')!.at(-1)).toEqual([null])
  await first.trigger('focus')
  await wall.setProps({ items: [...data].reverse() })
  expect(wall.emitted('preview')!.at(-1)).toEqual([null])
  await wall.get('button').trigger('click')
  expect(wall.emitted('select')!.at(-1)![0]).toEqual(data.at(-1))
  await wall.setProps({ mode: 'group-chip', items: [{ ...data[0]!, disabled: true }] })
  await wall.get('button').trigger('mouseenter')
  expect(wall.emitted('preview')!.at(-1)).toEqual([null])
  expect(wall.get('button').attributes('disabled')).toBeDefined()
  await wall.setProps({ items: [] })
  expect(wall.get('[role="status"]').text()).toBe('暂无记录')
  wall.unmount()
})
it('invalidates same key new content and isolates two instances and unmount', async () => {
  const data = items(1)
  const a = mount(ui.NvScreenStatusWall, { props: { items: data, label: 'A' } })
  const b = mount(ui.NvScreenStatusWall, { props: { items: data, label: 'B' } })
  await nextTick()
  await a.get('button').trigger('mouseenter')
  await a.setProps({ items: [{ ...data[0]!, identity: '新位置' }] })
  expect(a.emitted('preview')!.at(-1)).toEqual([null])
  expect(a.text()).toContain('新位置')
  expect(b.text()).toContain('位置 0')
  await nextTick()
  await a.get('button').trigger('focus')
  await a.setProps({ mode: 'group-chip' })
  expect(a.emitted('preview')!.at(-1)).toEqual([null])
  a.unmount()
  expect(a.emitted('preview')!.at(-1)).toEqual([null])
  b.unmount()
})

it('keeps group namespaces separate and updates keyed content through reorder deletion and short flat replacement', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(268)
  const data = items(3)
  const wall = mount(ui.NvScreenStatusWall, {
    props: {
      label: '分区',
      mode: 'group-grid',
      items: [
        { ...data[0]!, group: undefined },
        { ...data[1]!, group: { key: 'ungrouped', label: '同名' } },
        { ...data[2]!, group: { key: '0', label: '同名' } },
      ],
    },
  })
  expect(wall.findAll('section')).toHaveLength(3)
  await wall.setProps({ items: [data[2]!, data[0]!] })
  expect(wall.findAll('button').map((b) => b.attributes('aria-label'))).toEqual([
    expect.stringContaining('位置 2'),
    expect.stringContaining('位置 0'),
  ])
  await wall.setProps({ mode: 'flat', items: items(6000) })
  await nextTick()
  const viewport = wall.get('[data-wall-viewport]')
  ;(viewport.element as HTMLElement).scrollTop = 134 * 998
  await viewport.trigger('scroll')
  await wall.setProps({ items: [data[0]!] })
  await nextTick()
  expect((viewport.element as HTMLElement).scrollTop).toBe(0)
  expect(wall.findAll('button')).toHaveLength(1)
  expect(wall.emitted('visible')!.at(-1)).toEqual([['0']])
  await wall.get('button').trigger('focus')
  await wall.trigger('keydown', { key: 'Escape' })
  expect(wall.emitted('preview')!.at(-1)).toEqual([null])
  await wall.setProps({ items: [] })
  expect(wall.emitted('visible')!.at(-1)).toEqual([[]])
  wall.unmount()
})

it('emits the authoritative item reference from real virtual rows after scrolling and replacement', async () => {
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(268)
  const data = items(6000)
  const wall = mount(ui.NvScreenStatusWall, { props: { items: markRaw(data), label: '空间状态' } })
  await nextTick()
  await wall.get('button').trigger('mouseenter')
  expect(wall.emitted('preview')!.at(-1)![0]).toBe(data[0])
  const viewport = wall.get('[data-wall-viewport]')
  ;(viewport.element as HTMLElement).scrollTop = 134 * 998
  await viewport.trigger('scroll')
  const last = wall.findAll('button').at(-1)!
  await last.trigger('click')
  expect(wall.emitted('select')!.at(-1)![0]).toBe(data[5999])
  const replacement = { ...data[0]!, identity: '当前版本' }
  await wall.setProps({ items: markRaw([replacement]) })
  await nextTick()
  await wall.get('button').trigger('mouseenter')
  expect(wall.emitted('preview')!.at(-1)![0]).toBe(replacement)
  wall.unmount()
})
