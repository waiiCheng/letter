import { useEffect, useRef, useState, useContext } from 'react'
import Nav from '../primitives/Nav'
import ResponseBox from '../primitives/ResponseBox'
import { sections } from '../content/sections'
import { PlungeContext } from '../App'
import { supabase } from '../lib/supabase'

export default function Letter() {
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const refs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [mounted, setMounted] = useState(false)
  const plunge = useContext(PlungeContext)
  const [bareIdentity, setBareIdentity] = useState<'guest' | 'a' | 'b'>('guest')

  const [edits, setEdits] = useState<Record<string, string>>({})
  const [editingDrafts, setEditingDrafts] = useState<Record<string, string>>({})
  const prevBareIdentity = useRef<'guest' | 'a' | 'b'>('guest')
  const hasPlungedRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const loadEdits = async () => {
      const { data } = await supabase
        .from('letter_section_edits')
        .select('*')
        .order('edited_at', { ascending: false })

      if (data) {
        const latest: Record<string, string> = {}
        data.forEach((row) => {
          const key = `${row.section_id}-${row.paragraph_index}`
          if (!latest[key]) {
            latest[key] = row.new_body
          }
        })
        setEdits(latest)
      }
    }
    loadEdits()
  }, [])

  useEffect(() => {
    let buffer = ''
    let bufferTimer: any = null

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      if (isInput) return

      if (e.key >= '0' && e.key <= '9') {
        buffer += e.key
        if (buffer.length > 4) buffer = buffer.slice(-4)
        clearTimeout(bufferTimer)
        bufferTimer = setTimeout(() => { buffer = '' }, 1500)
      }

      if (e.key === 'Enter') {
        if (buffer === '1234') setBareIdentity('a')
        else if (buffer === '5678') setBareIdentity('b')
        else if (buffer === '0000') setBareIdentity('guest')
        buffer = ''
        clearTimeout(bufferTimer)
      }

      if (e.key === 'Escape') {
        setBareIdentity('guest')
        setEditingDrafts({})
        buffer = ''
        clearTimeout(bufferTimer)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(bufferTimer)
    }
  }, [])

  useEffect(() => {
    const abortFlag = sessionStorage.getItem('abort_edit')
    if (abortFlag === 'true') {
      setEditingDrafts({})
      sessionStorage.removeItem('abort_edit')
    }
  }, [])

  useEffect(() => {
    let dwellTimer: any = null

    const handleScroll = () => {
      if (hasPlungedRef.current) return

      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 50

      if (scrolledToBottom) {
        // 启动 1.2 秒驻留计时器(如果还没启动)
        if (!dwellTimer) {
          dwellTimer = setTimeout(() => {
            hasPlungedRef.current = true
            plunge('/drawer')
          }, 1200)
        }
      } else {
        // 离开底部 50px 范围,清计时器
        if (dwellTimer) {
          clearTimeout(dwellTimer)
          dwellTimer = null
        }
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (dwellTimer) clearTimeout(dwellTimer)
    }
  }, [plunge])

  useEffect(() => {
    const saveEdits = async () => {
      if (sessionStorage.getItem('abort_edit') === 'true') {
        sessionStorage.removeItem('abort_edit')
        setEditingDrafts({})
        return
      }

      const keys = Object.keys(editingDrafts)
      if (keys.length === 0) return

      for (const key of keys) {
        const lastDash = key.lastIndexOf('-')
        const section_id = key.slice(0, lastDash)
        const paragraph_index = parseInt(key.slice(lastDash + 1), 10)
        const content = editingDrafts[key]

        if (!content.trim()) continue

        await supabase.from('letter_section_edits').insert({
          section_id,
          paragraph_index,
          new_body: content.trim(),
          edited_by: bareIdentity,
        })
      }

      setEdits((prev) => ({ ...prev, ...editingDrafts }))
      setEditingDrafts({})
    }

    if (prevBareIdentity.current !== 'guest' && bareIdentity === 'guest') {
      saveEdits()
    }
    prevBareIdentity.current = bareIdentity
  }, [bareIdentity, editingDrafts])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => new Set([...prev, entry.target.getAttribute('data-id') ?? '']))
          }
        })
      },
      { threshold: 0 }
    )
    refs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div
      className="min-h-screen text-ink-primary relative"
      style={{
        zIndex: 1,
        opacity: mounted ? 1 : 0,
        transition: 'opacity 800ms ease-out',
      }}
    >
      <Nav />
      <div className="pt-24 pb-32 relative" style={{ margin: '0 auto', maxWidth: '860px', padding: '6rem 24px 8rem 24px' }}>

          {sections.map((section) => (
            <div key={section.id} style={{ marginBottom: '80px', position: 'relative' }}>
              {/* topic 飘在 section 右上 */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                opacity: 0.3,
                fontFamily: 'Newsreader, serif',
                fontSize: '14px',
                pointerEvents: 'none',
              }}>
                {section.topic}
              </div>
              {section.paragraphs.map((paragraph, pIdx) => {
                const id = `${section.id}-${pIdx}`
                const isVisible = visible.has(id)
                const isEditingA = bareIdentity === 'a'
                const isEditingB = bareIdentity === 'b'
                const currentText = editingDrafts[id] ?? edits[id] ?? paragraph

                return (
                  <div
                    key={pIdx}
                    data-id={id}
                    ref={(el) => { if (el) refs.current.set(id, el) }}
                    style={{
                      marginBottom: '56px',
                      opacity: isVisible ? 1 : 0,
                      transition: isVisible ? 'opacity 150ms ease' : 'none',
                    }}
                  >
                    {/* 段落:靠左 */}
                    <div style={{ maxWidth: '440px' }}>
                      {isEditingA ? (
                        <textarea
                          value={currentText}
                          onChange={(e) => {
                            setEditingDrafts((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }}
                          className="w-full bg-transparent border-0 border-b border-ink-rule text-ink-primary font-serif caret-ink-primary outline-none resize-none"
                          style={{
                            fontSize: '15px',
                            lineHeight: 1.7,
                            padding: '4px 0',
                            minHeight: '60px',
                          }}
                          rows={3}
                        />
                      ) : (
                        <p className="font-serif text-letter text-ink-primary" style={{ margin: 0, lineHeight: 1.7 }}>
                          {currentText}
                        </p>
                      )}
                    </div>

                    {/* 响应:仅 bareIdentity='b' 时显示 */}
                    {isEditingB && (
                      <div style={{
                        maxWidth: '440px',
                        marginLeft: 'auto',
                        marginTop: '24px'
                      }}>
                        <ResponseBox sectionId={id} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          <div style={{ maxWidth: '440px' }}>
            <button
              onClick={() => plunge('/drawer')}
              className="font-mono"
              style={{
                fontSize: '11px',
                background: 'transparent',
                border: 'none',
                color: '#E8E5E0',
                cursor: 'pointer',
                padding: 0,
                opacity: 0.3,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.3')}
            >
              ·
            </button>
          </div>

        </div>
    </div>
  )
}
