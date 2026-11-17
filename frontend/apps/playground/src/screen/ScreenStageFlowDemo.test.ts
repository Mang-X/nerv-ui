import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import ScreenStageFlowDemo from './ScreenStageFlowDemo.vue'

it('lets the host switch replace reorder clear and restore quantities', async () => {
  const page = mount(ScreenStageFlowDemo)
  const click = async (text: string) => {
    const button = page.findAll('button').find((item) => item.text() === text)
    expect(button).toBeDefined()
    await button!.trigger('click')
  }
  expect(page.text()).toContain('阅读活动')
  expect(page.findAll('[data-stage-value]').map((item) => item.text())).toEqual(['24', '0', '—'])
  await click('展览布置')
  expect(page.text()).toContain('运输')
  await click('替换记录')
  expect(page.findAll('[data-stage-value]').map((item) => item.text())).toEqual(['0', '-1.25', '—'])
  await click('反转顺序')
  expect(page.findAll('[data-stage-value]').map((item) => item.text())).toEqual(['—', '-1.25', '0'])
  await click('长文字')
  expect(page.text()).toContain('等待场地与资料共同确认')
  await click('清空')
  expect(page.findAll('[data-stage]')).toHaveLength(0)
  expect(page.text()).toContain('当前没有阶段记录')
  await click('恢复记录')
  expect(page.findAll('[data-stage]')).toHaveLength(3)
})
