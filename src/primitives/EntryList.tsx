import type { Entry } from '../types/entry'

interface EntryListProps {
  entries: Entry[]
  variant: 'drawer' | 'memory'
  viewer?: 'a' | 'b'
  onMakeVisible?: (entryId: string) => void
}

export default function EntryList({ entries, variant, viewer, onMakeVisible }: EntryListProps) {
  if (entries.length === 0) return null

  // memory variant 走旧逻辑兼容 (但这一轮不动 memory)
  if (variant === 'memory') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {entries.map((entry) => {
          const date = new Date(entry.created_at)
          const dateStr = date.toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: '2-digit'
          }).replace(/\//g, '.')
          return (
            <div key={entry.id} style={{ maxWidth: '440px' }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                color: '#666',
              }}>
                {dateStr}
              </div>
              <div style={{
                fontFamily: 'Newsreader, serif',
                fontWeight: 500,
                fontSize: '15px',
                color: '#E8E5E0',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {entry.content}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // drawer variant 统一时间线渲染
  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const HH = String(d.getHours()).padStart(2, '0')
    const MM = String(d.getMinutes()).padStart(2, '0')
    return `${dd}.${mm} — ${HH}:${MM}`
  }

  const renderEntry = (entry: Entry, side: 'a' | 'b') => {
    const isOwn = entry.author === viewer
    const isPrivate = entry.visibility === 'private'
    const textAlign = side === 'a' ? 'right' : 'left'
    const fontStyle = side === 'a' ? 'italic' : 'normal'

    return (
      <div
        style={{
          marginBottom: '32px',
          textAlign,
        }}
      >
        {/* 时间戳 */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: '#E8E5E0',
          opacity: 0.5,
          marginBottom: '4px',
          maxWidth: '380px',
          marginLeft: side === 'a' ? 'auto' : '0',
          marginRight: side === 'b' ? 'auto' : '0',
        }}>
          {formatTime(entry.created_at)}
        </div>

        {/* 内容 */}
        <div style={{
          fontFamily: 'Newsreader, serif',
          fontStyle,
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: 1.55,
          color: '#E8E5E0',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxWidth: '380px',
          marginLeft: side === 'a' ? 'auto' : '0',
          marginRight: side === 'b' ? 'auto' : '0',
        }}>
          {entry.content}
        </div>

        {/* private/visible 标签 (只自己看得见) */}
        {isOwn && (
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            color: '#555',
            marginTop: '4px',
            maxWidth: '380px',
            marginLeft: side === 'a' ? 'auto' : '0',
            marginRight: side === 'b' ? 'auto' : '0',
            textAlign: side === 'a' ? 'right' : 'left',
          }}>
            {isPrivate ? (
              <button
                onClick={() => onMakeVisible?.(entry.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#555',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  opacity: 0.5,
                  textAlign,
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
              >
                private · make visible
              </button>
            ) : (
              <span style={{ opacity: 0.4 }}>visible</span>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {entries.map(entry => {
        const isA = entry.author === 'a'
        return (
          <div
            key={entry.id}
            style={{
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '45% 10% 45%',
              gap: '0',
              alignItems: 'start',
            }}
          >
            {/* 左轨: 仅当是 a 时渲染,否则留空保留位置 */}
            <div style={{ width: '100%' }}>
              {isA && renderEntry(entry, 'a')}
            </div>

            {/* 中轴虚空 */}
            <div />

            {/* 右轨: 仅当是 b 时渲染,否则留空保留位置;加 paddingRight 80px 避让 Nav */}
            <div style={{ width: '100%', paddingRight: '80px' }}>
              {!isA && renderEntry(entry, 'b')}
            </div>
          </div>
        )
      })}
    </div>
  )
}
