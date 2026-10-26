import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
export { assert, fs }
export const root='/Users/mang/Project/nerv-ui-worktrees/t07-p08-panels/docs/evidence/t07-p08'
export async function session(){const task=await taskSpace(78);return {task,page:task.page('p1')}}
export function logger(name){const rows=[];return async(stage,value)=>{rows.push({stage,...value});await fs.writeFile(root+'/raw/'+name+'.json',JSON.stringify(rows,null,2)+'\n');return value}}
export async function instrument(page){await page.evaluate(()=>{window.p08Errors=[];window.p08Rejections=[];window.p08Trusted=[];window.addEventListener('error',e=>window.p08Errors.push(e.message));window.addEventListener('unhandledrejection',e=>window.p08Rejections.push(String(e.reason)));window.addEventListener('mousedown',e=>window.p08Trusted.push({trusted:e.isTrusted,target:e.target?.getAttribute?.('aria-label')??e.target?.textContent?.slice(0,80)}),true)})}
export async function state(page){return page.evaluate(()=>({url:location.href,title:document.querySelector('h1')?.textContent,selected:document.querySelector('[data-selection]')?.textContent,detail:document.querySelector('[data-detail]')?.textContent,records:document.querySelector('[data-records]')?.innerText,visible:document.querySelector('[data-visible-count]')?.textContent,
  engines:[...document.querySelectorAll('[data-engine]')].map(e=>e.getAttribute('data-engine')),bars:document.querySelectorAll('.gantt_task_line').length,ghost:document.querySelectorAll('.nerv-drag-ghost[style*="display: flex"]').length,
  tooltips:document.querySelectorAll('body > .nerv-resource-tooltip,body > .nerv-tooltip').length,errors:window.p08Errors??null,rejections:window.p08Rejections??null,trusted:window.p08Trusted??null,
  resources:performance.getEntriesByType('resource').map(e=>e.name),timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,scale:visualViewport?.scale,theme:document.documentElement.className}));}
export async function click(page,name){await page.click(`loc=role:button[name="${name}"]`)}
export async function choose(page,label,value){await page.click(`button[aria-label="${label}"]`);await page.click(`xpath=//*[@role="option" and normalize-space(.)="${value}"]`);await page.waitForFunction(()=>!document.querySelector('[role="listbox"]'))}
