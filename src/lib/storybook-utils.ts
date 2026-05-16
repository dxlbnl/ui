/**
 * Resolves a CSS custom property to its computed background-color RGB string.
 * Use for token comparisons that need a background channel
 * (background-color, border-color).
 */
export function resolveTokenColor(token: string): string {
  const el = document.createElement('div')
  el.style.backgroundColor = `var(${token})`
  el.style.position = 'absolute'
  el.style.opacity = '0'
  document.body.appendChild(el)
  const value = getComputedStyle(el).backgroundColor
  document.body.removeChild(el)
  return value
}

/**
 * Resolves a CSS custom property to its computed foreground color RGB string.
 * Use for color/border-color comparisons.
 */
export function resolveTokenFgColor(token: string): string {
  const el = document.createElement('div')
  el.style.color = `var(${token})`
  el.style.position = 'absolute'
  el.style.opacity = '0'
  document.body.appendChild(el)
  const value = getComputedStyle(el).color
  document.body.removeChild(el)
  return value
}
