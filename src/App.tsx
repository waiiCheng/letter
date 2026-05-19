import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { createContext, useState } from 'react'
import Home from './surfaces/Home'
import Letter from './surfaces/Letter'
import Drawer from './surfaces/Drawer'
import Memories from './surfaces/Memories'
import Mirror from './surfaces/Mirror'
import Sandbox from './surfaces/Sandbox'
import Async from './surfaces/Async'
import StarfieldCanvas from './primitives/StarfieldCanvas'
import { IdentityContext, useIdentityProvider } from './lib/identity'

export const PlungeContext = createContext<(to: string) => void>(() => {})

function AppInner() {
  const location = useLocation()
  const navigate = useNavigate()
  const showStarfield = location.pathname !== '/'
  const [isPlunging, setIsPlunging] = useState(false)
  const identityState = useIdentityProvider()

  const plunge = (to: string) => {
    setIsPlunging(true)
    setTimeout(() => {
      navigate(to)
      setTimeout(() => setIsPlunging(false), 50)
    }, 100)
  }

  return (
    <IdentityContext.Provider value={identityState}>
      <PlungeContext.Provider value={plunge}>
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

        {isPlunging && (
          <div
            className="fixed inset-0 bg-ink-bg"
            style={{ zIndex: 99999, pointerEvents: 'none' }}
          />
        )}
      </PlungeContext.Provider>
    </IdentityContext.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
