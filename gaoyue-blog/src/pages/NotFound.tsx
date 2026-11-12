import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1>页面走丢了</h1>
      <p>你访问的页面不存在，或者已经被移动到了别处。</p>
      <Link className="btn btn--primary" to="/">
        回到首页
      </Link>
    </div>
  )
}
