import { mount, flushPromises } from '@vue/test-utils'
import { expect, it } from 'vitest'
import LoginDemo from './LoginDemo.vue'
it('requires fake host confirmation in both neutral domains and keeps redirects on this page', async () => {
  for (const space of ['library', 'studio'] as const) {
    const page = mount(LoginDemo, { props: { space } })
    await page.get('input[name="loginName"]').setValue('Lin')
    await page.get('input[name="password"]').setValue('sample')
    await page.get('form').trigger('submit')
    expect(page.text()).toContain('等待演示确认')
    expect(page.text()).not.toContain('已确认前往')
    await page.get('[data-reject]').trigger('click')
    await flushPromises()
    expect(page.get('[role="alert"]').text()).toContain('未能完成')
    expect((page.get('input[name="password"]').element as HTMLInputElement).value).toBe('sample')
    await page.get('form').trigger('submit')
    await page.get('[data-accept]').trigger('click')
    await flushPromises()
    expect(page.text()).toContain('仍停留在本页')
    expect(page.text()).toContain(space === 'library' ? '晨光书房' : '周末画室')
    await page.findAll('select')[1]!.setValue('change-password')
    expect(page.text()).not.toContain('已确认前往')
    await page.get('form').trigger('submit')
    await page.get('[data-accept]').trigger('click')
    await flushPromises()
    expect(page.text()).toContain('密码未保存')
    page.unmount()
  }
})
