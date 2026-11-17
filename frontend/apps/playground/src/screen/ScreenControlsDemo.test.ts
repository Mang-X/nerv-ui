import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import ScreenControlsDemo from './ScreenControlsDemo.vue'

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

it('drives neutral search input error zero empty and restore through the host memory model', async () => {
  const wrapper = mount(ScreenControlsDemo, { attachTo: document.body })
  wrappers.push(wrapper)
  const button = (text: string) => wrapper.findAll('button').find((item) => item.text() === text)!
  expect(wrapper.text()).toContain('本次人数：0 人')
  await wrapper.get('input[aria-label="搜索空间"]').setValue('不存在')
  expect(wrapper.get('[aria-label="空间结果"]').text()).toContain('没有符合条件的空间')
  await wrapper.get('button[aria-label="清除"]').trigger('click')
  expect(wrapper.get('[aria-label="空间结果"]').text()).toContain('街角书房')
  await wrapper.get('input[aria-label="来访人数"]').setValue('未知')
  expect(wrapper.get('input[aria-label="来访人数"]').attributes('aria-invalid')).toBe('true')
  expect(wrapper.text()).toContain('人数尚未填写正确')
  expect(button('保存安排').attributes('disabled')).toBeDefined()
  await wrapper.get('input[aria-label="来访人数"]').setValue('0')
  await button('保存安排').trigger('click')
  expect(wrapper.text()).toContain('已保存 1 次')
  await button('移除当前区域').trigger('click')
  expect(wrapper.text()).toContain('区域信息缺失')
  await button('清空区域').trigger('click')
  expect(wrapper.text()).toContain('暂无可选区域')
  expect(wrapper.findAll('[role="tab"]')).toHaveLength(0)
  await button('恢复区域').trigger('click')
  expect(wrapper.findAll('[role="tab"]')).toHaveLength(4)
  expect(wrapper.text()).toContain('街角书房')
})

it('host controls shared typed options and disables all seven actions without losing values', async () => {
  const wrapper = mount(ScreenControlsDemo, { attachTo: document.body })
  wrappers.push(wrapper)
  const trigger = wrapper.get('[role="combobox"]')
  await trigger.trigger('click')
  document.querySelectorAll<HTMLElement>('[role="option"]')[1]!.click()
  await nextTick()
  expect(wrapper.get('[aria-label="当前区域"]').text()).toContain('河岸展厅')
  await wrapper.get('input[aria-label="暂停编辑"]').setValue(true)
  expect(wrapper.get('[role="switch"]').attributes('disabled')).toBeDefined()
  expect(wrapper.get('[role="combobox"]').attributes('disabled')).toBeDefined()
  for (const control of wrapper.findAll(
    '[role="tab"], [role="radio"], input[aria-label="搜索空间"], input[aria-label="来访人数"]',
  )) {
    expect(control.attributes('disabled')).toBeDefined()
  }
  await wrapper.get('[role="switch"]').trigger('click')
  expect(wrapper.text()).toContain('提醒变更：0 次')
  expect(wrapper.get('[aria-label="当前区域"]').text()).toContain('河岸展厅')
})
