import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ActionSummaryDemo from './ActionSummaryDemo.vue'

describe('今日小事宿主', () => {
  it('routes retry and action to the card currently used without crossing the other card', async () => {
    const wrapper = mount(ActionSummaryDemo)
    const cards = () => wrapper.findAll('[data-slot="nv-action-summary"]')

    await wrapper.findAll('select')[1]!.setValue('error')
    expect(cards()[0]!.attributes('data-state')).toBe('data')
    expect(cards()[1]!.attributes('data-state')).toBe('error')
    await cards()[1]!.get('button[data-slot="nv-button"]').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toBe('阅读清单已请求重新读取。')

    await cards()[0]!.get('button[aria-label="查看全部安排"]').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toBe('已打开今日安排。')
    await cards()[1]!.get('button[aria-label="查看阅读清单"]').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toBe('已打开阅读清单。')
  })
})
