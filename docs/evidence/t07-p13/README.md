# T07/P13 实施证据

本记录对应 [#96](https://github.com/Mang-X/nerv-ui/issues/96)，实施起点为 `feat/t07-p13-async-candidates` 的 `62a3a62ad57b3fb3bd2309e9966d4e2554f67f61` / tree `d510380fb5a2ba7a271e7567c3c2473817c5e938`。最终候选 head/tree、clean、PR 与上游整合结果见本轮独立 handoff；这里不将后续合并称为本席验收。固定旧源 `79b1578f2b75f55709765b5e7882aaf33146c603` / tree `58e30c637acb7efdd393af291e570288b03b5aa9` 只读，`migration` 未改。

## 来源和接缝

四个冻结私有 Vue 的 Git blob 分别为 `SchedulingCandidatePanel.vue` `6688357f80da2b8f4a340aec0c74445dda12a8e9`、`SchedulingRushInsertionResult.vue` `47eeec29df3a3b2ede4da173d8ea1a5dbaedf1ab`、`SchedulingInsertionPreview.vue` `1d424177b8d4c625fabc5623619968ebbf03f77e`、`SchedulingDowntimeBanner.vue` `f38b275402587d3d1d897b92c5d9175d8930c09c`。它们的实际旧消费者为 `pages/scheduling.vue`、`SingleOrderSchedulingDialog.vue`；旧插单和停机 composables 的取数/判断留给 host。逐能力及新类型见[公共合同](../../scheduling-async-candidates.md)。P12 比较和 P11 风险的原公共入口仍被复用，原默认和省略行为未改。

## Requirement 与公开测试

| Requirement                                           | Evidence                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| created→running→failed/retry 与明确停止               | `public insertion job follows created running failed and retry without inventing a result`; `host stop, failure, retry and save confirmation stay separate`                                                                                                                                     |
| 旧 job 成功、失败、finally 晚到不覆新 job             | `host keeps an older completed response outside the new job and accepts only the current result`; `host ignores an older failure and finally while keeping the newer request active`; `public job ignores a completed result from another request and never marks selection without host input` |
| 选定/保存只由 host 确认；未知承诺时间、空结果不造成功 | `host stop, failure, retry and save confirmation stay separate`; `public job ignores a completed result from another request and never marks selection without host input`                                                                                                                      |
| 重复启动、关闭/卸载与取消不留下迟到可见结果           | `host prevents duplicate start, follows real history total, readonly and ETR controls`; `host cleanup ignores a completion queued immediately before unmount`; `host stop, failure, retry and save confirmation stay separate`                                                                  |
| 真实 total 翻页、未知 total 不造页数、readonly 理由   | `public insertion history uses real total and keeps start controlled`; `public pagination refuses an invented next page when total is missing`; `host prevents duplicate start, follows real history total, readonly and ETR controls`                                                          |
| 无 ETR、到期、恢复、真实 now、未知数量与 0 分离       | `public downtime displays host phases and now without treating absent ETR or count as zero`; `host prevents duplicate start, follows real history total, readonly and ETR controls`                                                                                                             |
| 移动、传播、锁定及约束明细可展开，缺值不补 0          | `public candidate panel keeps unknown metrics, movement paths and controlled selection`                                                                                                                                                                                                         |
| 公开只读/联合/缺值类型及无 SDK 主桶消费               | `frontend/contract-consumers/scheduling-host/async-candidates-consumption.ts` 经 `vue-tsc --noEmit -p frontend/contract-consumers/scheduling-host/tsconfig.json` 通过；主桶与本票运行源未引入 `vitest`、SDK、Colada 或 auth                                                                     |

按 TDD，第一件的 RED 为未导出 `SchedulingRushInsertionResult`，随后 GREEN；另三件的 RED 为未导出组件，当前 8/8 公开测试通过。host 的 RED 为缺少 `AsyncCandidateDemo.vue`；实现后发现测试 `get(...).first` 调用错误并修正，以及演示“上一请求”为空时误释放当前请求，当前 7/7 host 测试通过。后续加固精确测试为 `public insertion hides a previous plan result when the selected plan changes`、`host switching the selected saved plan cancels the old request and retains the new choice`、`public save request without a host confirmation remains unselected`、`host keeps a failed save unconfirmed and allows the same candidate to be saved again`。各轮原始日志未覆盖，见外部 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p13-implementation-r1/` 的 `red-public-1.log`、`red-host-1.log`、`green-host-1.log`。测试为可控内存来源，不声称真实 APS 或真实后端成功。

## 本地门禁与浏览器

- `pnpm -C frontend install --frozen-lockfile --offline`：退出 0，缓存复用，无下载。lockfile 与 base 的完整文件 Git blob 同为 `8db34ddd72b1df0c29f0a029f9184643becc60da`，本票所有 package manifests 与 lockfile 对 base 无 diff；因此 importers/packages/snapshots 的完整对象与每条 peer/optional 边继承且字节相同。`@nerv-iip/scheduling`、`@nerv-iip/ui` 和 playground 的 Vue 都解析到同一个 `vue@3.5.39` 实体。
- `pnpm -C frontend typecheck`：退出 0，四个活动 workspace 的 `vue-tsc` 均通过。纯类型消费者额外 `vue-tsc` 退出 0。误用原生 `tsc` 直接处理 Vue 主桶曾退出 2，因 `.vue`/CSS 声明入口不适用；未将它称为代码失败或通过。
- 首次 `pnpm -C frontend test`：退出 1，P11 既有时区测试要求显式 `TZ=Asia/Shanghai` 或 `America/New_York`，当次 `TZ` 未设置；保留 `test-1.log`。`TZ=Asia/Shanghai pnpm -C frontend test`：退出 0；ui 805/805、scheduling 322 PASS/4 policy-skipped、ui-mobile 144/144、playground 335/335。4 个 skip 是既有 vendor/stub 门禁策略，不是 real vendor PASS。默认 reporter 未提供 JSON `unhandled` 字段，不能记作 0 或 null。`Could not parse CSS stylesheet` 是各测试环境的独立警告，不计为业务断言 PASS。
- `pnpm -C frontend build`：退出 0；构建日志保留 Rolldown `INVALID_ANNOTATION`（依赖 `@vueuse/core`）和大 chunk 警告，均与成功退出分列。真实 Evaluation JS/CSS 作为已有依赖资源加载不表示授权已知或本票验证了引擎交互。
- `pnpm -C frontend fmt`：退出 1，报告 `frontend/DESIGN/component-coverage.md`、design-system 的 `file-upload.md`、playground 的 `PDF-SOURCES.md` 与 UI 的 `THIRD_PARTY_NOTICES.md` 四个本票未改的既有文件；没有清洗这些来源或改 formatter。对本票 17 个前端文件单独 `vp fmt --check` 退出 0；根 README、本票合同、证据 README 和文档站页共 4 份人工 Markdown 单独格式检查退出 0，45 个相对链接均存在。
- `pnpm -C frontend lint`：退出 0，现存 UI、原生文件测试等 warning 保留；本票新路径没有 warning。
- fresh dist 在浏览器打开两域深链；读书会演练旧请求晚到、失败/重试、完成、保存待确认与确认后文案，工作坊演练真实总数翻页、ETR 到期/恢复、停止后无 spinner、只读理由、窄宽浅色。目视截图：[读书会结果](browser/library-result.png)、[工作坊窄宽浅色](browser/studio-narrow-light.png)。宿主主题和 viewport 已恢复，ego 任务结束。T3 preview 在同一步两次返回原文 `Preview automation snapshot timed out after 15000ms.`，故浏览器改用 ego-browser；不把 T3 失败抹去。
- 当前浏览器加载的导航、入口 JS/CSS、字体和 DHTMLX JS/CSS 共 7 个同源实际 HTTP URL，逐个状态 200、MIME 符合类型、body 与**本次 final dist** 对应文件逐字节相同。逐项 URL/bytes/SHA256 见外部 `http-dist-byte-compare.json`；该检验不沿用 P12 产物 hash，也不代表真实 APS 或 packed 安装。

## 范围与未运行

本票未改 vendor 9.1.4 Professional Evaluation 字节、水印或第三方声明；授权范围 UNKNOWN。旧源、冻结 migration、原应用消费者未改。CI、完整文档站 #10、packed #11、device、旧消费者 #13/#15、父 #8 组合、真实 APS、生产及原生 zoom 均 **UNRUN**。浏览器资源到达只说明该演示实际加载资源，不能替代这些车道。默认并行 `DraftEditingDemo.test` 曾有 5 秒 timeout 的历史 FAIL，本轮 `TZ` 全量通过只表示这次门禁成功，不证明旧竞态根治。历史 main raw diff exit 2/3570 行与维护 0 是先前证据，未清理或重跑；本轮不重标其状态。
