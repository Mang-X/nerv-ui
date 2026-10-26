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
