import { motion } from 'framer-motion'

// Opacity-only fade. No scale, no movement, no layout change.
export default function Fade({ children, className = '' }) {
  return (
    <motion.div className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
      {children}
    </motion.div>
  )
}
