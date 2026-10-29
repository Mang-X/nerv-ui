# T09/F19 基础日期实施候选

范围 M，#189，父 #10；仅日期文档宿主、局部 DOM 测试与证据。基线 `5e0f3d6ea49f4336bdcf8fccdd3d3f8d73957406` / tree `4247daca8becc39522462a530362f714724a2eec`；PR #188 已合并。末次 fetch integration 未漂移。

公开主桶 DatePicker / DateRangePicker 的 producer 位于 `frontend/packages/ui/src/components/ui/date-picker/`，实际 Reka 2.10.1。单日 string/null；范围 DateRangeValue from/to，部分更新、双端 apply。清除 null/clear 并关闭。未改 producer、API、冻结区、锁或治理。原 Nv 示例保留。

## 本地执行

固定入口 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs`。docs cwd `frontend/apps/design-system`，执行 `exec vitest run --config vitest.config.ts`：基线 23 文件 91/91；最终 24 文件 94/94。旧测试文件逐字节一致。183 旧页保留，除本页新增 import/段落外其余页逐字节一致；本页原 Nv 内容保留。Markdown 非空二次 cmp 通过。

| 要求 | 测试证据 |
| --- | --- |
| 单日选择、apply/关闭、清空 | `selects single day through public calendar and clears with local feedback` |
| 范围部分更新、双端采用/关闭、清空 | `selects range endpoints through public calendar and clears` |
| 禁用入口、外部替换/恢复、恢复后选择 | `disables both entrances and restores external values before real selection` |

初始缺示例导入失败不是行为 RED；第一次 DOM 测试因不转发 aria-label 失败，后续 selector 修正；范围 trigger slot 修正前 1 FAIL/2 PASS。移除单日 v-model 的行为反证 2 FAIL/1 PASS，恢复后最终 94/94。日期从固定已选六月推导显示月份，不依赖当前月份；选择由公开 DOM click，不使用 vm emit。

`exec vue-tsc --noEmit -p tsconfig.json`、docs types/build、三个变更 TS/Vue 文件 scoped `vp lint` / `vp fmt --check`、`git diff --check` 通过。build 包含站内死链检查；原 Markdown 链接与同源学习代码入链保留。CSS stylesheet 解析告警与 Rollup PURE 注释告警原样保留。准备阶段 sed 编辑语法及 Python 相对路径失败已记录，不抹除。历史 81/82 FAIL 未在本轮重现或改判，细节 UNKNOWN。

## 证据边界

外部原始记录：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f19-implementation-r1/`，含 baseline、RED、反证 RED、全部 GREEN、types/build/lint/fmt、retention 和 source SHA-256。无 dist/deps 入证据。

browser/HTTP、1440/390 亮暗、真实鼠标选择/Tab/Enter/Esc、窄屏长内容末端清除可达：独立席 UNRUN；runtime 数字 UNKNOWN。CI 空不是 PASS；packed/device/production UNRUN。旧应用接入退出 NOT_PLANNED。这里只交 draft，不签署独立审核/runtime/ready/merge/close/watch，不改变父票。
