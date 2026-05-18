import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../primitives/Nav'
import ResponseBox from '../primitives/ResponseBox'
import { sections } from '../content/sections'

export default function Letter() {
  const [visible, setVisible] = useState<Set<string>>(new Set())
  const refs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

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
                      <p className="font-serif text-letter text-ink-primary" style={{ margin: 0, lineHeight: 1.7 }}>
                        {paragraph}
                      </p>
                    </div>

                    {/* 响应:靠右,往下错位 */}
                    <div style={{
                      maxWidth: '440px',
                      marginLeft: 'auto',
                      marginTop: '24px'
                    }}>
                      <ResponseBox sectionId={id} />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

          <div style={{ maxWidth: '440px' }}>
            <Link
              to="/drawer"
              className="font-mono cursor-pointer"
              style={{ fontSize: '11px', transition: 'none', display: 'inline-block', opacity: 0.3 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.3')}
            >
              ·
            </Link>
          </div>

        </div>
    </div>
  )
}
