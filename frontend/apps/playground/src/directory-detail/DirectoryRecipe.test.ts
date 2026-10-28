import { mount, flushPromises } from '@vue/test-utils'
import { it, expect } from 'vitest'
import DirectoryRecipe from './DirectoryRecipe.vue'
import type { DirectoryHost } from './contract'
const row = {
  key: 'a',
  code: 'A',
  name: '阅读角',
  parent: 'p',
  quantity: 0,
  eligible: true,
  reason: '',
}
const filter = { parent: 'p', entity: '', keyword: '' }
it('retains actual page identity after a failed request', async () => {
  let fail = false
  const host: DirectoryHost = {
    source: 'library',
    parents: [],
    entities: [],
    query: async (request) => {
      if (fail) throw Error('HTTP secret')
      return { rows: [{ ...row, code: `PAGE-${request.page}` }], total: 5 }
    },
    timeline: async () => ({ state: 'ready', items: [] }),
  }
  const w = mount(DirectoryRecipe, { props: { host, filter } })
  await flushPromises()
  fail = true
  await w.get('button[aria-label="下一页"]').trigger('click')
  await flushPromises()
  expect(w.get('button[aria-label="第 1 页"]').attributes('aria-current')).toBe('page')
  expect(w.text()).toContain('PAGE-1')
  expect(w.text()).not.toContain('HTTP secret')
  w.unmount()
})
it('invalidates an in-flight creation when page changes and retains the draft', async () => {
  let finish!: (value: { receipt: string; row: typeof row }) => void
  const host: DirectoryHost = {
    source: 'library',
    parents: [],
    entities: [],
    query: async () => ({ rows: [row], total: 5 }),
    timeline: async () => ({ state: 'ready', items: [] }),
    create: () => new Promise((resolve) => (finish = resolve)),
  }
  const w = mount(DirectoryRecipe, { props: { host, filter } })
  await flushPromises()
  await w.get('input[aria-label="新条目名称"]').setValue('新空间')
  await w
    .findAll('button')
    .find((b) => b.text() === '添加条目')!
    .trigger('click')
  await w.get('button[aria-label="下一页"]').trigger('click')
  await flushPromises()
  finish({ receipt: '旧创建成功', row })
  await flushPromises()
  expect(w.text()).not.toContain('旧创建成功')
  expect((w.get('input[aria-label="新条目名称"]').element as HTMLInputElement).value).toBe('新空间')
  w.unmount()
})
it('ignores query success from a previous source', async () => {
  let finish!: (value: { rows: (typeof row)[]; total: number }) => void
  const host: DirectoryHost = {
    source: 'old',
    parents: [],
    entities: [],
    query: () => new Promise((resolve) => (finish = resolve)),
    timeline: async () => ({ state: 'ready', items: [] }),
  }
  const w = mount(DirectoryRecipe, { props: { host, filter } })
  await w.setProps({
    host: {
      ...host,
      source: 'new',
      query: async () => ({ rows: [{ ...row, name: '当前空间' }], total: 1 }),
    },
  })
  await flushPromises()
  finish({ rows: [{ ...row, name: '过期空间' }], total: 1 })
  await flushPromises()
  expect(w.text()).toContain('当前空间')
  expect(w.text()).not.toContain('过期空间')
  w.unmount()
})
it('retains the creation draft on failure and requires a receipt', async () => {
  const host: DirectoryHost = {
    source: 'library',
    parents: [],
    entities: [],
    query: async () => ({ rows: [], total: 0 }),
    timeline: async () => ({ state: 'ready', items: [] }),
    create: async () => ({ receipt: '', row }),
  }
  const w = mount(DirectoryRecipe, { props: { host, filter } })
  await flushPromises()
  await w.get('input[aria-label="新条目名称"]').setValue('新空间')
  await w
    .findAll('button')
    .find((b) => b.text() === '添加条目')!
    .trigger('click')
  await flushPromises()
  expect(w.text()).toContain('暂时无法添加')
  expect((w.get('input[aria-label="新条目名称"]').element as HTMLInputElement).value).toBe('新空间')
  w.unmount()
})
it('shows zero in details and retries only the selected timeline source', async () => {
  let calls = 0
  const host: DirectoryHost = {
    source: 'library',
    parents: [],
    entities: [],
    query: async () => ({ rows: [row], total: 1 }),
    timeline: async () => {
      if (++calls === 1) throw Error('HTTP secret')
      return { state: 'unlinked', message: '尚未建立关联。' }
    },
  }
  const w = mount(DirectoryRecipe, { attachTo: document.body, props: { host, filter } })
  await flushPromises()
  await w.get('button[aria-label="查看阅读角（A）"]').trigger('click')
  await flushPromises()
  expect(document.body.textContent).toContain('暂时无法加载记录')
  expect(document.body.textContent).not.toContain('HTTP secret')
  const retry = [...document.body.querySelectorAll('button')].find(
    (b) => b.textContent === '重试记录',
  )!
  retry.click()
  await flushPromises()
  expect(document.body.textContent).toContain('尚未建立关联。')
  expect(calls).toBe(2)
  expect(document.body.querySelector('dd')?.textContent).toBe('0')
  w.unmount()
  document.body.innerHTML = ''
})
it('does not invent accepted filter state when the host rejects a keyword update', async () => {
  const host: DirectoryHost = {
    source: 'library',
    parents: [],
    entities: [],
    query: async () => ({ rows: [row], total: 1 }),
    timeline: async () => ({ state: 'ready', items: [] }),
  }
  const w = mount(DirectoryRecipe, { props: { host, filter } })
  await flushPromises()
  const input = w.get('input[placeholder="输入名称或编号"]')
  await input.setValue('拒绝修改')
  await flushPromises()
  expect(w.emitted('update:filter')?.at(-1)).toEqual([{ ...filter, keyword: '拒绝修改' }])
  expect(w.props('filter').keyword).toBe('')
  expect(w.text()).toContain('阅读角')
  w.unmount()
})
