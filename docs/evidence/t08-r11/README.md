# T08/R11 分档热力格实施证据

对应 [#29](https://github.com/Mang-X/nerv-ui/issues/29)，scope:M，单 PR，一个只读分档展示接缝。基线 integration `7dace369192c7eb2612be75525ce5e483222b696`，tree `8bc311ec78904920b134b3a6885c4e64363f5f95`。最终 head/tree、退出码与归档 SHA 见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t08-r11-implementation-r1/handoff.md`。保持 draft，父席安排独立审核；不合并或关闭 tracker。

## 来源与边界

固定旧提交 `79b1578f2b75f55709765b5e7882aaf33146c603` 的 `frontend/apps/screen/src/pages/line/[id].vue`：113–130 分档与悬停状态、397–425 waffle、1010–1081 样式。本轮核读这些片段；[复制素材](../../../migration/materials/source/frontend/apps/screen/src/pages/line/[id].vue) 34037 bytes，SHA256 `e94b5897088107b4b3d563b0814a397671044b46e6a8e488dd113636c1fe1216`，与 provenance 的 blob `1874c94ded36ef25781be8b264fbb5926a6a5e97` 对照。旧 checkout 固定 HEAD；本轮不改素材、旧消费者或历史证据。

| 来源能力                                     | 新接缝与宿主责任                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 4×6 waffle 与按值着色                        | `NvScreenHeatmap` 的 cells、columns、thresholds、below；24/6 和 12/4 两个中性宿主                            |
| ≥85/≥70/≥55/<55 OEE 档位                     | 只在宿主适配说明显式输入，保留 >= 下界 / < 上界；库无业务常量                                                |
| wTip 小时/OEE 值                             | 稳定 key 指向当前 props；hover/focus 共用提示、替换/移除清理、局部 ID 关联                                   |
| waffleHour 当前小时推算                      | 删除组件内时钟；label/axisStart/axisEnd 全由 host 提供纯文本                                                 |
| 颜色与图例、11px 轴标                        | screen token 分档填色 + 文字标签；紧凑 44px 格高、18px 图例/提示；全文提示在文档流内，避免浮层裁切和坐标耦合 |
| board/SDK/auth/router/领域聚合、设备折叠面板 | 留宿主；R10 参数、排程与其他 UI 不迁入                                                                       |

公共 API/live/设计决策见[分档热力格](../../../frontend/apps/design-system/docs/components/screen/heatmap.md)，独立入口 `/#screen/heatmap`；复用现有 Panel/Scaler，旧导航保留。无 shadcn primitive、依赖版本或 lockfile 改动。

## 验收接缝

| Requirement                                      | Evidence                                                                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| 阈值前/等于/后，0/未知与只读                     | `exports a read only heatmap and preserves threshold boundaries zero and unknown`                                                |
| hover/focus 当前 key、替换、删除、双实例、Escape | `shows the current keyed value for hover focus replacement removal and independent instances`                                    |
| 4×6/另一 grid、空/单、非法数、无效分档与输入不变 | `renders alternate grids empty single nonfinite values and rejects ambiguous scales without mutation`                            |
| 独立 Vue roots 与重挂载 ID                       | `keeps tooltip descriptions local across independent Vue roots and remounts`（新增回归先复现重复 ID，RED 1 fail/3 pass，后修正） |
| 双中性宿主与控件                                 | `keeps two neutral host meanings visible and controls data grids empty unknown and scale replacement`                            |
| 导航/Scaler/current 与旧入口保留                 | `routes the heatmap through the scaler with one current link and preserves previous screen navigation`                           |

公开首个有效 RED 为缺导出断言失败（1/1，exit 1），随后 GREEN 1/1；扩展公开测试 4/4。宿主 RED 为组件不存在导致加载失败，exit 1，未发现测试，随后 GREEN 1/1。首次命令 cwd 路径错误导致未创建测试，不计有效 RED。精确最终命令、结果与历史失败保留在 durable handoff。

## 证据边界

本轮 fresh 范围限 focused DOM/契约、types、playground build、scoped 源码格式/lint 和全部本轮手写 Markdown 格式/相对链接。DOM 和样式审读不作为真实窄宽/视距/视觉/浏览器 PASS。browser/visual/HTTP、preview、完整 docs、CI、产物安装、四 vendor lanes 均 UNRUN（四 vendor policy 零执行）。未启动服务器或浏览器。

继承已知基线：全局 fmt 3 项、main raw 2 项及 full docs base alias schedule-model ENOTDIR 由 #10 处理，本轮未重跑/未修，不冒充 fresh。四类旧应用接入及旧库退出为 NOT_PLANNED；#6 已关闭不代表 R11 浏览器验收。本轮仅核读 R11 来源与必要 producer，未逐行复核全部材料或其它业务页。

最终 fresh：公共/治理 282/282（5 files）、宿主/导航/import 86/86（3 files），均 exit 0；两包 typecheck、playground build、18 个变更文件 scoped fmt、scoped lint、9 份手写 Markdown 的 86 条相对链接及 include 检查均 exit 0。producer 实数 40。JSON 的 `numRuntimeErrorTestSuites` 与 `unhandledErrors` 字段缺失，未填 0；完整日志无未处理异常段，保留 jsdom CSS parse 与第三方 PURE annotation 警告。

另保留首次类型失败：从仓库根调用 workspace 脚本缺 vue-tsc（外层 exit 1，内层 127），改到 frontend 后 ui types PASS；host types 曾因新测试 `get().exists()` 不合法而 exit 2，改用 `find().exists()` 后 PASS。首个无效 RED 的路径错误、独立 roots 的真实重复 ID RED 均在交接中保留。fetch 后 integration 仍为上述基线，merge 输出 Already up to date，无重置或继承新 delta。
