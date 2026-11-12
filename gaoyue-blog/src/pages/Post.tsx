import ReactMarkdown from 'react-markdown'
import { Link, useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import { formatDate, getAdjacentPosts, getPost } from '../lib/posts'
import NotFound from './NotFound'

export default function Post() {
  const { slug = '' } = useParams()
  const post = getPost(slug)

  if (!post) return <NotFound />

  const { prev, next } = getAdjacentPosts(post.slug)

  return (
    <article className="post">
      <Link className="back-link" to="/blog">
        <span aria-hidden="true">←</span> 返回文章列表
      </Link>

      <header className="post__header">
        <div className="post-card__meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="dot" aria-hidden="true" />
          <span>{post.readingMinutes} 分钟阅读</span>
        </div>
        <h1>{post.title}</h1>
        <p className="post__desc">{post.description}</p>
        <div className="tag-list">
          {post.tags.map((tag) => (
            <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="tag">
              {tag}
            </Link>
          ))}
        </div>
      </header>

      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <nav className="post-nav" aria-label="文章翻页">
        {prev ? (
          <Link to={`/blog/${prev.slug}`} className="post-nav__item">
            <span>上一篇</span>
            <strong>{prev.title}</strong>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/blog/${next.slug}`} className="post-nav__item post-nav__item--next">
            <span>下一篇</span>
            <strong>{next.title}</strong>
          </Link>
        ) : null}
      </nav>
    </article>
  )
}
