import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { SchedulingOrderPool } from '../../index'

const alpha = { key: 'a', label: 'Alpha' }
const beta = { key: 'b', label: 'Beta' }

it('public readonly filtering, row replacement and controlled selection changes never request removal', async () => {
  const pool = mount(SchedulingOrderPool, {
    props: {
      sourceKey: 'source',
      state: 'ready',
      readOnly: true,
      items: [alpha, beta],
      selectedKeys: ['a', 'b'],
      selectionOnFilter: 'clear-hidden',
    },
  })
  await pool.get('[aria-label="搜索候选项目"]').setValue('Alpha')
  expect(pool.emitted('include')).toBeUndefined()
  await pool.setProps({ items: [{ ...alpha, label: 'Z' }, beta] })
  expect(pool.text()).toContain('没有匹配')
  expect(pool.emitted('include')).toBeUndefined()
  await pool.setProps({ selectedKeys: ['a'] })
  expect(pool.emitted('include')).toBeUndefined()
  await pool.get('[aria-label="搜索候选项目"]').setValue('')
  expect(pool.emitted('include')).toBeUndefined()
  pool.unmount()
})

it('public readonly edge pauses clear-hidden and editable recovery requests only current hidden keys once', async () => {
  const pool = mount(SchedulingOrderPool, {
    props: {
      sourceKey: 'source',
      state: 'ready',
      items: [alpha, beta],
      selectedKeys: ['a', 'b'],
      selectionOnFilter: 'clear-hidden',
    },
  })
  await pool.get('[aria-label="搜索候选项目"]').setValue('Alpha')
  expect(pool.emitted('include')).toEqual([[['b'], false]])
  // The host may refuse an earlier controlled request and keep both keys selected.
  await pool.setProps({ readOnly: true })
  await pool.get('[aria-label="搜索候选项目"]').setValue('Beta')
  await pool.setProps({ items: [beta, { ...alpha, label: 'Alpha · 更新' }] })
  expect(pool.emitted('include')).toHaveLength(1)
  await pool.setProps({ readOnly: false })
  expect(pool.emitted('include')).toEqual([
    [['b'], false],
    [['a'], false],
  ])
  await pool.setProps({ items: [{ ...alpha, label: 'Alpha · 更新' }, beta] })
  expect(pool.emitted('include')).toHaveLength(2)
  await pool.setProps({ selectedKeys: ['b'] })
  expect(pool.emitted('include')).toHaveLength(2)
  pool.unmount()
})

it('public editable retain and disabled rows keep visible bulk eligibility after readonly recovery', async () => {
  const pool = mount(SchedulingOrderPool, {
    props: {
      sourceKey: 'source',
      state: 'ready',
      readOnly: true,
      items: [alpha, { ...beta, disabledReason: '当前不可选' }],
      selectedKeys: ['a', 'b'],
      selectionOnFilter: 'retain',
    },
  })
  await pool.get('[aria-label="搜索候选项目"]').setValue('Alpha')
  await pool.setProps({ readOnly: false })
  expect(pool.emitted('include')).toBeUndefined()
  await pool.get('[aria-label="搜索候选项目"]').setValue('')
  await pool.get('[data-action="include-visible"]').trigger('click')
  expect(pool.emitted('include')).toEqual([[['a'], true]])
  expect(pool.get('[aria-label="选择 Beta"]').attributes('title')).toBe('当前不可选')
  pool.unmount()
})
