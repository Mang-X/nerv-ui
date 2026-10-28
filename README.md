# nerv-ui

从 Nerv-IIP 提取的 Vue UI 系统，覆盖桌面、触屏、移动、大屏、文件上传/预览、排程、应用壳、主题和设计文档。

当前完成 T01 原样复制基线，并在 [T02 / #3](https://github.com/Mang-X/nerv-ui/issues/3) 提供可独立安装、启动和构建的桌面 playground。[T03 / #4](https://github.com/Mang-X/nerv-ui/issues/4) 在同一宿主增加独立触屏演示：启动后访问 `/#touch`，或从桌面页点击“触屏演示”。五个现有公开组件使用中性内存数据，操作说明与证据见 [T03 验证记录](docs/evidence/t03/README.md)。[T04/N01 / #45](https://github.com/Mang-X/nerv-ui/issues/45) 恢复移动包并增加 `/#mobile` 的页壳导航 11 件演示，接入与后续分工见 [独立移动接入](docs/mobile-standalone.md)。完整迁移由 [母票 #1](https://github.com/Mang-X/nerv-ui/issues/1) 跟踪；其他表面、完整文档站和版本化安装产物尚待后续票验证。

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend dev
pnpm -C frontend test
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend build
```

Node >=22.18，pnpm 11.22.0；具体命令、CSS 接入、workspace 恢复责任与测试分工见 [独立桌面接入](docs/desktop-standalone.md)，实际证据见 [T02 验证记录](docs/evidence/t02/README.md)。宿主通过 `workspace:*` 消费公共 `@nerv-iip/ui`，不需要 Nerv-IIP checkout、生成 SDK 或后端；版本化产物安装属于 #11。

[T04/N02 / #46](https://github.com/Mang-X/nerv-ui/issues/46) 的输入、扫码与数字键盘从 `/#mobile-input` 直接访问，也可由 `/#mobile` 点击“随心记录”进入。12 件公开组件使用中性内存状态，保留其它入口；扫码在编辑表单或打开浮层时让出焦点。行为、字符串输入约束和浏览器/设备证据边界见 [移动接入](docs/mobile-standalone.md#输入扫码与数字键盘n02)。

- `frontend/packages/ui`、`frontend/packages/ui-mobile`、`frontend/packages/scheduling`、`frontend/apps/playground`：当前活动 workspace。
- `frontend/packages/app-shell`、`frontend/apps/design-system`：保留的候选源码，待 #9/#8/#10 恢复参与安装和聚合命令。
- `frontend/DESIGN` 与 `DESIGN.md`：设计规则和资料；独立库增量决策优先回到当前接入文档。
- `frontend/reference-tests`：旧库消费方参考契约，独立库命令不执行它们。
- `migration/materials/source/frontend`：其他应用完整源码及 auth/business-core 原始素材，待解耦；不在活动 workspace 内。
- `migration/reference/source`：固定时点参考，不代表当前运行状态。

T01 来源固定为 [Mang-X/Nerv-IIP](https://github.com/Mang-X/Nerv-IIP/tree/79b1578f2b75f55709765b5e7882aaf33146c603) 的 `79b1578f2b75f55709765b5e7882aaf33146c603`。分类、来源与逐文件 provenance 保留于 [迁移说明](migration/t01/README.md)，不随活动库演进改写。

本仓库保持私有；未选择新的发行许可，未授权公开发布。第三方来源、Evaluation 声明与限制见 [来源与限制](migration/t01/README.md#第三方来源与限制)。本地、浏览器、CI、发布和原库接入证据分别报告。

[T04/N03 / #47](https://github.com/Mang-X/nerv-ui/issues/47) 的 8 件选择与浮层从 `/#mobile-overlays` 直接访问，或在 `/#mobile` 点击“片刻安排”。示例展示草稿确认/取消、动作身份、滚轮与日期、下拉单开、折叠和抽屉内数字键盘；接入与证据见 [独立移动接入](docs/mobile-standalone.md#选择与浮层n03)。

[T04/N04 / #48](https://github.com/Mang-X/nerv-ui/issues/48) 的六件手势、列表与轮播从 `/#mobile-lists` 进入“翻阅时光”。宿主展示左右滑动、顶端刷新、分页失败/重试/结束、有限 DOM 虚拟窗口及受控轮播；接入边界见 [独立移动接入](docs/mobile-standalone.md#手势列表与轮播n04)，验证记录见 [N04 证据](docs/evidence/t04-n04/README.md)。

[T04/N05 / #49](https://github.com/Mang-X/nerv-ui/issues/49) 的 11 件反馈、状态与媒体从 `/#mobile-feedback` 进入“片刻回响”。示例展示通知关闭、结果/空态/失败重试、徽标与标签、受控 toast、骨架与进度，以及真实本地图片成功/失败/src 恢复；六个既有入口均保留。接入与范围见 [移动接入](docs/mobile-standalone.md#反馈状态与媒体n05)，证据见 [N05 验证记录](docs/evidence/t04-n05/README.md)。父 #5 的组合验收单独进行。

[T05/A01 / #58](https://github.com/Mang-X/nerv-ui/issues/58) 在 `/#screen`（兼容 `/#screen/stage`）提供“城市文化空间”的 7 件基础外壳舞台，支持 fit/width/stretch、设计尺寸与返回既有表面。接入与范围见 [独立大屏接入](docs/screen-standalone.md)，实际验证见 [A01 证据](docs/evidence/t05-a01/README.md)。其余大屏能力由 #59–#64 跟踪，父 #6 组合验收单列。

[T05/A02 / #59](https://github.com/Mang-X/nerv-ui/issues/59) 从 `/#screen/controls` 进入“随心安排”，展示七件受控输入、选择与键盘控件；从同一设置栏返回空间舞台和全部既有表面。接入见 [独立大屏接入](docs/screen-standalone.md#a02受控输入与空间安排)，证据见 [A02 验证记录](docs/evidence/t05-a02/README.md)。父 #6 组合验收另行执行。

[T05/A04 / #61](https://github.com/Mang-X/nerv-ui/issues/61) 从 `/#screen/data` 进入“流动消息”，展示独立来源的等待／失败／保留／恢复、刷新与启停，以及自动轮巡和手动翻阅。接入见 [独立大屏接入](docs/screen-standalone.md#a04流动消息与轮询生命周期)，公开行为与实际浏览器证据见 [A04 验证记录](docs/evidence/t05-a04/README.md)。

[T05/A07 / #64](https://github.com/Mang-X/nerv-ui/issues/64) 从 `/#screen/summary` 进入“空间使用概况”。三件既有组件通过可选 tone、标签/单位与四态文案复用文化空间、共享办公来源；未知与空数据显式呈现。接入见 [独立大屏接入](docs/screen-standalone.md#a07主指标比较摘要与时间分段)，验证见 [A07 证据](docs/evidence/t05-a07/README.md)。#25 新卡和父 #6 组合验收单列。

[T06/F01 / #72](https://github.com/Mang-X/nerv-ui/issues/72) 从 `/#files` 进入“留住片刻”，可从所有既有表面进入并返回。七种上传排列使用本页内存适配器，默认手动开始；本地图片提供缩放、旋转及状态恢复。接入与限制见 [独立文件接入](docs/files-standalone.md)，实际证据见 [F01 验证记录](docs/evidence/t06-f01/README.md)。PDF/Office、上传竞态及原生 HTTP 由 #73–#76 接续。

[T07/P01 / #84](https://github.com/Mang-X/nerv-ui/issues/84) 从 `/#schedule` 进入“给片刻留个位置”，通过主桶 `NvScheduleTimeline` 显示中性任务、泳道、事实、分段、依赖与保留窗口，支持选择与外部模型更替。可由桌面进入并返回所有既有表面；接入/时间合同见[组件文档](frontend/apps/design-system/docs/components/desktop/schedule-timeline.md)，实际证据见 [P01 记录](docs/evidence/t07-p01/README.md)。P01 的只读 native 不代表真实 DHTMLX 或父 #8 已完成；当时未恢复的 scheduling workspace 由 P04 接续。

[T07/P02 / #85](https://github.com/Mang-X/nerv-ui/issues/85) 提供候选 `@nerv-iip/scheduling/model` 的独立纯契约入口，复用 P01 visual types/renderer，事实、状态文案、任务时区与保留区间由宿主输入。旧 DTO 参数迁移、独立消费命令和 prepared-contract 边界见 [排程展示模型](docs/scheduling-model.md)；scheduling workspace/主桶整体运行仍由 P03/P04 接续。

P03 宿主回调、旧公开签名迁移和 test-only 入口见 [排程宿主合同](docs/scheduling-host.md)；P03 的独立 public consumer 不代表整包验收；当前 scheduling 整包与真实 vendor 的独立证据见 P04。

[T07/P04 / #87](https://github.com/Mang-X/nerv-ui/issues/87) 从 `/#schedule-gantt` 展示真实只读 DHTMLX 与双实例，可返回原生时间安排。包/本地资源/生命周期与回落合同见 [引擎接入](docs/scheduling-renderer.md)，实际验证见 [P04 证据](docs/evidence/t07-p04/README.md)。资源投影、编辑和面板仍由 P05–P08 验收，授权 UNKNOWN。

[T07/P06 / #89](https://github.com/Mang-X/nerv-ui/issues/89) 从 `/#schedule-edit/library` 与 `/#schedule-edit/studio` 展示工单图受控移动、双端调整、采用/保留及外部时间替换。锁定/分段和只读保留权威模型；接入与竞态边界见 [引擎接入](docs/scheduling-renderer.md#p06order-受控编辑)，验证见 [P06 记录](docs/evidence/t07-p06/README.md)。资源改派、面板、草案组合继续由 P07–P09 负责。

[T07/P08 / #91](https://github.com/Mang-X/nerv-ui/issues/91) 的八件面板从 `/#schedule-panels/library`、`/#schedule-panels/studio` 进入。工具栏、搜索定位、事实/锁定详情、三类列表与真实图例复用公开组件；可从桌面/既有工单图进入并返回。可选显示输入、受控事件与 InspectorSheet 的公开组合 recipe 见 [面板合同](docs/scheduling-panels.md)，本轮验证见 [P08 证据](docs/evidence/t07-p08/README.md)。

[T07/P09 / #92](https://github.com/Mang-X/nerv-ui/issues/92) 从 `/#schedule-draft/library` 和 `/#schedule-draft/studio` 提供三视图共享的中性草案编辑，支持受控表格/图面调整、锁定、待排恢复与本地撤销。保存和清空依赖明确 callback 成功，不将 undo 当作持久化。公共输入、异步隔离和原应用动作接缝见 [草案合同](docs/scheduling-draft.md)，执行记录见 [P09 证据](docs/evidence/t07-p09/README.md)。

[T07/P11 / #94](https://github.com/Mang-X/nerv-ui/issues/94) 从 `/#schedule-snapshot/library`、`/#schedule-snapshot/studio` 展示中性缺口汇总、风险、冲突与负荷。四件只显示 host 事实，保留零/未知、冻结/当前与预警/阻断的区别；接入与旧 props 迁移见 [快照展示合同](docs/scheduling-snapshot.md)，实际验证见 [P11 证据](docs/evidence/t07-p11/README.md)。

[T07/P12 / #95](https://github.com/Mang-X/nerv-ui/issues/95) 从 `/#schedule-compare/library`、`/#schedule-compare/studio` 展示已保存基线与候选的静态对照。公开组件按宿主 semantic key 关联活动，逐侧显示时间、资源与分段，指标和风险只读来源事实；接入及旧私有组件适配见 [比较合同](docs/scheduling-comparison.md)，执行记录见 [P12 证据](docs/evidence/t07-p12/README.md)。

[T07/P13 / #96](https://github.com/Mang-X/nerv-ui/issues/96) 从 `/#schedule-async/library`、`/#schedule-async/studio` 展示受控异步候选、插单历史分页、停机影响与保存确认。四件公开组件只读取宿主状态和事实；请求身份、停止、重试、轮询及真实保存由宿主负责。公共输入与旧私有件对应见 [异步候选合同](docs/scheduling-async-candidates.md)，实际证据见 [P13 记录](docs/evidence/t07-p13/README.md)。

[T07/P10 / #93](https://github.com/Mang-X/nerv-ui/issues/93) 从 `/#schedule-request/library`、`/#schedule-request/studio` 提供候选池、窗口与单项请求的中性接入。状态、可见行批量、草稿和异步回执合同见 [请求表单](docs/scheduling-request-forms.md)；本页内存数据与确认不代表实际 APS 或后端保存。[P10 证据](docs/evidence/t07-p10/README.md)保留本票边界。

[T07/P14 / #97](https://github.com/Mang-X/nerv-ui/issues/97) 从 `/#schedule-day/library`、`/#schedule-day/studio` 展示显式时区的受控日安排与局部打印目标。半开午夜、跨日、分组、纸面表头和清理合同见[日安排与打印](docs/scheduling-day-print.md)；两页内存安排不代表已保存方案或实际 APS，验证边界见 [P14 证据](docs/evidence/t07-p14/README.md)。

[T08/R02 / #20](https://github.com/Mang-X/nerv-ui/issues/20) 从 `/#screen/backgrounds` 查看流线与等距块体背景的双实例。公开名称、来源默认与宿主用法见[装饰背景文档](frontend/apps/design-system/docs/components/screen/decorative-backgrounds.md)，实际证据见 [R02 记录](docs/evidence/t08-r02/README.md)。

[T08/R04 / #22](https://github.com/Mang-X/nerv-ui/issues/22) 从 `/#screen/layout` 查看种子氛围布局与可交互内容。公共 `NvScreenLayout` 接受宿主 seed 与时钟，外层复用 `NvScreenScaler`；属性、插槽和缩放边界见[组件文档](frontend/apps/design-system/docs/components/screen/screen-layout.md)，本票结果见 [R04 记录](docs/evidence/t08-r04/README.md)。

[T08/R08 / #26](https://github.com/Mang-X/nerv-ui/issues/26) 从 `/#screen/status-hero` 查看两类来源的远距主状态灯、独立颜色和节奏，以及零、非零、未知失联说明。公共 API 与宿主边界见[组件文档](frontend/apps/design-system/docs/components/screen/status-hero.md)，实施证据见 [R08 记录](docs/evidence/t08-r08/README.md)。

[T08/R16 / #34](https://github.com/Mang-X/nerv-ui/issues/34) 从 `/#action-summary` 查看两张中性行动摘要卡的五态、真实零、未知数量、预览替换和各自动作。公开输入与来源边界见[组件文档](frontend/apps/design-system/docs/components/desktop/action-summary.md)，本票验证见 [R16 记录](docs/evidence/t08-r16/README.md)。

[T08/R14 / #32](https://github.com/Mang-X/nerv-ui/issues/32) 从 `/#entity-multi-picker` 查看两种中性多选宿主：受控数组、已选名称保留与搜索分页。旧逗号字段在宿主转换；公共合同见[组件文档](frontend/apps/design-system/docs/components/desktop/entity-multi-picker.md)，本票证据见 [R14 记录](docs/evidence/t08-r14/README.md)。

[T08/R12 / #30](https://github.com/Mang-X/nerv-ui/issues/30) 从 `/#screen/stage-flow` 查看两类中性阶段数量来源，支持替换、重排、清空、恢复和长文字/窄幅显示。公共合同见[阶段数量流](frontend/apps/design-system/docs/components/screen/stage-flow.md)，实际验证和 UNRUN 边界见[R12 记录](docs/evidence/t08-r12/README.md)。

[T08/R11 / #29](https://github.com/Mang-X/nerv-ui/issues/29) 从 `/#screen/heatmap` 查看阅读占用与展厅温度两类分档热力格，支持聚焦/悬停当前值、替换、空态、未知、网格与分档切换。接口与宿主边界见[分档热力格](frontend/apps/design-system/docs/components/screen/heatmap.md)，实际本地证据及浏览器 UNRUN 见 [R11 记录](docs/evidence/t08-r11/README.md)。

## 入口与摘要卡

`/#screen/summary-cards` 在既有缩放舞台中展示阅读空间与共享花园，支持入口/概况/动态三种卡形、0/1/6 张密度、替换记录与完整说明。公开组件 `NvScreenSummaryCard` 复用已有容器、状态和趋势；导航、统计与数据来源由宿主负责。API 与 live 示例见[组件页](frontend/apps/design-system/docs/components/screen/summary-card.md)，实际验证与 UNRUN 边界见[R07 证据](docs/evidence/t08-r07/README.md)。

`/#tree/library` 与 `/#tree/studio` 展示空间分区的受控展开、选择和添加入口。公共 `NvTree` 不携带业务记录；API 见[层级树](frontend/apps/design-system/docs/components/desktop/tree.md)，本地验证及未运行边界见[实施记录](docs/evidence/t08-r15/README.md)。

[T08/R06 / #24](https://github.com/Mang-X/nerv-ui/issues/24) 从 `/#notifications/library`、`/#notifications/studio` 展示消息与任务、受控详情、筛选和标记回执。公共 API 与文档示例见[通知收件箱](frontend/apps/design-system/docs/components/desktop/notification-inbox.md)，实际本地证据及未运行边界见 [R06 记录](docs/evidence/t08-r06/README.md)。

[T08/R01 / #19](https://github.com/Mang-X/nerv-ui/issues/19) 从 `/#shell/library` 与 `/#shell/studio` 进入中性应用壳组合。菜单、用户、受控位置与命令入口均为内存宿主输入；公共骨架、API 与 live 示例见[中性应用壳](frontend/apps/design-system/docs/components/desktop/neutral-shells.md)，实际执行边界见 [R01 记录](docs/evidence/t08-r01/README.md)。候选 app-shell 包恢复及原应用接入另行验收。

[T08/C04 / #40](https://github.com/Mang-X/nerv-ui/issues/40) 从 `/#screen/recipes` 进入阅读活动与展览安排，展示受控分栏、队列、分类和更新状态。见[组合合同](frontend/apps/design-system/docs/components/screen/dashboard-recipes.md)与[本地证据](docs/evidence/t08-c04/README.md)。

[T08/C03 / #39](https://github.com/Mang-X/nerv-ui/issues/39) 从 `/#mobile-flow` 查看候选与分步执行，支持键入或扫码、切换安排、外部清空、数字键盘与失败重试。见 [移动接入](docs/mobile-standalone.md#候选与分步执行t08c03)和[本地证据](docs/evidence/t08-c03/README.md)。确认仅保存在本页内存。
