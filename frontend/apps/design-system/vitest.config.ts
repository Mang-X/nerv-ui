import { defineConfig } from 'vitest/config'
import Vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
export default defineConfig({
  plugins: [
    {
      name: 'resource-markdown-host-test',
      enforce: 'pre',
      transform(source, id) {
        if (!id.endsWith('/resource-scheduler.md')) return
        // Exercise the real page script and live Demo contents; omit prose and code fences.
        const live = source.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '')
        const script = live.match(/<script setup>[\s\S]*?<\/script>/)?.[0]
        const demos = [...live.matchAll(/<Demo[^>]*>([\s\S]*?)<\/Demo>/g)].map((m) => m[1]).join('')
        return `${script}<template><div>${demos}</div></template>`
      },
    },
    Vue({ include: [/\.vue$/, /resource-scheduler\.md$/] }),
    tailwindcss(),
    wasm(),
  ],
  resolve: { dedupe: ['vue'] },
  test: {
    environment: 'node',
    include: [
      'docs.contract.test.ts',
      'scheduling-live.contract.test.ts',
      'scheduling-host.test.ts',
      'snapshot-comparison-host.test.ts',
      'request-forms-host.test.ts',
      'async-candidates-host.test.ts',
      'workbench-saved-day-host.test.ts',
      'list-blocks-host.test.ts',
      'card-structure-host.test.ts',
      'empty-host.test.ts',
      'base-table-host.test.ts',
      'pagination-host.test.ts',
      'sidebar-parts-host.test.ts',
      'base-dates-host.test.ts',
      'avatar-host.test.ts',
      'popover-host.test.ts',
      'app-provider-host.test.ts',
      'field-group-host.test.ts',
      'field-content-host.test.ts',
      'dropdown-menu-host.test.ts',
      'alert-dialog-host.test.ts',
      'form-select-host.test.ts',
      'metric-comparison-host.test.ts',
      'kanban-record-host.test.ts',
    ],
  },
})
