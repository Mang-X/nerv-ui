import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import Demo from './ScreenParameterDetailDemo.vue'
const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.splice(0).forEach((w) => w.unmount())
  document.body.innerHTML = ''
})
it.each(['library', 'studio'] as const)(
  'Host_%s_DeepLinkDataReplacementMissingAndRecovery',
  async (context) => {
    const w = mount(Demo, { attachTo: document.body, props: { context } })
    wrappers.push(w)
    await flushPromises()
    const click = async (text: string) => {
      const button = [...document.body.querySelectorAll('button')].find(
        (b) => b.textContent?.trim() === text,
      )
      expect(button).toBeDefined()
      button!.click()
      await flushPromises()
    }
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
      context === 'library' ? '阅读次数' : '创作时长',
    )
    await click('替换窗口')
    expect(document.querySelector('[data-current]')?.textContent).toBe('8')
    await click('缺测窗口')
    expect(document.querySelector('[data-current]')?.textContent).toBe('—')
    expect(document.querySelector('[data-plot] path')).toBeNull()
    await click('等待')
    expect(document.querySelector('[role="status"]')?.textContent).toBe('等待新的观测窗口')
    await click('关闭')
    await click('载入失败')
    await click('查看空间详情')
    expect(document.querySelector('[role="alert"]')?.textContent).toContain('读取失败')
    await click('关闭')
    await click('恢复数据')
    await click('查看空间详情')
    expect(document.querySelector('[data-current]')?.textContent).toBe('8')
    expect(w.get('a').attributes('href')).toBe('#screen/stage')
  },
)
