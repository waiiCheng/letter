import { useState, useEffect } from 'react'
import Nav from '../primitives/Nav'
import { readLetterResponsesWithSection } from '../actions/read'
import type { LetterResponseWithSection } from '../actions/read'

function formatTime(iso: string) {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${dd}.${mm} — ${hh}:${mi}`
}

export default function Mirror() {
  const [responses, setResponses] = useState<LetterResponseWithSection[]>([])

  useEffect(() => {
    readLetterResponsesWithSection().then(({ data }) => setResponses(data))
  }, [])

  return (
    <div className="min-h-screen text-ink-primary relative" style={{ zIndex: 1 }}>
      <Nav />
      <div className="pt-24 pb-32" style={{ paddingLeft: '12vw', maxWidth: '600px' }}>
        {responses.length === 0 && (
          <div className="font-serif text-letter" style={{ opacity: 0.2, lineHeight: 1.7 }}>
            nothing yet.
          </div>
        )}
        {responses.map((r) => (
          <div key={r.id} style={{ marginBottom: '48px' }}>
            <div className="font-mono" style={{ fontSize: '10px', opacity: 0.4, marginBottom: '12px' }}>
              [{r.topic}] · {formatTime(r.created_at)}
            </div>
            <div className="font-serif italic text-letter" style={{ lineHeight: 1.7 }}>
              {r.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
