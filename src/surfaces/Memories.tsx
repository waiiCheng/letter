import { useState, useEffect, useContext } from 'react'
import Nav from '../primitives/Nav'
import EntryBox from '../primitives/EntryBox'
import { readCarveEntries } from '../actions/read'
import { writeCarveEntry, reviseCarveEntry } from '../actions/write'
import { IdentityContext } from '../lib/identity'
import type { MemoryEntry } from '../types/entry'

export default function Memories() {
  const { identity } = useContext(IdentityContext)
  const [entries, setEntries] = useState<MemoryEntry[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const refresh = async () => {
    const { data } = await readCarveEntries()
    setEntries(data)
  }

  useEffect(() => { refresh() }, [identity])

  const handleSubmit = async (content: string) => {
    const result = await writeCarveEntry(content, identity)
    if (!result.error) await refresh()
    return result
  }

  const handleRevise = async (originalId: string) => {
    if (!editValue.trim()) return
    const result = await reviseCarveEntry(originalId, editValue, identity)
    if (!result.error) {
      setEditingId(null)
      setEditValue('')
      await refresh()
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}.${mm}.${yyyy}`
  }

  const within24h = (iso: string) => {
    return Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000
  }

  const aEntries = entries.filter(e => e.author === 'a')
  const bEntries = entries.filter(e => e.author === 'b')

  return (
    <div className="min-h-screen text-ink-primary relative" style={{ zIndex: 1 }}>
      <Nav />

      {/* EntryBox 顶部双栏 */}
      <div style={{ width: '100%', padding: '6rem 5vw 4rem 5vw' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40% 20% 40%',
          alignItems: 'start',
        }}>
          <div>
            {identity === 'a' && (
              <EntryBox variant="carve" onSubmit={handleSubmit} author="a" />
            )}
          </div>
          <div />
          <div>
            {identity === 'b' && (
              <EntryBox variant="carve" onSubmit={handleSubmit} author="b" />
            )}
          </div>
        </div>
      </div>

      {/* 双栏 entries */}
      <div style={{ width: '100%', padding: '0 5vw 8rem 5vw' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40% 20% 40%',
          gap: '0',
          alignItems: 'start',
        }}>
          {/* a 左轨 */}
          <div>
            {aEntries.map((entry) => {
              const is24h = within24h(entry.created_at)
              const isEditing = editingId === entry.id

              return (
                <div key={entry.id} style={{ marginBottom: '140px', textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    {formatDate(entry.created_at)}
                  </div>

                  {isEditing ? (
                    <div>
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleRevise(entry.id)
                          }
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setEditValue('')
                          }
                        }}
                        autoFocus
                        spellCheck={false}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid #444',
                          outline: 'none',
                          resize: 'none',
                          fontFamily: 'Newsreader, serif',
                          fontWeight: 500,
                          fontSize: '16px',
                          lineHeight: 1.7,
                          color: '#D4D4D4',
                          textAlign: 'right',
                          padding: '4px 0',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: 'relative',
                        fontFamily: 'Newsreader, serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: 1.7,
                        color: '#D4D4D4',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                      onMouseEnter={(e) => {
                        if (is24h) {
                          const btn = e.currentTarget.querySelector('.edit-btn') as HTMLElement
                          if (btn) btn.style.opacity = '0.5'
                        }
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget.querySelector('.edit-btn') as HTMLElement
                        if (btn) btn.style.opacity = '0'
                      }}
                    >
                      {entry.content}
                      {is24h && (
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingId(entry.id)
                            setEditValue(entry.content)
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '0',
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '10px',
                            opacity: 0,
                            transition: 'opacity 200ms ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                        >
                          edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 中间星空空隙 */}
          <div />

          {/* b 右轨 */}
          <div>
            {bEntries.map((entry) => {
              const is24h = within24h(entry.created_at)
              const isEditing = editingId === entry.id

              return (
                <div key={entry.id} style={{ marginBottom: '140px', textAlign: 'left' }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                    color: '#666',
                    marginBottom: '8px',
                  }}>
                    {formatDate(entry.created_at)}
                  </div>

                  {isEditing ? (
                    <div>
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleRevise(entry.id)
                          }
                          if (e.key === 'Escape') {
                            setEditingId(null)
                            setEditValue('')
                          }
                        }}
                        autoFocus
                        spellCheck={false}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: '1px solid #444',
                          outline: 'none',
                          resize: 'none',
                          fontFamily: 'Newsreader, serif',
                          fontWeight: 500,
                          fontSize: '16px',
                          lineHeight: 1.7,
                          color: '#D4D4D4',
                          textAlign: 'left',
                          padding: '4px 0',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        position: 'relative',
                        fontFamily: 'Newsreader, serif',
                        fontWeight: 500,
                        fontSize: '16px',
                        lineHeight: 1.7,
                        color: '#D4D4D4',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                      onMouseEnter={(e) => {
                        if (is24h) {
                          const btn = e.currentTarget.querySelector('.edit-btn') as HTMLElement
                          if (btn) btn.style.opacity = '0.5'
                        }
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget.querySelector('.edit-btn') as HTMLElement
                        if (btn) btn.style.opacity = '0'
                      }}
                    >
                      {entry.content}
                      {is24h && (
                        <button
                          className="edit-btn"
                          onClick={() => {
                            setEditingId(entry.id)
                            setEditValue(entry.content)
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            left: '0',
                            background: 'transparent',
                            border: 'none',
                            color: '#666',
                            cursor: 'pointer',
                            padding: 0,
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: '10px',
                            opacity: 0,
                            transition: 'opacity 200ms ease',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                        >
                          edit
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
