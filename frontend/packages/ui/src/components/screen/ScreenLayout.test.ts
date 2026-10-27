import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { createApp, createSSRApp, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { NvScreenLayout } from '@nerv-iip/ui'

it('renders seed-driven geometry through the public layout and updates only the changed instance', async () => {
  const seed = ref('gallery-one')
  const host = mount({
    setup: () => () =>
      h('div', [
        h(NvScreenLayout, { seed: seed.value, title: '城市展厅', time: '10:30' }),
        h(NvScreenLayout, { seed: 'gallery-one', title: '河岸展厅', time: '11:00' }),
      ]),
  })
  await nextTick()
  const layouts = () => host.findAllComponents(NvScreenLayout)
  const geometry = (index: number) => ({
    paths: layouts()
      [index]!.findAll('path.nv-scr-layout-path')
      .map((path) => path.attributes('d')),
    dots: layouts()
      [index]!.findAll('g.nv-scr-layout-sparks circle')
      .map((dot) => [dot.attributes('cx'), dot.attributes('cy'), dot.attributes('r')].join(',')),
  })
  expect(geometry(0)).toEqual(geometry(1))
  expect(geometry(0).paths).toHaveLength(2)
  expect(geometry(0).dots.length).toBeGreaterThan(0)
  const unchanged = geometry(1)
  const ids = layouts()[0]!
    .findAll('svg [id]')
    .map((node) => node.attributes('id'))
  seed.value = 'gallery-two'
  await nextTick()
  expect(geometry(0)).not.toEqual(unchanged)
  expect(geometry(1)).toEqual(unchanged)
  expect(
    layouts()[0]!
      .findAll('svg [id]')
      .map((node) => node.attributes('id')),
  ).toEqual(ids)
  host.unmount()
})

it('scopes every SVG reference to its own instance, including after replacing one instance', async () => {
  const first = ref(true)
  const host = mount({
    setup: () => () =>
      h('div', [
        first.value
          ? h(NvScreenLayout, { key: 'first', seed: 'same' })
          : h(NvScreenLayout, { key: 'replacement', seed: 'same' }),
        h(NvScreenLayout, { seed: 'same' }),
      ]),
  })
  await nextTick()
  const inspect = () =>
    host.findAllComponents(NvScreenLayout).map((layout) => {
      const ids = layout.findAll('svg [id]').map((node) => node.attributes('id'))
      const refs = layout
        .findAll('svg [stroke^="url(#"], svg [href^="#"]')
        .map((node) => node.attributes('stroke') || node.attributes('href'))
      expect(refs.length).toBeGreaterThan(0)
      expect(
        refs.every((reference) => ids.includes(reference!.replace(/^url\(#|^#|\)$/g, ''))),
      ).toBe(true)
      return ids
    })
  const before = inspect()
  expect(before[0]).not.toEqual(before[1])
  first.value = false
  await nextTick()
  const after = inspect()
  expect(after[1]).toEqual(before[1])
  expect(after[0]).not.toEqual(after[1])
  host.unmount()
})

it('keeps SVG targets local across independent Vue roots, updates, and remounts', async () => {
  const random = vi.spyOn(Math, 'random').mockReturnValue(0.5)
  const roots = [document.createElement('div'), document.createElement('div')]
  roots.forEach((root) => document.body.appendChild(root))
  const seeds = [ref('shared'), ref('shared')]
  const apps = roots.map((root, index) => {
    const app = createApp({ setup: () => () => h(NvScreenLayout, { seed: seeds[index]!.value }) })
    app.mount(root)
    return app
  })
  await nextTick()
  const inspect = () =>
    roots.map((root) => {
      const svg = root.querySelector('svg')!
      const ids = [...svg.querySelectorAll('[id]')].map((node) => node.id)
      const refs = [...svg.querySelectorAll('path[stroke], mpath')].map((node) =>
        (node.getAttribute('stroke') || node.getAttribute('href'))!.replace(/^url\(#|^#|\)$/g, ''),
      )
      expect(ids).toHaveLength(4)
      expect(refs).toHaveLength(4)
      for (const id of refs) {
        expect(ids).toContain(id)
        expect(document.getElementById(id)).toBe(svg.querySelector(`[id="${id}"]`))
      }
      return { ids, paths: [...svg.querySelectorAll('path')].map((path) => path.getAttribute('d')) }
    })
  const before = inspect()
  expect(before[0]!.paths).toEqual(before[1]!.paths)
  seeds[0]!.value = 'different'
  await nextTick()
  const changed = inspect()
  expect(changed[0]!.paths).not.toEqual(changed[1]!.paths)
  expect(changed[0]!.ids).toEqual(before[0]!.ids)
  expect(changed[1]).toEqual(before[1])
  seeds[1]!.value = 'another-space'
  await nextTick()
  const bothChanged = inspect()
  expect(bothChanged[0]).toEqual(changed[0])
  expect(bothChanged[1]!.paths).not.toEqual(changed[1]!.paths)
  expect(bothChanged[1]!.ids).toEqual(changed[1]!.ids)
  seeds[1]!.value = 'shared'
  await nextTick()
  apps[0]!.unmount()
  const replacement = createApp({ render: () => h(NvScreenLayout, { seed: 'shared' }) })
  replacement.mount(roots[0]!)
  await nextTick()
  const remounted = inspect()
  expect(remounted[0]!.paths).toEqual(remounted[1]!.paths)
  expect(remounted[0]!.ids).not.toEqual(before[0]!.ids)
  replacement.unmount()
  apps[1]!.unmount()
  roots.forEach((root) => root.remove())
  random.mockRestore()
})

it('hydrates independent server-rendered roots before assigning browser-local suffixes', async () => {
  const host = { render: () => h(NvScreenLayout, { seed: 'gallery' }) }
  const roots = [document.createElement('div'), document.createElement('div')]
  for (const root of roots) {
    root.innerHTML = await renderToString(createSSRApp(host))
    document.body.appendChild(root)
  }
  const serverIds = roots.map((root) =>
    [...root.querySelectorAll('svg [id]')].map((node) => node.id),
  )
  expect(serverIds[0]).toEqual(serverIds[1])
  const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const apps = roots.map((root) => {
    const app = createSSRApp(host)
    app.mount(root)
    return app
  })
  await nextTick()
  const clientIds = roots.map((root) =>
    [...root.querySelectorAll('svg [id]')].map((node) => node.id),
  )
  expect(clientIds[0]).toHaveLength(4)
  expect(clientIds[1]).toHaveLength(4)
  expect(clientIds[0]).not.toEqual(clientIds[1])
  expect(warnings).not.toHaveBeenCalled()
  for (const root of roots) {
    for (const id of [...root.querySelectorAll('svg [id]')].map((node) => node.id)) {
      expect(document.getElementById(id)).toBe(root.querySelector(`[id="${id}"]`))
    }
  }
  apps.forEach((app) => app.unmount())
  warnings.mockRestore()
  roots.forEach((root) => root.remove())
})

it('forwards host clock and interactive slots without creating a timer or business defaults', async () => {
  const time = ref('10:30')
  const clicks = ref(0)
  const host = mount({
    setup: () => () =>
      h(
        NvScreenLayout,
        {
          seed: 'hall',
          title: '展览导览',
          time: time.value,
          date: '周二',
          line: '一层',
          screen: '入口屏',
        },
        {
          default: () => h('button', { onClick: () => clicks.value++ }, '查看活动'),
        },
      ),
  })
  expect(host.text()).toContain('10:30')
  await host.get('main button').trigger('click')
  expect(clicks.value).toBe(1)
  time.value = '10:31'
  await nextTick()
  expect(host.text()).toContain('10:31')
  expect(host.text()).not.toContain('Nerv-IIP')
  host.unmount()
})

it('allows an empty seed, root attributes, and a fully host-owned header', () => {
  const layout = mount(NvScreenLayout, {
    props: { seed: '' },
    attrs: { 'data-space': 'reading-room', style: 'opacity: 0.8' },
    slots: { header: '<button type="button">返回大厅</button>', default: '<p>欢迎阅读</p>' },
  })
  expect(layout.attributes('data-space')).toBe('reading-room')
  expect(layout.attributes('style')).toContain('opacity: 0.8')
  expect(layout.findAll('path.nv-scr-layout-path')).toHaveLength(2)
  expect(layout.get('.nv-scr-layout__chrome button').text()).toBe('返回大厅')
  expect(layout.find('h1').exists()).toBe(false)
  expect(layout.get('main').text()).toBe('欢迎阅读')
  layout.unmount()
})
