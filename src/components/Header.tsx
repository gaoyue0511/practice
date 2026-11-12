import { Link, NavLink } from 'react-router-dom'
import { site } from '../site.config'

const navItems = [
  { to: '/', label: '首页', end: true },
  { to: '/blog', label: '文章' },
  { to: '/about', label: '关于' },
]

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand" aria-label={`${site.title} 首页`}>
          <span className="brand-gao" aria-hidden="true">
            {'GaoYue'.split('').map((char, index) => (
              <span key={`${char}-${index}`}>{char}</span>
            ))}
          </span>
          <span className="brand__text">
            {site.title}
            <small>{site.tagline}</small>
          </span>
        </Link>

        <nav className="nav" aria-label="主导航">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
