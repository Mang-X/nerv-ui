# 聚焦环（focus ring）设计评审 — 输入件

日期：2026-11-17 · 评审范围：desktop 输入件（NvInput / NvSelect / NvCombobox / NvSearchSelect / NvDatePicker）的键盘与点击聚焦视觉。· 依据：`foundations/philosophy.md` + `foundations/tokens.md`（权威）、dev server `http://localhost:5180`（VitePress，serve 主 checkout `main`）实测。

## 现状（实测）

`main` 上所有输入件共用一个契约：`.nv-focusable` + `--nv-focus-ring`（`theme.css`，nv-components 层）：

```css
--nv-focus-ring:
  0 0 0 3px color-mix(in oklch, var(--nv-brand) 22%, transparent),
  0 1px 2px 0 color-mix(in oklch, black 6%, transparent);
```

实测（DOM computed，亮色）：`.nv-input:focus-within` →
`box-shadow: oklch(0.54 0.16 256 / 0.22) 0 0 0 3px, oklch(0 0 0 / 0.06) 0 1px 2px`，`border-color` 保持 `--input`（`0.922`）不动。NvSelectTrigger 同值。其他输入件（combobox/search-select/date-picker）共享 `.nv-focusable`，无组件级例外。

截图证据：`focus-ring-current-zoom.png`（聚焦后的 NvInput —— 环几乎不可见）。

## 候选方向实测

探针页 `probe.html`（亮）/ `p2.html`（暗）加载真实 `theme.css`（`--nv-brand` oklch 0.54/0.64 · 0.16/0.15 · 256），截图：`focus-ring-abc-light.png` / `focus-ring-abc-dark.png`。

| 方向 | 实现 | 亮色观感 | 暗色观感 |
| --- | --- | --- | --- |
| **A** 现契约 | `3px brand22%` 光晕 + `black6%` 内阴影，border 不动 | 一圈灰雾，色相几乎读不出；截图上接近「无反馈」 | 同样几乎消失——在 `--card` 0.205 底上 22% 的 brand 只剩微弱亮边 |
| **B** 实线环 | `outline: 2px solid var(--nv-brand)`（等价 `ring-2`） | 干净利落的实色蓝环，最像 Ant/Arco | 同样醒目；但相对朴素——纯实线，少了这套系统惯用的层次 |
| **C** 细环+微光 | `0 0 0 1px brand` + `0 0 0 4px brand18%` | 实线内环给锐度，外圈 18% 晕给层次与「品牌色的光」 | 内环仍锐利，外晕在深底上恰好是「发光」而不脏 |

## 评审（对设计哲学）

- **「品牌强调色是动态色」+「真实可读」**：`--nv-brand` 是整套系统的唯一强调色；聚焦态是输入件上 brand 出现频率最高的时刻。A 把它稀释到 22%，在亮暗两态都读不出「这是我们的蓝」——与「动态色、品牌强调」的哲学矛盾；用户反馈「蓝色太淡」实测成立。
- **「引导，而非说明书」/「更快、更准、更少出错」**：聚焦指示的功能性是可发现性。A 在亮态下与 `--border` 的灰度差太小，对「快速定位当前焦点」这一任务帮助最弱；B/C 都过关。
- **「克制的工艺感」**：A 的「光晕+内阴影」是这套克制路线的体现，但克制到失真；B 最克制（一条线），但放弃了层次感；C 在两层结构里兼顾锐度与品牌色的柔光，更贴这套系统的质感语言（类似 `--nv-shadow-glow-brand` 的思路：实线+色光）。
- **亮暗一致性**：OKLCH 动态色下 brand 在暗态升到 0.64 亮度，C 的 1px 实线在暗态依然锐利；B 的 2px 实线在暗态略重但仍好读；A 在暗态同样失败。

## 推荐：方向 C

**`box-shadow: 0 0 0 1px var(--nv-brand), 0 0 0 4px color-mix(in oklch, var(--nv-brand) 18%, transparent)`**（写入 `--nv-focus-ring`，组件不动）。

一句依据：聚焦是输入件上「品牌强调」的落点，哲学要求它**读得出品牌色且保持克制质感**——C 的实线内环满足「强调」，18% 外晕满足「克制的光」，A 只做到了后者、丢了前者，B 只做到了前者、丢了后者。

- 亮态：实线蓝环 + 极浅蓝光晕，清晰、有层次、不吵。
- 暗态：实线环仍锐利，外晕在深底上转为「发光」质感，不脏不糊。
- `invalid` 变体沿用同一配方换 `--destructive`（`--nv-focus-ring-destructive`）。
- 需要强态（hero / 激活强调面）时 `--nv-focus-ring-strong` 同步换同配方 1px+4px 22%。

## hover → focus 过渡

现状：hover 只把 border 换 `foreground/20`（中性灰加深），focus 叠加 box-shadow，border 保持 `--input` —— 过渡「无色」，和谐但少信息。

建议（随 C）：focus 时 border 同步变 `brand`（1px→1px，无宽度跳变），hover 的 `border-foreground/20` → focus 的 `border-brand` 是单点颜色过渡，走现有 `transition: border-color 150ms --nv-ease-out-quart + box-shadow`，观感为「灰边淡入成蓝边+光晕」——连贯，且复用了 Select `data-[state=open]:border-brand` 已有的语言（Select 打开态已是蓝边）。键盘 `focus-visible` 与 click `focus-within` 同构，与现有契约一致。

## 结论

- 推荐：**C — 1px 实线 brand 内环 + 4px brand 18% 外晕**，落到 `--nv-focus-ring`（一处改，所有 `.nv-focusable` 输入件生效）。
- 次选：B（若想要最朴素 Ant 风），但建议至少保留外晕以维持这套系统的质感签名。
- 不推荐：A——实测亮暗两态都「读不到品牌色」，用户反馈成立。

## 未实测 / 注意

- `touch`/`screen` 表面也消费 `.nv-focusable`（TouchButton、ScreenInput 等）——换 `--nv-focus-ring` 会一起改；`--nv-scr-*` 大屏有独立令牌层，若需独立观感另议（本次任务只评 desktop）。
- `focus-ring-strong` 已有同名变体（30%），建议同步同配方升级以免两处观感分叉。
- NvCombobox/NvSearchSelect 在**本 worktree** 仍是原版 `focus-visible:ring-ring/50`（灰环）——main 已统一到 `.nv-focusable`，worktree 分支落后，评审以 dev server(main) 为准。
