# #32 / PR118 R2 返修：最终身份文字碰撞

仅修 R2 剩余 Standards P2，不改变选择值、事件或公共 API。同名条目先按既有 code/hint 规则选择辅助文字，再对最终身份文字判重；碰撞项回退完整 value，继续处理由回退产生的二次碰撞。每项至多回退一次，循环可终止。原始素材、旧库与暂停的 P15 未改。

## Requirement coverage

- `keeps final same-name identities distinct across code hint and value collisions`：覆盖 code/hint 同为“东区”、回退 value 与第三项 code 再碰撞、跨页清空 options 后仍区分、重排和移除发出正确值。修前 **14 PASS / 1 FAIL**；修后与原单选回归共 **39 PASS / 0 FAIL / 0 pending**，JSON `success=true`，`unhandledErrors` 字段缺失。
- 测试命令（UI 包）：`TZ=Asia/Shanghai ../../node_modules/.bin/vp test run src/components/blocks/entity-picker/EntityMultiPicker.test.ts src/components/blocks/entity-picker/EntityPicker.test.ts --reporter=json --outputFile=/tmp/nerv-ui-r14-r2-green.json`，exit 0。
- UI `vue-tsc --noEmit -p packages/ui/tsconfig.json`（frontend）与 playground `../../node_modules/.bin/vp build` 通过；受影响 Vue/TS/组件文档 fmt、lint 和 diff-check 通过。

文档补充最终身份判重及二次回退规则；未新增链接。初次测试、构建因实际 cwd 下相对工具路径写错 exit127，第一次文档修改路径多写 frontend 而失败，均为操作错误，未当产品 RED；相关构建错误日志保留。公开失败 RED 另存 red-public.log。历史 R1/R2 FAIL 不覆盖。

本轮未做浏览器验证（UNRUN）；此前样式、禁用 hover、受控缓存与搜索分页的浏览器结果仅限未变 producer 的继承范围，不证明本轮新碰撞逻辑。CI、完整 docs、packed、旧消费者、vendor、设备、父票组合和生产未运行。全局格式/历史 raw diff-check 失败不由 scoped PASS 抹去。

实际工作树：`/Users/mang/Project/nerv-ui-worktrees/t08-r14-search-multiselect`。输入 head `f84f330df74f4c145b3344fc406dcfb2c378a842` / tree `59491a7930723e7aae4903cc069f5257debaa11e`；base `6921408cafd961b81b7c4c0e6dd56d683de391a6`。PR 保持 draft，交独立 R3，未自行合并/关票。
