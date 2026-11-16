// Pricing formula — do not change.
export const calcPrice = (slides) => {
  const n = Number(slides)
  if (!Number.isInteger(n) || n < 1) return 0
  return Math.ceil(n / 5) * 500
}
export const formatDZD = (n) => `${n.toLocaleString('en-US')} DZD`
