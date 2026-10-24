import { defineConfig } from 'vite-plus'

// `components/ui/` 是 shadcn 原版冻结区（byte-for-byte 零改动），因此整体排除 fmt + lint；
// 但其中混住着若干 Nerv 自研 / 自行补丁过的受治理源码，必须逐条 negation 重新纳管，
// 否则它们会静默豁免格式与 lint 门禁（NERV-794）。
//
// 写法约束，改动前务必读完，不要「简化」：
// 1. 基础模式必须是 `**/*` 而不是 `**`：`**` 会同时匹配目录条目本身，
//    被排除的目录不会再被遍历，后续 negation 永远没有机会命中里面的文件。
// 2. 每个重新纳管的目录需要**两条** negation：先放开目录条目（结尾带 `/`）
//    以恢复遍历，再放开目录内递归文件。只写其中一条都会把目录重新冻住。
// 3. 单文件纳管同理：先放开其所在目录条目，再放开该文件本身
//    （`sonner/` 只有 `index.ts` 是 Nerv 补丁，`Sonner.vue` 仍是原版，保持冻结）。
const frozenShadcnSourceIgnorePatterns = [
  'packages/ui/src/components/ui/**/*',
  // 自研目录：中文产品文案 + 自带单测，非 shadcn 原版
  '!packages/ui/src/components/ui/file-preview/',
  '!packages/ui/src/components/ui/file-preview/**',
  '!packages/ui/src/components/ui/file-upload/',
  '!packages/ui/src/components/ui/file-upload/**',
  '!packages/ui/src/components/ui/date-picker/',
  '!packages/ui/src/components/ui/date-picker/**',
  // 原版目录中的单个 Nerv 补丁文件：仅 barrel 被改写（显式引入 vue-sonner 样式）
  '!packages/ui/src/components/ui/sonner/',
  '!packages/ui/src/components/ui/sonner/index.ts',
] as const

export default defineConfig({
  fmt: {
    semi: false,
    singleQuote: true,
    ignorePatterns: [
      'apps/console/dist/**',
      'apps/console/typed-router.d.ts',
      'apps/business-console/dist/**',
      'apps/business-console/typed-router.d.ts',
      'apps/docs/docs/.vitepress/dist/**',
      'packages/api-client/openapi/**',
      'packages/api-client/src/generated/**',
      ...frozenShadcnSourceIgnorePatterns,
      'packages/scheduling/vendor/dhtmlx/**',
    ],
  },
  lint: {
    ignorePatterns: [
      'apps/console/dist/**',
      'apps/console/typed-router.d.ts',
      'apps/business-console/dist/**',
      'apps/business-console/typed-router.d.ts',
      'apps/docs/docs/.vitepress/dist/**',
      'packages/api-client/src/generated/**',
      ...frozenShadcnSourceIgnorePatterns,
      'packages/scheduling/vendor/dhtmlx/**',
    ],
  },
})
