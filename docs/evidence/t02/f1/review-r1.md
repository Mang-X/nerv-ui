# T02 独立 merger 回执

结论：REQUEST CHANGES，1 项 material 合并阻断；未合并、未改码、未关闭票。由父代理派修复后重新固定 head 审核。

## 固定对象

- PR https://github.com/Mang-X/nerv-ui/pull/42 已 link；最后回读 OPEN、非 draft、mergeCommit=null，未监控/轮询。
- base/integration/root HEAD：274d12baf1d5d27857beab0c7183d56623ffcefd；tree 587e1336960b0d50aba6959e2545a73b739f8f2c。
- head：621ca3d868f0cc34a35640cc011915029e19ca2d；tree ad8993bcb21ce37f18e8e378191ebc9f9b01f9d0。
- merge-base 等于指定 base；root/task 两工作树均 clean，远端 refs 与以上一致。main 仍为 599031a688496679e300458f56a1896d41ac8f81。

## F1 / P2：lock 不是纯裁剪，保留节点发生传递依赖升级

frontend/pnpm-lock.yaml:8592–8596 的 snapshots.wrap-ansi@7.0.0.dependencies：

| 依赖边 | base | head |
| --- | --- | --- |
| string-width | 4.1.0 | 4.2.3 |
| strip-ansi | 6.0.0 | 6.0.1 |

base-lock.yaml 中该节点位于 11394 行；full.diff 包含实际差异。clean frozen 安装后实际 node_modules 的 wrap-ansi@7.0.0 也解析到上述新版本，见 installed-edge-counterexample.json。

package keys 新增 []、减少 266、保留 packages 条目的 integrity/元数据未变均为真，但不能据此推出没有升级：新版本已因其他路径存在于 base，仍可发生依赖边升级。另 5 个 snapshot 只有 optional:true 重分类，已区分，不作为升级问题。根和 ui importer、settings、overrides 均相等。lock-review.json 保留最初严格比较的 exit 1 结果；本例确认真实变化而非序列化噪声。

这不符合本次“lock 仅裁剪无升级”的集成核验条件，也不支持 docs/desktop-standalone.md:62 的“保留版本”及 PR 的未升级整体结论。请父代理派修复席恢复该节点原解析及所需旧 package/snapshot，再裁剪真正不可达项并重跑 frozen 验证；如决定接受此升级，需要显式改变范围和证据表述。本席未自行修改。

## 其余审核

- 运行时组件、主桶、现有子入口、theme/overrides 原内容未改；新增三条精确公开 CSS exports，聚合入口声明八层顺序、包内 @source、overrides 层及本地字体 import。
- migration、冻结原版及暂不活动的 ui-mobile/app-shell/scheduling/design-system 全部原样。唯一 components/ui 下 diff 是受治理 FileUpload.test.ts；31 项测试体未变，opaque purpose 回调/取消/重试行为仍保留。
- 已核对库内契约继续执行；旧消费者 main CSS/import、注册、后端 purpose 责任移到 reference-tests。docs-layout 的 3 个原断言转入 test:docs，只算静态源码契约。
- playground 使用公共 workspace 包，无源码 alias、旧业务 SDK/auth/后端引用；表单新增、表格搜索/排序/分页、共享 dialog、布局和主题可从实际代码及已有交互证据核对。

## 本席 fresh

- pnpm -C frontend test：UI 38 文件 / 614 PASS，playground 2 文件 / 10 PASS；均 0 FAIL、0 SKIP。日志 tests-fresh.log。
- pnpm -C frontend --filter @nerv-iip/ui test:docs：3 文件 / 6 PASS，0 FAIL、0 SKIP。日志 docs-fresh.log。
- git archive 固定 head 到 clean/：不含 .git、node_modules、dist；pnpm -C frontend install --frozen-lockfile exit 0，使用固定 pnpm 11.22.0；日志 clean-install-fresh.log。
- 在该 clean 目录 pnpm -C frontend build：UI/playground 两份 vue-tsc 和 production build exit 0；日志 clean-build-fresh.log。
- fresh 干净构建 HTML/JS/CSS/7 个字体文件共 10/10 SHA256 与已存最终构建记录相等；artifacts-fresh-vs-inherited.json。
- git diff --check、冻结/migration/公共主桶/保留 workspace 源码零差异核对通过；lock 语义检查发现 F1。
- 保留 jsdom Could not parse CSS stylesheet 及 VueUse 两条 INVALID_ANNOTATION 警告。

## 继承与 UNRUN

- 继承实施席位在 exact head 内归档的 browser JSON、三张截图、资源响应与键盘/焦点/主题交互证据。本席目视读取三张截图并核对 JSON；未冒充 fresh 浏览器。其 JS/CSS 与本席 fresh 构建相等；历史 HTML formatter 差异及最终 HTTP 重核按原记录保留。
- 本席 targeted browser、fresh scoped fmt/lint、CI、版本化产物 #11、完整文档站运行 #10、旧消费者 reference tests/接入 #12–#15、旧全栈、设备、发布均 UNRUN；已有 fmt/lint 和 RED 记录仅继承。发现 F1 后未再扩测。

## 实际票据和 frontier

- #3 OPEN，stateReason 为空；未 completed 关闭。#1 OPEN。#18 OPEN/draft=true，未 ready。未向 PR/Issue 追加审核评论，交父代理修复。
- 实时原生 blocked_by API：#4/#5/#6/#7/#8/#19 均仍被 OPEN #3 阻塞，不能视为本次已释放的前沿。其它 #20–#41 尚未逐票实时重核，不扩大声明。
- 任务工作树和本席 clean 副本/输出均保留，父代理归档/清理；旧仓无命令写入。
