# R1 受控显示、候选清理与语义状态

仅修三项material。NvFilterBar的内部输入为passive本地值，recipe用局部keyword桥接每次提案，下一tick对齐宿主权威值；不重挂输入、不改变公共组件，readonly容器inert且提案仍被guard拒绝。外部keyword替换同步更新。有效child与请求child/readonly组合变化时请求清理非法child，批处理同tick重排，保留宿主拒绝；不在options改名重排时重复触发清理。forbidden映射warning“受限”、unlinked映射neutral“未关联”NvStatusBadge，保留原message。

Requirement coverage：`does not invent accepted filter state when the host rejects a keyword update` 加真实input.value与readonly拒绝断言；`requests clearing a removed same-parent child and never revives an accepted removal` 验证清理提案、host接受后恢复options不复活；`gives forbidden an explicit status presentation` 与对应unlinked断言组件label/tone及message。初轮39PASS/4FAIL中child测试误传setup第二参数，随后更正测试初始化先setProps，单条有效RED1FAIL另存；修后目录43/43 PASS、JSONsuccess=true。其余原40断言不删弱。types/build/scopedlintfmt/diffcheck通过。JSON独立runtime/unhandled缺字段UNKNOWN。

测试cwd playground：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/directory-detail --reporter=json --outputFile=<仓外唯一报告>`；types `../../node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`；build `../../node_modules/.bin/vp build`。fmt/lint cwd frontend。本文oxfmtstdin非空cmp。原R1独立反例/所有历史FAIL保留，App/import99仅继承，本轮browser/设备/CI等UNRUN。旧应用接入退出NOT_PLANNED。独立R2未执行，不自审合并关票。
