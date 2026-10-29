# NvFilterBar 站内候选（#217）

scope:M，单族示例；公开组件不变。页面 `/components/desktop/filter-bar` 与学习源码共用 `FilterBarExample.vue`，侧栏固定入口。内存活动不代表真实查询。

| Requirement                                          | Evidence                                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 外部替换、逐字段 chip 移除、关键词保留、reset/change | `adopts external values and removes each generated chip without clearing keyword or other fields` |
| keyword/select、空结果、外部清空                     | `accepts keyword and select DOM events with empty results and external clear feedback`            |
| 单日期/范围起止、部分范围、重排身份                  | `preserves field identity after reorder and adopts real date endpoints including partial range`   |
| API、同源学习源码、固定导航、旧页                    | producer 核对；完整 docs build 的链接检查；183 旧页逐字节保留                                     |

focused DOM 用真实公开组件，无核心 stub 或 emit 注入；Date 固定 2026-06-01，真实 timer/动画帧。断开宿主 modelValue 接纳后 3 项失败 exit 1，恢复后全 docs 104/104 exit 0（原 101 保留）。首两轮 select click 边界准备失败已保留外部日志，最终采用 DOM Enter。jsdom CSS 解析提示保留。docs types/build、scoped lint/fmt exit 0。runtime/unhandled 独立字段缺失 UNKNOWN。

独立 review、1440/390 亮暗、浏览器真实键盘/select/date/chips/reset UNRUN；CI 空非 PASS；packed/device/production UNRUN；旧应用接入退出 NOT_PLANNED。只交 Draft，#217、父 F/#10 未签署完成。精确对象、命令、失败与 raw SHA 在外部 `t09-filter-bar-implementation-r1/handoff.md`。
