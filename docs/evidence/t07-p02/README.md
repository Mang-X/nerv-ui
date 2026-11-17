# T07/P02 / #85：展示模型、事实与时间边界

仅实施 [#85](https://github.com/Mang-X/nerv-ui/issues/85)，scope:M，单个 integration PR，独立 merger 后决定合入/关票。已批准 spec1 与 implement-spec 图不重访谈。本轮没有独立审核结论；未决异议交 merger。

工作树 `/Users/mang/Project/nerv-ui-worktrees/t07-p02-visual-model`，branch `feat/t07-p02-visual-model`；开工 clean，base `8a9e5b101113c8425d6b3ee57c1da252a79b2fb6` / tree `889696e2d72ebca7b5b61eb44c3797870a0a916f`。交付前 fetch 并 merge `origin/integration/nerv-ui-extraction`，结果 Already up to date。最终 head/tree/PR/clean 在 durable handoff 回读，避免仓内自引用 SHA。

scratch `/tmp/nerv-ui-t07-p02/`；本轮 durable `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p02-implementation-r1/`。原始日志、JSON、浏览器脚本/图、校验脚本和 SHA256SUMS 均在 durable。归档排除 node_modules/cache/cleancheckout/.vite/dist/baseline；只包含本轮材料和历史指针，不复制旧轮材料来充 fresh。

## 范围与实际入口

改动四个 producer（types/factory-time/task-facts/freeze-window）及纯 `scheduling/model` 桶；`ScheduleVisualModel` 复用 P01 exact visual type，日期 parser 从 P01 原字节逻辑提取为同一 `ui/schedule-model` 纯入口，renderer 改为调用它。独立中性 contract consumer 消费实际 package exports；没有 SDK alias/stub、新 renderer 或 vendor 加载。

旧工单事实算法和旧四 producer 在新的非活动 reference-adapters 保存；旧 task-facts 测试原字节移入 reference-tests。来源 base blob/SHA-256 均逐字验证。没有修改 migration。旧主桶/其它 mapper、engine、组件与测试尚未适配，scheduling 仍 inactive，不能将本票称为整包运行完成。

边界复核：额外文件只承载公开入口、独立消费者及直接文档/证据；没有引入 toModel/evaluateDraft/callback、工作流、资格或求解算法。P03/#86 接手旧 DTO 调用迁移与所有旧算法/断言归属；P04/#87 接手 workspace/vendor 全包恢复。旧字段 `currentExecution` / `commercialSourceFacts` 标记 deprecated opaque unknown；准确签名和例子见 [接入文档](../../scheduling-model.md)。

## Requirement evidence

同一独立入口命令：

```sh
node frontend/contract-consumers/scheduling-model/prepare.mjs
pnpm -C frontend exec tsc -p contract-consumers/scheduling-model/tsconfig.json --listFiles
pnpm -C frontend exec vp test run --root contract-consumers/scheduling-model --config vite.config.ts
```

类型清单 129 个文件，SDK/business-core/auth 命中 0；不是 0 matching filter。准备脚本只链接真实公开包和既有 Vue，源码消费不是 packed 证明。

| Requirement                                                                       | Evidence                                                                                                                                                                                                                  |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 两个非工业 model，声明与 renderer 一致                                            | `public models support reading and travel without domain identifiers`；`models.ts` 的阅读/出行只用 `ScheduleVisualModel`，不填工单/工序身份；pure tsc exit0                                                               |
| known 0/空字串与 unknown/forbidden/unavailable/明确空数组分离，host status labels | `host facts preserve unknown forbidden unavailable empty and zero independently`；断言完整五行、重投影清除旧事实、空数组、原输入不变及 statusLabels；缺输入的图面 facts 也显式为“未知”                                    |
| calendar 合法且时区不 fallback                                                    | `strict time rejects absent calendar and unspecified zones`；`strict valid calendar %s displays %s` 三例、`strict invalid instant %s remains unknown` 六例；非法月末/1900 与 2000 闰年、24:00、offset、无偏移都有固定预期 |
| UTC/offset 无操作保留原偏移/毫秒，wall/instant 显式边界                           | `offset and milliseconds survive unchanged UTC and offset wall input`；三个原始字串及唯一编辑 UTC 结果；`invalid original and empty zone never bypass wall conversion checks`                                             |
| DST 不存在与二义性不猜                                                            | `DST gaps and folds reject edits while the original fold instant remains unchanged`；纽约 gap/fold 编辑 undefined、原 fold 偏移/毫秒原样、唯一相邻 wall 的 UTC 固定结果                                                   |
| 部分 zone 上下文/模型更替不选择首工厂                                             | `task zones remain explicit across partial context replacement without first-factory fallback`；遗漏变空、axis 保留空项、原输入不变                                                                                       |
| 冻结窗口来自 host 真实完整输入，不注入 MES/default calendar                       | `host freeze intervals project literally without default calendar or implicit fallback`；start/end 原偏移、独立 epoch、缺中心/null 未知；浏览器 input→window 读回                                                         |
| 窗口几何只裁剪真实正相交，非法输入不伪造窗口                                      | `freeze rejects invalid dates and clips only positive overlap on a valid axis`；非法日期/无offset/零反向时长/轴相邻与非法轴；百分比 literal 断言                                                                          |
| 真实 host 复用 public renderer；零/未知/偏移/zone/模型替换可见                    | `browser/03-final.mjs` / `contract-results-final.json`：16 项读回，含同 ID 换出行、清空旧事实/窗口/保存回显、无操作保存、DST拒绝、时区变化和真实像素；1440/640 PNG 已查看                                                 |

公开测试最终 **19 passed**；`raw/final-public.json`。测试名逐项展开在该 JSON。报告 success=true、failed/pending=0、每条 passed；unhandled 计数字段实际不存在，保存 null，日志未见 unhandled/uncaught 标记，不虚构字段。

## 公开 RED → GREEN 与诊断 FAIL

- `entry-red`：固定旧包没有 `/model` 纯入口，公开 import 失败（inner exit1），没有匹配到可执行断言。这是预期入口 RED，不能记为通过。
- `legacy-public-types-red`：git archive 固定 base 原包及原 export map，独立 `import type { ScheduleModel } from '@nerv-iip/scheduling'`，tsc exit2；原 `model/types.ts` TS2307 api-client。完整 root graph 还有其它缺依赖/声明诊断，原日志保留，不声称只有一个错误。未添加 SDK alias/stub。
- `facts-red`：旧函数推导 MES 字段，无法保持五种明确事实输入；GREEN 后对应完整行断言通过。
- `time-red`：旧 Date.parse 把 2/30 rollover，省略 zone 使用浏览器时区；GREEN 共用 P01 strict parser，invalid/empty/missing zone 明确 unresolved。
- `freeze-red`：旧 asOf/defaultWindow 输入无法消费 host 的完整窗口；GREEN 新窗口输入与独立 epoch/裁剪断言通过。
- `facts-renderer-red`：缺 facts 时仅 taskFactRows 显示未知而 renderer facts 为空；补断言先红，再让投影的同一 facts 行显式含未知，最终 GREEN。
- `freeze-green` 与早期 `public-green` 文件名不是状态：各曾有 **1 FAIL**，原因是百分比乘除次序的浮点 ulp；改用 1e-10 容差的独立 literal，原日志保留。未调整产品几何来迁就测试。
- 首次 pure tsc 从 UI 主桶拉入 Vue 声明而 FAIL；改为公开纯 ui/schedule-model 类型入口后 exit0。首次 consumer build 参数 `--root` 不被 build CLI 支持，纠正 positional root 后又发现独立 consumer 的真实 Vue link 缺失；prepare 加链接到既有 Vue 单例，最终 build exit0，无 deps 升级。独立 host vue-tsc 首次绝对 Vite 子路径 lookup FAIL，读取实际包 exports 后改用真实 `dist/vite/client.d.ts`，exit0，未加 stub。

所有失败都是本轮证据；后续 PASS 不覆盖前述历史。systematic-debugging 用于实际诊断。TDD/code-testing intermediate research/plan/status 在 scratch，未入 Git。

## Fresh 运行与资源

`gates.mjs` 串行实际执行：UI **805**、mobile **144**、host **294**（`--fileParallelism=false`）、UI docs-source **6**、mobile docs-source **2**。各 exit0、JSON success=true、failed/pending=0、非零断言全 passed。活动三包 typecheck、根 build exit0。公开契约最后一次变更后单独重跑 19、pure tsc、独立 host vue-tsc/build；共享 parser/活动包之后未变。源码 lint、受影响 source/docs fmt、scope diff-check 见最终 raw 结果。没有把局部 lane 称为全 scheduling 测试。

独立 consumer 的最终 production build 提供 `127.0.0.1:4192`。浏览器实际 no-store GET 的 **4** 个资源（URL/status/MIME/bytes/SHA-256）与本轮 dist body 相等，见 `browser/resource-identity.json`。只对相同实际 body 支持相关行为证据；早轮资源不冒本轮 fresh。

T3 preview_status/open 成功；snapshot 连续两次 raw `Preview snapshot failed: Preview automation snapshot timed out after 15000ms.`，随后使用已安装 ego-browser 0.6.1.9（无升级）。16项最终 browser 完整执行，无用 CLI exit0 代替结果文件。运行时异常事件覆盖 UNKNOWN，不能从 event buffer 推断 0 exceptions。自有浏览器/服务关闭与 page scale/CSS zoom 归一结果见 cleanup。

## 依赖、provenance 与接缝

16 个既存工程输入完整逐字比较：14 个不变，仅 scheduling/package.json 增加 `./model`、ui/package.json 增加 `./schedule-model` exports；依赖版本/包名/scripts 均不变。无 importer 新增，无 workspace 恢复。完整解析 lock YAML 所有字段、依赖/peer/optional 边对象相等，**973 packages / 973 snapshots**；不以 keys-only 比较代替。ui/mobile/playground/独立 consumer 的 Vue realpath 同一份。`raw/integrity.json` 保留逐项 SHA。

旧源 `/Users/mang/.t3/worktrees/Nerv-IIP/t3-5c5dc61d` HEAD `79b1578f2b75f55709765b5e7882aaf33146c603` / tree `58e30c637acb7efdd393af291e570288b03b5aa9`，只读且 clean；旧 local main `ecb7626378e446dcc361cfc4f3c43227ba7e8364` 与 tracking/live remote `7b7bbb4fbc41970bb7e17392daf196a0fc72eb6f` 分列，未 fetch 旧 refs。新库 root integration 保持 base/clean，新 main `599031a688496679e300458f56a1896d41ac8f81` 未动；末次精确回读在 durable。

## 继承、UNKNOWN 与 UNRUN

P01 独立 merger R3（`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p01-review-r3/review-receipt.md`）为已合能力与原始 parser 来源，原 material finding/FAIL/修复历史不改。本轮的相同计数源自 fresh 执行；P01 更大浏览器矩阵未重跑。旧默认并发 host FAIL 根因仍 UNKNOWN，本轮默认并发 lane UNRUN，串行成功不修 timeout/skip。Full RAW main→candidate 与本票 maintenance diff-check 分列，历史空白不顺修。

UNRUN：scheduling 全包/旧 consumer、真实 DHTMLX/P04 与后继 P03–P16、CI、完整 docs #10、packed #11、device、旧接入 #13/#15、父 #8 组合、发布。DHTMLX9.1.4 Professional Evaluation vendor/材料/水印不变，授权范围 UNKNOWN。#43/#51/P3 没有扩修。未 merge/close/ready 总 PR18/watch/poll/publish，子 PR 保持 draft；独立 merger 接手。

收尾补录：文档 formatter 的相对父路径、repo-root vp 包定位和 IDE-only oxfmt wrapper 三次调用分别 FAIL；改为从 frontend 调 vp、传根文档的绝对路径后实际 exit0，原日志不删。非产品 FAIL。共享 parser 提取后的函数体与 base 完全相同（仅公开函数名变化），`raw/parser-extraction.json` 回读确认。自有 Ego TaskSpace52 finish keep[]、CSSzoom/visualScale 均1，T3 tab 已关，4192 服务 SIGINT exit130、lsof 无监听；这是主动清理退出。

公开类型补录：`projected declarations replace literal host facts and zones with actual output types` 对 readonly literal 输入断言投影后的 zone/fact value 为 string，并核运行值与原输入不变；原泛型交叉推断出 never，`literal-types-red` tsc exit2；用 Omit 明确替换 model/task 字段后 `literal-types-green` exit0。运行函数体未改变，最后重建 dist 与已测 browser body 的相等性另行核对。最终公开断言19，类型图仍129文件/无SDK。full RAW diff-check exit2，本票 scoped maintenance exit0，原始日志分开保留。
