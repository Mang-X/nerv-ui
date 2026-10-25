# T07/P05：资源只读投影与分组

范围为 [#88](https://github.com/Mang-X/nerv-ui/issues/88)，单个 draft PR，仅 base `integration/nerv-ui-extraction`。起点 `655b37430c42a9262b85f05817d9ded1186bf67c` / tree `e41a517696727bb9e7cf4dc8358b7f70bbe144b0`，开工 clean。实现 head/tree、最终 clean、PR 与校验总表见本轮交接；独立 merger、合并及关闭均未由实施席执行。

- 实际工作树 `/Users/mang/Project/nerv-ui-worktrees/t07-p05-resource-projection`，branch `feat/t07-p05-resource-projection`。T3 自动旧树没有实施写入；新旧 main 均未修改。
- 当前合同见 [资源投影说明](../../scheduling-renderer.md#p05资源只读投影与分组)。`ScheduleResource.dimensions` 是唯一公开类型增量；私有严格时刻检查增加日历窗口，防止 `Date.parse` 推测裸时刻/滚动无效日期。生成泳道 ID 与任务冲突时调整内部泳道 ID，已有资源改派路径只同步最小 ID 解码；P07 编辑合同未提前实现。
- 当前两个中性入口 `/#schedule-resources/library`、`/#schedule-resources/studio`，均消费公开 `ResourceSchedulerBoard`；可返回原入口。宿主持有分组、排序、刻度和模型，缩放按钮更新受控刻度，标签与实际轴一致。

## Requirement | Evidence

下列正式测试均在 [公开资源板回归](../../../frontend/packages/scheduling/src/components/ResourceSchedulerBoard.public.test.ts)，真实保留 vendor/jsdom lane；浏览器几何另列，fake 不替代 vendor。

| Requirement                                                              | Evidence                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 两维度、三排序，空/仅块泳道、外部重排、选择/冲突事件、删除干净且输入不变 | `public controlled dimensions and three orders retain catalog empty and block-only lanes and stable task events after reorder`；真实浏览器 6 组矩阵及滚轮收集完整目录，受控更新后 task id 不变。`onlyScheduled` 明确过滤无普通工序的行。                                                                                        |
| 0、unknown、overload 不混；不同 ID 空间不借值                            | `public resource headers preserve known zero unknown and overload without borrowing a colliding resource id`；有效 RED 实际显示错误 `900%`，GREEN 为 0/—/150%；浏览器中 0/—/125% 三行并列。                                                                                                                                     |
| 没任务仍保留明确资源归属，全部零仍显示                                   | `public empty resources and all-zero metrics remain visible without a task or an empty-state overlay`。                                                                                                                                                                                                                         |
| task id 与生成 lane id 冲突，泳道不冒充任务事件                          | `public generated lane ids never replace a colliding task identity or emit a lane as a task`。                                                                                                                                                                                                                                  |
| 名称保持纯文本                                                           | `public resource names remain literal text even when they contain markup`，不是 HTML 镜像断言。                                                                                                                                                                                                                                 |
| 日历、块、冻结仅按输入及命名空间；已知空日历不同于缺失，替换清理         | `public calendar block and freeze backgrounds stay scoped to their input namespace and clear on replacement`；半小时起点的块/冻结相对既有两小时 cell 为 left=25%、width=50%。先有无片段的有效 RED；中间误按一小时 cell 的预期 FAIL 保留，按实际刻度合同纠正。                                                                   |
| 不把轴分段伪装成班次                                                     | `public resource hour axis never invents night or early shift names from missing calendar data`；RED 为写死夜班/早班/中班，GREEN 保留中性八小时时间分段，实际班次仅来自输入窗口。                                                                                                                                               |
| 日历实际时刻严格且能恢复                                                 | `public resource calendar contains 'bare wall time' and recovers without guessing shift instants`、`public resource calendar contains 'invalid calendar day' and recovers without guessing shift instants`；两条有效 public RED，随后拒绝裸时刻/2 月 30 日，恢复后仍能选择同一个 task id。                                      |
| 唯一 native 回落、归属/空行/块窗口/事件与禁编辑分区                      | `public missing-module fallback shares dimension membership empty lanes block windows and exact selection ids`；另有真实 HTTP503→native、同页 null 缓存、reload 恢复 vendor。native 的 KPI 头、班次底纹、多刻度和编辑不等价，既有 P01 短条/技术提示限制保留。                                                                   |
| 主题、可见 tooltip、状态、只读、尺寸、滚动、缩放、双实例与卸载           | 本轮真实生产浏览器脚本：两领域选择、四主题、tooltip 非零 rect、四刻度、受控缩放、窄/宽容器、加载/空/错误/时区与恢复、双实例卸一留一继续更新、重挂、旧 P04 order 基线/选择/入口往返。最终路由清理布局/tooltip/hint 为 0，明确安装后观察到的实例 interval 归零；不声称模块默认 interval 或全浏览器零定时器。                      |
| P04 共享生命周期保留                                                     | mount+finishMount、destroy、loader、useEngine 逐字同 base；原真实 vendor 退役同容器两时序、短命 Evaluation timer、fake async singleton、live invalid/baseline 严格时刻正式回归本轮重新执行。原 R3 的 1359/4、4 外部 probe、32 browser 是历史证据，不冒本轮 fresh；外部 4 probe 与完整旧 32 矩阵本轮未整套复跑。                 |
| 公开类型、资源及依赖身份                                                 | 独立 `.vue` consumer 只从公开桶消费 `ResourceSchedulerBoard/ScheduleResource/LaneOrder` 等，无 SDK alias；root/nested 各 6 个实际 HTTP200 的 URL/MIME/bytes/SHA/actual body 与对应本轮 fresh dist 逐字相等；完整 lock 973 packages/973 snapshots 含 metadata、optional、peer、edge 与 base deepEqual，四包解析同一 Vue 3.5.39。 |

## 命令与证据边界

命令均在实际工作树执行，PATH 前置本轮 pnpm shim，固定 corepack `pnpm@11.22.0`，nested `pnpm` 也为 11.22.0。开工无 node_modules，执行 clean frozen install，lock 未改。Python 只用 uv。

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend --filter @nerv-iip/scheduling exec vp test run src --reporter=json --reporter=<scratch>/unhandled.mjs --outputFile=<scratch>/scheduling-release.json
pnpm -C frontend --filter @nerv-iip/ui exec vp test run src --reporter=json --reporter=<scratch>/unhandled.mjs --outputFile=<scratch>/ui.json
pnpm -C frontend --filter @nerv-iip/ui-mobile exec vp test run src --reporter=json --reporter=<scratch>/unhandled.mjs --outputFile=<scratch>/mobile.json
pnpm -C frontend --filter @nerv-iip/playground exec vp test run src --reporter=json --reporter=<scratch>/unhandled.mjs --outputFile=<scratch>/host-final4.json
pnpm -C frontend exec vp test run --root contract-consumers/scheduling-model --config vite.config.ts
pnpm -C frontend exec vp test run --root contract-consumers/scheduling-host --config vite.config.ts
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend exec vue-tsc --noEmit -p <scratch>/consumer/tsconfig.json
pnpm -C frontend build
pnpm -C frontend --filter @nerv-iip/playground exec vp build --base=/p05/ --outDir=<scratch>/nested-dist
```

`scratch=/tmp/nerv-ui-t07-p05`；完整参数/exit、discovery、执行状态、skip 名称与实际 reporter unhandled 字段见本轮 `validation.json`。JSON 自身没有的 unhandled 字段保持 null，另存真实 reporter 回调。四个原 stub conformance skip 为 0 执行，不计真实 vendor 通过。无新增 skip、exclude 或 timeout。

UI 宽命令的 811 是 **805 行为 + 6 docs-source**，mobile 的 146 是 **144 行为 + 2 docs-source**；独立 docs-source 6 是同用例另跑，不重复累计。此前汇报宽命令数量不是行为数量。P02 pure20、P03 public-host50 与 workspace 测试分别取证。

fmt/lint、workspace types、root/nested build 与当前增量 diff-check 分列；主 main 全量 RAW diff-check 仍 exit2，历史空白未删。既有三条 lint warning 与第三方 PURE annotation / 大 chunk warning 保留。`documentation` 技能路径未找到，按实际根 AGENTS/README 与 DESIGN governance 写文档，没有套用旧 Nerv-IIP 文档治理；测试扩展目录未提供，采用仓内代表性测试。

## 真实截图

截图均实际查看，未剥 Evaluation 水印。最终 bundle 的截图库随 `summary.json` 指明来源；中间 FAIL 的旧图只在 durable 保留。

- [浅色资源板](browser/library-light.png)
- [深色蓝色主题](browser/library-blue-dark.png)
- [可见 tooltip](browser/tooltip.png)
- [创作室独立子路径](browser/nested-studio.png)
- [native 只读回落](browser/native-readonly.png)

## FAIL、继承、UNRUN 与归档

保留所有有效 RED：跨 ID 的 900%、缺精确块片段、虚构班次、两类非法日历、宿主缩放后下拉框仍旧值。宿主缩放 RED 来自旧的本轮 production bundle，有实际轴/选择值与截图；随后更新受控 scale 并重建/重验，旧 body 记录不被新产物覆盖。

准备 FAIL 也保留：jsdom 第四行未在模拟可视区、刻度两小时预期误查、consumer 首次错误 cwd/no-package、独立类型缺标准 Vite ambient、formatter 相对父路径/仓根 package 错误、Ego 首 selector 命中隐藏 split parent、诊断字段未跨 reload 安装（null）、主题误查不存在 attribute、虚拟列表滚走后无法定位卸载的卡片。没有通过删断言或填 0 修绿。

T3 已先 status/open；同一步 snapshot 两次原始 `Preview automation snapshot timed out after 15000ms.` 后，依 ego-browser 技能使用单个 Space64。Ego 更新提示保留，未升级。浏览器 error/console.error 捕获范围为明确安装后的交互；首导航及真实 HTTP503 最初传输阶段未捕获的字段为 null，不冒全程无错。原生浏览器 80%/125% zoom UNRUN；仅实际发送 reset-to-100% 快捷键，不以 DPR/viewport 或组件 zoom 冒充原生 zoom 验证。

UNRUN：独立 merger、CI、完整 docs #10、packed #11、device、旧 consumer #13/#15、后端 SDK/APS、父 #8 组合、P06/P07/P08/P11 等后继、生产发布和商业授权。P04 外部四 probe/完整旧32矩阵本轮未整套重跑；P02 旧年、P03 字号、重复 ETA P3、#43/#51、P01 共享 native 技术提示/短条限制均不扩修。

Durable：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-26/t07-p05-implementation-r1/handoff.md`。只归档本轮材料与历史指针；排除 node_modules/cache/dist/nested-dist/cleancheckout/symlink，逐文件 SHA256 回读。实施工作树保留，服务与自有浏览器由本席清理；#88 留 OPEN，交父席独立 merger。
