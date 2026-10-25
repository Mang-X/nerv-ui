# 排程展示模型与宿主事实（T07/P02）

本票提供候选 `@nerv-iip/scheduling/model` 的纯契约准备入口，可独立消费类型和函数。scheduling 仍未加入 workspace；其主桶、loader、adapter、engine、旧组件与旧测试不在本票通过范围。P03/#86 负责 SDK/业务算法与公开回调隔离，P04/#87 负责整包恢复与真实 DHTMLX。这里使用 P01 的唯一 `NvScheduleTimeline`，无新增 renderer。

## 公开接缝

```ts
import type { ScheduleVisualModel, ScheduleFactInput } from '@nerv-iip/scheduling/model'
import {
  withWorkOrderFacts,
  taskFactRows,
  withFactoryTimeContext,
} from '@nerv-iip/scheduling/model'
import { NvScheduleTimeline } from '@nerv-iip/ui'

const input: ScheduleVisualModel = {
  horizon: { start: '2026-01-15T00:00:00Z', end: '2026-01-16T00:00:00Z' },
  tasks: [
    {
      id: 'reading',
      label: '读一本书',
      start: '2026-01-15T06:00:00Z',
      end: '2026-01-15T08:00:00Z',
      statusLabels: ['借阅已确认'],
    },
  ],
  links: [],
}
const facts: ScheduleFactInput[] = [
  {
    taskId: 'reading',
    facts: [
      { label: '余票', state: 'known', value: 0 },
      { label: '同行者', state: 'forbidden' },
    ],
  },
]
const model = withFactoryTimeContext(withWorkOrderFacts(input, facts), [
  { taskId: 'reading', timezone: 'UTC', label: '书房时间' },
])
// 同一个 model.tasks[].facts 交给图面；taskFactRows 给卡片、表格与详情。
const rows = taskFactRows(model.tasks[0]!)
```

`ScheduleVisualModel` 是 P01 `NvScheduleVisualModel` 的精确类型别名，声明与 renderer 一致；任务/资源身份、facts、statusLabels、links、segments、windows 都由宿主输入。`ScheduleModel` 保留既有引擎字段供后续 adapter 迁移；不是中性宿主的必填字段集。`currentExecution`、`commercialSourceFacts` 是 deprecated opaque `unknown`，不把 SDK 的内部结构复制成库合同；`commercialSourceUnavailable` 同样 deprecated。库不读取这些 legacy payload。

`withWorkOrderFacts(model, inputs)` 保留历史函数名，但参数由 MES 工单数组改成按 `taskId` 的 `ScheduleFactInput[]`；第三个业务布尔参数移除。宿主应把 DTO 映射成 `known(value)` / `unknown` / `forbidden` / `unavailable`，并提供所需标签或 `text`。0 显示为 `"0"`，空字符串保留；`facts: []` 明确无行，缺输入则 `taskFactRows` 给出 `事实 / 未知`。默认三态文案分别为“未知 / 无权读取 / 暂不可读取”。重投影只使用本次输入，不继承上次已知事实；资源改派后的事实新鲜度、交期差、齐套、设备状态翻译、前后序和风险判断都归宿主。

## 时间与窗口

- `factoryTimeInput(instant, timezone)` 接受带 Z/数值偏移且 calendar/clock 合法的实际时刻，输出秒级 wall time；无效/空时区返回空字符串。
- `factoryTimeInstant(wall, timezone, original)` 接受分钟或秒精度 wall time。无操作保存返回原字串，保留原偏移、毫秒和 DST fold 的已知实例；编辑后的唯一时刻输出 UTC ISO，保留 original 的毫秒。DST 不存在或二义性返回 `undefined`；不猜选择。
- `scheduleTime(instant, timezone?, options?)` 缺省、空或非法时区返回“时区未解析”，不使用浏览器时区；合法时区下非法 instant 返回“—”。
- `withFactoryTimeContext(model, context?)` 的输入改为 `ScheduleTimeContext[]`（taskId/timezone/可选 label、unresolvedReason），取代旧工厂 DTO。未提供的任务时区重置为空；模型 timezones 保留空项以使 unresolved 可见，不默选首个工厂，不推导工单汇总。
- 严格 calendar 校验只有一份：P01 renderer 和以上 helpers 共用 ui 的纯 `@nerv-iip/ui/schedule-model` 入口；该入口仅包含 parser 和 visual types。
- `freezeWindow(context, workCenterId)` 的 context 改为 `{ windows: [{ workCenterId, startUtc, endUtc }] }`。宿主给出真实完整区间，缺中心/非法日期/非正时长返回 `undefined`；不使用 asOf/default-window 回退或 MES 冻结资格算法。
- `projectFreezeWindow(window, axisStart, axisEnd)` 按实刻裁剪正相交区间到百分比；非法/反向/零长度轴或无相交返回 `undefined`。无日历就是未提供依据，不注入生产日历。

## 独立消费命令

从仓库根执行（pnpm 11.22.0，Node >=22.18；本机可用 `corepack pnpm@11.22.0`）：

```sh
pnpm -C frontend install --frozen-lockfile
node frontend/contract-consumers/scheduling-model/prepare.mjs
pnpm -C frontend exec tsc -p contract-consumers/scheduling-model/tsconfig.json --listFiles
pnpm -C frontend exec vp test run --root contract-consumers/scheduling-model --config vite.config.ts
pnpm -C frontend exec vp build contract-consumers/scheduling-model --config contract-consumers/scheduling-model/vite.config.ts
pnpm -C frontend exec vp preview contract-consumers/scheduling-model --config contract-consumers/scheduling-model/vite.config.ts --host 127.0.0.1 --port 4192
```

prepare 只在被忽略的 node_modules 链接真实包目录及既有 Vue，消费 package exports；没有 SDK alias、stub 类型或新增 importer。独立阅读/出行宿主可操作事实、时区、wall time 与窗口，直接使用公开 renderer。它是源码 contract consumer，不是 packed/发布验收；聚合命令不会自动执行该 lane。`public.test.ts` 为可重复公开断言，浏览器输入是本地状态，不调用 API/vendor。

旧四个 producer 的原字节在 `frontend/reference-adapters/nerv-iip/t07-p02/`；旧 `task-facts.test.ts` 原字节在 `frontend/reference-tests/nerv-iip/t07-p02/`。这些是非活动来源，原相对 import 按旧路径解释，不能作为新 API 测试。其余旧 mapper/组件/engine 及测试尚待 P03/P04 按新签名迁移；没有宣称它们兼容或通过。migration 与旧仓不写，原业务断言不刷新成新 expected。toModel/evaluateDraft/callback 本票未改。

本票的运行、失败、资源身份和后继边界见 [本轮证据](evidence/t07-p02/README.md)。DHTMLX 9.1.4 Professional Evaluation 材料、水印与声明不变，授权范围 UNKNOWN；本票不加载 vendor。CI、docs #10、packed #11、device、旧消费者、父 #8 组合与发布分别 UNRUN。
