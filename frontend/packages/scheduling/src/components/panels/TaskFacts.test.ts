import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { cloneModel } from '../../model/clone'
import { sampleModel } from '../../test-fixtures/models'
import { taskFactRows, withWorkOrderFacts } from '../../model/task-facts'
import { cardHtml, tooltipHtml } from '../../engine/dhtmlx/DhtmlxEngine'
import TaskDetailPanel from './TaskDetailPanel.vue'
import TaskFacts from './TaskFacts.vue'

it('同一工序四处显示相同权威数值，并在页内展开真实商业关联', async () => {
  const model = withWorkOrderFacts(
    cloneModel({
      ...sampleModel,
      tasks: [
        {
          ...sampleModel.tasks[0],
        },
      ],
    }),
    [
      {
        taskId: 'a1',
        facts: [
          { label: '工单进度', state: 'known', value: '25 / 100' },
          { label: '物料', state: 'unknown', text: '缺料 · 未知到料日' },
          { label: '销售订单', state: 'known', value: 'SO-261001-018' },
          { label: '客户', state: 'known', value: 'CUST-018' },
        ],
      },
    ],
  )
  const task = model.tasks.find((item) => item.id === 'a1')!
  const table = mount(TaskFacts, { props: { task } })
  const detail = mount(TaskDetailPanel, { props: { task, readOnly: true } })
  for (const [label, value] of taskFactRows(task)) {
    expect(table.text()).toContain(value)
    expect(detail.text()).toContain(value)
    expect(cardHtml(task)).toContain(value)
    expect(tooltipHtml(task)).toContain(value)
    expect(cardHtml(task)).toContain(label)
  }
  await table.get('summary').trigger('click')
  expect(table.find('a').exists()).toBe(false)
  expect(table.get('details').text()).toContain('SO-261001-018')
  expect(detail.text()).not.toContain('进度25%')
})

it('HTML图面把商业关联当文字，不能注入标签', () => {
  const task = {
    ...cloneModel(sampleModel).tasks.find((item) => item.id === 'a1')!,
    facts: [
      { label: '销售订单', value: '<img src=x>' },
      { label: '客户', value: 'A&B' },
    ],
  }
  for (const html of [cardHtml(task), tooltipHtml(task)]) {
    expect(html).toContain('&lt;img src=x&gt;')
    expect(html).toContain('A&amp;B')
    expect(html).not.toContain('<img src=x>')
  }
})
