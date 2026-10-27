# T08/R02 · Standards R1 四项返修证据

## 对象

- 仅 [#20](https://github.com/Mang-X/nerv-ui/issues/20) / [PR114](https://github.com/Mang-X/nerv-ui/pull/114) 的 `NvScreenFlowLinesBg`、`NvScreenIsometricBlocksBg` 及直接文档、宿主演示；PR 保持 draft，由父级另安排独立 R2。
- 实施 worktree `/Users/mang/Project/nerv-ui-worktrees/t08-r02-backgrounds`，分支 `feat/t08-r02-backgrounds`。R1 输入 HEAD `7b47741913fdec1166a1ff849bf8f62f7f1f039c`，tree `fd6d5d4b37dd54d756e6ddfc5bbcd5397f44e50e`；base `a422ffe9e735a81fd0d2251cf3aaf5d863d4b12b`，tree `6f088a1ffa5d7e77ed7938187ba660af2fee0eb1`。
- 本轮 fetch 后 `origin/integration/nerv-ui-extraction` 仍是上述 base，`git merge --no-edit` 为 `Already up to date`，无 delta。固定旧源 `79b1578f2b75f55709765b5e7882aaf33146c603` 只读；本轮不碰两个 main、P15 或 T3 自动 checkout。

## R1 finding → 返修

| Finding         | 实际改动                                                                                                                                                                                              | 可观察证据                                                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文档 DoD 与计数 | 四场景矩阵增两件；`DESIGN/components/screen-decorative-backgrounds.md` 给规则、判定、正反例；文档站页用 `ScreenDemo` 实时渲染并 `@include` 决策；两处活页从 34 更新为公开桶实际 36 件。冻结历史不改。 | 文档合同 RED 缺决策文件；GREEN 5 files / 15 tests。文档站 dev 目标页真实渲染 2 SVG，两个置于 SVG 之前的按钮点击后各从 0 到 1；截图 `docs-live.png`。 |
| screen 类名     | 两件根及 rail/main/flux/node/ping、grid/face/node 全部采用 `nv-scr-*`，相应 scoped 选择器和几何测试同步。                                                                                             | 两件公开 DOM 类前缀测试先 2 FAIL 后 PASS；原 `viewBox` / `slice`、2+4+6+8+3 与 20 网格/6 块体计数、双实例无 SVG id 继续通过。                        |
| 宿主可见文案    | `/#screen/backgrounds` 的标题说明、四卡文案和可访问名称改为中性视觉描述，四实例保留。                                                                                                                 | 宿主断言先 1 FAIL 后 9/9 PASS；真实窄视口截图和 4→0→4 生命周期。                                                                                     |
| 指针命中        | 两个根 SVG 默认 `pointer-events: none`；宿主 `class` / `style` 等属性透传不变，显式覆盖指针属性时由宿主负责层级。                                                                                     | 修前真实 `elementFromPoint` 在两件节点均命中 `circle.node`，下层按钮命中 false；修后两件均命中下层 `BUTTON` 且点击计数 +1。文档站运行中按钮也各 +1。 |

## fresh 门禁与浏览器

- `vp test run`：UI 5 files / 15 tests、宿主 1 file / 9 tests，exit 0；补强几何与 SVG 宿主属性断言后单文件 7/7 exit 0。jsdom `Could not parse CSS stylesheet` 原样保留；CLI 无 JSON skipped 字段，记字段缺失。
- UI、playground `vue-tsc --noEmit -p tsconfig.json` 各 exit 0；受影响 `vp lint`、11 份前端源码/人工文档 `vp fmt --check`、4 个相对链接与 include、`git diff --check` exit 0。矩阵原基线含一行未格式化，本次触及矩阵后按 formatter 整页格式化；旧 R1 全局 fmt 原始四文件 FAIL 保留，不把它改写成历史 PASS。
- playground `vp build` exit 0，5618 modules，保留 `crypto` externalized、Rolldown annotation 和大 chunk 告警。真实生产预览 2300×1225 与 720×900、深浅宿主下 4 SVG、0 SVG id；正常流光和节点动画存在；系统低动效隐藏流光/扩散环、停止两类节点动画，静态线框/网格/块体仍可见；离页/重入 4→0→4。窄视口 `scrollWidth=720`。
- fresh dist 入口 `index-C0b_wX_s.js`：HTTP 200 `text/javascript`，1,176,886 bytes，SHA-256 `9a59db8be02c17aee5d8da37fdc58cf94ed85ed34aa5e090194f51f4ce67a24f`；`index-CRaP7A_V.css`：HTTP 200 `text/css`，339,549 bytes，SHA-256 `18b59de95f125d7418d133ced1cc17ee264c8895c35b08b2cba60b995d535dca`。各 response body 与对应 fresh dist `cmp` exit 0，仅限定这两个实际请求资产。
- 完整文档站 `vitepress build docs` exit 1：现有别名将 `@nerv-iip/ui/schedule-model` 解析为 `src/index.ts/schedule-model` (`ENOTDIR`)。该失败与新页 dev runtime PASS 分列，未改 #10 工程配置。文档站运行使用同版 VitePress 的既有依赖临时链接，已清理；不是独立安装证明。

## 继承、历史 FAIL 与未运行

- lock、manifest、Vue 版本未改：`frontend/pnpm-lock.yaml` 与 base 同 blob `8db34ddd72b1df0c29f0a029f9184643becc60da`；R1 的 5 importer / 973 package / 973 snapshot 完整对象结果只有限继承，不称本轮 fresh packed 验收。
- R1 全局 frontend fmt exit 1 的四个基线同 blob 文件、`origin/main...HEAD` 历史 raw diff-check exit 2 与本票 diff-check exit 0 均保留。当前 coverage 因本票矩阵需求已修改并格式化，另外三个旧全局 fmt 文件未顺修。最初 pnpm 12 拒绝、pnpm 11 外部缓存 symlink 拒绝也仍为 R1 记录，不冒称本轮出现。
- T3 preview snapshot 同一步连续两次 `Preview automation snapshot timed out after 15000ms.`，随后用 ego-browser 完成真浏览器验证；首个修后按钮探针因舞台缩放坐标未换算，命中 `SECTION` 且点击 0，修正探针坐标后的结果单列保留。
- CI 检查、packed #11、设备、旧消费者、父 #9 组合、生产与 DHTMLX 授权本轮 UNRUN/UNKNOWN；完整文档站 build 实际 FAIL，不能写 UNRUN。#12–#16 已 NOT_PLANNED 取消，不作 gate。未读取旧应用全栈，也未运行其测试。

原 R1 FAIL 和本轮各 RED/GREEN、截图、HTTP 响应头、文档站 build 原始输出位于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t08-r02-standards-fix/`，与 R1 独立回执分别保存。该目录仅归档差异证据，无 `dist`、cache、`node_modules` 或 checkout 副本。
