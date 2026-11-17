import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { compileScript, parse } from 'vue/compiler-sfc'
import * as Vue from 'vue'
import * as UI from '@nerv-iip/ui'
import { expect, it } from 'vitest'
function example(page: string) {
  const markdown = readFileSync(
    resolve(process.cwd(), `../../apps/docs/docs/components/screen/${page}.md`),
    'utf8',
  )
  const script = markdown.match(/<script setup>[\s\S]*?<\/script>/)?.[0]
  const demo = markdown.match(/<ScreenDemo(?: wide)?>([\s\S]*?)<\/ScreenDemo>/)?.[1]
  expect(script).toBeTruthy()
  expect(demo).toBeTruthy()
  const { descriptor } = parse(`${script}\n<template>${demo}</template>`)
  const result = compileScript(descriptor, { id: page, inlineTemplate: true })
  const code = result.content
    .replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g, (_, names, source) => {
      if (!['vue', '@nerv-iip/ui'].includes(source)) throw new Error(source)
      return `const {${names.replace(/\bas\b/g, ':')}} = ${source === 'vue' ? 'Vue' : 'UI'}`
    })
    .replace('export default', 'return')
  return mount(new Function('Vue', 'UI', code)(Vue, UI))
}
it('hero documentation actual input clears to unknown and restores text zero without invented spark', async () => {
  const w = example('oee-hero')
  try {
    expect(w.get('.nv-scr-oeh-delta').attributes('data-tone')).toBe('positive')
    await w.get('input').setValue('')
    expect(w.get('.nv-scr-oeh-val').text()).toBe('—元')
    expect(w.find('svg').exists()).toBe(false)
    await w.get('input').setValue('0')
    expect(w.get('.nv-scr-oeh-val').text()).toBe('0元')
    expect(w.find('svg').exists()).toBe(true)
  } finally {
    w.unmount()
  }
})
it('status documentation actual inputs clear reading to unknown and allow unit suppression', async () => {
  const w = example('status-card')
  try {
    expect(w.get('.nv-scr-lc-stats').text()).toContain('目标')
    await w.get('input[aria-label="当前读数"]').setValue('')
    expect(w.findAll('.nv-scr-lc-stats b')[1]!.text()).toBe('— 人次')
    await w.get('input[aria-label="数量单位"]').setValue('')
    expect(w.findAll('.nv-scr-lc-stats b')[1]!.text()).toBe('—')
    await w.get('input[aria-label="当前读数"]').setValue('0')
    expect(w.findAll('.nv-scr-lc-stats b')[1]!.text()).toBe('0')
  } finally {
    w.unmount()
  }
})

