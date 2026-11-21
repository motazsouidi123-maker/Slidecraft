export const SLIDES_PER_BLOCK = 5
export const PRICE_PER_BLOCK = 500

export function calcPrice(value) {
  const slides = Number(value)
  if (!slides || slides < 1) return 0
  return Math.ceil(slides / 5) * 500
}

export function formatDZD(amount) {
  return Number(amount).toLocaleString('en-US') + ' DZD'
}
