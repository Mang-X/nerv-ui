import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { NvScreenLoginStage } from '@nerv-iip/ui'

it('projects artwork and glow points through the same viewBox for contain and cover', async () => {
  const page = mount(NvScreenLoginStage, {
    props: {
      title: '晨光书房',
      imageSrc: '/art.svg',
      imageWidth: 1000,
      imageHeight: 500,
      glows: [{ x: 25, y: 60, size: 80 }],
    },
  })
  expect(page.get('svg').attributes('viewBox')).toBe('0 0 1000 500')
  expect(page.get('svg').attributes('preserveAspectRatio')).toBe('xMidYMid meet')
  await page.get('image').trigger('load')
  expect(page.get('circle').attributes('cx')).toBe('250')
  expect(page.get('circle').attributes('cy')).toBe('300')
  await page.setProps({ fit: 'cover', imageWidth: 2000, imageSrc: '/next.svg' })
  expect(page.get('svg').attributes('preserveAspectRatio')).toBe('xMidYMid slice')
  expect(page.find('circle').exists()).toBe(false)
  await page.get('image').trigger('load')
  expect(page.get('circle').attributes('cx')).toBe('500')
  await page.get('image').trigger('error')
  expect(page.find('circle').exists()).toBe(false)
  page.unmount()
})

it('keeps interactive form slots, host controlled pending and disabled, and escaped errors', async () => {
  const page = mount(NvScreenLoginStage, {
    props: { title: '花园', imageSrc: '/art.svg', imageWidth: 100, imageHeight: 100 },
    slots: { default: '<label>姓名<input name="name"></label><button type="submit">继续</button>' },
  })
  await page.get('input').setValue('林悦')
  await page.get('form').trigger('submit')
  expect(page.emitted('submit')).toHaveLength(1)
  await page.setProps({ pending: true })
  await page.get('form').trigger('submit')
  expect(page.emitted('submit')).toHaveLength(1)
  expect(page.get('fieldset').attributes('disabled')).toBeDefined()
  await page.setProps({ pending: false, disabled: true, error: '<img src=x onerror=alert(1)>' })
  await page.get('form').trigger('submit')
  expect(page.emitted('submit')).toHaveLength(1)
  expect(page.get('[role="alert"]').text()).toBe('<img src=x onerror=alert(1)>')
  expect(page.find('[role="alert"] img').exists()).toBe(false)
  page.unmount()
})

it('ignores replaced and unmounted image callbacks and keeps independent roots ID free', async () => {
  const props = {
    title: '入口',
    imageSrc: '/one.svg',
    imageWidth: 100,
    imageHeight: 100,
    glows: [{ x: 50, y: 50, size: 10 }],
  }
  const first = mount(NvScreenLoginStage, { props })
  const second = mount(NvScreenLoginStage, { props })
  const old = first.get('image')
  await first.setProps({ imageSrc: '/two.svg' })
  await old.trigger('load')
  expect(first.find('circle').exists()).toBe(false)
  await first.get('image').trigger('load')
  expect(first.findAll('circle')).toHaveLength(1)
  expect(second.find('circle').exists()).toBe(false)
  expect(first.findAll('[id]')).toHaveLength(0)
  const late = first.get('image')
  first.unmount()
  await late.trigger('load')
  expect(second.find('circle').exists()).toBe(false)
  second.unmount()
})

it('lets both neutral hosts own waiting and error without claiming authentication', async () => {
  const { default: Demo } = await import('./ScreenLoginStageDemo.vue')
  for (const garden of [false, true]) {
    const page = mount(Demo, { props: { garden } })
    expect(page.get('form').attributes('aria-label')).toBe(garden ? '走进共享花园' : '走进晨光书房')
    await page.get('input').setValue('林悦')
    await page.get('form').trigger('submit')
    expect(page.get('fieldset').attributes('disabled')).toBeDefined()
    const finish = page.findAll('button').find((item) => item.text() === '结束等待')!
    await finish.trigger('click')
    expect(page.get('[role="alert"]').text()).toBe('暂时无法继续，请稍后再试。')
    expect(page.text()).not.toContain('登录成功')
    page.unmount()
  }
})

it('coalesces same turn submit before the host pending prop reaches the child', async () => {
  const page = mount(NvScreenLoginStage, {
    props: { title: '入口', imageSrc: '', imageWidth: 100, imageHeight: 100 },
  })
  const form = page.get('form').element
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  expect(page.emitted('submit')).toHaveLength(1)
  page.unmount()
})

it('keeps login forms outside the fixed design scaler and restores scaling on other routes', async () => {
  const { default: ScreenDemo } = await import('../ScreenDemo.vue')
  const page = mount(ScreenDemo, { props: { section: '#screen/login/library' } })
  const form = page.get('form').element
  expect(form.closest('.screen-scaler')).toBeNull()
  expect(page.find('[aria-label="缩放方式"]').exists()).toBe(false)
  await page.get('input').setValue('林悦')
  await page.get('form').trigger('submit')
  expect(page.get('fieldset').attributes('disabled')).toBeDefined()
  await page.setProps({ section: '#screen/login/garden' })
  expect(page.get('form').attributes('aria-label')).toBe('走进共享花园')
  await page.setProps({ section: '#screen' })
  expect(page.find('[aria-label="缩放方式"]').exists()).toBe(true)
  expect(page.find('.screen-scaler').exists()).toBe(true)
  page.unmount()
})
