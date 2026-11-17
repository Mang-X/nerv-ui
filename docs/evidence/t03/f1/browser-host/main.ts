import {createApp,h,ref} from 'vue'
import {NvTouchSegmented} from '@nerv-iip/ui'
const initial=[{value:'read',label:'Read'},{value:'listen',label:'Listen'},{value:'rest',label:'Rest'}]
createApp({setup(){
 const options=ref(initial), selected=ref('read'), requested=ref('')
 return ()=>h('main',[
 h('h1','T03 F1 public controlled host'),
 h('button',{onClick:()=>{options.value=[initial[2],initial[0],initial[1]]}},'Reorder'),
 h('button',{onClick:()=>{options.value=[{value:'pause',label:'Pause'},initial[0],initial[1]]}},'Replace Rest with Pause'),
 h('button',{onClick:()=>{selected.value=requested.value}},'Apply request'),
 h('p',{id:'requested'},'Requested: '+requested.value),h('p',{id:'selected'},'Selected: '+selected.value),
 h(NvTouchSegmented,{'aria-label':'Modes',options:options.value,modelValue:selected.value,'onUpdate:modelValue':value=>{requested.value=value}})
 ])
}}).mount('#app')