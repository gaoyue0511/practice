import { site } from '../site.config'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span>
          © {new Date().getFullYear()} {site.title}
        </span>
        <span>用 React 与 Markdown 记录</span>
      </div>
    </footer>
  )
}
