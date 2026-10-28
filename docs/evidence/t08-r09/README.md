# T08/R09 实施候选证据

仅 #27，scope:M，独立 Draft 候选。唯一目录 `/Users/mang/Project/nerv-ui-worktrees/t07-p13-async-candidates`，分支 `feat/t08-r09-virtual-status-wall`。初始 clean；base `0072c1cec946b05a5744ae95f54097d608c12ef9` / tree `7dcc5dd72a51f6e96b55964f5ddd2ce14c6551d9`。交付 head/tree/最终 clean 回执见外部 handoff，避免提交自引用。最新 integration fetch 与 base 相同，无 delta。

## 来源与边界

T01 固定来源 `79b1578f2b75f55709765b5e7882aaf33146c603`；未改 source/reference 字节，最小来源清单与 SHA-256 见 [source-hashes](raw/source-hashes.json)。完整读取 DeviceStatusWall 的 script/template/CSS（含虚拟几何、分组、hover/select），layout 常量及原 layout 测试、contracts、fetcher、paramColors；直接页 equipment.vue 200–235、mock 345–385 和 650–695 有界读取。未逐行读取其余页、real adapter/SDK、全部 mock/历史研究原始记录；当前 #27/#9 票面、R09 判定与冻结命名 map 是本轮范围依据。

| 来源能力                            | 本轮处置                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| flat 6 列 / 122+12px / overscan 2   | 库复用真实 useVirtualList；不 stub 固定窗口                                  |
| workshop 紧凑格 / line 横向 chip    | 中性 group key/label + group-grid/group-chip；全部 DOM，非虚拟化             |
| id / name / code / scope            | 库 key/label/identity/group；宿主生成中性来源身份，无 Device 或 factory 契约 |
| hover/select/visible/scroll hide    | 库 preview/select/visible；保留入口，focus/Escape/disabled 补齐              |
| params/block/counts/paramColors     | 宿主提供简短纯文本 summary 与显式 status label/tone；不迁移统计或参数规则    |
| fetchDeviceDetail、防抖、缓存       | 库零取数；fake 延迟只在宿主，提交核 item/context/revision/request/mode       |
| 原 tooltip 趋势/维修/保养/MTBF/MTTR | 本票不迁移；完整详情/参数与 mini spark 归 #28，不提前造 portal               |

复用盘点：ScreenScrollArea 是普通滚动容器，ScrollBoard 是自动轮巡，移动 VirtualList 属移动表面；没有本墙的六列状态分组接缝。复用既有 StatusTag、Panel、Scaler 和 screen token。公开 `NvScreenStatusWall` 按 R1–R5 归 screen Status 家族；A4、严格合同、实际 barrel、coverage、API/live、决策与导航已同步，计数从 index.ts 的真实具名组件导出推导为 42。无依赖或 lockfile 改动、shadcn 冻结改动、私有路径、SDK/auth、设备 fetch 或领域算法。

## Requirement coverage

下列测试名均为精确 it 名；完整名称和结构化统计见 [test-summary](raw/test-summary.json)。

| 要求                                                           | 测试证据及阶段                                                                                                                                                                                                 |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| flat 有限 DOM / stride / 首尾 / visible                        | `bounds flat DOM with real virtual rows and reaches both ends at the rendered stride`；RED→GREEN；6000 项，受控 clientHeight=268，断言 ≤42 按钮及最后 key                                                      |
| 分组密度、同名身份、选择、零/未知、disabled、scroll/items 关闭 | `preserves identity selection zero unknown groups and closes preview for scroll replacement mode and disabled hover`；RED→GREEN                                                                                |
| 同 key 新内容、mode、双实例、卸载                              | `invalidates same key new content and isolates two instances and unmount`；RED→GREEN                                                                                                                           |
| key 重排/删除、组命名空间、末尾换短列表、空/visible、Escape    | `keeps group namespaces separate and updates keyed content through reorder deletion and short flat replacement`；GREEN-only                                                                                    |
| 两个中性来源 / fake 延迟 / 更新与模式滚动离页                  | `shows two neutral sources and only commits the current delayed preview after replacement mode scroll and unmount`；宿主 RED 为缺少 Demo 模块（no tests），后 GREEN；组件 scroll→null 与宿主 null 隔离组合验证 |
| 不服从取消的旧成功/失败不得回流、当前失败                      | `rejects stale success and failure even when the loader ignores cancellation`；GREEN-only                                                                                                                      |
| 命名、文档覆盖、现有舞台和 import                              | strict naming/doc coverage + ScreenDemo/import contracts；GREEN-only，非新增行为 RED                                                                                                                           |

原始 RED：公共 3 failed，exit 1；首轮 GREEN 2 passed/1 failed（短列表测试未等 Vue mounted nextTick），exit 1，修正等待后 3 passed。宿主 RED 模块缺失 exit 1；首轮宿主 1 failed（事件后未等渲染），exit 1；修正 nextTick 后 2 passed。所有失败日志保留。另一次读取命令用了 zsh 特殊变量 path，导致后续命令找不到，exit 127；未改仓库，使用 rule_file 重跑成功，不当作门禁 PASS。

最终 fresh：公共/治理 253/253（3 files），宿主/导航/import 107/107（3 files）；两包 typecheck 和 playground build exit 0。全部是 DOM/受控平台测量，非真实 resize/命中/视觉证明。完整 argv/cwd、独立 exit 与格式/链接结果见外部 handoff 和 raw。结构化 runtime/unhandled 字段缺失为 UNKNOWN，未填 0；日志中的 jsdom CSS parse 和第三方 PURE annotation 警告保留。

浏览器、server、preview、Ego、Playwright 均未启动；browser/visual/HTTP/device/vendor/packed/旧 consumer/production/CI/review UNRUN。四 vendor policy 为 0 执行，非 PASS。全局 fmt3、docs alias ENOTDIR、main RAW2、历史 timeout 未重跑/未修，仅属用户指出的继承背景。本轮局部检查不宣称这些通过。旧应用接入/旧库退出取消为 NOT_PLANNED；#28 和排程未实施。#27 保持 Open，PR 保持 Draft，未自签整票、未审核/合并/关闭/发布验收评论。
