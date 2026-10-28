import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import Recipe from './ScreenDashboardRecipe.vue'
import { dashboardInput } from './dashboardInput'

it('paginates actual identities and rejects requests until the host accepts them', async () => {
  const w = mount(Recipe, {
    props: { input: dashboardInput('reading'), page: 1, view: 'chart', now: 1000 },
  })
  expect(w.get('[data-queue]').text()).toContain('共读散文')
  await w
    .findAll('button')
    .find((b) => b.text() === '2')!
    .trigger('click')
  expect(w.emitted('page')?.[0]).toEqual([2])
  expect(w.get('[data-queue]').text()).toContain('共读散文')
  await w.setProps({ page: 2 })
  expect(w.get('[data-queue]').text()).toContain('诗歌夜读')
  expect(w.get('[data-queue]').text()).not.toContain('共读散文')
  await w.setProps({
    input: {
      ...dashboardInput('reading'),
      rows: [{ id: 'r1', name: '替换后的活动', status: '待确认' }],
    },
  })
  expect(w.get('[data-queue]').text()).toContain('替换后的活动')
  expect(w.get('[data-queue]').text()).not.toContain('诗歌夜读')
  w.unmount()
})
it('uses current source for chart and detail and distinguishes zero unknown empty error and stale', async () => {
  const w = mount(Recipe, {
    props: { input: dashboardInput('reading'), page: 1, view: 'chart', now: 1000 },
  })
  expect(w.get('[data-primary]').text()).toContain('0')
  await w.get('[data-view]').trigger('click')
  expect(w.emitted('view')?.[0]).toEqual(['detail'])
  expect(w.find('[data-details]').exists()).toBe(false)
  await w.setProps({ input: dashboardInput('exhibition'), view: 'detail' })
  expect(w.get('[data-details]').text()).toContain('布展')
  expect(w.text()).not.toContain('共读散文')
  await w.setProps({
    now: 100000,
    input: { ...dashboardInput('exhibition'), primary: null, error: '更新失败，保留上次安排' },
  })
  expect(w.get('[data-primary]').text()).toContain('未确认')
  expect(w.text()).toContain('更新失败')
  expect(w.text()).toContain('已过期')
  await w.setProps({
    input: { ...dashboardInput('reading'), rows: [], distribution: [], updatedAt: null },
  })
  expect(w.text()).toContain('暂无安排')
  expect(w.text()).toContain('尚未更新')
  expect(w.find('[data-details]').exists()).toBe(false)
  w.unmount()
})
