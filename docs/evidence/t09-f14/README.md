# T09-F14 实施记录

scope:S；关联 #179，父 #10。仅文档 Avatar / AvatarImage / AvatarFallback 主桶组合。

基线 `b37d3cea1efc67e60eb1df20acc74bda1f058196`，tree `96ce2f4fe98779e22791bf895aeaa0452b77abcb`；PR #178 已合并。180 旧 Markdown 页及既有 docs 文件字节保留，config.mts 仅追加导航；新增一页、同源示例、测试和本地图片副本，无 producer/API/锁/治理修改。

## 本地证据

- docs cwd `frontend/apps/design-system`，固定 `node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs` 执行 `exec vitest run --config vitest.config.ts`：19 文件、86 测试 PASS，原 85 项保留。新增 `uses the public avatar composition and recovers through simulated preloader error and load` 覆盖有效→失败→无图→有效、替代说明与回退 DOM。仅模拟 detached Image 预加载器；withBase 单元隔离，不证明浏览器或资源加载。
- 同 cwd `run typecheck`、`run build` PASS；build 开启既有死链检查并完成。范围 lint/fmt、git diff --check 与旧页字节检查 PASS。
- 图片逐字节复制自 `frontend/apps/playground/public/media/portrait.svg`，没有外网下载。

外部 raw/source/SHA 回读入口：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-f14-implementation-r1/handoff.md`。保留准备目录错误、缺文件 RED、TextEncoder 环境失败、错误实例存在性断言失败、最终 jsdom CSS 与 Rollup 警告。历史并行 81/82 FAIL 原因 UNKNOWN，本次 PASS 不覆盖历史。

## 独立席

browser / HTTP / 真实加载失败恢复 / 1440与390亮暗 / 鼠标键盘：UNRUN；runtime 数字 UNKNOWN。CI checks 空不算 PASS；packed/device/prod：UNRUN。旧应用接入、退出、取消：NOT_PLANNED。仅 draft，不自审/runtime签署/ready/merge/close/watch，不改父票。
