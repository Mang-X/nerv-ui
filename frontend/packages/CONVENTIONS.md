# @nerv-ui 新库约定

`@nerv-ui` 四包（desktop / mobile / pad / screen）的编写规范。本文件管「怎么写」，
颜色、字号、动效曲线这些值写在 `DESIGN.md`。

## 包结构

- `@nerv-ui/theme`：StyleX 变量（`tokens.stylex.ts`）、共享样式片段（`shared.stylex.ts`）、
  图标表（`icons.ts` + `NvIcon.vue`）。
- `@nerv-ui/desktop` / `mobile` / `pad` / `screen`：按形态分包，组件放 `src/components/<name>/`。
- 文档站：`apps/docs-next`。

---

## 一、两条总原则

**原则 A：行为来自 ui-sdk，样式来自 StyleX。**

组件的状态、焦点、键盘、手势、弹层定位、无障碍属性，由 `@ui-sdk/vue/<primitive>`
提供；我们只传 `class` 和 `style`。样式只用 `stylex.create`。

**原则 B：没有「展示件所以可以自己写交互」这条路。**

一个组件只要可能被点击、聚焦、拖拽、键盘操作、承载子控件或切换状态，就按交互件写。
判断看它可能成为什么，不看它现在的 demo 长什么样：Badge 可以是可点的筛选标签，
Card 可以整块可点、可以拖拽排序，Steps 可以点某一步跳过去。

ui-sdk 没有现成原语时，按这个顺序走：

1. **拼组合**。很多「没有专门原语」的东西是几个原语拼出来的：列表行是 `listbox`
   的 item，可关闭标签是 `toggle` + `button`，分段切换是 `segmented-control`。
2. **用 foundation**。`@ui-sdk/core` 里手势有 `direct-manipulation`
   （`createSwipeActions` / `createArea` / `bindHold` / `bindRepeatPresses`），
   键盘和 roving focus 在 `foundation/focus`，列表语义在 `foundation/lists`
   （`listbox-behavior` / `listbox-keyboard` / `virtualizer`）。
3. **登记缺口**。前两步都不够，先在本文第六节「待补原语」写一行：缺什么、拿什么顶、
   为什么组合不够。写完再动手，组件顶部注释引用那一行。
4. 自己写 `ref` + `@click` 拼状态机，然后叫它「轻量实现」——不行。

### 两个反复踩的坑

**受控陷阱。** 给 ui-sdk 原语挂任何 `@update:*` 监听，它就变成受控件。只想要非受控时
不要挂，把 `$attrs` 原样透传即可。

**可选布尔。** Vue 会把省略的 `boolean` prop 变成 `false`。需要「没传就是没设」的语义时，
`withDefaults(defineProps<...>(), { open: undefined })`。

---

## 二、组件怎么写

1. 样式放同目录 `Xxx.styles.ts`：
   ```ts
   import * as stylex from '@stylexjs/stylex'
   import { color, motion, shape } from '../../theme/tokens.stylex'
   import { focus, glass } from '../../theme/shared.stylex'
   export const styles = stylex.create({ ... })
   ```
2. 组件是 SFC，行为来自 `@ui-sdk/vue/<primitive>`，样式用 `stylex.props(...)` 拼：
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
3. 类型放 `types.ts`。`<script setup>` 里的 `export type` 收不进 d.ts。
4. 组件名 `NvXxx`，从包 `src/index.ts` 具名导出。
5. 根组件 `defineOptions({ inheritAttrs: false })`，`$attrs` 透传给 ui-sdk 根件。

## 三、原生控件

组件包里不写 `<button>` / `<input>` / `<select>` / `<textarea>`。ui-sdk part 内部渲染的
不算，那种情况我们只传 class。

| 要什么 | 用什么 |
| --- | --- |
| 按钮、图标按钮、文本按钮 | `NvButton`（`variant="ghost"` / `size="sm"`） |
| 单行输入、跳页框、搜索框 | `NvInput` |
| 下拉、每页条数 | `NvSelect` + `NvSelectTrigger` / `NvSelectContent` / `NvSelectItem` |
| 复选 / 单选 / 开关 / 滑块 | `NvCheckbox` / `NvRadio` / `NvSwitch` / `NvSlider` |
| 可点击列表、可选行、树 | `listbox` / `tree` 原语 |
| 分段切换 | `segmented-control` |
| 触屏大按区 | `NvTouchButton` |

自查：

```bash
rg -n "<button|<input|<select|<textarea" packages/{desktop,mobile,pad,screen}/src --glob '*.vue'
```

## 四、视觉与交互契约

- **聚焦环**：输入件和动作件用 `focus.ring`（1px brand + 4px 柔光）；导航和选中行
  （tab、菜单项、列表行）用 `focus.subtle`（键盘聚焦时 1px）。环跟着可见控件的形状走，
  不画在触控区或外框上。
- **弹层**：一律 `glass.surface`。进出场用 ui-sdk 的 `data-starting-style` /
  `data-ending-style` 配 CSS 过渡，时长取 `motion.duration*`。
- **动效**：只用 CSS 过渡/动画和 ui-sdk 的 presence/gesture。不引 motion-v。
  `prefers-reduced-motion` 的降级由 `theme/motion-reset.css` 统一收口（构建时追加到
  `dist/style.css` 末尾），组件里不用逐个写。
- **令牌**：只用 `@nerv-ui/theme/tokens.stylex` 的变量。不写裸色值，不引旧 `--nv-*`。
- **填充色阶**：静止态填充用 `muted`，悬停/按下/键盘高亮用 `mutedStrong`。把 `muted`
  同时当静止态和 hover 会让次级按钮「点了没反应」；需要更深一级时不要自己 mix 颜色，
  报告缺令牌。**看不清优先查层级**：控件和它所在的表面亮度差不足 0.02 时，修的是表面
  色阶（或换到 card 表面），不是给控件加描边。
- **图标**：只用 `NvIcon`。

## 五、现代基线

本库只面向常青浏览器，不产出旧引擎的降级。

- 构建目标由根目录 `.browserslistrc` 决定：各浏览器最新两个大版本。
  lightningcss 因此不再生成 `lab()`/`color-mix` 的重复声明对。
- 直接用最新特性，不为它们写兜底：`oklch()`、`color-mix()`、`:has()`、`@starting-style`、
  `transition-behavior: allow-discrete`、`container queries`、`anchor positioning`、
  `view transitions`、`popover`。
- 不写厂商前缀。`backdrop-filter`、`mask-image`、`user-select` 在现代目标下都已无前缀；
  只有浏览器专有的伪元素选择器（`::-webkit-scrollbar`、`::-webkit-search-cancel-button`）
  和 Safari 专有属性（`-webkit-tap-highlight-color`）保留原样，因为它们没有标准替代。
- 降级只在语义层面做（例如 `prefers-reduced-motion` 关掉位移），不为老浏览器做语法降级。

## 六、不做的

- Tailwind 类、`<style scoped>`、`@layer`、reka-ui、`clsx` / `tailwind-merge`、`@lucide/vue`。
- 自己写状态机替代 ui-sdk 原语（见原则 B 的四步）。
- 改 `packages/theme`。缺令牌先报告，由主会话加。
- 从旧包 `@nerv-iip/*` 导入任何东西。
- 拿「演示里用不到」当理由，把组件写成不可交互。

## 七、待补原语

前两步拼不出来、暂时用别的办法顶着的，登记在这里。

| 组件 | 缺什么 | 当前替代 | 为什么组合不够 |
| --- | --- | --- | --- |
| （暂无） | | | |

## 八、验收

- 四包各自 `pnpm --filter @nerv-ui/<pkg> typecheck` 和 `build` 通过，产出 `dist/style.css`。
- docs-next 对应页面能用。
- 评审按本文第一、二、三节逐条对。当轮改完，不留到下一轮。
