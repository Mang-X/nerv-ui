import type { Component } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { ResourceLoads } from '../../index'
const mounted: ReturnType<typeof mount>[] = []
afterEach(() => {
  for (const w of mounted.splice(0)) w.unmount()
})
it('keeps a true zero idle window while null utilization stays unknown instead of zero percent', () => {
  const w = mount(ResourceLoads, {
    props: {
      loads: [
        {
          resourceId: '阅读室',
          windowStartUtc: '09:00',
          windowEndUtc: '10:00',
          assignedMinutes: 0,
          availableMinutes: 60,
          utilization: null,
        },
      ],
    },
  })
  mounted.push(w)
  expect(w.get('summary').text()).toContain('1 个零负荷窗口')
  expect(w.text()).toContain('已排 0 / 可用 60 分钟')
  expect(w.text()).toContain('利用率 —')
  expect(w.text()).not.toContain('利用率 0%')
})

it('shows neutral load names and exact host ratios while filtering idle and unknown separately', async () => {
  const display = Object.freeze([
    Object.freeze({
      id: 'idle',
      resource: { id: 'a', label: '晨光书房' },
      start: '09:00',
      end: '10:00',
      assignedMinutes: 0,
      availableMinutes: 60,
      utilization: 0,
    }),
    Object.freeze({
      id: 'busy',
      resource: { id: 'a', label: '晨光书房' },
      start: '10:00',
      end: '11:00',
      assignedMinutes: 30,
      availableMinutes: 60,
      utilization: 0.8,
    }),
    Object.freeze({
      id: 'unknown',
      resource: { id: 'b', label: '林间书屋' },
      start: '11:00',
      end: '12:00',
      assignedMinutes: null,
      availableMinutes: null,
      utilization: null,
    }),
  ])
  const w = mount(ResourceLoads, { props: { loads: [], display } })
  mounted.push(w)
  expect(w.text()).toContain('晨光书房')
  expect(w.text()).toContain('已排 30 / 可用 60 分钟 · 利用率 80%')
  expect(w.text()).toContain('已排 — / 可用 — 分钟 · 利用率 —')
  await w.get('button[data-load-filter="idle"]').trigger('click')
  expect(w.text()).toContain('已排 0 / 可用 60 分钟 · 利用率 0%')
  expect(w.text()).not.toContain('林间书屋')
  expect(w.text()).not.toContain('已排 30')
  await w.get('button[data-load-filter="unknown"]').trigger('click')
  expect(w.text()).toContain('林间书屋')
  expect(w.text()).not.toContain('晨光书房')
  await w.get('button[data-load-filter="active"]').trigger('click')
  expect(w.text()).toContain('已排 30')
  expect(w.text()).not.toContain('已排 0')
  await w.setProps({
    display: [
      {
        id: 'new',
        resource: { id: 'c', label: '湖畔小屋' },
        start: '13:00',
        end: '14:00',
        assignedMinutes: 15,
      },
    ],
  })
  expect(w.text()).toContain('湖畔小屋')
  expect(w.text()).not.toMatch(/晨光书房|林间书屋/)
  expect(display[0]?.assignedMinutes).toBe(0)
})

it('keeps batch units and every affected activity behind two disclosure levels without inventing missing counts', async () => {
  const { MaterialShortageSummary } = await import('../../index')
  const display = [
    {
      id: 'paper',
      label: '绘画纸',
      batch: '秋日批次',
      quantity: 0,
      unit: '张',
      affected: [
        {
          id: 'a',
          label: '晨间写生',
          location: '湖畔画室',
          time: '09:00–10:00',
          result: '等待补充',
        },
        { id: 'b', label: '午后写生' },
      ],
    },
    { id: 'clay', label: '陶泥', quantity: null, unit: 'kg', affected: null },
  ]
  const w = mount(MaterialShortageSummary, { props: { shortages: [], display } })
  mounted.push(w)
  expect(w.get('details').attributes('open')).toBeUndefined()
  expect(w.get('summary').text()).toContain('2 项物料 / 批次缺口')
  expect(w.text()).toContain('秋日批次')
  expect(w.text()).toContain('0 张')
  expect(w.text()).toContain('— kg')
  expect(w.text()).toContain('影响项未提供')
  expect(w.findAll('tbody details')).toHaveLength(1)
  expect(w.get('tbody summary').text()).toContain('2 项活动')
  expect(w.text()).toContain('晨间写生')
  expect(w.text()).toContain('湖畔画室')
  expect(w.text()).toContain('09:00–10:00')
  expect(w.text()).toContain('等待补充')
  await w.setProps({
    display: [{ id: 'new', label: '彩色卡纸', quantity: 4, unit: '张', affected: [] }],
  })
  expect(w.text()).toContain('影响项为空')
  expect(w.text()).not.toMatch(/绘画纸|陶泥|秋日批次|晨间写生/)
})

it('aligns shortage quantity cells and limits displayed precision without changing host values', async () => {
  const { MaterialShortageSummary } = await import('../../index')
  const display = [
    { id: 'small', label: '纸张', quantity: 3, unit: '张', affected: [] },
    { id: 'medium', label: '胶片', quantity: 20, unit: '张', affected: [] },
    { id: 'large', label: '颜料', quantity: 100, unit: '盒', affected: [] },
    { id: 'fraction', label: '墨水', quantity: 1.23456, unit: 'L', affected: [] },
    { id: 'negative', label: '退料', quantity: -1234.5678, unit: 'kg', affected: [] },
    { id: 'unknown', label: '未知', quantity: null, unit: '张', affected: [] },
  ]
  const w = mount(MaterialShortageSummary, { props: { display } })
  mounted.push(w)
  expect(w.get('thead th:nth-child(2)').classes()).toContain('text-right')
  expect(w.get('thead th:nth-child(2)').classes()).toContain('tabular-nums')
  const cells = w.findAll('tbody tr td:nth-child(2)')
  expect(cells).toHaveLength(6)
  for (const cell of cells) {
    expect(cell.classes()).toContain('text-right')
    expect(cell.classes()).toContain('tabular-nums')
  }
  expect(cells.map((cell) => cell.text())).toEqual([
    '3 张',
    '20 张',
    '100 盒',
    '1.235 L',
    '-1,234.568 kg',
    '— 张',
  ])
  expect(display[3]?.quantity).toBe(1.23456)
})

it('shows one activity location or time without a dangling separator', async () => {
  const { MaterialShortageSummary } = await import('../../index')
  const w = mount(MaterialShortageSummary, {
    props: {
      display: [
        {
          id: 'one',
          label: '纸张',
          affected: [
            { id: 'place', label: '画室活动', location: '湖畔画室' },
            { id: 'time', label: '午后活动', time: '14:00' },
          ],
        },
      ],
    },
  })
  mounted.push(w)
  expect(w.get('li:first-child .text-muted-foreground').text()).toBe('湖畔画室')
  expect(w.get('li:last-child .text-muted-foreground').text()).toBe('14:00')
})

it('groups risk facts by category and stable group identity without dropping detailed shortages on replacement', async () => {
  const { PlanRisks } = await import('../../index')
  const display = Array.from({ length: 8 }, (_, i) => ({
    id: `risk-${i}`,
    category: { id: 'supplies', label: '用料提醒' },
    group: { id: i < 4 ? 'one' : 'two', label: '周末活动' },
    label: `写生安排 ${i + 1}`,
    message: `请核对第 ${i + 1} 份记录`,
    severity: 'warning' as const,
    shortages: Array.from({ length: 11 }, (_, j) => ({
      id: `material-${j}`,
      label: `画材 ${j + 1}`,
      batch: '秋日',
      quantity: 3,
      unit: '盒',
      requiredQuantity: 5,
      availableQuantity: 2,
    })),
  }))
  const before = JSON.stringify(display)
  const w = mount(PlanRisks, { props: { materialRisks: [], equipmentRisks: [], display } })
  mounted.push(w)
  expect(w.get('summary').text()).toContain('用料提醒 · 8 项 · 2 组')
  expect(w.findAll('[data-risk-group]')).toHaveLength(2)
  expect(w.findAll('[data-risk-id]')).toHaveLength(8)
  for (const row of w.findAll('[data-risk-id]')) {
    expect(row.findAll('[data-risk-shortage]')).toHaveLength(11)
    expect(row.text()).toContain('画材 11')
    expect(row.text()).toContain('缺 3 盒（需 5，可用 2）')
  }
  expect(w.text()).toContain('第 8 份记录')
  await w.setProps({
    display: [
      {
        id: 'replacement',
        category: { id: 'space', label: '空间提醒' },
        group: { id: 'new', label: '湖畔画室' },
        label: '午间写生',
        message: '尚未取得记录',
        severity: 'unknown',
        shortages: null,
      },
    ],
  })
  expect(w.text()).toContain('级别未知')
  expect(w.text()).toContain('缺口明细未提供')
  expect(w.text()).not.toMatch(/写生安排|周末活动|用料提醒|画材 11/)
  expect(JSON.stringify(display)).toBe(before)
})

it('keeps unspecified severity neutral while warning text containing error words never becomes blocking', async () => {
  const { PlanConflicts } = await import('../../index')
  const w = mount(PlanConflicts, {
    props: {
      conflicts: [
        {
          conflictId: 'warning',
          severity: 'warning',
          reasonCode: 'calendar',
          message: '错误记录待核对，仅为预警',
        },
        { conflictId: 'unknown', reasonCode: 'calendar', message: '没有提供严重度' },
      ],
      unscheduledOperations: [],
    },
  })
  mounted.push(w)
  expect(w.text()).toContain('级别未知')
  expect(w.findAll('[data-conflict-severity="error"]')).toHaveLength(0)
  expect(w.get('[data-conflict-id="warning"]').text()).toContain('预警')
  expect(w.get('[data-conflict-id="unknown"]').text()).toContain('级别未知')
})

it('shows blocking and unscheduled facts directly while warning and info stay independently grouped by reason identity', async () => {
  const { PlanConflicts } = await import('../../index')
  const source = {
    kind: 'snapshot' as const,
    label: '上午安排记录',
    capturedAt: '2026-10-26 09:00（Asia/Shanghai）',
    status: '仅供核对',
  }
  const display = {
    conflicts: [
      {
        id: 'error',
        label: '晨间共读',
        message: '请调整场地',
        severity: 'error' as const,
        reason: { id: 'space', label: '场地确认' },
      },
      {
        id: 'warning',
        label: '午后共读',
        message: '记录中提到错误，但仅作提醒',
        severity: 'warning' as const,
        reason: { id: 'one', label: '同名原因' },
      },
      {
        id: 'warning-two',
        label: '夜间共读',
        message: '另一个原因',
        severity: 'warning' as const,
        reason: { id: 'two', label: '同名原因' },
      },
      {
        id: 'info',
        label: '晚间分享',
        message: '请留意签到时间',
        severity: 'info' as const,
        reason: { id: 'one', label: '同名原因' },
      },
    ],
    unscheduled: [
      { id: 'pending', label: '新书分享', message: '尚未选择日期', reasonLabel: '等待安排' },
    ],
  }
  const before = JSON.stringify(display)
  const w = mount(PlanConflicts, { props: { display, source } })
  mounted.push(w)
  expect(w.get('[data-conflict-id="error"]').element.closest('details')).toBeNull()
  expect(w.get('[data-pending-id="pending"]').text()).toContain('新书分享')
  expect(w.findAll('[data-notice-group]')).toHaveLength(3)
  expect(w.findAll('details[open]')).toHaveLength(0)
  expect(w.get('[data-conflict-id="warning"]').element.closest('details')).not.toBeNull()
  expect(w.get('[data-conflict-id="info"]').text()).toContain('提示')
  expect(w.text()).toContain('2026-10-26 09:00（Asia/Shanghai）')
  await w.setProps({ display: { conflicts: [display.conflicts[1]!], unscheduled: [] } })
  expect(w.findAll('[data-conflict-severity="error"]')).toHaveLength(0)
  expect(w.text()).not.toMatch(/晨间共读|新书分享|晚间分享|夜间共读/)
  expect(w.text()).toContain('午后共读')
  expect(JSON.stringify(display)).toBe(before)
})

it('keeps distinct unknown legacy reasons visible without exposing codes or inventing material status', async () => {
  const { PlanConflicts } = await import('../../index')
  const w = mount(PlanConflicts, {
    props: {
      conflicts: [
        { conflictId: 'a', severity: 'warning', reasonCode: 'newCapacityRule', message: 'first' },
        { conflictId: 'b', severity: 'warning', reasonCode: 'newCalendarRule', message: 'second' },
        { conflictId: 'c', severity: 'warning', reasonCode: 'material', message: 'third' },
        { conflictId: 'd', severity: 'warning', reasonCode: 'newCapacityRule', message: 'fourth' },
      ],
      unscheduledOperations: [],
    },
  })
  mounted.push(w)
  const headings = w.findAll('[data-notice-group] summary').map((item) => item.text())
  expect(headings).toHaveLength(3)
  expect(new Set(headings).size).toBe(3)
  expect(headings).toContain('预警 · 物料约束 · 1 条（展开明细）')
  expect(headings.filter((heading) => heading.includes('未识别原因'))).toHaveLength(2)
  expect(w.text()).not.toMatch(/newCapacityRule|newCalendarRule|物料未齐套/)
  await w.setProps({
    conflicts: [
      {
        conflictId: 'replacement',
        severity: 'warning',
        reasonCode: 'newCalendarRule',
        message: 'current',
      },
    ],
  })
  expect(w.findAll('[data-notice-group]')).toHaveLength(1)
  expect(w.text()).toContain('current')
  expect(w.text()).not.toMatch(/first|second|third|fourth/)
  await w.setProps({
    conflicts: [
      { conflictId: 'calendar', severity: 'info', reasonCode: 'calendar', message: 'known' },
      { conflictId: 'missing', severity: 'info', message: 'unspecified' },
    ],
  })
  const finalHeadings = w.findAll('[data-notice-group] summary').map((item) => item.text())
  expect(finalHeadings).toContain('提示 · 日历不可用 · 1 条（展开明细）')
  expect(finalHeadings).toContain('提示 · 原因未提供 · 1 条（展开明细）')
  expect(w.text()).not.toContain('newCalendarRule')
})

it('distinguishes empty snapshot current unknown missing forbidden and unavailable data for every public display', async () => {
  const { MaterialShortageSummary, PlanRisks, PlanConflicts } = await import('../../index')
  const cases: { component: Component; props: Record<string, unknown>; empty: unknown }[] = [
    {
      component: MaterialShortageSummary,
      props: { display: [{ id: 'one', label: '画纸', quantity: 0 }] },
      empty: [],
    },
    {
      component: PlanRisks,
      props: {
        display: [
          {
            id: 'one',
            label: '画纸提醒',
            category: { id: 'a', label: '物料' },
            group: { id: 'a', label: '周末' },
            message: '请核对',
          },
        ],
      },
      empty: [],
    },
    {
      component: PlanConflicts,
      props: {
        display: {
          conflicts: [
            {
              id: 'one',
              label: '画纸冲突',
              reason: { id: 'a', label: '物料' },
              message: '请核对',
              severity: 'error',
            },
          ],
          unscheduled: [],
        },
      },
      empty: { conflicts: [], unscheduled: [] },
    },
    {
      component: ResourceLoads,
      props: {
        display: [
          {
            id: 'one',
            resource: { id: 'a', label: '画纸空间' },
            start: '09:00',
            end: '10:00',
            assignedMinutes: 0,
          },
        ],
      },
      empty: [],
    },
  ]
  for (const item of cases) {
    const w = mount(item.component as Component, { props: item.props })
    mounted.push(w)
    expect(w.text()).toContain('来源未说明')
    for (const [state, text] of [
      ['unknown', '状态未知'],
      ['missing', '未提供数据'],
      ['forbidden', '无权查看'],
      ['unavailable', '暂不可读取'],
    ] as const) {
      await w.setProps({ source: { kind: 'snapshot', label: '上午记录', state } })
      expect(w.get('[data-data-state]').text()).toContain(text)
      expect(w.text()).not.toContain('画纸')
    }
    await w.setProps({
      display: item.empty,
      source: { kind: 'snapshot', label: '上午记录', capturedAt: null, state: 'available' },
    })
    expect(w.text()).toContain('冻结快照')
    expect(w.text()).toContain('记录时点：—')
    expect(w.text()).toContain('不代表当前准备就绪')
    expect(w.text()).toContain('未记录')
    await w.setProps({
      source: { kind: 'current', label: '当前核对', status: '等待现场确认', state: 'available' },
    })
    expect(w.text()).toContain('当前记录')
    expect(w.text()).toContain('等待现场确认')
    expect(w.text()).not.toContain('冻结快照')
    expect(w.text()).not.toContain('快照')
  }
})

it('keeps nonfinite load metrics unknown and preserves explicit empty display over populated legacy arrays', async () => {
  const w = mount(ResourceLoads, {
    props: {
      loads: [{ resourceId: '旧资源', assignedMinutes: 10 }],
      display: [
        {
          id: 'one',
          resource: { id: 'a', label: '新资源' },
          start: '09:00',
          end: '10:00',
          assignedMinutes: Number.NaN,
          availableMinutes: Number.POSITIVE_INFINITY,
          utilization: Number.NaN,
        },
      ],
    },
  })
  mounted.push(w)
  expect(w.text()).toContain('已排 — / 可用 — 分钟 · 利用率 —')
  expect(w.text()).not.toContain('旧资源')
  await w.setProps({ display: [] })
  expect(w.text()).toContain('未记录资源负荷')
  expect(w.text()).not.toContain('旧资源')
})

it('does not turn a missing payload into an empty record set even when the source is marked available', async () => {
  const { MaterialShortageSummary, PlanRisks, PlanConflicts } = await import('../../index')
  for (const component of [MaterialShortageSummary, PlanRisks, PlanConflicts, ResourceLoads]) {
    const w = mount(component as Component, {
      props: { source: { kind: 'current', label: '现场核对', state: 'available' } },
    })
    mounted.push(w)
    expect(w.get('[data-data-state]').text()).toContain('未提供数据')
    expect(w.text()).not.toContain('未记录')
  }
})

it('preserves legacy order and operation identities in the public shortage risk and conflict displays', async () => {
  const { MaterialShortageSummary, PlanRisks, PlanConflicts } = await import('../../index')
  const shortage = mount(MaterialShortageSummary, {
    props: {
      shortages: [
        {
          materialId: '纸张',
          materialLotId: '秋日批次',
          shortageQuantity: 3,
          uomCode: '张',
          affectedOperations: [{ orderId: '订单甲', operationId: '工序七' }],
        },
      ],
    },
  })
  mounted.push(shortage)
  expect(shortage.get('tbody li').text()).toContain('订单甲 · 工序七')

  const risk = mount(PlanRisks, {
    props: {
      materialRisks: [{ orderId: '订单甲', operationId: '工序七', message: '等待纸张' }],
      equipmentRisks: [
        { orderId: '订单乙', operationId: '工序八', resourceId: '画室', message: '等待核对' },
      ],
    },
  })
  mounted.push(risk)
  expect(risk.text()).toContain('订单甲 · 工序七')
  expect(risk.text()).toContain('订单乙 · 工序八')
  expect(risk.text()).toContain('画室')

  const conflict = mount(PlanConflicts, {
    props: {
      conflicts: [
        {
          conflictId: 'blocked',
          orderId: '订单丙',
          operationId: '工序九',
          resourceId: '书房',
          severity: 'error',
          message: '场地冲突',
        },
      ],
      unscheduledOperations: [
        { orderId: '订单丁', operationId: '工序十', reasonCode: 'calendar', message: '尚未安排' },
      ],
    },
  })
  mounted.push(conflict)
  expect(conflict.get('[data-conflict-id="blocked"]').text()).toContain('订单丙 · 工序九 · 书房')
  expect(conflict.get('[data-pending-id]').text()).toContain('订单丁 · 工序十')
})
