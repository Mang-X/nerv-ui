import * as stylex from '@stylexjs/stylex'
import { color, shape, typography } from './gen/tokens.stylex'

/**
 * 演示区：用 card 表面 + 描边把「示例」和正文画布分开。
 *
 * 之前是透明底 + 一行描边，演示区和正文同色，按钮（尤其 secondary 的 muted
 * 填充）落在这片灰上，控件和背景只差 1.02 —— 于是被误判成「按钮颜色不对」，
 * 靠给按钮加描边去补。真正要修的是层级：演示区是 card，页面是 bg。
 */
export const styles = stylex.create({
  root: {
    marginBlock: '1rem',
    overflow: 'hidden',
    borderRadius: shape.radius,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border,
    backgroundColor: color.card,
    color: color.fg,
    fontFamily: typography.fontSans,
  },
  stage: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  // block 只是把主轴换成纵向，仍然走 flex 的 gap：
  // 用 display:block 会让多段演示（进度条、分割线、树等）互相贴住。
  stageBlock: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
  },
})
