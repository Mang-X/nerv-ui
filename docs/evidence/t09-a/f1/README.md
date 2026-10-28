# T09-A R1 返修：共享样例显式时区

独立 R1 在 dev 与完整 dist 的工单/资源文档页发现图面被时区 gate 阻止，真实实例数为 0。原 FAIL、截图、完整锁与 oracle 审计保留在 `2026-10-29/t09-a-review-runtime-r1/`。

文档宿主现在为三份最终样例提供固定的 UTC 展示上下文。这是文档示例的明确选择，不推断真实工厂时区、不回退浏览器。装饰层在父节点、时间块、里程碑等全部后置任务完成后运行，每个任务都提供 `timezone: 'UTC'`、模型提供 `timezones: ['UTC']`。原 start/end/baseline/分段及本地 calendar 基点计算不改写；calendar 的旧本地生成语义与 UTC 展示上下文分别说明，不把它当真实工厂日历。

`provides an explicit UTC display context for every final demo node` 最初 FAIL，修复后 PASS；测试通过公共 `factoryTimeInput` 核验所有最终节点的实际时刻和显式 timezone 可解析。现有 `preserves all three complete source model facts` 仍比原独立 oracle，只在比较前剥离新增的顶层 timezones 和 task timezone，oracle 文件不重写。新展示上下文由上述独立断言检验，不以新输出更新 golden 自证。

最终 6/6 合同通过。类型、完整 build 与 scoped 检查见 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-a-timezone-fix/handoff.md`。修复后的真实甘特/资源图和代表性交互须独立复验，不能以合同或 build 声称图面 GREEN。未改生产 gate、包依赖/锁/vendor/patch；历史 FAIL、runtime 数字 UNKNOWN、CI/packed/device/生产 UNRUN 和授权 UNKNOWN 保留。
