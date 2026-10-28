# R1 完成保护与安全异常

仅修#39两项material。返回调用失效逻辑仍撤销在途请求、清错误并回步骤0，但已完成receipt保留；前进后execute仍受receipt保护。编码/source/候选明确更新既有失效规则继续清完成结果，允许新安排。回调抛错不再将message上屏，统一“暂时未能完成，请重试”；缺少receipt是本地明确检查，保留“尚未收到确认，请重试”而不通过异常原文传递。

Requirement coverage：`preserves completed receipt across back and forward until an explicit new arrangement` 与 `keeps callback exception details off screen and allows a safe retry`，旧候选17PASS/2FAIL，修后连同mobile原宿主affected共37/37 PASS。分别断言返回仍有receipt、前进执行仅1次、新编码可执行第2次，以及技术HTTP/operationId不显示、数量0保留、重试成功。既有失败重试测试的期望文案改为安全提示，失败保留/重试/readonly详情断言不变。

Fresh：playground types/build、2源码lint/fmt/diffcheck通过，JSON缺runtime/unhandled字段仍UNKNOWN。mobile144仅继承，来源完整Spec模板CSS对照R1未完成，交R2补完；不能凭此两项修复签整票。所有原FAIL与旧全局格式/mainRAW/docsalias/timeout保留。browser/设备/视觉/HTTP/docsLive/CI等UNRUN，旧应用接入退出NOT_PLANNED。

实际命令 cwd playground：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/mobile-flow src/MobileDemo.test.ts src/MobileInputDemo.test.ts --reporter=json --outputFile=<仓外报告>`；`../../node_modules/.bin/vue-tsc --noEmit -p tsconfig.json`；`../../node_modules/.bin/vp build`。源码fmt/lint cwd frontend，本文格式oxfmtstdin非空cmp。最终head见外部handoff。
