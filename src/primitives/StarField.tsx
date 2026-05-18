import { useEffect, useRef } from 'react'

interface Star {
  baseX: number
  baseY: number
  phase: number
  size: number
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let stars: Star[] = []

    const init = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h
      stars = Array.from({ length: 120 }, () => ({
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        phase: 5000 + Math.random() * 10000,
        size: 1 + Math.random(),
      }))
    }

    const draw = (t: number) => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'rgba(232, 229, 224, 0.6)'
      for (const s of stars) {
        const x = s.baseX + Math.sin(t / s.phase) * 2
        const y = s.baseY + Math.cos(t / s.phase) * 2
        ctx.beginPath()
        ctx.arc(x, y, s.size / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      animId = requestAnimationFrame(draw)
    }

    init()
    animId = requestAnimationFrame(draw)

    const handleResize = () => init()
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        opacity: 0.08,
        pointerEvents: 'none',
      }}
    />
  )
}
