# 中性大屏详情与参数取值

## 规则

`NvScreenDetailDialog` 只管理受控 open 与 screen 外观，DialogRoot/Portal/Content 的遮罩、Esc、焦点进入/返回由现有 Reka 管理。拒绝 update:open 时保持打开。body portal 使用 viewport CSS px，不复制舞台 transform，:root screen tokens 可用。两个组件各有单一 screen 表面，不复制 PC 视觉。

只在 open 时挂载 portal，每个实例的遮罩和内容位于同一个 body 直属层叠上下文内，按实际 portal 挂载顺序成组叠放。关闭移除整个层；拒绝关闭则保留当前层，不留下关闭状态的全屏容器。层内遮罩低于自身内容，较晚打开层的遮罩可以覆盖较早层的内容。

## 判定

信息、参数、历史放入 info / parameter / history slots；state 显式为 data / pending / error / empty。等待与失败不混成缺测。参数颜色、范围、单位、时标由宿主输入，不根据数据判断正常、风险或业务结论。参数 samples 必填；value 可为 null。

## 正例

将 `NvScreenParameter` 放入 parameter slot；有限序列由现有 NvSparkline 绘制。pointer 的 viewport 比例映射到样本 index，光标是 CSS 百分比；方向键和 Home/End 同步取值。读取最多三位小数，单位分离，绝对时间由 host 输入本地分钟字符串。单点选中光标居中；空数组不选中；非有限点读作 —，包含非有限点的整条折线显示虚线，避免连出虚假测量。值或样本/时标/上下文变更及离开/失焦清除旧读数。

## 反例

不迁入 Device、ParamKind、SDK、认证、fetch 回调、固定轮询或 percent 算法。不把 NvSparkline 默认装饰数据作为缺测数据。不将 rect.width 的物理像素直接用作已缩放元素的 left CSS px。不以 DOM stub 的 rect 验证真实浏览器缩放。
