# F1 统计卡单位返修

独立 R1 最终 dist 发现：统计卡 value 将件/kg 与大数合并，单位继承 font-semibold 与数字颜色，1440 下还会换行。原 P2、截图与 DOM 原件保留在外部 t09-f1-review-runtime-r1，不被新 PASS 覆盖。

只改文档 ListBlocksExample：value 为纯格式化数值；件放 hint，kg 放现有页脚插槽的普通字重/次级颜色说明。统计说明按钮保留，不改公共 SectionCard API/实现、全局主题、依赖或锁。

Requirement coverage：`renders public list blocks with zero unknown and responsive column choices` 核四卡值为3、0、—、12.346，且数量单位/重量单位说明分别保留；原实现定向2 PASS/1 FAIL，修后完整64合同通过。该测试不签实际字体/颜色，最终 dist 视觉留独立 R2。精确日志和 types/build/scoped lint/fmt 结果见外部 t09-f1-unit-copy-fix/handoff.md。

原 RowActions 真实菜单身份已由 R1 验证，仅按未变输入有界继承；剩余宽窄亮暗/列数切换/出口反馈等仍留独立运行席。缺 runtime/unhandled 数字保持 UNKNOWN；历史 FAIL/globalfmt/RAW2/TZtimeout 保留。CI/packed/device/production 未验，授权 UNKNOWN，旧四应用接入退出 NOT_PLANNED。
