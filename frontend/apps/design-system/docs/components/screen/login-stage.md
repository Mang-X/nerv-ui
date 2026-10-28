---
title: NvScreenLoginStage 插画入口舞台
---

<script setup>
import ScreenLoginStageDemo from '../../../../playground/src/screen/ScreenLoginStageDemo.vue'
</script>

# NvScreenLoginStage 插画入口舞台

<ScreenDemo><ScreenLoginStageDemo /></ScreenDemo>

## API

| 属性                     | 类型                                                                            | 说明                               |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------- |
| title                    | string                                                                          | 必填，舞台及表单名称               |
| imageSrc                 | string                                                                          | 必填，可替换插画 URL               |
| imageWidth / imageHeight | number                                                                          | 必填，原图正尺寸，与坐标同版本     |
| fit                      | contain / cover                                                                 | 默认 contain；同变换裁剪或留白     |
| glows                    | readonly { x:number; y:number; size:number; tone?:cyan/amber; delay?:number }[] | 默认空；百分比位置和原图直径       |
| brand / description      | string                                                                          | 品牌和说明                         |
| hud                      | readonly [string,string,string,string]                                          | 四角文案，默认空                   |
| pending / disabled       | boolean                                                                         | 宿主控制 fieldset 禁用与提交阻断   |
| error                    | string                                                                          | 安全文案，唯一 alert；Vue 文本转义 |

默认插槽提供字段和 submit 按钮，slot props 为 pending/disabled；brand 插槽替换品牌文字。submit 事件不含用户数据。宿主同步设置 pending 以阻断后续提交。独立入口为 `/#screen/login/library` 与 `/#screen/login/garden`。

<!--@include: ../../../../../DESIGN/components/screen-login-stage.md-->
