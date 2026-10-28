# T08/C02 候选证据

base `1c04eeef33dad322df5b337cbb49ccd4b8edc654`，tree `245d422983f51db85dc0feee9a3a6d579bd21ba9`。唯一 checkout `t08-r16-action-summary` / `feat/t08-c02-directory-detail`。fetch 最新 integration 无 delta，无 reset。

scope:M：一个筛选工作台和详情抽屉，复用 NvEntityPicker/FilterBar/DataTable manual/Sheet/Timeline，无新导出、依赖或 shadcn 修改。书房和画室为内存宿主；原应用接入 NOT_PLANNED。

来源固定 `79b1578f2b75f55709765b5e7882aaf33146c603`。DirectoryPicker/SuggestInput 的目录与自由查询意图保留，SDK/auth 不迁移；FulfillmentTimelineSheet/Body/Node 状态与重试改为 host callback，useFulfillmentTimeline 的领域查询与算法不迁移。sales/orders 与 mes/work-orders/index 消费接缝已抽查；完整消费者模板/CSS 盘点未完成，长来源输出有截断，不声称完整审核。素材未修改。

## fresh RequirementEvidence

`frontend/apps/playground/src/directory-detail/DirectoryRecipe.test.ts`：

- 失败分页保留原窗口和安全错误。
- page 使旧创建回执失效并保留草稿：red-01 真实断言 FAIL，green-01/02 PASS。
- source 更换拒绝旧 query success（测试名称虽有 failure，当前仅测 success）。
- 缺 receipt 保留创建草稿。
- 详情 0、单源 retry、未关联、安全异常。
- controlled keyword 拒绝保持宿主值。

最终 final-01.json：6 PASS/0 FAIL，exit 0。精确 cwd playground：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/directory-detail --reporter=json --outputFile=<唯一绝对报告>`，先 --help 核实。单选/级联清空、stable-key 重排替换删除、close/unmount 旧 failure/finally、受限/空记录完整 DOM 矩阵未执行，六项 PASS 不代表全 AC 验收。

原始 logs/JSON 位于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-28/t08-c02-resume-r2/`。green-03 为 5 PASS。vue-tsc 首次因泛型组件定位类型 FAIL，改 DOM 分页后 PASS；最终 types-02.log exit 0。vp build exit 0，保留 PURE annotation warnings。scoped fmt/lint exit 0，diff check PASS。frontend pnpm 11.22.0；root 12.0.0 仅观察，不作正式入口。读取和文档写入曾 cwd 错误，纠正后保留事实，不计 RED。

前轮误包脚本触发 vendor 全桶 432 PASS/1 timeout，原始完整日志缺失；未重跑。旧 globalfmt3/mainRAW2/docsaliasENOTDIR/parallel timeout 未修未重复。runtime unhandled 独立字段缺失 UNKNOWN。

Browser/视觉/HTTP/docsLive/CI/packed/device/vendor APS/production UNRUN，许可 UNKNOWN。DOM 不作视觉 PASS。#23 PR128/#43 PR122 不动、#37 不解锁。保持 draft 交父独立审查，无自审/ready/merge/close。
