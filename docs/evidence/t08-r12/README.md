# T08/R12 阶段数量流实施证据

候选对应 [#30](https://github.com/Mang-X/nerv-ui/issues/30)，scope:M，单个只读展示接缝。基于 integration `d7513246109a2a9c3da38cf7d016d2028375d9d8`，tree `7cecd4bd54acd69fde21799835ab624175d9385a`；最终提交、tree、干净状态、命令和日志归档于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t08-r12-implementation-r1/handoff.md`。父席另行安排独立审核；本记录不是审核、合并或 tracker 完成证据。

## 来源与实现

固定旧提交 `79b1578f2b75f55709765b5e7882aaf33146c603`，`frontend/apps/screen/src/pages/line/[id].vue:358–385` 的 `lb-wo-flow`、station 与 arrow；CSS 在 1112–1171 附近。新库素材 [line 页](../../../migration/materials/source/frontend/apps/screen/src/pages/line/[id].vue) 与固定旧提交读取结果逐字节一致：34037 字节，SHA256 `e94b5897088107b4b3d563b0814a397671044b46e6a8e488dd113636c1fe1216`，匹配 `migration/t01/provenance.jsonl` 第 1636 行。本轮未改素材、原库或旧 R14 证据。

| 来源能力                                          | 公共接缝与处置                                                                                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `s.name` / `s.done`                               | `ScreenStage.key/label/value`，key 由宿主提供，不用名称当身份；最多三位小数，仅改变显示                                                             |
| `s.state` 的 blocked/停摆、bottleneck/瓶颈        | 仅旧宿主适配：blocked → `{label:'停摆',tone:'red'}`，bottleneck → `{label:'瓶颈',tone:'amber'}`；公共件无这些状态词或规则，复用 `NvScreenStatusTag` |
| 水平分布、66px 基准、10px 间距、12.5/16/15px 字号 | `NvScreenStageFlow` flex 分布与换行；长名称、长状态不截断；数值 tabular-nums，色调复用既有 screen token                                             |
| 相邻 `›`，最后项不显示                            | `connector` 默认 `›`，可替换或隐藏，空/单项没有连接符                                                                                               |
| `qtyDone/qtyPlan/wip`、工序差值和领域判断         | 留宿主，本票不迁入，不计算 WIP、瓶颈或完成状态                                                                                                      |

公共 API、live 示例与设计决策见[阶段数量流](../../../frontend/apps/design-system/docs/components/screen/stage-flow.md)。`/#screen/stage-flow` 宿主保留旧导航、Scaler 和 aria-current，展示阅读活动与展览布置两类来源，支持替换、反转、清空、恢复、长文字和窄幅显示。无 DTO、SDK、认证、router 或业务算法依赖；无冻结 shadcn primitive 改动，无依赖安装或升级。

## 验收接缝与 fresh 结果

| Requirement                                   | Evidence                                                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 数量/显式状态/只读/相邻连接符                 | `shows host labels and quantities without inventing status or unknown values`：0、-2.1256 → -2.126、null → —；显示宿主状态，不产生按钮、链接或 tabindex         |
| key 身份、重排/替换、空/单、多项、长名称/状态 | `keeps keyed stages and host data intact through reorder replacement empty and single states`：同名项重排保留 DOM 身份，源值未改，长文字完整，空/单项无尾连接符 |
| 非法运行时值与隐藏连接符                      | `rejects non numeric runtime quantities and allows explicitly hidden connectors`：NaN、±Infinity、字符串、undefined 均 —，缺省状态不补标签                      |
| 可操作中性宿主                                | `lets the host switch replace reorder clear and restore quantities`：两个领域、替换/反转、0/负值/未知、长状态、清空/恢复                                        |
| 深链与既有导航保留                            | `opens the stage quantity deep link and preserves existing stage navigation`：正确 aria-current、切回旧舞台卸载组件，既有主灯入口仍可达                         |
| 公共命名与文档                                | 严格 Nv 导出集合、A.4 映射、coverage、设计决策/API/live/nav/当前导出计数同步；实际 producer 39 件                                                               |

公共首个 RED（缺少导出，1 test failed，exit 1）→ GREEN（1 passed，exit 0）；宿主 RED（组件尚不存在，套件加载失败，exit 1）→ GREEN（1 passed，exit 0）。首个公共命令因 cwd 路径错误没有创建测试，属于无效 RED，日志保留，不当作能力失败。两处测试代码类型错误首次 exit 2，修正后 types exit 0，首次失败仍保留。

最终 focused 公共/治理、宿主/导航测试、两包 types、playground build、scoped fmt/lint、人工 Markdown 相对链接及 diff-check 的精确命令、退出码和 JSON 字段见 durable handoff。JSON 未提供字段写缺失，不补 0。构建保留已有第三方 PURE annotation 警告。

## 证据边界

- fresh：公共 DOM 行为、类型、构建、scoped 格式/lint、来源字节对照、链接核验与样式结构审读。CSS 只有结构审读，不据此声称真实窄宽或视觉 PASS。
- 继承：既有 Scaler、StatusTag、token、旧组件同字节只支持有限来源复用，不是本轮浏览器 fresh 证据。
- UNRUN：浏览器、视觉、截图、HTTP、真实设备、完整测试桶、完整文档站 build、发布包/外部安装、CI、旧消费者接入、合并与关闭。用户本轮未授权浏览器工作，未启动 server 或调用 preview。
- 历史 FAIL：全局 3 项 base fmt/main raw 2 项，以及完整文档站 build 的 schedule-model alias ENOTDIR 继续归对应 owner（#10 等），本票不扩修；本轮未重跑，不能改记 PASS。
- 4 条 vendor policy lane 历史 skip：本轮零执行，不继承为 PASS。授权与发布限制 UNKNOWN；本票不更改许可。
