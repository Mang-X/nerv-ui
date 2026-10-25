# P04 原测试字节参考

7 份测试从 integration `f2bb45dd1b05f8c7d220828d3472aa47eec5df62` 原字节保存，hash 与来源见 [provenance](../../../../docs/evidence/t07-p04/test-provenance.json)。不进入 workspace 测试命令，不修改冻结 migration 或旧仓。

对应活动路径仍存在并执行，没有新增 skip/exclude。旧无 adapter 的 `toModel`、SDK fixtures、隐式工厂时间/事实/冻结区间/装配关系推导，改成直接 `ScheduleModel`、host facts/timezone/windows/links。单测只证明 fake-vendor adapter 或 native 读面；真实 9.1.4 在独立浏览器车道取证。

几何断言随 P01 的 UTC 轴、显式 horizon/泳道及短条详情合同更新：短条通过 aria/title 和可见详情阅读，不能假设两小时条可容纳全文。物料 ETA 现在由 host fact 显示，不用 retired formatter 推导日期。原投影断言和失败历史均留在这里，后继 P05/P08 不得把它们误作新合同的 conformance PASS。
