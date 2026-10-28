# R1 拒绝刷新手势复位

根因不在refresh事件是否被shell拒绝，而是PullRefresh先把distance固定阈值后，受控modelValue一直false没有watch变化来取消手势。最窄修复在现有PullRefresh emitrefresh之后nextTick核对受控loading，未接受则onCancel归零。无新prop/API，无定时延迟/重新挂载；非受控本地true与宿主接受true均保持阈值。

Requirement coverage：强化 `paused shell rejects pull gesture without false refreshing spinner` 增加translateY(0px)；新增 `settles a declined pull after pausing during the drag and accepts a fresh resumed gesture` 覆盖拖动中暂停、拒绝后归零、恢复接受刷新保持56px、完成回0。旧实现RED11PASS/2FAIL，修后Shell/PullRefresh/gestures合计27/27 PASS。移动types、playgroundbuild、两源码lint/fmt/diffcheck通过。原UI39与host100未改producer仅有限继承，不能声称本轮全桶fresh。JSONruntime/unhandled缺UNKNOWN，原R1probe/历史FAIL保持，browser设备CI等UNRUN。组件文档补拒绝语义，不自审合并关票。

命令cwd mobile包：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/components/task-list-shell/MobileTaskListShell.test.ts src/components/pull-refresh/PullRefresh.test.ts src/components/pull-refresh/PullRefresh.gestures.test.ts --reporter=json --outputFile=<仓外报告>`；`../../node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`。build cwd playground直接vp build，scopedfmtlint cwdfrontend。

## R2 恢复取消归属

manual仅对非wheel事件排除交互控件，button上的wheel同样取消恢复。queuedfilter回调带独立filterEpoch；cancel默认撤销该代次，接受requestedfilter的正常watcher取消只重置当前scroll目标而保留本次筛选请求；pause/source/storage/unmount/手动行为仍撤销旧请求。回调必须同代次才能重读目标，避免manual后复活。

Requirement coverage：`wheel over a slotted row button cancels cross-page restoration`、`queued accepted filter restore honors manual cancellation=true` 与false对照。旧实现14PASS/2FAIL（false对照PASS），修后含PullRefresh/gestures30/30 PASS；断言按钮wheel后下一页仍200、取消queuedrestore保持0、正常接受仍900。移动types/build/scopedlintfmt/diffcheck通过。中间test helper仅支持单一组件wrapper导致typeFAIL，改为mount公共wrapper类型后types-final通过，未改产品断言。JSONruntime/unhandled缺UNKNOWN，原R2probe及历史FAIL保持，browser设备CI等UNRUN。

## R3 延迟接受筛选

移除只检查一次nextTick的筛选接受回调，保留requestedFilter和该次存储位置副本，直到权威filter watcher接受后设置target再恢复。manual/source/storage/pause/unmount取消清掉该请求，不轮询不重复readstorage；筛选与数据可分开延迟提交。`delayed filter acceptance restores only an uncancelled position cancelled=false` 旧实现RED1FAIL，true取消对照PASS，修后含PullRefresh/gestures32/32 PASS；即900恢复和取消后0均验证，之前同步接受与wheel按钮取消回归仍PASS。types/build/scopedlintfmt/diffcheck通过。同步文档改为明确PullRefresh手势窄修而非底层不改。JSONruntimeunhandled缺UNKNOWN，原R3probe/历史FAIL保留，浏览器设备CI等UNRUN。
