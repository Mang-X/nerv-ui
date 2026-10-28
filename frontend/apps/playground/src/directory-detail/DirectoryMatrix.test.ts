import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { reactive, nextTick } from 'vue'
import { NvEntityPicker, NvSheet, NvStatusBadge } from '@nerv-iip/ui'
import DirectoryRecipe from './DirectoryRecipe.vue'
import DirectoryDemo from './DirectoryDemo.vue'
import type { DirectoryHost, DirectoryPage, DirectoryTimeline } from './contract'
const row = {
  key: 'a',
  code: 'A',
  name: '阅读角',
  parent: 'p',
  quantity: 0,
  eligible: true,
  reason: '',
}
const other = { ...row, key: 'b', code: 'B', name: '长桌' }
const filter = { parent: 'p', entity: '', keyword: '' }
const wrappers: VueWrapper[] = []
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount())
  document.body.innerHTML = ''
})
function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
function host(overrides: Partial<DirectoryHost> = {}): DirectoryHost {
  return {
    source: 'library',
    parents: [
      { value: 'p', label: '书房' },
      { value: 'q', label: '画室' },
    ],
    entities: [
      { value: 'a', label: row.name, code: 'A', parent: 'p' },
      { value: 'b', label: other.name, code: 'B', parent: 'q' },
    ],
    query: async () => ({ rows: [row, other], total: 5 }),
    timeline: async () => ({ state: 'ready', items: [] }),
    ...overrides,
  }
}
function setup(h = host()) {
  const w = mount(DirectoryRecipe, {
    attachTo: document.body,
    props: { host: h, filter: { ...filter } },
  })
  wrappers.push(w)
  return w
}
async function click(w: VueWrapper, text: string) {
  await w
    .findAll('button')
    .find((b) => b.text() === text)!
    .trigger('click')
}
async function open(w: VueWrapper, name = '阅读角（A）') {
  await w.get(`button[aria-label="查看${name}"]`).trigger('click')
  await flushPromises()
}
function bodyButton(text: string) {
  return [...document.body.querySelectorAll('button')].find((b) => b.textContent?.trim() === text)!
}
it('controls single selection cascade external clear rejection and free query snapshots', async () => {
  const query = vi.fn(host().query)
  const w = setup(host({ query }))
  await flushPromises()
  const pickers = w.findAllComponents(NvEntityPicker)
  pickers[1]!.vm.$emit('update:modelValue', 'a')
  await nextTick()
  expect(w.emitted('update:filter')?.at(-1)).toEqual([{ ...filter, entity: 'a' }])
  expect(pickers[1]!.props('modelValue')).toBe('')
  expect(query).toHaveBeenCalledTimes(1)
  await w.setProps({ filter: { ...filter, entity: 'a' } })
  await flushPromises()
  pickers[0]!.vm.$emit('update:modelValue', 'q')
  expect(w.emitted('update:filter')?.at(-1)).toEqual([{ ...filter, parent: 'q', entity: '' }])
  await w.setProps({ filter: { parent: 'q', entity: 'a', keyword: '' } })
  await flushPromises()
  expect(query.mock.calls.at(-1)![0].filter).toEqual({ parent: 'q', entity: '', keyword: '' })
  expect(pickers[1]!.props('options')).toEqual([
    { value: 'b', label: '长桌', code: 'B', parent: 'q' },
  ])
  await w.setProps({ filter: { parent: '', entity: '', keyword: '全新文字' } })
  await flushPromises()
  expect(query.mock.calls.at(-1)![0].filter).toEqual({
    parent: '',
    entity: '',
    keyword: '全新文字',
  })
  await w.setProps({ filter: { parent: '', entity: '', keyword: '' } })
  await flushPromises()
  expect(pickers[0]!.props('modelValue')).toBe('')
  expect(pickers[1]!.props('modelValue')).toBe('')
  expect(query.mock.calls.at(-1)![0].filter).toEqual({ parent: '', entity: '', keyword: '' })
})
it('keeps stable detail and action identity through reorder replacement and deletion', async () => {
  const page = reactive<DirectoryPage>({ rows: [{ ...row, note: '' }, other], total: 2 })
  const timeline = vi.fn(host().timeline)
  const w = setup(host({ query: async () => page, timeline }))
  await flushPromises()
  await open(w)
  page.rows.reverse()
  await nextTick()
  expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('阅读角')
  expect(timeline).toHaveBeenCalledTimes(1)
  page.rows[1] = {
    ...row,
    name: '新阅读角',
    code: 'A2',
    quantity: null,
    note: '一段很长的说明'.repeat(30),
    eligible: false,
    reason: '暂不开放',
  }
  await flushPromises()
  const dialog = document.body.querySelector('[role="dialog"]')!
  expect(dialog.textContent).toContain('新阅读角')
  expect(dialog.textContent).toContain('A2')
  expect(dialog.querySelectorAll('dt')).toHaveLength(1)
  expect(bodyButton('以此筛选').disabled).toBe(true)
  expect(timeline.mock.calls.at(-1)![0].name).toBe('新阅读角')
  page.rows[1] = { ...row, name: '当前阅读角', code: 'A3' }
  await flushPromises()
  expect(dialog.querySelector('dd')?.textContent?.trim()).toBe('0')
  bodyButton('以此筛选').click()
  await nextTick()
  expect(w.emitted('update:filter')?.at(-1)).toEqual([{ ...filter, entity: 'a' }])
  page.rows.splice(1, 1)
  await flushPromises()
  expect(dialog.textContent).toContain('条目已移除')
  expect(bodyButton('以此筛选')).toBeUndefined()
})
it.each(
  ['source', 'filter'].flatMap((boundary) =>
    ['success', 'failure'].map((outcome) => ({ boundary, outcome })),
  ),
)(
  'ignores old query $outcome and finally on $boundary while current request is pending',
  async ({ boundary, outcome }) => {
    const old = deferred<DirectoryPage>(),
      current = deferred<DirectoryPage>()
    let oldSignal!: AbortSignal
    let calls = 0
    const h = host({
      query: (_r, s) => {
        if (++calls === 1) {
          oldSignal = s
          return old.promise
        }
        return current.promise
      },
    })
    const w = setup(h)
    if (boundary === 'source')
      await w.setProps({ host: host({ source: 'studio', query: () => current.promise }) })
    if (boundary === 'filter') await w.setProps({ filter: { ...filter, keyword: '新' } })
    expect(oldSignal.aborted).toBe(true)
    if (outcome === 'success') old.resolve({ rows: [{ ...row, name: '旧目录' }], total: 1 })
    else old.reject(Error('HTTP secret'))
    await flushPromises()
    expect(w.text()).toContain('正在更新目录')
    expect(w.text()).not.toContain('旧目录')
    expect(w.find('[role="alert"]').exists()).toBe(false)
    current.resolve({ rows: [{ ...row, name: '当前目录' }], total: 1 })
    await flushPromises()
    expect(w.text()).toContain('当前目录')
    expect(w.text()).not.toContain('正在更新目录')
  },
)
it.each(
  ['record', 'close', 'readonly', 'unmount'].flatMap((boundary) =>
    ['success', 'failure'].map((outcome) => ({ boundary, outcome })),
  ),
)('invalidates timeline $outcome and finally on $boundary', async ({ boundary, outcome }) => {
  const first = deferred<DirectoryTimeline>(),
    second = deferred<DirectoryTimeline>()
  const signals: AbortSignal[] = []
  const timeline = vi.fn((_r, s: AbortSignal) => {
    signals.push(s)
    return signals.length === 1 ? first.promise : second.promise
  })
  const w = setup(host({ timeline }))
  await flushPromises()
  await open(w)
  if (boundary === 'record') await open(w, '长桌（B）')
  if (boundary === 'close') {
    w.findComponent(NvSheet).vm.$emit('update:open', false)
    await nextTick()
  }
  if (boundary === 'readonly') await w.setProps({ readonly: true })
  if (boundary === 'unmount') w.unmount()
  expect(signals[0]!.aborted).toBe(true)
  if (outcome === 'success')
    first.resolve({ state: 'ready', items: [{ key: 'old', title: '旧记录' }] })
  else first.reject(Error('HTTP secret'))
  await flushPromises()
  expect(document.body.textContent).not.toContain('旧记录')
  expect(document.body.textContent).not.toContain('暂时无法加载记录')
  if (boundary === 'record') expect(document.body.textContent).toContain('正在加载记录')
  if (boundary === 'close' || boundary === 'readonly') await open(w)
  if (boundary !== 'unmount') {
    second.resolve({ state: 'ready', items: [{ key: 'current', title: '当前记录' }] })
    await flushPromises()
    expect(document.body.textContent).toContain('当前记录')
    expect(document.body.textContent).not.toContain('正在加载记录')
  }
})
it.each(['ready', 'empty', 'forbidden', 'unlinked'] as const)(
  'renders single-source timeline %s without fallback queries',
  async (state) => {
    const timeline = vi.fn(
      async (_row, _signal): Promise<DirectoryTimeline> =>
        state === 'ready'
          ? {
              state: 'ready',
              items: [{ key: 'opened', title: '开放记录', label: '2026-10-28 09:30' }],
            }
          : state === 'empty'
            ? { state: 'ready', items: [] }
            : { state, message: state === 'forbidden' ? '无权查看' : '尚未关联' },
    )
    const w = setup(host({ timeline }))
    await flushPromises()
    await open(w)
    expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain(
      { ready: '开放记录', empty: '暂无记录', forbidden: '无权查看', unlinked: '尚未关联' }[state],
    )
    expect(timeline).toHaveBeenCalledTimes(1)
    expect(timeline.mock.calls[0]).toEqual([
      expect.objectContaining({ key: 'a' }),
      expect.any(AbortSignal),
    ])
    expect(bodyButton('重试记录')).toBeUndefined()
  },
)
it.each(['source', 'filter', 'page', 'readonly', 'unmount'] as const)(
  'invalidates creation receipt and finally on %s',
  async (boundary) => {
    const pending = deferred<{ receipt: string; row: typeof row }>()
    let signal!: AbortSignal
    const create = vi.fn((_n: string, _p: string, s: AbortSignal) => {
      signal = s
      return pending.promise
    })
    const w = setup(host({ create }))
    await flushPromises()
    await w.get('input[aria-label="新条目名称"]').setValue('新空间')
    await click(w, '添加条目')
    await click(w, '添加条目')
    expect(create).toHaveBeenCalledTimes(1)
    if (boundary === 'source') await w.setProps({ host: host({ source: 'studio', create }) })
    if (boundary === 'filter') await w.setProps({ filter: { ...filter, keyword: '新' } })
    if (boundary === 'page') await w.get('button[aria-label="下一页"]').trigger('click')
    if (boundary === 'readonly') await w.setProps({ readonly: true })
    if (boundary === 'unmount') w.unmount()
    expect(signal.aborted).toBe(true)
    pending.resolve({ receipt: 'saved', row })
    await flushPromises()
    expect(document.body.textContent).not.toContain('条目已添加')
    if (boundary !== 'unmount')
      expect((w.get('input[aria-label="新条目名称"]').element as HTMLInputElement).value).toBe(
        '新空间',
      )
  },
)
it('retries failed creation and confirms only a valid receipt; no callback has no success', async () => {
  const create = vi
    .fn()
    .mockRejectedValueOnce(Error('operationId secret'))
    .mockResolvedValueOnce({ receipt: 'ok', row })
  const query = vi.fn(host().query)
  const w = setup(host({ create, query }))
  await flushPromises()
  await w.get('input[aria-label="新条目名称"]').setValue('  新空间  ')
  await click(w, '添加条目')
  await flushPromises()
  expect(w.text()).toContain('暂时无法添加')
  expect(w.text()).not.toContain('operationId')
  expect(query).toHaveBeenCalledTimes(1)
  await click(w, '添加条目')
  await flushPromises()
  expect(create.mock.calls[1]!.slice(0, 2)).toEqual(['新空间', 'p'])
  expect(query).toHaveBeenCalledTimes(2)
  expect(w.text()).toContain('条目已添加')
  expect((w.get('input[aria-label="新条目名称"]').element as HTMLInputElement).value).toBe('')
  await w.setProps({ host: host() })
  await flushPromises()
  expect(w.text()).not.toContain('添加条目')
  expect(w.text()).not.toContain('条目已添加')
})
it('does not reset open detail when host options change in place', async () => {
  const h = reactive(host())
  const w = setup(h)
  await flushPromises()
  await open(w)
  h.parents.push({ value: 'r', label: '新分区' })
  await flushPromises()
  expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('阅读角')
})
it.each(['library', 'studio'])(
  'uses %s host deep link real page identity range and legal creation',
  async (space) => {
    window.location.hash = `#directory-detail/${space}`
    const w = mount(DirectoryDemo, { attachTo: document.body })
    wrappers.push(w)
    await flushPromises()
    expect(w.findComponent(DirectoryRecipe).props('host').source).toBe(space)
    expect(w.text()).toContain('窗边阅读角')
    expect(w.text()).toContain('共读长桌')
    await w.get('button[aria-label="下一页"]').trigger('click')
    await flushPromises()
    expect(w.text()).toContain('静读小屋')
    expect(w.text()).not.toContain('窗边阅读角')
    expect(w.text()).toMatch(/3\s*[-–—~至]\s*3/)
    await w.get('input[aria-label="新条目名称"]').setValue('新空间')
    await click(w, '添加条目')
    await flushPromises()
    expect(w.text()).toContain('条目已添加')
    expect(w.text()).toContain('新空间')
  },
)

it.each(['success', 'failure'] as const)(
  'keeps current creation pending after old %s and finally',
  async (outcome) => {
    const old = deferred<{ receipt: string; row: typeof row }>(),
      current = deferred<{ receipt: string; row: typeof row }>()
    let calls = 0
    const create = vi.fn(() => (++calls === 1 ? old.promise : current.promise))
    const w = setup(host({ create }))
    await flushPromises()
    await w.get('input[aria-label="新条目名称"]').setValue('新空间')
    await click(w, '添加条目')
    await w.setProps({ filter: { ...filter, keyword: '新' } })
    await flushPromises()
    await click(w, '添加条目')
    if (outcome === 'success') old.resolve({ receipt: 'old', row })
    else old.reject(Error('HTTP secret'))
    await flushPromises()
    expect(w.text()).not.toContain('条目已添加')
    expect(w.text()).not.toContain('暂时无法添加')
    expect(
      w
        .findAll('button')
        .find((b) => b.text() === '添加条目')!
        .attributes('disabled'),
    ).toBeDefined()
    current.resolve({ receipt: 'current', row })
    await flushPromises()
    expect(w.text()).toContain('条目已添加')
  },
)
it('aborts query on unmount and ignores its late failure', async () => {
  const pending = deferred<DirectoryPage>()
  let signal!: AbortSignal
  const w = setup(
    host({
      query: (_r, s) => {
        signal = s
        return pending.promise
      },
    }),
  )
  w.unmount()
  expect(signal.aborted).toBe(true)
  pending.reject(Error('HTTP secret'))
  await flushPromises()
  expect(document.body.textContent).not.toContain('HTTP secret')
})
it('retries only the failed directory and prevents duplicate timeline retries', async () => {
  const query = vi
    .fn()
    .mockRejectedValueOnce(Error('HTTP secret'))
    .mockResolvedValue({ rows: [row], total: 1 })
  const pending = deferred<DirectoryTimeline>()
  const timeline = vi
    .fn()
    .mockRejectedValueOnce(Error('HTTP secret'))
    .mockImplementation(() => pending.promise)
  const w = setup(host({ query, timeline }))
  await flushPromises()
  expect(w.text()).toContain('暂时无法更新目录')
  await click(w, '重试目录')
  await flushPromises()
  expect(w.text()).toContain('阅读角')
  expect(query).toHaveBeenCalledTimes(2)
  await open(w)
  const retry = bodyButton('重试记录')
  retry.click()
  retry.click()
  await nextTick()
  expect(timeline).toHaveBeenCalledTimes(2)
  expect(query).toHaveBeenCalledTimes(2)
  pending.resolve({ state: 'ready', items: [] })
  await flushPromises()
  expect(document.body.textContent).toContain('暂无记录')
})
it.each(['success', 'failure'] as const)(
  'ignores old page query %s and finally during a newer page',
  async (outcome) => {
    const old = deferred<DirectoryPage>(),
      current = deferred<DirectoryPage>()
    const w = setup(
      host({
        query: async (request) =>
          request.page === 1
            ? { rows: [row], total: 5 }
            : request.page === 2
              ? old.promise
              : current.promise,
      }),
    )
    await flushPromises()
    const table = w.findComponent({ name: 'NvDataTable' })
    table.vm.$emit('update:page', 2)
    await nextTick()
    table.vm.$emit('update:page', 3)
    await nextTick()
    if (outcome === 'success') old.resolve({ rows: [other], total: 5 })
    else old.reject(Error('HTTP secret'))
    await flushPromises()
    expect(w.text()).toContain('正在更新目录')
    expect(w.text()).toContain('阅读角')
    expect(w.text()).not.toContain('长桌')
    expect(w.find('[role="alert"]').exists()).toBe(false)
    current.resolve({ rows: [{ ...other, name: '第三页' }], total: 5 })
    await flushPromises()
    expect(w.text()).toContain('第三页')
    expect(w.get('button[aria-label="第 3 页"]').attributes('aria-current')).toBe('page')
  },
)
it('refreshes created picker options and isolates the two neutral sources', async () => {
  window.location.hash = '#directory-detail/library'
  const w = mount(DirectoryDemo, { attachTo: document.body })
  wrappers.push(w)
  await flushPromises()
  await w.get('input[aria-label="新条目名称"]').setValue('书房新空间')
  await click(w, '添加条目')
  await flushPromises()
  expect(w.findAllComponents(NvEntityPicker)[1]!.props('options')).toContainEqual(
    expect.objectContaining({ label: '书房新空间' }),
  )
  await click(w, '前往画室')
  await flushPromises()
  expect(window.location.hash).toBe('#directory-detail/studio')
  expect(w.findAllComponents(NvEntityPicker)[1]!.props('options')).not.toContainEqual(
    expect.objectContaining({ label: '书房新空间' }),
  )
})

it('requests clearing a removed same-parent child and never revives an accepted removal', async () => {
  const input = reactive(host())
  const w = setup(input)
  await w.setProps({ filter: { ...filter, entity: 'a' } })
  await flushPromises()
  const saved = [...input.entities]
  input.entities = input.entities.filter((item) => item.value !== 'a')
  await flushPromises()
  expect(w.emitted('update:filter')?.at(-1)).toEqual([{ ...filter, entity: '' }])
  await w.setProps({ filter: { ...filter, entity: '' } })
  input.entities = saved
  await flushPromises()
  expect(w.findAllComponents(NvEntityPicker)[1]!.props('modelValue')).toBe('')
})

it.each(['forbidden', 'unlinked'] as const)(
  'gives %s an explicit status presentation',
  async (state) => {
    const w = setup(host({ timeline: async () => ({ state, message: '当前记录说明' }) }))
    await flushPromises()
    await open(w)
    const badge = w.findComponent(NvStatusBadge)
    expect(badge.exists()).toBe(true)
    expect(badge.props('tone')).toBe(state === 'forbidden' ? 'warning' : 'neutral')
    expect(badge.props('label')).toBe(state === 'forbidden' ? '受限' : '未关联')
    expect(document.body.textContent).toContain('当前记录说明')
  },
)

it('batches selected same-parent option reorders without resetting query detail or current creation', async () => {
  const creation = deferred<{ receipt: string; row: typeof row }>()
  const query = vi.fn(async () => ({ rows: [row, other], total: 2 }))
  const create = vi.fn(() => creation.promise)
  const input = reactive(
    host({
      query,
      create,
      entities: [
        { value: 'a', label: row.name, code: 'A', parent: 'p' },
        { value: 'b', label: other.name, code: 'B', parent: 'p' },
      ],
    }),
  )
  const w = setup(input)
  await w.setProps({ filter: { ...filter, entity: 'a' } })
  await flushPromises()
  await open(w)
  const before = query.mock.calls.length
  await w.get('input[aria-label="新条目名称"]').setValue('新阅读空间')
  await click(w, '添加条目')
  input.entities.reverse()
  await flushPromises()
  expect(query).toHaveBeenCalledTimes(before)
  expect(w.emitted('update:filter')).toBeUndefined()
  expect(document.body.querySelector('[role="dialog"]')?.textContent).toContain('阅读角')
  expect(
    w
      .findAll('button')
      .find((b) => b.text() === '添加条目')!
      .attributes('disabled'),
  ).toBeDefined()
  creation.resolve({ receipt: '新增确认', row })
  await flushPromises()
  expect(w.text()).toContain('条目已添加。')
  expect(create).toHaveBeenCalledTimes(1)
})

it.each(['delete', 'move'] as const)(
  'rejects queued creation receipt before a same-tick candidate %s without losing draft',
  async (boundary) => {
    const creation = deferred<{ receipt: string; row: typeof row }>()
    const input = reactive(host({ create: () => creation.promise }))
    const w = setup(input)
    await w.setProps({ filter: { ...filter, entity: 'a' } })
    await flushPromises()
    await w.get('input[aria-label="新条目名称"]').setValue('当前草稿')
    await click(w, '添加条目')
    creation.resolve({ receipt: '过期确认', row })
    if (boundary === 'delete') input.entities.splice(0, 1)
    else input.entities[0]!.parent = 'q'
    await flushPromises()
    expect((w.get('input[aria-label="新条目名称"]').element as HTMLInputElement).value).toBe(
      '当前草稿',
    )
    expect(w.text()).not.toContain('条目已添加。')
  },
)
