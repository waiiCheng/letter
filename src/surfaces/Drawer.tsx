import { useState, useEffect, useContext } from 'react'
import Nav from '../primitives/Nav'
import EntryBox from '../primitives/EntryBox'
import EntryList from '../primitives/EntryList'
import { readDrawerEntries } from '../actions/read'
import { writeDrawerEntry, makeVisible } from '../actions/write'
import { IdentityContext } from '../lib/identity'
import type { Entry } from '../types/entry'

export default function Drawer() {
  const { identity, forget } = useContext(IdentityContext)
  const [entries, setEntries] = useState<Entry[]>([])
  const [hoverForgetZone, setHoverForgetZone] = useState(false)

  const refresh = async () => {
    const { data } = await readDrawerEntries(identity)
    setEntries(data)
  }

  useEffect(() => { refresh() }, [identity])

  const handleSubmit = async (content: string) => {
    const result = await writeDrawerEntry(content, identity)
    if (!result.error) await refresh()
    return result
  }

  const handleMakeVisible = async (entryId: string) => {
    await makeVisible(entryId)
    await refresh()
  }

  return (
    <div className="min-h-screen text-ink-primary relative" style={{ zIndex: 1 }}>
      <Nav />

      {/* 右上角 forget 区域 — 隐形 hover 浮现,仅 a 身份 */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 5,
          width: '120px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
        onMouseEnter={() => setHoverForgetZone(true)}
        onMouseLeave={() => setHoverForgetZone(false)}
      >
        {identity === 'a' && (
          <button
            onClick={forget}
            style={{
              fontSize: '10px',
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'JetBrains Mono, monospace',
              opacity: hoverForgetZone ? 0.5 : 0,
              transition: 'opacity 300ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = hoverForgetZone ? '0.5' : '0'}
          >
            forget
          </button>
        )}
      </div>

      {/* EntryBox 占整页宽度 (双栏分布) - 顶部 */}
      <div style={{
        width: '100%',
        padding: '6rem 5vw 4rem 5vw'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '45% 10% 45%',
          alignItems: 'start',
        }}>
          {/* 左轨 EntryBox (仅 a 身份时显示) */}
          <div>
            {identity === 'a' && (
              <EntryBox variant="drawer" onSubmit={handleSubmit} author="a" />
            )}
          </div>

          {/* 中间空 */}
          <div />

          {/* 右轨 EntryBox (仅 b 身份时显示) */}
          <div>
            {identity === 'b' && (
              <EntryBox variant="drawer" onSubmit={handleSubmit} author="b" />
            )}
          </div>
        </div>
      </div>

      {/* 双栏 entries */}
      <div style={{
        width: '100%',
        padding: '0 5vw 8rem 5vw'
      }}>
        <EntryList
          entries={entries}
          variant="drawer"
          viewer={identity}
          onMakeVisible={handleMakeVisible}
        />
      </div>
    </div>
  )
}
