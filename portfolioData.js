// Real demo images live in /public/portfolio. "cat" matches the order type values, so labels reuse type.* translations.
// Order is interleaved so the first six on the home page show every category.
export const PROJECTS = [
  { id: 'school-science', cat: 'School' },
  { id: 'biz-pitch', cat: 'Business' },
  { id: 'uni-seminar', cat: 'University' },
  { id: 'cre-brand', cat: 'Creative' },
  { id: 'biz-report', cat: 'Business' },
  { id: 'school-history', cat: 'School' },
  { id: 'uni-research', cat: 'University' },
  { id: 'cre-event', cat: 'Creative' },
]
export const CATEGORIES = ['School', 'University', 'Business', 'Creative'].filter(c => PROJECTS.some(p => p.cat === c))

const base = import.meta.env.BASE_URL
export const imgSrc = id => `${base}portfolio/${id}.webp`
export const imgSrcSmall = id => `${base}portfolio/${id}-800.webp`
