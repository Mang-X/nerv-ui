import { mount, flushPromises } from '@vue/test-utils'
import { afterAll, describe, expect, it } from 'vitest'
import { NvLineChart } from '@nerv-ui/ui'
import LineAnnotationsDemo from './LineAnnotationsDemo.vue'
const bbox = Object.getOwnPropertyDescriptor(SVGElement.prototype, 'getBBox')
Object.defineProperty(SVGElement.prototype, 'getBBox', {
  configurable: true,
  value: () => ({ x: 0, y: 0, width: 50, height: 16 }),
})
afterAll(() => {
  if (bbox) Object.defineProperty(SVGElement.prototype, 'getBBox', bbox)
  else Reflect.deleteProperty(SVGElement.prototype, 'getBBox')
})
describe('line annotation hosts', () => {
  for (const space of ['library', 'garden'] as const)
    it(`locates current same-id detail after reorder and replacement in ${space}`, async () => {
      const w = mount(LineAnnotationsDemo, { attachTo: document.body, props: { space } })
      try {
        const chart = w.getComponent(NvLineChart)
        const first = chart.props('markers')![0]
        await w.get('[data-reorder]').trigger('click')
        await w.get('[data-replace]').trigger('click')
        const current = chart.props('markers')!.find((m) => m.id === first.id)!
        expect(current.index).toBe(3)
        expect(current.label).not.toBe(first.label)
        const event = new MouseEvent('click', { cancelable: true })
        chart.vm.$emit('markerClick', current, event)
        await flushPromises()
        const detail = w.get(`#detail-${current.id}`)
        expect(event.defaultPrevented).toBe(true)
        expect(document.activeElement).toBe(detail.element)
        expect(detail.attributes('data-selected')).toBe('true')
        expect(detail.text()).toContain(space === 'library' ? '17' : '45')
        await w.get('[data-series]').trigger('click')
        expect(chart.props('series')).toHaveLength(1)
      } finally {
        w.unmount()
      }
    })
})
