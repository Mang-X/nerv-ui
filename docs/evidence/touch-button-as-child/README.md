# #43 NvTouchButton asChild 加载状态候选

基线 `2f73190c18c507e0e104653c7d5bc8e0b1b153ff` / tree `48b019c373fedfe9857d746b682191374144688c`。唯一工作树 `/Users/mang/Project/nerv-ui-worktrees/t08-r14-search-multiselect`、分支 `fix/touch-button-as-child-loading`，不改旧库、main、暂停的 P15、冻结 primitive 或依赖。

## 根因与修复边界

读取当前 #43、实际 TouchButton、Reka 2.10.1 的 Primitive/Slot producer：Slot 将属性克隆给第一个非 comment 子节点；原加载器或 leading 在实际交互宿主之前，抢走状态与事件。只在本组件的 asChild 路径装饰调用方真实子元素内部内容，加载器替换 leading，保留 default/named slots、href、class、ref/scope 与事件。克隆调用方 VNode 而非修改原对象，用 Vue h 归一化新 children 的类型/patch 信息；不导出通用渲染工具。

真实宿主接收 busy/disabled 与捕获阶段激活保护；加载结束恢复 leading/事件，显式禁用不恢复激活。Enter/Space 的 keydown/keyup 同样拦截，Tab 可继续焦点导航。普通按钮路径仍用原模板/加载器，样式和公共 API 没变。

## Requirement coverage

- `keeps loading feedback and activation on the asChild a host` / `... button host`：busy/disabled 落点、loader 在宿主内、原内容/href/ID、无 leading、父子 click 均被拦截、恢复各触发一次、显式 disabled 保留。有效初始 RED **11 PASS / 2 FAIL**；最终同文件 **16/16 PASS**。
- `preserves a component child slots and capture handlers through loading recovery`：注释/Fragment、组件根、default/named slot、调用方 class 与 capture 事件保留。
- `blocks child activation keys while loading but preserves Tab and restores keyboard handlers`：有效 RED **14 PASS / 1 FAIL**；最终 Enter/Space 双事件拦截、Tab 不阻止、恢复原键盘 handler。
- `updates compiled asChild content without retaining the loader or losing the label`：编译模板静态子树的更新、leading 恢复及 href/text 保留。

最终公开 UI 命令（UI 包 cwd）：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/components/touch/TouchButton.test.ts --reporter=json --outputFile=/tmp/nerv-ui-43-final-compiled.json`，**16 PASS / 0 FAIL / 0 pending**，exit 0，JSON success=true；unhandledErrors 字段缺失。UI vue-tsc、playground build、3 份改动文件 fmt、2 份源码 lint、diff-check通过。组件文档补 asChild 语义与示例，没有新增链接。

## FAIL / 测试环境诊断 / 未运行

中间实现曾有按钮恢复事件计数失败、组件 slot 返回单 VNode 而非数组的 TypeError、两处 TypeScript 归一化类型错误；保留相关 JSON/log。slot 返回值归一化修复并补组件/编译模板回归。事件计数亦涉及 Vue 合成事件同毫秒过滤：runtime-dom `createInvoker` 的 `_vts <= attached` 会跳过随后监听器；VTU `trigger` producer 明确通过 `_vts=Date.now()+1` 规避。新增手动 Event 回归采用相同 VTU 机制（便于同时检查 defaultPrevented），其余新 click 用 trigger；没有放宽断言或用 sleep。Tab 早期 FAIL 并列保留。最终已移除所有临时诊断 console。

一次额外测试命令从 frontend 根带包 config 导致 setup 路径错误（exit 1）不计产品 RED；两次 Python 路径多写 frontend 而失败，重跑正确工作目录，未作成功证据。类型中途错误原始 tool 输出没有单独完整 raw 文件，交接不补造。

**真实浏览器键盘证据尚未运行。** DOM 合成事件不替代 #43 明文要求的真实浏览器；本候选不可据此宣布 #43 完整验收。文档 live/full docs、视觉/HTTP、CI、packed、真实设备/vendor、旧消费者和生产亦 UNRUN。全局格式/main raw 和 docs alias 历史 FAIL 保留，不由本票 scoped PASS 覆盖。旧应用接入/退出按用户范围 NOT_PLANNED。

交独立审查判断代码与剩余验收边界；PR 保持 draft，未自行合并或关闭票。

## R1 数组 children 返修

R1 发现函数组件通过数组传入默认内容时，旧分支把数组误作 slots 对象，加载器保留但原内容丢失。本轮只在本地 ChildContent 中区分 slots 对象与数组/文本 children，共用装饰后的默认内容；原 named slots、VNode ownership/ref/scope 和捕获保护不改。

Requirement coverage：`preserves functional child array content through loading and recovery` 公开回归先 **16 PASS / 1 FAIL**，归一化修复后最终 **17/17 PASS**。断言实际 anchor 的 strong 内容、href、busy、内部 loader、loading 时无 leading 且不激活，恢复后同一宿主、原内容、leading 与一次激活。原 R1 原字节 probe 保留于独立回执，未改断言。最终 UI 类型检查、playground build、目标源码 lint/fmt 通过；测试 JSON 缺少 unhandledErrors 字段，不记作零。

中间 GREEN 尝试仍因测试误用 loader 的 data-slot 选择器失败；实际 NvLoader 使用 role=status，按现有组件契约修正。中间类型检查因 children 联合包含 RawSlots 失败，分支内明确 VNodeChild 类型后通过。首次添加测试因 cwd 路径多写 frontend 未落盘，其后未新增测试的旧 16/16 运行不计 RED。以上原始日志与最终报告分开保留。

真实浏览器键盘验收仍 **UNRUN**，不能以合成 DOM 回归替代。候选继续 draft，#43 不关闭；本轮无浏览器、HTTP 或完整文档站新证据，历史失败与其它未运行边界不变。
