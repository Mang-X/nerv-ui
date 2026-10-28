# R1 受控显示、候选清理与语义状态

仅修三项material。NvFilterBar的内部输入为passive本地值，recipe用局部keyword桥接每次提案，下一tick对齐宿主权威值；不重挂输入、不改变公共组件，readonly容器inert且提案仍被guard拒绝。外部keyword替换同步更新。有效child与请求child/readonly组合变化时请求清理非法child，批处理同tick重排，保留宿主拒绝；不在options改名重排时重复触发清理。forbidden映射warning“受限”、unlinked映射neutral“未关联”NvStatusBadge，保留原message。

Requirement coverage：`does not invent accepted filter state when the host rejects a keyword update` 加真实input.value与readonly拒绝断言；`requests clearing a removed same-parent child and never revives an accepted removal` 验证清理提案、host接受后恢复options不复活；`gives forbidden an explicit status presentation` 与对应unlinked断言组件label/tone及message。初轮39PASS/4FAIL中child测试误传setup第二参数，随后更正测试初始化先setProps，单条有效RED1FAIL另存；修后目录43/43 PASS、JSONsuccess=true。其余原40断言不删弱。types/build/scopedlintfmt/diffcheck通过。JSON独立runtime/unhandled缺字段UNKNOWN。

测试cwd playground：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/directory-detail --reporter=json --outputFile=<仓外唯一报告>`；types `../../node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`；build `../../node_modules/.bin/vp build`。fmt/lint cwd frontend。本文oxfmtstdin非空cmp。原R1独立反例/所有历史FAIL保留，App/import99仅继承，本轮browser/设备/CI等UNRUN。旧应用接入退出NOT_PLANNED。独立R2未执行，不自审合并关票。

## R2 原地候选重排

候选合法性基于局部value/parent快照：整数组替换同步更新，原地逐槽变化批处理更新，再让有效child参与请求失效判断。显示options仍用当前原始列表，原来的source/filter/readonly同步失效不改。新增 `batches selected same-parent option reorders without resetting query detail or current creation` 公开回归先RED1FAIL，修后目录44/44 PASS；覆盖已选a、同父a/b reverse后query次数不变/无清理提案/详情仍在/创建仍pending且原合法回执成功。原真实候选删除、同key替换及全部旧43断言仍通过。types/build/scopedlintfmt/diffcheck通过。独立runtime/unhandled缺字段UNKNOWN；原R2probe和所有历史FAIL保留，未跑browser/CI等。

## R3 回执提交时校验

create捕获source/filter/page上下文；成功、失败和finally提交前同时检查当前version、readonly、callback、source/page/filter以及直接读取最终原地候选归属。该校验不依赖membership watcher的调度先后；合法同批重排最终归属相同仍接受，真正删除/换父拒绝，草稿不清空。`rejects queued creation receipt before a same-tick candidate delete without losing draft` 与move两条旧候选RED2FAIL，修后目录46/46 PASS，原合法reverse/splice边界与全部旧用例保留。types/build/scopedlintfmt/diffcheck通过，JSONruntime/unhandled缺字段UNKNOWN。原R3probe及历史FAIL保留，浏览器和CI等UNRUN。
