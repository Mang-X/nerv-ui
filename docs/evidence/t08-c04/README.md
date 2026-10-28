# T08/C04 实施证据

scope:M，#40 独立 draft PR，目标 integration/nerv-ui-extraction。旧应用接入退出 NOT_PLANNED；#43/PR122 键盘浏览器 AC 仍 UNRUN，保持 draft open，不在本票改动。

基线 HEAD `92efa820cd90d5baa13c073534b44374f61443f3`，tree `181189bd08ac11c0af5d3416d1240199edfeff05`，开工 clean。来源固定 `79b1578f2b75f55709765b5e7882aaf33146c603`；仅活动宿主、文档和本目录变动，原始材料及冻结集合无修改。最新 integration fetch 无 delta。最终提交/head/tree/clean 见仓外 handoff。

## 来源与消费者处置

| source input / event / slot                                                         | 中性处置                                                                             |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| warehouse.vue：board/ops 独立 freshness、任务 ScrollBoard #row、WCS chart/list 点击 | 当前来源时间戳与 host 时钟；自动动态列表；distribution 同一输入图/明细，不保留旧副本 |
| quality.vue：主次 KPI、静态积压、Trend 阈值和 series、Pareto                        | 阅读报名/展览作品独立事实；宿主准备 actual/threshold/layers/ranking，库不推业务计算  |
| workshop/index.vue 与 [id].vue：入口密度、分栏与详情                                | 单入口日历、多入口布展/预约/目录；受控 entry 请求由示例回显                          |
| 原业务 fetchers、stores、认证、SDK、路由详情                                        | 不迁入；原消费者不修改，旧应用接入 NOT_PLANNED                                       |

## Requirement | Evidence

| Requirement                                             | Evidence（精确 test 名）                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 真实分页、拒绝请求、同 key 替换与缩总数                 | `paginates actual identities and rejects requests until the host accepts them`                  |
| 当前图/明细来源、0/unknown/empty/error/stale            | `uses current source for chart and detail and distinguishes zero unknown empty error and stale` |
| 来源切换晚回、失败保留、空成功                          | `ignores late updates after source switch and shows rejected updates without inventing data`    |
| 重叠请求与卸载身份隔离                                  | `applies only the latest successful update and ignores completion after unmount`                |
| 固定高分栏/内滚、长文本、编号、主次 KPI、单多入口       | ScreenDashboardRecipe.vue 与 dashboardInput.ts 源码；视觉/浏览器 UNRUN                          |
| 自动行与静态队列、趋势/阈值/分层/Pareto/Donut/Freshness | 主桶实际组合；UI affected 测试独立报告，不等价浏览器                                            |

## 命令与结果

所有命令 cwd 为指定 checkout，包命令通过 `-C frontend/apps/playground`（UI 用 `-C frontend/packages/ui`）。正式工具为已缓存 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`，未安装升级依赖。首次默认 pnpm 12.0.0 非正式，保留 red-1/green-1；不能作为正式门禁。

- `exec vp test run src/screen/ScreenDashboardRecipe.test.ts src/screen/ScreenDashboardDemo.test.ts src/ScreenDemo.test.ts --reporter=json --outputFile=../../../docs/evidence/t08-c04/green-4.json`：最终结果见 JSON 与同名 log，实际 exit 记录在 handoff。
- RED：red-1 缺 recipe 实现失败（还执行了既有宿主 tests）；red-host-1 是错误 cwd setup 路径失败，不作为行为 RED。red-host-2 为正确包 cwd 缺 host 实现失败。全部保留不覆盖。
- `typecheck`、`build`、限定 `exec vp lint` 与 `exec vp fmt --check`：各轮独立 log。build 有既有依赖警告，保留原件。
- JSON 只使用实际字段 success/numPassedTests/numFailedTests；runtime 缺字段为 UNKNOWN，不能补零。
- 人工 Markdown 本地链接逐项核对；根 Markdown 不使用有 workspace/path 问题的 vp 命令。未宣称全仓格式通过。

历史 globalfmt3 同 blob/main RAW2、docs alias ENOTDIR、parallel timeout 保留历史结论，未重跑、未顺修。此次命令错误独立记为 FAIL，不用后续通过覆盖。

browser/visual/HTTP/docs live/CI/packed/device/vendor/APS/production：UNRUN。license：UNKNOWN。jsdom DOM 与构建不证明真实布局/键盘/远距可读性。未读边界：原仓后端、真实服务/认证内部和非本票消费链，无结论；无新增公共导出，不改冻结集合。

最终 fresh：green-4 实际 exit 0、success true、17 passed/0 failed；ui-1 实际 exit 0、success true、48 passed/0 failed。两份 runtime 字段 UNKNOWN。types-3/build-2/lint-2/fmt-1 exit 0。Markdown 六文件 oxfmt stdin 非空输出后二次 cmp 通过。UI JSON 首次输出多退一级，已移动自有报告归位，未改报告字节。
