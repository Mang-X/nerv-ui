export type NvMobileImageFit = 'cover' | 'contain'
export type NvMobileImageRadius = 'none' | 'sm' | 'md' | 'lg' | 'full'

export interface NvMobileImageProps {
  src: string
  /** 替代文字。有意义的图片必须给——它同时是读屏名称。 */
  alt?: string
  fit?: NvMobileImageFit
  radius?: NvMobileImageRadius
  /** 宽高比（宽/高），例如 16/9 或 '4/3'。用来预留布局空间。 */
  ratio?: number | string
}
