import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { compileScript, parse } from 'vue/compiler-sfc'
import * as Vue from 'vue'
import * as UI from '@nerv-iip/ui'
import { expect, it } from 'vitest'

it('ring documentation input clears to unknown and recovers finite zero decimal negative and overflow readings', async () => {
  const markdown = readFileSync(
    resolve(process.cwd(), '../../apps/design-system/docs/components/screen/ring-gauge.md'),
    'utf8',
  )
  // Compile the actual public example, including its script and input binding.
  // This is a documentation-example host, not the inactive full documentation site.
  const script = markdown.match(/<script setup>[\s\S]*?<\/script>/)?.[0]
  const example = markdown.match(/<ScreenDemo>([\s\S]*?)<\/ScreenDemo>/)?.[1]
  expect(script).toBeTruthy()
  expect(example).toBeTruthy()
  const { descriptor } = parse(`${script}\n<template>${example}</template>`)
  const compiled = compileScript(descriptor, { id: 'ring-documentation', inlineTemplate: true })
  const code = compiled.content
    .replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g, (_, names, source) => {
      if (source !== 'vue' && source !== '@nerv-iip/ui')
        throw new Error(`Unexpected import ${source}`)
      return `const {${names.replace(/\bas\b/g, ':')}} = ${source === 'vue' ? 'Vue' : 'UI'}`
    })
    .replace('export default', 'return')
  const Host = new Function('Vue', 'UI', code)(Vue, UI)
  const errors: unknown[] = []
  const wrapper = mount(Host, {
    global: { config: { errorHandler: (error) => errors.push(error) } },
  })
  try {
    const reading = () => wrapper.find('svg[aria-label^="预订比例"]')
    expect(reading().attributes('aria-label')).toBe('预订比例 72.5%')
    for (const input of ['', '1e309', 'invalid']) {
      await wrapper.get('input').setValue(input)
      expect(errors).toEqual([])
      expect(reading().exists()).toBe(false)
      expect(wrapper.text()).toContain('比例未知')
      // The independent real zero remains visible while this input is unknown.
      expect(wrapper.find('svg[aria-label="阅读比例 0%"]').exists()).toBe(true)
      await wrapper.get('input').setValue('0')
      expect(reading().attributes('aria-label')).toBe('预订比例 0%')
      expect(wrapper.text()).not.toContain('比例未知')
    }
    for (const [input, expected] of [
      ['12.25', '预订比例 12.3%'],
      ['-12.3', '预订比例 -12.3%'],
      ['125.25', '预订比例 125.3%'],
    ]) {
      await wrapper.get('input').setValue(input)
      expect(reading().attributes('aria-label')).toBe(expected)
      expect(errors).toEqual([])
    }
  } finally {
    wrapper.unmount()
  }
})
