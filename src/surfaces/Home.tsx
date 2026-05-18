import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

type Phase = 'input' | 'flash' | 'ritual'
type ExitPhase = 'idle' | 'glitch' | 'blackout' | 'line'

const SENTENCES = [
  'drop the performance.',
  'leave the noise outside.',
  'this is the raw material.',
  'enter.',
]

export default function Home() {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [phase, setPhase] = useState<Phase>('input')
  const [shaking, setShaking] = useState(false)
  const [currentSentence, setCurrentSentence] = useState(-1)
  const [exitPhase, setExitPhase] = useState<ExitPhase>('idle')
  const [lineOpacity, setLineOpacity] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const timers = useRef<number[]>([])
  const ritualStarted = useRef(false)

  useEffect(() => {
    inputRef.current?.focus()
    return () => { timers.current.forEach(window.clearTimeout) }
  }, [])

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms)
    timers.current.push(t)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return

    if (value === 'letter') {
      if (ritualStarted.current) return
      ritualStarted.current = true
      setPhase('flash')
      addTimer(() => {
        setPhase('ritual')
        addTimer(() => setCurrentSentence(0), 400)
        addTimer(() => setCurrentSentence(1), 1400)
        addTimer(() => setCurrentSentence(2), 2400)
        addTimer(() => setCurrentSentence(3), 3400)
      }, 100)
    } else {
      setShaking(true)
      addTimer(() => {
        setShaking(false)
        setValue('')
        inputRef.current?.focus()
      }, 200)
    }
  }

  const handleEnter = () => {
    if (exitPhase !== 'idle') return
    setExitPhase('glitch')
    addTimer(() => {
      setExitPhase('blackout')
      addTimer(() => {
        setExitPhase('line')
        setLineOpacity(1)
        addTimer(() => {
          setLineOpacity(0)
          addTimer(() => navigate('/letter'), 500)
        }, 1000)
      }, 500)
    }, 500)
  }

  if (phase === 'flash') {
    return <div className="fixed inset-0 bg-white" />
  }

  if (phase === 'ritual') {
    if (exitPhase === 'blackout' || exitPhase === 'line') {
      return (
        <div className="fixed inset-0 bg-ink-bg">
          {exitPhase === 'line' && (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: 0,
                width: '100vw',
                height: '1px',
                background: '#E8E5E0',
                opacity: lineOpacity,
                transition: 'opacity 500ms ease',
              }}
            />
          )}
        </div>
      )
    }

    const isGlitching = exitPhase === 'glitch'

    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-bg text-ink-primary font-serif text-letter">
        <div
          className="flex flex-col items-start"
          style={{
            lineHeight: 1.7,
            animation: isGlitching ? 'glitch 500ms ease-in-out' : 'none',
          }}
        >
          {currentSentence >= 0 && (
            <div
              className={currentSentence === 3 ? 'cursor-pointer' : ''}
              onClick={currentSentence === 3 && !isGlitching ? handleEnter : undefined}
            >
              {SENTENCES[currentSentence]}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-bg">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-60 bg-transparent border-0 text-ink-primary font-mono text-sm caret-ink-primary outline-none"
        style={{
          animation: shaking ? 'shake 200ms ease-in-out' : 'none',
        }}
        autoComplete="off"
      />
    </div>
  )
}
