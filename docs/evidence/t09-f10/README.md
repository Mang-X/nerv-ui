# T09/F10 指标基线与实际对照

#171 / Parent #10/F，scope:S。仅 Metric 页追加共源 live/学习源码、公开消费测试与本记录。178 页及原 Metric 例保留。其它 F/G/H 另验；旧四应用接入退出 NOT_PLANNED。

## 当前合同与验收映射

producer：`frontend/packages/ui/src/components/pc/metric-comparison/NvMetricComparison.vue`，经 PC barrel 和 `src/index.ts` 的主桶导出。baseline/actual 为 `{ label: string, value: number }`，label 必填，betterWhen 默认 higher，可选 lower/unit/class；无事件和专有插槽。差值 actual-baseline，达成率 actual/baseline，0/0=100%，0/非零=—；条宽夹在 0–100%，不能用条宽推断真实比率。整数千分位，非整数最多两位，百分比取整；方向只影响 tone。

消费：`frontend/apps/design-system/docs/.vitepress/examples/localMetricComparisonExample.vue`，在 `components/desktop/metric.md` 同时 render 和源码 include。中性到访/耗用、方向、两侧零和零基线非零实际通过本页内存按钮切换，无后端。未改 producer/API/依赖/主题/vendor。

| AC                                                | 精确证据                                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 两侧 labels/value 替换、差值/比率、方向与当前反馈 | `reflects current visit and consumption inputs through the public comparison DOM`      |
| 零基线 0/0 与 0/12 可见结果                       | `renders zero baseline semantics without treating an undefined ratio as zero`          |
| 学习源码与真实组件一致                            | metric.md include 同一 Vue 文件；测试不 stub 组件、不复制计算公式、不镜像 class        |
| 单位/标题可读                                     | 不传 unit，以短卡标题表达量纲，完整场景说明在宿主换行；不是全部 optional unit 路径验收 |
| 原页/原例、链接与门禁                             | 外部 preservation.log、tests.log、types.log、build.log、scoped.log 与 markdown.log     |

准备 RED（缺示例文件）与行为 RED（实际 120 暂改 110 导致 +20 断言失败）原样保留，恢复后 GREEN。jsdom CSS parser、构建诊断保留，不用新 PASS 覆盖历史 global fmt RAW2/TZ timeout 和准备失败。

独立 runtime UNRUN：最终 dist/HTTP、1440/390 亮暗、Tab/Enter、焦点与无裁切/横溢；runtime unhandled UNKNOWN。CI/packed/device/production UNRUN，授权 UNKNOWN；vendor policy skip，0 执行，非 PASS。不启动 review/runtime/merger，不 ready/merge/close/watch，不关闭 #171/#10 或 main PR #18。

外部 handoff：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f10-implementation-r1/handoff.md`，含最小 source patch、raw、SHA 回读，不含 dist/deps。
