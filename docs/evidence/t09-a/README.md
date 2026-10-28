# T09/A 文档站工程恢复

仅 #143 scope:M，父 #10 为 scope:L 并拆 A–H。旧四应用接入/退出 NOT_PLANNED；#11 packed 未启动。本席无评审、ready、merge、验收评论、关闭、watch 或公开发布。

## Requirement | Evidence

| Requirement | Evidence |
| --- | --- |
| 当前公开入口可解析、Vue 同实体 | `resolves public subentries without swallowing suffixes`：真实 Vite resolver 对照 Node exports，15 个入口；三包 Vue 与宿主同解析路径 |
| 业务依赖禁入 | `admits neutral dependencies and forbids SDK imports`：manifest 允许集和 docs/src 源码 import 扫描 |
| 全部共享样例事实不变 | `preserves all three complete source model facts`：完整输出对照 scheduling-models.json；突变后重取验证实例隔离 |
| 174 页/206 个原文件未缩减 | `retains the frozen 174 pages and 206 site files`：site-files.json 来自编辑前 git ls-files；不代表全部页面已人工审阅 |
| 仓库链接不屏蔽站内死链 | `links repository sources and preserves detectable dead links`：存在目标转源码 URL，不存在目标保留供 build 报错 |
| 完整 types/build | 指定 pnpm11.22.0：`-C frontend docs:typecheck`、`-C frontend typecheck`、`-C frontend docs:build`，完整命令退出 0 |
| 独立 dev | `-C frontend docs:dev`，自有进程 cwd 为本 checkout/apps/design-system；127.0.0.1:5180 页面 HTTP 200；结束停止自有 PID |

合同测试命令：`node /Users/mang/.cache/node/corepack/v1/pnpm/11.22.0/bin/pnpm.cjs -C frontend/apps/design-system exec vp test run --config vitest.config.ts docs.contract.test.ts`，5/5，JSON success true，无 unhandled error。根 test 仍按各包 scripts.test 递归，不隐式包含本独立工程合同；根 typecheck 包括文档站，根 build 保持 playground 构建，docs:build 独立执行。

## 接入决策与来源

不设裸包字符串 alias，直接使用 package exports，避免 index.ts/schedule-model 的 ENOTDIR；旧 SDK 与 DHTMLX stub 路径移除。使用 public/model/host/styles/vendor/vite 入口，vendor 样式复用公开构建插件；VitePress 样式隔离及原样例数据保留，不修改生产组件/算法。仓库外链只转换确实存在的文件，VitePress 的站内死链检查未关闭。被 include 的 DESIGN 基础链接显式指向同库 canonical owner。

T01 固定源 `79b1578f2b75f55709765b5e7882aaf33146c603`；旧 Nerv-IIP 仅 git show 读取固定 mapper 对照。完整 oracle 使用固定 mapper + 本票 base `4a7b34ed5e1789555fffc9fa612680720fe45c23` 的旧 schedulingDemo 生成，不以新 adapter 自证；calendar 时间按原本地基点小时偏移比较，保留既有本地日历语义。JSON 去掉 undefined，不改变实际可序列化事实。无 SDK stub，无类型断言遮错。migration 冻结，REKA producer patch、DHTMLX vendor/Evaluation 声明水印字节不变；授权 UNKNOWN，未公开发布。

锁文件完整对象：原 5 importers/973 packages/973 snapshots 全保留，新增 docs importer 和 182 packages/snapshots；既有 importer 和 package 对象完全相等，既有依赖解析边不变。仅 esbuild@0.28.1、rollup@4.62.2 两个 snapshot 移除 optional:true：docs importer→esbuild 为非 optional；docs→vitepress→vite5.4.21→rollup 为非 optional，原依赖边均保留。平台二进制本身仍 optional。原 minimatch10.2.5/brace-expansion5.0.7 及六个被前席 prune 的对象完整保留；不接受前席升级。已检查全部 1975 个 snapshot 依赖边目标及 importer 边，frozen install 成功。VitePress1.6.4 私有 Vite5.4.21 override 保留，工作区 Vite Plus0.2.4 未变，Vue3.5.39 单实体。

## 证据边界

继承 RED：同 base/tree 前席完整 build exit1 ENOTDIR、types exit2 三处缺 adapter，原件未覆盖。本轮曾有 adapter 重复声明 types FAIL、跨站点死链 build FAIL、测试配置启动 FAIL、oracle 比较 FAIL；后续 GREEN 不抹去这些失败。

fresh：上述完整 types、build、5项合同、frozen install 和 dev HTTP。全局 fmt 旧3 FAIL、schedule alias 历史 FAIL、TZ timeout 仅保留历史，无顺修。browser/CI/packed/device/生产 UNRUN；Runtime 数字字段 UNKNOWN，vendor policy 四项 skip 零执行。B–E live、F/G 覆盖核对和 H 父验收均未在本项完成。

外部完整命令日志、完整锁图前后对象/边报告、来源对象及最小归档：`/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-29/t09-a-implementation-r1/handoff.md`。已读/未读边界见该文件。
