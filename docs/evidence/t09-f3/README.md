# T09/F3 实施证据

仅 #157 / Parent #10/F3，scope:S，单独 integration draft PR。旧四应用接入与退出 NOT_PLANNED；Field、其余 F/G/H、#11 与父票整体验收另验。

## 来源与实现边界

- `frontend/packages/ui/src/components/layout/App.vue` 与主桶：公开 `tooltipDelay`（默认 200）、`class`、默认插槽；内部 ConfigProvider / TooltipProvider / Toaster。没有 dir / scroll-lock props。
- 当前 `.vitepress/theme/Layout.vue` 与 theme index 无全局 Toaster / TooltipProvider；DesktopShowcase 的 provider 只属于其展示树。本例单个 NvApp，不添加主题出口。
- 原 `app.md` Header live 保留，修正根容器夸大能力的文字，追加 AppProviderExample 与完整源码 include。只使用公共主桶，不修改生产包、Demo、主题、锁文件。

## AC 与证据

| AC                                                                 | 本轮实际证据                                                                                                                                                                               |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 真实 NvApp、公开 tooltip 消费、默认/显式延迟、单出口               | `uses one public app outlet and switches default and explicit tooltip delay`：真实挂载公共 NvApp/Tooltip/Trigger/Content/Toaster，检查单出口和 200→800→200 输入；不冒充真实 hover 延迟验证 |
| 本页回执、关闭、卸载只清自己的 ID                                  | `acknowledges locally and dismisses only its own notification on close and unmount`：点击回执、关闭与卸载 dismiss 参数；spy 保留真实实现，无组件 stub                                      |
| 学习代码与现导航                                                   | App 页追加 live 与源码 include，既有 sidebar App 入口保持；build 检查站内链接。原 178 页保留，原 65 条合同不改                                                                             |
| 本地门禁                                                           | design-system 全部 10 文件 / 67 测试 PASS；docs:typecheck / docs:build exit 0；局部 lint/fmt、Markdown 非空二次格式 bytecmp、旧页与 diffcheck 见外部 raw/audit                             |
| 1440/390 亮暗、无裁切溢出、Enter/Tab/hover、通知显示关闭与离页重入 | 独立 browser / 最终 dist HTTP：UNRUN，由父独立席验收。布局使用换行、min-w-0 与局部 min-h-0；静态实现不等于浏览器 PASS                                                                      |

外部证据：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f3-implementation-r1/`。保留 red.log（未注册）、red-missing-example.log（缺模块）准备失败；red-behavior.log 是故意缺失确认状态更新的断言失败，随后恢复实现，tests.log 67/67。不是首次即成功的叙述。jsdom CSS 解析和构建注释警告原样保留。

历史 globalfmt、RAW2、TZ timeout 未重跑，不被本轮局部绿灯覆盖。runtime unhandled 独立数字 UNKNOWN。CI、packed、device、production 均 UNRUN，授权 UNKNOWN；vendor policy skip，0 执行，非 PASS。没有启动 review/runtime/merger/ready/merge/close/watch，没有操作 main PR18 或别人的服务资源。
