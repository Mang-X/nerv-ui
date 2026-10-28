import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import LoginRecipe from './LoginRecipe.vue'

const draft = () => ({
  loginName: '  Lin  ',
  password: ' pw ',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})
const deferred = () => {
  let resolve!: (value: unknown) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
function setup(extra = {}) {
  const page = mount(LoginRecipe, {
    props: {
      modelValue: draft(),
      surface: 'console',
      mode: 'login',
      context: 'library',
      brand: '晨光书房',
      ...extra,
    },
  })
  return page
}
describe('neutral login recipe public host seam', () => {
  it('keeps edits controlled and preserves PC trim versus PDA and screen raw credentials', async () => {
    for (const surface of ['console', 'business-console', 'pda', 'screen']) {
      const submit = vi.fn().mockResolvedValue({ accepted: true })
      const page = setup({ surface, submit })
      await page.get('[name="loginName"]').setValue('other')
      expect(page.emitted('update:modelValue')?.[0]?.[0]).toMatchObject({
        loginName: 'other',
        password: ' pw ',
      })
      await page.setProps({ modelValue: draft() })
      await page.get('form').trigger('submit')
      await flushPromises()
      expect(submit.mock.calls[0]?.[0]).toMatchObject({
        loginName: surface.includes('console') ? 'Lin' : '  Lin  ',
        password: ' pw ',
      })
      expect(page.emitted('confirmed')).toHaveLength(1)
      page.unmount()
    }
  })
  it('blocks duplicate submits and only confirms an explicit accepted receipt', async () => {
    const wait = deferred()
    const submit = vi.fn(() => wait.promise)
    const page = setup({ submit })
    await page.get('form').trigger('submit')
    await page.get('form').trigger('submit')
    expect(submit).toHaveBeenCalledTimes(1)
    expect(page.get('button[type="submit"]').attributes('disabled')).toBeDefined()
    expect(page.emitted('confirmed')).toBeUndefined()
    wait.resolve(undefined)
    await flushPromises()
    expect(page.emitted('confirmed')).toBeUndefined()
    expect(page.get('[role="alert"]').text()).toContain('未能完成')
    await page.setProps({ submit: vi.fn().mockResolvedValue({ accepted: true }) })
    await page.get('form').trigger('submit')
    await flushPromises()
    expect(page.emitted('confirmed')).toHaveLength(1)
    page.unmount()
  })
  it.each(['reject', 'throw', 'decline', 'missing'])(
    'allows retry without losing drafts after %s and hides raw failures',
    async (kind) => {
      const submit =
        kind === 'missing'
          ? undefined
          : vi.fn(() => {
              if (kind === 'throw') throw new Error('SECRET SDK')
              if (kind === 'reject') return Promise.reject(new Error('SECRET SDK'))
              return { accepted: false }
            })
      const page = setup({ submit })
      await page.get('form').trigger('submit')
      await flushPromises()
      expect(page.get('[role="alert"]').text()).toContain('未能完成')
      expect(page.text()).not.toContain('SECRET SDK')
      expect((page.get('[name="password"]').element as HTMLInputElement).value).toBe(' pw ')
      expect(page.emitted('confirmed')).toBeUndefined()
      await page.setProps({ submit: () => ({ accepted: true }) })
      await page.get('form').trigger('submit')
      await flushPromises()
      expect(page.emitted('confirmed')).toHaveLength(1)
      page.unmount()
    },
  )
  it.each([
    'surface',
    'context',
    'readonly',
    'disabled',
    'mode',
    'modelValue',
    'submit',
    'cancel',
    'unmount',
  ])('invalidates late success failure and finally after %s', async (change) => {
    for (const failure of [false, true]) {
      const old = deferred()
      const current = deferred()
      const page = setup({ submit: () => old.promise })
      await page.get('form').trigger('submit')
      if (change === 'cancel') await page.get('[data-cancel]').trigger('click')
      else if (change === 'unmount') page.unmount()
      else
        await page.setProps({
          [change]:
            change === 'modelValue'
              ? { ...draft(), loginName: 'new' }
              : change === 'submit'
                ? () => current.promise
                : change === 'mode'
                  ? 'change-password'
                  : change === 'context'
                    ? 'studio'
                    : change === 'surface'
                      ? 'pda'
                      : true,
        })
      if (change !== 'unmount') {
        await page.setProps({ readonly: false, disabled: false, submit: () => current.promise })
        await page.get('form').trigger('submit')
      }
      if (failure) old.reject(new Error('OLD SECRET'))
      else old.resolve({ accepted: true })
      await flushPromises()
      expect(page.emitted('confirmed')).toBeUndefined()
      if (change !== 'unmount') {
        expect(page.find('[role="alert"]').exists()).toBe(false)
        expect(page.get('button[type="submit"]').attributes('disabled')).toBeDefined()
        current.resolve({ accepted: true })
        await flushPromises()
        expect(page.emitted('confirmed')).toHaveLength(1)
        page.unmount()
      }
    }
  })
  it('preserves input contracts and one screen form with usable slots and no autofocus', async () => {
    for (const surface of ['console', 'business-console', 'pda', 'screen']) {
      const page = setup({ surface })
      expect(page.findAll('form')).toHaveLength(1)
      expect(page.get('[name="loginName"]').attributes('autocomplete')).toBe('username')
      expect(page.get('[name="password"]').attributes('type')).toBe('password')
      expect(page.get('[name="password"]').attributes('autocomplete')).toBe('current-password')
      expect(page.get('[name="loginName"]').attributes('required') !== undefined).toBe(
        surface.includes('console'),
      )
      expect(page.find('[autofocus]').exists()).toBe(false)
      if (surface === 'pda') {
        expect(page.get('[name="loginName"]').attributes('autocapitalize')).toBe('off')
        expect(page.get('[name="loginName"]').attributes('spellcheck')).toBe('false')
      }
      if (surface === 'screen')
        expect(page.find('[data-slot="nv-screen-login-stage"]').exists()).toBe(true)
      page.unmount()
    }
    const page = mount(LoginRecipe, {
      props: {
        modelValue: draft(),
        surface: 'console',
        mode: 'login',
        context: 'library',
        brand: '书房',
      },
      slots: { hint: '<a href="#help">帮助</a>' },
    })
    expect(page.get('a').attributes('href')).toBe('#help')
    page.unmount()
  })
  it('forwards all change fields without strength or equality policy and distinguishes empty values', async () => {
    const submit = vi.fn().mockResolvedValue({ accepted: true })
    const page = setup({ mode: 'change-password', submit })
    expect(page.find('[name="loginName"]').exists()).toBe(false)
    expect(page.get('[name="newPassword"]').attributes('autocomplete')).toBe('new-password')
    expect(page.get('[name="confirmPassword"]').attributes('autocomplete')).toBe('new-password')
    await page.get('form').trigger('submit')
    await flushPromises()
    expect(submit.mock.calls[0]?.[0]).toMatchObject({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    await page.setProps({
      modelValue: { ...draft(), newPassword: 'a', confirmPassword: 'different' },
    })
    await page.get('form').trigger('submit')
    await flushPromises()
    expect(submit.mock.calls[1]?.[0]).toMatchObject({
      newPassword: 'a',
      confirmPassword: 'different',
    })
    expect(page.emitted('confirmed')).toHaveLength(2)
    page.unmount()
  })
  it('renders only known PDA exit notices and blocks readonly submission', async () => {
    const submit = vi.fn()
    const page = setup({ surface: 'pda', logoutNotice: 'failed', readonly: true, submit })
    expect(page.get('[data-notice]').text()).toContain('撤销失败')
    await page.get('form').trigger('submit')
    expect(submit).not.toHaveBeenCalled()
    await page.setProps({ logoutNotice: 'timed-out' })
    expect(page.get('[data-notice]').text()).toContain('超时')
    await page.setProps({ logoutNotice: '' })
    expect(page.find('[data-notice]').exists()).toBe(false)
    await page.setProps({ logoutNotice: undefined })
    expect(page.find('[data-notice]').exists()).toBe(false)
    page.unmount()
    await nextTick()
  })
})
it('keeps rejected controlled edits at the host value and accepts an external empty replacement', async () => {
  for (const surface of ['console', 'business-console', 'pda', 'screen']) {
    const page = setup({ surface })
    const input = page.get('input[name="loginName"]')
    await input.setValue('unaccepted')
    await nextTick()
    expect((input.element as HTMLInputElement).value).toBe('  Lin  ')
    await page.setProps({ modelValue: { ...draft(), loginName: '' } })
    expect((input.element as HTMLInputElement).value).toBe('')
    expect(page.emitted('update:modelValue')).toHaveLength(1)
    page.unmount()
  }
})
it.each([{}, { accepted: 1 }, { accepted: 'true' }, false, null])(
  'rejects malformed receipt case %#',
  async (receipt) => {
    const page = setup({ submit: () => receipt })
    await page.get('form').trigger('submit')
    await flushPromises()
    expect(page.emitted('confirmed')).toBeUndefined()
    expect(page.get('[role="alert"]').text()).toContain('未能完成')
    page.unmount()
  },
)
