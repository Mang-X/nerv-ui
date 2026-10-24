# T04/F1：四类移动控件真实触点修复（#56）

本票承接父 #5 独立组合验收 R1 的 **F1 / P2（继承缺口，原验收新增回归 0）**。依据 [DESIGN.md](../../../DESIGN.md) 的移动触点 ≥44px 约束，仅修改 NvNavBar 返回、NvMobileButton、NvStepper 增减、NvMobileSwitch 及对应测试、文档。#45–#49 保持已完成，父 #5 完整四态跨组链路另行复验；本票不关闭 #5/#1，不操作 PR #18。

原回执完整保留于 `/Users/mang/nerv-delivery-evidence/nerv-ui/2026-10-25/t04-parent-acceptance-r1/review-receipt.md`，原始 `browser/touch-targets-positioned.json`、`raw/material-source-identity.json` 和截图未修改。N02 历史披露不构成规则豁免，原 FAIL、raw 空白 exit2、冻结附件 fmt1 及四项 optional 均保留原身份。

## 改动与布局

| 组件                    | 原真实动作根          | 本票真实动作根          | 紧凑表面与必要布局变化                                                                                                                                               |
| ----------------------- | --------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NvNavBar 返回           | 36×36                 | 44×44                   | 内部圆面 36×36、图标 24×24；栏高仍 48，图标中心右移 4px，标题与右插槽保留                                                                                            |
| NvMobileButton sm/md/lg | 高 32/40/48           | 最小 44×44，高 44/44/48 | 表面高仍 32/40/48，使用根内部无指针事件的装饰伪元素；真实根在普通布局中占位，sm/md 增加 12/4px 高度，短文字最小宽 44；outline 边框转为装饰层，清空数值示例宽 94→92px |
| NvStepper 两按钮        | 各 32×30，整体 110×32 | 各 44×44，整体 132×44   | 紧凑表面高 32，输入独立宽 44；根不再裁剪按钮，增减不覆盖输入；横向多占 22px，表单行必要时按原 flex-wrap 换行                                                         |
| NvMobileSwitch          | 51×31                 | 51×44                   | 轨道仍 51×31、thumb 27；透明上下留白参与布局，原生 Reka 动作根、受控值与隐藏表单输入保留                                                                             |

没有向相邻控件扩出的绝对命中层。装饰伪元素/track 不接收指针事件，实际命中由布局中的原生 button/anchor 负责。保留公开 Nv 名、props、事件身份与键盘语义；Button 没有 `loading` API，等待态由宿主既有 `disabled` + `aria-busy` + 插槽文案表达，未新增 API。没有依赖、全局 CSS、冻结区或 migration 变更。旧库同步由 #14 承接。

## Requirement | Evidence

| 要求                                         | 可审查证据                                                                                                                                                                                                                                                                             |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 公开 RED → GREEN、真实 ≥44×44                | 基线生产 bundle 四态 RED：`browser/round04-red.mjs` / `red.json`；四件中心命中、±21px 边缘不命中，Switch edge 不变 / center 切换。正式组件测试各有 RED 日志，尺寸类断言只是补充守卫，不能替代浏览器 geometry / elementFromPoint / 实际 mouse                                           |
| NavBar 独立返回、标题及右插槽                | `NvNavBar touch action > keeps back, title and right-slot actions independent`；浏览器对五个中心/边缘点分别设置收藏后返回发现，夹具独立计数和标题命中检查                                                                                                                              |
| Button 尺寸、block、asChild、disabled/等待态 | `reserves a minimum touch target for %s without duplicating click`、`forwards asChild, block, href and focus to the single link action`、`keeps native disabled and caller-managed busy content inert`；夹具真实 sm/md/lg、短文字、outline、整宽 anchor 的五点点击及键盘               |
| Stepper 两按钮与输入独立、受控与边界         | `reserves independent targets and emits controlled steps without changing the input early`、`keeps native input editing, blur clamping and disabled boundaries separate`；浏览器独立矩形与原生输入、五点增减、min/max disabled、Enter                                                  |
| Switch 受控、原生表单、disabled、focus       | `reserves a touch root while keeping controlled state, label and native form value`、`reflects external controlled changes and keeps disabled native activation inert`；夹具五点切换、外部复位、FormData yes/缺失、Space 与焦点；相反状态的外层 group 不污染轨道颜色（使用命名 group） |
| 相邻动作与输入、等待态不误激活               | 宿主 `keeps adjacent public actions, native input and controlled values independent`、`keeps caller-managed loading and disabled actions inert`；浏览器 all-target 矩形不相交、邻近输入保留、真实 wheel 滚动                                                                           |
| Tag、Touch、其它移动入口不回退               | mobile/UI/host 全包 fresh；Tag 与 Touch 源码未改；生产 bundle 代表性入口回访单列于外部回执，不等同父完整跨组验收                                                                                                                                                                       |
| 来源、依赖与原仓不变                         | 初始 HEAD/base `1e2f00f23450efc82c98bcfc20078e064f197502` / tree `774420caafedd5c2a961822cfce344d55d352ed9`；四件初始 blob 与 source79b1578f/base49a4db7/parent3082e34 相同。16份 manifest/workspace/lock 与 base 全字节相同；三包 Vue3.5.39 同 realpath、同模块对象                   |

## 四态浏览器结果

最终生产宿主每态 35 次真实中心/四向边缘动作，共 140 次；公开回显分别验证返回发现、清空标题/数值、保存次数、份数增减与受控开关。独立公开夹具每态 50 次，共 200 次；另有每态 25 次、共 100 次 disabled/宿主等待态边缘点击保持不激活，Tab 跳过禁用项。相反状态的外层 group 不改变 Switch 轨道状态。四态均无页面横向溢出，实际 wheel 可滚动。

四态实际响应与 dist 逐字节相同：HTML 427B、JS 515713B（SHA256 `9fc962b4ffe9ef58064aadfb5d90fdce6d3fc271fb833d10ef14997333b3c587`）、CSS 231567B（`0da80e83dfe43c040f9cf34dc0bc97e9916287d12a7b4cddfdbf90a0885055b1`）、Inter 48256B；均 HTTP200。完整 geometry、elementFromPoint、操作前后状态和逐态响应在外部 `production-green.json`。这只覆盖本票四件，不是父完整四态跨组验收。

[修复前竖屏](before-input.png)、[修复后浅色竖屏](after-input-light.png)、[深色竖屏](after-input-dark.png)、[浅色横屏导航](after-nav-landscape.png)、[深色横屏 Stepper](after-stepper-landscape.png)。截图用于观察紧凑视觉和占位，真实点击能力由上面的浏览器输入和几何证据认证。

## 执行边界与复现

所有 shell 命令显式 workdir 为 `/Users/mang/Project/nerv-ui-worktrees/t04-touch-targets`。目标与 root 当时均无 node_modules，故执行一次首次 frozen install；pnpm 11.22.0 通过 corepack + task-local PATH，855 包全部复用缓存、下载 0，没有全局工具变更或无理由重装。Python 未使用。

组件与宿主测试是 Vitest/jsdom；布局与点击证据来自桌面 Chromium 浏览器。浏览器先 T3 preview status/open，同一步 snapshot 两次原文超时后才使用 ego-browser（自有 TaskSpace17）。CDP mouse/keyboard/wheel 是浏览器输入，**不是 physical touch 或真机证明**。测试夹具通过裸公共包入口消费，测试 HTML 不属于默认生产 index 入口。

```sh
pnpm -C frontend/packages/ui-mobile test
pnpm -C frontend/packages/ui test
pnpm -C frontend/apps/playground test
pnpm -C frontend/packages/ui-mobile test:docs
pnpm -C frontend/packages/ui test:docs
pnpm -C frontend build
```

三个实际执行脚本的格式化副本随本文保存（原始版本与日志在外部归档）：[公开夹具](fixture-browser.mjs)、[生产宿主](production-browser.mjs)、[禁用边缘](disabled-browser.mjs)。重放前先创建自有 ego TaskSpace，把三个脚本中的 `taskSpace(17)` 统一替换为该 ID；启动目标 playground dev 4186（夹具 `/touch-targets.test.html`），另从 build 后 dist 启动 HTTP 4187。脚本中的绝对 checkout / 输出路径也按重放环境调整；运行 `ego-browser nodejs < 脚本`，完成后关闭自有 TaskSpace。脚本不引入新测试框架或依赖。

可复现浏览器脚本、实际四态数据、截图、HTTP 响应原字节与 dist 比较、门禁完整输出和失败日志位于 `/tmp/nerv-ui-t04-touch-targets/{raw,browser,handoff}`；持久归档位置、最终 exact head/tree/base/clean 与最终门禁记录见同目录外部 `review-receipt.md`。归档不含 node_modules、cleancheckout、cache。

Fresh 本地工作内容门禁已执行：mobile 27文件143PASS（含命名）、UI 43文件644PASS、host 9文件83PASS、静态 docs 2+6、三包类型与生产构建。最终提交身份及浏览器结果以外部回执为准。旧 parent clean install /133/644/80 不是本新 head 的 fresh 证明。

继承：父 F1 原始反例、五叶已接受历史与原 optional 4。UNRUN：CI、packed/versioned #11、完整文档站、父 #5 完整四态跨组链路、physical touch/PDA/扫码枪/软键盘/模拟器/非零硬件 safearea、旧消费者接入与发布。#43/#51、其它 leaf optional 均不在本票；未将 mouse 当作物理 touch，未提前关闭父票。
