# 插画式登录舞台

## 使用时机

`NvScreenLoginStage` 用于固定深色的空间入口视觉。表单、业务状态和提交结果归宿主；不建立会话，不声明登录成功。

## 判定

screen 独有舞台按 R1 命名。复用既有 ScreenInput/ScreenButton；外部缩放仍由 ScreenScaler 负责。SVG image 与光点共享 viewBox，`contain` 使用 meet、`cover` 使用 slice；不建通用坐标框架，不使用 SVG IDs。

## 正例

插画尺寸与光点来自同一素材版本。光点 x/y 为原图百分比，size 为原图单位直径。替换 src 后在新图片 load 前隐藏光点；error 后隐藏光点，保留表单。宿主为 error 提供面向用户的安全文案，不传原始 HTTP 错误。pending/disabled 显式禁止提交并禁用 fieldset。

## 反例

不要把提交事件视为认证成功，不引入认证 SDK、用户记录、路由或固定轮询。不要把光点独立缩放于图像之外。slot 内不要嵌套 form；使用 submit 按钮。低动效保持插画和 HUD，停止所有循环。

## 来源映射与取舍

固定来源 `79b1578f2b75f55709765b5e7882aaf33146c603` 的 screen `src/pages/login.vue`：7 个 glows 改为宿主坐标输入；14 个固定粒子和两条 streak 保留来源几何与节奏；HUD 四项改为输入，移除秒级 useNow；brand/head/fields 保留 reveal。插画和 glow 统一 SVG 变换，代替原页只适用于 1672×941 的 CSS 定位。原宽屏左插画/右面板、960px 窄屏背景压暗/居中面板规则保留；真实视觉尚未执行，不能签构图等价。

原 logo、login-hero.webp 不复制、不修改；两个中性示例 SVG 为本次手写几何素材，不替代原图。来源资产许可 UNKNOWN。router、auth/realAuth store、api/auth、main 的认证消费保持原始素材，旧应用接入 NOT_PLANNED。原账号密码字段由 slot 替代；真实/模拟认证、redirect 与 HTTP 原始错误均不迁入。无数值 KPI/单位展示；技术 HUD 使用 mono/text-xs/弱色。
