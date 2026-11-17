# #29 / PR120 R1 返修：焦点与悬停状态隔离

仅处理 R1 两项 Spec P2；Standards 原为 0。输入 head `d2b285df1e6fe80f1861bdb2b27c06d559897375` / tree `41ba2f5db8b9684193d2bfc1a44a84ad6c52be53`，base `7dace369192c7eb2612be75525ce5e483222b696`。

焦点与悬停各自保存当前 key，悬停优先、离开后恢复尚存焦点；失焦仅清本焦点。同步观察宿主 cell key 集合，原地删除时立即清除对应记录，避免同批重加同 key 复活提示。Escape 同时清除两种记录。无 API、视觉样式、阈值或身份 ID 算法变更。

## Requirement coverage

- `clears removed cell interaction before the same key is inserted after focus` 与 `... after mouseenter`：同一 reactive 数组 splice 后立即 push 同 key，提示和 aria-describedby 都退出；新交互才显示新数据。
- `restores the focused cell after pointer departure without losing a different hovered cell on blur`：A focus → B hover → B leave 恢复 A；A blur 不清仍 hover 的 B；Escape 后不复活提示。

公开 UI 包命令 `TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/components/screen/Heatmap.test.ts --reporter=json --outputFile=/tmp/nerv-ui-r11-f1-green.json`：有效 RED **4 PASS / 3 FAIL**（exit 1）→ GREEN **7 PASS / 0 FAIL / 0 pending**（exit 0），JSON success=true，unhandledErrors 字段缺失。测试覆盖原有 4 条合同回归，没有改旧断言。

UI 类型检查、playground build、受影响 Vue/TS/组件文档 fmt/lint 与 diff-check通过。文档补充 hover/focus 优先和删除/重加规则；没有新增链接。浏览器、视觉、HTTP、完整 docs、CI、packed、vendor、设备、旧消费者/父组合及生产未运行。历史 R1 FAIL、全局格式/main raw 与 docs alias FAIL 不被局部 PASS 覆盖。纯逻辑 delta 不冒称新视觉证明。

工作树 `/Users/mang/Project/nerv-ui-worktrees/t08-r14-search-multiselect`，分支 `feat/t08-r11-heatmap`；旧库/两个 main/P15 未改。保持草稿，交独立 R2；最终 SHA/tree 在外部 handoff 追加。
