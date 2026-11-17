# T09/F4 Field 语义分组实施证据

范围：#159，父 #10，scope S；仅文档 consumer、Field 页、局部测试及证据。integration draft，未启动 review/runtime/merger，未 ready/merge/close/watch。旧四应用接入与退出 NOT_PLANNED，F/G/H 另验。

基线：`a08e70057f37a90c66e7f1fadb6163b006853b67`，tree `93dc8e8b8f54b46fc4499b196c60d7207deccb76`。提交前 fetch `integration/nerv-ui-extraction` 并正常 merge，Already up to date；未 reset/rebase。

| AC                      | 实施与证据                                                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 原生语义、标签及实例 ID | `field-group-host.test.ts` 的 `uses public fieldset and legend with associated instance-safe input labels`：主桶实际组件，两个实例，fieldset 首子 legend、for/input、aria-describedby 关联，不与 field-order-no 撞 ID |
| 当前值、安全本页反馈    | `submits current input safely and isolates feedback between examples`：编辑再提交、恶意字符串仅文本、第二实例隔离、再次提交新值                                                                                       |
| live 与学习代码         | Field 页追加 `FieldGroupExample`；源码 include 共用同份 consumer。默认 legend 代表，不修生产 text-base，不扩 API                                                                                                      |
| 保留页面                | 178 个 Markdown 页面与基线清单一致；除 Field 页外逐字节保留，Field 原 live 与原学习代码保留；冻结 174 页/206 文件合同仍通过                                                                                           |
| 本地门禁                | 固定 pnpm 11.22.0，design-system vitest 11 文件 69/69（原 67 + 新 2），docs:typecheck、docs:build、scoped lint/fmt、Markdown 非空二次格式化 bytecmp、diffcheck。构建启用死链检查；原 links 合同通过                   |
| 浏览器 AC               | 最终 dist/HTTP、1440/390 亮暗、完整长文字/无全局横溢、Tab/Enter、AX group 均 UNRUN，交父独立 browser；jsdom 不代替                                                                                                    |

公开来源：`packages/ui/src/index.ts` 导出的 pc/field barrel；`NvFieldSet.vue` 输出 fieldset，`NvFieldLegend.vue` 输出 legend，公开 variant 为 legend/label；`NvFieldLabel` 属性透传，`NvInput` attrs 到 input，`NvButton` 支持原生 submit。未改生产包、全局 theme/Demo、依赖、锁、vendor 或其它 Field 未决项。

RED：首次缺 consumer 文件为准备 FAIL；移除 submit 处理器时 1 FAIL/1 PASS（反馈仍为“尚未确认”）；恢复后 69/69 GREEN。RAW 保留 jsdom `Could not parse CSS stylesheet` 与构建 Rollup annotation 警告，不等同浏览器 CSS 验收。历史 global fmt RAW2/TZ timeout/RED 准备 FAIL 不被本轮覆盖。

完整 raw 与 source patch 在外部交接目录 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f4-implementation-r1/`，逐文件 SHA-256 清单回读。missing runtime/unhandled UNKNOWN；CI/packed/device/production UNRUN，授权 UNKNOWN；vendor policy skip，0 执行，非 PASS。
