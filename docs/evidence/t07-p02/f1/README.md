# T07/P02 · PR101 · R1 SPEC-1 联合任务声明修复

仅处理 [#85](https://github.com/Mang-X/nerv-ui/issues/85) / [PR101](https://github.com/Mang-X/nerv-ui/pull/101) 的 R1 SPEC-1/P2。R1 结论仍为 Standards material 0 / optional 0，Spec material 1/P2 / optional 1/P3；本轮实施证据不代替独立 R2。PR 保持 draft，#85 等待独立审核，P03/#86 仍等 #85，P04/#87 后续。

工作树 `/Users/mang/Project/nerv-ui-worktrees/t07-p02-visual-model`，branch `feat/t07-p02-visual-model`。开工 clean，固定 head `f21cb9eba5518311dea826a3c93fded2d1a1265e` / tree `205c4532c9b0ad5e496f6da575eadc2a2ec279ec`；base/integration `8a9e5b101113c8425d6b3ee57c1da252a79b2fb6` / tree `889696e2d72ebca7b5b61eb44c3797870a0a916f`。交付前 fetch/merge 与最终 head/tree/clean 见 durable handoff，避免仓内自引用 SHA。

scratch `/tmp/nerv-ui-t07-p02-union-fix/`；durable `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p02-union-fix/`。仅归档本轮脚本、原样 probe 副本、日志、JSON、回执及历史指针；过滤 node_modules/cache/cleancheckout/.vite/dist，附 SHA256SUMS 并逐文件回读。校验和证明文件完整性，不代表全文审核历史材料。

## 根因与最窄改动

两处 `Omit<M['tasks'][number], ...>` 仅保留联合共有键。输入为 `as const satisfies ScheduleVisualModel` 的 read/walk 两 task 时，runtime spread 保留 read.segments / walk.attentionLabel，返回声明却丢失字段与 id 缩窄关系。

`factory-time.ts` / `task-facts.ts` 改用按 task 联合成员分配的映射类型，仅排除将被替换的字段；其它字段及 readonly/literal 关系保留。timezone/factoryTimeLabel 替换为 string，facts 替换为 readonly display rows，不与旧 literal 交叉成 never。没有新增 any、类型断言、公开函数名或运行逻辑；两个 producer 的去注释 TypeScript emit JS 与 R1 逐字相同。测试通过真实 package exports 消费，没有镜像实现测试或 SDK stub。

## Requirement evidence

新增正式测试：`mixed readonly tasks retain id narrowing and literal fields after facts and time replacement`，位于 `frontend/contract-consumers/scheduling-model/public.test.ts`，由同一 consumer 的 tsc 与 runtime 两 lane 检查。

- 混合联合与两支缩窄：两投影各自按 read/walk id 分支访问 segments/attentionLabel；精确断言 Read/Walk/Rain、readonly segments tuple 类型及运行 literal。
- 字段替换与真实声明：旧 oldzone/oldfacts 为 readonly literal，分别验证被替换字段为 string、未替换字段保留 literal，运行值为空 zone / 未知事实；两种组合顺序仍可缩窄且可赋给 ScheduleVisualModel。原输入未突变。
- 原单任务回归 `projected declarations replace literal host facts and zones with actual output types` 保留。原 19 项测试全文在剔除新增 import/测试后与 R1 字节相同，未改写旧断言掩错。

实际命令均从上述显式工作树执行，task-local pnpm shim 固定 corepack pnpm 11.22.0 并覆盖 nested 调用：

```sh
node frontend/contract-consumers/scheduling-model/prepare.mjs
pnpm -C frontend exec tsc -p /tmp/nerv-ui-t07-p02-union-fix/spec-probe/tsconfig.json --pretty false
pnpm -C frontend exec tsc -p contract-consumers/scheduling-model/tsconfig.json --pretty false --listFiles
pnpm -C frontend exec vp test run --root contract-consumers/scheduling-model --config vite.config.ts
```

| Lane                             | RED，修复前                                          | GREEN，修复后                                  |
| -------------------------------- | ---------------------------------------------------- | ---------------------------------------------- |
| R1 原样 union.ts / tsconfig.json | tsc exit2，恰两条 TS2339                             | tsc exit0                                      |
| 正式 consumer 同一预期测试       | tsc exit2，16 条 TS2339/TS2344，字段丢失及关联被打散 | tsc exit0，129 files，SDK/business-core/auth 0 |
| R1 原样 merger-runtime.ts        | exit0，保留 segments/attentionLabel                  | exit0，输出与修复前逐字相同                    |
| 正式 consumer runtime            | exit0，20/20                                         | exit0，20/20                                   |

原样 probe 三文件 SHA-256 与 R1 durable 相等。runtime 通过本来就不能证明声明正确，故 RED 只指类型 lane；不把 20/20 runtime 称为修复前类型通过。GREEN JSON 实际 success=true、failed/pending=0、所有 20 条及 suite 状态 passed；unhandled 字段实际不存在，记 null，日志 markers=[]，不虚构异常计数。完整命令/cwd/exit 在 `raw/commands.jsonl`，验证在 `raw/verification.json`。

初次新增测试把非 NvScheduleTask 字段 factoryTimeLabel 直接写进 satisfies 字面量，额外触发两条 TS2353；该测试准备 FAIL 保留于 `formal-consumer-red.log`。移除超出该 visual 合同的 fixture 字段后、产品尚未修改时，另跑 `formal-consumer-red-corrected.log`，仅剩上述 16 条目标诊断。没有放宽公开合同或隐藏错误。

新增证据页首次 fmt check exit1（Markdown 表格排版），随后只格式化本页并复查；首次 FAIL 日志保留，不涉及产品或断言变更。

## Fresh、继承与完整性

Fresh：活动 ui/mobile/playground 三包 typecheck、独立 consumer production build、受影响三源码 lint/fmt 均 exit0；公开 20 项及上述两个类型 lane 实跑。两 producer emit JS 字节相同，原样 probe runtime 输出相同。重建 consumer dist 的 HTML/JS/CSS/字体共四 body，其 bytes/SHA-256 与 R1 实际 browser status200/MIME/body 完全相同；`raw/verification.json` 逐项列出。R1 的 16 项 production browser 行为只按这四 body **精确继承**；本轮 fresh browser UNRUN，未创建 browser/service，无需恢复自有 zoom。

本轮未重跑 UI805/mobile144/host294 串行、docs-source6+2、根 build 和独立 host 附加 vue-tsc，沿用 R1 对应记录并明确为继承。旧默认并发 host FAIL 根因 UNKNOWN、默认并发 lane UNRUN，串行 PASS 不改其结论；未改 timeout/skip。

Fresh 完整 YAML 对象 deepEqual（含依赖/peer/optional 边及值）：973 packages / 973 snapshots，importers 相等；Vue 四消费点 realpath 单例。相对 base 的 16 工程输入准确为 14 份逐字相同、两份仅 exports manifest 变化；相对 R1 16 份全部逐字相同，没有升级或恢复 workspace。原四 producer reference 与原 task-facts 测试逐字等于 base 来源；migration/vendor/parser 未改。旧源 HEAD `79b1578f2b75f55709765b5e7882aaf33146c603` 只读，root/main 不动；旧 local main 与 tracking/live remote 分列于 pins，不混为同一对象。

full RAW main→candidate diff-check exit2 与本票 base→candidate maintenance exit0 分列保留；不清理历史 RAW/vendor 空白。所有既往 FAIL/UNKNOWN 均保留于原档，后续 GREEN 不覆盖原结论。

## 延后与 UNRUN

SPEC-O1/P3：0099、0000、extended-year 无操作回存边界明确延后。R1 `spec-probe/assertions.json` 原 **7 PASS / 1 FAIL** 保留，未重写或重跑成全 PASS；未改变 P01 parser 合法性、wall 格式或日期合同。#43/#51/其它旧 P3 均不扩修。

整个 prepared contract 仍 inactive；scheduling 全包、主桶、SDK/callback 隔离、旧 consumer、真实 DHTMLX9.1.4 Professional Evaluation/P04 与后继、CI、完整 docs#10、packed#11、device、旧接入#13/#15、父#8、发布均 UNRUN。Evaluation 材料/水印保留，授权 UNKNOWN。不 ready/merge/close/publish/watch/poll，不改总 PR18 或后继。

历史指针（原文保留，不复制旧 RAW 充 fresh）：

- `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p02-review-r1/review-receipt.md`
- `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p02-review-r1/spec-axis-review.md` 与 `spec-probe/`
- `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t07-p02-implementation-r1/handoff.md`
- `/tmp/nerv-ui-t07-research.md`、`/tmp/nerv-ui-implementation-context.md`
- 既往完整 P02 证据：[上一轮记录](../README.md)。
