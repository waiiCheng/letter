import { useState } from 'react'
import StarfieldCanvas from '../primitives/StarfieldCanvas'
import StarfieldCanvasCylinder from '../primitives/StarfieldCanvasCylinder'
import StarfieldCanvasStatic from '../primitives/StarfieldCanvasStatic'

type Version = 'current' | 'cylinder' | 'static'

export default function Sandbox() {
  const [version, setVersion] = useState<Version>('current')

  return (
    <div className="min-h-screen text-ink-primary relative" style={{ zIndex: 1 }}>
      {/* 顶部切换栏 */}
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        display: 'flex',
        gap: '24px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '14px',
      }}>
        <button onClick={() => setVersion('current')} style={{ opacity: version === 'current' ? 1 : 0.4, background: 'transparent', border: 'none', color: '#E8E5E0', cursor: 'pointer' }}>
          current
        </button>
        <button onClick={() => setVersion('cylinder')} style={{ opacity: version === 'cylinder' ? 1 : 0.4, background: 'transparent', border: 'none', color: '#E8E5E0', cursor: 'pointer' }}>
          cylinder
        </button>
        <button onClick={() => setVersion('static')} style={{ opacity: version === 'static' ? 1 : 0.4, background: 'transparent', border: 'none', color: '#E8E5E0', cursor: 'pointer' }}>
          static + twinkle
        </button>
      </div>

      {/* 切换星空版本 */}
      {version === 'current' && <StarfieldCanvas />}
      {version === 'cylinder' && <StarfieldCanvasCylinder />}
      {version === 'static' && <StarfieldCanvasStatic />}

      {/* 占位内容供 scroll 测试 */}
      <div style={{ height: '300vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Newsreader, serif', opacity: 0.3 }}>
        scroll to test parallax
      </div>
    </div>
  )
}
