import { useEffect, useState } from 'react'
import Nav from '../primitives/Nav'
import AsyncEntryBox from '../primitives/AsyncEntryBox'
import { readAsyncEntries, publishAsyncEntry, type AsyncEntry, type AsyncAuthor } from '../actions/asyncActions'

const ASYNC_A_KEY = 'letter_a_identity'

export default function Async() {
  const [hasAccess, setHasAccess] = useState<boolean>(() => {
    return localStorage.getItem(ASYNC_A_KEY) === 'true'
  })

  const [passwordInput, setPasswordInput] = useState('')
  const [hoveringToggle, setHoveringToggle] = useState(false)

  const [viewer, setViewer] = useState<AsyncAuthor>(hasAccess ? 'a' : 'b')
  const [entries, setEntries] = useState<AsyncEntry[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  const refresh = async () => {
    const { data } = await readAsyncEntries(viewer)
    setEntries(data)
  }

  useEffect(() => {
    refresh()
  }, [viewer])

  const handlePublish = async (id: string) => {
    await publishAsyncEntry(id)
    refresh()
  }

  const handleUnlock = () => {
    if (passwordInput === 'Mirror') {
      localStorage.setItem(ASYNC_A_KEY, 'true')
      setHasAccess(true)
      setViewer('a')
      setPasswordInput('')
    } else {
      setPasswordInput('')
    }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yy = String(d.getFullYear()).slice(2)
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${dd}.${mm}.${yy} ${hh}:${min}`
  }

  return (
    <div
      className="min-h-screen text-ink-primary relative"
      style={{
        zIndex: 1,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 800ms ease-out',
      }}
    >
      <Nav />

      {/* 顶部居中 a/b toggle - 始终显示 */}
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '11px',
      }}>
        <div
          onMouseEnter={() => setHoveringToggle(true)}
          onMouseLeave={() => setHoveringToggle(false)}
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => setViewer('a')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: viewer === 'a' ? 'default' : 'pointer',
              color: '#E8E5E0',
              opacity: viewer === 'a' ? 1 : 0.4,
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
            onMouseEnter={(e) => { if (viewer !== 'a') e.currentTarget.style.opacity = '1' }}
            onMouseLeave={(e) => { if (viewer !== 'a') e.currentTarget.style.opacity = '0.4' }}
          >
            a
          </button>
          <span style={{ opacity: 0.3, color: '#E8E5E0' }}>/</span>
          <button
            onClick={() => setViewer('b')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: viewer === 'b' ? 'default' : 'pointer',
              color: '#E8E5E0',
              opacity: viewer === 'b' ? 1 : 0.4,
              padding: 0,
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
            onMouseEnter={(e) => { if (viewer !== 'b') e.currentTarget.style.opacity = '1' }}
            onMouseLeave={(e) => { if (viewer !== 'b') e.currentTarget.style.opacity = '0.4' }}
          >
            b
          </button>

          {/* forget 按钮: 仅 hasAccess 时，hover toggle 区域浮现 */}
          {hasAccess && (
            <button
              onClick={() => {
                localStorage.removeItem(ASYNC_A_KEY)
                setHasAccess(false)
                setViewer('b')
                setHoveringToggle(false)
              }}
              style={{
                opacity: hoveringToggle ? 0.3 : 0,
                background: 'transparent',
                border: 'none',
                color: '#E8E5E0',
                cursor: hoveringToggle ? 'pointer' : 'default',
                padding: 0,
                marginLeft: '16px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                pointerEvents: hoveringToggle ? 'auto' : 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.3'}
            >
              forget
            </button>
          )}
        </div>
      </div>

      {/* Mirror 密码框: 仅 viewer === 'b' 且未解锁时显示 */}
      {viewer === 'b' && !hasAccess && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
        }}>
          <input
            type="text"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleUnlock() }}
            placeholder=""
            className="bg-transparent border-0 border-b border-ink-rule text-ink-primary font-mono caret-ink-primary outline-none"
            style={{
              width: '120px',
              fontSize: '11px',
              padding: '4px 0',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
        </div>
      )}

      <div className="pt-24 pb-32" style={{ margin: '0 auto', maxWidth: '1100px', padding: '6rem 24px 8rem 24px' }}>

        <AsyncEntryBox author={viewer} onSubmit={refresh} />

        {entries.map((entry) => {
          const isMine = entry.author === viewer
          const isPrivate = entry.visibility === 'private'
          return (
            <div
              key={entry.id}
              style={{
                maxWidth: '440px',
                marginLeft: entry.author === 'a' ? 0 : 'auto',
                marginBottom: '48px',
                opacity: isPrivate && !isMine ? 0 : 1,
              }}
            >
              <div style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#666',
                marginBottom: '8px',
              }}>
                {formatTime(entry.created_at)}
              </div>
              <p
                className={entry.author === 'a' ? 'font-serif' : 'font-mono'}
                style={{
                  margin: 0,
                  fontSize: entry.author === 'a' ? '15px' : '13px',
                  lineHeight: 1.7,
                  color: '#E8E5E0',
                }}
              >
                {entry.content}
              </p>
              {isMine && isPrivate && (
                <button
                  onClick={() => handlePublish(entry.id)}
                  style={{
                    marginTop: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#555',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    cursor: 'pointer',
                    padding: 0,
                    opacity: 0.5,
                  }}
                >
                  make visible
                </button>
              )}
              {isMine && !isPrivate && (
                <div style={{
                  marginTop: '8px',
                  color: '#555',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  opacity: 0.5,
                }}>
                  visible
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
