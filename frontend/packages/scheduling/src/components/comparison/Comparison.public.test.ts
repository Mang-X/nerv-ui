import { mount } from '@vue/test-utils'
import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  ScheduleRevisionReview,
  SchedulingPreviewResult,
  compareScheduleSnapshots,
  type ScheduleComparisonRow,
  type ScheduleSnapshot,
  type ScheduleSnapshotItem,
  type ScheduleSnapshotMetric,
  type ScheduleTask,
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
      '资源：未排 → 晨光书房',
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
    const wrapper = mount(SchedulingPreviewResult, { props: { snapshot: value } })
    expect(wrapper.text()).toContain('0')
    expect(wrapper.text()).toContain('等待场地')
    expect(wrapper.text()).not.toContain('已发布')
    await wrapper.setProps({
      snapshot: { ...value, source: { ...value.source, state: 'unavailable' } },
    })
    expect(wrapper.text()).toContain('暂不可读取')
    expect(wrapper.text()).not.toContain('等待场地')
  })
})
