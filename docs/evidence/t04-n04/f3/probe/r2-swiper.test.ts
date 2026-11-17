import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, expect, it, vi } from 'vitest'
import Swiper from '/Users/mang/Project/nerv-ui-worktrees/t04-n04-mobile-lists/frontend/packages/ui-mobile/src/components/swiper/Swiper.vue'
afterEach(()=>vi.restoreAllMocks())
function pointer(el:Element,type:string,x:number) { el.dispatchEvent(new MouseEvent(type,{clientX:x,clientY:10,buttons:type==='pointerup'?0:1})) }
it.each([{name:'forward',initial:0,sign:-1,next:1},{name:'backward',initial:2,sign:1,next:1}])('preserves real drag distance across same-value host update - $name',async({initial,sign,next})=>{
 vi.spyOn(HTMLElement.prototype,'offsetWidth','get').mockReturnValue(300)
 const w=mount(Swiper,{props:{items:['A','B','C'],index:initial}})
 try {
  const t=w.get('.nv-m-swiper-track');pointer(t.element,'pointerdown',150);pointer(t.element,'pointermove',150+sign*40);await nextTick()
  await w.setProps({index:initial});expect(w.emitted('change')).toBeUndefined()
  expect(t.attributes('style')).toContain(`translate3d(${-initial*300+sign*40}px, 0, 0)`)
  pointer(t.element,'pointermove',150+sign*80);pointer(t.element,'pointerup',150+sign*80);await nextTick()
  expect(w.emitted('update:index')).toEqual([[next]]);expect(w.emitted('change')).toEqual([[next]])
 } finally {w.unmount()}
})
it.each([{name:'forward-short',initial:0,first:2,target:1,sign:-1,distance:50,next:1},{name:'backward-short',initial:2,first:0,target:1,sign:1,distance:50,next:1},{name:'forward-long',initial:0,first:2,target:1,sign:-1,distance:80,next:2},{name:'backward-long',initial:2,first:0,target:1,sign:1,distance:80,next:0}])('uses only the last external page origin and retains next gesture events - $name',async({initial,first,target,sign,distance,next})=>{
 vi.spyOn(HTMLElement.prototype,'offsetWidth','get').mockReturnValue(300)
 const w=mount(Swiper,{props:{items:['A','B','C'],index:initial}})
 try {
  const t=w.get('.nv-m-swiper-track');pointer(t.element,'pointerdown',150);pointer(t.element,'pointermove',150+sign*20);await nextTick();await w.setProps({index:first})
  pointer(t.element,'pointermove',150+sign*40);await nextTick();await w.setProps({index:target})
  expect(w.emitted('change')).toBeUndefined();expect(w.emitted('update:index')).toBeUndefined()
  pointer(t.element,'pointermove',150+sign*(40+distance));await nextTick()
  expect(t.attributes('style')).toContain(`translate3d(${-300+sign*distance}px, 0, 0)`)
  pointer(t.element,'pointerup',150+sign*(40+distance));await nextTick()
  expect(w.emitted('change')).toEqual([[next]]);expect(w.emitted('update:index')).toEqual(next===target?undefined:[[next]])
  await w.setProps({index:next});pointer(t.element,'pointerdown',150);pointer(t.element,'pointermove',150-sign*90);pointer(t.element,'pointerup',150-sign*90);await nextTick()
  expect(w.emitted('change')).toEqual([[next],[next+sign]])
  expect(w.emitted('update:index')).toEqual(next===target?[[next+sign]]:[[next],[next+sign]])
 } finally {w.unmount()}
})
