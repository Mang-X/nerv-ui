import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import App from './App.vue'

let page: ReturnType<typeof mount> | undefined
afterEach(() => {
  page?.unmount()
  page = undefined
  localStorage.clear()
  window.location.hash = ''
  vi.unstubAllGlobals()
})
function media() {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
}
async function click(label: string) {
  const button = page!.findAll('button').find((item) => item.text() === label)
  expect(button, `button ${label}`).toBeDefined()
  await button!.trigger('click')
}
for (const venue of ['library', 'studio'] as const) {
  it(`neutral ${venue} comparison deep link shows semantic changes and returns to old surfaces`, async () => {
    media()
    window.location.hash = `#schedule-compare/${venue}`
    page = mount(App)
    expect(page.get('h1').text()).toContain(venue === 'library' ? '读书会' : '工作坊')
    expect(page.get('[data-semantic-key="morning"]').text()).toContain('已调整')
    expect(page.get('[data-semantic-key="noon"]').text()).toContain('待安排；完工时间未提供')
    expect(page.get('[data-semantic-key="evening"]').text()).toContain('新增')
    expect(page.get('[aria-label="来源指标"]').text()).toContain('— → 0')
    expect(page.get('[aria-label="来源指标"]').text()).toContain('0% → —')
    expect(page.find('a[href="#schedule-snapshot/library"]').exists()).toBe(true)
    await page.get('a[href="#desktop"]').trigger('click')
    window.location.hash = '#desktop'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(page.get('h1').text()).toBe('让想法有序向前')
    expect(page.get('a[href="#schedule-compare/library"]').text()).toBe('安排对照')
  })

  it(`neutral ${venue} unsaved draft and preview cannot mutate saved baseline while replacement and readonly stay current`, async () => {
    media()
    window.location.hash = `#schedule-compare/${venue}`
    page = mount(App)
    const saved = page.get('[data-semantic-key="morning"] td:nth-child(3)').text()
    await click('修改未保存草案')
    expect(page.get('[data-draft-state]').text()).toContain('2026-11-02T05:00:00Z')
    expect(page.get('[data-semantic-key="morning"] td:nth-child(3)').text()).toBe(saved)
    await click('预览草案候选')
    expect(page.get('[data-semantic-key="morning"] td:nth-child(3)').text()).toBe(saved)
    expect(
      page.get('[data-semantic-key="morning"] td:nth-child(4) time').attributes('datetime'),
    ).toBe('2026-11-02T05:00:00Z')
    expect(
      page.get('[data-semantic-key="morning"] td:nth-child(4) li time').attributes('datetime'),
    ).toBe('2026-11-02T05:00:00Z')
    await click('外部替换候选')
    expect(page.get('[data-semantic-key="morning"] td:nth-child(3)').text()).toBe(saved)
    expect(
      page.get('[data-semantic-key="morning"] td:nth-child(4) time').attributes('datetime'),
    ).toBe('2026-11-02T06:00:00Z')
    expect(
      page.get('[data-semantic-key="morning"] td:nth-child(4) li time').attributes('datetime'),
    ).toBe('2026-11-02T06:00:00Z')
    await click('只读查看')
    expect(
      page.get('[data-change-task="candidate-assignment-a"]').attributes('disabled'),
    ).toBeDefined()
    await click('清空候选')
    expect(page.get('[data-semantic-key="morning"]').text()).toContain('候选未提供')
    expect(page.get('[data-semantic-key="morning"] td:nth-child(4)').text()).toContain(
      '完工时间未提供',
    )
    await page!.get('select[aria-label="候选读取状态"]').setValue('unavailable')
    expect(page.get('[aria-label="候选来源"]').text()).toContain('暂不可读取')
    expect(page.findAll('[data-semantic-key]')).toHaveLength(0)
    await click('恢复两侧记录')
    expect(page.get('[data-semantic-key="morning"]').text()).toContain('已调整')
  })
}
