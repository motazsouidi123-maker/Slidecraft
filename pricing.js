// Single source of truth for PRESORA pricing.
// Used by: Pricing section, Calculator, Order form, Order summary, WhatsApp message and Admin display.
export const BLOCK_SIZE = 5
export const PRICE_PER_BLOCK = 500
export const MIN_SLIDES = 1
export const MAX_SLIDES = 200
export const PRICE_TIERS = [5, 10, 15, 20, 25]
export const PRICE_EXAMPLES = [6, 7, 11, 16]

// Whole numbers only, between 1 and 200. Returns the number, or null when the input is not valid.
export function parseSlides(value) {
  const s = String(value ?? '').trim()
  if (!/^\d+$/.test(s)) return null
  const n = Number(s)
  return n >= MIN_SLIDES && n <= MAX_SLIDES ? n : null
}
export const isValidSlides = v => parseSlides(v) !== null

// Every started block of five slides is charged in full.
export const calcPrice = slides => Math.ceil(slides / BLOCK_SIZE) * PRICE_PER_BLOCK

// Number of charged blocks and the slide count they are charged as.
export const billedBlocks = slides => Math.ceil(slides / BLOCK_SIZE)
export const billedSlides = slides => billedBlocks(slides) * BLOCK_SIZE

// Validates first; returns null for invalid input so callers never show a wrong price.
export const priceFor = v => {
  const n = parseSlides(v)
  return n === null ? null : calcPrice(n)
}

// 1,000 DZD. Digits are always Latin so the value reads identically in EN, FR and AR.
export const formatDZD = n => `${new Intl.NumberFormat('en-US').format(n)} DZD`
