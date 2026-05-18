import { useState, useRef, useEffect } from 'react'

interface EntryBoxProps {
  variant: 'drawer' | 'memory'
  onSubmit: (content: string) => Promise<{ error: any }>
  author?: 'a' | 'b'
}

export default function EntryBox({ variant, onSubmit, author }: EntryBoxProps) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'failed'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoGrow = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  useEffect(() => { autoGrow() }, [value])

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!value.trim()) return
      setStatus('sending')
      const result = await onSubmit(value)
      if (result.error) {
        setStatus('failed')
      } else {
        setValue('')
        setStatus('idle')
        textareaRef.current?.blur()
        autoGrow()
      }
    }
  }

  const isA = author === 'a'
  const styleClasses = variant === 'drawer'
    ? (author ? (isA ? 'font-serif italic text-drawer' : 'font-mono text-drawer') : 'font-serif italic text-drawer')
    : 'font-serif font-medium text-memory'

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => { setValue(e.target.value); setStatus('idle') }}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className={`w-full bg-transparent text-ink-primary border-b border-ink-rule focus:border-ink-primary outline-none resize-none ${styleClasses}`}
        style={{ minHeight: '72px', padding: '8px 0', transition: 'none' }}
      />
      {status === 'failed' && (
        <div
          className="absolute right-0 font-mono text-ink-label"
          style={{ fontSize: '10px', bottom: '4px' }}
        >
          × failed
        </div>
      )}
    </div>
  )
}
