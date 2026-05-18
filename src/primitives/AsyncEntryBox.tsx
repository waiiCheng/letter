import { useState, useRef } from 'react'
import { writeAsyncEntry, type AsyncAuthor } from '../actions/asyncActions'

interface Props {
  author: AsyncAuthor
  onSubmit: () => void
}

export default function AsyncEntryBox({ author, onSubmit }: Props) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = async () => {
    if (!value.trim()) return
    setStatus('saving')
    const { error } = await writeAsyncEntry(author, value)
    if (error) {
      setStatus('failed')
    } else {
      setStatus('saved')
      setValue('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
      onSubmit()
      setTimeout(() => setStatus('idle'), 1000)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    // shift+enter 自然换行,不拦截
  }

  const isA = author === 'a'

  return (
    <div style={{
      maxWidth: '440px',
      marginLeft: isA ? 0 : 'auto',
      marginBottom: '32px',
    }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={isA ? "what's happening in a's world" : "what's happening in b's world"}
        rows={1}
        spellCheck={false}
        className={`w-full bg-transparent border-0 text-ink-primary caret-ink-primary outline-none resize-none overflow-hidden ${isA ? 'font-serif' : 'font-mono'}`}
        style={{
          fontSize: '15px',
          lineHeight: 1.7,
          minHeight: '28px',
          padding: '8px 0',
          opacity: 0.7,
        }}
      />
      <div style={{
        marginTop: '4px',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
        color: '#555',
      }}>
        {status === 'saving' ? 'saving...' : status === 'saved' ? 'saved · private' : 'enter to save · shift+enter for new line'}
      </div>
    </div>
  )
}
