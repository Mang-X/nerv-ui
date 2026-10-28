import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { createApp, h } from 'vue'
import source from './FusionBg.vue?raw'
import { NvScreenFusionBg } from '@nerv-iip/ui'
const nodes = [
  {
    id: 'a',
    sx: 0,
    sy: 0,
    w: 2,
    d: 2,
    h: 1,
    label: '<b>阅读</b>',
    tone: 'green' as const,
    icon: { render: () => h('svg', { 'data-icon': 'book' }) },
  },
  { id: 'b', sx: 100, sy: -50, w: 2, d: 2, h: 1, label: '展览', tone: 'amber' as const },
]
const edges = [{ id: 'ab', source: 'a', target: 'b', bend: 0 }]
it('projects source faces icons escaped labels and directed zero-negative endpoints', () => {
  const w = mount(NvScreenFusionBg, { props: { nodes, edges } })
  expect(w.get('polygon.nv-scr-fusion-face-t').attributes('points')).toBe(
    '0.0,-34.0 58.9,0.0 0.0,34.0 -58.9,0.0',
  )
  expect(w.get('path').attributes('d')).toBe('M0 0 Q50 -25 100 -50')
  expect(w.findAll('polygon')).toHaveLength(6)
  expect(w.find('[data-icon]').exists()).toBe(true)
  expect(w.get('text').text()).toBe('<b>阅读</b>')
  expect(w.find('text b').exists()).toBe(false)
  expect(w.get('[data-node="a"]').classes()).toContain('nv-scr-fusion-green')
  w.unmount()
})
it('updates same ids reorders reverses deletes and clears without stale paths or labels', async () => {
  const w = mount(NvScreenFusionBg, { props: { nodes, edges } })
  const old = w.get('[data-node="a"]').element
  await w.setProps({
    nodes: [nodes[1]!, { ...nodes[0]!, label: '新名称', sx: -100 }],
    edges: [{ id: 'ab', source: 'b', target: 'a', bend: 0 }],
  })
  expect(w.get('[data-node="a"]').element).toBe(old)
  expect(w.findAll('[data-node]').map((n) => n.attributes('data-node'))).toEqual(['b', 'a'])
  expect(w.text()).toContain('新名称')
  expect(w.text()).not.toContain('<b>阅读</b>')
  expect(w.get('path').attributes('d')).toBe('M100 -50 Q0 -25 -100 0')
  await w.setProps({ nodes: [nodes[0]!] })
  expect(w.findAll('path')).toHaveLength(0)
  await w.setProps({ nodes: [], edges: [] })
  expect(w.findAll('polygon, text, path')).toHaveLength(0)
  expect(w.html()).not.toMatch(/NaN|Infinity/)
  w.unmount()
})
it('isolates independent app roots without SVG references and has no default topology', () => {
  const roots = [document.createElement('div'), document.createElement('div')]
  const apps = roots.map((root) => {
    const app = createApp({ render: () => h(NvScreenFusionBg, { nodes, edges }) })
    app.mount(root)
    return app
  })
  roots.forEach((root) => {
    expect(root.querySelectorAll('polygon')).toHaveLength(6)
    expect(root.querySelectorAll('[id], [href], [marker-end], [fill^="url("]')).toHaveLength(0)
    expect(root.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
  apps.forEach((app) => app.unmount())
  const empty = mount(NvScreenFusionBg)
  expect(empty.findAll('polygon, path, text')).toHaveLength(0)
  empty.unmount()
})
it('declares transparent decoration and reduced motion without runtime resources', () => {
  expect(source).toMatch(/\.nv-scr-fusion \*\s*\{\s*pointer-events: none;/)
  expect(source).toMatch(/prefers-reduced-motion: reduce[\s\S]*animation: none/)
  expect(source).not.toMatch(
    /requestAnimationFrame|setTimeout|setInterval|Observer|Math.random|<animate/,
  )
})

it('shares changed cell geometry and keeps coincident endpoint curves finite', async () => {
  const w = mount(NvScreenFusionBg, {
    props: {
      nodes: [{ ...nodes[0]!, w: 4 }],
      edges: [{ id: 'loop', source: 'a', target: 'a', bend: 0 }],
      cell: 10,
    },
  })
  expect(w.get('path').attributes('d')).toBe('M8.66 5 Q8.66 5 8.66 5')
  expect(w.get('foreignObject').attributes('x')).toBe('-4.34')
  await w.setProps({ cell: 20 })
  expect(w.get('path').attributes('d')).toBe('M17.32 10 Q17.32 10 17.32 10')
  expect(w.html()).not.toMatch(/NaN|Infinity/)
  w.unmount()
})
