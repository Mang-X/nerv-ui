# nerv-ui

从 Nerv-IIP 提取的 Vue UI 系统，覆盖桌面、触屏、移动、大屏、文件上传/预览、主题和设计文档。排程相关组件与 app-shell 于 #300 撤出本库（范围收敛为四形态）。

当前完成 T01 原样复制基线，并在 [T02 / #3](https://github.com/Mang-X/nerv-ui/issues/3) 提供可独立安装、启动和构建的桌面 playground。[T03 / #4](https://github.com/Mang-X/nerv-ui/issues/4) 在同一宿主增加独立触屏演示：启动后访问 `/#touch`，或从桌面页点击“触屏演示”。五个现有公开组件使用中性内存数据，操作说明与证据见 [T03 验证记录](docs/evidence/t03/README.md)。[T04/N01 / #45](https://github.com/Mang-X/nerv-ui/issues/45) 恢复移动包并增加 `/#mobile` 的页壳导航 11 件演示，接入与后续分工见 [独立移动接入](docs/mobile-standalone.md)。完整迁移由 [母票 #1](https://github.com/Mang-X/nerv-ui/issues/1) 跟踪；完整文档站的工程入口已由 T09/A 恢复，站内 live 完整覆盖由 #10 后续子项验证；版本化安装产物由 #11 验证。

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend dev
pnpm -C frontend test
pnpm -C frontend --filter @nerv-iip/ui test:docs
pnpm -C frontend build
```

Node >=22.18，pnpm 11.22.0；具体命令、CSS 接入、workspace 恢复责任与测试分工见 [独立桌面接入](docs/desktop-standalone.md)，实际证据见 [T02 验证记录](docs/evidence/t02/README.md)。宿主通过 `workspace:*` 消费公共 `@nerv-iip/ui`，不需要 Nerv-IIP checkout、生成 SDK 或后端；版本化产物安装属于 #11。

[T04/N02 / #46](https://github.com/Mang-X/nerv-ui/issues/46) 的输入、扫码与数字键盘从 `/#mobile-input` 直接访问，也可由 `/#mobile` 点击“随心记录”进入。12 件公开组件使用中性内存状态，保留其它入口；扫码在编辑表单或打开浮层时让出焦点。行为、字符串输入约束和浏览器/设备证据边界见 [移动接入](docs/mobile-standalone.md#输入扫码与数字键盘n02)。

- `frontend/packages/ui`、`frontend/packages/ui-mobile`、`frontend/apps/playground`、`frontend/apps/design-system`：当前活动 workspace。
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

[T08/R01 / #19](https://github.com/Mang-X/nerv-ui/issues/19) 从 `/#shell/library` 与 `/#shell/studio` 进入中性应用壳组合。菜单、用户、受控位置与命令入口均为内存宿主输入；公共骨架、API 与 live 示例见[中性应用壳](frontend/apps/design-system/docs/components/desktop/neutral-shells.md)，实际执行边界见 [R01 记录](docs/evidence/t08-r01/README.md)。候选 app-shell 包已于 #300 移出本库。

[T08/C04 / #40](https://github.com/Mang-X/nerv-ui/issues/40) 从 `/#screen/recipes` 进入阅读活动与展览安排，展示受控分栏、队列、分类和更新状态。见[组合合同](frontend/apps/design-system/docs/components/screen/dashboard-recipes.md)与[本地证据](docs/evidence/t08-c04/README.md)。

[T08/C03 / #39](https://github.com/Mang-X/nerv-ui/issues/39) 从 `/#mobile-flow` 查看候选与分步执行，支持键入或扫码、切换安排、外部清空、数字键盘与失败重试。见 [移动接入](docs/mobile-standalone.md#候选与分步执行t08c03)和[本地证据](docs/evidence/t08-c03/README.md)。确认仅保存在本页内存。

[T08/R05 / #23](https://github.com/Mang-X/nerv-ui/issues/23) 从 `/#screen/login/library` 与 `/#screen/login/garden` 展示两类中性空间入口。见[公开合同](frontend/apps/design-system/docs/components/screen/login-stage.md)和[实施证据](docs/evidence/t08-r05/README.md)。本页提交不建立认证会话。

[T08/C02 / #38](https://github.com/Mang-X/nerv-ui/issues/38) 从 `/#directory-detail/library`、`/#directory-detail/studio`（兼容 `/#directory-detail`）进入书房与画室目录，共用受控筛选、回调分页和只读详情。见[组合合同](frontend/apps/design-system/docs/components/desktop/directory-detail.md)与[实施证据](docs/evidence/t08-c02/README.md)。

[T08/R03 / #21](https://github.com/Mang-X/nerv-ui/issues/21) 在 `/#screen/backgrounds` 增加阅读空间与共享花园等距节点流。API 见[组件文档](frontend/apps/design-system/docs/components/screen/fusion-background.md)，验证边界见[R03 记录](docs/evidence/t08-r03/README.md)。
[T08/R17 / #35](https://github.com/Mang-X/nerv-ui/issues/35) 的分页恢复组合从 `/#mobile-task-list/library` 与 `/#mobile-task-list/studio` 进入。首次/保留/局部错误、暂停重试与逐页滚动恢复合同见[移动接入](docs/mobile-standalone.md#分页列表恢复t08r17)，本地证据见[R17 记录](docs/evidence/t08-r17/README.md)。

可打印只读详情从 `/#printable-detail` 进入“生活手记”，打印不保存内容。已核验浏览器 print media 与引擎 PDF 输出；原生预览窗口、OS 事件及实纸未验。[R18 证据与边界](docs/evidence/t08-r18/README.md)。

[T08/R19 / #41](https://github.com/Mang-X/nerv-ui/issues/41) 从 `/#mobile-photos/library`、`/#mobile-photos/studio` 进入照片与成功附件组合。宿主提供传输与回执，公开 `NvPhotoAttachments` 保留原生拍照提示、同文件重选与受控移除；见 [API](frontend/apps/design-system/docs/components/mobile/photo-attachments.md) 与 [实施证据](docs/evidence/t08-r19/README.md)。浏览器已独立验收；相机与真实设备仍 UNRUN。

[T08/R13 / #31](https://github.com/Mang-X/nerv-ui/issues/31) 从 `/#line-annotations/library` 与 `/#line-annotations/garden` 查看书房到访、花园用水的图内范围与明细定位，支持重排、替换和系列显隐。公共合同见[图表文档](frontend/apps/design-system/docs/components/desktop/chart.md#折线图范围与定位)，本地数学/DOM 与未运行边界见[R13 证据](docs/evidence/t08-r13/README.md)。

`/#screen/status-wall` 展示城市书房与共享花园的平铺、两种分组密度和延迟概况。公共 API 见[分组状态墙](frontend/apps/design-system/docs/components/screen/status-wall.md)，本地行为与未运行边界见[R09 记录](docs/evidence/t08-r09/README.md)。

[T08R10 / #28](https://github.com/Mang-X/nerv-ui/issues/28) 参数详情从 `/#screen/parameter-detail/library` 与 `/#screen/parameter-detail/studio` 进入，演示中性信息/参数/历史、窗口替换与缺测；接入见[大屏说明](docs/screen-standalone.md#t08r10空间参数详情)，候选证据见[T08R10](docs/evidence/t08-r10/README.md)。

[T08/C01 / #37](https://github.com/Mang-X/nerv-ui/issues/37) 从 `/#login/library` 与 `/#login/studio` 进入两类中性空间的登录/改密组合，支持两类桌面、手持与大屏入口，回执须明确确认。见[组合合同](frontend/apps/design-system/docs/components/desktop/login-recipe.md)与[实施记录](docs/evidence/t08-c01/README.md)。真实会话、密码保存和原应用接入不在本票。

## 独立文档站（T09/A，#143）

在 `frontend` 执行 `pnpm docs:dev`（127.0.0.1:5180）、`pnpm docs:build`、`pnpm docs:typecheck`。
默认 `dev` 仍启动 playground；根 `typecheck` 递归覆盖含文档站的活动包，根 `build` 先执行该聚合检查再构建 playground，文档静态产物需显式执行 `docs:build`。
文档工程合同用 `pnpm -C frontend/apps/design-system exec vp test run --config vitest.config.ts docs.contract.test.ts`，不扩到其它包测试桶。
174 页原站点保留；跨出站点的真实仓库文件映射到 integration 分支源码，站内死链检查保留。
VitePress 1.6.4 使用其私有 Vite 5.4.21，playground 使用既有 Vite Plus。
工程恢复不等于 #10 全部 live 或浏览器验收。决策、来源及运行证据见 [T09/A 记录](docs/evidence/t09-a/README.md)。
