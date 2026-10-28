# 列表布局与行操作实施证据

#153 / Parent #10，scope:M，一个 integration draft PR。基点 `855c6da2ae1e71016a36d338e50f5f92c9311620` / tree `acbab4278c192e0edc2e36d9bf4d1fdff734a00f`。fetch 实际分支 `integration/nerv-ui-extraction` 后正常 merge，未前进；没有 reset/rebase。只改文档 consumer、导航和局部测试，不改生产包或全局 Demo。

## AC 与精确证据

测试文件：`frontend/apps/design-system/list-blocks-host.test.ts`。

| AC                                                                       | 测试及边界                                                                                                                                                                                                  |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 五件真 public 组件、页头标题/说明/actions、Toolbar 主辅区域、卡内容/出口 | `renders public list blocks with zero unknown and responsive column choices` 真挂载五件，核对当前标题、数量、搜索和空态；说明/actions/filters/页脚见 ListBlocksExample 源码，真实按钮布局待 runtime         |
| RowActions 当前稳定身份，重排/替换无旧身份动作                           | `row menu receipts resolve current identity after reorder replacement and stale selection`；先真挂菜单包装，再仅将 RowActions/菜单项作为插槽事件边界 stub，公开 select 验证当前身份；不冒充真实 portal/键盘 |
| SectionCards 2/3/4 最大列数                                              | `renders public list blocks with zero unknown and responsive column choices` 检查受控输入传入真实公开组件；真实 native option/响应式断点另验                                                                |
| 导航/live、旧形态保留                                                    | `publishes the live host from sidebar and keeps existing related examples`；原 A–E 61 测试原样保留。额外逐页基点字节/前缀保留检查见外部 audit.json                                                          |
| 数字、0/unknown、精度与字体                                              | 首条测试核对 0 件、—、12.346 kg；源码数量列右对齐/tabular-nums、单位分色、技术编号 mono，正文标题 text-2xl font-semibold tracking-tight；亮暗视觉未验                                                       |
| 完整 docs types/build、scoped lint/fmt/Markdown/links/diff               | 外部 gates.json、audit.json 和原始日志。没有执行全库/playground/vendor 桶                                                                                                                                   |

## 来源与取舍

逐件核对当前 producer：`frontend/packages/ui/src/components/blocks/{page-header,toolbar,row-actions,section-card}`。PageHeader 只有 title/breadcrumbs/count/class 与 breadcrumbs/actions slots，没有 description；宿主另放说明。Toolbar 有 search/showSearch/searchPlaceholder/searchLabel 和 filters/actions；不是 DataTableToolbar。SectionCard 为 description/value + trend/footnote/hint 与默认页脚，不是 Card；SectionCards 默认四列、支持 2/3/4，窄屏单列，不是 PageGrid。RowActions 默认 enabled、end 对齐与“更多操作”，插槽消费公开 DropdownMenuItem。

裸包组合参考 playground/App.vue 与 migration/materials/source/frontend/apps/business-console/src/pages/design-system/blocks.vue，仅作 source 参考，无运行 import。docs examples/vitest 为工程先例。没有新增永久 registry。局部 min-width/padding 和可聚焦横向滚动适配 Demo 的 overflow-hidden，未编辑全局外框或生产 CSS。

## 原始证据与限制

外部目录 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f1-implementation-r1/`。red.log/json 为缺模块准备失败；red-behavior.log/json 为占位页的两项行为失败。green/green2 保留菜单边界 stub 名称不匹配的历史失败；green3 为 2/2 PASS。最终 tests.json/log 记录新增导航测试后的完整 docs 结果。保留 CSS 解析与构建警告，不删除冻结清单/golden，不修历史 globalfmt/RAW2/TZ timeout。

未启动服务、preview、独立 review/runtime/merger，未 ready/merge/close/watch。最终 dist/HTTP 身份、1440/390 亮暗、菜单键盘、完整按钮/反馈、真实 native options 均 UNRUN，由父独立席验收；runtime/unhandled 独立计数 UNKNOWN。CI/packed/device/生产 UNRUN，授权 UNKNOWN。旧 vendor 四项 policy skip、0 执行非 PASS；本票不增加大屏/排程 vendor 或打印矩阵。旧四应用接入与旧库退出 NOT_PLANNED。Card/Field/NvApp、F 剩余/G/H、#11 和父 #10 另验，不签整票完成，不关 #153/#10，不操作 main/PR18。
