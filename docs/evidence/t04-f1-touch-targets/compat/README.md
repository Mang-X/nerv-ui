# #56 / PR57：R1 公开兼容返修

本记录承接独立 R1 的两个新增 P2。受拒对象为 `98cae9f86d46f37d0ff82855047f330a520fb509` / tree `8f7350075404bf4635ca42b45ec17e62bfa142a5`；base 为 `1e2f00f23450efc82c98bcfc20078e064f197502` / tree `774420caafedd5c2a961822cfce344d55d352ed9`。这里只是实施回执，独立 R2 尚未执行。

R1 的公共 base/head probe、逐文件 provenance、浅深截图、精确 backendDOMNodeId AX 反例与键盘结果保留在外部 `handoff/raw/retained-r1/`，没有改断言或覆盖旧报告。原四态生产 140、fixture 200、disabled 100 次通过属于受拒 head，不能抵消这些发现，也不能自动用于新 head。

## 根因与取舍

F1：Button 和 Stepper 把背景/边框移到 `::before`，Switch 把颜色移到内部 track，导致根 class 无法控制整个可见表面。本次恢复由公开根绘制背景和边框，继续通过现有 `cn` 合并消费者 class；不解析或转写 Tailwind 字符串，不增加样式框架、内部 class API、token 或依赖。

F2：Switch `asChild` 合成到新增首子 track；Reka Slot 的子属性优先，使 `aria-hidden=true`、`w-full`、31px 高和无指针样式落到交互根。本次首子使用无装饰属性的普通 span，根 role/name/checked、尺寸、事件和表单语义由 SwitchRoot 保留。没有隐藏交互根或删除公开 `SwitchRootProps.asChild`。消费者显式 `tabindex="0"` 的 Enter 行为继续由 Reka 处理；非原生 span 的 Space 行为没有扩为原生 button 的行为。

**必要视觉取舍明确披露：** Button sm/md 的可见底色由 32/40 增为 44px（lg 仍48）；Stepper 外框由32增为44，输入仍32，默认总宽134px（原返修前132，加真实两侧边框）；Switch 可见轨道由51×31增为51×44，thumb仍27。字号、横向内边距、圆角与图标保持，NavBar 本轮零改动。这使根 class 的表面主权和真实≥44px目标直接一致。没有继续声称旧32/40/31表面保持；独立 R2 应审查此取舍及现有窄行布局。当前文档站三页已同步，没有修改全局设计公约。

## Requirement | Evidence

| 要求                                        | Evidence                                                                                                                                                                                                                                                        |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 透明 Button、红底白字及 asChild anchor   | `public-browser.mjs`：`root class controls transparent paint`、`root class controls destructive paint`、`root class controls anchor paint`；实际 computed 根/伪元素/track 绘制、浅深截图及单次真实 click 回显，不以 class 字符串代替绘制                        |
| F1 Stepper 根透明和无外边框                 | `root class controls stepper paint`，同时断言根和任何可绘制 before 的颜色/边框                                                                                                                                                                                  |
| F1 Switch checked class 控制整个轨道        | `root class controls switch-color paint`，与同页 destructive 颜色参考逐值比较；外层相反状态 group 不影响根                                                                                                                                                      |
| F2 未聚焦和聚焦 AX、根51×44、表单及外部复位 | `asChild exposes unfocused switch and 51x44 root`、`asChild keyboard has one update native value and focused AX`、`asChild external reset and disabled activation stay independent`；精确 CDP AX 节点的 ignored/role/name/checked/focusable，非仅 DOM aria 属性 |
| F2 正式组件回归                             | `NvMobileSwitch public asChild compatibility > keeps the unfocused asChild role root exposed and focusable with controlled native form semantics`；合成根不处于 aria-hidden 子树、受控 Enter 只发一次更新、外部值、FormData 和 disabled                         |
| asChild 实际边缘、事件身份与邻近输入        | `aschild-edges.mjs` 四态：中心及四向±21实际 mouse、每次精确一次受控更新、FormData、disabled五点不激活、输入仍可编辑、根与输入不重叠                                                                                                                             |
| 四件生产目标、disabled、布局与滚动          | 新 bundle 运行既有 `production-browser.mjs`，公开 fixture/disabled 脚本适配见外部 `*-fresh.mjs`。生产与 fixture 分开保存，不将 fixture 当父完整组合验收                                                                                                         |

公开浏览器测试先在原受拒源码运行 RED；分步 asChild、Button、Stepper、Switch 修复后 GREEN。为排除支撑修正影响，最终同一 harness 再装载原三件完整源码，浅深共12条预期失败；恢复修复源码后失败0。单位测试同样以最终断言在原 Switch 上 RED。唯一等待修正是等实际主题背景过渡稳定再采样，未更改颜色/AX 预期。最初 `setProps` 用于子组件不受支持及 HTMLElement 类型错误日志亦保留，修正测试宿主方式与类型，不放宽行为断言。

[浅色修复截图](light.png)、[深色修复截图](dark.png)。实际截图已查看；原 R1 对照截图仍保留于外部，不改成新图。

## 复现与边界

使用现有依赖，无重复 install。所有命令显式 workdir 为 `/Users/mang/Project/nerv-ui-worktrees/t04-touch-targets`；pnpm11.22.0 通过 corepack + task-local PATH，Python只uv（本轮未使用）。

启动 playground dev 4186，打开 `/public-compatibility.test.html`，该文件通过裸公开包入口挂载组件，不在默认生产 index 的导入图内。先创建一个自有 ego TaskSpace，并修改脚本的 TaskSpace标识与输出目录；`public-browser.mjs` 从 `phase.txt` 读取输出轮次名。运行 `ego-browser nodejs < public-browser.mjs`；四态实际指针脚本是 `aschild-edges.mjs`。这是既有浏览器工具的可复现断言，不引入测试框架或安装包。

完整命令、exit、原始浏览器数据/AX、响应二进制与 dist 全字节桥接在 `/tmp/nerv-ui-t04-touch-targets-compat/handoff/raw`。最终 exact head/tree/base、正式门禁与清理状态见同级外部 `handoff/review-receipt.md`；外部持久归档 `.../2026-10-25/t04-touch-targets-compat` 过滤 node_modules/cleancheckout/cache 并附 SHA256SUMS。原 `t04-touch-targets-review-r1` 持久归档不覆写。

T3 status/open 后，同一步两次 snapshot 均原文 `Preview automation snapshot timed out after 15000ms.`，随后使用自有 ego TaskSpace20。CDP mouse/keyboard/wheel 属于桌面 Chromium 输入；不等于 physical touch。

原父 FAIL、CSS parse/PURE 提示、raw全量空白exit2、冻结附件fmt1与继承optional4保留。CI、packed/versioned #11、完整文档站运行、physical device/PDA/扫码枪/软键盘/模拟器/非零硬件safearea、旧消费者/#14、发布、父#5完整四态跨组链路均UNRUN。#43/#51/#35不扩修，#45–#49保持已完成；#56/#5/#1不关闭、#18不ready、不合并或监控PR。
