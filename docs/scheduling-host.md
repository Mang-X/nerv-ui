# 排程宿主回调契约（P03）

P03 提供独立的 `@nerv-iip/scheduling/host` 源码入口，供宿主加载、映射、校验和提交自己的排程数据。它不调用 SDK，不求解、不推导容量/前序/交期，不判断权限或保存数据。展示模型见 [scheduling-model.md](./scheduling-model.md)。

当前 scheduling 仍未加入活动 workspace；独立 consumer 通过真实 package exports 和本地包链接消费。完整引擎解析、原调用更新和 DHTMLX 接线由 [P04 / #87](https://github.com/Mang-X/nerv-ui/issues/87) 负责。这里的 source consumer 成功不代表 packed 安装、整包或 vendor 成功。

## 公开名和准确签名

这些既有名字仍由根桶导出，也由 `/host` 导出；旧的隐式业务签名已明确改变。旧消费者须显式迁移，不会自动继续调用 Nerv-IIP SDK。`ScheduleModel`、`DraftFeedback` 等库自有类型从 `/model` 消费，旧根桶类型名仍保留。

```ts
// 同步 projection；参数与输出泛型保持宿主的准确类型。
type ScheduleModelAdapter<Source> = (source: Source) => ScheduleModel
type LockedAssignmentsAdapter<Assignments> = (model: ScheduleModel) => Assignments
function toModel<Source>(source: Source, adapter: ScheduleModelAdapter<Source>): ScheduleModel
function toLockedAssignments<Assignments>(
  model: ScheduleModel,
  adapter: LockedAssignmentsAdapter<Assignments>,
): Assignments

type DraftValidator = (model: ScheduleModel) => DraftFeedback
function evaluateDraft(model: ScheduleModel, validator?: DraftValidator): DraftFeedback

type MaterialReadyFormatter<Fact> = (fact: Fact) => string | undefined
function materialReadyLabel<Fact>(
  fact: Fact,
  formatter?: MaterialReadyFormatter<Fact>,
): string | undefined
```

`toModel` / `toLockedAssignments` 将原参数原样传给显式 adapter，返回宿主的结果；不内置 assignment ID、锁定分配、工序关系或领域风险规则。缺 adapter 在类型层被拒绝，运行时也不会成功。投影、validator、formatter 的异常同步向调用者传播。

`evaluateDraft` 无 validator 时，每个非 block 的 operation 都得到 `unknown / 宿主未提供校验依据。`；空模型返回空表不表示业务校验通过。validator 的返回值代表宿主自己的判断。`materialReadyLabel` 不再按浏览器时区生成“预计到料”日期；未提供 formatter 返回 `undefined`。宿主可以提供已格式化字符串、未知状态或自己的时区格式化函数。现有引擎/详情对旧 helper 的调用仍需 P04/P08 按宿主标签合同迁移，不能声称所有旧显示已兼容。

```ts
type SchedulingContext = unknown // 兼容名字；宿主定义自己的具体 Context 类型。
interface SchedulingPlanRequest<Context> {
  planId: string
  context: Context
}
interface SchedulingPlanDeps<Source, Context> {
  load?: (
    request: SchedulingPlanRequest<Context>,
    control: { signal: AbortSignal },
  ) => Promise<Source | undefined>
  adapt?: ScheduleModelAdapter<Source>
}
function useSchedulingPlan<Source, Context>(
  planId: Readonly<Ref<string | undefined>>,
  context: Readonly<Ref<Context | undefined>>,
  deps?: SchedulingPlanDeps<Source, Context>,
)
```

返回 `model: ShallowRef<ScheduleModel | undefined>`、`loading: ShallowRef<boolean>`、`error: ShallowRef<unknown>`、`status: ShallowRef<'idle' | 'loading' | 'ready' | 'unknown' | 'error'>`、`reload(): Promise<boolean>`、`cancel(): void`。输入 context 是宿主自有、可 JSON 序列化的值，不再要求 organizationId/environmentId。请求收到捕获的 planId、context 深拷贝和 AbortSignal；adapt 收到 loader 的准确 source。返回的 model 独立克隆。

- setup/effectScope 内调用；立即读取。planId/context（含深层变化）改变时同步取消旧请求、清空旧模型并加载。
- 缺 planId 或 context=undefined 为 idle；缺 load/adapt 或 load 返回 undefined 为 unknown，不假造空计划/成功。context=null 可作为宿主显式值。
- 最新请求才可提交 model/error/loading。旧 A 在 B 后成功或失败都不改变 B；scope dispose/unmount/cancel 后亦不提交，即使宿主忽略 AbortSignal。
- `reload` 仅在本次最新结果提交为已知 model 时返回 true；失败、缺回调、缺输入、取消或过期均 false。最新异常存 error/status=error，可再次 reload；手动 reload 失败保留此前 model，换上下文则先清空。
- cancel 令请求失效、loading=false/status=idle，保留当前 model；不替宿主撤回已发生的外部副作用。

```ts
interface SchedulingEditControl<Context = unknown> {
  signal: AbortSignal
  context: Context | undefined
}
interface SchedulingEditsDeps<Context = unknown> {
  context?: Context
  preview?: (
    snapshot: ScheduleModel,
    control: SchedulingEditControl<Context>,
  ) => Promise<ScheduleModel>
  release?: (planId: string, control: SchedulingEditControl<Context>) => Promise<void>
}
function useSchedulingEdits<Context = unknown>(
  model: Ref<ScheduleModel>,
  deps?: MaybeRefOrGetter<SchedulingEditsDeps<Context>>,
)
```

返回既有 `dirty/canUndo/canRedo/busy/error`、`onTaskDragEnd(TaskDragPayload)`、`setLocked(taskId, locked)`、`undo()/redo()`，并新增 `status: ShallowRef<'idle' | 'pending' | 'success' | 'unknown' | 'error'>`、`cancel(): void`。`repreview()/release()` 现返回 `Promise<boolean>`：只有当前操作被接收/确认才 true；busy、取消、过期、卸载或缺回调为 false。当前失败保留 model/history/dirty，error/status=error 并重新抛出，允许 retry。

preview 收到本地草案的独立 JSON 快照（不是 SDK 锁定分配数组）；release 收到捕获的 planId；两者收到捕获 context 克隆和 signal。宿主在 preview 内按需调用 `toLockedAssignments(snapshot, hostAdapter)` 再请求自己的后端。宿主可修改快照而不会污染当前草案。返回模型也独立克隆。

同一实例 pending 时 preview/release 及本地编辑不重复执行；外部 model 替换（包括同一 reactive 对象的嵌套更新）或 context 变化会取消旧操作并重设 baseline，旧结果/异常不污染新草案或新 busy 状态。context 改变不自行替宿主选择新模型，宿主应同步更换权威 model。取消仅隔离结果，权限、存储幂等及实际取消由宿主负责。本地编辑总是替换克隆，不修改传入对象；撤销/重做仅管理本地视觉历史，不是业务工作流。

## 从旧调用迁移

| 旧调用                                              | 新调用及责任                                                                                    |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `toModel(apsPlan)`                                  | `toModel(apsPlan, hostPlanAdapter)`；领域映射在宿主                                             |
| `toLockedAssignments(model)`                        | `toLockedAssignments(model, hostLocksAdapter)`；返回准确宿主类型                                |
| `evaluateDraft(model)` 内置 APS 建议                | `evaluateDraft(model, hostValidator)`；无 validator 明确 unknown                                |
| `materialReadyLabel(risk)` 隐式本地日期             | `materialReadyLabel(risk, hostRiskFormatter)`；缺 formatter 不造标签                            |
| `useSchedulingPlan(id, context)` 隐式 HTTP/envelope | `useSchedulingPlan(id, context, { load: hostLoad, adapt: hostPlanAdapter })`                    |
| `preview(lockedAssignments)`                        | `preview(snapshot, { context, signal })`；宿主自行提取固定分配再 preview                        |
| `release(planId)`                                   | `release(planId, { context, signal })`；原只取第一个参数的函数仍可赋值，但取消/权限须由宿主实现 |

可类型消费的完整中性示例（含 source、Context、readonly output 的负向断言）在 [consumption.ts](../frontend/contract-consumers/scheduling-host/consumption.ts)，没有 SDK 声明替身：

```ts
const plan = useSchedulingPlan(id, context, { load: hostLoad, adapt: hostPlanAdapter })
const edits = useSchedulingEdits(localDraft, () => ({
  context: context.value,
  preview: async (snapshot, { context, signal }) => {
    const fixed = toLockedAssignments(snapshot, hostLocksAdapter)
    const source = await hostPreview(fixed, context, signal)
    return toModel(source, hostPlanAdapter)
  },
  release: (planId, { context, signal }) => hostRelease(planId, context, signal),
}))
if (await edits.repreview()) showAccepted()
```

上述 host 函数均由接入应用实现，库中没有它们的生产 fake 算法。`SchedulingWorkbench` 仍为内部组合，不新增公开导出。它的 preview/release 参数使用上述签名，新增 opaque `context?: unknown`；每次读取最新 props，移除默认空成功回调；父级 model 是权威输入：对象替换与同一 reactive 对象的嵌套更新都会同步复制为独立草案、清除旧选择并失效旧 preview/release；本地锁定、撤销/重做不回写 props，也不会触发这条输入重置。对已经传入的 reactive model/context，同 tick 的动作读取当前输入；父级替换 props 后的 DOM 操作仍等待 Vue 将 props 传入组件。context 单独变化沿用现有约定，只取消操作并以当前草案重设 baseline，不代宿主选择新计划。模型清空时清除本地草案，成功 boolean 为 true 才提示成功。实际 renderer 和完整组合仍由 P04/P16 证明。

## conformance 的明确兼容处置

`runEngineConformance` 的 test-only 注册入口改为：

```ts
import { runEngineConformance, type SchedulingEngine } from '@nerv-iip/scheduling/test-support'
runEngineConformance(() => makeYourEngine()) // (makeEngine: () => SchedulingEngine) => void
```

`/test-support` 仅供 Vitest；它导出引擎类型及 ScheduleModel，使用直接构造的中性模型，不引 SDK、APS fixtures 或求解。根桶保留同名 deprecated 函数 `(makeEngine: () => SchedulingEngine) => never`，调用立即抛出带 `/test-support` 迁移路径的错误；不会异步注册测试，也不会导入 Vitest。原根桶调用必须迁移，这是显式运行兼容变化。

P03 的 public selfcheck 仅证明测试入口能注册并约束 test double 的 DOM/事件合同；真实 DHTMLX、vendor 加载、许可和 APS 全部另验。

## 来源、依赖和后继

原 APS mapper、draft validator、material formatter、SDK loader/旧 edits、conformance、两套 fixtures 与三份业务断言，按基线原字节保存在新建的 `frontend/reference-adapters/nerv-iip/t07-p03/` / `frontend/reference-tests/nerv-iip/t07-p03/`。它们是非活动来源材料，保留原 import 坐标，不承诺在那里可运行；不加入 workspace、不从 runtime 导入，也不 vendoring SDK。P02 的四 producer / 旧事实断言仍留原 reference。详 [证据页](./evidence/t07-p03/README.md) 的 provenance 和原64文件归属。

两项 `workspace:*` SDK/business-core 运行依赖从候选 scheduling package.json 移除；未恢复 workspace、未改 importer/lock。旧 UI/engine 测试尚有旧 mapper/fixture 调用，由 P04/P08 按其 owner 更新；这是明确未完成，不通过 exclude/skip 抹掉失败。P04 先恢复真实整图与测试输入，P08 更新面板显示，P09/P16 再处理对应草案/工作台组合。P3 年份0099/no-op、#43/#51 均未扩修。DHTMLX 9.1.4 Professional Evaluation 材料/水印未变，授权 UNKNOWN。
