import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import FusionDemo from './FusionDemo.vue'
it('shows two neutral graphs and clears and restores through host controls', async () => {
  const w = mount(FusionDemo)
  expect(w.findAll('svg.nv-scr-fusion')).toHaveLength(2)
  expect(w.text()).toContain('河岸书房')
  expect(w.text()).toContain('城市花园')
  expect(w.findAll('polygon')).toHaveLength(12)
  await w.get('button').trigger('click')
  expect(w.findAll('polygon, path.nv-scr-fusion-rail')).toHaveLength(0)
  expect(w.text()).toContain('暂无空间')
  await w.get('button').trigger('click')
  expect(w.findAll('polygon')).toHaveLength(12)
  w.unmount()
})
