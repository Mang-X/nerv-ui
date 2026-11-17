# P11 / PR109 R4 legacy 展示返修（F4）

仅 #94 四件已有展示适配；base `c0f6e41421da5aaeb38e07474413a06b78c2ea0c` / tree `d914c0d1668d786ff587ded0f0af89428b862b42`，开工 `edfda7afbe9cbe6d90e95edbd2d2e559a0718652` / tree `5cdf5bcc558af64fde97fe00f00c7b94ca383959`，clean。最终 head/tree、命令 exit、HTTP 与归档 hash 见外部 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-27/t07-p11-legacy-presentation-fix/handoff.md`，避免提交内自引用。

## R4 finding 与同 owner 核对

| 四件                      | legacy 技术编号直显路径                                                                                                                                  | UTC legacy / 宿主文本处置                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `MaterialShortageSummary` | `materialId`、已有 `materialLotId`、`affectedOperations` 的 order/operation 组合；有值编号使用 `font-mono text-xs text-muted-foreground`，缺失占位保守。 | 无 UTC 输入；`display.label/batch/affected.label` 保持宿主自然语言样式。                                                              |
| `PlanRisks`               | `orderId/resourceId` 组标题、order/operation/resource 风险标题、缺口 `materialId/materialLotId`；保留分组 identity、详情与事件。                         | 无直接时间文本；`display.group.label/risk.label/shortage.label/batch` 原样。`materialReadyUtc` 不在本票展示合同中，不将其猜成新时点。 |
| `PlanConflicts`           | 阻断、预警、未安排的 order/operation/resource 组合；只给编号片段技术样式，原因文案保持业务样式。                                                         | 无 `source` 时 `generatedAtUtc` 严格转换为本地分钟并附时区；显式 `source.capturedAt` 原样。                                           |
| `ResourceLoads`           | `resourceId` 标题；保留 active/idle/unknown 和窗口 identity。                                                                                            | 旧 `windowStartUtc/windowEndUtc` 转本地分钟并附时区；新 `display.start/end` 原样。                                                    |

转换只接受明确偏移的合法 ISO instant。缺失、非法日期及无偏移字符串显示 `—`，不展示无效原串，不猜业务墙上时间。旧值仍参与原组合 identity；props、事件 payload、数值及负荷分类不变。旧 `LOT-9` 两处样式、右对齐/tabular、三位小数、0/unknown、原因保守文案和两领域 recipe 继续保留。

## 公开 RED → GREEN

- R4 两份原字节 probe `cmp` 保持：本轮现状 **0/4 PASS、4 FAIL** → 修后 **4/4 PASS**，原 R4 失败 JSON 不改。首次复制命令的相对路径写错、exit 1，纠正后才实际运行；临时测试文件已移除。
- 正式主桶测试 `styles visible legacy identifiers in all four snapshot views while leaving host labels natural`、`shows legacy UTC instants in local minutes in the two checked timezones without rewriting host text`：筛选 RED 2 FAIL / 14 未运行，上海整份 GREEN 16/16 PASS，纽约时区该时点用例 1 PASS / 15 未运行。覆盖旧编号与宿主自然语言、数组替换/显式空集、readonly/select identity、两个旧窗口时点和 generatedAt、两本地时区、0/unknown、无效/无偏移、显式 display/source 文本。中途测试因新增物料 span 命中旧批次选择器 15/16 PASS；改为准确批次定位后全绿。所有 JSON 缺 `unhandledErrors` 字段；`Could not parse CSS stylesheet` 单列。
- 真实 Chromium 主桶临时消费者：T3 preview `status → open` 后同一步 snapshot 两次原文 `Preview automation snapshot timed out after 15000ms.`，故按流程转 ego-browser。上海 `09:30/10:45`、纽约前日 `21:30/22:45`，生成时点与负荷一致，旧原串不直显；旧编号计算 monospace/12px，宿主自然语言 sans/14px，宿主时点原文两区不变。两区 legacy/host 各自明确设并读回 CSS viewport/文档宽 `390/390`。首次 ego 轮次重置到 2300，旧截图只外置保留，不作 390 证据；重设后四图在外部同目录。临时消费者已移除，TZ/viewport override 已清理，ego Space 11 结束。

## 门禁与边界

scheduling 公开定向测试、scheduling/playground `vue-tsc --noEmit -p tsconfig.json`、playground `vp build`、目标源码 fmt/lint、最终 dist HTTP body 比较见外部 handoff。构建现存 PURE 注释与大 chunk 提示保留。R2 全桶 scheduling 300 PASS / 4 vendor stub skip（4 项 0 执行）、playground 323 PASS 仅有限继承，未本轮重跑；原 R1 技术码直露 probe FAIL 与 R2 不适用裁决、合理原因 probe PASS 并存。`main...HEAD --check` RAW 历史 exit 2 与本轮维护范围分列。

锁、Vue 实体、冻结 migration、DHTMLX 9.1.4 Evaluation 声明/水印未由本票修改；商业授权 UNKNOWN。CI、docs #10、packed #11、device、旧 consumer #13/#15、父 #8 组合、真实 APS、生产/商业发布及原生 zoom 为 **UNRUN**。source 消费者不等于 packed，stub 不等于真实 vendor，UI 不等于 APS。PR 保持 draft，实施席不审核、ready、merge、close、watch 或启动后继。
