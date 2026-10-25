# 独立排程引擎接入（P04）

`packages/scheduling` 已参与活动 workspace。playground 在 `/#schedule-gantt` 通过裸 `@nerv-iip/scheduling` 消费 `GanttChart` 与最小只读 `ResourceSchedulerBoard`，可返回 `/#schedule` 的原生时间安排及桌面。使用直接中性展示记录，无 SDK、认证或后端。完整资源投影、编辑和面板验收分别属于 P05–P08；工作台和应用 recipes 属于 P09–P16。

## 构建与资源

```ts
// vite.config.ts：与 Vue / Tailwind 插件一起使用
import { schedulingVendorStyles } from '@nerv-iip/scheduling/vite'
export default defineConfig({ plugins: [schedulingVendorStyles(), Vue(), tailwindcss()] })
// 宿主样式入口，已有 ui 样式与八层序仍须先接入
import '@nerv-iip/scheduling/styles.css'
```

loader 自己动态加载包的 `/vendor` 与 `/vendor.css`；运行方无需旧 `@dhx/trial-gantt` alias。`/vendor` 的 types 条件指向保留的完整 d.ts，runtime 指向原 JS。包单测配置明确把两个入口映射为 stub/empty.css，不能代替真实引擎验证。源码 workspace 消费不等于 #11 的 packed 安装。

DHTMLX 固定为 **9.1.4 Professional Evaluation**。三份 vendor 原字节、版权头、Evaluation 声明、水印、内嵌图标字体和图片均保留。来源固定旧库 `79b1578f2b75f55709765b5e7882aaf33146c603`，原始 blob/hash 见[研究](../migration/t01/README.md)及[本轮证据](./evidence/t07-p04/README.md)。适用授权范围 **UNKNOWN**；未升级、替换、采购或公开发布。

vendor CSS 原文件有六个远程 Inter `@font-face`。Vite transform 仅在构建输出去掉这些字体声明，把其余 CSS 放入 `nv-components` 层；图标字体与图片的 data URL 保留。排程使用 ui 已有本地 Inter/系统字体和 `--font-sans`，不请求 CDN。字体沿用锁定的 `@fontsource-variable/inter@5.2.8`，其包内 LICENSE 保留 Inter Project Authors 来源与 SIL Open Font License 1.1；本票没有另造字体副本或改变该依赖。该 transform 不改 vendor 文件，不改变水印，也不为 vendor 内未调用的远程 export 服务背书。

## 运行合同

- `engineKind` 既有 `'auto' | 'dhtmlx'` 名称保留；producer 没有 provide/inject 引擎选择，二者都尝试当前 vendor。不要把旧注释当注入 API。
- loader 对同页并发加载使用一个 Promise，成功模块或失败 `null` 均缓存到页面生命周期结束。缺包时只读复用 ui 的唯一 `NvScheduleTimeline`；编辑显示“编辑不可用”。切换路由或重挂不会重试失败模块；重新加载页面才重新尝试。回落刻度为八小时/日，没有 DHTMLX 编辑或多刻度等价承诺。
- 9.1.4 工厂实例独立。若模块仅暴露 legacy singleton，同一对象只允许一个 owner，第二个挂载显示实例不可用，不能取得并销毁首图。singleton 销毁后的可复用性取决于其实现，不宣称与工厂等价。
- 容器 owner 在 loading 移除、组件卸载与重新挂载时失效旧初始化、销毁对应实例。`SchedulingEngine.mount` 允许 `void | Promise<void>`；同步真实 vendor 不被包装成异步厂商保证。晚到结果不提交模型/命令，并清理本实例。观察器、RAF、延后 drag 通知、自绘 tooltip 与 document 监听随实例释放。
- `data-engine="dhtmlx"` 在 init、当前数据和等待命令处理后就绪。loading/empty/初始化错误/时区未解析分别显示。输入缺时区不会默认选择浏览器或第一工厂；实际时刻与墙上时间合同见[展示模型](./scheduling-model.md)。原型中的 DST 轴验证与工厂时刻转换分别取证。
- 只读禁止原生 drag；默认 lightbox、link 创建/双击删除没有公共写回合同，因此所有模式都关闭这些隐式编辑入口。P06/P07 负责完整受控编辑验收。宿主的领域判断与算法仍在 host。
- 既有 `selectTask/revealTask/scrollToToday/fitToScreen/scaleTo` 接缝保留。就绪前命令排队并在数据后执行；`fitToScreen` 只调用尺寸重算/重绘，不自动缩放到完整 horizon。selection 是既有事件/command，没有新增 v-model。

## 验证和来源责任

```sh
pnpm -C frontend install --frozen-lockfile
pnpm -C frontend --filter @nerv-iip/scheduling test
pnpm -C frontend typecheck
pnpm -C frontend build
pnpm -C frontend dev
```

原64路径逐项归属见[证据页](./evidence/t07-p04/README.md)。7 份本票改输入的旧测试原字节保存在 `frontend/reference-tests/nerv-iip/t07-p04`；活动测试直接构造 `ScheduleModel`、facts、timezone、windows 和 links，不调用无 adapter 的旧 mapper，不从 SDK 数据偷偷推导新合同。旧日期/事实衍生断言保留来源，更新的活动断言按 host 提供值展示。无新增排除或 skip；保留的 4 条 stub-vendor conformance skip 单列，不能计为真实 vendor PASS。

本地、真实浏览器、fake、历史失败与未运行车道见证据页。CI、完整文档站 #10、packed #11、设备、旧消费者 #13/#15、父 #8 组合及发布均单独验收。P03 R2 的 Markdown fmt FAIL 和关闭顺序瑕疵保留在历史 receipt；本票不改写它们。

## R1 返修的边界

活动 model 更新与首次输入都在组件内呈现错误；恢复有效 model 后重新初始化。`startUtc/endUtc`、分段和任何已提供的 `plannedStartUtc/plannedEndUtc` 都必须是有效的 UTC/offset 实际时刻；可选基线缺省仍合法，裸墙上时间不按浏览器时区解释。直接 `DhtmlxEngine.setData` 继续抛错且保留先前数据。

固定 9.1.4 Evaluation 在创建后的 1ms 回调中建立 interval 并注册 `onDestroy`。适配器先撤销交互、observer 和 RAF，再在该回调之后调用 destructor，最后清空容器与释放 lease；因此真实 vendor 的最终释放跨到下一 timer turn。保留完整 Evaluation 回调，不拦截其计时器、不改 vendor 原字节。重复 destroy 不提前清空等待释放的容器。

每次 mount 持有对象所有权 token。旧 async-init 晚回只可清理仍属于该 token 的对象；legacy singleton 被后来的 owner 成功接管后，旧代际不再 destructor 或清空容器。此项由 fake async legacy lane 证明，不宣称固定真实 vendor 的同步 init 变成异步。

## R2 同容器交接

每次 mount 使用独立的厂商子容器，公开 container 与 API 保持不变。destroy 先撤销本实例交互与观察，再移出自己的厂商子容器，保留其中 DOM 直到延后 destructor 完成。新 mount 可立即复用公开 container；旧 vendor 的 clearAll、布局与 Evaluation 回调仍只访问旧子容器。公开 container 的 scope 类仅由当前 mount token 清理，旧实例不能清空新实例的图或主题。此规则同时保留 Evaluation interval 的正常建立与 onDestroy 释放，不修改 vendor 内部引用或原字节。

真实同步工厂的同任务/已初始化交接及同一 engine 重挂在真实浏览器独立验证；fake async-init legacy singleton 的对象 token 保护仍使用原分区，不把两者混称厂商异步 conformance。R1/R2 拒绝与原失败保留于[证据页](./evidence/t07-p04/README.md)。

## R3 用户提示返修

时间信息有误时，页面提示核对任务的日期、时间和时区；时区缺失或无效时，提示核对工厂时区设置并保留当前草案。初始化异常显示重新加载页面、仍失败时联系管理员的操作提示；原始错误仍保存在 `useEngine` 的 `error` 诊断状态中，不直接拼入用户 alert。缺模块时，编辑提示切换只读查看时间安排或重新加载页面。

这些文案不改变严格 UTC/offset 实际时刻、只读回落或页面级失败缓存合同；Z/offset、宿主解析与模块缓存说明继续由本页及展示模型文档承载。Evaluation、UNKNOWN 与真实水印保留。P01 共享 `NvScheduleTimeline` 的通用 UTC/offset/备用轴提示并非 P04 独有文案，本轮记录为跨 owner 延后，不修改共享 renderer 或其任务过滤语义。

## P05：资源只读投影与分组

[#88](https://github.com/Mang-X/nerv-ui/issues/88) 保留公开 `ResourceSchedulerBoard`、全部既有 props/emits 与 `command`。两个中性宿主分别从 `/#schedule-resources/library`、`/#schedule-resources/studio` 进入，可回到时间安排、共读活动和桌面；均为 workspace 源码消费，不是 #11 的打包安装验收。

`model.groupDimensions` 给出维度键与标签，`groupValues[维度键]` 给出全量泳道、名称和同忙时的稳定名录顺序。`groupBy`、`laneOrder` 是受控输入；传入 `groupBy` 时门面不显示内部维度选择器，也不替宿主改写输入。未传入时保留内部选择和 `update:groupBy`。

- `busiest`：工序数降序，同忙回到名录顺序；`name`：按名称排序。这两种保留空泳道、仅块泳道。
- `onlyScheduled`：显式只显示有普通工序的泳道，过滤空泳道和仅块泳道；块、里程碑不计活动数。这是原有筛选语义，并非删除模型。
- 泳道来源依次为全量名录、资源的明确维度归属、任务/块的明确归属。名录标签优先，不因任务数组重排被覆盖。任务 id、资源 id、维度 id 分属不同空间；相同字符串不证明关联，生成泳道 id 与任务冲突时只调整内部泳道 id，公开任务身份保持原样。点击泳道不发 `taskSelect`。
- `ScheduleResource.dimensions?: Record<string, DimensionValue>` 是本票唯一公开类型增量，归 P05 呈现合同：与 `ScheduleTask.dimensions` 同形，让无任务资源明确属于哪个维度。任务自己的维度优先，其次资源明确归属；工作中心可用明确 `workCenterId`。维度存在名录/明确归属时，缺失归属进入“未分配”，不把设备 id 当作另一维度 id。完全没有该维度信息的旧输入保留按资源的兼容兜底；接入方应提供明确归属。

```ts
const resource: ScheduleResource = {
  id: 'room-7',
  text: '晨光书房',
  utilization: 0,
  dimensions: {
    workCenter: { id: 'space-east', label: '东区空间' },
    team: { id: 'reading-group', label: '共读小组' },
  },
}
```

KPI 仅从泳道明确关联的资源/负荷取值。单一资源的 utilization/OEE/切换/待料原值保留；输入有限数值 `0` 是已知零，不隐藏。指标在至少一条可见泳道已知时显示，其他泳道缺失或非有限值为“—”，不补零。全部未知的指标隐藏；全部已知零仍显示。利用率 `>1` 显示百分比与“超出容量”。多资源没有可直接归属的非加性事实时保持未知；负荷齐全时利用率保留既有 assigned/available 呈现汇总，available=0 使用输入 utilization，不推导资格、OEE或领域风险。部分资源缺负荷不伪造完整利用率。

日历分别以 `resourceIds`、`workCenterIds` 的明确空间索引，不跨相等字符串串用；无适用日历不画周末/夜间，不借其他泳道日历。工作中心直接日历优先，否则只有资源成员日历完整时才显示该组的工作窗口并集。`shiftWindows: []` 表示明确无工作窗口，与没有适用日历不同。块按当前维度归属显示，冻结只在 workCenter 维度匹配 `freezeContext` 的明确 id，保持精确区间投影。资源兼容兜底行保留资源关联的日历和块，不继承同串工作中心的日历或冻结。任一任务（包括块）提供 `workCenterId` 即属于该维度的明确信息，判定覆盖完整任务集合；它不提供其它维度的归属。外部替换模型会重建泳道、指标、日历和块，不留旧行。

P04 私有 vendor 子 root、退役 detach 保树、Evaluation 1ms 后析构、实例/container token 与迟到所有权保护保持；共享回归在 [P05 证据](evidence/t07-p05/README.md) 分列。只读不写输入、不发编辑事件；P06/P07 编辑验收、P08 面板、P11 风险、后端 APS 不在本票。

缺模块仍复用 P01 唯一 native renderer；资源归属、排序、空/仅块泳道、块和工作中心保留窗口使用同一投影。native 的 KPI 资源头、班次日历底纹、多刻度、缩放与编辑不具备 vendor 等价能力，不以回落测试替代真实 vendor。商业授权仍 UNKNOWN，未发布。
