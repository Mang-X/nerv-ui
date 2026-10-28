import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import NotificationInboxDemo from './NotificationInboxDemo.vue'
describe('notification hosts', () => {
  for (const space of ['library', 'studio'] as const)
    it(`controls rejection replacement and asynchronous outcomes in ${space}`, async () => {
      const w = mount(NotificationInboxDemo, { props: { space } })
      await w.get('[data-reject]').trigger('click')
      await w.get('[data-open]').trigger('click')
      expect(w.find('[data-detail]').exists()).toBe(false)
      await w.get('[data-reject]').trigger('click')
      await w.get('[data-open]').trigger('click')
      await w.get('[data-replace]').trigger('click')
      expect(w.get('[data-detail]').text()).toContain('安排已更新')
      await w.get('[data-mark]').trigger('click')
      expect(w.get('[data-mark]').attributes('disabled')).toBeDefined()
      await w.get('[data-failure]').trigger('click')
      expect(w.get('[role=alert]').text()).toContain('无法标记')
      expect(w.text()).toContain('未读')
      await w.get('[data-mark]').trigger('click')
      await w.get('[data-success]').trigger('click')
      expect(w.find('[data-mark]').exists()).toBe(false)
      await w.get('[data-refresh]').trigger('click')
      expect(w.find('[role=status]').exists()).toBe(true)
      await w.get('[data-load-error]').trigger('click')
      expect(w.get('[role=alert]').text()).toContain('无法加载')
      await w.get('[data-loaded]').trigger('click')
      expect(w.find('[role=alert]').exists()).toBe(false)
    })
})

it.each(['library', 'studio'] as const)(
  'ignores old mark outcomes after same-key replacement and permits a current retry in %s',
  async (space) => {
    const w = mount(NotificationInboxDemo, { props: { space } })
    await w.get('[data-open]').trigger('click')
    await w.get('[data-mark]').trigger('click')
    await w.get('[data-replace]').trigger('click')
    expect(w.get('[data-detail]').text()).toContain('安排已更新')
    expect(w.get('[data-mark]').attributes('disabled')).toBeUndefined()
    expect(w.get('[data-success]').attributes('disabled')).toBeDefined()
    await w.get('[data-success]').trigger('click')
    await w.get('[data-failure]').trigger('click')
    expect(w.find('[role=alert]').exists()).toBe(false)
    expect(w.find('[data-mark]').exists()).toBe(true)
    await w.get('[data-mark]').trigger('click')
    await w.get('[data-failure]').trigger('click')
    expect(w.get('[role=alert]').text()).toContain('无法标记')
    await w.get('[data-mark]').trigger('click')
    await w.get('[data-success]').trigger('click')
    expect(w.find('[data-mark]').exists()).toBe(false)
    w.unmount()
  },
)
