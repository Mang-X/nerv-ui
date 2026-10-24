import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { expect, it } from 'vitest'
import PullRefresh from '/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists/frontend/packages/ui-mobile/src/components/pull-refresh/PullRefresh.vue'
function pointer(el:Element,type:string,y:number){el.dispatchEvent(new MouseEvent(type,{clientX:20,clientY:y,buttons:type==='pointerup'||type==='pointercancel'?0:1,bubbles:true}))}
it.each([{name:'release-while-loading',end:'pointerup',complete:false},{name:'cancel-while-loading',end:'pointercancel',complete:false},{name:'release-after-completion',end:'pointerup',complete:true},{name:'cancel-after-completion',end:'pointercancel',complete:true}])('does not revive a revoked pull after repeated loading transitions and allows reuse - $name',async({end,complete})=>{
 const w=mount(PullRefresh,{props:{modelValue:false}})
 try {
  await nextTick();const t=w.get('.nv-m-pr-inner');pointer(t.element,'pointerdown',10);pointer(t.element,'pointermove',260);await nextTick();expect(w.text()).toContain('释放立即刷新')
  for(let i=0;i<2;i++){
   await w.setProps({modelValue:true});expect(t.attributes('style')).toContain('translateY(56px)');expect(w.text()).toContain('刷新中')
   pointer(t.element,'pointermove',310);await nextTick();await w.setProps({modelValue:false});expect(t.attributes('style')).toContain('translateY(0px)')
   pointer(t.element,'pointermove',350);await nextTick();expect(t.attributes('style')).toContain('translateY(0px)')
  }
  if(!complete)await w.setProps({modelValue:true})
  pointer(t.element,end,350);await nextTick();expect(w.emitted('refresh')).toBeUndefined();await w.setProps({modelValue:false})
  for(let i=1;i<=2;i++){
   pointer(t.element,'pointerdown',10);pointer(t.element,'pointermove',260);pointer(t.element,'pointerup',260);await nextTick()
   expect(w.emitted('refresh')).toHaveLength(i);expect(w.text()).toContain('刷新中')
   await w.setProps({modelValue:true});pointer(t.element,'pointerup',260);await nextTick();expect(w.emitted('refresh')).toHaveLength(i)
   await w.setProps({modelValue:false});expect(t.attributes('style')).toContain('translateY(0px)')
  }
 }finally{w.unmount()}
})
