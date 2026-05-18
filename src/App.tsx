import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './surfaces/Home'
import Letter from './surfaces/Letter'
import Drawer from './surfaces/Drawer'
import Memories from './surfaces/Memories'
import Mirror from './surfaces/Mirror'
import Sandbox from './surfaces/Sandbox'
import Async from './surfaces/Async'
import StarfieldCanvas from './primitives/StarfieldCanvas'

function AppInner() {
  const location = useLocation()
  const showStarfield = location.pathname !== '/'
  return (
    <>
      {showStarfield && <StarfieldCanvas />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/letter" element={<Letter />} />
        <Route path="/drawer" element={<Drawer />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/mirror" element={<Mirror />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/async" element={<Async />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
