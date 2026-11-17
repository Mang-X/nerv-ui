import { defineConfig } from 'vitest/config'
import Vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
export default defineConfig({
  plugins: [Vue(), tailwindcss(), wasm()],
  resolve: { dedupe: ['vue'] },
  test: {
    environment: 'node',
    include: [
      'docs.contract.test.ts',
      'entity-dialog-host.test.ts',
      'entity-create-host.test.ts',
      'entity-search-host.test.ts',
      'filter-bar-host.test.ts',
      'list-blocks-host.test.ts',
      'card-structure-host.test.ts',
      'empty-host.test.ts',
      'base-table-host.test.ts',
      'pagination-host.test.ts',
      'sidebar-parts-host.test.ts',
      'base-dates-host.test.ts',
      'base-chart-host.test.ts',
      'base-tabs-host.test.ts',
      'base-dialog-host.test.ts',
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
