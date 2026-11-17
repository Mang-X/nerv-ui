# @nerv-ui 新库约定（R1 起）

## 包结构
- `@nerv-ui/theme`：StyleX 变量（`tokens.stylex.ts`）与共享样式片段（`shared.stylex.ts`）。
- `@nerv-ui/desktop` / `mobile` / `pad` / `screen`：按形态的组件包，各自 `src/components/<name>/`。
- 文档站：`apps/docs-next`（VitePress Custom Theme，从零）。

## 组件写法（唯一模式）
1. 样式放同目录 `Xxx.styles.ts`（**不要**用 SFC `<style>`）：
   ```ts
   import * as stylex from '@stylexjs/stylex'
   import { color, motion, shape } from '@nerv-ui/theme/tokens.stylex'
   import { focus, glass } from '@nerv-ui/theme/shared.stylex'
   export const styles = stylex.create({ ... })
   ```
2. 组件是 SFC，行为来自 `@ui-sdk/vue/<primitive>`，样式用 `stylex.props(...)` 组合：
   ```vue
   <script setup lang="ts">
   import { Button } from '@ui-sdk/vue/button'
   import * as stylex from '@stylexjs/stylex'
   import { computed } from 'vue'
   const sx = computed(() => stylex.props(styles.root, focus.ring))
   </script>
   <template>
     <Button :class="sx.className" :style="sx.style"><slot /></Button>
   </template>
   ```
3. 类型放 `types.ts`（`<script setup>` 里的 `export type` 不会被 dts 收集）。
4. 组件名 `NvXxx`，从包 `src/index.ts` 具名导出。

## 视觉与交互契约
- **聚焦环**：输入件/动作件用 `focus.ring`（1px brand + 4px 柔光）；导航/选中行（tab、菜单项、列表行）用 `focus.subtle`（仅键盘 1px）。环跟随可见控件形状，不画在触控区/外框上。
- **弹层**：一律 `glass.surface`（`blur(16px) saturate(1.6)` + 半透明），进入/退出用 ui-sdk 的 `data-starting-style`/`data-ending-style` + CSS 过渡，时长取 `motion.duration*`。
- **动效**：只用 CSS 过渡/动画与 ui-sdk 行为；**不引入 motion-v**。
- **令牌**：一律用 `@nerv-ui/theme/tokens.stylex` 的变量；不新增裸色值、不引用旧 `--nv-*` 变量。

## 禁止
- Tailwind 类、`<style scoped>`、`@layer`、reka-ui、`clsx`/`tailwind-merge`。
- 修改 `packages/theme`（共享层由主会话维护；缺令牌先报告）。
- 从旧包 `@nerv-iip/*` 导入任何东西。

## 验收
每个包：`pnpm --filter @nerv-ui/<pkg> build` 通过，`dist/style.css` 生成；docs-next 对应页面能用。
