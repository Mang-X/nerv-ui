// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Avatar, AvatarImage, AvatarFallback } from '@nerv-iip/ui'
import Example from './docs/.vitepress/examples/AvatarExample.vue'
vi.mock('vitepress', () => ({ withBase: (path: string) => path }))
let page: VueWrapper
const images: HTMLImageElement[] = []
afterEach(() => {
  page?.unmount()
  images.length = 0
  vi.unstubAllGlobals()
})
it('uses the public avatar composition and recovers through simulated preloader error and load', async () => {
  // Reka loads through a detached Image; these events are unit evidence only.
  const NativeImage = window.Image
  vi.stubGlobal('Image', function () {
    const image = new NativeImage()
    images.push(image)
    return image
  })
  page = mount(Example)
  await nextTick()
  expect(page.getComponent(Avatar).exists()).toBe(true)
  expect(page.getComponent(AvatarImage).attributes('alt')).toBe('阅读伙伴的本地图像')
  images[0].dispatchEvent(new Event('load'))
  await nextTick()
  expect(page.get('img').isVisible()).toBe(true)
  expect(page.find('[data-slot="avatar-fallback"]').exists()).toBe(false)
  await page
    .findAll('button')
    .find((button) => button.text() === '无法加载的图片')!
    .trigger('click')
  expect(
    page
      .findAll('button')
      .find((button) => button.text() === '无法加载的图片')!
      .attributes('aria-pressed'),
  ).toBe('true')
  images.at(-1)!.dispatchEvent(new Event('error'))
  await nextTick()
  expect(page.get('img').isVisible()).toBe(false)
  expect(page.getComponent(AvatarFallback).text()).toBe('阅友')
  expect(page.text()).toContain('图片无法加载')
  await page
    .findAll('button')
    .find((button) => button.text() === '无图片')!
    .trigger('click')
  expect(
    page
      .findAll('button')
      .find((button) => button.text() === '无图片')!
      .attributes('aria-pressed'),
  ).toBe('true')
  expect(page.findComponent(AvatarImage).exists()).toBe(false)
  expect(page.getComponent(AvatarFallback).text()).toBe('阅友')
  expect(page.text()).toContain('未提供图片')
  await page
    .findAll('button')
    .find((button) => button.text() === '本地有效图片')!
    .trigger('click')
  expect(
    page
      .findAll('button')
      .find((button) => button.text() === '本地有效图片')!
      .attributes('aria-pressed'),
  ).toBe('true')
  images.at(-1)!.dispatchEvent(new Event('load'))
  await nextTick()
  expect(page.get('img').isVisible()).toBe(true)
  expect(page.get('img').attributes('src')).toContain('/media/portrait.svg')
  expect(page.find('[data-slot="avatar-fallback"]').exists()).toBe(false)
})
