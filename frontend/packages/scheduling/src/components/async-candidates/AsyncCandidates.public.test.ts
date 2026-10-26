import { mount } from '@vue/test-utils'
import { expect, expectTypeOf, it } from 'vitest'
import {
  SchedulingCandidatePanel,
  SchedulingInsertionPreview,
  SchedulingDowntimeBanner,
  SchedulingRushInsertionResult,
  type SchedulingAsyncJob,
  type SchedulingCandidateSet,
  type SchedulingDowntimeItem,
} from '../../index'

const job: SchedulingAsyncJob = {
  id: 'job-a',
  contextKey: 'venue-a',
  requestKey: 'request-a',
  status: 'created',
  input: { baselineId: 'saved-a', targetKey: 'morning', targetLabel: '晨间共读' },
}

it('public insertion job follows created running failed and retry without inventing a result', async () => {
  expectTypeOf<SchedulingAsyncJob['status']>().toEqualTypeOf<
    'created' | 'running' | 'failed' | 'completed' | 'stopped'
  >()
  const wrapper = mount(SchedulingRushInsertionResult, { props: { job } })
  expect(wrapper.text()).toContain('等待计算')
  await wrapper.setProps({ job: { ...job, status: 'running' } })
  expect(wrapper.text()).toContain('计算中')
  await wrapper.setProps({ job: { ...job, status: 'failed' }, failureMessage: '本次未能生成候选' })
  expect(wrapper.text()).toContain('本次未能生成候选')
  expect(wrapper.text()).not.toContain('候选修订已保存')
  await wrapper.get('[data-action="retry"]').trigger('click')
  expect(wrapper.emitted('retry')?.at(-1)).toEqual(['job-a', 'request-a'])
})

it('public candidate panel keeps unknown metrics, movement paths and controlled selection', async () => {
  const set: SchedulingCandidateSet = {
    contextKey: 'venue-a',
    baselineId: 'saved-a',
    jobId: 'job-a',
    requestKey: 'request-a',
    candidates: [
      {
        id: 'right',
        label: '原位置顺延',
        metrics: [
          {
            id: 'ctp',
            label: '可承诺比例',
            format: 'percent',
            before: null,
            after: 0,
            beforeDenominator: 0,
            afterDenominator: 1,
            deltaDisplay: '0 个百分点',
          },
        ],
        movements: [
          {
            id: 'morning',
            label: '晨间共读',
            before: { resource: '晨光书房', segments: ['09:00–09:30（Asia/Shanghai）'] },
            after: { resource: '林间书屋' },
            reasons: ['场地暂不可用'],
            paths: [{ id: 'p', steps: ['晨间共读 → 午间分享'] }],
            transfers: [{ id: 't', label: '转至林间书屋', setupMinutes: 0 }],
          },
        ],
        locked: {
          preserved: 0,
          total: 1,
          details: [{ id: 'lock', label: '午间分享', preserved: false, message: '位置未保持' }],
        },
        explanations: [{ id: 'late', label: '傍晚分享', message: '等待场地确认' }],
      },
    ],
  }
  const wrapper = mount(SchedulingCandidatePanel, {
    props: {
      candidates: set,
      contextKey: 'venue-a',
      baselineId: 'saved-a',
      jobId: 'job-a',
      requestKey: 'request-a',
    },
  })
  expect(wrapper.text()).toContain('— → 0%')
  expect(wrapper.text()).toContain('分母 0 → 1')
  expect(wrapper.text()).toContain('0 个百分点')
  expect(wrapper.text()).toContain('0 / 1')
  await wrapper.get('details[data-movement="morning"] summary').trigger('click')
  expect(wrapper.text()).toContain('晨间共读 → 午间分享')
  await wrapper.get('[data-action="select-candidate"]').trigger('click')
  expect(wrapper.emitted('select')?.at(-1)).toEqual(['job-a', 'right'])
  await wrapper.setProps({ contextKey: 'venue-b' })
  expect(wrapper.find('[data-action="select-candidate"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('原位置顺延')
  expect(wrapper.text()).toContain('来源范围已变化')
  await wrapper.setProps({ contextKey: 'venue-a', requestKey: 'request-b' })
  expect(wrapper.find('[data-action="select-candidate"]').exists()).toBe(false)
})

it('public insertion history uses real total and keeps start controlled', async () => {
  const wrapper = mount(SchedulingInsertionPreview, {
    props: {
      contextKey: 'venue-a',
      targetKey: 'morning',
      targetLabel: '晨间共读',
      plans: [{ id: 'saved-a', label: '上午安排', status: '已保存', assignmentCount: 0 }],
      pageIndex: 0,
      pageSize: 1,
      total: 11,
      selectedPlanId: 'saved-a',
    },
  })
  expect(wrapper.text()).toContain('共 11 个方案')
  expect(wrapper.text()).toContain('已排活动 0')
  await wrapper.get('[data-action="next-page"]').trigger('click')
  expect(wrapper.emitted('page')?.at(-1)).toEqual([1])
  await wrapper.get('[data-action="start"]').trigger('click')
  expect(wrapper.emitted('start')?.at(-1)).toEqual([
    { contextKey: 'venue-a', targetKey: 'morning', planId: 'saved-a' },
  ])
  expect(wrapper.text()).not.toContain('预览完成')
  await wrapper.setProps({ readOnly: true })
  expect(wrapper.get('[data-action="start"]').attributes('disabled')).toBeDefined()
  expect(wrapper.text()).toContain('当前为只读')
})

it('public downtime displays host phases and now without treating absent ETR or count as zero', async () => {
  const items: readonly SchedulingDowntimeItem[] = [
    {
      id: 'one',
      resourceLabel: '晨光书房',
      startedAt: '09:00（Asia/Shanghai）',
      duration: '45 分钟',
      phase: 'no-etr',
      affected: [{ id: 'a', label: '晨间共读' }],
    },
    {
      id: 'two',
      resourceLabel: '林间书屋',
      startedAt: '08:30（Asia/Shanghai）',
      duration: '1 小时',
      phase: 'expired',
      expectedRestoreAt: '09:00（Asia/Shanghai）',
      alternativesCount: 0,
    },
    {
      id: 'three',
      resourceLabel: '山间书屋',
      startedAt: '08:00（Asia/Shanghai）',
      duration: '1 小时',
      phase: 'recovered',
      recoveredAt: '09:00（Asia/Shanghai）',
    },
  ]
  const wrapper = mount(SchedulingDowntimeBanner, {
    props: { items, now: '09:45（Asia/Shanghai）', contextKey: 'venue-a' },
  })
  expect(wrapper.text()).toContain('当前 09:45（Asia/Shanghai）')
  expect(wrapper.text()).toContain('恢复时间未提供')
  expect(wrapper.text()).toContain('预计时间已过，仍未恢复')
  expect(wrapper.text()).toContain('已恢复')
  expect(wrapper.text()).toContain('备选 0')
  await wrapper.get('details[data-downtime="one"] summary').trigger('click')
  expect(wrapper.text()).toContain('晨间共读')
  await wrapper.get('[data-action="preview-downtime"]').trigger('click')
  expect(wrapper.emitted('preview')?.at(-1)).toEqual(['venue-a'])
  await wrapper.setProps({
    items: [{ ...items[0]!, phase: 'expected', expectedRestoreAt: '10:00（Asia/Shanghai）' }],
  })
  expect(wrapper.text()).toContain('预计恢复时间尚未到')
})

it('public job ignores a completed result from another request and never marks selection without host input', async () => {
  const wrapper = mount(SchedulingRushInsertionResult, {
    props: {
      job: {
        ...job,
        status: 'completed',
        result: {
          jobId: 'job-old',
          contextKey: 'venue-a',
          requestKey: 'request-old',
          promise: { state: 'known', at: '10:00（Asia/Shanghai）' },
        },
      },
    },
  })
  expect(wrapper.text()).toContain('结果身份不一致')
  expect(wrapper.text()).not.toContain('10:00')
  await wrapper.setProps({ job: { ...job, status: 'stopped' } })
  expect(wrapper.text()).toContain('已停止核实')
  expect(wrapper.find('[data-action="retry"]').exists()).toBe(false)
  await wrapper.setProps({
    job: {
      ...job,
      status: 'completed',
      result: {
        jobId: 'job-a',
        contextKey: 'venue-a',
        requestKey: 'request-old',
        promise: { state: 'known', at: '10:00（Asia/Shanghai）' },
      },
    },
  })
  expect(wrapper.text()).toContain('结果身份不一致')
  expect(wrapper.text()).not.toContain('10:00')
  await wrapper.setProps({
    job: {
      ...job,
      status: 'completed',
      result: {
        jobId: 'job-a',
        contextKey: 'venue-a',
        requestKey: 'request-a',
        promise: { state: 'unknown' },
      },
    },
  })
  expect(wrapper.text()).toContain('承诺时间未知')
  expect(wrapper.text()).not.toContain('候选修订已保存')
  expect(wrapper.get('[data-action="select"]').attributes('disabled')).toBeDefined()
})

it('public pagination refuses an invented next page when total is missing', async () => {
  const wrapper = mount(SchedulingInsertionPreview, {
    props: {
      contextKey: 'venue-a',
      targetKey: 'morning',
      targetLabel: '晨间共读',
      pageIndex: 1,
      pageSize: 10,
      plans: [],
      total: null,
      selectedPlanId: 'saved-a',
    },
  })
  expect(wrapper.text()).toContain('方案总数未提供')
  expect(wrapper.get('[data-action="next-page"]').attributes('disabled')).toBeDefined()
  await wrapper.get('[data-action="next-page"]').trigger('click')
  expect(wrapper.emitted('page')).toBeUndefined()
})

it('public insertion hides a previous plan result when the selected plan changes', async () => {
  const wrapper = mount(SchedulingInsertionPreview, {
    props: {
      contextKey: 'venue-a',
      targetKey: 'morning',
      targetLabel: '晨间共读',
      pageIndex: 0,
      pageSize: 10,
      total: 1,
      plans: [],
      selectedPlanId: 'saved-a',
      job: {
        ...job,
        status: 'completed',
        result: { jobId: 'job-a', contextKey: 'venue-a', requestKey: 'request-a' },
      },
    },
  })
  expect(wrapper.text()).toContain('预览完成')
  await wrapper.setProps({ selectedPlanId: 'saved-b' })
  expect(wrapper.text()).not.toContain('预览完成')
})

it('completed insertion without a matching result asks for review instead of claiming preview completion', async () => {
  const wrapper = mount(SchedulingInsertionPreview, {
    props: {
      contextKey: 'venue-a',
      targetKey: 'morning',
      targetLabel: '晨间共读',
      pageIndex: 0,
      pageSize: 5,
      selectedPlanId: 'saved-a',
      job: { ...job, status: 'completed' },
    },
  })
  expect(wrapper.text()).toContain('本次结果身份不一致或尚未提供')
  expect(wrapper.text()).not.toContain('预览完成')
  wrapper.unmount()
})

it('public save request without a host confirmation remains unselected', async () => {
  const candidate = {
    id: 'candidate-a',
    label: '候选安排',
    source: { kind: 'snapshot' as const, label: '来源' },
    items: [],
  }
  const wrapper = mount(SchedulingRushInsertionResult, {
    props: {
      job: {
        ...job,
        status: 'completed',
        result: { jobId: 'job-a', contextKey: 'venue-a', requestKey: 'request-a', candidate },
      },
    },
  })
  await wrapper.get('[data-action="select"]').trigger('click')
  expect(wrapper.emitted('select')?.at(-1)).toEqual(['job-a', 'candidate-a'])
  expect(wrapper.get('[data-action="select"]').text()).toContain('选定候选并保存修订')
  expect(wrapper.text()).not.toContain('候选修订已保存')
  await wrapper.setProps({ readOnly: true })
  expect(wrapper.get('[data-action="select"]').attributes('disabled')).toBeDefined()
  expect(wrapper.get('[data-action="select"]').attributes('title')).toBe('当前为只读')
})
