# F1 待整理说明可读性返修

独立 R2 在真实1440亮暗、默认四列确认 footnote 单行截断“当前没有待整理物品”，无全文入口。原 P2、截图和几何保留于外部 t09-f1-review-runtime-r2，不以 DOM textContent 完整冒充可读。

只在 ListBlocksExample 将该说明移到当前 public hint：数量单位：件；当前没有待整理物品。hint 可换行，value=0、单位与其余卡及统计出口不变；不改公共组件、CSS、全局 Demo 或 API。该单点排版选择不新增镜像 props/class 测试，有效 RED 为原独立浏览器；新产物 GREEN 留独立 R3 真实1440/390亮暗与默认四列核实。

既有64合同、docs types/build与scoped lint/fmt实际记录见外部 t09-f1-hint-wrap-fix/handoff.md。R1菜单与R2单位/搜索/出口/列数选择只按未变输入有界继承，剩余运行项仍须补验。缺runtime/unhandled数字UNKNOWN，历史FAIL、CI/packed/device/production未运行与授权UNKNOWN保留；旧四应用接入退出NOT_PLANNED。
