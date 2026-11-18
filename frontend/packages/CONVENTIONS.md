# @nerv-ui 新库约定（R1 起）

本文件是 `@nerv-ui` 四包（desktop / mobile / pad / screen）的**唯一编写规范**。
它约束的是「怎么写」，视觉与令牌的事实源在 `DESIGN.md`；两者冲突时以 `DESIGN.md` 的
令牌定义为准，以本文件的写法为准。

## 包结构
- `@nerv-ui/theme`：StyleX 变量（`tokens.stylex.ts`）、共享样式片段（`shared.stylex.ts`）、
  图标表（`icons.ts` + `NvIcon.vue`）。
- `@nerv-ui/desktop` / `mobile` / `pad` / `screen`：按形态的组件包，各自 `src/components/<name>/`。
- 文档站：`apps/docs-next`（VitePress Custom Theme，从零）。

---

## 一、两条不可让步的总原则

**原则 A：行为来自 ui-sdk，样式来自 StyleX。**
组件的状态机、焦点管理、键盘与手势、弹层定位、无障碍属性，**全部**由
`@ui-sdk/vue/<primitive>` 或其 part 提供；我们只负责传 `class` 和 `style`。
视觉层只用 `stylex.create` 生成原子类，不用任何其他样式方案。

**原则 B：交互不属于「展示件」的豁免理由。**
不存在「这个组件是展示件所以可以自己写交互」这条出路。任何一个组件，只要在**任何
合理场景**里可能被点击、聚焦、拖拽、键盘操作、承载子控件或状态切换，就必须按交互件
的路径写：接 ui-sdk 原语。

判断标准是「**它可能成为什么**」，不是「它现在的 demo 长什么样」。Badge 现在是纯文本，
但徽标可以做可点击的筛选标签、可以做状态指示器、可以带关闭按钮；Card 现在是容器，但
卡片可以整块可点、可以拖拽排序、可以展开收起。**按最丰富的那个形态预留原语路径**，
而不是按最简陋的 demo 把门焊死。

**ui-sdk 没有对应原语时怎么办**（按顺序，不允许跳步）：

1. 先找 ui-sdk 的**组合**：很多「没有专门原语」的组件其实是几个原语的组合
   （如列表行 = `listbox` 的 item，可关闭标签 = `toggle` + `button`，分段控件 =
   `segmented-control`）。
2. 再看 `@ui-sdk/core` 的 **foundation**：手势用 `direct-manipulation`（`createSwipeActions`
   / `createArea` / `bindHold` / `bindRepeatPresses`）、键盘与 roving focus 用
   `foundation/focus`、列表语义用 `foundation/lists`（`listbox-behavior` /
   `listbox-keyboard` / `virtualizer`）。
3. 仍然没有 → **在写组件之前**先在 `CONVENTIONS.md` 的「待补原语」一节登记一条，
   写清楚：缺什么原语、打算用什么替代、为什么现有组合不够。然后才动手，并在组件顶部
   注释里引用这一条。
4. 绝对不允许：自己写 `ref` + `@click` 拼一个状态机，然后称之为「轻量实现」。

---

## 二、组件写法（唯一模式）

1. 样式放同目录 `Xxx.styles.ts`（**不要**用 SFC `<style>`）：
   ```ts
   import * as stylex from '@stylexjs/stylex'
   import { color, motion, shape } from '../../theme/tokens.stylex'
   import { focus, glass } from '../../theme/shared.stylex'
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
5. 根组件 `defineOptions({ inheritAttrs: false })`，把 `$attrs` 原样透传给 ui-sdk 根件。

## 三、原生控件

**组件包里不允许出现 `<button>` / `<input>` / `<select>` / `<textarea>`。**
（ui-sdk part 内部渲染的不算——我们只负责传 class。）

| 需求 | 用什么 |
| --- | --- |
| 按钮、图标按钮、文本按钮 | `NvButton`（`variant="ghost"` / `size="sm"`） |
| 单行输入、跳页框、搜索框 | `NvInput` |
| 下拉、每页条数选择 | `NvSelect` + `NvSelectTrigger` / `NvSelectContent` / `NvSelectItem` |
| 复选 / 单选 / 开关 / 滑块 | `NvCheckbox` / `NvRadio` / `NvSwitch` / `NvSlider` |
| 可点击列表、可选行、树 | `listbox` / `tree` 原语 |
| 分段切换 | `segmented-control`（不是自绘一排按钮） |
| 触屏大按区 | `NvTouchButton` |
| ui-sdk 已提供的部件 | 直接用 `@ui-sdk/vue/<primitive>` 的 part |

自查（纯文本，不设脚本门禁）：

```bash
rg -n "<button|<input|<select|<textarea" packages/{desktop,mobile,pad,screen}/src --glob '*.vue'
```

## 四、视觉与交互契约

- **聚焦环**：输入件/动作件用 `focus.ring`（1px brand + 4px 柔光）；导航/选中行
  （tab、菜单项、列表行）用 `focus.subtle`（仅键盘 1px）。环跟随可见控件形状，
  不画在触控区/外框上。
- **弹层**：一律 `glass.surface`（`blur(16px) saturate(1.6)` + 半透明），进入/退出用
  ui-sdk 的 `data-starting-style` / `data-ending-style` + CSS 过渡，时长取 `motion.duration*`。
- **动效**：只用 CSS 过渡/动画与 ui-sdk 的 presence/gesture；**不引入 motion-v**。
  每个动画都要有 `prefers-reduced-motion` 降级。
- **令牌**：一律用 `@nerv-ui/theme/tokens.stylex` 的变量；不新增裸色值，不引用旧 `--nv-*`。
- **图标**：只用 `NvIcon`（`@nerv-ui/theme/icons.ts`），不用任何第三方图标库。

## 五、禁止

- Tailwind 类、`<style scoped>`、`@layer`、reka-ui、`clsx` / `tailwind-merge`、`@lucide/vue`。
- 自写状态机替代 ui-sdk 原语（见原则 B 的四步）。
- 修改 `packages/theme`（共享层由主会话维护；缺令牌先报告）。
- 从旧包 `@nerv-iip/*` 导入任何东西。
- 以「演示里用不到」为理由把组件写成不可交互。

## 六、待补原语（写组件前先登记）

| 组件 | 缺什么 | 当前替代 | 原因 |
| --- | --- | --- | --- |
| （暂无） | | | |

## 七、验收

- 每个包：`pnpm --filter @nerv-ui/<pkg> typecheck` 与 `build` 通过，`dist/style.css` 生成。
- docs-next 对应页面能用，且页面内无 `svg.lucide`、无 Tailwind 类。
- 评审时按本文件第一、二、三节逐条核对；不满足的当轮改完，不留到下一轮。
