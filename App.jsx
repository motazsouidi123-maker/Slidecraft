import { Routes, Route } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import Services from './pages/Services.jsx'
import Order from './pages/Order.jsx'
import Contact from './pages/Contact.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/order" element={<Order />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
