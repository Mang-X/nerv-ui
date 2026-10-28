# R1 拒绝刷新手势复位

根因不在refresh事件是否被shell拒绝，而是PullRefresh先把distance固定阈值后，受控modelValue一直false没有watch变化来取消手势。最窄修复在现有PullRefresh emitrefresh之后nextTick核对受控loading，未接受则onCancel归零。无新prop/API，无定时延迟/重新挂载；非受控本地true与宿主接受true均保持阈值。

Requirement coverage：强化 `paused shell rejects pull gesture without false refreshing spinner` 增加translateY(0px)；新增 `settles a declined pull after pausing during the drag and accepts a fresh resumed gesture` 覆盖拖动中暂停、拒绝后归零、恢复接受刷新保持56px、完成回0。旧实现RED11PASS/2FAIL，修后Shell/PullRefresh/gestures合计27/27 PASS。移动types、playgroundbuild、两源码lint/fmt/diffcheck通过。原UI39与host100未改producer仅有限继承，不能声称本轮全桶fresh。JSONruntime/unhandled缺UNKNOWN，原R1probe/历史FAIL保持，browser设备CI等UNRUN。组件文档补拒绝语义，不自审合并关票。

命令cwd mobile包：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/components/task-list-shell/MobileTaskListShell.test.ts src/components/pull-refresh/PullRefresh.test.ts src/components/pull-refresh/PullRefresh.gestures.test.ts --reporter=json --outputFile=<仓外报告>`；`../../node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`。build cwd playground直接vp build，scopedfmtlint cwdfrontend。
