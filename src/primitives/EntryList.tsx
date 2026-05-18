import type { Entry } from '../types/entry'

interface EntryListProps {
  entries: Entry[]
  variant: 'drawer' | 'memory'
}

function formatTimestamp(iso: string, variant: 'drawer' | 'memory') {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  if (variant === 'memory') return `${dd}.${mm}.${yyyy}`
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm}.${yyyy} — ${hh}:${mi}`
}

const getJitter = (i: number) => {
  const offsets = [0, 3, 1, 4, 0, 2, 3, 1]
  return offsets[i % offsets.length]
}

export default function EntryList({ entries, variant }: EntryListProps) {
  if (entries.length === 0) return null

  if (variant === 'drawer') {
    return (
      <div>
        {entries.map((entry, i) => {
          const isA = entry.author === 'me'
          return (
            <div
              key={entry.id}
              style={{ marginBottom: '28px', transform: `translateX(${getJitter(i)}px)` }}
            >
              <div
                className="font-mono text-ink-meta"
                style={{ fontSize: '10px', marginBottom: '4px', textAlign: entry.author === 'you' ? 'right' : 'left' }}
              >
                {formatTimestamp(entry.created_at, 'drawer')}
              </div>
              <div
                className={isA ? 'font-serif italic text-drawer text-ink-primary' : 'font-mono text-drawer text-ink-primary'}
                style={{ lineHeight: 1.55, fontSize: isA ? '17px' : '14px' }}
              >
                {entry.content}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      {entries.map((entry, i) => (
        <div key={entry.id}>
          {i > 0 && <div style={{ height: '1px', background: '#2A2A2A' }} />}
          <div style={{ padding: '40px 0' }}>
            <div
              className="font-mono text-ink-meta"
              style={{ fontSize: '10px', marginBottom: '12px', textAlign: entry.author === 'you' ? 'right' : 'left' }}
            >
              {formatTimestamp(entry.created_at, 'memory')}
            </div>
            <div className="font-serif font-medium text-memory text-ink-primary" style={{ lineHeight: 1.6 }}>
              {entry.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
