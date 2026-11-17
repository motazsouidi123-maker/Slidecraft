import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './Home.jsx'
import Services from './Services.jsx'
import Order from './Order.jsx'
import Contact from './Contact.jsx'
import Admin from './Admin.jsx'
import { Intro } from './ui.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  // الحالة في App نفسه، وApp لا يُعاد تركيبه عند التنقل بين الصفحات،
  // لذلك لا تظهر شاشة الدخول مرة ثانية أثناء استخدام React Router.
  const [showIntro, setShowIntro] = useState(true)
  const handleIntroDone = useCallback(() => setShowIntro(false), [])

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/order" element={<Order />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {showIntro && <Intro onDone={handleIntroDone} />}
    </>
  )
}
