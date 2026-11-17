/**
 * Attrs handed to a part that is not the wrapper's styling root. Class and style
 * stay on the styled root; every other attribute (id, name, aria-*, native
 * handlers) goes to the control the caller expects it on.
 */
export function omitClassStyle(attrs: Record<string, unknown>): Record<string, unknown> {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
}
