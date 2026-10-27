import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import { h } from 'vue'
import { NvScreenFlowLinesBg, NvScreenIsometricBlocksBg } from '@nerv-iip/ui'

it('exports the preserved flow geometry and light/node layers through the public barrel', () => {
  const wrapper = mount(NvScreenFlowLinesBg)
  const svg = wrapper.get('svg')
  expect(svg.attributes('viewBox')).toBe('0 0 1440 810')
  expect(svg.attributes('preserveAspectRatio')).toBe('xMidYMid slice')
  expect(wrapper.findAll('path.rail')).toHaveLength(6)
  expect(wrapper.findAll('path.flux')).toHaveLength(6)
  expect(wrapper.findAll('circle.node')).toHaveLength(8)
  expect(wrapper.findAll('circle.ping')).toHaveLength(3)
  expect(wrapper.find('path.rail.main').attributes('d')).toBe(
    'M-60 140 H540 Q600 140 600 200 V300 Q600 360 660 360 H1520',
  )
  wrapper.unmount()
})

it('exports the preserved isometric grid, six blocks and visible nodes', () => {
  const wrapper = mount(NvScreenIsometricBlocksBg)
  const svg = wrapper.get('svg')
  expect(svg.attributes('viewBox')).toBe('0 0 1200 760')
  expect(svg.attributes('preserveAspectRatio')).toBe('xMidYMid slice')
  expect(wrapper.findAll('.grid line')).toHaveLength(20)
  expect(wrapper.findAll('polygon.face-t')).toHaveLength(6)
  expect(wrapper.findAll('polygon.face-l')).toHaveLength(6)
  expect(wrapper.findAll('polygon.face-r')).toHaveLength(6)
  expect(wrapper.findAll('circle.node')).toHaveLength(6)
  wrapper.unmount()
})

it('allows two copies of each background without shared SVG id references', () => {
  const wrapper = mount({
    render: () =>
      h('div', [
        h(NvScreenFlowLinesBg),
        h(NvScreenFlowLinesBg),
        h(NvScreenIsometricBlocksBg),
        h(NvScreenIsometricBlocksBg),
      ]),
  })
  expect(wrapper.findAll('svg')).toHaveLength(4)
  expect(wrapper.findAll('svg[id], [href^="#"], [fill^="url(#"], [filter^="url(#"]')).toHaveLength(
    0,
  )
  wrapper.unmount()
})
