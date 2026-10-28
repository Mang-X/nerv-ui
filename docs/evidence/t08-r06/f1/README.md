# R1 标记回执与记录版本

仅修 #24 recipe 的 P1。原实现只按 key 保存 pending，替换同 key 记录后旧完成操作会误标新记录。现在宿主捕获当前记录对象身份；records 替换时同步撤销旧 pending，finish 再检查记录对象仍为当前版本；无当前请求的成功或失败不再改变记录和错误状态。库组件、API 和通知服务没有改动。

Requirement coverage：`ignores old mark outcomes after same-key replacement and permits a current retry in library` 与对应 `studio`。正式 RED 为原宿主 2 PASS / 新回归 2 FAIL；GREEN 连同宿主 import 门禁 79 PASS、0 FAIL，JSON success=true。断言新详情仍未读且可重新标记、旧完成入口已禁用、无请求时不显示失败、新请求失败保留未读并可再次完成。真实异步服务不是本例的手动完成按钮，不声称验证后端。

Fresh：宿主类型检查、playground build、两份源码 lint/fmt、增量 diff-check通过。JSON缺 unhandledErrors 字段仍 UNKNOWN；CSS解析/构建warning保留。R1独立复现错误的probe原断言不改，历史FAIL不覆盖。UI库290及其它无改动合同仅继承。浏览器、视觉、HTTP、CI、packed、真实服务与生产UNRUN；旧应用接入退出NOT_PLANNED。PR保持draft交独立R2，不自审或关票。

命令 cwd playground：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/NotificationInboxDemo.test.ts src/nvui-imports.contract.test.ts --reporter=json --outputFile=<外部报告>`；类型 `../../node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`；构建 `../../node_modules/.bin/vp build`。源码fmt/lint cwd frontend，root本文用oxfmt stdin非空输出比对。精确最终head见外部handoff。
