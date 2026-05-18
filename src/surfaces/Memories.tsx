import { useState, useEffect } from 'react'
import Nav from '../primitives/Nav'
import { readMemoryEntries } from '../actions/read'
import { writeMemoryEntry } from '../actions/write'
import type { Entry } from '../types/entry'

interface MemoryEntryBoxProps {
  entry?: Entry
  onSaved: () => void
}

function MemoryEntryBox({ entry, onSaved }: MemoryEntryBoxProps) {
  const [value, setValue] = useState(entry?.content ?? '')
  const [status, setStatus] = useState<'idle' | 'saving' | 'failed'>('idle')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isNew = !entry
  const within24h = entry
    ? Date.now() - new Date(entry.created_at).getTime() < 24 * 60 * 60 * 1000
    : true
  const editable = isNew || within24h

  const autoGrow = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  useEffect(() => { autoGrow() }, [value])

  const save = async (content: string) => {
    if (!content.trim()) return
    setStatus('saving')
    const result = await writeMemoryEntry(content, entry?.id)
    if (result.error) {
      setStatus('failed')
    } else {
      setStatus('idle')
      if (isNew) {
        setValue('')
        onSaved()
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    setStatus('idle')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(e.target.value), 2000)
  }

  const handleBlur = () => {
    setFocused(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    save(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isNew) {
      e.preventDefault()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      save(value)
    }
  }

  const isEmpty = value.trim() === ''
  const dim = isEmpty && !focused && isNew

  return (
    <div style={{ position: 'relative', opacity: dim ? 0.3 : 1 }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        readOnly={!editable}
        rows={1}
        spellCheck={false}
        className="w-full bg-transparent border-0 border-b border-ink-rule text-ink-primary font-serif font-medium text-letter caret-ink-primary outline-none resize-none overflow-hidden"
        style={{ lineHeight: 1.6, minHeight: '28px', padding: '8px 0' }}
      />
      {status === 'saving' && (
        <div style={{ position: 'absolute', bottom: 4, right: 0, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: '#555' }}>·</div>
      )}
      {status === 'failed' && (
        <div style={{ position: 'absolute', bottom: 4, right: 0, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: '#555' }}>× failed</div>
      )}
      {entry && !within24h && (
        <div style={{ position: 'absolute', bottom: 4, right: 0, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: '#555', opacity: 0.4 }}>sealed</div>
      )}
    </div>
  )
}

import { useRef } from 'react'

export default function Memories() {
  const [entries, setEntries] = useState<Entry[]>([])

  const refresh = async () => {
    const { data } = await readMemoryEntries()
    setEntries(data)
  }

  useEffect(() => { refresh() }, [])

  function formatDate(iso: string) {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}.${mm}.${yyyy}`
  }

  return (
    <div className="min-h-screen text-ink-primary relative" style={{ zIndex: 1 }}>
      <Nav />
      <div className="pt-24 pb-32" style={{ paddingLeft: '12vw', maxWidth: '600px' }}>
          <MemoryEntryBox onSaved={refresh} />
          <div style={{ marginTop: '48px' }}>
            {entries.map((entry, i) => (
              <div key={entry.id}>
                {i > 0 && <div style={{ height: '1px', background: '#2A2A2A' }} />}
                <div style={{ padding: '40px 0' }}>
                  <div className="font-mono" style={{ fontSize: '10px', color: '#666', marginBottom: '12px' }}>
                    {formatDate(entry.created_at)}
                  </div>
                  <MemoryEntryBox entry={entry} onSaved={refresh} />
                </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  )
}
