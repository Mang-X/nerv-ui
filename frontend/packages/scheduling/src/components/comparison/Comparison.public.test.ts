import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { NvStatusBadge } from '@nerv-iip/ui'
import {
  ChangeSummaryPanel,
  ScheduleRevisionReview,
  SchedulingPreviewResult,
  compareScheduleSnapshots,
  type ScheduleComparisonRow,
  type ScheduleSnapshot,
  type ScheduleSnapshotItem,
  type ScheduleSnapshotMetric,
  type ScheduleTask,
  type ScheduleChange,
} from '../../index'

function task(id: string, startUtc = '2026-11-02T01:00:00Z'): ScheduleTask {
  return {
    id,
    orderId: 'legacy-order',
    operationId: 'legacy-operation',
    operationSequence: 1,
    type: 'operation',
    text: '晨间共读',
    resourceId: 'room-a',
    display: { resourceLabel: '晨光书房' },
    timezone: 'Asia/Shanghai',
    startUtc,
    endUtc: '2026-11-02T03:00:00Z',
    locked: false,
    hasConflict: false,
  }
}

function snapshot(id: string, items: ScheduleSnapshot['items']): ScheduleSnapshot {
  return {
    id,
    label: id,
    source: { kind: 'snapshot', label: id, capturedAt: '2026-11-01 10:00（Asia/Shanghai）' },
    items,
  }
}

describe('public snapshot comparison', () => {
  it('keeps readonly items, literal outcome and missing metric value in the public type', () => {
    expectTypeOf<ScheduleSnapshot['items']>().toEqualTypeOf<readonly ScheduleSnapshotItem[]>()
    expectTypeOf<ScheduleComparisonRow['kind']>().toEqualTypeOf<
      'preserved' | 'changed' | 'added' | 'blocked' | 'missing'
    >()
    expectTypeOf<ScheduleSnapshotItem['state']>().toEqualTypeOf<'blocked' | 'unknown' | undefined>()
    expectTypeOf<ScheduleSnapshotMetric['value']>().toEqualTypeOf<number | null | undefined>()
  })
  it('keeps one semantic activity when assignment ids change and ignores matching legacy pairs', async () => {
    const baseline = snapshot('saved', [
      { semanticKey: 'activity-a', label: '晨间共读', task: task('assignment-old') },
      { semanticKey: 'activity-b', label: '午间共读', task: task('same-legacy') },
    ])
    const candidate = snapshot('candidate', [
      { semanticKey: 'activity-a', label: '晨间共读', task: task('assignment-new') },
      { semanticKey: 'activity-c', label: '傍晚分享', task: task('same-legacy') },
    ])
    const rows = compareScheduleSnapshots(baseline, candidate)
    expect(rows.map((row) => [row.semanticKey, row.kind])).toEqual([
      ['activity-a', 'preserved'],
      ['activity-b', 'missing'],
      ['activity-c', 'added'],
    ])
    const wrapper = mount(ScheduleRevisionReview, { props: { baseline, candidate } })
    expect(wrapper.get('[data-semantic-key="activity-a"]').text()).toContain('保持不变')
    expect(wrapper.get('[data-semantic-key="activity-a"]').text()).not.toContain('新增')
    expect(wrapper.get('[data-semantic-key="activity-b"]').text()).toContain('候选未提供')
    expect(wrapper.get('[data-change-task="same-legacy"]').text()).toContain(
      '资源：未提供安排 → 晨光书房',
    )
    await wrapper.get('[data-change-task="same-legacy"]').trigger('click')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['activity-c'])
    expect(wrapper.get('[data-comparison-selection]').text()).toContain('傍晚分享')
  })

  it('shows time resource and segment changes on both sides without inventing blocked or added completion', async () => {
    const before = task('old')
    before.segments = [
      { startUtc: '2026-11-02T01:00:00Z', endUtc: '2026-11-02T01:30:00Z' },
      { startUtc: '2026-11-02T02:00:00Z', endUtc: '2026-11-02T03:00:00Z' },
    ]
    const after = task('new', '2026-11-02T01:30:00Z')
    after.resourceId = 'room-b'
    after.display = { resourceLabel: '林间书屋' }
    after.segments = [
      { startUtc: '2026-11-02T01:30:00Z', endUtc: '2026-11-02T02:00:00Z' },
      { startUtc: '2026-11-02T02:15:00Z', endUtc: '2026-11-02T03:00:00Z' },
    ]
    const baseline = snapshot('saved', [
      { semanticKey: 'activity-a', label: '晨间共读', task: before },
    ])
    const candidate = snapshot('candidate', [
      { semanticKey: 'activity-a', label: '晨间共读', task: after, message: '改用林间书屋' },
      { semanticKey: 'activity-b', label: '午间共读', state: 'blocked', message: '场地未确认' },
      { semanticKey: 'activity-c', label: '傍晚分享', task: task('added') },
    ])
    const wrapper = mount(ScheduleRevisionReview, { props: { baseline, candidate } })
    const changed = wrapper.get('[data-semantic-key="activity-a"]')
    expect(changed.text()).toContain('已调整')
    expect(changed.text()).toContain('晨光书房')
    expect(changed.text()).toContain('林间书屋')
    expect(changed.findAll('td > p time').map((element) => element.attributes('datetime'))).toEqual(
      [before.startUtc, before.endUtc, after.startUtc, after.endUtc],
    )
    await changed.get('summary').trigger('click')
    expect(changed.text()).toContain('基线分段 · 2')
    expect(changed.text()).toContain('候选分段 · 2')
    expect(changed.findAll('li time').map((element) => element.attributes('datetime'))).toEqual([
      before.segments[0]!.startUtc,
      before.segments[0]!.endUtc,
      before.segments[1]!.startUtc,
      before.segments[1]!.endUtc,
      after.segments[0]!.startUtc,
      after.segments[0]!.endUtc,
      after.segments[1]!.startUtc,
      after.segments[1]!.endUtc,
    ])
    expect(wrapper.get('[data-semantic-key="activity-b"]').text()).toContain(
      '待安排；完工时间未提供',
    )
    expect(wrapper.get('[data-semantic-key="activity-b"]').findAll('time')).toHaveLength(0)
    expect(wrapper.get('[data-semantic-key="activity-c"]').text()).toContain('未提供安排')
    expect(wrapper.get('[data-semantic-key="activity-c"]').findAll('time')).toHaveLength(2)
  })

  it('keeps an existing semantic activity when its baseline had no assignment', () => {
    const baseline = snapshot('saved', [
      { semanticKey: 'activity-a', label: '晨间共读', state: 'blocked' },
    ])
    const candidate = snapshot('candidate', [
      { semanticKey: 'activity-a', label: '晨间共读', task: task('first-assignment') },
    ])
    expect(compareScheduleSnapshots(baseline, candidate).map((row) => row.kind)).toEqual([
      'changed',
    ])
  })

  it('rejects missing assignment identities in comparison and recovers after replacement', async () => {
    const baseline = snapshot('saved', [
      { semanticKey: 'activity-a', label: '晨间共读', task: task('saved-id') },
    ])
    const candidate = snapshot('candidate', [
      { semanticKey: 'activity-a', label: '晨间共读', task: task('') },
    ])
    const wrapper = mount(ScheduleRevisionReview, { props: { baseline, candidate } })
    for (const invalidId of ['', '  \t  ']) {
      const invalid = snapshot('candidate', [
        { semanticKey: 'activity-a', label: '晨间共读', task: task(invalidId) },
      ])
      expect(() => compareScheduleSnapshots(baseline, invalid)).toThrow('安排实例身份缺失')
      await wrapper.setProps({ candidate: invalid })
      expect(wrapper.get('[role="alert"]').text()).toContain('安排实例身份缺失')
      expect(wrapper.findAll('[data-change-row]')).toHaveLength(0)
      expect(wrapper.emitted('select')).toBeUndefined()
    }
    const restored = snapshot('candidate', [
      { semanticKey: 'activity-a', label: '晨间共读', task: task(' opaque-id ') },
      { semanticKey: 'activity-b', label: '午间共读', state: 'blocked' },
    ])
    expect(compareScheduleSnapshots(baseline, restored).map((row) => row.kind)).toEqual([
      'preserved',
      'blocked',
    ])
    await wrapper.setProps({ candidate: restored })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    expect(wrapper.get('[data-semantic-key="activity-b"]').text()).toContain('待安排')
    await wrapper.get('[data-change-task=" opaque-id "]').trigger('click')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['activity-a'])
    expect(baseline.items[0]?.task?.id).toBe('saved-id')
  })

  it('keeps missing KPI distinct from a true zero and refuses ambiguous semantic keys', async () => {
    const baseline = snapshot('saved', [
      { semanticKey: 'activity-a', label: '晨间共读', task: task('old') },
    ])
    baseline.metrics = [
      { id: 'delay', label: '延期分钟', format: 'number' },
      { id: 'rate', label: '准时率', value: 0, format: 'percent' },
    ]
    const candidate = snapshot('candidate', [
      { semanticKey: 'activity-a', label: '晨间共读', task: task('new') },
    ])
    candidate.metrics = [
      { id: 'delay', label: '延期分钟', value: 0, format: 'number' },
      { id: 'rate', label: '准时率', format: 'percent' },
    ]
    const wrapper = mount(ScheduleRevisionReview, { props: { baseline, candidate } })
    expect(wrapper.get('[aria-label="来源指标"]').text()).toContain('— → 0')
    expect(wrapper.get('[aria-label="来源指标"]').text()).toContain('0% → —')
    await wrapper.setProps({
      candidate: snapshot('new-candidate', [
        { semanticKey: 'activity-a', label: '晨间共读', task: task('one') },
        { semanticKey: 'activity-a', label: '另一活动', task: task('two') },
      ]),
    })
    expect(wrapper.get('[role="alert"]').text()).toContain('活动身份缺失或重复')
    expect(wrapper.findAll('[data-change-row]')).toHaveLength(0)
    await wrapper.setProps({
      candidate: snapshot('duplicate-assignment', [
        { semanticKey: 'activity-a', label: '晨间共读', task: task('same-assignment') },
        { semanticKey: 'activity-b', label: '午间共读', task: task('same-assignment') },
      ]),
    })
    expect(wrapper.get('[role="alert"]').text()).toContain('安排实例身份重复')
    expect(wrapper.findAll('[data-change-row]')).toHaveLength(0)
    await wrapper.setProps({
      candidate: snapshot('local-time', [
        {
          semanticKey: 'activity-a',
          label: '晨间共读',
          task: { ...task('local-time'), startUtc: '2026-11-02T10:00:00' },
        },
      ]),
    })
    expect(wrapper.get('[role="alert"]').text()).toContain('实际时刻无效')
  })

  it('reads candidate facts and source state without deriving a ready result', async () => {
    const value = snapshot('preview', [])
    value.metrics = [{ id: 'scheduled', label: '已排活动', value: 0, format: 'number' }]
    value.conflicts = {
      conflicts: [],
      unscheduled: [{ id: 'pending', label: '午间共读', message: '等待场地' }],
    }
    value.risks = []
    value.shortages = []
    const wrapper = mount(SchedulingPreviewResult, {
      props: { snapshot: value },
      global: { stubs: { GanttChart: true } },
    })
    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('等待场地')
    expect(wrapper.text()).not.toContain('已发布')
    await wrapper.setProps({
      snapshot: { ...value, source: { ...value.source, state: 'unavailable' } },
    })
    expect(wrapper.text()).toContain('暂不可读取')
    expect(wrapper.text()).not.toContain('等待场地')
  })

  it('keeps missing added and explicit blocked states consistent across table and summary', () => {
    const baseline = snapshot('saved', [
      { semanticKey: 'missing', label: '原活动', task: task('old') },
      { semanticKey: 'blocked', label: '待安排活动', task: task('blocked-old') },
    ])
    const candidate = snapshot('candidate', [
      { semanticKey: 'blocked', label: '待安排活动', state: 'blocked' },
      { semanticKey: 'added', label: '新活动', task: task('new') },
    ])
    const wrapper = mount(ScheduleRevisionReview, { props: { baseline, candidate } })
    const [missing, blocked, added] = wrapper.findAll('[data-change-row]')
    const projected = wrapper.getComponent(ChangeSummaryPanel).props('changes') as ScheduleChange[]
    expect(projected.find((item) => item.orderId === 'missing')?.changeType).toBe('missing')
    expect(missing!.text()).toContain('候选未提供')
    expect(missing!.text()).toContain('新时间：候选未提供')
    expect(missing!.text()).not.toContain('未排')
    expect(missing!.findComponent(NvStatusBadge).props('tone')).toBe('neutral')
    expect(blocked!.text()).toContain('新时间：待安排')
    expect(blocked!.findComponent(NvStatusBadge).props('tone')).toBe('danger')
    expect(added!.text()).toContain('原时间：未提供安排')
    expect(added!.findComponent(NvStatusBadge).props('tone')).toBe('success')
    expect(
      wrapper.get('[data-semantic-key="missing"]').findComponent(NvStatusBadge).props('tone'),
    ).toBe('neutral')
    expect(
      wrapper.get('[data-semantic-key="blocked"]').findComponent(NvStatusBadge).props('tone'),
    ).toBe('danger')
    expect(
      wrapper.get('[data-semantic-key="added"]').findComponent(NvStatusBadge).props('tone'),
    ).toBe('success')
  })

  it('distinguishes absent metrics from explicit empty records while retaining zero and one-sided values', async () => {
    const baseline = snapshot('saved', [])
    const candidate = snapshot('candidate', [])
    const wrapper = mount(ScheduleRevisionReview, { props: { baseline, candidate } })
    expect(wrapper.get('[aria-label="来源指标"]').text()).toContain('指标未提供')
    await wrapper.setProps({
      baseline: { ...baseline, metrics: [] },
      candidate: { ...candidate, metrics: [] },
    })
    expect(wrapper.get('[aria-label="来源指标"]').text()).toContain('此来源无指标记录')
    await wrapper.setProps({
      baseline: { ...baseline, metrics: [] },
      candidate: {
        ...candidate,
        metrics: [{ id: 'count', label: '活动数', value: 0, format: 'number' }],
      },
    })
    expect(wrapper.get('[aria-label="来源指标"]').text()).toContain('— → 0')
    await wrapper.setProps({ baseline, candidate: { ...candidate, metrics: [] } })
    expect(wrapper.get('[aria-label="来源指标"]').text()).toContain('指标未提供')
  })

  it('rejects duplicate preview assignment identities without emitting a wrong semantic selection', async () => {
    const value = snapshot('preview', [
      { semanticKey: 'first', label: '晨间共读', task: task('shared') },
      { semanticKey: 'second', label: '午间共读', task: task('shared') },
    ])
    value.model = {} as NonNullable<ScheduleSnapshot['model']>
    const wrapper = mount(SchedulingPreviewResult, { props: { snapshot: value } })
    expect(wrapper.get('[role="alert"]').text()).toContain('安排实例身份重复')
    expect(wrapper.findComponent({ name: 'GanttChart' }).exists()).toBe(false)
    expect(wrapper.emitted('select')).toBeUndefined()
    await wrapper.setProps({
      snapshot: {
        ...value,
        items: [
          { semanticKey: 'same', label: '晨间共读', task: task('one') },
          { semanticKey: 'same', label: '午间共读', task: task('two') },
        ],
      },
    })
    expect(wrapper.get('[role="alert"]').text()).toContain('活动身份缺失或重复')
    await wrapper.setProps({
      snapshot: {
        ...value,
        items: [
          {
            semanticKey: 'first',
            label: '晨间共读',
            task: { ...task('one'), startUtc: '2026-11-02T10:00:00' },
          },
        ],
      },
    })
    expect(wrapper.get('[role="alert"]').text()).toContain('实际时刻无效')
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('stops standalone preview for missing assignment identity and restores current selection', async () => {
    const value = snapshot('preview', [
      { semanticKey: 'morning', label: '晨间共读', task: task('') },
    ])
    value.model = {} as NonNullable<ScheduleSnapshot['model']>
    const wrapper = mount(SchedulingPreviewResult, {
      props: { snapshot: value },
      global: { stubs: { GanttChart: true } },
    })
    for (const invalidId of ['', ' \t ']) {
      const invalid = snapshot('preview', [
        { semanticKey: 'morning', label: '晨间共读', task: task(invalidId) },
      ])
      invalid.model = value.model
      await wrapper.setProps({
        snapshot: invalid,
      })
      expect(wrapper.get('[role="alert"]').text()).toContain('安排实例身份缺失')
      expect(wrapper.findComponent({ name: 'GanttChart' }).exists()).toBe(false)
      expect(wrapper.emitted('select')).toBeUndefined()
    }
    const restored = snapshot('preview', [
      { semanticKey: 'morning', label: '晨间共读', task: task('preview-id') },
      { semanticKey: 'waiting', label: '午间共读', state: 'blocked' },
    ])
    restored.model = value.model
    await wrapper.setProps({ snapshot: restored })
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    wrapper.getComponent({ name: 'GanttChart' }).vm.$emit('task-select', 'preview-id')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['morning'])
    await wrapper.setProps({ readOnly: true })
    wrapper.getComponent({ name: 'GanttChart' }).vm.$emit('task-select', 'preview-id')
    expect(wrapper.emitted('select')).toHaveLength(1)
  })

  it('selects the current semantic item in standalone preview after replacing its snapshot', async () => {
    const first = snapshot('first', [
      { semanticKey: 'morning', label: '晨间共读', task: task('reused-id') },
    ])
    first.model = {} as NonNullable<ScheduleSnapshot['model']>
    const wrapper = mount(SchedulingPreviewResult, {
      props: { snapshot: first },
      global: { stubs: { GanttChart: true } },
    })
    wrapper.getComponent({ name: 'GanttChart' }).vm.$emit('task-select', 'reused-id')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['morning'])
    const second = snapshot('second', [
      { semanticKey: 'evening', label: '傍晚分享', task: task('reused-id') },
    ])
    second.model = first.model
    await wrapper.setProps({ snapshot: second })
    wrapper.getComponent({ name: 'GanttChart' }).vm.$emit('task-select', 'reused-id')
    expect(wrapper.emitted('select')?.at(-1)).toEqual(['evening'])
    await wrapper.setProps({ readOnly: true })
    wrapper.getComponent({ name: 'GanttChart' }).vm.$emit('task-select', 'reused-id')
    expect(wrapper.emitted('select')).toHaveLength(2)
  })
})
