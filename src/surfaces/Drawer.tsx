import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../primitives/Nav'
import EntryBox from '../primitives/EntryBox'
import EntryList from '../primitives/EntryList'
import { readDrawerEntries } from '../actions/read'
import type { Entry } from '../types/entry'
import { writeDrawerEntry } from '../actions/write'

const DRAWER_A_KEY = 'letter_a_identity'

export default function Drawer() {
  const [hasAccess, setHasAccess] = useState<boolean>(() => {
    return localStorage.getItem(DRAWER_A_KEY) === 'true'
  })

  const [passwordInput, setPasswordInput] = useState('')
  const [viewer, setViewer] = useState<'a' | 'b'>(hasAccess ? 'a' : 'b')
  const [entries, setEntries] = useState<Entry[]>([])

  const refresh = async () => {
    const { data } = await readDrawerEntries()
    setEntries(data)
  }

  useEffect(() => { refresh() }, [])

  const handleSubmit = async (content: string) => {
    const result = await writeDrawerEntry(content)
    if (!result.error) await refresh()
    return result
  }

  const handleUnlock = () => {
    if (passwordInput === 'mirror') {
      localStorage.setItem(DRAWER_A_KEY, 'true')
      setHasAccess(true)
      setViewer('a')
      setPasswordInput('')
    }
  }

  return (
    <div className="min-h-screen text-ink-primary relative" style={{ zIndex: 1 }}>
      <Nav />

      <div style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
      }}>
        {hasAccess ? (
          <>
            <button
              onClick={() => setViewer('a')}
              style={{
                opacity: viewer === 'a' ? 1 : 0.3,
                background: 'transparent',
                border: 'none',
                color: '#E8E5E0',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              a
            </button>
            <span style={{ opacity: 0.3, color: '#E8E5E0' }}>/</span>
            <button
              onClick={() => setViewer('b')}
              style={{
                opacity: viewer === 'b' ? 1 : 0.3,
                background: 'transparent',
                border: 'none',
                color: '#E8E5E0',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              b
            </button>
          </>
        ) : (
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock() }}
            placeholder="b · enter to unlock a"
            className="bg-transparent border-0 border-b border-ink-rule text-ink-primary font-mono text-xs caret-ink-primary outline-none"
            style={{
              width: '180px',
              fontSize: '11px',
              padding: '4px 0',
            }}
          />
        )}
      </div>

      <div className="pt-24 pb-32" style={{ paddingLeft: '12vw', maxWidth: '600px' }}>
          <EntryBox variant="drawer" onSubmit={handleSubmit} author={viewer} />
          <div style={{ marginTop: '48px' }}>
            <EntryList entries={entries} variant="drawer" />
          </div>
          <div style={{ marginTop: '64px' }}>
            <Link
              to="/memories"
              className="font-mono cursor-pointer"
              style={{ fontSize: '11px', transition: 'none', display: 'inline-block', opacity: 0.3 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
            >
              ·
            </Link>
          </div>
        </div>
    </div>
  )
}
