import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import App from './App.vue'
let w: ReturnType<typeof mount> | undefined
afterEach(() => {
  w?.unmount()
  localStorage.clear()
  window.location.hash = ''
  vi.unstubAllGlobals()
})
it('opens both neutral snapshot deep links composes all four displays and returns to the existing desktop entry', async () => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  for (const [venue, title] of [
    ['library', '共读前的核对'],
    ['studio', '创作前的核对'],
  ]) {
    window.location.hash = `#schedule-snapshot/${venue}`
    if (!w) w = mount(App)
    else {
      window.dispatchEvent(new HashChangeEvent('hashchange'))
      await nextTick()
    }
    expect(w.get('h1').text()).toBe(title)
    expect(w.findAll('[data-snapshot-section]')).toHaveLength(4)
    expect(w.get('a[href="#desktop"]').text()).toBe('返回工作空间')
    expect(w.text()).toContain('等待现场确认')
    expect(w.text()).not.toMatch(/operationId|taskId|宿主|验收|缓存|rawJSON/)
    window.location.hash = '#desktop'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await nextTick()
    expect(w.get('h1').text()).toBe('让想法有序向前')
    expect(w.get(`a[href="#schedule-snapshot/library"]`).text()).toBe('安排核对')
  }
})

async function open(venue: 'library' | 'studio') {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }))
  window.location.hash = `#schedule-snapshot/${venue}`
  w = mount(App)
  return w
}
async function click(text: string) {
  const button = w!.findAll('button').find((row) => row.text() === text)
  expect(button, `visible button ${text}`).toBeDefined()
  await button!.trigger('click')
}
for (const venue of ['library', 'studio'] as const) {
  it(`neutral ${venue} snapshot selection always follows current risk and conflict activity identity after external replacement`, async () => {
    const page = await open(venue)
    const beforeName = venue === 'library' ? '晨间共读' : '晨间创作'
    const nextName = venue === 'library' ? '午间书谈' : '午间写生'
    const nextLocation = venue === 'library' ? '湖畔小屋' : '湖畔画室'
    await click('查看用料关联活动')
    expect(page.get('[data-snapshot-selection]').text()).toContain(beforeName)
    expect(page.get('[data-snapshot-records]').text()).toContain('已查看关联活动')
    expect(page.get('[data-snapshot-records]').text()).toContain('Asia/Shanghai')
    await click('替换全部记录')
    expect(page.get('[data-snapshot-selection]').text()).toContain('尚未选择活动')
    expect(page.get('[data-risk-id="risk-material"]').text()).not.toContain(beforeName)
    await click('查看用料关联活动')
    expect(page.get('[data-snapshot-selection]').text()).toContain(nextName)
    expect(page.get('[data-snapshot-selection]').text()).toContain(nextLocation)
    expect(page.get('[data-snapshot-selection]').text()).toContain('13:00–14:00')
    await click('查看预警关联活动')
    expect(page.get('[data-snapshot-selection]').text()).toContain(nextName)
    expect(page.get('[data-snapshot-records]').findAll('li')).toHaveLength(3)
    expect(page.get('[data-risk-id="risk-resource"] button').attributes('disabled')).toBeDefined()
    expect(page.get('[data-risk-id="risk-resource"]').text()).toContain('关联活动暂不可查看')
    await click('仅查看记录')
    expect(page.findAll('[data-risk-id] button')).toHaveLength(0)
    expect(page.findAll('[data-conflict-id] button')).toHaveLength(0)
    expect(page.get('[data-snapshot-selection]').text()).toContain('关联活动动作已关闭')
    await click('允许查看活动')
    await click('查看阻断关联活动')
    expect(page.get('[data-snapshot-selection]').text()).toContain(
      venue === 'library' ? '午后交流' : '午后捏塑',
    )
  })
  it(`neutral ${venue} snapshot distinguishes warning only zero idle unknown empty and current records without declaring readiness`, async () => {
    const page = await open(venue)
    expect(page.findAll('[data-conflict-severity="error"]')).toHaveLength(1)
    await click('仅保留预警')
    expect(page.findAll('[data-conflict-severity="error"]')).toHaveLength(0)
    expect(page.findAll('[data-conflict-severity="warning"]')).toHaveLength(1)
    expect(page.findAll('[data-pending-id]')).toHaveLength(0)
    await click('显示全部记录')
    expect(page.findAll('[data-conflict-severity="error"]')).toHaveLength(1)
    await page.get('[data-load-filter="idle"]').trigger('click')
    expect(page.get('[aria-label="资源负荷"]').text()).toContain(
      '已排 0 / 可用 60 分钟 · 利用率 0%',
    )
    expect(page.get('[data-load-resource="quiet"]').text()).toContain(
      '已排 0 / 可用 — 分钟 · 利用率 —',
    )
    await page.get('[data-load-filter="unknown"]').trigger('click')
    expect(page.get('[aria-label="资源负荷"]').text()).toContain('已排 — / 可用 — 分钟 · 利用率 —')
    expect(page.find('[data-load-resource="primary-0"]').exists()).toBe(false)
    await click('清空记录')
    expect(
      page.findAll('[data-shortage-id], [data-risk-id], [data-conflict-id], [data-load-resource]'),
    ).toHaveLength(0)
    expect(page.get('[aria-label="现场核对"]').text()).toContain('等待现场确认')
    expect(page.get('[aria-label="物料缺口汇总"]').text()).toContain('快照未记录缺料')
    await click('恢复记录')
    await click('查看当前记录')
    expect(page.get('[aria-label="物料缺口汇总"]').text()).toContain('当前记录')
    expect(page.get('[data-shortage-id="paper"]').text()).toContain('0 张')
    expect(page.get('[aria-label="物料缺口汇总"]').text()).toContain('09:45（Asia/Shanghai）')
    await click('查看冻结记录')
    expect(page.get('[data-shortage-id="paper"]').text()).toContain('3 张')
    expect(page.get('[aria-label="物料缺口汇总"]').text()).toContain('冻结快照')
    for (const [state, label] of [
      ['forbidden', '无权查看'],
      ['unavailable', '暂不可读取'],
      ['missing', '未提供数据'],
      ['unknown', '状态未知'],
    ] as const) {
      await page.get('select[aria-label="数据读取状态"]').setValue(state)
      expect(page.findAll('[data-data-state]')).toHaveLength(4)
      for (const stateNode of page.findAll('[data-data-state]'))
        expect(stateNode.text()).toContain(label)
      expect(
        page.findAll(
          '[data-shortage-id], [data-risk-id], [data-conflict-id], [data-load-resource]',
        ),
      ).toHaveLength(0)
    }
  })
}
