import { reactive, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { NvTree } from '../../../index'

const nodes = [
  {
    key: 'a',
    label: '书房',
    children: [
      {
        key: 'b',
        label: '诗歌',
        inactive: true,
        status: { label: '暂停', tone: 'neutral' as const },
      },
    ],
  },
  { key: 'c', label: '画室', disabled: true },
]
describe('NvTree public DOM', () => {
  it('keeps selection and expansion authoritative when requests are rejected', async () => {
    const w = mount(NvTree, { props: { nodes, label: '空间', expanded: [], selectedKey: null } })
    await w.get('[role=treeitem]').trigger('click')
    expect(w.emitted('update:selectedKey')).toEqual([['a']])
    expect(w.get('[role=treeitem]').attributes('aria-selected')).toBe('false')
    await w.get('[role=treeitem]').trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:expanded')).toEqual([[['a']]])
    expect(w.findAll('[role=treeitem]')).toHaveLength(2)
  })
  it('shows inactive separately from disabled and isolates create actions', async () => {
    const w = mount(NvTree, {
      props: { nodes, label: '空间', expanded: ['a'], selectedKey: null },
      slots: { actions: '<button>添加书架</button>' },
    })
    const rows = w.findAll('[role=treeitem]')
    expect(rows[1].text()).toContain('暂停')
    await rows[1].trigger('click')
    expect(w.emitted('update:selectedKey')).toEqual([['b']])
    await rows[2].trigger('click')
    await w.get('button').trigger('click')
    expect(w.emitted('update:selectedKey')).toHaveLength(1)
  })
  it('tracks stable keys through replacement, nested mutation, collapse and empty trees', async () => {
    const w = mount(NvTree, { props: { nodes, label: '空间', expanded: ['a'], selectedKey: 'b' } })
    await w.setProps({ nodes: [nodes[1], { ...nodes[0], label: '新书房' }] })
    expect(w.findAll('[aria-selected=true]')).toHaveLength(1)
    await w.setProps({ expanded: [] })
    expect(w.findAll('[aria-selected=true]')).toHaveLength(0)
    await w.setProps({ nodes: [] })
    expect(w.get('[role=tree]').attributes('aria-label')).toBe('空间')
    expect(w.text()).toContain('暂无内容')
  })
  it('reacts to nested in-place edits and restores focus to a collapsed ancestor', async () => {
    const items = reactive([{ key: 'p', label: '书房', children: [{ key: 'q', label: '旧书架' }] }])
    const w = mount(NvTree, {
      attachTo: document.body,
      props: { nodes: items, label: '空间', expanded: ['p'], selectedKey: 'q' },
    })
    items[0].children[0].label = '新书架'
    items[0].children.push({ key: 'r', label: '诗集' })
    await nextTick()
    expect(w.findAll('[role=treeitem]')).toHaveLength(3)
    expect(w.find('[aria-selected=true]').attributes('aria-label')).toBe('新书架')
    ;(w.findAll('[role=treeitem]')[1].element as HTMLElement).focus()
    await w.setProps({ expanded: [] })
    await nextTick()
    expect(document.activeElement).toBe(w.get('[role=treeitem]').element)
    await w.setProps({ expanded: ['p'] })
    expect(w.find('[aria-selected=true]').attributes('aria-label')).toBe('新书架')
    w.unmount()
  })
  it('moves focus with arrows and Home/End without selecting', async () => {
    const w = mount(NvTree, {
      attachTo: document.body,
      props: { nodes, label: '空间', expanded: ['a'], selectedKey: null },
    })
    const rows = w.findAll('[role=treeitem]')
    ;(rows[0].element as HTMLElement).focus()
    await rows[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(rows[1].element)
    await rows[1].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(rows[2].element)
    await rows[2].trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(rows[0].element)
    expect(w.emitted('update:selectedKey')).toBeUndefined()
    w.unmount()
  })
})
