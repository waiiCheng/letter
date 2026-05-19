import { useState, useRef, useEffect } from 'react'

interface EntryBoxProps {
  variant: 'drawer' | 'memory' | 'carve'
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
  let styleClasses = ''
  if (variant === 'drawer') {
    // a italic / b regular,都是 Newsreader (font-serif)
    styleClasses = isA ? 'font-serif italic text-drawer' : 'font-serif text-drawer'
  } else if (variant === 'memory') {
    styleClasses = 'font-serif font-medium text-memory'
  } else if (variant === 'carve') {
    styleClasses = 'font-serif font-medium'
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => { setValue(e.target.value); setStatus('idle') }}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className={`w-full bg-transparent border-b border-ink-rule focus:border-ink-primary outline-none resize-none ${styleClasses}`}
        style={{
          minHeight: '72px',
          padding: '8px 0',
          transition: 'none',
          color: variant === 'carve' ? '#D4D4D4' : undefined,
          fontSize: variant === 'carve' ? '16px' : undefined,
          lineHeight: variant === 'carve' ? 1.7 : undefined,
          fontWeight: variant === 'carve' ? 500 : undefined,
        }}
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
