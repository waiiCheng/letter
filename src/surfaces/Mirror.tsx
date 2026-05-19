import { useState, useEffect, useContext } from 'react'
import Nav from '../primitives/Nav'
import { readMirrorEntries } from '../actions/read'
import { IdentityContext } from '../lib/identity'
import type { MirrorEntry } from '../types/entry'

type EventGroup = {
  event_date: string
  a: MirrorEntry | null
  b: MirrorEntry | null
}

export default function Mirror() {
  const { identity } = useContext(IdentityContext)
  const [groups, setGroups] = useState<EventGroup[]>([])
  const [scrollY, setScrollY] = useState(0)
  const [hoveredEventDate, setHoveredEventDate] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await readMirrorEntries()

      // GroupBy event_date
      const grouped = new Map<string, EventGroup>()
      data.forEach(entry => {
        if (!grouped.has(entry.event_date)) {
          grouped.set(entry.event_date, {
            event_date: entry.event_date,
            a: null,
            b: null
          })
        }
        const g = grouped.get(entry.event_date)!
        if (entry.author === 'a') g.a = entry
        else g.b = entry
      })

      // 按 event_date 倒序
      const sorted = Array.from(grouped.values())
        .sort((x, y) => y.event_date.localeCompare(x.event_date))

      setGroups(sorted)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  const getOpacity = (author: 'a' | 'b', eventDate: string) => {
    if (hoveredEventDate === eventDate) return 0.9
    return identity === author ? 0.9 : 0.35
  }

  return (
    <div className="min-h-screen text-ink-primary relative" style={{ zIndex: 1 }}>
      <Nav />

      <div style={{ width: '100%', padding: '12rem 5vw 12rem 5vw' }}>
        {groups.map((g) => (
          <div
            key={g.event_date}
            style={{
              display: 'grid',
              gridTemplateColumns: '45% 10% 45%',
              gap: '0',
              alignItems: 'start',
              marginBottom: '120px',
            }}
          >
            {/* 左轨: a 视角,正常滚动,text-right */}
            <div style={{
              width: '100%',
              textAlign: 'right',
            }}>
              {g.a ? (
                <div style={{
                  fontFamily: 'Newsreader, serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#E8E5E0',
                  opacity: getOpacity('a', g.event_date),
                  transition: 'opacity 300ms ease',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {g.a.content}
                </div>
              ) : (
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: '#333',
                  opacity: 0.3,
                }}>
                  —
                </div>
              )}
            </div>

            {/* 中轴: 锚点 date */}
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                color: '#666',
                cursor: 'default',
                paddingTop: '2px',
                userSelect: 'none',
              }}
              onMouseEnter={() => setHoveredEventDate(g.event_date)}
              onMouseLeave={() => setHoveredEventDate(null)}
            >
              {formatDate(g.event_date)}
            </div>

            {/* 右轨: b 视角,叠加视差 Y 偏移,text-left */}
            <div style={{
              width: '100%',
              textAlign: 'left',
              transform: `translateY(${scrollY * 0.04}px)`,
              willChange: 'transform',
              paddingRight: '80px',
            }}>
              {g.b ? (
                <div style={{
                  fontFamily: 'Newsreader, serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#E8E5E0',
                  opacity: getOpacity('b', g.event_date),
                  transition: 'opacity 300ms ease',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  paddingLeft: '16px',
                }}>
                  {g.b.content}
                </div>
              ) : (
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: '#333',
                  opacity: 0.3,
                  paddingLeft: '16px',
                }}>
                  —
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
