---
title: NvScreenLoginStage 插画入口舞台
---

<script setup>
import ScreenLoginStageDemo from '../../../../playground/src/screen/ScreenLoginStageDemo.vue'
</script>

# NvScreenLoginStage 插画入口舞台

可替换插画的全屏入口舞台，内置字段插槽、HUD 角标与提交按钮。两件均由主桶导出；独立入口为 `/#screen/login/library` 与 `/#screen/login/garden`。

## 示例

<ScreenDemo><ScreenLoginStageDemo /></ScreenDemo>

## API

### NvScreenLoginStage 属性

| 属性                     | 类型                                                                            | 说明                                                         |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `title`                  | `string`                                                                        | 必填，舞台及表单名称                                         |
| `imageSrc`               | `string`                                                                        | 必填，可替换插画 URL                                         |
| `imageWidth` / `imageHeight` | `number`                                                                    | 必填，原图正尺寸，与坐标同版本                               |
| `fit`                    | `'contain' \| 'cover' \| 'height'`                                              | 默认 `contain`；`height` 为全高锚定                          |
| `anchorX`                | `number`                                                                        | `height` 模式内容中心的图宽百分比，默认 50；左缘不向右露底   |
| `glows`                  | `readonly { x:number; y:number; size:number; tone?:cyan/amber; delay?:number }[]` | 默认空；百分比位置；height 的 size 为 CSS px，其它为原图直径 |
| `brand` / `description`  | `string`                                                                        | 品牌和说明                                                   |
| `hud`                    | `readonly [string,string,string,string]`                                        | 四角文案，默认空                                             |
| `pending` / `disabled`   | `boolean`                                                                       | 宿主控制 fieldset 禁用与提交阻断                             |
| `error`                  | `string`                                                                        | 安全文案，唯一 alert；Vue 文本转义                           |

### 插槽

| 插槽      | 说明                                                |
| --------- | --------------------------------------------------- |
| `default` | 字段和 submit 按钮，slot props 为 pending/disabled |
| `brand`   | 替换品牌文字                                        |

### 事件

| 事件     | 载荷 | 说明                     |
| -------- | ---- | ------------------------ |
| `submit` | 无   | 不含用户数据；宿主同步设置 pending 阻断后续提交 |

<!--@include: ../../../../../DESIGN/components/screen-login-stage.md-->
