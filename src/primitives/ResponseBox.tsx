import { useState, useRef } from 'react'
import { writeLetterResponse } from '../actions/write'

interface ResponseBoxProps {
  sectionId: string
}

export default function ResponseBox({ sectionId }: ResponseBoxProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isEmpty = value.trim() === ''
  const dim = isEmpty && !focused

  const save = async (content: string) => {
    if (!content.trim()) return
    setStatus('saving')
    const { error } = await writeLetterResponse(sectionId, content)
    if (error) {
      console.error('save failed:', error)
      setStatus('failed')
    } else {
      setStatus('saved')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    setStatus('idle')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(e.target.value), 2000)
  }

  const handleBlur = () => {
    setFocused(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    save(value)
  }

  const statusText = status === 'saving' ? '·' : status === 'failed' ? '× failed' : ''

  return (
    <div style={{ position: 'relative', opacity: dim ? 0.4 : 1 }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        rows={1}
        spellCheck={false}
        className="w-full text-ink-primary font-serif italic text-letter caret-ink-primary"
        style={{
          lineHeight: 1.7,
          minHeight: '28px',
          padding: '8px 0',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          resize: 'none',
          overflow: 'hidden'
        }}
      />
      {statusText && (
        <div style={{ position: 'absolute', bottom: 4, right: 0, fontSize: 10, fontFamily: '"JetBrains Mono", monospace', color: '#555' }}>
          {statusText}
        </div>
      )}
    </div>
  )
}
