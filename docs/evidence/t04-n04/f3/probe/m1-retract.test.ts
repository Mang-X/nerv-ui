import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it } from 'vitest'
import Head from '/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists/frontend/packages/ui-mobile/src/components/pull-refresh/PullRefresh.vue'
import Base from './baseline/components/pull-refresh/PullRefresh.vue'
function pointer(el:Element,type:string,y:number){el.dispatchEvent(new MouseEvent(type,{clientX:30,clientY:y,buttons:type==='pointerup'?0:1,bubbles:true}))}
for(const [name,Component] of [['head',Head],['base',Base]] as const){
 it.each([{part:'above-start',y:0},{part:'at-start',y:10},{part:'below-start-control',y:11}])(`does not refresh after pulling back below the threshold - ${name} - $part`,async({y})=>{
  const w=mount(Component,{props:{modelValue:false}})
  try{
   await nextTick();await nextTick();const area=w.get('.nv-m-pr-inner')
   pointer(area.element,'pointerdown',10);pointer(area.element,'pointermove',260);await nextTick();expect(w.text()).toContain('释放立即刷新')
   pointer(area.element,'pointermove',y);await nextTick();const before=area.attributes('style')
   pointer(area.element,'pointerup',y);await nextTick()
   console.log(JSON.stringify({name,y,before,after:area.attributes('style'),refresh:w.emitted('refresh'),model:w.emitted('update:modelValue')}))
   expect(w.emitted('refresh')).toBeUndefined();expect(w.emitted('update:modelValue')).toBeUndefined();expect(area.attributes('style')).toContain('translateY(0px)')
  }finally{w.unmount()}
 })
}
