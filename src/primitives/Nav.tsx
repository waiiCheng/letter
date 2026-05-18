import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const location = useLocation()
  const items = [
    { name: 'bare',     path: '/letter' },
    { name: 'spill',    path: '/drawer' },
    { name: 'carve',    path: '/memories' },
    { name: 'parallax', path: '/mirror' },
    { name: 'async',    path: '/async' },
  ]

  return (
    <div
      className="fixed top-8 right-8 font-serif z-50"
      style={{ fontSize: '13px' }}
    >
      {items.map((item, i) => {
        const isCurrent = location.pathname === item.path
        return (
          <span key={item.path}>
            {i > 0 && (
              <span className="mx-3" style={{ opacity: 0.25 }}>/</span>
            )}
            {isCurrent ? (
              <span style={{ opacity: 0.4 }} className="cursor-default">
                {item.name}
              </span>
            ) : (
              <Link
                to={item.path}
                style={{ opacity: 0.25, transition: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.25')}
              >
                {item.name}
              </Link>
            )}
          </span>
        )
      })}
    </div>
  )
}
