import * as stylex from '@stylexjs/stylex'

export const styles = stylex.create({
  viewport: {
    height: '100%',
    position: 'relative',
    overflowX: 'hidden',
    overflowY: 'hidden',
    outlineStyle: 'none',
  },
  // 减少动效或获得焦点时改成手动滚动，同一条样式只切 overflow。
  viewportManual: { overflowY: 'auto' },
  track: { willChange: 'transform' },
  row: { display: 'block' },
})
