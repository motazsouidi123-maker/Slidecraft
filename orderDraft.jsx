import { createContext, useContext, useMemo, useState } from 'react'

// Shares the slide count between the live price calculator and the order form (kept as text so typing feels natural).
const Ctx = createContext(null)

export function OrderDraftProvider({ children }) {
  const [slides, setSlides] = useState('10')
  const value = useMemo(() => ({ slides, setSlides }), [slides])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useOrderDraft = () => useContext(Ctx)
