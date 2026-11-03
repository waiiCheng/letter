import { useEffect, useState } from 'react'

// 手机布局断点: 只在这个宽度以下改排版, 电脑版不受影响
const QUERY = '(max-width: 640px)'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const handler = () => setIsMobile(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return isMobile
}
