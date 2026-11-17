import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import TreeDemo from './TreeDemo.vue'
describe('Tree hosts', () => {
  for (const space of ['library', 'studio'] as const)
    it(`accepts selection and creation in ${space}`, async () => {
      const w = mount(TreeDemo, { props: { space } })
      await w.get('[role=treeitem]').trigger('keydown', { key: 'ArrowRight' })
      expect(w.findAll('[role=treeitem]')).toHaveLength(2)
      await w.findAll('[role=treeitem]')[1].trigger('click')
      expect(w.findAll('[aria-selected=true]')).toHaveLength(1)
      await w.get('[data-create]').trigger('click')
      expect(w.text()).toContain('新分区')
      expect(w.findAll('[aria-selected=true]')).toHaveLength(1)
    })
})
